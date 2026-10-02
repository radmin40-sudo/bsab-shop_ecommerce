<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->ensureColumns('vouchers', [
            'seller_id' => fn (Blueprint $table) => $table->foreignId('seller_id')->nullable()->constrained('shops')->nullOnDelete(),
            'name' => fn (Blueprint $table) => $table->string('name')->nullable(),
            'code' => fn (Blueprint $table) => $table->string('code')->nullable(),
            'type' => fn (Blueprint $table) => $table->string('type')->default('fixed'),
            'discount_value' => fn (Blueprint $table) => $table->decimal('discount_value', 12, 2)->default(0),
            'minimum_spend' => fn (Blueprint $table) => $table->decimal('minimum_spend', 12, 2)->default(0),
            'maximum_discount' => fn (Blueprint $table) => $table->decimal('maximum_discount', 12, 2)->nullable(),
            'apply_to' => fn (Blueprint $table) => $table->string('apply_to')->default('all'),
            'customer_eligibility' => fn (Blueprint $table) => $table->string('customer_eligibility')->default('all'),
            'starts_at' => fn (Blueprint $table) => $table->timestamp('starts_at')->nullable(),
            'expires_at' => fn (Blueprint $table) => $table->timestamp('expires_at')->nullable(),
            'total_usage_limit' => fn (Blueprint $table) => $table->unsignedInteger('total_usage_limit')->nullable(),
            'per_customer_usage_limit' => fn (Blueprint $table) => $table->unsignedInteger('per_customer_usage_limit')->nullable(),
            'claim_limit' => fn (Blueprint $table) => $table->unsignedInteger('claim_limit')->nullable(),
            'requires_claim' => fn (Blueprint $table) => $table->boolean('requires_claim')->default(false),
            'free_shipping' => fn (Blueprint $table) => $table->boolean('free_shipping')->default(false),
            'is_active' => fn (Blueprint $table) => $table->boolean('is_active')->default(true),
            'description' => fn (Blueprint $table) => $table->text('description')->nullable(),
            'terms' => fn (Blueprint $table) => $table->text('terms')->nullable(),
            'created_at' => fn (Blueprint $table) => $table->timestamp('created_at')->nullable(),
            'updated_at' => fn (Blueprint $table) => $table->timestamp('updated_at')->nullable(),
            'deleted_at' => fn (Blueprint $table) => $table->softDeletes(),
        ]);

        foreach ([
            'voucher_products' => ['voucher_id', 'product_id'],
            'voucher_categories' => ['voucher_id', 'category_id'],
            'voucher_sellers' => ['voucher_id', 'seller_id'],
            'voucher_variants' => ['voucher_id', 'product_variant_id'],
        ] as $tableName => $keys) {
            $this->ensureColumns($tableName, [
                $keys[0] => fn (Blueprint $table) => $table->unsignedBigInteger($keys[0])->nullable(),
                $keys[1] => fn (Blueprint $table) => $table->unsignedBigInteger($keys[1])->nullable(),
                'created_at' => fn (Blueprint $table) => $table->timestamp('created_at')->nullable(),
                'updated_at' => fn (Blueprint $table) => $table->timestamp('updated_at')->nullable(),
            ]);
        }

        $this->ensureColumns('voucher_claims', [
            'voucher_id' => fn (Blueprint $table) => $table->unsignedBigInteger('voucher_id')->nullable(),
            'user_id' => fn (Blueprint $table) => $table->unsignedBigInteger('user_id')->nullable(),
            'order_id' => fn (Blueprint $table) => $table->unsignedBigInteger('order_id')->nullable(),
            'status' => fn (Blueprint $table) => $table->string('status')->default('claimed'),
            'claimed_at' => fn (Blueprint $table) => $table->timestamp('claimed_at')->nullable(),
            'used_at' => fn (Blueprint $table) => $table->timestamp('used_at')->nullable(),
            'discount_amount' => fn (Blueprint $table) => $table->decimal('discount_amount', 12, 2)->default(0),
            'created_at' => fn (Blueprint $table) => $table->timestamp('created_at')->nullable(),
            'updated_at' => fn (Blueprint $table) => $table->timestamp('updated_at')->nullable(),
        ]);

        $this->ensureColumns('voucher_usages', [
            'voucher_id' => fn (Blueprint $table) => $table->unsignedBigInteger('voucher_id')->nullable(),
            'user_id' => fn (Blueprint $table) => $table->unsignedBigInteger('user_id')->nullable(),
            'order_id' => fn (Blueprint $table) => $table->unsignedBigInteger('order_id')->nullable(),
            'claim_id' => fn (Blueprint $table) => $table->unsignedBigInteger('claim_id')->nullable(),
            'code_snapshot' => fn (Blueprint $table) => $table->string('code_snapshot')->nullable(),
            'discount_amount' => fn (Blueprint $table) => $table->decimal('discount_amount', 12, 2)->default(0),
            'status' => fn (Blueprint $table) => $table->string('status')->default('used'),
            'used_at' => fn (Blueprint $table) => $table->timestamp('used_at')->nullable(),
            'created_at' => fn (Blueprint $table) => $table->timestamp('created_at')->nullable(),
            'updated_at' => fn (Blueprint $table) => $table->timestamp('updated_at')->nullable(),
        ]);
    }

    public function down(): void
    {
        // Keep reconciled columns in place to avoid deleting data written after this migration.
    }

    private function ensureColumns(string $tableName, array $definitions): void
    {
        if (! Schema::hasTable($tableName)) {
            throw new RuntimeException("The {$tableName} table must exist before its columns can be reconciled.");
        }

        Schema::table($tableName, function (Blueprint $table) use ($tableName, $definitions) {
            foreach ($definitions as $column => $definition) {
                if (! Schema::hasColumn($tableName, $column)) {
                    $definition($table);
                }
            }
        });
    }
};
