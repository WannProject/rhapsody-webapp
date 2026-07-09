<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ClientStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreClientRequest;
use App\Http\Requests\Admin\UpdateClientRequest;
use App\Models\Client;
use App\Services\XenditClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $clients = Client::query()
            ->with(['xenditSubAccount', 'feeRule', 'user'])
            ->latest()
            ->when($request->input('status'), fn ($q, $status) => $q->where('status', $status))
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/clients/index', [
            'clients' => $clients->through(fn (Client $client) => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'businessName' => $client->business_name,
                'businessType' => $client->business_type,
                'status' => $client->status->value,
                'statusLabel' => $client->status->label(),
                'canReceivePayments' => $client->status->canReceivePayments(),
                'verifiedAt' => $client->verified_at?->toDateTimeString(),
                'xenditAccountId' => $client->xenditSubAccount?->xendit_account_id,
                'xenditStatus' => $client->xenditSubAccount?->status,
            ]),
            'filters' => $request->only(['status']),
        ]);
    }

    public function store(StoreClientRequest $request): RedirectResponse
    {
        $client = Client::create([
            ...$request->validated(),
            'status' => ClientStatus::Draft,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Client dibuat.')]);

        return to_route('admin.clients.show', $client);
    }

    public function show(Client $client): Response
    {
        $client->load(['xenditSubAccount', 'feeRule', 'user']);

        return Inertia::render('admin/clients/show', [
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'businessName' => $client->business_name,
                'businessType' => $client->business_type,
                'status' => $client->status->value,
                'statusLabel' => $client->status->label(),
                'canReceivePayments' => $client->status->canReceivePayments(),
                'verifiedAt' => $client->verified_at?->toDateTimeString(),
                'xenditAccountId' => $client->xenditSubAccount?->xendit_account_id,
                'xenditStatus' => $client->xenditSubAccount?->status,
                'feeRule' => $client->feeRule ? [
                    'feeType' => $client->feeRule->fee_type->value,
                    'percent' => $client->feeRule->percent,
                    'flatAmount' => $client->feeRule->flat_amount,
                ] : null,
            ],
        ]);
    }

    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $validated = $request->validated();

        if (isset($validated['status'])) {
            $status = ClientStatus::from($validated['status']);
            $validated['verified_at'] = $status === ClientStatus::Verified && ! $client->verified_at
                ? now()
                : $client->verified_at;
            $validated['suspended_at'] = $status === ClientStatus::Suspended
                ? now()
                : $client->suspended_at;
        }

        $client->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Client diperbarui.')]);

        return to_route('admin.clients.show', $client);
    }

    public function createSubAccount(Client $client, XenditClient $xendit): RedirectResponse
    {
        try {
            $response = $xendit->createSubAccount([
                'email' => $client->email,
                'type' => 'owned',
                'business_name' => $client->business_name ?? $client->name,
                'profile' => [
                    'business_type' => $client->business_type ?? 'STUDIO',
                ],
            ]);

            $client->xenditSubAccount()->updateOrCreate(
                ['client_id' => $client->id],
                [
                    'xendit_account_id' => $response['id'],
                    'status' => $response['status'] ?? 'pending',
                    'type' => 'owned',
                ],
            );

            $client->update(['status' => ClientStatus::Invited]);

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Xendit sub-account dibuat.')]);
        } catch (\Exception $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Gagal membuat sub-account: ').$e->getMessage()]);
        }

        return to_route('admin.clients.show', $client);
    }

    public function destroy(Client $client): RedirectResponse
    {
        $client->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Client dihapus.')]);

        return to_route('admin.clients.index');
    }
}
