<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            if (! Schema::hasColumn('shops', 'gcash_enabled')) {
                $table->boolean('gcash_enabled')->default(false)->after('payout_details');
            }

            if (! Schema::hasColumn('shops', 'gcash_account_name')) {
                $table->string('gcash_account_name')->nullable()->after('gcash_enabled');
            }

            if (! Schema::hasColumn('shops', 'gcash_mobile_number')) {
                $table->string('gcash_mobile_number')->nullable()->after('gcash_account_name');
            }

            if (! Schema::hasColumn('shops', 'gcash_qr_code')) {
                $table->string('gcash_qr_code')->nullable()->after('gcash_mobile_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->dropColumn(['gcash_enabled', 'gcash_account_name', 'gcash_mobile_number', 'gcash_qr_code']);
        });
    }
};
