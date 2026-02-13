<?php

namespace Database\Seeders;

use App\Models\CashDraw;
use App\Models\CashDrawItem;
use App\Models\GeneratedCode;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleTransaction;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        SaleTransaction::query()->delete();
        Sale::query()->delete();
        CashDrawItem::query()->delete();
        CashDraw::query()->delete();
        GeneratedCode::query()->delete();
        Product::query()->delete();

        $products = collect([
            ['name' => 'Biryani Masala Premium', 'description' => 'Rich aromatic blend for biryani.', 'price' => 350, 'quantity' => 120, 'category' => 'Biryani Masala', 'barcode' => 'BRY-001'],
            ['name' => 'Karahai Gosht Masala', 'description' => 'Traditional karahai spice mix.', 'price' => 290, 'quantity' => 95, 'category' => 'Karahai Gosht Masala', 'barcode' => 'KRG-001'],
            ['name' => 'Home Masala Classic', 'description' => 'Daily use all-purpose masala.', 'price' => 220, 'quantity' => 210, 'category' => 'Home Masala', 'barcode' => 'HOM-001'],
            ['name' => 'Special Tikka Masala', 'description' => 'Smoky tikka seasoning.', 'price' => 310, 'quantity' => 80, 'category' => 'Other', 'barcode' => 'TIK-001'],
            ['name' => 'Nihari Masala', 'description' => 'Deep flavor for nihari recipes.', 'price' => 330, 'quantity' => 70, 'category' => 'Other', 'barcode' => 'NIH-001'],
            ['name' => 'Pulao Masala', 'description' => 'Balanced spice blend for pulao.', 'price' => 260, 'quantity' => 110, 'category' => 'Other', 'barcode' => 'PUL-001'],
        ])->map(fn (array $item) => Product::create($item))->values();

        $last7Days = collect(range(0, 6))->map(fn (int $offset) => now()->subDays(6 - $offset)->toDateString());

        foreach ($last7Days as $date) {
            $draw = CashDraw::create([
                'date' => $date,
                'total_amount' => 0,
                'total_items' => 0,
            ]);

            $picked = $products->shuffle()->take(rand(2, 4));
            $totalAmount = 0;
            $totalItems = 0;

            foreach ($picked as $product) {
                $qty = rand(1, 5);
                $lineTotal = $qty * $product->price;

                CashDrawItem::create([
                    'cash_draw_id' => $draw->id,
                    'product_id' => (string) $product->id,
                    'product_name' => $product->name,
                    'quantity' => $qty,
                    'price' => $product->price,
                    'total' => $lineTotal,
                ]);

                $totalAmount += $lineTotal;
                $totalItems += $qty;
            }

            $draw->update([
                'total_amount' => $totalAmount,
                'total_items' => $totalItems,
            ]);

            $sale = Sale::create([
                'period' => $date,
                'date' => $date,
                'revenue' => $totalAmount,
                'items' => $totalItems,
            ]);

            foreach ($draw->items as $item) {
                SaleTransaction::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->total,
                ]);
            }
        }
    }
}
