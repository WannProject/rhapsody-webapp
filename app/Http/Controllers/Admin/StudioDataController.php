<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEquipmentRequest;
use App\Http\Requests\Admin\UpdateEquipmentRequest;
use App\Http\Requests\Admin\UpdateStudioSettingRequest;
use App\Models\Equipment;
use App\Models\StudioSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StudioDataController extends Controller
{
    public function index(): Response
    {
        $studio = StudioSetting::active();

        return Inertia::render('admin/studio-data/index', [
            'studio' => [
                'name' => $studio->name,
                'address' => $studio->address,
                'description' => $studio->description,
                'contactPhone' => $studio->contact_phone,
                'locationUrl' => $studio->location_url,
                'opensAt' => substr($studio->opens_at, 0, 5),
                'closesAt' => substr($studio->closes_at, 0, 5),
                'slotDurationMinutes' => $studio->slot_duration_minutes,
                'minimumBookingMinutes' => $studio->minimum_booking_minutes,
                'hourlyRate' => $studio->hourly_rate,
                'isActive' => $studio->is_active,
            ],
            'equipments' => Equipment::query()
                ->orderBy('category')
                ->orderBy('name')
                ->get()
                ->map(fn (Equipment $equipment) => [
                    'id' => $equipment->id,
                    'name' => $equipment->name,
                    'category' => $equipment->category,
                    'stock' => $equipment->stock,
                    'additionalPrice' => $equipment->additional_price,
                    'isActive' => $equipment->is_active,
                ]),
        ]);
    }

    public function updateStudio(UpdateStudioSettingRequest $request): RedirectResponse
    {
        StudioSetting::active()->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data studio diperbarui.')]);

        return to_route('admin.studio-data.index');
    }

    public function storeEquipment(StoreEquipmentRequest $request): RedirectResponse
    {
        Equipment::query()->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data alat ditambahkan.')]);

        return to_route('admin.studio-data.index');
    }

    public function updateEquipment(UpdateEquipmentRequest $request, Equipment $equipment): RedirectResponse
    {
        $equipment->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data alat diperbarui.')]);

        return to_route('admin.studio-data.index');
    }

    public function destroyEquipment(Equipment $equipment): RedirectResponse
    {
        $equipment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data alat dihapus.')]);

        return to_route('admin.studio-data.index');
    }
}
