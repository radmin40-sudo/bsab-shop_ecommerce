<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductView;
use App\Services\ImageOptimizationService;
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
        $products = $shop->products()
            ->with([
                'category:id,name',
                'images:id,product_id,path,is_primary',
                'options.values',
                'variants' => fn ($query) => $query->orderBy('id'),
                'variants.optionValues.optionValue.option',
            ])
            ->latest()
            ->get();
        $products->each(fn (Product $product) => $product->append('product_options'));
        $productIds = $products->pluck('id');
        $now = now();
        $chartStart = $now->copy()->startOfDay()->subDays(364);
        $previousPeriodStart = $now->copy()->subMonth()->startOfMonth();
        $previousPeriodEnd = $now->copy()->subMonth()->endOfMonth();
        $viewsByDay = ProductView::query()
            ->whereIn('product_id', $productIds)
            ->whereBetween('viewed_at', [$chartStart, $now])
            ->selectRaw('DATE(viewed_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');
        $salesByDay = $shop->orderItems()
            ->whereBetween('created_at', [$chartStart, $now])
            ->selectRaw('DATE(created_at) as day, SUM(quantity) as total')
            ->groupBy('day')
            ->pluck('total', 'day');
        $dailyPerformance = collect(range(0, 364))->map(function (int $offset) use ($chartStart, $viewsByDay, $salesByDay, $products) {
            $day = $chartStart->copy()->addDays($offset);

            return [
                'date' => $day->format('Y-m-d'),
                'label' => $day->format('M j'),
                'views' => (int) ($viewsByDay->get($day->toDateString()) ?? 0),
                'sales' => (int) ($salesByDay->get($day->toDateString()) ?? 0),
                'stock' => (int) $products->sum('stock_quantity'),
            ];
        });
        $periodChange = function (int|float $current, int|float $previous): float {
            if ($previous === 0) {
                return $current === 0 ? 0.0 : 100.0;
            }

            return round((($current - $previous) / $previous) * 100, 1);
        };
        $previousPeriodProducts = $shop->products()
            ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
            ->count();
        $currentPeriodProducts = $shop->products()
            ->whereBetween('created_at', [$now->copy()->startOfMonth(), $now])
            ->count();
        $previousPeriodPublished = $shop->products()
            ->where('status', 'published')
            ->whereBetween('updated_at', [$previousPeriodStart, $previousPeriodEnd])
            ->count();
        $currentPeriodPublished = $shop->products()
            ->where('status', 'published')
            ->whereBetween('updated_at', [$now->copy()->startOfMonth(), $now])
            ->count();
        $previousPeriodLowStock = $shop->products()
            ->where('stock_quantity', '<', 5)
            ->whereBetween('updated_at', [$previousPeriodStart, $previousPeriodEnd])
            ->count();
        $currentPeriodLowStock = $shop->products()
            ->where('stock_quantity', '<', 5)
            ->whereBetween('updated_at', [$now->copy()->startOfMonth(), $now])
            ->count();
        $previousPeriodPending = $shop->products()
            ->where('status', 'pending')
            ->whereBetween('updated_at', [$previousPeriodStart, $previousPeriodEnd])
            ->count();
        $currentPeriodPending = $shop->products()
            ->where('status', 'pending')
            ->whereBetween('updated_at', [$now->copy()->startOfMonth(), $now])
            ->count();
        $currentViews = (int) ProductView::query()
            ->whereIn('product_id', $productIds)
            ->whereBetween('viewed_at', [$now->copy()->startOfMonth(), $now])
            ->count();
        $previousViews = (int) ProductView::query()
            ->whereIn('product_id', $productIds)
            ->whereBetween('viewed_at', [$previousPeriodStart, $previousPeriodEnd])
            ->count();
        $currentSales = (int) $shop->orderItems()
            ->whereBetween('created_at', [$now->copy()->startOfMonth(), $now])
            ->sum('quantity');
        $previousSales = (int) $shop->orderItems()
            ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
            ->sum('quantity');
        $totalSales = (int) $shop->orderItems()->sum('quantity');
        $inventoryValue = (float) $products->sum(fn (Product $product) => $product->stock_quantity * (float) ($product->sale_price ?: $product->base_price));
        $statusCounts = $products->countBy(fn (Product $product) => strtolower((string) $product->status));
        $viewsAllTime = (int) ProductView::query()->whereIn('product_id', $productIds)->count();
        $ordersWithProducts = $shop->orderItems()->distinct('order_id')->count('order_id');
        $conversionRate = $viewsAllTime > 0 ? round(($ordersWithProducts / $viewsAllTime) * 100, 1) : 0;

        return Inertia::render('seller/products', [
            'products' => $products,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'monitoring' => [
                'totalProducts' => $products->count(),
                'published' => (int) $statusCounts->get('published', 0),
                'lowStock' => $products->where('stock_quantity', '<', 5)->count(),
                'pendingReview' => (int) $statusCounts->get('pending', 0),
                'views' => $viewsAllTime,
                'viewsChange' => $periodChange($currentViews, $previousViews),
                'sales' => $totalSales,
                'salesChange' => $periodChange($currentSales, $previousSales),
                'inventoryValue' => round($inventoryValue, 2),
                'conversionRate' => $conversionRate,
                'productChange' => $periodChange($currentPeriodProducts, $previousPeriodProducts),
                'publishedChange' => $periodChange($currentPeriodPublished, $previousPeriodPublished),
                'lowStockChange' => $periodChange($currentPeriodLowStock, $previousPeriodLowStock),
                'pendingReviewChange' => $periodChange($currentPeriodPending, $previousPeriodPending),
                'dailyPerformance' => $dailyPerformance,
                'statusBreakdown' => [
                    ['name' => 'Published', 'value' => (int) $statusCounts->get('published', 0), 'color' => '#38a86b'],
                    ['name' => 'Pending review', 'value' => (int) $statusCounts->get('pending', 0), 'color' => '#f0b33c'],
                    ['name' => 'Draft', 'value' => (int) $statusCounts->get('draft', 0), 'color' => '#cbded2'],
                    ['name' => 'Rejected', 'value' => (int) $statusCounts->get('rejected', 0), 'color' => '#ef5a50'],
                ],
            ],
        ]);
    }

    public function store(Request $request, ProductVariantService $service, ImageOptimizationService $images): RedirectResponse
    {
        $shop = $this->shopFor($request);

        $data = $this->validated($request, null, $service);
        $data['shop_id'] = $shop->id;
        $data['slug'] = Str::slug($data['name']).'-'.Str::lower(Str::random(5));
        $data['sku'] = $this->uniqueSku($data['name']);
        $data['barcode'] = $this->uniqueBarcode();
        $data['status'] = 'pending';
        $product = $shop->products()->create($data);
        $this->storeImages($request, $product, $images);
        $this->storeVideo($request, $product);
        $service->syncFromOptionSpec(
            $product,
            (string) $request->input('product_options', ''),
            $this->variantStocks($request),
            $this->variantPrices($request),
        );

        return to_route('seller.products');
    }

    public function update(Request $request, Product $product, ProductVariantService $service, ImageOptimizationService $images): RedirectResponse
    {
        $this->authorizeProduct($request, $product);
        $product->update($this->validated($request, $product, $service));
        $this->storeImages($request, $product, $images);
        $this->storeVideo($request, $product);
        $service->syncFromOptionSpec(
            $product,
            (string) $request->input('product_options', ''),
            $this->variantStocks($request),
            $this->variantPrices($request),
        );

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
            'variant_stocks' => [
                'nullable',
                'json',
                function (string $attribute, mixed $value, \Closure $fail) use ($request, $service): void {
                    if ($value === null || $value === '') {
                        return;
                    }

                    $stockValues = json_decode((string) $value, true);
                    if (! is_array($stockValues) || ! array_is_list($stockValues) || $stockValues === []) {
                        $fail('Enter stock for every product variant combination.');

                        return;
                    }

                    $combinationCount = 1;
                    foreach ($service->parseOptionGroups((string) $request->input('product_options', '')) as [, $values]) {
                        $combinationCount *= count($values);
                    }

                    if (count($stockValues) !== $combinationCount) {
                        $fail('Enter stock for every product variant combination.');

                        return;
                    }

                    foreach ($stockValues as $stockValue) {
                        if (filter_var($stockValue, FILTER_VALIDATE_INT) === false || (int) $stockValue < 0) {
                            $fail('Variant stock quantities must be whole numbers of zero or more.');

                            return;
                        }
                    }

                    if (array_sum(array_map('intval', $stockValues)) !== (int) $request->input('stock_quantity')) {
                        $fail('The total stock must equal the sum of variant combination stock.');
                    }
                },
            ],
            'variant_prices' => [
                'nullable',
                'json',
                function (string $attribute, mixed $value, \Closure $fail) use ($request, $service): void {
                    if ($value === null || $value === '') {
                        return;
                    }

                    $prices = json_decode((string) $value, true);
                    if (! is_array($prices) || ! array_is_list($prices) || $prices === []) {
                        $fail('Enter a price for every product variant combination.');

                        return;
                    }

                    $combinationCount = 1;
                    foreach ($service->parseOptionGroups((string) $request->input('product_options', '')) as [, $values]) {
                        $combinationCount *= count($values);
                    }

                    if (count($prices) !== $combinationCount) {
                        $fail('Enter a price for every product variant combination.');

                        return;
                    }

                    foreach ($prices as $price) {
                        if (! is_numeric($price) || (float) $price < 0) {
                            $fail('Variant prices must be zero or more.');

                            return;
                        }
                    }
                },
            ],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('images.max_upload_kb')],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('images.max_upload_kb')],
            'product_video' => ['nullable', 'file', 'mimes:mp4,mov,webm,avi,m4v,3gp', 'max:10240'],
        ]);
    }

    private function variantStocks(Request $request): array
    {
        $stockValues = json_decode((string) $request->input('variant_stocks', '[]'), true);

        return is_array($stockValues) ? array_values($stockValues) : [];
    }

    private function variantPrices(Request $request): array
    {
        $prices = json_decode((string) $request->input('variant_prices', '[]'), true);

        return is_array($prices) ? array_values($prices) : [];
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

    private function storeImages(Request $request, Product $product, ImageOptimizationService $images): void
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
                'path' => $images->store($file, 'products', ['max_dimension' => config('images.product_max_dimension')]),
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
