<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Voucher;
use App\Models\VoucherRedemption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function validateVoucher(Request $request)
    {
        $data = $request->validate(['code' => 'required|string|max:50', 'subtotal' => 'required|numeric|min:0']);
        $voucher = Voucher::whereRaw('LOWER(code) = ?', [strtolower($data['code'])])->first();
        abort_unless($voucher, 422, 'That voucher code is not valid.');
        $this->ensureVoucherAvailable($voucher, (float) $data['subtotal'], $request->user()->id);

        return response()->json(['code' => $voucher->code, 'discount' => $this->voucherDiscount($voucher, (float) $data['subtotal'])]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.full_name' => 'required|string|max:255',
            'shipping_address.phone' => 'required|string|max:50',
            'shipping_address.line1' => 'required|string|max:255',
            'shipping_address.city' => 'required|string|max:255',
            'shipping_address.province' => 'required|string|max:255',
            'shipping_address.postal_code' => 'required|string|max:20',
            'payment_method' => 'required|string|max:50',
            'voucher_code' => 'nullable|string|max:50',
        ]);

        $order = DB::transaction(function () use ($request, $data) {
            $cart = Cart::with('items.product', 'items.variant')->where('user_id', $request->user()->id)->firstOrFail();
            abort_if($cart->items->isEmpty(), 422, 'Your cart is empty.');

            $subtotal = $cart->items->sum(fn ($item) => $item->price_snapshot * $item->quantity);
            $discount = 0;
            $voucher = null;

            if (! empty($data['voucher_code'])) {
                $voucher = Voucher::whereRaw('LOWER(code) = ?', [strtolower($data['voucher_code'])])->lockForUpdate()->first();
                abort_unless($voucher, 422, 'That voucher code is not valid.');
                $this->ensureVoucherAvailable($voucher, (float) $subtotal, $request->user()->id);
                $discount = $this->voucherDiscount($voucher, (float) $subtotal);
            }

            $order = Order::create([
                'order_number' => 'CG-'.now()->format('ymd').'-'.Str::upper(Str::random(6)),
                'user_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => max(0, $subtotal - $discount),
                'shipping_address' => $data['shipping_address'],
                'payment_method' => $data['payment_method'],
            ]);

            if ($voucher) {
                VoucherRedemption::create(['voucher_id' => $voucher->id, 'user_id' => $request->user()->id, 'order_id' => $order->id]);
                $voucher->increment('times_used');
            }

            foreach ($cart->items as $item) {
                $product = $item->product()->lockForUpdate()->first();
                $variant = $item->variant()->lockForUpdate()->first();

                if ($variant) {
                    abort_unless($variant->is_active, 422, "Selected variant for {$product->name} is unavailable.");
                    abort_if($variant->stock_quantity < $item->quantity, 422, "Insufficient stock for variant {$variant->name}.");
                    $variant->decrement('stock_quantity', $item->quantity);
                } else {
                    abort_if($product->stock_quantity < $item->quantity, 422, "Insufficient stock for {$product->name}.");
                    $product->decrement('stock_quantity', $item->quantity);
                }

                $order->items()->create([
                    'product_id' => $product->id,
                    'shop_id' => $product->shop_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->price_snapshot,
                    'total_price' => $item->price_snapshot * $item->quantity,
                ]);
            }

            $cart->items()->delete();

            return $order->load('items.product', 'items.shop');
        });

        return response()->json($order, 201);
    }

    private function ensureVoucherAvailable(Voucher $voucher, float $subtotal, int $userId): void
    {
        abort_if($voucher->expires_at && $voucher->expires_at->isPast(), 422, 'That voucher has expired.');
        abort_if($voucher->usage_limit !== null && $voucher->times_used >= $voucher->usage_limit, 422, 'That voucher has reached its usage limit.');
        abort_if(VoucherRedemption::where('voucher_id', $voucher->id)->where('user_id', $userId)->exists(), 422, 'You have already used this voucher.');
        abort_if($subtotal < (float) $voucher->min_spend, 422, 'Your cart does not meet the minimum spend for this voucher.');
    }

    private function voucherDiscount(Voucher $voucher, float $subtotal): float
    {
        $discount = in_array(strtolower($voucher->type), ['percent', 'percentage'])
            ? $subtotal * ((float) $voucher->value / 100)
            : (float) $voucher->value;
        if ($voucher->max_discount !== null) {
            $discount = min($discount, (float) $voucher->max_discount);
        }

        return round(min($discount, $subtotal), 2);
    }
}
