<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function index(Request $request): Response
    {
        $isAdmin = $request->user()->hasRole('admin');
        $shop = $request->user()->shop;
        abort_unless($isAdmin || $shop, 403);

        $vouchers = Voucher::with('shop:id,name')
            ->when(! $isAdmin, fn ($query) => $query->where('shop_id', $shop->id))
            ->latest()
            ->get();

        return Inertia::render($isAdmin ? 'admin/vouchers' : 'seller/vouchers', [
            'vouchers' => $vouchers,
            'shops' => $isAdmin ? Shop::orderBy('name')->get(['id', 'name']) : [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $isAdmin = $request->user()->hasRole('admin');
        $shop = $request->user()->shop;
        abort_unless($isAdmin || $shop, 403);
        $data = $this->validated($request, $isAdmin);
        $data['shop_id'] = $isAdmin ? ($data['shop_id'] ?? null) : $shop->id;
        $data['created_by_role'] = $isAdmin ? 'admin' : 'seller';
        $data['title'] = $data['title'] ?? $data['code'];
        $data['status'] = $data['status'] ?? 'active';
        $data['total_claim_limit'] = $data['usage_limit'] ?? null;
        Voucher::create($data);

        return back();
    }

    public function update(Request $request, Voucher $voucher): RedirectResponse
    {
        $isAdmin = $request->user()->hasRole('admin');
        $shop = $request->user()->shop;
        abort_unless($isAdmin || ($shop && $voucher->shop_id === $shop->id), 403);
        $data = $this->validated($request, $isAdmin, $voucher);
        $data['shop_id'] = $isAdmin ? ($data['shop_id'] ?? null) : $shop->id;
        $data['total_claim_limit'] = $data['usage_limit'] ?? null;
        $voucher->update($data);

        return back();
    }

    public function destroy(Request $request, Voucher $voucher): RedirectResponse
    {
        $isAdmin = $request->user()->hasRole('admin');
        $shop = $request->user()->shop;
        abort_unless($isAdmin || ($shop && $voucher->shop_id === $shop->id), 403);
        $voucher->delete();

        return back();
    }

    private function validated(Request $request, bool $isAdmin, ?Voucher $voucher = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('vouchers', 'code')->ignore($voucher?->id)],
            'type' => ['required', Rule::in(['percent', 'fixed'])],
            'value' => ['required', 'numeric', 'min:0.01'],
            'shop_id' => [$isAdmin ? 'nullable' : 'prohibited', 'integer', 'exists:shops,id'],
            'min_spend' => ['required', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'start_date' => ['nullable', 'date'],
        ]);
    }
}
