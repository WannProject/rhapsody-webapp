<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Enums\FeeType;
use App\Enums\PaymentGatewayStatus;
use App\Enums\PaymentStatus;
use App\Enums\SplitStatus;
use App\Enums\WithdrawalStatus;
use App\Jobs\SendFonnteMessage;
use App\Models\Booking;
use App\Models\Client;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\PlatformFeeRule;
use App\Models\PlatformWalletLedgerEntry;
use App\Models\PlatformWithdrawal;
use App\Models\StudioSetting;
use App\Models\User;
use App\Models\XenditSubAccount;
use App\Services\PlatformWalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class XenPlatformTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_role_works(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->assertTrue($superAdmin->isSuperAdmin());
        $this->assertTrue($superAdmin->isAdmin());
    }

    public function test_non_super_admin_cannot_access_platform_wallet(): void
    {
        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->get(route('admin.platform-wallet.index'))
            ->assertForbidden();
    }

    public function test_super_admin_can_access_platform_wallet(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this
            ->actingAs($superAdmin)
            ->get(route('admin.platform-wallet.index'))
            ->assertOk();
    }

    public function test_xenplatform_schema_contains_required_tables_and_columns(): void
    {
        $tables = [
            'clients' => ['user_id', 'status', 'verified_at'],
            'xendit_sub_accounts' => ['client_id', 'xendit_account_id', 'status'],
            'platform_fee_rules' => ['client_id', 'fee_type', 'percent', 'flat_amount'],
            'payments' => ['booking_id', 'client_id', 'status', 'split_status', 'paid_notification_sent_at'],
            'platform_wallet_ledger_entries' => ['payment_id', 'platform_withdrawal_id', 'type', 'amount'],
            'platform_withdrawals' => ['requested_by', 'amount', 'status'],
        ];

        foreach ($tables as $table => $columns) {
            $this->assertTrue(Schema::hasColumns($table, $columns), "Missing columns on {$table}");
        }

        $this->assertTrue(Schema::hasColumn('bookings', 'client_id'));
    }

    public function test_xenplatform_models_expose_expected_relationships(): void
    {
        $user = User::factory()->create();
        $client = Client::query()->create([
            'user_id' => $user->id,
            'name' => 'Client Studio',
            'email' => 'client-studio@example.test',
        ]);
        $subAccount = XenditSubAccount::query()->create([
            'client_id' => $client->id,
            'xendit_account_id' => 'acc-test-001',
        ]);
        $booking = $this->createBookingWithPayment();
        $booking->update(['client_id' => $client->id]);
        $booking->payment->update(['client_id' => $client->id]);
        $withdrawal = PlatformWithdrawal::query()->create([
            'requested_by' => $user->id,
            'amount' => 50000,
            'status' => WithdrawalStatus::Pending,
        ]);

        $this->assertTrue($user->fresh()->client->is($client));
        $this->assertTrue($client->fresh()->user->is($user));
        $this->assertTrue($client->xenditSubAccount->is($subAccount));
        $this->assertTrue($subAccount->client->is($client));
        $this->assertTrue($client->bookings->first()->is($booking));
        $this->assertTrue($client->payments->first()->is($booking->payment));
        $this->assertTrue($booking->fresh()->payment->is($booking->payment));
        $this->assertTrue($withdrawal->requester->is($user));
    }

    public function test_platform_wallet_filters_ledger_and_withdrawals_by_date_and_status(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $today = now()->toDateString();

        $matchingEntry = PlatformWalletLedgerEntry::query()->create([
            'type' => 'credit',
            'amount' => 125000,
            'description' => 'Matching credit',
        ]);
        PlatformWalletLedgerEntry::query()->create([
            'type' => 'debit',
            'amount' => 25000,
            'description' => 'Different type',
        ]);
        $oldEntry = PlatformWalletLedgerEntry::query()->create([
            'type' => 'credit',
            'amount' => 50000,
            'description' => 'Outside date range',
        ]);
        $oldEntry->forceFill(['created_at' => now()->subMonth()])->saveQuietly();

        $matchingWithdrawal = PlatformWithdrawal::query()->create([
            'requested_by' => $superAdmin->id,
            'amount' => 30000,
            'status' => WithdrawalStatus::Succeeded,
        ]);
        PlatformWithdrawal::query()->create([
            'requested_by' => $superAdmin->id,
            'amount' => 15000,
            'status' => WithdrawalStatus::Failed,
        ]);

        $this
            ->actingAs($superAdmin)
            ->get(route('admin.platform-wallet.index', [
                'type' => 'credit',
                'withdrawal_status' => 'succeeded',
                'from_date' => $today,
                'to_date' => $today,
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/platform-wallet/index')
                ->where('ledgerPagination.total', 1)
                ->where('ledgerEntries.0.id', $matchingEntry->id)
                ->where('withdrawalPagination.total', 1)
                ->where('withdrawals.0.id', $matchingWithdrawal->id)
                ->where('filters.type', 'credit')
                ->where('filters.withdrawal_status', 'succeeded'));
    }

    public function test_platform_wallet_paginates_ledger_entries(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        foreach (range(1, 21) as $index) {
            PlatformWalletLedgerEntry::query()->create([
                'type' => 'credit',
                'amount' => $index * 1000,
            ]);
        }

        $this
            ->actingAs($superAdmin)
            ->get(route('admin.platform-wallet.index', ['ledger_page' => 2]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('ledgerPagination.currentPage', 2)
                ->where('ledgerPagination.lastPage', 2)
                ->where('ledgerPagination.total', 21)
                ->has('ledgerEntries', 1));
    }

    public function test_super_admin_can_export_filtered_platform_wallet_ledger(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        PlatformWalletLedgerEntry::query()->create([
            'type' => 'credit',
            'amount' => 175000,
            'description' => 'Included row',
        ]);
        PlatformWalletLedgerEntry::query()->create([
            'type' => 'debit',
            'amount' => 25000,
            'description' => 'Excluded row',
        ]);

        $response = $this
            ->actingAs($superAdmin)
            ->get(route('admin.platform-wallet.export', ['type' => 'credit']));

        $response->assertOk()->assertDownload('platform-wallet-ledger-'.now()->toDateString().'.csv');
        $content = $response->streamedContent();

        $this->assertStringContainsString('Included row', $content);
        $this->assertStringNotContainsString('Excluded row', $content);
    }

    public function test_non_super_admin_cannot_export_platform_wallet_ledger(): void
    {
        $this
            ->actingAs(User::factory()->admin()->create())
            ->get(route('admin.platform-wallet.export'))
            ->assertForbidden();
    }

    public function test_super_admin_can_create_client(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this
            ->actingAs($superAdmin)
            ->post(route('admin.clients.store'), [
                'name' => 'Studio Alpha',
                'email' => 'alpha@studio.test',
                'phone' => '6281234567890',
                'business_name' => 'Studio Alpha LLC',
                'business_type' => 'STUDIO',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('clients', [
            'name' => 'Studio Alpha',
            'email' => 'alpha@studio.test',
        ]);
    }

    public function test_non_super_admin_cannot_create_client(): void
    {
        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->post(route('admin.clients.store'), [
                'name' => 'Studio Beta',
                'email' => 'beta@studio.test',
            ])
            ->assertForbidden();
    }

    public function test_super_admin_can_create_platform_fee_rule(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this
            ->actingAs($superAdmin)
            ->post(route('admin.platform-fees.store'), [
                'fee_type' => 'percent',
                'percent' => 5.0,
                'flat_amount' => 0,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('platform_fee_rules', [
            'fee_type' => 'percent',
            'percent' => 5.0,
        ]);
    }

    public function test_fee_type_flat_calculation(): void
    {
        $rule = PlatformFeeRule::factory()->make([
            'fee_type' => FeeType::Flat,
            'flat_amount' => 5000,
            'percent' => 0,
        ]);

        $this->assertEquals(5000, $rule->calculateFee(100000));
    }

    public function test_fee_type_percent_calculation(): void
    {
        $rule = PlatformFeeRule::factory()->make([
            'fee_type' => FeeType::Percent,
            'percent' => 2.5,
            'flat_amount' => 0,
        ]);

        $this->assertEquals(2500, $rule->calculateFee(100000));
    }

    public function test_fee_type_hybrid_calculation(): void
    {
        $rule = PlatformFeeRule::factory()->make([
            'fee_type' => FeeType::Hybrid,
            'percent' => 2.0,
            'flat_amount' => 1000,
        ]);

        $this->assertEquals(3000, $rule->calculateFee(100000));
    }

    public function test_payment_webhook_marks_payment_paid_idempotently(): void
    {
        config()->set('xendit.callback_verification_token', 'test-token');
        Queue::fake();

        StudioSetting::active()->update(['contact_phone' => '628700001111']);
        $booking = $this->createBookingWithPayment();
        $payment = $booking->payment;

        $this
            ->withHeaders(['X-CALLBACK-TOKEN' => 'test-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $payment->xendit_external_id,
                'status' => 'PAID',
                'amount' => $booking->total_price,
            ])
            ->assertOk();

        $payment->refresh();
        $this->assertEquals(PaymentGatewayStatus::Paid, $payment->status);
        $this->assertNotNull($payment->paid_notification_sent_at);

        $this
            ->withHeaders(['X-CALLBACK-TOKEN' => 'test-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $payment->xendit_external_id,
                'status' => 'PAID',
            ])
            ->assertOk();

        $this->assertEquals(1, Payment::query()->where('booking_id', $booking->id)->count());
        Queue::assertPushed(SendFonnteMessage::class, 1);
        Queue::assertPushed(SendFonnteMessage::class, fn (SendFonnteMessage $job) => $job->target === '628700001111'
            && str_contains($job->message, 'BOOKING STUDIO BARU')
            && str_contains($job->message, 'Nama Band: '.$booking->user->band_name)
            && str_contains($job->message, 'Nama Pemesan: '.$booking->user->contact_name)
            && str_contains($job->message, 'Nomor WhatsApp: '.$booking->user->whatsapp_number)
            && str_contains($job->message, 'Tanggal Booking: '.$booking->booking_date->format('d/m/Y'))
            && str_contains($job->message, 'Jam Booking: 09:00 - 11:00')
            && str_contains($job->message, 'Durasi: 2 jam')
            && str_contains($job->message, 'Alat Digunakan: Belum dicatat')
            && str_contains($job->message, 'Total Pembayaran: Rp 300.000')
            && str_contains($job->message, 'Status Pembayaran: Berhasil'));
    }

    public function test_webhook_rejected_without_valid_token(): void
    {
        config()->set('xendit.callback_verification_token', 'correct-token');

        $booking = $this->createBookingWithPayment();
        $payment = $booking->payment;

        $this
            ->withHeaders(['X-CALLBACK-TOKEN' => 'wrong-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $payment->xendit_external_id,
                'status' => 'PAID',
            ])
            ->assertForbidden();
    }

    public function test_webhook_updates_booking_status_on_paid(): void
    {
        config()->set('xendit.callback_verification_token', 'test-token');

        $booking = $this->createBookingWithPayment();
        $payment = $booking->payment;

        $this
            ->withHeaders(['X-CALLBACK-TOKEN' => 'test-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $payment->xendit_external_id,
                'status' => 'PAID',
            ])
            ->assertOk();

        $booking->refresh();
        $this->assertEquals(PaymentStatus::Paid, $booking->payment_status);
        $this->assertEquals(BookingStatus::Confirmed, $booking->status);
    }

    public function test_webhook_expired_marks_booking_expired(): void
    {
        config()->set('xendit.callback_verification_token', 'test-token');

        $booking = $this->createBookingWithPayment();
        $payment = $booking->payment;

        $this
            ->withHeaders(['X-CALLBACK-TOKEN' => 'test-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $payment->xendit_external_id,
                'status' => 'EXPIRED',
            ])
            ->assertOk();

        $booking->refresh();
        $payment->refresh();

        $this->assertEquals(PaymentGatewayStatus::Expired, $payment->status);
        $this->assertEquals(PaymentStatus::Expired, $booking->payment_status);
        $this->assertEquals(BookingStatus::Expired, $booking->status);
    }

    public function test_withdrawal_exceeding_balance_is_rejected(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $wallet = app(PlatformWalletService::class);

        $this->assertEquals(0, $wallet->availableBalance());

        $response = $this
            ->actingAs($superAdmin)
            ->post(route('admin.platform-withdrawals.store'), [
                'amount' => 100000,
                'bank_code' => 'BCA',
                'account_holder' => 'Test',
                'account_number' => '1234567890',
            ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('platform_withdrawals', [
            'requested_by' => $superAdmin->id,
        ]);
    }

    public function test_withdrawal_with_sufficient_balance_succeeds(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        PlatformWalletLedgerEntry::create([
            'type' => 'credit',
            'amount' => 200000,
            'description' => 'Test credit',
        ]);

        $wallet = app(PlatformWalletService::class);
        $this->assertEquals(200000, $wallet->availableBalance());

        $withdrawal = $wallet->requestWithdrawal($superAdmin, 100000, [
            'bank_code' => 'BCA',
            'account_holder' => 'Test',
            'account_number' => '1234567890',
        ]);

        $this->assertEquals(WithdrawalStatus::Pending, $withdrawal->status);
        $this->assertEquals(100000, $wallet->availableBalance() + $withdrawal->amount - $wallet->pendingWithdrawals());
    }

    public function test_failed_withdrawal_restores_balance(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $wallet = app(PlatformWalletService::class);

        PlatformWalletLedgerEntry::create([
            'type' => 'credit',
            'amount' => 500000,
            'description' => 'Test credit',
        ]);

        $withdrawal = $wallet->requestWithdrawal($superAdmin, 200000, [
            'bank_code' => 'BCA',
            'account_holder' => 'Test',
            'account_number' => '1234567890',
        ]);

        $wallet->failWithdrawal($withdrawal, 'Test failure');

        $this->assertEquals(500000, $wallet->availableBalance());
    }

    public function test_non_pending_withdrawal_is_not_processed_again(): void
    {
        config()->set('xendit.secret_key', 'xnd_test_secret');

        Http::fake();

        $withdrawal = PlatformWithdrawal::query()->create([
            'requested_by' => User::factory()->superAdmin()->create()->id,
            'amount' => 100000,
            'currency' => 'IDR',
            'status' => WithdrawalStatus::Succeeded,
            'processed_at' => now()->subDay(),
            'xendit_payout_id' => 'payout-existing',
        ]);

        app(PlatformWalletService::class)->processWithdrawal($withdrawal);

        $withdrawal->refresh();

        $this->assertEquals(WithdrawalStatus::Succeeded, $withdrawal->status);
        $this->assertEquals('payout-existing', $withdrawal->xendit_payout_id);
        Http::assertNothingSent();
    }

    public function test_ledger_available_balance_calculation(): void
    {
        PlatformWalletLedgerEntry::create([
            'type' => 'credit',
            'amount' => 1000000,
            'description' => 'Fee from payment 1',
        ]);

        PlatformWalletLedgerEntry::create([
            'type' => 'credit',
            'amount' => 500000,
            'description' => 'Fee from payment 2',
        ]);

        $withdrawal = PlatformWithdrawal::create([
            'requested_by' => User::factory()->superAdmin()->create()->id,
            'amount' => 300000,
            'currency' => 'IDR',
            'status' => WithdrawalStatus::Succeeded,
        ]);

        PlatformWalletLedgerEntry::create([
            'platform_withdrawal_id' => $withdrawal->id,
            'type' => 'debit',
            'amount' => 300000,
            'description' => 'Withdrawal',
        ]);

        $wallet = app(PlatformWalletService::class);

        $this->assertEquals(1200000, $wallet->availableBalance());
        $this->assertEquals(1500000, $wallet->totalPlatformFee());
        $this->assertEquals(300000, $wallet->totalWithdrawn());
    }

    public function test_split_failed_does_not_block_payment(): void
    {
        config()->set('xendit.callback_verification_token', 'test-token');

        $booking = $this->createBookingWithPayment();
        $payment = $booking->payment;

        $payment->update([
            'platform_fee_expected' => 5000,
            'split_status' => SplitStatus::Pending,
        ]);

        $this
            ->withHeaders(['X-CALLBACK-TOKEN' => 'test-token'])
            ->postJson(route('webhooks.xendit'), [
                'external_id' => $payment->xendit_external_id,
                'status' => 'PAID',
                'split' => [
                    'status' => 'FAILED',
                ],
            ])
            ->assertOk();

        $payment->refresh();
        $this->assertEquals(PaymentGatewayStatus::Paid, $payment->status);
        $this->assertEquals(SplitStatus::Failed, $payment->split_status);
    }

    private function createBookingWithPayment(): Booking
    {
        StudioSetting::active();
        $paymentMethod = PaymentMethod::factory()->create();
        $user = User::factory()->create();

        $booking = Booking::query()->create([
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

        Payment::create([
            'booking_id' => $booking->id,
            'xendit_external_id' => 'test-ext-'.Str::random(8),
            'amount' => $booking->total_price,
            'platform_fee_expected' => 0,
            'status' => PaymentGatewayStatus::Pending,
            'split_status' => SplitStatus::NotApplicable,
        ]);

        return $booking->fresh(['payment']);
    }
}
