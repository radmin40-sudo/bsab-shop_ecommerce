<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Services\ImageOptimizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SellerShopController extends Controller
{
    public function show(Request $request)
    {
        $shop = $this->shopFor($request);

        return Inertia::render('seller/shop', [
            'shop' => [
                'id' => $shop->id,
                'name' => $shop->name,
                'slug' => $shop->slug,
                'description' => $shop->description,
                'gcash_enabled' => (bool) $shop->gcash_enabled,
                'gcash_account_name' => $shop->gcash_account_name,
                'gcash_mobile_number' => $shop->gcash_mobile_number,
                'gcash_qr_code' => $shop->gcash_qr_code ? '/storage/'.$shop->gcash_qr_code : null,
            ],
        ]);
    }

    public function update(Request $request, ImageOptimizationService $images)
    {
        $shop = $this->shopFor($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'description' => ['nullable', 'string'],
            'gcash_enabled' => ['nullable', 'boolean'],
            'gcash_account_name' => ['nullable', 'string', 'max:255'],
            'gcash_mobile_number' => ['nullable', 'string', 'max:50'],
            'gcash_qr_code' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('images.max_upload_kb')],
        ]);

        $shop->fill([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'gcash_enabled' => (bool) ($data['gcash_enabled'] ?? false),
            'gcash_account_name' => $data['gcash_account_name'] ?? null,
            'gcash_mobile_number' => $data['gcash_mobile_number'] ?? null,
        ]);

        if ($request->hasFile('gcash_qr_code')) {
            if ($shop->gcash_qr_code) {
                Storage::disk('public')->delete($shop->gcash_qr_code);
            }

            $shop->gcash_qr_code = $images->store($request->file('gcash_qr_code'), 'gcash-qr', ['max_dimension' => config('images.logo_max_dimension')]);
        }

        if ($shop->gcash_enabled) {
            $requiredMessage = 'Complete your GCash payment information before enabling GCash.';

            abort_unless($shop->gcash_account_name, 422, $requiredMessage);
            abort_unless($shop->gcash_mobile_number, 422, $requiredMessage);
            abort_unless($shop->gcash_qr_code, 422, $requiredMessage);
        }

        $shop->save();

        return to_route('seller.shop');
    }

    private function shopFor(Request $request): Shop
    {
        $user = $request->user();

        return $user->shop ?? $user->shop()->create([
            'name' => $user->name.' Shop',
            'slug' => Str::slug($user->name).'-'.Str::lower(Str::random(5)),
            'status' => 'approved',
            'commission_rate' => 10,
        ]);
    }
}
