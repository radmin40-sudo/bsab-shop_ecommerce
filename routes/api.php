<?php

use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AdminSellerController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CustomerCartController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SellerProductController;
use App\Http\Controllers\Api\VoucherClaimController;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('products', [ProductController::class, 'index']);
Route::get('products/{product}', [ProductController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', fn (Request $request) => $request->user()->load('roles', 'shop', 'addresses'));

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::get('sellers', [AdminSellerController::class, 'index']);
        Route::post('sellers', [AdminSellerController::class, 'store']);
        Route::patch('sellers/{seller}', [AdminSellerController::class, 'update']);
        Route::delete('sellers/{seller}', [AdminSellerController::class, 'destroy']);
        Route::post('sellers/{seller}/suspend', [AdminSellerController::class, 'suspend']);
        Route::post('sellers/{seller}/reactivate', [AdminSellerController::class, 'reactivate']);
    });

    Route::middleware('role:seller')->prefix('seller')->group(function () {
        Route::get('products', [SellerProductController::class, 'index']);
        Route::post('products', [SellerProductController::class, 'store']);
        Route::patch('products/{product}', [SellerProductController::class, 'update']);
        Route::delete('products/{product}', [SellerProductController::class, 'destroy']);
        Route::get('orders', fn (Request $request) => $request->user()->shop->orderItems()->with('order.user', 'product.images')->latest()->paginate(20));
        Route::patch('orders/items/{item}', function (Request $request, OrderItem $item) {
            abort_unless($item->shop->user_id === $request->user()->id, 403);
            $item->update($request->validate(['fulfillment_status' => 'required|in:processing,accepted,declined,shipped,delivered,cancelled']));

            return $item->load('order');
        });
    });

    Route::middleware('role:customer')->prefix('customer')->group(function () {
        Route::get('cart', [CustomerCartController::class, 'show']);
        Route::post('cart/items', [CustomerCartController::class, 'store']);
        Route::patch('cart/items/{item}', [CustomerCartController::class, 'update']);
        Route::delete('cart/items/{item}', [CustomerCartController::class, 'destroy']);
        Route::post('voucher/validate', [CheckoutController::class, 'validateVoucher']);
        Route::get('vouchers', [VoucherClaimController::class, 'index']);
        Route::post('vouchers/{voucher}/claim', [VoucherClaimController::class, 'claim'])->middleware('throttle:10,1');
        Route::get('vouchers', [VoucherClaimController::class, 'index']);
        Route::post('vouchers/{voucher}/claim', [VoucherClaimController::class, 'claim'])->middleware('throttle:10,1');
        Route::post('checkout', [CheckoutController::class, 'store']);
        Route::get('orders', fn (Request $request) => $request->user()->orders()->with('items.product.images', 'items.shop')->latest()->paginate(20));
        Route::get('orders/{order}', fn (Request $request, Order $order) => abort_unless($order->user_id === $request->user()->id, 403) ?: $order->load('items.product.images', 'items.shop', 'payments'));
    });
});
