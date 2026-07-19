<?php

namespace Tests\Feature;

use App\Enums\PaymentMethodType;
use App\Enums\PaymentStatus;
use App\Enums\SlotStatus;
use App\Models\Booking;
use App\Models\PaymentMethod;
use App\Models\SlotBlock;
use App\Models\StudioSetting;
use App\Models\User;
use App\Services\BookingSchedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SlotBlockTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_block_a_slot(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $date = now()->addDay()->toDateString();

        $response = $this->actingAs($superAdmin)->post(route('admin.slot-blocks.store'), [
            'booking_date' => $date,
            'starts_at' => '09:00',
            'reason' => 'Maintenance AC',
        ]);

        $response->assertRedirect(route('bookings', ['date' => $date]));
        $this->assertDatabaseHas('slot_blocks', [
            'starts_at' => '09:00',
            'ends_at' => '11:00',
            'reason' => 'Maintenance AC',
            'created_by' => $superAdmin->id,
        ]);
        $this->assertSame(1, SlotBlock::query()->whereDate('booking_date', $date)->count());
    }

    public function test_admin_customer_and_guest_cannot_create_slot_block(): void
    {
        $date = now()->addDay()->toDateString();
        $payload = ['booking_date' => $date, 'starts_at' => '09:00'];

        $this->post(route('admin.slot-blocks.store'), $payload)
            ->assertRedirect(route('login'));

        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->post(route('admin.slot-blocks.store'), $payload)
            ->assertForbidden();

        $customer = User::factory()->create();
        $this->actingAs($customer)->post(route('admin.slot-blocks.store'), $payload)
            ->assertForbidden();

        $this->assertDatabaseMissing('slot_blocks', ['created_by' => $user->id ?? 0]);
        $this->assertSame(0, SlotBlock::query()->whereDate('booking_date', $date)->count());
    }

    public function test_blocked_slot_shows_as_blocked_in_schedule(): void
    {
        $studio = StudioSetting::active();
        $date = now()->addDay()->toDateString();

        SlotBlock::query()->create([
            'booking_date' => $date,
            'starts_at' => '09:00:00',
            'ends_at' => '11:00:00',
            'reason' => 'Libur nasional',
        ]);

        $slots = app(BookingSchedule::class)->slotsForDate($date, $studio);
        $blockedSlot = $slots->firstWhere('time', '09:00');

        $this->assertSame(SlotStatus::Blocked->value, $blockedSlot['status']);
        $this->assertSame('Diblokir', $blockedSlot['statusLabel']);
        $this->assertFalse($blockedSlot['available']);
        $this->assertNotNull($blockedSlot['block']);
    }

    public function test_customer_cannot_book_a_blocked_slot(): void
    {
        $user = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $date = now()->addDay()->toDateString();

        SlotBlock::query()->create([
            'booking_date' => $date,
            'starts_at' => '09:00:00',
            'ends_at' => '11:00:00',
        ]);

        $this
            ->actingAs($user)
            ->from(route('home'))
            ->post(route('bookings.store'), [
                'booking_date' => $date,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
            ])
            ->assertRedirect(route('home'))
            ->assertSessionHasErrors('starts_at');

        $this->assertSame(0, Booking::query()->whereDate('booking_date', $date)->count());
    }

    public function test_booking_validation_uses_lock_for_update_on_blocks(): void
    {
        $user = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $date = now()->addDay()->toDateString();

        SlotBlock::query()->create([
            'booking_date' => $date,
            'starts_at' => '09:00:00',
            'ends_at' => '11:00:00',
        ]);

        $this
            ->actingAs($user)
            ->post(route('bookings.store'), [
                'booking_date' => $date,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
            ])
            ->assertSessionHasErrors('starts_at');
    }

    public function test_block_cannot_be_created_for_past_date(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $yesterday = now()->subDay()->toDateString();

        $this
            ->actingAs($superAdmin)
            ->from(route('bookings'))
            ->post(route('admin.slot-blocks.store'), [
                'booking_date' => $yesterday,
                'starts_at' => '09:00',
            ])
            ->assertSessionHasErrors('booking_date');

        $this->assertDatabaseMissing('slot_blocks', ['booking_date' => $yesterday]);
    }

    public function test_superadmin_can_release_a_blocked_slot(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $block = SlotBlock::query()->create([
            'booking_date' => now()->addDay()->toDateString(),
            'starts_at' => '09:00:00',
            'ends_at' => '11:00:00',
            'created_by' => $superAdmin->id,
        ]);

        $this->actingAs($superAdmin)
            ->delete(route('admin.slot-blocks.destroy', $block))
            ->assertRedirect();

        $this->assertDatabaseMissing('slot_blocks', ['id' => $block->id]);
    }

    public function test_block_with_overlap_on_existing_block_is_rejected(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $date = now()->addDay()->toDateString();

        SlotBlock::query()->create([
            'booking_date' => $date,
            'starts_at' => '09:00:00',
            'ends_at' => '11:00:00',
        ]);

        $this
            ->actingAs($superAdmin)
            ->from(route('bookings'))
            ->post(route('admin.slot-blocks.store'), [
                'booking_date' => $date,
                'starts_at' => '09:00',
                'reason' => 'Coba blokir ganda',
            ])
            ->assertSessionHasErrors('starts_at');

        $this->assertSame(1, SlotBlock::query()->whereDate('booking_date', $date)->count());
    }

    public function test_released_block_unblocks_slot_for_customer(): void
    {
        $studio = StudioSetting::active();
        $date = now()->addDay()->toDateString();

        $block = SlotBlock::query()->create([
            'booking_date' => $date,
            'starts_at' => '09:00:00',
            'ends_at' => '11:00:00',
        ]);

        $slots = app(BookingSchedule::class)->slotsForDate($date, $studio);
        $this->assertFalse($slots->firstWhere('time', '09:00')['available']);

        $block->delete();

        $slots = app(BookingSchedule::class)->slotsForDate($date, $studio);
        $this->assertSame(
            SlotStatus::Available->value,
            $slots->firstWhere('time', '09:00')['status'],
        );
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
}
