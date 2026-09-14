<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = ['code', 'type', 'value', 'shop_id', 'created_by_role', 'min_spend', 'max_discount', 'expires_at', 'usage_limit', 'times_used'];

    protected function casts(): array
    {
        return ['value' => 'decimal:2', 'min_spend' => 'decimal:2', 'max_discount' => 'decimal:2', 'expires_at' => 'datetime'];
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function redemptions()
    {
        return $this->hasMany(VoucherRedemption::class);
    }
}
