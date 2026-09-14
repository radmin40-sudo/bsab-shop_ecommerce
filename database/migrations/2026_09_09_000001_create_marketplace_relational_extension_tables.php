<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Seller profiles table: one-to-one compatibility with the current shops/user model
        if (! Schema::hasTable('seller_profiles')) {
            Schema::create('seller_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
                $table->string('shop_name');
                $table->string('shop_slug')->unique();
                $table->text('description')->nullable();
                $table->string('status')->default('active');
                $table->string('verification_status')->default('pending');
                $table->softDeletes();
                $table->timestamps();
            });
        }

        // Product options
        if (! Schema::hasTable('product_options')) {
            Schema::create('product_options', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->string('name');
                $table->unsignedInteger('sort_order')->default(0);
                $table->timestamps();
                $table->unique(['product_id', 'name'], 'product_options_uq');
                $table->index(['product_id', 'sort_order']);
            });
        }

        // Option values
        if (! Schema::hasTable('product_option_values')) {
            Schema::create('product_option_values', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_option_id')->constrained('product_options')->cascadeOnDelete();
                $table->string('value');
                $table->unsignedInteger('sort_order')->default(0);
                $table->timestamps();
                $table->unique(['product_option_id', 'value'], 'product_option_values_uq');
                $table->index(['product_option_id', 'sort_order']);
            });
        }

        // Add extension columns to existing products table
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'seller_id')) {
                $table->foreignId('seller_id')->nullable()->constrained('shops')->nullOnDelete();
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

            if (! Schema::hasColumn('products', 'condition')) {
                $table->string('condition')->nullable();
            }

            $table->foreignId('category_id')->nullable()->change();
            $table->text('description')->nullable()->change();

            if (! Schema::hasIndex('products', ['shop_id', 'status'])) {
                $table->index(['shop_id', 'status']);
            }

            if (! Schema::hasIndex('products', ['category_id', 'status'])) {
                $table->index(['category_id', 'status']);
            }

            if (! Schema::hasIndex('products', ['slug'])) {
                $table->index(['slug']);
            }

            if (! Schema::hasIndex('products', ['published_at'])) {
                $table->index(['published_at']);
            }
        });

        // Extend existing product_variants table for the requested variant lifecycle
        Schema::table('product_variants', function (Blueprint $table) {
            if (! Schema::hasColumn('product_variants', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('stock_quantity');
            }

            if (! Schema::hasColumn('product_variants', 'deleted_at')) {
                $table->softDeletes();
            }

            if (! Schema::hasIndex('product_variants', ['product_id', 'is_active'])) {
                $table->index(['product_id', 'is_active']);
            }

            if (! Schema::hasIndex('product_variants', ['is_active'])) {
                $table->index(['is_active']);
            }
        });

        // Variant option assignments
        if (! Schema::hasTable('variant_option_values')) {
            Schema::create('variant_option_values', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_variant_id')->constrained('product_variants')->cascadeOnDelete();
                $table->foreignId('product_option_value_id')->constrained('product_option_values')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['product_variant_id', 'product_option_value_id'], 'variant_option_values_uq');
                $table->index(['product_variant_id']);
                $table->index(['product_option_value_id']);
            });
        }

        // Product images need variant-aware organization while preserving path-based image storage.
        Schema::table('product_images', function (Blueprint $table) {
            if (! Schema::hasColumn('product_images', 'product_variant_id')) {
                $table->foreignId('product_variant_id')->nullable()->after('product_id')->constrained('product_variants')->nullOnDelete();
            }

            if (! Schema::hasColumn('product_images', 'alt_text')) {
                $table->string('alt_text')->nullable()->after('path');
            }

            if (! Schema::hasIndex('product_images', ['product_id', 'product_variant_id'])) {
                $table->index(['product_id', 'product_variant_id']);
            }

            if (! Schema::hasIndex('product_images', ['product_id', 'is_primary'])) {
                $table->index(['product_id', 'is_primary']);
            }
        });

        // normalize stock movements by variant
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->integer('quantity');
            $table->string('type');
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['product_variant_id', 'type']);
            $table->index(['reference_type', 'reference_id']);
            $table->index(['created_at']);
        });

        // Offers and negotiations
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained('shops')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->text('message')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
            $table->index(['product_id', 'status']);
            $table->index(['buyer_id', 'status']);
            $table->index(['seller_id', 'status']);
        });

        Schema::create('offer_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained('offers')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->timestamps();
            $table->index(['offer_id', 'created_at']);
        });

        // Seller follows and wallet-like social graph
        Schema::create('seller_follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained('shops')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['follower_id', 'seller_id'], 'seller_follows_uq');
            $table->index(['seller_id']);
        });

        // Product Reviews
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained('order_items')->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->string('title')->nullable();
            $table->text('comment')->nullable();
            $table->string('status')->default('pending');
            $table->softDeletes();
            $table->timestamps();
            $table->unique(['product_id', 'user_id', 'order_id'], 'product_reviews_uq');
            $table->index(['product_id', 'rating']);
            $table->index(['user_id']);
        });

        // Seller ratings
        Schema::create('seller_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('shops')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->unsignedTinyInteger('communication_rating')->nullable();
            $table->unsignedTinyInteger('shipping_rating')->nullable();
            $table->unsignedTinyInteger('product_accuracy_rating')->nullable();
            $table->text('comment')->nullable();
            $table->string('status')->default('published');
            $table->timestamps();
            $table->unique(['seller_id', 'buyer_id', 'order_id'], 'seller_ratings_uq');
            $table->index(['seller_id', 'rating']);
        });

        // Product views
        Schema::create('product_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('session_id')->nullable();
            $table->string('ip_hash')->nullable();
            $table->timestamp('viewed_at')->useCurrent();
            $table->timestamps();
            $table->index(['product_id']);
            $table->index(['user_id']);
            $table->index(['session_id']);
            $table->index(['viewed_at']);
            $table->index(['product_id', 'viewed_at']);
        });

        // Activity log
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['action']);
            $table->index(['subject_type', 'subject_id']);
            $table->index(['user_id']);
        });

        // Product analytics metrics cache
        Schema::create('product_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained('products')->cascadeOnDelete();
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('wishlist_count')->default(0);
            $table->unsignedBigInteger('offer_count')->default(0);
            $table->unsignedBigInteger('purchase_count')->default(0);
            $table->unsignedBigInteger('quantity_sold')->default(0);
            $table->decimal('rating_average', 3, 2)->default(0);
            $table->unsignedBigInteger('rating_count')->default(0);
            $table->decimal('conversion_rate', 8, 4)->nullable();
            $table->decimal('popularity_score', 10, 2)->nullable();
            $table->timestamp('updated_at')->useCurrent();
            $table->index(['views_count']);
            $table->index(['wishlist_count']);
            $table->index(['purchase_count']);
            $table->index(['rating_average']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_metrics');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('product_views');
        Schema::dropIfExists('seller_ratings');
        Schema::dropIfExists('product_reviews');
        Schema::dropIfExists('seller_follows');
        Schema::dropIfExists('offer_messages');
        Schema::dropIfExists('offers');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('variant_option_values');
        Schema::dropIfExists('product_option_values');
        Schema::dropIfExists('product_options');
        Schema::dropIfExists('seller_profiles');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['seller_id', 'condition', 'authenticity_status', 'verification_status', 'currency', 'published_at']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['is_active']);
            $table->dropSoftDeletes();
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->dropForeign(['product_variant_id']);
            $table->dropColumn(['product_variant_id', 'alt_text']);
        });
    }
};
