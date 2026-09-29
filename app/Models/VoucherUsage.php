<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherUsage extends Model
{
    protected $fillable = ['voucher_id', 'user_id', 'order_id', 'claim_id', 'code_snapshot', 'discount_amount', 'status', 'used_at'];

    protected function casts(): array
    {
        return ['discount_amount' => 'decimal:2', 'used_at' => 'datetime'];
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function claim()
    {
        return $this->belongsTo(VoucherClaim::class, 'claim_id');
    }
}