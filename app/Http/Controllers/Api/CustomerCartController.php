<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Voucher;
use Illuminate\Http\Request;

class CustomerCartController extends Controller
{
    private function cart(Request $request): Cart
    {
        return Cart::firstOrCreate(['user_id' => $request->user()->id]);
    }

    public function show(Request $request)
    {
        $cart = $this->cart($request)->load('items.product.shop', 'items.product.images', 'items.variant');
        $cart->items->each(function (CartItem $item) {
            $shop = $item->product?->shop;

            if ($shop?->gcash_qr_code) {
                $shop->setAttribute('gcash_qr_code_url', '/storage/'.$shop->gcash_qr_code);
            }
        });
        $cart->setAttribute('available_vouchers', Voucher::with('shop:id,name')
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->where(function ($query) {
                $query->whereNull('usage_limit')->orWhereColumn('times_used', '<', 'usage_limit');
            })
            ->whereDoesntHave('redemptions', fn ($query) => $query->where('user_id', $request->user()->id))
            ->latest()
            ->get(['id', 'code', 'type', 'value', 'min_spend', 'expires_at', 'shop_id']));

        return $cart;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::with('variants')->findOrFail($data['product_id']);
        abort_unless($product->status === 'published' && $product->is_approved, 422, 'Product is unavailable or out of stock.');

        $variant = null;
        if (! empty($data['variant_id'])) {
            $variant = ProductVariant::whereKey($data['variant_id'])->first();
            abort_unless($variant && $variant->product_id === $product->id, 422, 'That variant does not belong to this product.');
            abort_unless($variant->is_active, 422, 'That variant is currently unavailable.');
            abort_if($variant->stock_quantity < $data['quantity'], 422, 'Selected variant is sold out or has insufficient stock.');
        }

        $stockCheck = $variant ? $variant->stock_quantity : $product->stock_quantity;
        abort_if($stockCheck < $data['quantity'], 422, 'This product is sold out or has insufficient stock.');

        $unitPrice = $variant?->price ?? ($product->sale_price ?? $product->base_price);

        return $this->cart($request)->items()->updateOrCreate(
            ['product_id' => $product->id, 'variant_id' => $data['variant_id'] ?? null],
            ['quantity' => $data['quantity'], 'price_snapshot' => $unitPrice]
        );
    }

    public function update(Request $request, CartItem $item)
    {
        abort_unless($item->cart->user_id === $request->user()->id, 403);
        $item->update($request->validate(['quantity' => 'required|integer|min:1']));

        return $item;
    }

    public function destroy(Request $request, CartItem $item)
    {
        abort_unless($item->cart->user_id === $request->user()->id, 403);
        $item->delete();

        return response()->noContent();
    }
}
