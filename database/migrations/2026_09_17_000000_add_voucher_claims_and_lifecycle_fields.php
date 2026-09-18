<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vouchers', function (Blueprint $table) {
            $table->string('title')->nullable()->after('code');
            $table->text('description')->nullable()->after('title');
            $table->string('status')->default('active')->after('times_used');
            $table->timestamp('start_date')->nullable()->after('status');
            $table->timestamp('expiration_date')->nullable()->after('start_date');
            $table->unsignedInteger('total_claim_limit')->nullable()->after('expiration_date');
            $table->unsignedInteger('total_claimed')->default(0)->after('total_claim_limit');
        });

        Schema::create('user_vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('voucher_id')->constrained()->cascadeOnDelete();
            $table->timestamp('claimed_at');
            $table->string('status')->default('claimed');
            $table->timestamps();
            $table->unique(['user_id', 'voucher_id']);
        });

        DB::table('vouchers')->whereNull('title')->update(['title' => DB::raw('code')]);
        DB::table('vouchers')->whereNull('total_claim_limit')->whereNotNull('usage_limit')->update(['total_claim_limit' => DB::raw('usage_limit')]);
        DB::table('vouchers')->update(['total_claimed' => DB::raw('times_used')]);
    }

    public function down(): void
    {
        Schema::dropIfExists('user_vouchers');
        Schema::table('vouchers', function (Blueprint $table) {
            $table->dropColumn(['title', 'description', 'status', 'start_date', 'expiration_date', 'total_claim_limit', 'total_claimed']);
        });
    }
};
