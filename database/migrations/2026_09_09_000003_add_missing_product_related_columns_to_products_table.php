<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'seller_id')) {
                $table->foreignId('seller_id')->nullable()->constrained('shops')->nullOnDelete();
            }

            if (! Schema::hasColumn('products', 'condition')) {
                $table->string('condition')->nullable();
            }

            if (! Schema::hasColumn('products', 'authenticity_status')) {
                $table->string('authenticity_status')->default('unknown');
            }

            if (! Schema::hasColumn('products', 'verification_status')) {
                $table->string('verification_status')->default('pending');
            }

            if (! Schema::hasColumn('products', 'currency')) {
                $table->string('currency')->default('PHP');
            }

            if (! Schema::hasColumn('products', 'published_at')) {
                $table->timestamp('published_at')->nullable();
            }

            if (! Schema::hasColumn('products', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }

            if (! Schema::hasColumn('products', 'brand')) {
                $table->string('brand')->nullable();
            }

            if (! Schema::hasColumn('products', 'model')) {
                $table->string('model')->nullable();
            }

            if (! Schema::hasColumn('products', 'selling_unit')) {
                $table->string('selling_unit')->nullable();
            }

            if (! Schema::hasColumn('products', 'barcode')) {
                $table->string('barcode')->nullable();
            }

            if (! Schema::hasColumn('products', 'color')) {
                $table->string('color')->nullable();
            }

            if (! Schema::hasColumn('products', 'size')) {
                $table->string('size')->nullable();
            }

            if (! Schema::hasColumn('products', 'material')) {
                $table->string('material')->nullable();
            }

            if (! Schema::hasColumn('products', 'weight')) {
                $table->string('weight')->nullable();
            }

            if (! Schema::hasColumn('products', 'volume')) {
                $table->string('volume')->nullable();
            }

            if (! Schema::hasColumn('products', 'pack_quantity')) {
                $table->unsignedInteger('pack_quantity')->nullable();
            }

            if (! Schema::hasColumn('products', 'length')) {
                $table->string('length')->nullable();
            }

            if (! Schema::hasColumn('products', 'width')) {
                $table->string('width')->nullable();
            }

            if (! Schema::hasColumn('products', 'height')) {
                $table->string('height')->nullable();
            }

            if (! Schema::hasColumn('products', 'warranty')) {
                $table->string('warranty')->nullable();
            }

            if (! Schema::hasColumn('products', 'country_of_origin')) {
                $table->string('country_of_origin')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'seller_id',
                'condition',
                'authenticity_status',
                'verification_status',
                'currency',
                'published_at',
                'is_active',
                'brand',
                'model',
                'selling_unit',
                'barcode',
                'color',
                'size',
                'material',
                'weight',
                'volume',
                'pack_quantity',
                'length',
                'width',
                'height',
                'warranty',
                'country_of_origin',
            ]);
        });
    }
};
