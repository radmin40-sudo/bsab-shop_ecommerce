<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherClaim extends Model
{
    protected $fillable = ['voucher_id', 'user_id', 'order_id', 'status', 'claimed_at', 'used_at', 'discount_amount'];

    protected function casts(): array
    {
        return ['claimed_at' => 'datetime', 'used_at' => 'datetime', 'discount_amount' => 'decimal:2'];
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
}