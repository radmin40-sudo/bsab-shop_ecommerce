<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'views_count',
        'wishlist_count',
        'offer_count',
        'purchase_count',
        'quantity_sold',
        'rating_average',
        'rating_count',
        'conversion_rate',
        'popularity_score',
    ];

    protected function casts(): array
    {
        return [
            'rating_average' => 'decimal:2',
            'conversion_rate' => 'decimal:4',
            'popularity_score' => 'decimal:2',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
