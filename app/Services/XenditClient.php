<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class XenditClient
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly string $secretKey,
        private readonly int $timeout,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            (string) config('xendit.base_url'),
            (string) config('xendit.secret_key'),
            (int) config('xendit.timeout', 30),
        );
    }

    public function createSubAccount(array $data): array
    {
        return $this->post('/v2/platforms/account', $data);
    }

    public function getSubAccount(string $accountId): array
    {
        return $this->get("/v2/platforms/accounts/{$accountId}");
    }

    public function createSplitRule(string $accountId, array $splitConfig): array
    {
        return $this->post('/v2/platforms/split_rules', array_merge([
            'account_id' => $accountId,
        ], $splitConfig));
    }

    public function createInvoiceForSubAccount(string $accountId, array $invoiceData): array
    {
        return $this->post('/v2/platforms/accounts/'.$accountId.'/invoices', $invoiceData);
    }

    public function createInvoice(array $invoiceData): array
    {
        return $this->post('/v2/invoices', $invoiceData);
    }

    public function createPaymentRequest(array $data): array
    {
        return $this->post('/payment_requests', $data);
    }

    public function getInvoice(string $invoiceId): array
    {
        return $this->get("/v2/invoices/{$invoiceId}");
    }

    public function createPayout(array $data): array
    {
        return $this->post('/payouts', $data);
    }

    public function getPayout(string $payoutId): array
    {
        return $this->get("/payouts/{$payoutId}");
    }

    public function getBalance(): array
    {
        return $this->get('/balance');
    }

    public function verifyWebhook(string $xenditToken, ?string $verificationToken): bool
    {
        if (! $verificationToken) {
            return false;
        }

        return hash_equals($verificationToken, $xenditToken);
    }

    public function isConfigured(): bool
    {
        return filled($this->secretKey);
    }

    private function post(string $endpoint, array $data = []): array
    {
        return $this->request('post', $endpoint, $data);
    }

    private function get(string $endpoint, array $params = []): array
    {
        return $this->request('get', $endpoint, $params);
    }

    private function request(string $method, string $endpoint, array $data = []): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->timeout($this->timeout)
            ->{$method}($this->baseUrl.$endpoint, $data);

        $response->throw();

        return $response->json();
    }
}
