<?php

namespace Database\Seeders;

use App\Actions\Teams\CreateTeam;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the admin account.
     *
     * WARNING: For production, set these environment variables:
     * - ADMIN_EMAIL
     * - ADMIN_PASSWORD (use a strong, unique password)
     * - ADMIN_PHONE (optional)
     *
     * @see https://laravel.com/docs/11.x/seeding#running-seeders
     */
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@rhapsody.test')],
            [
                'name' => 'Rhapsody Admin',
                'role' => UserRole::Admin,
                'phone' => env('ADMIN_PHONE', '6281234567890'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'password')),
                'email_verified_at' => now(),
            ],
        );

        if (! $user->personalTeam()) {
            app(CreateTeam::class)->handle($user, $user->name."'s Team", isPersonal: true);
        }
    }
}
