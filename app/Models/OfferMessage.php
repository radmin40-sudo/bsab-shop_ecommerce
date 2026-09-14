<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfferMessage extends Model
{
    use HasFactory;

    protected $fillable = ['offer_id', 'sender_id', 'message'];

    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
