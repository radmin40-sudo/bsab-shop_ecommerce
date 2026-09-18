<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (! Schema::hasColumn('payments', 'gcash_account_name')) {
                $table->string('gcash_account_name')->nullable()->after('status');
            }

            if (! Schema::hasColumn('payments', 'gcash_mobile_number')) {
                $table->string('gcash_mobile_number')->nullable()->after('gcash_account_name');
            }

            if (! Schema::hasColumn('payments', 'gcash_qr_code')) {
                $table->string('gcash_qr_code')->nullable()->after('gcash_mobile_number');
            }

            if (! Schema::hasColumn('payments', 'gcash_reference_number')) {
                $table->string('gcash_reference_number')->nullable()->after('gcash_qr_code');
            }

            if (! Schema::hasColumn('payments', 'receipt_path')) {
                $table->string('receipt_path')->nullable()->after('gcash_reference_number');
            }

            if (! Schema::hasColumn('payments', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('receipt_path');
            }

            if (! Schema::hasColumn('payments', 'verified_by')) {
                $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete()->after('verified_at');
            }

            if (! Schema::hasColumn('payments', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('verified_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $columns = ['gcash_account_name', 'gcash_mobile_number', 'gcash_qr_code', 'gcash_reference_number', 'receipt_path', 'verified_at', 'verified_by', 'rejection_reason'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('payments', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
