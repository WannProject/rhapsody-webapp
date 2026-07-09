<?php

namespace App\Http\Requests\Admin;

use App\Enums\FeeType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePlatformFeeRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'client_id' => ['nullable', 'exists:clients,id'],
            'fee_type' => ['required', Rule::enum(FeeType::class)],
            'percent' => ['required_if:fee_type,percent,hybrid', 'numeric', 'min:0', 'max:100'],
            'flat_amount' => ['required_if:fee_type,flat,hybrid', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
