<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashDrawItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cash_draw_id',
        'product_id',
        'product_name',
        'quantity',
        'price',
        'total',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'float',
        'total' => 'float',
    ];

    public function cashDraw()
    {
        return $this->belongsTo(CashDraw::class);
    }
}

