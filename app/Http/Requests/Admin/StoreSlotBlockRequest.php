<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreSlotBlockRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'booking_date' => ['required', 'date', 'after_or_equal:today'],
            'starts_at' => ['required', 'date_format:H:i'],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                // Block end is derived from studio slot duration; ensure the resulting range
                // does not extend past the studio's closing time.
                $studio = \App\Models\StudioSetting::active();
                $startsAt = $this->string('starts_at')->toString();
                $endsAt = app(\App\Services\BookingSchedule::class)->endsAt($studio, $startsAt);

                if ($endsAt > $studio->closes_at) {
                    $validator->errors()->add('starts_at', __('Slot melebihi jam tutup studio.'));
                }
            },
        ];
    }
}
