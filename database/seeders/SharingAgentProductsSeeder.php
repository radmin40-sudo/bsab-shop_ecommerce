<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class SharingAgentProductsSeeder extends Seeder
{
    public function run(): void
    {
        $seller = User::updateOrCreate(
            ['email' => 'sharingagent@example.com'],
            [
                'name' => 'SharingAgent',
                'password' => 'SharingAgent123!',
                'email_verified_at' => now(),
                'role' => 'seller',
                'status' => 'active',
                'must_change_password' => false,
            ],
        );

        $seller->syncRoles([Role::findOrCreate('seller', 'web')]);

        $shop = Shop::updateOrCreate(
            ['user_id' => $seller->id],
            [
                'name' => 'SharingAgent',
                'slug' => 'sharingagent',
                'description' => 'Sample marketplace shop for the SharingAgent demo catalog.',
                'status' => 'approved',
                'commission_rate' => 10,
            ],
        );

        $categories = [
            'Electronics',
            'Fashion',
            'Home',
            'Health',
            'Beauty',
            'Sports',
            'Books',
            'Groceries',
            'Office',
            'Toys',
        ];

        $categoryIds = [];

        foreach ($categories as $categoryName) {
            $slug = Str::slug($categoryName);
            $category = Category::updateOrCreate(
                ['slug' => $slug],
                ['name' => $categoryName, 'slug' => $slug],
            );

            $categoryIds[] = $category->id;
        }

        $images = [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1512353087810-25dfcd100962?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80',
        ];

        $index = 0;

        foreach ($categoryIds as $categoryIndex => $categoryId) {
            for ($productNumber = 1; $productNumber <= 2; $productNumber++) {
                $productName = $categories[$categoryIndex].' '.($productNumber === 1 ? 'Essential' : 'Pro');
                $slug = Str::slug($productName.'-'.$categoryId.'-'.$productNumber);

                $product = Product::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'shop_id' => $shop->id,
                        'seller_id' => $seller->id,
                        'category_id' => $categoryId,
                        'name' => $productName,
                        'slug' => $slug,
                        'description' => 'A high-quality product from SharingAgent, ready for customers to discover and purchase.',
                        'condition' => 'new',
                        'authenticity_status' => 'verified',
                        'verification_status' => 'verified',
                        'base_price' => 199 + ($categoryIndex * 33) + ($productNumber * 29),
                        'currency' => 'PHP',
                        'sale_price' => 169 + ($categoryIndex * 29) + ($productNumber * 21),
                        'sku' => 'SA-'.str_pad((string) ($categoryIndex + 1), 2, '0', STR_PAD_LEFT).'-'.str_pad((string) $productNumber, 2, '0', STR_PAD_LEFT),
                        'brand' => 'SharingAgent',
                        'stock_quantity' => 25 + ($productNumber * 10),
                        'status' => 'published',
                        'is_approved' => true,
                        'is_active' => true,
                        'published_at' => now(),
                    ],
                );

                ProductImage::updateOrCreate(
                    ['product_id' => $product->id],
                    [
                        'path' => $images[$index % count($images)],
                        'is_primary' => true,
                        'sort_order' => 1,
                    ],
                );

                $index++;
            }
        }
    }
}
