<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'seller_id', 'name', 'code', 'type', 'discount_value', 'minimum_spend', 'maximum_discount',
        'apply_to', 'customer_eligibility', 'starts_at', 'expires_at', 'total_usage_limit',
        'per_customer_usage_limit', 'claim_limit', 'requires_claim', 'free_shipping', 'is_active',
        'description', 'terms',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'minimum_spend' => 'decimal:2',
            'maximum_discount' => 'decimal:2',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'requires_claim' => 'boolean',
            'free_shipping' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'voucher_products')->withTimestamps();
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'voucher_categories')->withTimestamps();
    }

    public function sellers()
    {
        return $this->belongsToMany(Shop::class, 'voucher_sellers', 'voucher_id', 'seller_id')->withTimestamps();
    }

    public function variants()
    {
        return $this->belongsToMany(ProductVariant::class, 'voucher_variants', 'voucher_id', 'product_variant_id')->withTimestamps();
    }

    public function claims()
    {
        return $this->hasMany(VoucherClaim::class);
    }

    public function usages()
    {
        return $this->hasMany(VoucherUsage::class);
    }

}