<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $defaults = [
            ['key' => 'hero_media_path', 'value' => null],
            ['key' => 'hero_media_type', 'value' => null],
            ['key' => 'feature_one', 'value' => 'Fresh & Quality Products'],
            ['key' => 'feature_two', 'value' => 'Trusted Sellers'],
            ['key' => 'feature_three', 'value' => 'Fast & Safe Delivery'],
            ['key' => 'products_title', 'value' => 'Featured Products'],
            ['key' => 'products_subtitle', 'value' => 'Handpicked for you. Quality products at the best prices.'],
            ['key' => 'footer_tagline', 'value' => 'A greener marketplace for a better tomorrow.'],
            ['key' => 'footer_quick_links_title', 'value' => 'Quick Links'],
            ['key' => 'footer_care_title', 'value' => 'Customer Care'],
            ['key' => 'footer_about_title', 'value' => 'About our marketplace'],
            ['key' => 'footer_newsletter_title', 'value' => 'Stay in the loop'],
            ['key' => 'footer_newsletter_text', 'value' => 'Get the latest deals and updates.'],
            ['key' => 'newsletter_placeholder', 'value' => 'Enter your email address'],
        ];

        foreach ($defaults as $item) {
            DB::table('site_settings')->updateOrInsert(['key' => $item['key']], $item);
        }
    }

    public function down(): void
    {
        DB::table('site_settings')->whereIn('key', [
            'hero_media_path', 'hero_media_type', 'feature_one', 'feature_two', 'feature_three',
            'products_title', 'products_subtitle', 'footer_tagline', 'footer_quick_links_title',
            'footer_care_title', 'footer_about_title', 'footer_newsletter_title', 'footer_newsletter_text',
            'newsletter_placeholder',
        ])->delete();
    }
};
