<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = ['order_number', 'user_id', 'status', 'subtotal', 'shipping_fee', 'tax', 'discount', 'total', 'shipping_address', 'payment_method', 'payment_status'];

    protected function casts(): array
    {
        return ['shipping_address' => 'array', 'subtotal' => 'decimal:2', 'shipping_fee' => 'decimal:2', 'tax' => 'decimal:2', 'discount' => 'decimal:2', 'total' => 'decimal:2'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
