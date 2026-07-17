<?php

namespace App\Http\Requests\Bookings;

use App\Models\Equipment;
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
            'customer_equipment_notes' => ['nullable', 'string', 'max:1000'],
            'equipment' => ['nullable', 'array'],
            'equipment.*' => ['integer', 'min:1', Rule::in($this->allowedEquipmentQuantitiesBound())],
        ];
    }

    /**
     * Bound used by the `Rule::in` test for friendly error messages.
     *
     * @return array<int, int>
     */
    private function allowedEquipmentQuantitiesBound(): array
    {
        return range(1, 64);
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

                if (! $this->validateEquipmentSelection($validator)) {
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

    /**
     * Validate equipment selection: each id must exist + be active, and quantity must respect stock.
     * Microphone stock is 2 so this also enforces "mikrofon maksimal 2".
     *
     * @return bool True when the selection is valid (or no selection made).
     */
    private function validateEquipmentSelection(Validator $validator): bool
    {
        $equipment = $this->input('equipment');
        if (! is_array($equipment) || $equipment === []) {
            return true;
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

        return $validator->errors()->isEmpty();
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
