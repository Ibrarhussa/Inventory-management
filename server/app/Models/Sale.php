<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'period',
        'date',
        'revenue',
        'items',
    ];

    protected $casts = [
        'date' => 'datetime',
        'revenue' => 'float',
        'items' => 'integer',
    ];

    public function transactions()
    {
        return $this->hasMany(SaleTransaction::class);
    }
}

