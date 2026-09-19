<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use App\Models\SiteSetting;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminSettingsBulkActionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_delete_all_categories_from_settings(): void
    {
        Role::findOrCreate('admin', 'web');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Category::create(['name' => 'Menswear', 'slug' => 'menswear']);
        Category::create(['name' => 'Electronics', 'slug' => 'electronics']);

        $this->actingAs($admin)
            ->from('/admin/settings')
            ->post(route('admin.settings.categories.clear'))
            ->assertRedirect('/admin/settings');

        $this->assertSame(0, Category::count());
    }

    public function test_admin_can_delete_all_products_from_settings(): void
    {
        Role::findOrCreate('admin', 'web');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $shop = Shop::create([
            'user_id' => $admin->id,
            'name' => 'Main Store',
            'slug' => 'main-store',
        ]);

        Product::create([
            'shop_id' => $shop->id,
            'category_id' => null,
            'name' => 'Widget One',
            'slug' => 'widget-one',
            'base_price' => 19.99,
            'sku' => 'WIDGET-ONE',
        ]);

        Product::create([
            'shop_id' => $shop->id,
            'category_id' => null,
            'name' => 'Widget Two',
            'slug' => 'widget-two',
            'base_price' => 29.99,
            'sku' => 'WIDGET-TWO',
        ]);

        $this->actingAs($admin)
            ->from('/admin/settings')
            ->post(route('admin.settings.products.clear'))
            ->assertRedirect('/admin/settings');

        $this->assertSame(0, Product::count());
    }

    public function test_admin_can_permanently_delete_all_orders_from_settings(): void
    {
        Role::findOrCreate('admin', 'web');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $activeOrder = Order::create([
            'order_number' => 'ORDER-ACTIVE',
            'user_id' => $admin->id,
            'shipping_address' => ['line1' => 'Main Street'],
        ]);
        $archivedOrder = Order::create([
            'order_number' => 'ORDER-ARCHIVED',
            'user_id' => $admin->id,
            'shipping_address' => ['line1' => 'Main Street'],
        ]);
        $archivedOrder->delete();

        $this->actingAs($admin)
            ->from('/admin/settings')
            ->post(route('admin.settings.orders.clear'))
            ->assertRedirect('/admin/settings');

        $this->assertSame(0, Order::withTrashed()->count());
        $this->assertDatabaseMissing('orders', ['id' => $activeOrder->id]);
    }

    public function test_admin_can_delete_all_vouchers_from_settings(): void
    {
        Role::findOrCreate('admin', 'web');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Voucher::create([
            'code' => 'WELCOME10',
            'type' => 'fixed',
            'value' => 10,
            'created_by_role' => 'admin',
        ]);

        $this->actingAs($admin)
            ->from('/admin/settings')
            ->post(route('admin.settings.vouchers.clear'))
            ->assertRedirect('/admin/settings');

        $this->assertSame(0, Voucher::count());
    }

    public function test_admin_settings_page_exposes_database_storage_status_for_media(): void
    {
        Role::findOrCreate('admin', 'web');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        SiteSetting::updateOrCreate(['key' => 'login_background_path'], ['value' => 'site/login-background.jpg']);
        SiteSetting::updateOrCreate(['key' => 'hero_media_path'], ['value' => 'site/hero-video.mp4']);
        SiteSetting::updateOrCreate(['key' => 'hero_media_type'], ['value' => 'video']);

        $this->actingAs($admin)
            ->get(route('admin.settings'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('storageStatus.login_background_path.inDatabase', true)
                ->where('storageStatus.login_background_path.value', 'site/login-background.jpg')
                ->where('storageStatus.hero_media_path.inDatabase', true)
                ->where('storageStatus.hero_media_path.value', 'site/hero-video.mp4')
            );
    }

    public function test_admin_can_store_login_background_and_hero_media_files(): void
    {
        Role::findOrCreate('admin', 'web');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->from('/admin/settings')
            ->post(route('admin.settings.home-content'), [
                'brand_name' => 'BSABShop',
                'login_background' => UploadedFile::fake()->image('login-bg.png', 1200, 900),
                'hero_media' => UploadedFile::fake()->create('hero-video.mp4', 1024, 'video/mp4'),
                'hero_title' => 'Best picks.',
                'hero_highlight' => 'Best prices.',
                'hero_description' => 'Discover products from every category.',
            ])
            ->assertRedirect('/admin/settings');

        $this->assertNotNull(SiteSetting::where('key', 'login_background_path')->value('value'));
        $this->assertNotNull(SiteSetting::where('key', 'hero_media_path')->value('value'));
        $this->assertSame('video', SiteSetting::where('key', 'hero_media_type')->value('value'));
    }
}
