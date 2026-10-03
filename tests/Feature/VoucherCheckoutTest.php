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
use App\Models\VoucherClaim;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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

        $response->assertCreated()->assertJsonStructure(['id', 'order_number']);
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

    public function test_checkout_only_orders_selected_cart_items_and_keeps_the_rest_in_cart(): void
    {
        Role::findOrCreate('customer', 'web');
        $customer = User::factory()->create();
        $customer->assignRole('customer');
        $seller = User::factory()->create();
        $shop = Shop::create(['user_id' => $seller->id, 'name' => 'Selection Shop', 'slug' => 'selection-shop']);
        $category = Category::create(['name' => 'Home', 'slug' => 'selection-home']);
        $selectedProduct = $this->makeProduct($shop, $category, 'Selected Lamp', '500.00');
        $unselectedProduct = $this->makeProduct($shop, $category, 'Saved Blanket', '800.00');

        $cart = Cart::create(['user_id' => $customer->id]);
        $selectedItem = CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $selectedProduct->id,
            'quantity' => 1,
            'price_snapshot' => 500,
        ]);
        $unselectedItem = CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $unselectedProduct->id,
            'quantity' => 1,
            'price_snapshot' => 800,
        ]);

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/customer/checkout', [
                'shipping_address' => [
                    'full_name' => 'Test Customer', 'phone' => '09171234567', 'line1' => '123 Main Street',
                    'city' => 'Pasig', 'province' => 'Metro Manila', 'postal_code' => '1600',
                ],
                'payment_method' => 'cash_on_delivery',
                'selected_item_ids' => [$selectedItem->id],
            ])
            ->assertCreated()
            ->assertJsonPath('subtotal', '500.00');

        $order = Order::query()->where('user_id', $customer->id)->firstOrFail();
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_id' => $selectedProduct->id,
        ]);
        $this->assertDatabaseMissing('order_items', [
            'order_id' => $order->id,
            'product_id' => $unselectedProduct->id,
        ]);
        $this->assertDatabaseMissing('cart_items', ['id' => $selectedItem->id]);
        $this->assertDatabaseHas('cart_items', ['id' => $unselectedItem->id]);
    }

    public function test_customer_menu_badge_counts_only_unclaimed_available_vouchers(): void
    {
        Role::findOrCreate('customer', 'web');
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        $newVoucher = Voucher::create([
            'name' => 'New claimable voucher',
            'code' => 'NEWCLAIM'.strtoupper(uniqid()),
            'type' => 'fixed',
            'discount_value' => 25,
            'requires_claim' => true,
            'is_active' => true,
        ]);
        $claimedVoucher = Voucher::create([
            'name' => 'Already claimed voucher',
            'code' => 'CLAIMED'.strtoupper(uniqid()),
            'type' => 'fixed',
            'discount_value' => 25,
            'requires_claim' => true,
            'is_active' => true,
        ]);
        VoucherClaim::create([
            'voucher_id' => $claimedVoucher->id,
            'user_id' => $customer->id,
            'status' => 'claimed',
            'claimed_at' => now(),
        ]);
        Voucher::create([
            'name' => 'No claim required voucher',
            'code' => 'NOCLAIM'.strtoupper(uniqid()),
            'type' => 'fixed',
            'discount_value' => 25,
            'requires_claim' => false,
            'is_active' => true,
        ]);
        Voucher::create([
            'name' => 'Expired voucher',
            'code' => 'EXPIRED'.strtoupper(uniqid()),
            'type' => 'fixed',
            'discount_value' => 25,
            'requires_claim' => true,
            'is_active' => true,
            'expires_at' => now()->subDay(),
        ]);

        $this->actingAs($customer, 'web')
            ->get('/customer/cart')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('customer/cart')
                ->where('newVoucherCount', 1));
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