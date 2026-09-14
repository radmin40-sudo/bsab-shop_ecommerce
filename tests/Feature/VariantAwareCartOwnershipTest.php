<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VariantAwareCartOwnershipTest extends TestCase
{
    use RefreshDatabase;

    public function test_rejects_a_cart_variant_that_does_not_belong_to_the_selected_product(): void
    {
        Role::findOrCreate('customer');

        $user = User::factory()->create();
        $user->assignRole('customer');

        $shop = Shop::create([
            'user_id' => $user->id,
            'name' => 'Acme Shop',
            'slug' => 'acme-shop-'.uniqid(),
            'status' => 'approved',
            'commission_rate' => 10,
        ]);

        $category = Category::create([
            'name' => 'Fashion',
            'slug' => 'fashion-'.uniqid(),
            'image' => null,
        ]);

        $productA = Product::create([
            'shop_id' => $shop->id,
            'category_id' => $category->id,
            'name' => 'Summer Dress',
            'slug' => 'summer-dress-'.uniqid(),
            'description' => 'A dress',
            'base_price' => 100,
            'sale_price' => null,
            'sku' => 'DRESS-'.uniqid(),
            'stock_quantity' => 10,
            'status' => 'published',
            'is_approved' => true,
            'condition' => 'new',
            'authenticity_status' => 'verified',
            'verification_status' => 'verified',
            'currency' => 'PHP',
        ]);

        $productB = Product::create([
            'shop_id' => $shop->id,
            'category_id' => $category->id,
            'name' => 'Summer Dress 2',
            'slug' => 'summer-dress-2-'.uniqid(),
            'description' => 'Another dress',
            'base_price' => 100,
            'sale_price' => null,
            'sku' => 'DRESS2-'.uniqid(),
            'stock_quantity' => 10,
            'status' => 'published',
            'is_approved' => true,
            'condition' => 'new',
            'authenticity_status' => 'verified',
            'verification_status' => 'verified',
            'currency' => 'PHP',
        ]);

        $foreignVariant = ProductVariant::create([
            'product_id' => $productB->id,
            'name' => 'Black / M',
            'sku' => 'BLACK-M-'.uniqid(),
            'price' => 100,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/customer/cart/items', [
                'product_id' => $productA->id,
                'variant_id' => $foreignVariant->id,
                'quantity' => 1,
            ]);

        $response->assertStatus(422);
    }
}
