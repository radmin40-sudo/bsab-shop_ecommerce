<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('vouchers')) {
            Schema::create('vouchers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('seller_id')->nullable()->constrained('shops')->nullOnDelete();
                $table->string('name');
                $table->string('code')->unique();
                $table->string('type')->index();
                $table->decimal('discount_value', 12, 2)->default(0);
                $table->decimal('minimum_spend', 12, 2)->default(0);
                $table->decimal('maximum_discount', 12, 2)->nullable();
                $table->string('apply_to')->default('all');
                $table->string('customer_eligibility')->default('all');
                $table->timestamp('starts_at')->nullable()->index();
                $table->timestamp('expires_at')->nullable()->index();
                $table->unsignedInteger('total_usage_limit')->nullable();
                $table->unsignedInteger('per_customer_usage_limit')->nullable();
                $table->unsignedInteger('claim_limit')->nullable();
                $table->boolean('requires_claim')->default(false);
                $table->boolean('free_shipping')->default(false);
                $table->boolean('is_active')->default(true)->index();
                $table->text('description')->nullable();
                $table->text('terms')->nullable();
                $table->timestamps();
                $table->index(['is_active', 'starts_at', 'expires_at']);
            });
        }

        foreach ([
            'voucher_products' => ['products', 'product_id'],
            'voucher_categories' => ['categories', 'category_id'],
            'voucher_sellers' => ['shops', 'seller_id'],
            'voucher_variants' => ['product_variants', 'product_variant_id'],
        ] as $tableName => [$relatedTable, $relatedKey]) {
            if (!Schema::hasTable($tableName)) {
                Schema::create($tableName, function (Blueprint $table) use ($relatedTable, $relatedKey) {
                    $table->id();
                    $table->foreignId('voucher_id')->constrained()->cascadeOnDelete();
                    $table->foreignId($relatedKey)->constrained($relatedTable)->cascadeOnDelete();
                    $table->timestamps();
                    $table->unique(['voucher_id', $relatedKey]);
                    $table->index($relatedKey);
                });
            }
        }

        if (!Schema::hasTable('voucher_claims')) {
            Schema::create('voucher_claims', function (Blueprint $table) {
                $table->id();
                $table->foreignId('voucher_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
                $table->string('status')->default('claimed')->index();
                $table->timestamp('claimed_at')->nullable();
                $table->timestamp('used_at')->nullable();
                $table->decimal('discount_amount', 12, 2)->default(0);
                $table->timestamps();
                $table->index(['voucher_id', 'user_id', 'status']);
            });
        }

        if (!Schema::hasTable('voucher_usages')) {
            Schema::create('voucher_usages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('voucher_id')->constrained()->restrictOnDelete();
                $table->foreignId('user_id')->constrained()->restrictOnDelete();
                $table->foreignId('order_id')->constrained()->cascadeOnDelete();
                $table->foreignId('claim_id')->nullable()->constrained('voucher_claims')->nullOnDelete();
                $table->string('code_snapshot');
                $table->decimal('discount_amount', 12, 2);
                $table->string('status')->default('used')->index();
                $table->timestamp('used_at');
                $table->timestamps();
                $table->unique(['voucher_id', 'order_id']);
                $table->index(['voucher_id', 'user_id', 'status']);
            });
        }

        if (!Schema::hasColumn('carts', 'voucher_id')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->foreignId('voucher_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            });
        }

        if (!Schema::hasColumn('orders', 'voucher_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->foreignId('voucher_id')->nullable()->after('discount')->constrained()->nullOnDelete();
            });
        }
        if (!Schema::hasColumn('orders', 'voucher_code_snapshot')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('voucher_code_snapshot')->nullable()->after('voucher_id');
            });
        }
        if (!Schema::hasColumn('orders', 'voucher_name_snapshot')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('voucher_name_snapshot')->nullable()->after('voucher_code_snapshot');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('orders', 'voucher_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropConstrainedForeignId('voucher_id');
            });
        }
        $orderSnapshotColumns = array_values(array_filter(
            ['voucher_code_snapshot', 'voucher_name_snapshot'],
            fn (string $column) => Schema::hasColumn('orders', $column),
        ));
        if ($orderSnapshotColumns !== []) {
            Schema::table('orders', function (Blueprint $table) use ($orderSnapshotColumns) {
                $table->dropColumn($orderSnapshotColumns);
            });
        }

        if (Schema::hasColumn('carts', 'voucher_id')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->dropConstrainedForeignId('voucher_id');
            });
        }

        Schema::dropIfExists('voucher_usages');
        Schema::dropIfExists('voucher_claims');
        Schema::dropIfExists('voucher_variants');
        Schema::dropIfExists('voucher_sellers');
        Schema::dropIfExists('voucher_categories');
        Schema::dropIfExists('voucher_products');
        Schema::dropIfExists('vouchers');
    }
};