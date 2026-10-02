<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('vouchers')) {
            throw new RuntimeException('The vouchers table must exist before its columns can be reconciled.');
        }

        Schema::table('vouchers', function (Blueprint $table) {
            if (! Schema::hasColumn('vouchers', 'seller_id')) {
                $table->foreignId('seller_id')->nullable()->constrained('shops')->nullOnDelete();
            }
            if (! Schema::hasColumn('vouchers', 'name')) {
                $table->string('name')->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'code')) {
                $table->string('code')->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'type')) {
                $table->string('type')->default('fixed');
            }
            if (! Schema::hasColumn('vouchers', 'discount_value')) {
                $table->decimal('discount_value', 12, 2)->default(0);
            }
            if (! Schema::hasColumn('vouchers', 'minimum_spend')) {
                $table->decimal('minimum_spend', 12, 2)->default(0);
            }
            if (! Schema::hasColumn('vouchers', 'maximum_discount')) {
                $table->decimal('maximum_discount', 12, 2)->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'apply_to')) {
                $table->string('apply_to')->default('all');
            }
            if (! Schema::hasColumn('vouchers', 'customer_eligibility')) {
                $table->string('customer_eligibility')->default('all');
            }
            if (! Schema::hasColumn('vouchers', 'starts_at')) {
                $table->timestamp('starts_at')->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'expires_at')) {
                $table->timestamp('expires_at')->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'total_usage_limit')) {
                $table->unsignedInteger('total_usage_limit')->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'per_customer_usage_limit')) {
                $table->unsignedInteger('per_customer_usage_limit')->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'claim_limit')) {
                $table->unsignedInteger('claim_limit')->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'requires_claim')) {
                $table->boolean('requires_claim')->default(false);
            }
            if (! Schema::hasColumn('vouchers', 'free_shipping')) {
                $table->boolean('free_shipping')->default(false);
            }
            if (! Schema::hasColumn('vouchers', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
            if (! Schema::hasColumn('vouchers', 'description')) {
                $table->text('description')->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'terms')) {
                $table->text('terms')->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
            if (! Schema::hasColumn('vouchers', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        // Keep reconciled columns in place to avoid deleting data written after this migration.
    }
};
