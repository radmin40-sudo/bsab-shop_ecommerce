<?php

namespace Tests\Feature;

use App\Models\Shop;
use App\Models\User;
use Database\Seeders\SharingAgentProductsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SharingAgentProductsSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_products_reference_their_shop_for_seller_id(): void
    {
        $existingSeller = User::factory()->create();
        Shop::create([
            'id' => 50,
            'user_id' => $existingSeller->id,
            'name' => 'Existing shop',
            'slug' => 'existing-shop',
        ]);

        $this->seed(SharingAgentProductsSeeder::class);

        $shop = Shop::query()->where('slug', 'sharingagent')->firstOrFail();
        $this->assertDatabaseHas('products', [
            'shop_id' => $shop->id,
            'seller_id' => $shop->id,
        ]);
        $this->assertSame(20, $shop->products()->count());
    }
}
