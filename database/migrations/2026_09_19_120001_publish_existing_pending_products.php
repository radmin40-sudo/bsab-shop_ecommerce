<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('products')
            ->where('status', 'pending')
            ->whereNull('deleted_at')
            ->update([
                'status' => 'published',
                'is_approved' => true,
                'updated_at' => new Expression('CURRENT_TIMESTAMP'),
            ]);
    }

    public function down(): void
    {
    }
};
