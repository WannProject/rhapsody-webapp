<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStudioSettingRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:2000'],
            'description' => ['nullable', 'string', 'max:5000'],
            'contact_phone' => ['nullable', 'string', 'max:32'],
            'location_url' => ['nullable', 'url', 'max:2048'],
            'opens_at' => ['required', 'date_format:H:i'],
            'closes_at' => ['required', 'date_format:H:i', 'after:opens_at'],
            'slot_duration_minutes' => ['required', 'integer', 'min:30', 'max:480'],
            'minimum_booking_minutes' => ['required', 'integer', 'min:30', 'max:480'],
            'hourly_rate' => ['required', 'integer', 'min:0', 'max:100000000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
