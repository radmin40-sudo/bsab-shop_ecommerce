<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function defaults(): array
    {
        return [
            'brand_name' => 'BSABShop',
            'logo_path' => null,
            'login_background_path' => null,
            'hero_media_path' => null,
            'hero_media_type' => null,
            'hero_title' => 'Best picks.',
            'hero_highlight' => 'Best prices.',
            'hero_description' => 'Discover products from every category, curated by our marketplace sellers.',
            'cta_label' => 'Shop now',
            'feature_one' => 'Fresh & Quality Products',
            'feature_two' => 'Trusted Sellers',
            'feature_three' => 'Fast & Safe Delivery',
            'products_title' => 'Featured Products',
            'products_subtitle' => 'Handpicked for you. Quality products at the best prices.',
            'footer_text' => '© 2026 BSABShop Marketplace - every price, checked twice.',
            'footer_tagline' => 'A greener marketplace for a better tomorrow.',
            'footer_quick_links_title' => 'Quick Links',
            'footer_care_title' => 'Customer Care',
            'footer_about_title' => 'About our marketplace',
            'footer_newsletter_title' => 'Stay in the loop',
            'footer_newsletter_text' => 'Get the latest deals and updates.',
            'newsletter_placeholder' => 'Enter your email address',
        ];
    }

    public static function homeSettings(): array
    {
        $settings = self::query()->pluck('value', 'key')->all();

        if (! empty($settings['logo_path']) && ! self::isExternalPath($settings['logo_path']) && ! Storage::disk('public')->exists($settings['logo_path'])) {
            $settings['logo_path'] = null;
        }

        return array_merge(self::defaults(), array_intersect_key($settings, self::defaults()));
    }

    public static function mediaStorageStatus(): array
    {
        $keys = ['logo_path', 'login_background_path', 'hero_media_path'];

        return collect($keys)->mapWithKeys(function (string $key) {
            $value = self::query()->where('key', $key)->value('value');

            return [
                $key => [
                    'key' => $key,
                    'value' => $value,
                    'inDatabase' => $value !== null,
                    'existsOnDisk' => $value === null || self::isExternalPath($value) || Storage::disk('public')->exists($value),
                ],
            ];
        })->all();
    }

    private static function isExternalPath(string $path): bool
    {
        return str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/');
    }
}
