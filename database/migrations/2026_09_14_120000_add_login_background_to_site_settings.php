<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('site_settings')->updateOrInsert(
            ['key' => 'login_background_path'],
            ['value' => null]
        );
    }

    public function down(): void
    {
        DB::table('site_settings')->where('key', 'login_background_path')->delete();
    }
};
