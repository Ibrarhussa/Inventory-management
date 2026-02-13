<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeneratedCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'code_value',
        'item_name',
        'item_price',
        'item_quantity',
        'payload',
    ];

    protected $casts = [
        'item_price' => 'float',
        'item_quantity' => 'integer',
        'payload' => 'array',
    ];
}

