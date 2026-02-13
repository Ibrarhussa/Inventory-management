<?php

namespace App\Http\Controllers;

use App\Models\CashDraw;
use App\Models\CashDrawItem;
use App\Support\ApiTransformers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CashDrawController extends Controller
{
    public function show(Request $request)
    {
        $date = $request->query('date', now()->toDateString());
        $cashDraw = $this->getOrCreateByDate($date);

        return response()->json(ApiTransformers::cashDraw($cashDraw->load('items')));
    }

    public function history(Request $request)
    {
        $query = CashDraw::with('items')->orderByDesc('date');

        if ($request->filled('startDate') && $request->filled('endDate')) {
            $query->whereBetween('date', [$request->query('startDate'), $request->query('endDate')]);
        }

        $history = $query->get();

        return response()->json($history->map(fn (CashDraw $cashDraw) => ApiTransformers::cashDraw($cashDraw))->values());
    }

    public function addItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => ['required', 'date_format:Y-m-d'],
            'productId' => ['required', 'string', 'max:255'],
            'productName' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $cashDraw = $this->getOrCreateByDate($data['date']);

        $item = CashDrawItem::where('cash_draw_id', $cashDraw->id)
            ->where('product_id', $data['productId'])
            ->first();

        if ($item) {
            $item->quantity += $data['quantity'];
            $item->price = $data['price'];
            $item->total = $item->quantity * $item->price;
            $item->save();
        } else {
            CashDrawItem::create([
                'cash_draw_id' => $cashDraw->id,
                'product_id' => $data['productId'],
                'product_name' => $data['productName'],
                'quantity' => $data['quantity'],
                'price' => $data['price'],
                'total' => $data['quantity'] * $data['price'],
            ]);
        }

        $this->refreshTotals($cashDraw);
        return response()->json(ApiTransformers::cashDraw($cashDraw->fresh()->load('items')));
    }

    public function updateItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => ['required', 'date_format:Y-m-d'],
            'productId' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $cashDraw = $this->getOrCreateByDate($data['date']);

        $item = CashDrawItem::where('cash_draw_id', $cashDraw->id)
            ->where('product_id', $data['productId'])
            ->firstOrFail();

        $item->quantity = $data['quantity'];
        $item->price = $data['price'];
        $item->total = $data['quantity'] * $data['price'];
        $item->save();

        $this->refreshTotals($cashDraw);
        return response()->json(ApiTransformers::cashDraw($cashDraw->fresh()->load('items')));
    }

    public function removeItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => ['required', 'date_format:Y-m-d'],
            'productId' => ['required', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $cashDraw = $this->getOrCreateByDate($data['date']);

        CashDrawItem::where('cash_draw_id', $cashDraw->id)
            ->where('product_id', $data['productId'])
            ->delete();

        $this->refreshTotals($cashDraw);
        return response()->json(ApiTransformers::cashDraw($cashDraw->fresh()->load('items')));
    }

    public function clear(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cashDraw = $this->getOrCreateByDate($request->query('date'));
        CashDrawItem::where('cash_draw_id', $cashDraw->id)->delete();
        $cashDraw->update([
            'total_amount' => 0,
            'total_items' => 0,
        ]);

        return response()->json(['message' => 'Cash draw cleared successfully']);
    }

    private function getOrCreateByDate(string $date): CashDraw
    {
        return CashDraw::firstOrCreate(
            ['date' => $date],
            ['total_amount' => 0, 'total_items' => 0]
        );
    }

    private function refreshTotals(CashDraw $cashDraw): void
    {
        $totals = CashDrawItem::where('cash_draw_id', $cashDraw->id)
            ->selectRaw('COALESCE(SUM(total), 0) as total_amount, COALESCE(SUM(quantity), 0) as total_items')
            ->first();

        $cashDraw->update([
            'total_amount' => (float) $totals->total_amount,
            'total_items' => (int) $totals->total_items,
        ]);
    }
}

