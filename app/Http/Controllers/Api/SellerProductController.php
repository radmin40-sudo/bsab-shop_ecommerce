<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SellerProductController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->shop->products()->with('category')->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['category_id' => 'nullable|exists:categories,id', 'name' => 'required|string|max:255', 'description' => 'nullable|string', 'base_price' => 'required|numeric|min:0', 'sale_price' => 'nullable|numeric|min:0', 'sku' => 'required|string|max:100|unique:products,sku', 'stock_quantity' => 'required|integer|min:0']);
        $product = $request->user()->shop->products()->create($data + ['slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(5)), 'status' => 'pending']);

        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        abort_unless($product->shop->user_id === $request->user()->id, 403);
        $product->update($request->validate(['category_id' => 'nullable|exists:categories,id', 'name' => 'sometimes|string|max:255', 'description' => 'nullable|string', 'base_price' => 'sometimes|numeric|min:0', 'sale_price' => 'nullable|numeric|min:0', 'stock_quantity' => 'sometimes|integer|min:0', 'status' => 'sometimes|in:draft,pending']));

        return $product;
    }

    public function destroy(Request $request, Product $product)
    {
        abort_unless($product->shop->user_id === $request->user()->id, 403);
        $product->delete();

        return response()->noContent();
    }
}
