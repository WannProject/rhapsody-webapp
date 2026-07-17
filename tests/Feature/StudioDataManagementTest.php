<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\StudioSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudioDataManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_access_studio_data_page(): void
    {
        $this->withoutVite();

        $superAdmin = User::factory()->superAdmin()->create();
        $studio = StudioSetting::active();
        $equipment = Equipment::factory()->create(['name' => 'Mikrofon vokal']);

        $this
            ->actingAs($superAdmin)
            ->get(route('admin.studio-data.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/studio-data/index')
                ->where('studio.name', $studio->name)
                ->where('equipments.0.id', $equipment->id)
                ->where('equipments.0.name', 'Mikrofon vokal'));
    }

    public function test_non_super_admin_cannot_access_studio_data_page(): void
    {
        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->get(route('admin.studio-data.index'))
            ->assertForbidden();
    }

    public function test_super_admin_can_update_studio_data(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        StudioSetting::active();

        $this
            ->actingAs($superAdmin)
            ->patch(route('admin.studio-data.studio.update'), [
                'name' => 'Rhapsody Studio Premium',
                'address' => 'Jl. Rhapsody No. 8',
                'description' => 'Studio latihan full band.',
                'contact_phone' => '6281234567890',
                'location_url' => 'https://maps.google.com/?q=Rhapsody',
                'opens_at' => '10:00',
                'closes_at' => '22:00',
                'slot_duration_minutes' => 120,
                'minimum_booking_minutes' => 60,
                'hourly_rate' => 175000,
                'is_active' => '1',
            ])
            ->assertRedirect(route('admin.studio-data.index'));

        $this->assertDatabaseHas('studio_settings', [
            'id' => 1,
            'name' => 'Rhapsody Studio Premium',
            'address' => 'Jl. Rhapsody No. 8',
            'opens_at' => '10:00',
            'closes_at' => '22:00',
            'slot_duration_minutes' => 120,
            'minimum_booking_minutes' => 60,
            'hourly_rate' => 175000,
            'is_active' => true,
        ]);
    }

    public function test_super_admin_can_manage_equipment(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this
            ->actingAs($superAdmin)
            ->post(route('admin.studio-data.equipment.store'), [
                'name' => 'Gitar listrik 1',
                'category' => 'guitar',
                'stock' => 1,
                'additional_price' => 25000,
                'is_active' => '1',
            ])
            ->assertRedirect(route('admin.studio-data.index'));

        $equipment = Equipment::query()->firstOrFail();

        $this->assertDatabaseHas('equipments', [
            'id' => $equipment->id,
            'name' => 'Gitar listrik 1',
            'category' => 'guitar',
            'stock' => 1,
            'additional_price' => 25000,
            'is_active' => true,
        ]);

        $this
            ->actingAs($superAdmin)
            ->patch(route('admin.studio-data.equipment.update', $equipment), [
                'name' => 'Gitar listrik utama',
                'category' => 'guitar',
                'stock' => 2,
                'additional_price' => 30000,
            ])
            ->assertRedirect(route('admin.studio-data.index'));

        $this->assertDatabaseHas('equipments', [
            'id' => $equipment->id,
            'name' => 'Gitar listrik utama',
            'stock' => 2,
            'additional_price' => 30000,
            'is_active' => false,
        ]);

        $this
            ->actingAs($superAdmin)
            ->delete(route('admin.studio-data.equipment.destroy', $equipment))
            ->assertRedirect(route('admin.studio-data.index'));

        $this->assertDatabaseMissing('equipments', [
            'id' => $equipment->id,
        ]);
    }

    public function test_updating_studio_price_does_not_change_existing_booking_total(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $customer = User::factory()->create();
        StudioSetting::active();

        $booking = Booking::query()->create([
            'user_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'customer_phone' => $customer->phone,
            'booking_date' => now()->addDay()->toDateString(),
            'starts_at' => '09:00',
            'ends_at' => '11:00',
            'total_price' => 300000,
            'status' => BookingStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
        ]);

        $this
            ->actingAs($superAdmin)
            ->patch(route('admin.studio-data.studio.update'), [
                'name' => 'Rhapsody Studio',
                'address' => null,
                'description' => null,
                'contact_phone' => null,
                'location_url' => null,
                'opens_at' => '09:00',
                'closes_at' => '21:00',
                'slot_duration_minutes' => 120,
                'minimum_booking_minutes' => 120,
                'hourly_rate' => 200000,
                'is_active' => '1',
            ])
            ->assertRedirect(route('admin.studio-data.index'));

        $this->assertSame(300000, $booking->fresh()->total_price);
    }
}
