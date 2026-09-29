<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VoucherCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_voucher_only_discounts_eligible_items_and_is_saved_to_order(): void
    {
        Role::findOrCreate('customer', 'web');
        $customer = User::factory()->create();
        $customer->assignRole('customer');
        $seller = User::factory()->create();
        $shop = Shop::create(['user_id' => $seller->id, 'name' => 'Test Shop', 'slug' => 'test-shop']);
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio-test']);
        $eligible = $this->makeProduct($shop, $category, 'Headphones', '1599.00');
        $other = $this->makeProduct($shop, $category, 'Backpack', '999.00');

        $voucher = Voucher::create([
            'name' => 'Headphone discount',
            'code' => 'BSAB100',
            'type' => 'fixed',
            'discount_value' => 100,
            'minimum_spend' => 500,
            'apply_to' => 'products',
            'customer_eligibility' => 'all',
            'is_active' => true,
        ]);
        $voucher->products()->attach($eligible->id);

        $cart = Cart::create(['user_id' => $customer->id]);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $eligible->id, 'quantity' => 1, 'price_snapshot' => 1599]);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $other->id, 'quantity' => 1, 'price_snapshot' => 999]);

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/customer/cart/voucher', ['code' => 'BSAB100'])
            ->assertOk()
            ->assertJsonPath('voucher.eligible_subtotal', 1599)
            ->assertJsonPath('voucher.discount', 100);

        $response = $this->postJson('/api/customer/checkout', [
            'shipping_address' => [
                'full_name' => 'Test Customer', 'phone' => '09171234567', 'line1' => '123 Main Street',
                'city' => 'Pasig', 'province' => 'Metro Manila', 'postal_code' => '1600',
            ],
            'payment_method' => 'cash_on_delivery',
        ]);

        $response->assertCreated();
        $order = Order::query()->where('user_id', $customer->id)->firstOrFail();
        $this->assertSame('2598.00', $order->subtotal);
        $this->assertSame('100.00', $order->discount);
        $this->assertSame('2498.00', $order->total);
        $this->assertSame('BSAB100', $order->voucher_code_snapshot);
        $this->assertDatabaseHas('voucher_usages', [
            'voucher_id' => $voucher->id,
            'order_id' => $order->id,
            'discount_amount' => 100,
            'code_snapshot' => 'BSAB100',
        ]);
    }

    public function test_free_shipping_voucher_waives_express_shipping_on_checkout(): void
    {
        Role::findOrCreate('customer', 'web');
        $customer = User::factory()->create();
        $customer->assignRole('customer');
        $seller = User::factory()->create();
        $shop = Shop::create(['user_id' => $seller->id, 'name' => 'Shipping Shop', 'slug' => 'shipping-shop']);
        $category = Category::create(['name' => 'Home', 'slug' => 'home-test']);
        $product = $this->makeProduct($shop, $category, 'Desk Lamp', '500.00');
        $voucher = Voucher::create([
            'name' => 'Free express shipping',
            'code' => 'BSABSHIP',
            'type' => 'free_shipping',
            'discount_value' => 0,
            'minimum_spend' => 0,
            'apply_to' => 'all',
            'customer_eligibility' => 'all',
            'free_shipping' => true,
            'is_active' => true,
        ]);
        $cart = Cart::create(['user_id' => $customer->id]);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'quantity' => 1, 'price_snapshot' => 500]);

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/customer/cart/voucher', ['code' => 'BSABSHIP'])
            ->assertOk()
            ->assertJsonPath('voucher.free_shipping', true);

        $this->postJson('/api/customer/checkout', [
            'shipping_address' => [
                'full_name' => 'Test Customer', 'phone' => '09171234567', 'line1' => '123 Main Street',
                'city' => 'Pasig', 'province' => 'Metro Manila', 'postal_code' => '1600',
            ],
            'payment_method' => 'cash_on_delivery',
            'shipping_method' => 'express',
        ])->assertCreated();

        $order = Order::query()->where('user_id', $customer->id)->firstOrFail();
        $this->assertSame('0.00', $order->shipping_fee);
        $this->assertSame('500.00', $order->total);
    }

    private function makeProduct(Shop $shop, Category $category, string $name, string $price): Product
    {
        return Product::create([
            'shop_id' => $shop->id,
            'seller_id' => $shop->id,
            'category_id' => $category->id,
            'name' => $name,
            'slug' => strtolower($name).'-'.uniqid(),
            'description' => $name,
            'base_price' => $price,
            'sku' => strtoupper(substr($name, 0, 4)).'-'.uniqid(),
            'stock_quantity' => 10,
            'status' => 'published',
            'is_active' => true,
            'is_approved' => true,
        ]);
    }
}