<?php

namespace Tests\Unit;

use App\Models\Booking;
use App\Models\User;
use App\Support\WhatsAppNumber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class WhatsAppNumberTest extends TestCase
{
    use RefreshDatabase;

    #[DataProvider('inputProvider')]
    public function test_normalize_converts_to_62_format(string $input, string $expected): void
    {
        $this->assertSame($expected, WhatsAppNumber::normalize($input));
    }

    public static function inputProvider(): array
    {
        return [
            'local with leading 0' => ['08123456789', '628123456789'],
            'already international' => ['628123456789', '628123456789'],
            'plus prefix' => ['+628123456789', '628123456789'],
            'spaces and dashes' => ['+62 812-3456-789', '628123456789'],
            'no prefix starting with 8' => ['8123456789', '628123456789'],
            'intl non-ID number' => ['+14155551234', '14155551234'],
        ];
    }

    public function test_normalize_returns_null_for_empty_input(): void
    {
        $this->assertNull(WhatsAppNumber::normalize(null));
        $this->assertNull(WhatsAppNumber::normalize(''));
        $this->assertNull(WhatsAppNumber::normalize('0'));
    }

    public function test_user_mutator_normalizes_whatsapp_number_on_save(): void
    {
        $user = User::factory()->create([
            'whatsapp_number' => '0812 3456 7890',
            'phone' => '+62 813 0000 1111',
        ]);

        $this->assertSame('6281234567890', $user->fresh()->whatsapp_number);
        $this->assertSame('6281300001111', $user->fresh()->phone);
    }

    public function test_booking_mutator_normalizes_customer_phone_on_save(): void
    {
        $user = User::factory()->create();

        $booking = Booking::query()->create([
            'user_id' => $user->id,
            'customer_name' => 'Test Customer',
            'customer_email' => $user->email,
            'customer_phone' => '0815-1234-5678',
            'booking_date' => now()->addDay()->toDateString(),
            'starts_at' => '09:00',
            'ends_at' => '11:00',
            'total_price' => 300000,
        ]);

        $this->assertSame('6281512345678', $booking->fresh()->customer_phone);
    }
}
