<?php

namespace Database\Seeders;

use App\Actions\Teams\CreateTeam;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerUserSeeder extends Seeder
{
    /**
     * Seed the customer account.
     */
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'customer@rhapsody.test'],
            [
                'name' => 'Rhapsody Customer',
                'role' => UserRole::Customer,
                'phone' => '6281234567891',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        if (! $user->personalTeam()) {
            app(CreateTeam::class)->handle($user, $user->name."'s Team", isPersonal: true);
        }
    }
}
