<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Services\ProductVariantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SellerProductController extends Controller
{
    public function index(Request $request): Response
    {
        $shop = $this->shopFor($request);

        return Inertia::render('seller/products', [
            'products' => $shop->products()->with(['category:id,name', 'images:id,product_id,path,is_primary'])->latest()->get(),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request, ProductVariantService $service): RedirectResponse
    {
        $shop = $this->shopFor($request);

        $data = $this->validated($request, null, $service);
        $data['shop_id'] = $shop->id;
        $data['slug'] = Str::slug($data['name']).'-'.Str::lower(Str::random(5));
        $data['sku'] = $this->uniqueSku($data['name']);
        $data['barcode'] = $this->uniqueBarcode();
        $data['status'] = 'pending';
        $product = $shop->products()->create($data);
        $this->storeImages($request, $product);
        $this->storeVideo($request, $product);
        $service->syncFromOptionSpec($product, (string) $request->input('product_options', ''));

        return to_route('seller.products');
    }

    public function update(Request $request, Product $product, ProductVariantService $service): RedirectResponse
    {
        $this->authorizeProduct($request, $product);
        $product->update($this->validated($request, $product, $service));
        $this->storeImages($request, $product);
        $this->storeVideo($request, $product);
        $service->syncFromOptionSpec($product, (string) $request->input('product_options', ''));

        return to_route('seller.products');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeProduct($request, $product);
        $product->load('images');
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
            $image->delete();
        }
        $product->delete();

        return to_route('seller.products');
    }

    private function authorizeProduct(Request $request, Product $product): void
    {
        abort_unless($this->shopFor($request)->id === $product->shop_id, 403);
    }

    private function shopFor(Request $request)
    {
        $user = $request->user();

        return $user->shop ?? $user->shop()->create([
            'name' => $user->name.' Shop',
            'slug' => Str::slug($user->name).'-'.Str::lower(Str::random(5)),
            'status' => 'approved',
            'commission_rate' => 10,
        ]);
    }

    private function validated(Request $request, ?Product $product, ProductVariantService $service): array
    {
        return $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'condition' => ['nullable', 'string', 'in:new,used,refurbished'],
            'selling_unit' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:255'],
            'size' => ['nullable', 'string', 'max:255'],
            'material' => ['nullable', 'string', 'max:255'],
            'weight' => ['nullable', 'string', 'max:255'],
            'volume' => ['nullable', 'string', 'max:255'],
            'pack_quantity' => ['nullable', 'integer', 'min:1'],
            'length' => ['nullable', 'string', 'max:255'],
            'width' => ['nullable', 'string', 'max:255'],
            'height' => ['nullable', 'string', 'max:255'],
            'warranty' => ['nullable', 'string', 'max:255'],
            'country_of_origin' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'product_options' => [
                Rule::requiredIf($product === null),
                'nullable',
                'string',
                function (string $attribute, mixed $value, \Closure $fail) use ($product, $service): void {
                    if ($product === null && $service->parseOptionGroups((string) $value) === []) {
                        $fail('Add at least one product variant option, for example: Crop: Tomato, Lettuce.');
                    }
                },
            ],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'product_video' => ['nullable', 'file', 'mimes:mp4,mov,webm,avi,m4v,3gp', 'max:10240'],
        ]);
    }

    private function uniqueSku(string $productName): string
    {
        $prefix = strtoupper(Str::slug($productName, '-')) ?: 'PRODUCT';
        $prefix = substr($prefix, 0, 93);
        $sku = $prefix.'-'.strtoupper(Str::random(6));

        while (Product::withTrashed()->where('sku', $sku)->exists()) {
            $sku = $prefix.'-'.strtoupper(Str::random(6));
        }

        return $sku;
    }

    private function uniqueBarcode(): string
    {
        do {
            $barcode = '20'.str_pad((string) random_int(0, 99999999999), 11, '0', STR_PAD_LEFT);
        } while (Product::withTrashed()->where('barcode', $barcode)->exists());

        return $barcode;
    }

    private function storeImages(Request $request, Product $product): void
    {
        $files = [];

        if ($request->hasFile('images')) {
            $files = $request->file('images');
        } elseif ($request->hasFile('image')) {
            $files = [$request->file('image')];
        }

        if (empty($files)) {
            return;
        }

        $product->load('images');
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
            $image->delete();
        }

        foreach ($files as $index => $file) {
            $product->images()->create([
                'path' => $file->store('products', 'public'),
                'is_primary' => $index === 0,
                'sort_order' => $index,
            ]);
        }
    }

    private function storeVideo(Request $request, Product $product): void
    {
        if (! $request->hasFile('product_video')) {
            return;
        }

        $path = $request->file('product_video')->store('products/videos', 'public');
        $product->update(['short_video_path' => $path]);
    }
}
