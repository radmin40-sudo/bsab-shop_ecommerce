<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VoucherManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_can_open_their_voucher_management_page(): void
    {
        Role::findOrCreate('seller', 'web');
        $seller = User::factory()->create();
        $seller->assignRole('seller');
        $shop = $this->makeShop($seller, 'seller-voucher-page');
        Voucher::create([
            'seller_id' => $shop->id,
            'name' => 'Seller page offer',
            'code' => 'SELLERPAGE10',
            'type' => 'fixed',
            'discount_value' => 10,
            'apply_to' => 'all',
            'customer_eligibility' => 'all',
            'is_active' => true,
        ]);

        $response = $this->actingAs($seller)
            ->get(route('seller.vouchers'));

        $response->assertOk()->assertSee('SELLERPAGE10');
    }

    public function test_seller_cannot_modify_another_sellers_voucher(): void
    {
        Role::findOrCreate('seller', 'web');
        $seller = User::factory()->create();
        $seller->assignRole('seller');
        $sellerShop = $this->makeShop($seller, 'seller-one');
        $otherSeller = User::factory()->create();
        $otherShop = $this->makeShop($otherSeller, 'seller-two');
        $voucher = Voucher::create([
            'seller_id' => $otherShop->id,
            'name' => 'Other seller offer',
            'code' => 'OTHER100',
            'type' => 'fixed',
            'discount_value' => 100,
            'apply_to' => 'all',
            'customer_eligibility' => 'all',
            'is_active' => true,
        ]);

        $this->actingAs($seller)
            ->patch(route('seller.vouchers.update', $voucher), [
                'name' => 'Hijacked offer',
                'code' => 'HIJACK100',
                'type' => 'fixed',
                'discount_value' => 100,
                'apply_to' => 'all',
                'customer_eligibility' => 'all',
            ])
            ->assertForbidden();

        $this->assertSame('Other seller offer', $voucher->fresh()->name);
        $this->assertSame($sellerShop->id !== $otherShop->id, true);
    }

    public function test_customer_can_claim_a_claim_required_voucher_only_once(): void
    {
        Role::findOrCreate('customer', 'web');
        $customer = User::factory()->create();
        $customer->assignRole('customer');
        $voucher = Voucher::create([
            'name' => 'Claim first offer',
            'code' => 'CLAIM100',
            'type' => 'fixed',
            'discount_value' => 100,
            'apply_to' => 'all',
            'customer_eligibility' => 'all',
            'requires_claim' => true,
            'claim_limit' => 10,
            'is_active' => true,
        ]);

        $this->actingAs($customer, 'sanctum')
            ->postJson("/api/customer/vouchers/{$voucher->id}/claim")
            ->assertCreated();

        $this->actingAs($customer, 'sanctum')
            ->postJson("/api/customer/vouchers/{$voucher->id}/claim")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('voucher');

        $this->assertDatabaseCount('voucher_claims', 1);
    }

    public function test_proxy_requests_are_treated_as_secure_for_https_requests(): void
    {
        Route::middleware('web')->get('/proxy-secure-check', function () {
            return response()->json(['secure' => request()->isSecure()]);
        });

        $this->withServerVariables([
            'HTTP_X_FORWARDED_PROTO' => 'https',
            'HTTP_X_FORWARDED_PORT' => '443',
            'HTTPS' => 'on',
        ])->get('/proxy-secure-check')
            ->assertOk()
            ->assertJsonPath('secure', true);
    }

    public function test_seller_can_create_voucher_only_for_products_in_their_shop(): void
    {
        Role::findOrCreate('seller', 'web');
        $seller = User::factory()->create();
        $seller->assignRole('seller');
        $shop = $this->makeShop($seller, 'seller-voucher-shop');
        $otherSeller = User::factory()->create();
        $otherShop = $this->makeShop($otherSeller, 'other-voucher-shop');
        $category = Category::create(['name' => 'Voucher test', 'slug' => 'voucher-test-category']);
        $owned = $this->makeProduct($shop, $category, 'Owned item');
        $notOwned = $this->makeProduct($otherShop, $category, 'Other item');

        $this->actingAs($seller)
            ->from('/seller/vouchers')
            ->post(route('seller.vouchers.store'), [
                'name' => 'Seller offer',
                'code' => 'seller100',
                'type' => 'fixed',
                'discount_value' => 100,
                'minimum_spend' => 0,
                'apply_to' => 'products',
                'customer_eligibility' => 'all',
                'is_active' => true,
                'product_ids' => [$owned->id, $notOwned->id],
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('vouchers', ['code' => 'SELLER100']);

        $this->actingAs($seller)
            ->from('/seller/vouchers')
            ->post(route('seller.vouchers.store'), [
                'name' => 'Seller offer',
                'code' => 'seller100',
                'type' => 'fixed',
                'discount_value' => 100,
                'minimum_spend' => 0,
                'apply_to' => 'products',
                'customer_eligibility' => 'all',
                'is_active' => true,
                'product_ids' => [$owned->id],
            ])
            ->assertRedirect('/seller/vouchers');

        $voucher = Voucher::where('code', 'SELLER100')->firstOrFail();
        $this->assertSame($shop->id, $voucher->seller_id);
        $this->assertSame([$owned->id], $voucher->products()->pluck('products.id')->all());
        $this->assertDatabaseMissing('voucher_sellers', ['voucher_id' => $voucher->id]);
    }

    public function test_seller_can_create_all_products_voucher_without_writing_target_pivots(): void
    {
        Role::findOrCreate('seller', 'web');
        $seller = User::factory()->create();
        $seller->assignRole('seller');
        $shop = $this->makeShop($seller, 'seller-all-voucher-shop');

        $this->actingAs($seller)
            ->from('/seller/vouchers')
            ->post(route('seller.vouchers.store'), [
                'name' => 'All products offer',
                'code' => 'ALLPRODUCTS10',
                'type' => 'fixed',
                'discount_value' => 10,
                'minimum_spend' => 0,
                'apply_to' => 'all',
                'customer_eligibility' => 'all',
                'is_active' => false,
            ])
            ->assertRedirect('/seller/vouchers');

        $voucher = Voucher::where('code', 'ALLPRODUCTS10')->firstOrFail();
        $this->assertSame($shop->id, $voucher->seller_id);
        $this->assertDatabaseMissing('voucher_products', ['voucher_id' => $voucher->id]);
        $this->assertDatabaseMissing('voucher_categories', ['voucher_id' => $voucher->id]);
        $this->assertDatabaseMissing('voucher_variants', ['voucher_id' => $voucher->id]);
        $this->assertDatabaseMissing('voucher_sellers', ['voucher_id' => $voucher->id]);
    }

    public function test_voucher_create_and_update_support_legacy_required_value_column(): void
    {
        Role::findOrCreate('seller', 'web');
        $seller = User::factory()->create();
        $seller->assignRole('seller');
        $shop = $this->makeShop($seller, 'seller-legacy-voucher-shop');

        Schema::table('vouchers', function ($table) {
            $table->decimal('value', 12, 2);
            $table->string('created_by_role');
        });

        $this->actingAs($seller)
            ->from('/seller/vouchers')
            ->post(route('seller.vouchers.store'), [
                'name' => 'Legacy schema offer',
                'code' => 'LEGACYVALUE10',
                'type' => 'fixed',
                'discount_value' => 10,
                'minimum_spend' => 0,
                'apply_to' => 'all',
                'customer_eligibility' => 'all',
                'is_active' => true,
            ])
            ->assertRedirect('/seller/vouchers');

        $voucher = Voucher::where('code', 'LEGACYVALUE10')->firstOrFail();
        $this->assertEquals(10, $voucher->value);
        $this->assertSame('seller', $voucher->created_by_role);

        $this->actingAs($seller)
            ->from('/seller/vouchers')
            ->patch(route('seller.vouchers.update', $voucher), [
                'name' => 'Legacy schema offer',
                'code' => 'LEGACYVALUE10',
                'type' => 'fixed',
                'discount_value' => 25,
                'minimum_spend' => 0,
                'apply_to' => 'all',
                'customer_eligibility' => 'all',
                'is_active' => true,
            ])
            ->assertRedirect('/seller/vouchers');

        $this->assertEquals(25, $voucher->fresh()->value);
        $this->assertSame($shop->id, $voucher->fresh()->seller_id);
    }

    private function makeShop(User $user, string $slug): Shop
    {
        return Shop::create(['user_id' => $user->id, 'name' => $slug, 'slug' => $slug]);
    }

    private function makeProduct(Shop $shop, Category $category, string $name): Product
    {
        return Product::create([
            'shop_id' => $shop->id,
            'seller_id' => $shop->id,
            'category_id' => $category->id,
            'name' => $name,
            'slug' => strtolower(str_replace(' ', '-', $name)).'-'.uniqid(),
            'description' => $name,
            'base_price' => 100,
            'sku' => strtoupper(substr($name, 0, 3)).'-'.uniqid(),
            'stock_quantity' => 10,
            'status' => 'published',
            'is_active' => true,
            'is_approved' => true,
        ]);
    }
}
