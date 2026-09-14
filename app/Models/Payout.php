<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    protected $fillable = ['shop_id', 'amount', 'status', 'period_start', 'period_end', 'paid_at'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'period_start' => 'date', 'period_end' => 'date', 'paid_at' => 'datetime'];
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
