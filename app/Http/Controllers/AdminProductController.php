<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/products', [
            'products' => Product::with(['shop:id,name', 'category:id,name', 'images:id,product_id,path,is_primary'])->latest()->get(),
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
        Product::where('status', '!=', 'published')->update(['status' => 'published', 'is_approved' => true]);

        return back();
    }
}
