<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('customer')->after('email');
        });

        DB::statement("UPDATE users SET role = 'admin' WHERE id IN (SELECT model_id FROM model_has_roles WHERE model_type = 'App\\\\Models\\\\User' AND role_id IN (SELECT id FROM roles WHERE name = 'admin'))");
        DB::statement("UPDATE users SET role = 'seller' WHERE role = 'customer' AND id IN (SELECT model_id FROM model_has_roles WHERE model_type = 'App\\\\Models\\\\User' AND role_id IN (SELECT id FROM roles WHERE name = 'seller'))");
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
