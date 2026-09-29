<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use App\Models\SiteSetting;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_admin_settings_page_exposes_database_storage_status_for_media(): void
    {
        Role::findOrCreate('admin', 'web');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        SiteSetting::updateOrCreate(['key' => 'login_background_path'], ['value' => 'site/login-background.jpg']);
        SiteSetting::updateOrCreate(['key' => 'hero_media_path'], ['value' => 'site/hero-video.mp4']);
        SiteSetting::updateOrCreate(['key' => 'hero_media_type'], ['value' => 'video']);

        $response = $this->withServerVariables([
            'REMOTE_ADDR' => '127.0.0.1',
            'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0',
            'HTTP_SEC_CH_UA_MODEL' => '"realme C11 Y"',
        ])->actingAs($admin)
            ->get(route('admin.settings'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('storageStatus.login_background_path.inDatabase', true)
                ->where('storageStatus.login_background_path.value', 'site/login-background.jpg')
                ->where('storageStatus.hero_media_path.inDatabase', true)
                ->where('storageStatus.hero_media_path.value', 'site/hero-video.mp4')
            );

            $this->assertSame('Sec-CH-UA-Model', $response->headers->get('Accept-CH'));
            $this->assertSame('ch-ua-model=(self)', $response->headers->get('Permissions-Policy'));

            $activity = ActivityLog::query()->where('action', 'Viewed admin settings')->latest('id')->firstOrFail();

            $this->assertSame($admin->id, $activity->user_id);
            $this->assertSame('127.0.0.1', $activity->metadata['ip_address']);
            $this->assertSame('realme C11 Y', $activity->metadata['device']);
            $this->assertSame('Microsoft Edge', $activity->metadata['browser']);
            $this->assertSame('Windows', $activity->metadata['operating_system']);
    }

    public function test_admin_can_upload_login_background_and_hero_media(): void
    {
        Role::findOrCreate('admin', 'web');

        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Storage::fake('public');

        $this->actingAs($admin)
            ->from('/admin/settings')
            ->post(route('admin.settings.home-content'), [
                'login_background' => UploadedFile::fake()->create('login-background.jpg', 100, 'image/jpeg'),
                'hero_media' => UploadedFile::fake()->create('hero-media.jpg', 100, 'image/jpeg'),
            ])
            ->assertRedirect('/admin/settings');

        $loginPath = SiteSetting::where('key', 'login_background_path')->value('value');
        $heroPath = SiteSetting::where('key', 'hero_media_path')->value('value');

        $this->assertNotEmpty($loginPath);
        $this->assertNotEmpty($heroPath);
        $this->assertTrue(Storage::disk('public')->exists($loginPath));
        $this->assertTrue(Storage::disk('public')->exists($heroPath));
        $this->assertSame('image', SiteSetting::where('key', 'hero_media_type')->value('value'));
    }
}
