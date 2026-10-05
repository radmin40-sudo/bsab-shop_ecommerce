<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('barangay')->unique();
            $table->text('description')->nullable();
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->boolean('is_free_delivery')->default(false);
            $table->decimal('free_delivery_minimum', 10, 2)->nullable();
            $table->unsignedSmallInteger('estimated_delivery_min')->nullable();
            $table->unsignedSmallInteger('estimated_delivery_max')->nullable();
            $table->string('estimated_delivery_text', 100);
            $table->string('status')->default('active');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['status', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_zones');
    }
};
