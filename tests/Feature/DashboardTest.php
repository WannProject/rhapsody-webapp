<?php

namespace Tests\Feature;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('bookings'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_bookings_page()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('bookings'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('bookings/index')
            ->has('bookings')
            ->has('stats')
            ->has('scheduleSlots')
            ->has('paymentMethods'),
        );
    }

    public function test_bookings_page_includes_is_admin_flag()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('bookings'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('bookings/index')
            ->where('isAdmin', false),
        );
    }

    public function test_admin_sees_all_bookings()
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $team = Team::factory()->create();

        $team->members()->attach($admin, ['role' => TeamRole::Owner->value]);

        $response = $this
            ->actingAs($admin)
            ->get(route('bookings'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('bookings/index')
            ->where('isAdmin', true),
        );
    }

    public function test_admin_sees_all_payment_methods()
    {
        $admin = User::factory()->admin()->create();
        $team = Team::factory()->create();

        $team->members()->attach($admin, ['role' => TeamRole::Owner->value]);

        $response = $this
            ->actingAs($admin)
            ->get(route('bookings'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('allPaymentMethods'),
        );
    }

    public function test_customer_does_not_see_all_payment_methods()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('bookings'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('paymentMethods')
            ->where('isAdmin', false),
        );
    }
}
