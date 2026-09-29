<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Voucher;
use App\Services\VoucherService;
use Illuminate\Http\Request;

class CustomerVoucherController extends Controller
{
    public function index(Request $request, VoucherService $vouchers)
    {
        $cart = Cart::with('items.product.category', 'items.variant')->firstOrCreate(['user_id' => $request->user()->id]);
        $items = $cart->items;

        $available = Voucher::query()
            ->where('is_active', true)
            ->where(fn ($query) => $query->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest()
            ->get()
            ->filter(function (Voucher $voucher) use ($vouchers, $request, $items) {
                try {
                    $vouchers->quote($voucher, $request->user(), $items);
                    return true;
                } catch (\Illuminate\Validation\ValidationException) {
                    return false;
                }
            })
            ->values();

        return response()->json(['data' => $available]);
    }

    public function apply(Request $request, VoucherService $vouchers)
    {
        $data = $request->validate(['code' => 'required|string|max:80']);
        $cart = Cart::with('items.product.category', 'items.variant')->firstOrCreate(['user_id' => $request->user()->id]);

        return response()->json(['voucher' => $vouchers->applyCode($cart, $request->user(), $data['code'])]);
    }

    public function remove(Request $request)
    {
        Cart::where('user_id', $request->user()->id)->update(['voucher_id' => null]);

        return response()->noContent();
    }

    public function quote(Request $request, VoucherService $vouchers)
    {
        $data = $request->validate(['selected_item_ids' => 'nullable|array', 'selected_item_ids.*' => 'integer|distinct']);
        $cart = Cart::with('items.product.category', 'items.variant', 'voucher')->where('user_id', $request->user()->id)->firstOrFail();
        $items = isset($data['selected_item_ids']) ? $cart->items->whereIn('id', $data['selected_item_ids'])->values() : $cart->items;
        abort_if(isset($data['selected_item_ids']) && count($data['selected_item_ids']) !== $items->count(), 422, 'One or more selected cart items are invalid.');
        abort_unless($cart->voucher, 422, 'No voucher is applied to this cart.');

        return response()->json(['voucher' => $vouchers->quote($cart->voucher, $request->user(), $items)]);
    }

    public function claim(Request $request, Voucher $voucher, VoucherService $vouchers)
    {
        $claim = $vouchers->claim($voucher, $request->user());

        return response()->json(['claim' => $claim->load('voucher')], 201);
    }
}