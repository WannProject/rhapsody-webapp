<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\CustomerUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RoleUserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_seeder_creates_login_ready_admin(): void
    {
        $this->seed(AdminUserSeeder::class);

        $admin = User::query()->where('email', 'admin@rhapsody.test')->firstOrFail();

        $this->assertSame(UserRole::Admin, $admin->role);
        $this->assertTrue(Hash::check('password', $admin->password));
        $this->assertNotNull($admin->email_verified_at);
        $this->assertNotNull($admin->personalTeam());

        $response = $this->post(route('login.store'), [
            'email' => 'admin@rhapsody.test',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect(route('home'));
    }

    public function test_customer_user_seeder_creates_login_ready_customer(): void
    {
        $this->seed(CustomerUserSeeder::class);

        $customer = User::query()->where('email', 'customer@rhapsody.test')->firstOrFail();

        $this->assertSame(UserRole::Customer, $customer->role);
        $this->assertTrue(Hash::check('password', $customer->password));
        $this->assertNotNull($customer->email_verified_at);
        $this->assertNotNull($customer->personalTeam());

        $response = $this->post(route('login.store'), [
            'email' => 'customer@rhapsody.test',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($customer);
        $response->assertRedirect(route('home'));
    }
}
