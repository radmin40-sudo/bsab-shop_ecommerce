<?php

namespace Tests\Feature;

use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class VoucherSchemaReconciliationTest extends TestCase
{
    use RefreshDatabase;

    public function test_reconciliation_adds_missing_columns_without_losing_existing_vouchers(): void
    {
        $voucher = Voucher::create([
            'name' => 'Legacy voucher',
            'code' => 'LEGACY10',
            'type' => 'fixed',
            'discount_value' => 10,
            'apply_to' => 'all',
            'customer_eligibility' => 'all',
        ]);

        Schema::table('vouchers', function ($table) {
            $table->dropConstrainedForeignId('seller_id');
            $table->dropSoftDeletes();
        });

        $migration = require database_path('migrations/2026_10_02_000000_reconcile_existing_voucher_columns.php');
        $migration->up();

        $this->assertTrue(Schema::hasColumn('vouchers', 'seller_id'));
        $this->assertTrue(Schema::hasColumn('vouchers', 'deleted_at'));
        $this->assertSame('LEGACY10', DB::table('vouchers')->where('id', $voucher->id)->value('code'));
    }
}
