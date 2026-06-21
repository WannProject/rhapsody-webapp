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
     */
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'admin@rhapsody.test'],
            [
                'name' => 'Rhapsody Admin',
                'role' => UserRole::Admin,
                'phone' => '6281234567890',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        if (! $user->personalTeam()) {
            app(CreateTeam::class)->handle($user, $user->name."'s Team", isPersonal: true);
        }
    }
}
