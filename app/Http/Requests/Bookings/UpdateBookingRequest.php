<?php

namespace App\Http\Requests\Bookings;

use App\Models\Booking;
use App\Models\Equipment;
use App\Models\PaymentMethod;
use App\Models\StudioSetting;
use App\Services\BookingSchedule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Booking $booking */
        $booking = $this->route('booking');

        return $booking->canBeChangedBy($this->user());
    }

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
            'customer_equipment_notes' => ['nullable', 'string', 'max:1000'],
            'equipment' => ['nullable', 'array'],
            'equipment.*' => ['integer', 'min:1', 'max:64'],
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

                $this->validateEquipmentSelection($validator);

                /** @var Booking $booking */
                $booking = $this->route('booking');
                $studio = StudioSetting::active();
                $startsAt = $this->string('starts_at')->toString();
                $schedule = app(BookingSchedule::class);
                $endsAt = $schedule->endsAt($studio, $startsAt);

                if (! $schedule->isSlotAvailable($this->string('booking_date')->toString(), $startsAt, $endsAt, $booking)) {
                    $validator->errors()->add('starts_at', __('Slot waktu ini sudah dibooking.'));
                }
            },
        ];
    }

    private function validateEquipmentSelection(Validator $validator): void
    {
        $equipment = $this->input('equipment');
        if (! is_array($equipment) || $equipment === []) {
            return;
        }

        $ids = array_keys($equipment);
        $active = Equipment::query()
            ->where('is_active', true)
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id');

        foreach ($equipment as $id => $quantity) {
            $id = (int) $id;
            $quantity = (int) $quantity;

            if ($quantity <= 0) {
                continue;
            }

            $item = $active->get($id);
            if (! $item) {
                $validator->errors()->add("equipment.{$id}", __('Alat tidak tersedia.'));
                continue;
            }

            if ($quantity > $item->stock) {
                $validator->errors()->add(
                    "equipment.{$id}",
                    __('Jumlah :name melebihi stok (:stock).', [
                        'name' => $item->name,
                        'stock' => $item->stock,
                    ]),
                );
            }
        }
    }

    /**
     * @return array<int, string>
     */
    public function messages(): array
    {
        return [
            'equipment.*.min' => __('Jumlah alat minimal 1.'),
        ];
    }
}
