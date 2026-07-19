<?php

namespace Tests\Feature;

use App\Enums\PaymentMethodType;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\PaymentMethod;
use App\Models\StudioSetting;
use App\Models\User;
use App\Services\PaymentService;
use App\Services\XenditClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BookingEquipmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_select_studio_equipment_when_booking(): void
    {
        [$user, $paymentMethod, $guitar, $mic] = $this->bootStudio();

        $bookingDate = now()->addDay()->toDateString();

        $this
            ->actingAs($user)
            ->post(route('bookings.store'), [
                'booking_date' => $bookingDate,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'equipment' => [
                    $guitar->id => 1,
                    $mic->id => 2,
                ],
                'customer_equipment_notes' => 'Gitar sendiri',
            ])
            ->assertRedirect();

        $booking = Booking::query()->firstOrFail();

        $this->assertDatabaseHas('booking_equipment', [
            'booking_id' => $booking->id,
            'equipment_id' => $guitar->id,
            'quantity' => 1,
            'unit_price' => $guitar->additional_price,
        ]);
        $this->assertDatabaseHas('booking_equipment', [
            'booking_id' => $booking->id,
            'equipment_id' => $mic->id,
            'quantity' => 2,
            'unit_price' => $mic->additional_price,
        ]);
        $this->assertSame('Gitar sendiri', $booking->fresh()->customer_equipment_notes);
    }

    public function test_microphone_quantity_exceeding_stock_is_rejected(): void
    {
        [$user, $paymentMethod, $guitar, $mic] = $this->bootStudio();
        $bookingDate = now()->addDay()->toDateString();

        $response = $this
            ->actingAs($user)
            ->from(route('home'))
            ->post(route('bookings.store'), [
                'booking_date' => $bookingDate,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'equipment' => [$mic->id => 3], // stock is 2
            ]);

        $response->assertSessionHasErrors("equipment.{$mic->id}");
        $this->assertSame(0, Booking::query()->count());
    }

    public function test_equipment_quantity_below_one_is_rejected(): void
    {
        [$user, $paymentMethod, $guitar] = $this->bootStudio();
        $bookingDate = now()->addDay()->toDateString();

        $response = $this
            ->actingAs($user)
            ->from(route('home'))
            ->post(route('bookings.store'), [
                'booking_date' => $bookingDate,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'equipment' => [$guitar->id => 0],
            ]);

        $response->assertSessionHasErrors("equipment.{$guitar->id}");
        $this->assertSame(0, Booking::query()->count());
    }

    public function test_inactive_equipment_cannot_be_booked(): void
    {
        [$user, $paymentMethod] = $this->bootStudio();
        $inactive = Equipment::factory()->create(['is_active' => false, 'stock' => 5]);

        $response = $this
            ->actingAs($user)
            ->from(route('home'))
            ->post(route('bookings.store'), [
                'booking_date' => now()->addDay()->toDateString(),
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'equipment' => [$inactive->id => 1],
            ]);

        $response->assertSessionHasErrors("equipment.{$inactive->id}");
    }

    public function test_total_price_includes_base_plus_equipment_additional(): void
    {
        [$user, $paymentMethod, $guitar, $mic] = $this->bootStudio();

        $guitar->update(['additional_price' => 50000]);
        $mic->update(['additional_price' => 25000]);

        $this
            ->actingAs($user)
            ->post(route('bookings.store'), [
                'booking_date' => now()->addDay()->toDateString(),
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'equipment' => [
                    $guitar->id => 1, // 1 * 50000
                    $mic->id => 2,    // 2 * 25000
                ],
            ])
            ->assertRedirect();

        $booking = Booking::query()->firstOrFail();

        // base_price = 2 hours * 150000 = 300000
        $this->assertSame(300000, $booking->base_price);
        $this->assertSame(100000, $booking->additional_price);
        $this->assertSame(400000, $booking->total_price);
    }

    public function test_booking_detail_lists_equipment_for_admin_and_customer(): void
    {
        [$user, $paymentMethod, $guitar, $mic] = $this->bootStudio();

        $bookingDate = now()->addDay()->toDateString();

        $this
            ->actingAs($user)
            ->post(route('bookings.store'), [
                'booking_date' => $bookingDate,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'equipment' => [$guitar->id => 1],
                'customer_equipment_notes' => 'Pedal efek sendiri',
            ])
            ->assertRedirect();

        $response = $this->actingAs($user)->get(route('orders'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('pageMode', 'orders')
            ->has('bookings.0.equipments', 1)
            ->where('bookings.0.equipments.0.name', $guitar->name)
            ->where('bookings.0.equipments.0.quantity', 1)
            ->where('bookings.0.customerEquipmentNotes', 'Pedal efek sendiri')
            ->where('bookings.0.basePrice', 300000)
            ->where('bookings.0.totalPrice', 300000)
        );
    }

    public function test_updating_booking_syncs_equipment(): void
    {
        [$user, $paymentMethod, $guitar, $mic] = $this->bootStudio();
        $bookingDate = now()->addDay()->toDateString();

        $this
            ->actingAs($user)
            ->post(route('bookings.store'), [
                'booking_date' => $bookingDate,
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'equipment' => [$guitar->id => 1],
            ])
            ->assertRedirect();

        $booking = Booking::query()->firstOrFail();
        $this->assertSame(1, $booking->fresh()->equipments()->count());

        $updatedDate = now()->addDays(2)->toDateString();
        $this
            ->actingAs($user)
            ->patch(route('bookings.update', $booking), [
                'booking_date' => $updatedDate,
                'starts_at' => '13:00',
                'payment_method_id' => $paymentMethod->id,
                'equipment' => [$mic->id => 2],
            ])
            ->assertRedirect();

        $booking->refresh();
        $this->assertSame(1, $booking->equipments()->count());
        $this->assertSame($mic->id, $booking->equipments()->first()->id);
        $this->assertSame(2, (int) $booking->equipments()->first()->pivot->quantity);
    }

    public function test_payment_amount_uses_grand_total_with_equipment(): void
    {
        config(['xendit.secret_key' => 'xnd_test_secret']);
        $this->app->forgetInstance(XenditClient::class);
        $this->app->forgetInstance(PaymentService::class);

        Http::fake([
            'https://api.xendit.co/v2/invoices' => Http::response([
                'id' => 'inv-eq-001',
                'invoice_url' => 'https://checkout.xendit.co/web/inv-eq-001',
                'expiry_date' => now()->addDay()->toIso8601String(),
            ]),
        ]);

        [$user, $paymentMethod, $guitar, $mic] = $this->bootStudio();
        $guitar->update(['additional_price' => 50000]);

        $this
            ->actingAs($user)
            ->post(route('bookings.store'), [
                'booking_date' => now()->addDay()->toDateString(),
                'starts_at' => '09:00',
                'payment_method_id' => $paymentMethod->id,
                'equipment' => [$guitar->id => 1],
            ]);

        $booking = Booking::query()->firstOrFail();
        $this->assertNotNull($booking->payment, 'Payment was not created');
        $this->assertNull($booking->payment->failure_reason, 'Xendit failure: '.$booking->payment->failure_reason);
        $this->assertSame('inv-eq-001', $booking->payment->xendit_invoice_id);

        $this->assertDatabaseHas('payments', [
            'xendit_invoice_id' => 'inv-eq-001',
            'amount' => 350000,
        ]);
    }

    /**
     * Boot studio + customer + payment method + studio equipment.
     *
     * @return array{0: User, 1: PaymentMethod, 2: Equipment, 3: Equipment}
     */
    private function bootStudio(): array
    {
        StudioSetting::active();
        $user = User::factory()->create();
        $paymentMethod = PaymentMethod::factory()->create([
            'type' => PaymentMethodType::Cash,
            'is_active' => true,
        ]);

        $guitar = Equipment::factory()->create([
            'name' => 'Gitar listrik 1',
            'category' => 'guitar',
            'stock' => 1,
            'additional_price' => 0,
            'is_active' => true,
        ]);

        $mic = Equipment::factory()->create([
            'name' => 'Mikrofon vokal',
            'category' => 'microphone',
            'stock' => 2,
            'additional_price' => 0,
            'is_active' => true,
        ]);

        return [$user, $paymentMethod, $guitar, $mic];
    }
}
