<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Support\ApiTransformers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::latest()->get();
        return response()->json($products->map(fn (Product $product) => ApiTransformers::product($product))->values());
    }

    public function show(string $id)
    {
        $product = Product::findOrFail($id);
        return response()->json(ApiTransformers::product($product));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'category' => ['required', 'string', 'max:255'],
            'barcode' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['image'] = $this->storeImage($request);
        $product = Product::create($data);

        return response()->json(ApiTransformers::product($product), 201);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'quantity' => ['sometimes', 'required', 'integer', 'min:0'],
            'category' => ['sometimes', 'required', 'string', 'max:255'],
            'barcode' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $imagePath = $this->storeImage($request);
        if ($imagePath) {
            $data['image'] = $imagePath;
        }

        $product->update($data);

        return response()->json(ApiTransformers::product($product->fresh()));
    }

    public function destroy(string $id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function inventoryStats()
    {
        $stats = Product::query()
            ->selectRaw('category as _id, COUNT(*) as count, COALESCE(SUM(quantity), 0) as totalQuantity')
            ->groupBy('category')
            ->orderBy('category')
            ->get();

        return response()->json($stats);
    }

    private function storeImage(Request $request): ?string
    {
        if (!$request->hasFile('image')) {
            return null;
        }

        $file = $request->file('image');
        $filename = uniqid('product_', true).'.'.$file->getClientOriginalExtension();
        $destination = public_path('uploads');
        if (!is_dir($destination)) {
            mkdir($destination, 0775, true);
        }
        $file->move($destination, $filename);

        return '/uploads/'.$filename;
    }
}

