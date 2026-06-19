<?php

namespace App\Http\Requests\Bookings;

use App\Models\PaymentMethod;
use App\Models\StudioSetting;
use App\Services\BookingSchedule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreBookingRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'booking_date' => ['required', 'date', 'after_or_equal:today'],
            'starts_at' => ['required', 'date_format:H:i'],
            'payment_method_id' => [
                'required',
                Rule::exists(PaymentMethod::class, 'id')->where('is_active', true),
            ],
            'customer_phone' => ['nullable', 'string', 'max:32'],
            'notes' => ['nullable', 'string', 'max:1000'],
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

                $studio = StudioSetting::active();
                $startsAt = $this->string('starts_at')->toString();
                $schedule = app(BookingSchedule::class);
                $endsAt = $schedule->endsAt($studio, $startsAt);

                if (! $schedule->isSlotAvailable($this->string('booking_date')->toString(), $startsAt, $endsAt)) {
                    $validator->errors()->add('starts_at', __('Slot waktu ini sudah dibooking.'));
                }
            },
        ];
    }
}
