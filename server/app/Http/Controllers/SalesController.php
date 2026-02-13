<?php

namespace App\Http\Controllers;

use App\Models\CashDraw;
use App\Models\Sale;
use App\Models\SaleTransaction;
use App\Support\ApiTransformers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SalesController extends Controller
{
    public function summary(Request $request)
    {
        $query = Sale::with('transactions')->orderByDesc('date');

        if ($request->filled('startDate') && $request->filled('endDate')) {
            $query->whereBetween('date', [$request->query('startDate'), $request->query('endDate')]);
        }

        $sales = $query->get();
        return response()->json($sales->map(fn (Sale $sale) => ApiTransformers::sale($sale))->values());
    }

    public function byPeriod(Request $request)
    {
        $groupBy = $request->query('groupBy', 'month');
        $format = match ($groupBy) {
            'day' => '%Y-%m-%d',
            'year' => '%Y',
            default => '%Y-%m',
        };

        $rows = Sale::query()
            ->selectRaw("DATE_FORMAT(date, '{$format}') as period, COALESCE(SUM(revenue), 0) as revenue, COALESCE(SUM(items), 0) as items")
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return response()->json($rows->map(fn ($row) => [
            'period' => $row->period,
            'revenue' => (float) $row->revenue,
            'items' => (int) $row->items,
        ])->values());
    }

    public function syncFromCashDraw(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $date = $validator->validated()['date'];
        $cashDraw = CashDraw::with('items')->whereDate('date', $date)->first();
        if (!$cashDraw) {
            return response()->json(['message' => 'Cash draw not found for selected date'], 404);
        }

        $sale = Sale::updateOrCreate(
            ['period' => $date, 'date' => $date],
            [
                'revenue' => (float) $cashDraw->total_amount,
                'items' => (int) $cashDraw->total_items,
            ]
        );

        SaleTransaction::where('sale_id', $sale->id)->delete();
        foreach ($cashDraw->items as $item) {
            SaleTransaction::create([
                'sale_id' => $sale->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'total' => $item->total,
            ]);
        }

        return response()->json(ApiTransformers::sale($sale->fresh()->load('transactions')));
    }

    public function bestSellers(Request $request)
    {
        $limit = (int) $request->query('limit', 10);
        if ($limit < 1) {
            $limit = 10;
        }

        $rows = SaleTransaction::query()
            ->select(
                'product_id as productId',
                'product_name as productName',
                DB::raw('COALESCE(SUM(quantity), 0) as totalQuantity'),
                DB::raw('COALESCE(SUM(total), 0) as totalRevenue')
            )
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('totalQuantity')
            ->limit($limit)
            ->get();

        return response()->json($rows->map(fn ($row) => [
            'productId' => $row->productId,
            'productName' => $row->productName,
            'totalQuantity' => (int) $row->totalQuantity,
            'totalRevenue' => (float) $row->totalRevenue,
        ])->values());
    }

    public function stats()
    {
        $totals = Sale::query()
            ->selectRaw('COALESCE(SUM(revenue), 0) as totalRevenue, COALESCE(SUM(items), 0) as totalItems, COUNT(*) as totalTransactions')
            ->first();

        $totalTransactions = (int) $totals->totalTransactions;
        $totalRevenue = (float) $totals->totalRevenue;

        return response()->json([
            'totalRevenue' => $totalRevenue,
            'totalItems' => (int) $totals->totalItems,
            'totalTransactions' => $totalTransactions,
            'avgRevenue' => $totalTransactions > 0 ? round($totalRevenue / $totalTransactions, 2) : 0,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'period' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'revenue' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'integer', 'min:0'],
            'transactions' => ['array'],
            'transactions.*.productId' => ['required', 'string'],
            'transactions.*.productName' => ['required', 'string'],
            'transactions.*.quantity' => ['required', 'integer', 'min:1'],
            'transactions.*.price' => ['required', 'numeric', 'min:0'],
            'transactions.*.total' => ['required', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $sale = Sale::create([
            'period' => $data['period'],
            'date' => $data['date'],
            'revenue' => $data['revenue'],
            'items' => $data['items'],
        ]);

        foreach (($data['transactions'] ?? []) as $transaction) {
            SaleTransaction::create([
                'sale_id' => $sale->id,
                'product_id' => $transaction['productId'],
                'product_name' => $transaction['productName'],
                'quantity' => $transaction['quantity'],
                'price' => $transaction['price'],
                'total' => $transaction['total'],
            ]);
        }

        return response()->json(ApiTransformers::sale($sale->fresh()->load('transactions')), 201);
    }

    public function destroy(string $id)
    {
        Sale::findOrFail($id)->delete();
        return response()->json(['message' => 'Sale deleted successfully']);
    }
}

