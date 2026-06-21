<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Enums\PaymentMethodType;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\PaymentMethod;
use App\Models\StudioSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudioBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_create_bookings(): void
    {
        $response = $this->post(route('booking.store'), []);

        $response->assertRedirect(route('login'));
    }

    public function test_customer_can_create_update_and_cancel_a_booking(): void
    {
        $user = User::factory()->create(['phone' => null]);
        $paymentMethod = $this->paymentMethod();
        $bookingDate = now()->addDay()->toDateString();

        $this
            ->actingAs($user)
            ->post(route('booking.store'), [
                'booking_date' => $bookingDate,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'customer_phone' => '628123456789',
                'notes' => 'Vokal take',
            ])
            ->assertRedirect(route('home', ['date' => $bookingDate]));

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

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'phone' => '628123456789',
        ]);

        $this
            ->actingAs($user)
            ->patch(route('booking.update', $booking), [
                'booking_date' => $updatedBookingDate = now()->addDays(2)->toDateString(),
                'starts_at' => '13:00',
                'payment_method_id' => $paymentMethod->id,
                'customer_phone' => '628129999999',
                'notes' => 'Gitar take',
            ])
            ->assertRedirect(route('home', ['date' => $updatedBookingDate]));

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'starts_at' => '13:00',
            'ends_at' => '15:00',
            'notes' => 'Gitar take',
        ]);

        $this
            ->actingAs($user)
            ->delete(route('booking.destroy', $booking->fresh()))
            ->assertRedirect(route('home', ['date' => $updatedBookingDate]));

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::Cancelled->value,
            'payment_status' => PaymentStatus::Cancelled->value,
        ]);
    }

    public function test_customer_cannot_double_book_an_active_slot(): void
    {
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

        $this
            ->actingAs($secondUser)
            ->from(route('home'))
            ->post(route('booking.store'), [
                'booking_date' => $date,
                'starts_at' => '10:00',
                'payment_method_id' => $paymentMethod->id,
                'customer_phone' => '628123456789',
            ])
            ->assertRedirect(route('home'))
            ->assertSessionHasErrors('starts_at');

        $this->assertCount(1, Booking::all());
    }

    public function test_admin_can_update_booking_status_and_delete_booking(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $paymentMethod = $this->paymentMethod();
        $booking = $this->booking($customer, $paymentMethod);

        $this
            ->actingAs($admin)
            ->patch(route('admin.booking.update', $booking), [
                'status' => BookingStatus::Confirmed->value,
                'payment_status' => PaymentStatus::Paid->value,
                'admin_notes' => 'Pembayaran valid',
            ])
            ->assertRedirect(route('admin.manage', ['date' => $booking->booking_date->toDateString()]));

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::Confirmed->value,
            'payment_status' => PaymentStatus::Paid->value,
            'admin_notes' => 'Pembayaran valid',
        ]);

        $this
            ->actingAs($admin)
            ->delete(route('admin.booking.destroy', $booking->fresh()))
            ->assertRedirect(route('admin.manage', ['date' => $booking->booking_date->toDateString()]));

        $this->assertDatabaseMissing('bookings', [
            'id' => $booking->id,
        ]);
    }

    public function test_customer_cannot_manage_admin_payment_methods(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->post(route('admin.payment-methods.store'), [
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
            ->post(route('admin.payment-methods.store'), [
                'type' => PaymentMethodType::Qris->value,
                'name' => 'QRIS Studio',
                'instructions' => 'Scan QR di studio.',
                'is_active' => '1',
                'sort_order' => 2,
            ])
            ->assertRedirect(route('admin.manage'));

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
            ->patch(route('admin.payment-methods.update', $paymentMethod), [
                'type' => PaymentMethodType::BankTransfer->value,
                'name' => 'BCA Rhapsody',
                'instructions' => 'Transfer lalu kirim bukti.',
                'sort_order' => 1,
            ])
            ->assertRedirect(route('admin.manage'));

        $this->assertDatabaseHas('payment_methods', [
            'id' => $paymentMethod->id,
            'type' => PaymentMethodType::BankTransfer->value,
            'name' => 'BCA Rhapsody',
            'is_active' => false,
            'sort_order' => 1,
        ]);

        $this
            ->actingAs($admin)
            ->delete(route('admin.payment-methods.destroy', $paymentMethod))
            ->assertRedirect(route('admin.manage'));

        $this->assertDatabaseMissing('payment_methods', [
            'id' => $paymentMethod->id,
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

    private function booking(User $user, PaymentMethod $paymentMethod): Booking
    {
        return Booking::query()->create([
            'user_id' => $user->id,
            'payment_method_id' => $paymentMethod->id,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => $user->phone,
            'booking_date' => now()->addDay()->toDateString(),
            'starts_at' => '09:00',
            'ends_at' => '11:00',
            'total_price' => 300000,
            'status' => BookingStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
        ]);
    }
}
