<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CustomerFavoritesTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_add_and_remove_a_product_from_database_favorites(): void
    {
        Role::findOrCreate('customer', 'web');
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        $seller = User::factory()->create();
        $shop = Shop::create([
            'user_id' => $seller->id,
            'name' => 'Favorites test shop',
            'slug' => 'favorites-test-shop',
        ]);
        $category = Category::create([
            'name' => 'Favorites test category',
            'slug' => 'favorites-test-category',
        ]);
        $product = Product::create([
            'shop_id' => $shop->id,
            'seller_id' => $shop->id,
            'category_id' => $category->id,
            'name' => 'Favorites test product',
            'slug' => 'favorites-test-product',
            'description' => 'A product used to test customer favorites.',
            'base_price' => 100,
            'sku' => 'FAVORITES-TEST-001',
            'status' => 'published',
            'is_approved' => true,
        ]);

        $this->actingAs($customer)
            ->from(route('customer.products'))
            ->post(route('customer.favorites.toggle', $product))
            ->assertRedirect(route('customer.products'));

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($customer)
            ->get(route('customer.favorites'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('customer/favorites')
                ->has('products', 1)
                ->where('products.0.id', $product->id));

        $this->actingAs($customer)
            ->get(route('products.show', $product))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('product.is_favorited', true));

        $this->actingAs($customer)
            ->from(route('customer.favorites'))
            ->post(route('customer.favorites.toggle', $product))
            ->assertRedirect(route('customer.favorites'));

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($customer)
            ->get(route('customer.favorites'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('customer/favorites')
                ->has('products', 0));
    }
}
