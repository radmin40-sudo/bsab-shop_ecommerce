<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('role', 'customer')
            ->whereIn('id', function ($query) {
                $query->select('model_id')
                    ->from('model_has_roles')
                    ->where('model_type', 'App\\Models\\User')
                    ->whereIn('role_id', function ($roleQuery) {
                        $roleQuery->select('id')
                            ->from('roles')
                            ->where('name', 'seller')
                            ->where('guard_name', 'web');
                    });
            })
            ->update(['role' => 'seller']);
    }

    public function down(): void
    {
    }
};