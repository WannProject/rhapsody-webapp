<?php

namespace Database\Seeders;

use App\Enums\PaymentMethodType;
use App\Models\PaymentMethod;
use App\Models\StudioSetting;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        StudioSetting::query()->firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Rhapsody Studio',
                'opens_at' => '09:00',
                'closes_at' => '21:00',
                'slot_duration_minutes' => 120,
                'hourly_rate' => 150000,
                'is_active' => true,
            ],
        );

        $paymentMethods = [
            [
                'type' => PaymentMethodType::Qris,
                'name' => 'QRIS',
                'instructions' => 'Scan kode QRIS yang diberikan admin setelah booking dikonfirmasi.',
                'sort_order' => 1,
            ],
            [
                'type' => PaymentMethodType::VirtualAccount,
                'name' => 'Virtual Account',
                'instructions' => 'Nomor VA akan dikirim setelah booking dikonfirmasi.',
                'sort_order' => 2,
            ],
            [
                'type' => PaymentMethodType::BankTransfer,
                'name' => 'Transfer Bank',
                'instructions' => 'Transfer ke rekening studio dan kirim bukti pembayaran.',
                'sort_order' => 3,
            ],
            [
                'type' => PaymentMethodType::Cash,
                'name' => 'Tunai',
                'instructions' => 'Bayar langsung di studio sebelum sesi dimulai.',
                'sort_order' => 4,
            ],
        ];

        foreach ($paymentMethods as $method) {
            PaymentMethod::query()->firstOrCreate(
                ['type' => $method['type']->value],
                [
                    'name' => $method['name'],
                    'instructions' => $method['instructions'],
                    'sort_order' => $method['sort_order'],
                    'is_active' => true,
                ],
            );
        }

        $this->call([
            AdminUserSeeder::class,
            CustomerUserSeeder::class,
        ]);
    }
}
