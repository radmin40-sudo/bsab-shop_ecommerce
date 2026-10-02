<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::query()
            ->with([
                'shop:id,name',
                'category:id,name',
                'images:id,product_id,path,is_primary',
                'variants:id,product_id,name,stock_quantity',
                'options.values',
            ])
            ->latest()
            ->get();

        return Inertia::render('admin/products', [
            'products' => $products,
            'metrics' => [
                'total' => Product::query()->count(),
                'published' => Product::query()->where('status', 'published')->count(),
                'pending' => Product::query()->where('status', 'pending')->count(),
                'drafts' => Product::query()->where('status', 'draft')->count(),
                'addedThisMonth' => Product::query()->where('created_at', '>=', now()->startOfMonth())->count(),
            ],
            'categories' => Category::query()
                ->whereHas('products')
                ->orderBy('name')
                ->pluck('name')
                ->values(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['draft', 'pending', 'published', 'rejected'])]]);
        $product->update(['status' => $data['status'], 'is_approved' => $data['status'] === 'published']);

        return back();
    }

    public function approveAll(): RedirectResponse
    {
        Product::query()->where('status', 'pending')->update(['status' => 'published', 'is_approved' => true]);

        return back();
    }

    public function approveSelected(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_ids' => ['required', 'array', 'min:1'],
            'product_ids.*' => ['required', 'integer', 'distinct', 'exists:products,id'],
        ]);

        Product::query()
            ->whereIn('id', $data['product_ids'])
            ->where('status', 'pending')
            ->update(['status' => 'published', 'is_approved' => true]);

        return back();
    }
}
