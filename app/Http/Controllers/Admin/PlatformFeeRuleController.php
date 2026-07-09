<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePlatformFeeRuleRequest;
use App\Models\PlatformFeeRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlatformFeeRuleController extends Controller
{
    public function index(Request $request): Response
    {
        $rules = PlatformFeeRule::query()
            ->with('client')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/platform-fees/index', [
            'feeRules' => $rules->through(fn (PlatformFeeRule $rule) => [
                'id' => $rule->id,
                'clientName' => $rule->client?->name ?? 'Global (Semua Client)',
                'feeType' => $rule->fee_type->value,
                'feeTypeLabel' => $rule->fee_type->label(),
                'percent' => $rule->percent,
                'flatAmount' => $rule->flat_amount,
                'isActive' => $rule->is_active,
                'xenditSplitRuleId' => $rule->xendit_split_rule_id,
            ]),
        ]);
    }

    public function store(StorePlatformFeeRuleRequest $request): RedirectResponse
    {
        PlatformFeeRule::create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Fee rule dibuat.')]);

        return to_route('admin.platform-fees.index');
    }

    public function update(StorePlatformFeeRuleRequest $request, PlatformFeeRule $platformFeeRule): RedirectResponse
    {
        $platformFeeRule->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Fee rule diperbarui.')]);

        return to_route('admin.platform-fees.index');
    }

    public function destroy(PlatformFeeRule $platformFeeRule): RedirectResponse
    {
        $platformFeeRule->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Fee rule dihapus.')]);

        return to_route('admin.platform-fees.index');
    }
}
