<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    protected $fillable = ['user_id', 'created_by', 'name', 'slug', 'logo', 'banner', 'description', 'status', 'commission_rate', 'payout_details'];

    protected function casts(): array
    {
        return ['payout_details' => 'array', 'commission_rate' => 'decimal:2'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sellerProfile()
    {
        return $this->hasOne(SellerProfile::class, 'user_id', 'user_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'shop_id');
    }

    public function payouts()
    {
        return $this->hasMany(Payout::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function follows()
    {
        return $this->hasMany(SellerFollow::class, 'seller_id');
    }
}
