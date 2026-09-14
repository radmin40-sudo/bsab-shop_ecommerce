<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        $defaults = [
            ['key' => 'brand_name', 'value' => 'BSABShop'],
            ['key' => 'logo_path', 'value' => null],
            ['key' => 'hero_title', 'value' => 'Best picks.'],
            ['key' => 'hero_highlight', 'value' => 'Best prices.'],
            ['key' => 'hero_description', 'value' => 'Discover products from every category, curated by our marketplace sellers.'],
            ['key' => 'cta_label', 'value' => 'Shop now'],
            ['key' => 'footer_text', 'value' => '© 2026 BSABShop Marketplace - every price, checked twice.'],
        ];

        foreach ($defaults as $item) {
            DB::table('site_settings')->insert($item);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
