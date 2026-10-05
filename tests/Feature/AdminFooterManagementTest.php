<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminFooterManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_footer_links_and_public_pages(): void
    {
        Role::findOrCreate('admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->get(route('admin.footer'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('admin/footer')
                ->where('siteSettings.footer_links.customer_care.0.label', 'Help Center')
                ->has('siteSettings.footer_pages', 9));

        $this->actingAs($admin)
            ->put(route('admin.footer.update'), [
                'footer_text' => '© BSABShop',
                'footer_tagline' => 'Shop thoughtfully.',
                'footer_quick_links_title' => 'Explore',
                'footer_care_title' => 'Support',
                'footer_about_title' => 'Company',
                'footer_install_title' => 'Get the app',
                'footer_install_text' => 'Install our app.',
                'footer_install_button' => 'Download',
                'footer_links' => [
                    'quick_links' => [['label' => 'Catalog', 'href' => '/marketplace']],
                    'customer_care' => [['label' => 'Help', 'href' => '/pages/help']],
                    'about' => [['label' => 'Our story', 'href' => 'https://example.com/story']],
                ],
                'footer_pages' => [
                    ['title' => 'Help', 'slug' => 'help', 'content' => "Get support.\nWe are here to help."],
                ],
            ])
            ->assertRedirect();

        $settings = SiteSetting::homeSettings();
        $this->assertSame('© BSABShop', $settings['footer_text']);
        $this->assertSame('Catalog', $settings['footer_links']['quick_links'][0]['label']);
        $this->assertSame('https://example.com/story', $settings['footer_links']['about'][0]['href']);
        $this->assertSame('help', $settings['footer_pages'][0]['slug']);

        $this->get(route('footer-pages.show', ['slug' => 'help']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('footer-page')
                ->where('footerPage.title', 'Help')
                ->where('footerPage.content', "Get support.\nWe are here to help."));

        $this->get(route('footer-pages.show', ['slug' => 'missing-page']))->assertNotFound();
    }

    public function test_footer_admin_routes_require_an_admin_role(): void
    {
        $this->get(route('admin.footer'))->assertRedirect(route('login'));
    }

    public function test_return_policy_uses_its_dedicated_public_page(): void
    {
        $this->get(route('footer-pages.show', ['slug' => 'return-policy']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('return-policy')
                ->where('footerPage.title', 'Return Policy'));
    }

    public function test_team_developers_page_uses_editable_footer_team_members(): void
    {
        $this->get(route('footer-pages.show', ['slug' => 'web-dev']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('web-dev')
                ->where('footerPage.title', 'Team Developers')
                ->where('footerPage.team_members.2.name', 'Joshua Macahipay'));

        Role::findOrCreate('admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $teamPage = collect(SiteSetting::defaults()['footer_pages'])->firstWhere('slug', 'web-dev');
        $teamPage['team_members'][2]['name'] = 'Updated Team Leader';

        $this->actingAs($admin)
            ->put(route('admin.footer.update'), [
                'footer_text' => 'Footer',
                'footer_tagline' => 'Tagline',
                'footer_quick_links_title' => 'Quick links',
                'footer_care_title' => 'Customer care',
                'footer_about_title' => 'About',
                'footer_install_title' => 'Install',
                'footer_install_text' => 'Install our app.',
                'footer_install_button' => 'Download',
                'footer_links' => ['quick_links' => [], 'customer_care' => [], 'about' => []],
                'footer_pages' => [$teamPage],
            ])
            ->assertRedirect();

        $this->get(route('footer-pages.show', ['slug' => 'web-dev']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('footerPage.team_members.2.name', 'Updated Team Leader'));
    }

    public function test_footer_links_reject_unsafe_schemes(): void
    {
        Role::findOrCreate('admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->put(route('admin.footer.update'), [
                'footer_text' => 'Footer',
                'footer_tagline' => 'Tagline',
                'footer_quick_links_title' => 'Quick links',
                'footer_care_title' => 'Customer care',
                'footer_about_title' => 'About',
                'footer_install_title' => 'Install',
                'footer_install_text' => 'Install our app.',
                'footer_install_button' => 'Download',
                'footer_links' => [
                    'quick_links' => [['label' => 'Unsafe', 'href' => 'javascript:alert(1)']],
                    'customer_care' => [],
                    'about' => [],
                ],
                'footer_pages' => [],
            ])
            ->assertSessionHasErrors('footer_links.quick_links.0.href');
    }

    public function test_page_content_is_saved_independently_with_uploaded_images(): void
    {
        Storage::fake('public');
        Role::findOrCreate('admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $pages = SiteSetting::defaults()['footer_pages'];
        SiteSetting::updateOrCreate(
            ['key' => 'footer_pages'],
            ['value' => json_encode($pages, JSON_THROW_ON_ERROR)],
        );

        $returnPage = collect($pages)->firstWhere('slug', 'return-policy');
        $privacyPage = collect($pages)->firstWhere('slug', 'privacy-policy');
        $this->actingAs($admin)
            ->put(route('admin.footer.pages.update', ['slug' => 'return-policy']), [
                'title' => 'Updated Return Policy',
                'content' => 'Updated return introduction.',
                'content_sections' => $returnPage['content_sections'],
                'hero_image' => UploadedFile::fake()->create('return-hero.jpg', 50, 'image/jpeg'),
            ])
            ->assertRedirect()
            ->assertSessionHas('pageSaved', 'return-policy');

        $savedPages = SiteSetting::homeSettings()['footer_pages'];
        $this->assertSame('Updated Return Policy', collect($savedPages)->firstWhere('slug', 'return-policy')['title']);
        $this->assertSame($privacyPage['title'], collect($savedPages)->firstWhere('slug', 'privacy-policy')['title']);
        $imagePath = collect($savedPages)->firstWhere('slug', 'return-policy')['hero_image_path'];
        $this->assertNotEmpty($imagePath);
        Storage::disk('public')->assertExists($imagePath);

        $this->get(route('footer-pages.show', ['slug' => 'return-policy']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('return-policy')
                ->where('footerPage.title', 'Updated Return Policy')
                ->where('footerPage.hero_image_path', $imagePath));
    }

    public function test_page_content_update_requires_admin_and_valid_image(): void
    {
        $payload = [
            'title' => 'Return Policy',
            'content' => 'Return information.',
            'hero_image' => UploadedFile::fake()->create('malware.txt', 10, 'text/plain'),
        ];

        $this->put(route('admin.footer.pages.update', ['slug' => 'return-policy']), $payload)
            ->assertRedirect(route('login'));

        Role::findOrCreate('admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->put(route('admin.footer.pages.update', ['slug' => 'return-policy']), $payload)
            ->assertSessionHasErrors('hero_image');
    }
}
