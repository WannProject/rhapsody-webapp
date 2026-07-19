<?php

namespace Tests\Feature;

use App\Enums\NotificationStatus;
use App\Jobs\SendFonnteMessage;
use App\Models\Booking;
use App\Models\NotificationLog;
use App\Models\StudioSetting;
use App\Models\User;
use App\Services\FonnteClient;
use App\Services\PaymentService;
use App\Services\XenditClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Mockery;
use Tests\TestCase;

class NotificationLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_whatsapp_dispatch_creates_pending_log(): void
    {
        config(['services.fonnte.token' => 'test-token']);
        Queue::fake();

        $booking = $this->createBooking();

        app(PaymentService::class)->markAsPaid($booking->payment);

        $this->assertDatabaseHas('notification_logs', [
            'channel' => 'whatsapp',
            'recipient' => '628700001111',
            'status' => NotificationStatus::Pending->value,
            'reference_type' => Booking::class,
            'reference_id' => $booking->id,
        ]);

        Queue::assertPushed(SendFonnteMessage::class);
    }

    public function test_send_fonnte_message_marks_log_sent_on_success(): void
    {
        config(['services.fonnte.token' => 'test-token']);
        Http::fake([
            'api.fonnte.com/*' => Http::response(['status' => true], 200),
        ]);

        $log = NotificationLog::query()->create([
            'channel' => 'whatsapp',
            'recipient' => '628123456789',
            'message' => 'test message',
            'status' => NotificationStatus::Pending,
        ]);

        $job = new SendFonnteMessage('628123456789', 'test message', $log->id);
        $job->handle(app(FonnteClient::class));

        $log->refresh();
        $this->assertSame(NotificationStatus::Sent, $log->status);
        $this->assertNotNull($log->sent_at);
        $this->assertSame(1, $log->attempts);
        $this->assertNull($log->error_message);
    }

    public function test_send_fonnte_message_marks_log_failed_on_exception(): void
    {
        $client = Mockery::mock(FonnteClient::class);
        $client->shouldReceive('send')
            ->andThrow(new \RuntimeException('Fonnte 503'));

        $log = NotificationLog::query()->create([
            'channel' => 'whatsapp',
            'recipient' => '628123456789',
            'message' => 'test message',
            'status' => NotificationStatus::Pending,
        ]);

        $job = new SendFonnteMessage('628123456789', 'test message', $log->id);

        try {
            $job->handle($client);
            $this->fail('Expected exception was not thrown.');
        } catch (\RuntimeException $e) {
            $this->assertSame('Fonnte 503', $e->getMessage());
        }

        $log->refresh();
        $this->assertSame(NotificationStatus::Failed, $log->status);
        $this->assertSame('Fonnte 503', $log->error_message);
        $this->assertSame(1, $log->attempts);
        $this->assertNull($log->sent_at);
    }

    public function test_send_fonnte_message_without_target_marks_failed(): void
    {
        $log = NotificationLog::query()->create([
            'channel' => 'whatsapp',
            'recipient' => '',
            'message' => 'no target',
            'status' => NotificationStatus::Pending,
        ]);

        $job = new SendFonnteMessage('', 'no target', $log->id);
        $job->handle(app(FonnteClient::class));

        $log->refresh();
        $this->assertSame(NotificationStatus::Failed, $log->status);
        $this->assertSame('Recipient is empty.', $log->error_message);
    }

    public function test_superadmin_can_view_notification_logs(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        NotificationLog::query()->create([
            'channel' => 'whatsapp',
            'recipient' => '628123456789',
            'title' => 'Test message',
            'message' => 'Hello world',
            'status' => NotificationStatus::Sent,
        ]);

        $response = $this->actingAs($superAdmin)->get('/admin/notification-logs');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/notification-logs/index')
            ->has('logs.0')
            ->where('logs.0.recipient', '628123456789')
            ->where('logs.0.status', 'sent'));
    }

    public function test_admin_and_customer_cannot_view_notification_logs(): void
    {
        NotificationLog::query()->create([
            'channel' => 'whatsapp',
            'recipient' => '628123456789',
            'message' => 'test',
            'status' => NotificationStatus::Sent,
        ]);

        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->get('/admin/notification-logs')->assertForbidden();

        $customer = User::factory()->create();
        $this->actingAs($customer)->get('/admin/notification-logs')->assertForbidden();
    }

    public function test_guest_cannot_view_notification_logs(): void
    {
        $this->get('/admin/notification-logs')->assertRedirect(route('login'));
    }

    public function test_notification_logs_can_be_filtered_by_status(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        NotificationLog::query()->create([
            'channel' => 'whatsapp',
            'recipient' => '1',
            'message' => 'sent',
            'status' => NotificationStatus::Sent,
        ]);
        NotificationLog::query()->create([
            'channel' => 'whatsapp',
            'recipient' => '2',
            'message' => 'failed',
            'status' => NotificationStatus::Failed,
        ]);

        $response = $this
            ->actingAs($superAdmin)
            ->get('/admin/notification-logs?status=failed');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('logs', 1)
            ->where('logs.0.status', 'failed')
            ->where('filters.status', 'failed'));
    }

    private function createBooking(): Booking
    {
        StudioSetting::active()->update(['contact_phone' => '628700001111']);

        $user = User::factory()->create([
            'band_name' => 'Test Band',
            'contact_name' => 'Tester',
            'whatsapp_number' => '628123456789',
        ]);

        config(['xendit.callback_verification_token' => 'test-token']);

        $booking = Booking::query()->create([
            'user_id' => $user->id,
            'customer_name' => $user->contact_name,
            'customer_email' => $user->email,
            'customer_phone' => $user->whatsapp_number,
            'booking_date' => now()->addDay()->toDateString(),
            'starts_at' => '09:00',
            'ends_at' => '11:00',
            'base_price' => 300000,
            'additional_price' => 0,
            'total_price' => 300000,
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);

        $booking->payment()->create([
            'xendit_external_id' => 'test-ext-'.\Illuminate\Support\Str::random(8),
            'amount' => $booking->total_price,
            'platform_fee_expected' => 0,
            'status' => 'pending',
            'split_status' => 'not_applicable',
        ]);

        return $booking->fresh(['payment', 'user']);
    }
}
