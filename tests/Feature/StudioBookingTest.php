<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Enums\PaymentMethodType;
use App\Enums\PaymentStatus;
use App\Jobs\SendFonnteMessage;
use App\Models\Booking;
use App\Models\PaymentMethod;
use App\Models\StudioSetting;
use App\Models\User;
use App\Services\BookingSchedule;
use App\Services\PaymentService;
use App\Services\XenditClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class StudioBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_create_bookings(): void
    {
        $response = $this->post(route('bookings.store'), []);

        $response->assertRedirect(route('login'));
    }

    public function test_customer_can_create_update_and_cancel_a_booking(): void
    {
        $user = User::factory()->create(['phone' => null]);
        $paymentMethod = $this->paymentMethod();
        $bookingDate = now()->addDay()->toDateString();

        $this
            ->actingAs($user)
            ->post(route('bookings.store'), [
                'booking_date' => $bookingDate,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'customer_phone' => '628123456789',
                'notes' => 'Vokal take',
            ])
            ->assertRedirect(route('bookings', ['date' => $bookingDate]));

        $booking = Booking::query()->firstOrFail();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'user_id' => $user->id,
            'payment_method_id' => $paymentMethod->id,
            'starts_at' => '09:00',
            'ends_at' => '11:00',
            'total_price' => 300000,
            'status' => BookingStatus::Pending->value,
            'payment_status' => PaymentStatus::Unpaid->value,
        ]);
        $this->assertNotNull($booking->held_until);
        $this->assertTrue($booking->held_until->greaterThan(now()));

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'whatsapp_number' => '628123456789',
        ]);

        $this
            ->actingAs($user)
            ->patch(route('bookings.update', $booking), [
                'booking_date' => $updatedBookingDate = now()->addDays(2)->toDateString(),
                'starts_at' => '13:00',
                'payment_method_id' => $paymentMethod->id,
                'customer_phone' => '628129999999',
                'notes' => 'Gitar take',
            ])
            ->assertRedirect(route('bookings', ['date' => $updatedBookingDate]));

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'starts_at' => '13:00',
            'ends_at' => '15:00',
            'notes' => 'Gitar take',
        ]);

        $this
            ->actingAs($user)
            ->delete(route('bookings.destroy', $booking->fresh()))
            ->assertRedirect(route('bookings', ['date' => $updatedBookingDate]));

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::Cancelled->value,
            'payment_status' => PaymentStatus::Cancelled->value,
        ]);
    }

    public function test_customer_cannot_double_book_an_active_slot(): void
    {
        config(['inertia.ssr.enabled' => false]);

        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $date = now()->addDay()->toDateString();

        Booking::query()->create([
            'user_id' => $firstUser->id,
            'payment_method_id' => $paymentMethod->id,
            'customer_name' => $firstUser->name,
            'customer_email' => $firstUser->email,
            'customer_phone' => $firstUser->phone,
            'booking_date' => $date,
            'starts_at' => '09:00',
            'ends_at' => '11:00',
            'total_price' => 300000,
            'status' => BookingStatus::Confirmed,
            'payment_status' => PaymentStatus::Paid,
        ]);

        $response = $this
            ->actingAs($secondUser)
            ->from(route('home'))
            ->post(route('bookings.store'), [
                'booking_date' => $date,
                'starts_at' => '10:00',
                'payment_method_id' => $paymentMethod->id,
                'customer_phone' => '628123456789',
            ]);

        $response->assertRedirect(route('home'));
        $response->assertSessionHasErrors('starts_at');
    }

    public function test_customer_booking_creates_xendit_invoice_and_redirects_to_payment_url(): void
    {
        config(['xendit.secret_key' => 'xnd_test_secret']);
        $this->app->forgetInstance(XenditClient::class);
        $this->app->forgetInstance(PaymentService::class);

        Http::fake([
            'https://api.xendit.co/v2/invoices' => Http::response([
                'id' => 'inv-test-001',
                'invoice_url' => 'https://checkout.xendit.co/web/inv-test-001',
                'expiry_date' => now()->addDay()->toIso8601String(),
            ]),
        ]);

        $user = User::factory()->create(['phone' => null]);
        $paymentMethod = $this->paymentMethod();
        $bookingDate = now()->addDay()->toDateString();

        $this
            ->actingAs($user)
            ->post(route('bookings.store'), [
                'booking_date' => $bookingDate,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'customer_phone' => '628123456789',
            ])
            ->assertRedirect('https://checkout.xendit.co/web/inv-test-001');

        $booking = Booking::query()->firstOrFail();

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'xendit_invoice_id' => 'inv-test-001',
            'payment_link_url' => 'https://checkout.xendit.co/web/inv-test-001',
            'amount' => 300000,
            'status' => 'pending',
        ]);

        Http::assertSent(fn ($request) => $request->url() === 'https://api.xendit.co/v2/invoices'
            && $request['external_id'] !== null
            && $request['amount'] === 300000
            && $request['payer_email'] === $user->email);
    }

    public function test_customer_booking_does_not_send_whatsapp_before_payment_is_paid(): void
    {
        Queue::fake();

        StudioSetting::active()->update(['contact_phone' => '6281234567890']);

        $user = User::factory()->create(['phone' => null]);
        $paymentMethod = $this->paymentMethod();
        $bookingDate = now()->addDay()->toDateString();

        $this
            ->actingAs($user)
            ->post(route('bookings.store'), [
                'booking_date' => $bookingDate,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'customer_phone' => '628123456789',
            ])
            ->assertRedirect(route('bookings', ['date' => $bookingDate]));

        Queue::assertNotPushed(SendFonnteMessage::class);
    }

    public function test_pending_hold_blocks_slot_until_hold_expires(): void
    {
        config(['booking.hold_minutes' => 15]);

        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $date = now()->addDay()->toDateString();

        $heldBooking = $this->booking($firstUser, $paymentMethod, $date);
        $heldBooking->update(['held_until' => now()->addMinutes(15)]);

        $this
            ->actingAs($secondUser)
            ->from(route('bookings'))
            ->post(route('bookings.store'), [
                'booking_date' => $date,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'customer_phone' => '628123456789',
            ])
            ->assertRedirect(route('bookings'))
            ->assertSessionHasErrors('starts_at');

        $this->travelTo(now()->addMinutes(16));

        $this
            ->actingAs($secondUser)
            ->post(route('bookings.store'), [
                'booking_date' => $date,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'customer_phone' => '628123456789',
            ])
            ->assertRedirect(route('bookings', ['date' => $date]));

        $this->assertDatabaseHas('bookings', [
            'id' => $heldBooking->id,
            'status' => BookingStatus::Expired->value,
            'payment_status' => PaymentStatus::Expired->value,
        ]);
        $this->assertEquals(2, Booking::query()->whereDate('booking_date', $date)->count());
    }

    public function test_schedule_marks_held_slots_unavailable_and_terminal_slots_available(): void
    {
        $user = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $studio = StudioSetting::active();
        $date = now()->addDay()->toDateString();

        $heldBooking = $this->booking($user, $paymentMethod, $date);
        $heldBooking->update(['held_until' => now()->addMinutes(15)]);

        $slots = app(BookingSchedule::class)->slotsForDate($date, $studio);
        $heldSlot = $slots->firstWhere('time', '09:00');

        $this->assertFalse($heldSlot['available']);
        $this->assertSame('Ditahan sementara', $heldSlot['label']);

        $heldBooking->update([
            'status' => BookingStatus::Expired,
            'payment_status' => PaymentStatus::Expired,
            'held_until' => null,
        ]);

        $slots = app(BookingSchedule::class)->slotsForDate($date, $studio);
        $releasedSlot = $slots->firstWhere('time', '09:00');

        $this->assertTrue($releasedSlot['available']);
        $this->assertSame('Tersedia', $releasedSlot['label']);
    }

    public function test_terminal_booking_statuses_do_not_block_slots(): void
    {
        $user = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $studio = StudioSetting::active();

        foreach ([BookingStatus::Cancelled, BookingStatus::Expired, BookingStatus::Refunded] as $index => $status) {
            $date = now()->addDays($index + 1)->toDateString();
            $booking = $this->booking($user, $paymentMethod, $date);
            $booking->update([
                'status' => $status,
                'payment_status' => match ($status) {
                    BookingStatus::Cancelled => PaymentStatus::Cancelled,
                    BookingStatus::Refunded => PaymentStatus::Refunded,
                    default => PaymentStatus::Expired,
                },
                'held_until' => null,
            ]);

            $this->assertTrue(app(BookingSchedule::class)->isSlotAvailable($date, '09:00', '11:00'));
            $slot = app(BookingSchedule::class)->slotsForDate($date, $studio)->firstWhere('time', '09:00');
            $this->assertTrue($slot['available']);
        }
    }

    public function test_admin_can_update_booking_status_and_delete_booking(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $booking = $this->booking($customer, $paymentMethod);

        $this
            ->actingAs($admin)
            ->patch(route('bookings.status', $booking), [
                'status' => BookingStatus::Confirmed->value,
                'payment_status' => PaymentStatus::Paid->value,
                'admin_notes' => 'Pembayaran valid',
            ])
            ->assertRedirect(route('bookings', ['date' => $booking->booking_date->toDateString()]));

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::Confirmed->value,
            'payment_status' => PaymentStatus::Paid->value,
            'admin_notes' => 'Pembayaran valid',
        ]);

        $this
            ->actingAs($admin)
            ->delete(route('bookings.destroy', $booking->fresh()))
            ->assertRedirect(route('bookings', ['date' => $booking->booking_date->toDateString()]));

        $this->assertDatabaseMissing('bookings', [
            'id' => $booking->id,
        ]);
    }

    public function test_customer_cannot_manage_admin_payment_methods(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->post(route('payment-methods.store'), [
                'type' => PaymentMethodType::Cash->value,
                'name' => 'Tunai',
            ])
            ->assertForbidden();
    }

    public function test_admin_can_create_update_and_delete_payment_methods(): void
    {
        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->post(route('payment-methods.store'), [
                'type' => PaymentMethodType::Qris->value,
                'name' => 'QRIS Studio',
                'instructions' => 'Scan QR di studio.',
                'is_active' => '1',
                'sort_order' => 2,
            ])
            ->assertRedirect(route('bookings'));

        $paymentMethod = PaymentMethod::query()->firstOrFail();

        $this->assertDatabaseHas('payment_methods', [
            'id' => $paymentMethod->id,
            'type' => PaymentMethodType::Qris->value,
            'name' => 'QRIS Studio',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $this
            ->actingAs($admin)
            ->patch(route('payment-methods.update', $paymentMethod), [
                'type' => PaymentMethodType::BankTransfer->value,
                'name' => 'BCA Rhapsody',
                'instructions' => 'Transfer lalu kirim bukti.',
                'sort_order' => 1,
            ])
            ->assertRedirect(route('bookings'));

        $this->assertDatabaseHas('payment_methods', [
            'id' => $paymentMethod->id,
            'type' => PaymentMethodType::BankTransfer->value,
            'name' => 'BCA Rhapsody',
            'is_active' => false,
            'sort_order' => 1,
        ]);

        $this
            ->actingAs($admin)
            ->delete(route('payment-methods.destroy', $paymentMethod))
            ->assertRedirect(route('bookings'));

        $this->assertDatabaseMissing('payment_methods', [
            'id' => $paymentMethod->id,
        ]);
    }

    public function test_customer_cannot_update_a_confirmed_booking(): void
    {
        $user = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $booking = $this->booking($user, $paymentMethod);

        $booking->update(['status' => BookingStatus::Confirmed]);

        $this
            ->actingAs($user)
            ->patch(route('bookings.update', $booking), [
                'booking_date' => now()->addDays(3)->toDateString(),
                'starts_at' => '13:00',
                'payment_method_id' => $paymentMethod->id,
            ])
            ->assertForbidden();
    }

    public function test_customer_cannot_update_another_users_booking(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $booking = $this->booking($owner, $paymentMethod);

        $this
            ->actingAs($intruder)
            ->patch(route('bookings.update', $booking), [
                'booking_date' => now()->addDays(2)->toDateString(),
                'starts_at' => '13:00',
                'payment_method_id' => $paymentMethod->id,
            ])
            ->assertForbidden();
    }

    public function test_customer_update_checks_slot_collision(): void
    {
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $date = now()->addDays(5)->toDateString();

        $existing = Booking::query()->create([
            'user_id' => $firstUser->id,
            'payment_method_id' => $paymentMethod->id,
            'customer_name' => $firstUser->name,
            'customer_email' => $firstUser->email,
            'customer_phone' => $firstUser->phone,
            'booking_date' => $date,
            'starts_at' => '09:00',
            'ends_at' => '11:00',
            'total_price' => 300000,
            'status' => BookingStatus::Confirmed,
            'payment_status' => PaymentStatus::Unpaid,
        ]);

        $booking = $this->booking($secondUser, $paymentMethod, $date);

        $this
            ->actingAs($secondUser)
            ->from(route('bookings'))
            ->patch(route('bookings.update', $booking), [
                'booking_date' => $date,
                'starts_at' => '10:00',
                'payment_method_id' => $paymentMethod->id,
            ])
            ->assertRedirect(route('bookings'))
            ->assertSessionHasErrors('starts_at');
    }

    public function test_customer_cannot_access_admin_status_route(): void
    {
        $user = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $booking = $this->booking($user, $paymentMethod);

        $this
            ->actingAs($user)
            ->patch(route('bookings.status', $booking), [
                'status' => BookingStatus::Confirmed->value,
                'payment_status' => PaymentStatus::Paid->value,
            ])
            ->assertForbidden();
    }

    public function test_admin_cannot_spoof_customer_fields_via_status_route(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $booking = $this->booking($customer, $paymentMethod);

        $originalStartsAt = $booking->starts_at;

        $this
            ->actingAs($admin)
            ->patch(route('bookings.status', $booking), [
                'status' => BookingStatus::Confirmed->value,
                'payment_status' => PaymentStatus::Unpaid->value,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'starts_at' => $originalStartsAt,
        ]);
    }

    private function paymentMethod(): PaymentMethod
    {
        StudioSetting::active();

        return PaymentMethod::query()->create([
            'type' => PaymentMethodType::Cash,
            'name' => 'Tunai',
            'instructions' => 'Bayar di studio.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
    }

    private function booking(User $user, PaymentMethod $paymentMethod, ?string $date = null): Booking
    {
        return Booking::query()->create([
            'user_id' => $user->id,
            'payment_method_id' => $paymentMethod->id,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => $user->phone,
            'booking_date' => $date ?? now()->addDay()->toDateString(),
            'starts_at' => '09:00',
            'ends_at' => '11:00',
            'total_price' => 300000,
            'status' => BookingStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
        ]);
    }
}
