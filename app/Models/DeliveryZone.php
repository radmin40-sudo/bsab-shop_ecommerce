<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    protected $fillable = [
        'name',
        'barangay',
        'description',
        'delivery_fee',
        'is_free_delivery',
        'free_delivery_minimum',
        'estimated_delivery_min',
        'estimated_delivery_max',
        'estimated_delivery_text',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'delivery_fee' => 'decimal:2',
            'free_delivery_minimum' => 'decimal:2',
            'is_free_delivery' => 'boolean',
            'estimated_delivery_min' => 'integer',
            'estimated_delivery_max' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active')->orderBy('sort_order')->orderBy('name');
    }
}
