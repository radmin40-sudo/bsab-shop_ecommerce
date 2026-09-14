<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Services\ProductVariantService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SellerProductOptionVariantGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_variant_service_normalizes_weight_and_quantity_units(): void
    {
        $service = new ProductVariantService;

        $groups = $service->parseOptionGroups("Size: S, M, L\nColor: Red, Blue\nLength: Short, Long\nWeight: 500 g, 1 kilograms, 2kg\nQuantity: 1 kg, 2 kilograms");

        $this->assertSame('Size', $groups[0][0]);
        $this->assertSame(['S', 'M', 'L'], $groups[0][1]);
        $this->assertSame('Color', $groups[1][0]);
        $this->assertSame(['Red', 'Blue'], $groups[1][1]);
        $this->assertSame('Length', $groups[2][0]);
        $this->assertSame(['Short', 'Long'], $groups[2][1]);
        $this->assertSame('Weight', $groups[3][0]);
        $this->assertSame(['500g', '1kg', '2kg'], $groups[3][1]);
        $this->assertSame('Quantity', $groups[4][0]);
        $this->assertSame(['1kg', '2kg'], $groups[4][1]);
    }

    public function test_seller_cannot_create_a_product_without_variant_options(): void
    {
        Role::findOrCreate('seller');

        $user = User::factory()->create();
        $user->assignRole('seller');

        $category = Category::create([
            'name' => 'Fashion',
            'slug' => 'fashion-'.uniqid(),
            'image' => null,
        ]);

        $response = $this->actingAs($user, 'web')
            ->post('/seller/products', [
                'category_id' => $category->id,
                'name' => 'Simple Shirt',
                'description' => 'A basic shirt',
                'base_price' => '100.00',
                'sale_price' => '90.00',
                'sku' => 'SHIRT-'.uniqid(),
                'stock_quantity' => '50',
                'product_options' => '',
            ]);

        $response->assertSessionHasErrors('product_options');
        $this->assertDatabaseMissing('products', ['name' => 'Simple Shirt']);
    }

    public function test_seller_can_create_product_options_and_generate_matching_variants(): void
    {
        Role::findOrCreate('seller');

        $user = User::factory()->create();
        $user->assignRole('seller');

        $category = Category::create([
            'name' => 'Fashion',
            'slug' => 'fashion-'.uniqid(),
            'image' => null,
        ]);

        $response = $this->actingAs($user, 'web')
            ->post('/seller/products', [
                'category_id' => $category->id,
                'name' => 'Dressable Combo',
                'description' => 'A dress',
                'base_price' => '100.00',
                'sale_price' => '90.00',
                'stock_quantity' => '100',
                'product_options' => "Color: Red, Blue\nSize: M, L",
            ]);

        $response->assertRedirect(route('seller.products'));

        $product = Product::query()->where('name', 'Dressable Combo')->firstOrFail();

        $this->assertMatchesRegularExpression('/^DRESSABLE-COMBO-[A-Z0-9]{6}$/', $product->sku);
        $this->assertMatchesRegularExpression('/^20\d{11}$/', $product->barcode);
        $this->assertEquals(2, $product->options()->count());
        $this->assertEquals(4, $product->optionValues()->count());
        $this->assertEquals(4, $product->variants()->count());
    }

    public function test_seller_variant_sync_can_recreate_default_variant_without_duplicate_sku_collision(): void
    {
        Role::findOrCreate('seller');

        $user = User::factory()->create();
        $user->assignRole('seller');

        $category = Category::create([
            'name' => 'Fashion',
            'slug' => 'fashion-'.uniqid(),
            'image' => null,
        ]);

        $shop = $user->shop()->create([
            'name' => $user->name.' Shop',
            'slug' => 'shop-'.uniqid(),
            'status' => 'approved',
            'commission_rate' => 10,
        ]);

        $product = Product::query()->create([
            'shop_id' => $shop->id,
            'seller_id' => $user->id,
            'category_id' => $category->id,
            'name' => 'Duplicate Sku Shirt',
            'slug' => 'duplicate-sku-shirt-'.uniqid(),
            'description' => 'Regenerate the default variant.',
            'base_price' => '100.00',
            'sale_price' => '90.00',
            'sku' => 'DUPLICATE-SKU-SHIRT-'.uniqid(),
            'stock_quantity' => '50',
            'status' => 'draft',
            'is_active' => true,
        ]);

        $service = new ProductVariantService;

        $service->syncFromOptionSpec($product, '');
        $service->syncFromOptionSpec($product, '');

        $this->assertEquals(1, $product->fresh()->variants()->count());
    }

    public function test_seller_can_upload_multiple_images_and_a_short_video(): void
    {
        Role::findOrCreate('seller');

        $user = User::factory()->create();
        $user->assignRole('seller');

        $category = Category::create([
            'name' => 'Fashion',
            'slug' => 'fashion-'.uniqid(),
            'image' => null,
        ]);

        Storage::fake('public');

        $response = $this->actingAs($user, 'web')
            ->post('/seller/products', [
                'category_id' => $category->id,
                'name' => 'Video Combo Shirt',
                'description' => 'A video-enabled shirt',
                'base_price' => '100.00',
                'sale_price' => '90.00',
                'sku' => 'VIDEO-SHIRT-'.uniqid(),
                'stock_quantity' => '50',
                'product_options' => 'Color: Red, Blue',
                'images' => [
                    UploadedFile::fake()->create('one.png', 64, 'image/png'),
                    UploadedFile::fake()->create('two.png', 64, 'image/png'),
                ],
                'product_video' => UploadedFile::fake()->create('demo.mp4', 64, 'video/mp4'),
            ]);

        $response->assertRedirect(route('seller.products'));

        $product = Product::query()->where('name', 'Video Combo Shirt')->firstOrFail();

        $this->assertEquals(2, $product->images()->count());
        $this->assertNotNull($product->short_video_path);
    }
}
