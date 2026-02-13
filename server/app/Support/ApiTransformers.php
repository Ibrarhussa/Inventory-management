<?php

namespace App\Support;

use App\Models\CashDraw;
use App\Models\Product;
use App\Models\Sale;

class ApiTransformers
{
    public static function product(Product $product): array
    {
        return [
            '_id' => (string) $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => (float) $product->price,
            'quantity' => (int) $product->quantity,
            'category' => $product->category,
            'image' => $product->image,
            'barcode' => $product->barcode,
            'createdAt' => optional($product->created_at)->toISOString(),
            'updatedAt' => optional($product->updated_at)->toISOString(),
        ];
    }

    public static function cashDraw(CashDraw $cashDraw): array
    {
        return [
            '_id' => (string) $cashDraw->id,
            'date' => optional($cashDraw->date)->format('Y-m-d'),
            'items' => $cashDraw->items->map(fn ($item) => [
                'productId' => $item->product_id,
                'productName' => $item->product_name,
                'quantity' => (int) $item->quantity,
                'price' => (float) $item->price,
                'total' => (float) $item->total,
            ])->values(),
            'totalAmount' => (float) $cashDraw->total_amount,
            'totalItems' => (int) $cashDraw->total_items,
        ];
    }

    public static function sale(Sale $sale): array
    {
        return [
            '_id' => (string) $sale->id,
            'period' => $sale->period,
            'date' => optional($sale->date)->toISOString(),
            'revenue' => (float) $sale->revenue,
            'items' => (int) $sale->items,
            'transactions' => $sale->transactions->map(fn ($transaction) => [
                'productId' => $transaction->product_id,
                'productName' => $transaction->product_name,
                'quantity' => (int) $transaction->quantity,
                'price' => (float) $transaction->price,
                'total' => (float) $transaction->total,
            ])->values(),
            'createdAt' => optional($sale->created_at)->toISOString(),
            'updatedAt' => optional($sale->updated_at)->toISOString(),
        ];
    }
}

