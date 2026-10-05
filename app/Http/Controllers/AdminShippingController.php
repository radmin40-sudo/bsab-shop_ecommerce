<?php

namespace App\Http\Controllers;

use App\Models\DeliveryZone;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminShippingController extends Controller
{
    public function index(): Response
    {
        $settings = SiteSetting::homeSettings();

        return Inertia::render('admin/shipping', [
            'deliveryZones' => DeliveryZone::query()->orderBy('sort_order')->orderBy('name')->get(),
            'deliveryOptions' => $settings['shipping_options'],
            'deliverySteps' => $settings['shipping_steps'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        DeliveryZone::create([
            ...$this->validatedZone($request),
            'sort_order' => ((int) DeliveryZone::query()->max('sort_order')) + 1,
        ]);

        return back()->with('success', 'Delivery zone added.');
    }

    public function update(Request $request, DeliveryZone $deliveryZone): RedirectResponse
    {
        $deliveryZone->update($this->validatedZone($request, $deliveryZone));

        return back()->with('success', 'Delivery zone updated.');
    }

    public function destroy(DeliveryZone $deliveryZone): RedirectResponse
    {
        $deliveryZone->delete();

        return back()->with('success', 'Delivery zone deleted.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'delivery_zone_ids' => ['required', 'array', 'size:'.DeliveryZone::count()],
            'delivery_zone_ids.*' => ['required', 'integer', 'distinct', 'exists:delivery_zones,id'],
        ]);

        DB::transaction(function () use ($data): void {
            foreach ($data['delivery_zone_ids'] as $index => $id) {
                DeliveryZone::query()->whereKey($id)->update(['sort_order' => $index]);
            }
        });

        return back()->with('success', 'Delivery zones reordered.');
    }

    public function saveContent(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'delivery_options' => ['required', 'array:local_delivery,seller_delivery,pickup'],
            'delivery_options.local_delivery' => ['required', 'boolean'],
            'delivery_options.seller_delivery' => ['required', 'boolean'],
            'delivery_options.pickup' => ['required', 'boolean'],
            'delivery_steps' => ['required', 'array', 'size:5'],
            'delivery_steps.*.title' => ['required', 'string', 'max:120'],
            'delivery_steps.*.description' => ['required', 'string', 'max:500'],
        ]);

        SiteSetting::updateOrCreate(
            ['key' => 'shipping_options'],
            ['value' => json_encode($data['delivery_options'], JSON_THROW_ON_ERROR)],
        );
        SiteSetting::updateOrCreate(
            ['key' => 'shipping_steps'],
            ['value' => json_encode($data['delivery_steps'], JSON_THROW_ON_ERROR)],
        );

        return back()->with('success', 'Shipping information updated.');
    }

    private function validatedZone(Request $request, ?DeliveryZone $deliveryZone = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'barangay' => [
                'required',
                'string',
                'max:150',
                Rule::unique('delivery_zones', 'barangay')->ignore($deliveryZone?->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'delivery_fee' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'is_free_delivery' => ['required', 'boolean'],
            'free_delivery_minimum' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'estimated_delivery_min' => ['nullable', 'integer', 'min:0', 'max:365'],
            'estimated_delivery_max' => ['nullable', 'integer', 'gte:estimated_delivery_min', 'max:365'],
            'estimated_delivery_text' => ['required', 'string', 'max:100'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);
    }
}
