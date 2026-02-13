<?php

namespace App\Http\Controllers;

use App\Models\GeneratedCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GeneratedCodeController extends Controller
{
    public function listBarcodes()
    {
        return response()->json(
            GeneratedCode::query()
                ->where('type', 'barcode')
                ->latest()
                ->limit(500)
                ->get()
                ->map(fn (GeneratedCode $item) => $this->transform($item))
                ->values()
        );
    }

    public function listQRCodes()
    {
        return response()->json(
            GeneratedCode::query()
                ->where('type', 'qr')
                ->latest()
                ->limit(1000)
                ->get()
                ->map(fn (GeneratedCode $item) => $this->transform($item))
                ->values()
        );
    }

    public function storeBarcode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'codeValue' => ['required', 'string'],
            'name' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'payload' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $record = GeneratedCode::create([
            'type' => 'barcode',
            'code_value' => $data['codeValue'],
            'item_name' => $data['name'] ?? null,
            'item_price' => $data['price'] ?? 0,
            'item_quantity' => $data['quantity'] ?? 1,
            'payload' => $data['payload'] ?? null,
        ]);

        return response()->json($this->transform($record), 201);
    }

    public function lookupBarcode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $code = $validator->validated()['code'];

        $record = GeneratedCode::query()
            ->where('type', 'barcode')
            ->where(function ($query) use ($code) {
                $query->where('code_value', $code)
                    ->orWhere('payload->barcode', $code);
            })
            ->latest()
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Barcode not found'], 404);
        }

        return response()->json($this->transform($record));
    }

    public function storeQRCodes(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => ['required', 'array', 'min:1'],
            'items.*.codeValue' => ['required', 'string'],
            'items.*.name' => ['nullable', 'string', 'max:255'],
            'items.*.price' => ['nullable', 'numeric', 'min:0'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1'],
            'items.*.payload' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $items = collect($validator->validated()['items']);
        $created = $items->map(function (array $item) {
            return GeneratedCode::create([
                'type' => 'qr',
                'code_value' => $item['codeValue'],
                'item_name' => $item['name'] ?? null,
                'item_price' => $item['price'] ?? 0,
                'item_quantity' => $item['quantity'] ?? 1,
                'payload' => $item['payload'] ?? null,
            ]);
        });

        return response()->json(
            $created->map(fn (GeneratedCode $record) => $this->transform($record))->values(),
            201
        );
    }

    public function destroyBarcode(string $id)
    {
        GeneratedCode::query()
            ->where('type', 'barcode')
            ->findOrFail($id)
            ->delete();

        return response()->json(['message' => 'Barcode deleted successfully']);
    }

    public function destroyQRCode(string $id)
    {
        GeneratedCode::query()
            ->where('type', 'qr')
            ->findOrFail($id)
            ->delete();

        return response()->json(['message' => 'QR code deleted successfully']);
    }

    private function transform(GeneratedCode $item): array
    {
        return [
            '_id' => (string) $item->id,
            'type' => $item->type,
            'codeValue' => $item->code_value,
            'name' => $item->item_name,
            'price' => (float) $item->item_price,
            'quantity' => (int) $item->item_quantity,
            'payload' => $item->payload,
            'createdAt' => optional($item->created_at)->toISOString(),
        ];
    }
}
