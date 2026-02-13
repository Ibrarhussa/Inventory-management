<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashDraw extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'total_amount',
        'total_items',
    ];

    protected $casts = [
        'date' => 'date',
        'total_amount' => 'float',
        'total_items' => 'integer',
    ];

    public function items()
    {
        return $this->hasMany(CashDrawItem::class);
    }
}

