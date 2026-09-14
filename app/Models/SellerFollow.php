<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerFollow extends Model
{
    use HasFactory;

    protected $fillable = ['follower_id', 'seller_id'];

    public function follower()
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    public function seller()
    {
        return $this->belongsTo(Shop::class, 'seller_id');
    }
}
