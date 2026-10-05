<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('delivery_zones')->insertOrIgnore([
            'name' => 'Purok 1',
            'barangay' => 'Purok 1',
            'description' => 'Local delivery within Purok 1, Hinoba-an.',
            'delivery_fee' => 0,
            'is_free_delivery' => true,
            'free_delivery_minimum' => null,
            'estimated_delivery_min' => null,
            'estimated_delivery_max' => null,
            'estimated_delivery_text' => 'Same day–2 days',
            'status' => 'active',
            'sort_order' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        DB::table('delivery_zones')
            ->where('name', 'Purok 1')
            ->where('barangay', 'Purok 1')
            ->where('delivery_fee', 0)
            ->where('is_free_delivery', true)
            ->where('status', 'active')
            ->delete();
    }
};
