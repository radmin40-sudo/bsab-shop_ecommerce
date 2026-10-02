<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VoucherManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $isAdmin = $request->user()->hasRole('admin');
        $shop = $isAdmin ? null : Shop::where('user_id', $request->user()->id)->firstOrFail();
        $query = Voucher::query()->withCount(['claims', 'usages'])->with(['products:id,name,base_price,category_id', 'categories:id,name', 'sellers:id,name', 'variants:id,name,sku,stock_quantity,product_id']);
        if ($shop) {
            $query->where('seller_id', $shop->id);
        }
        if ($request->filled('search')) {
            $search = '%'.$request->string('search')->trim().'%';
            $query->where(fn ($builder) => $builder->where('name', 'like', $search)->orWhere('code', 'like', $search));
        }
        if ($request->input('filter') === 'active') {
            $query->where('is_active', true)->where(fn ($builder) => $builder->whereNull('expires_at')->orWhere('expires_at', '>', now()));
        } elseif ($request->input('filter') === 'disabled') {
            $query->where('is_active', false);
        } elseif ($request->input('filter') === 'expired') {
            $query->whereNotNull('expires_at')->where('expires_at', '<=', now());
        } elseif ($request->input('filter') === 'scheduled') {
            $query->where('starts_at', '>', now());
        } elseif ($request->input('filter') === 'unclaimed') {
            $query->whereDoesntHave('claims');
        }

        $sort = $request->input('sort', 'newest');
        match ($sort) {
            'oldest' => $query->oldest(),
            'most_used' => $query->orderByDesc('usages_count'),
            'expires' => $query->orderBy('expires_at'),
            default => $query->latest(),
        };

        return Inertia::render('vouchers/index', [
            'vouchers' => $query->paginate(12)->withQueryString(),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'sellers' => $isAdmin ? Shop::query()->orderBy('name')->get(['id', 'name']) : [],
            'products' => $this->productQuery($request, $shop),
            'isAdmin' => $isAdmin,
            'shop' => $shop ? ['id' => $shop->id, 'name' => $shop->name] : null,
            'filters' => $request->only('search', 'filter', 'sort'),
        ]);
    }

    public function products(Request $request)
    {
        $shop = $request->user()->hasRole('admin') ? null : Shop::where('user_id', $request->user()->id)->firstOrFail();

        return response()->json($this->productQuery($request, $shop));
    }

    public function show(Request $request, Voucher $voucher): Response
    {
        $this->authorizeVoucher($request, $voucher);
        $voucher->load(['products:id,name,base_price,category_id', 'products.category:id,name', 'categories:id,name', 'sellers:id,name', 'variants:id,name,sku,product_id', 'claims.user:id,name,email', 'claims.order:id,order_number', 'usages.user:id,name,email', 'usages.order:id,order_number']);
        $usedCount = $voucher->usages->where('status', 'used')->count();
        $totalClaims = $voucher->claims->count();
        $totalDiscount = $voucher->usages->where('status', 'used')->sum('discount_amount');

        return Inertia::render('vouchers/show', [
            'voucher' => $voucher,
            'isAdmin' => $request->user()->hasRole('admin'),
            'stats' => [
                'claims' => $totalClaims,
                'used' => $usedCount,
                'remaining' => $voucher->total_usage_limit === null ? null : max(0, $voucher->total_usage_limit - $usedCount),
                'totalDiscount' => $totalDiscount,
                'usageRate' => $totalClaims > 0 ? round(($usedCount / $totalClaims) * 100, 1) : 0,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $attributes = $this->withLegacyVoucherColumns($data, $request);
        $shop = $request->user()->hasRole('admin') ? null : Shop::where('user_id', $request->user()->id)->firstOrFail();

        DB::transaction(function () use ($data, $attributes, $shop) {
            $voucher = Voucher::create([
                ...$attributes,
                'code' => $data['code'] ?: $this->generateCode(),
                'seller_id' => $shop?->id ?? ($data['seller_id'] ?? null),
            ]);
            $this->syncTargets($voucher, $data, $shop, false);
        });

        return back()->with('success', 'Voucher created successfully.');
    }

    public function update(Request $request, Voucher $voucher): RedirectResponse
    {
        $shop = $request->user()->hasRole('admin') ? null : Shop::where('user_id', $request->user()->id)->firstOrFail();
        abort_if($shop && $voucher->seller_id !== $shop->id, 403);
        $data = $this->validatedData($request, $voucher);
        $attributes = $this->withLegacyVoucherColumns($data, $request);

        DB::transaction(function () use ($voucher, $data, $attributes, $shop) {
            $voucher->update([
                ...$attributes,
                'code' => $data['code'] ?: $voucher->code,
                'seller_id' => $shop?->id ?? ($data['seller_id'] ?? null),
            ]);
            $this->syncTargets($voucher, $data, $shop);
        });

        return back()->with('success', 'Voucher updated successfully.');
    }

    public function toggle(Request $request, Voucher $voucher): RedirectResponse
    {
        $this->authorizeVoucher($request, $voucher);
        $voucher->update(['is_active' => ! $voucher->is_active]);

        return back()->with('success', $voucher->is_active ? 'Voucher activated.' : 'Voucher deactivated.');
    }

    public function duplicate(Request $request, Voucher $voucher): RedirectResponse
    {
        $this->authorizeVoucher($request, $voucher);
        $copy = DB::transaction(function () use ($voucher) {
            $copy = $voucher->replicate();
            $copy->name = $voucher->name.' copy';
            $copy->code = $this->generateCode();
            $copy->is_active = false;
            $copy->save();
            $copy->products()->sync($voucher->products()->pluck('products.id'));
            $copy->categories()->sync($voucher->categories()->pluck('categories.id'));
            $copy->sellers()->sync($voucher->sellers()->pluck('shops.id'));
            $copy->variants()->sync($voucher->variants()->pluck('product_variants.id'));
            return $copy;
        });

        return back()->with('success', 'Voucher duplicated as '.$copy->code.'.');
    }

    public function destroy(Request $request, Voucher $voucher): RedirectResponse
    {
        $this->authorizeVoucher($request, $voucher);
        $voucher->delete();

        return back()->with('success', 'Voucher deleted successfully.');
    }

    private function authorizeVoucher(Request $request, Voucher $voucher): void
    {
        if (! $request->user()->hasRole('admin')) {
            $shop = Shop::where('user_id', $request->user()->id)->firstOrFail();
            abort_if($voucher->seller_id !== $shop->id, 403);
        }
    }

    private function validatedData(Request $request, ?Voucher $voucher = null): array
    {
        if ($request->filled('code')) {
            $request->merge(['code' => Str::upper(trim((string) $request->input('code')))]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:80', Rule::unique('vouchers', 'code')->ignore($voucher?->id)],
            'type' => ['required', 'string', 'max:40'],
            'discount_value' => [Rule::requiredIf($request->input('type') !== 'free_shipping'), 'nullable', 'numeric', 'min:0'],
            'minimum_spend' => ['nullable', 'numeric', 'min:0'],
            'maximum_discount' => ['nullable', 'numeric', 'min:0'],
            'apply_to' => ['required', Rule::in(['all', 'products', 'categories', 'variants', 'sellers'])],
            'customer_eligibility' => ['required', Rule::in(['all', 'new_customer', 'first_order'])],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after:starts_at'],
            'total_usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_customer_usage_limit' => ['nullable', 'integer', 'min:1'],
            'claim_limit' => ['nullable', 'integer', 'min:1'],
            'requires_claim' => ['boolean'],
            'free_shipping' => ['boolean'],
            'is_active' => ['boolean'],
            'description' => ['nullable', 'string'],
            'terms' => ['nullable', 'string'],
            'seller_id' => ['nullable', 'integer', 'exists:shops,id'],
            'product_ids' => ['array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'category_ids' => ['array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'variant_ids' => ['array'],
            'variant_ids.*' => ['integer', 'exists:product_variants,id'],
            'seller_ids' => ['array'],
            'seller_ids.*' => ['integer', 'exists:shops,id'],
        ]);

        $data['discount_value'] ??= 0;
        $data['minimum_spend'] ??= 0;
        $data['requires_claim'] ??= false;
        $data['free_shipping'] ??= false;
        $data['is_active'] ??= false;
        $data['product_ids'] ??= [];
        $data['category_ids'] ??= [];
        $data['variant_ids'] ??= [];
        $data['seller_ids'] ??= [];

        return $data;
    }

    private function withLegacyVoucherColumns(array $data, Request $request): array
    {
        if (Schema::hasColumn('vouchers', 'value')) {
            $data['value'] = $data['discount_value'];
        }
        if (Schema::hasColumn('vouchers', 'created_by_role')) {
            $data['created_by_role'] = $request->user()->hasRole('admin') ? 'admin' : 'seller';
        }

        return $data;
    }

    private function syncTargets(Voucher $voucher, array $data, ?Shop $shop, bool $clearUntargeted = true): void
    {
        $productIds = $data['product_ids'];
        $variantIds = $data['variant_ids'];
        $sellerIds = $data['seller_ids'];
        if ($shop) {
            $productIds = Product::where('shop_id', $shop->id)->whereIn('id', $productIds)->pluck('id')->all();
            abort_if(count($productIds) !== count($data['product_ids']), 403, 'You can only select your own products.');
            $variantIds = DB::table('product_variants')->join('products', 'products.id', '=', 'product_variants.product_id')
                ->where('products.shop_id', $shop->id)->whereIn('product_variants.id', $variantIds)->pluck('product_variants.id')->all();
            abort_if(count($variantIds) !== count($data['variant_ids']), 403, 'You can only select variants from your products.');
            $sellerIds = [$shop->id];
        }

        if (! $clearUntargeted) {
            match ($data['apply_to']) {
                'products' => $voucher->products()->sync($productIds),
                'categories' => $voucher->categories()->sync($data['category_ids']),
                'variants' => $voucher->variants()->sync($variantIds),
                'sellers' => $voucher->sellers()->sync($sellerIds),
                default => null,
            };

            return;
        }

        $voucher->products()->sync($productIds);
        $voucher->categories()->sync($data['category_ids']);
        $voucher->variants()->sync($variantIds);
        $voucher->sellers()->sync($sellerIds);
    }

    private function productQuery(Request $request, ?Shop $shop): array
    {
        $query = Product::query()->with(['category:id,name', 'shop:id,name', 'variants:id,product_id,name,sku,stock_quantity,is_active', 'images' => fn ($imageQuery) => $imageQuery->where('is_primary', true)->limit(1)]);
        if ($shop) {
            $query->where('shop_id', $shop->id);
        }
        if ($request->filled('product_search')) {
            $search = '%'.$request->string('product_search')->trim().'%';
            $query->where('name', 'like', $search);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }
        if ($request->filled('seller_id') && ! $shop) {
            $query->where('shop_id', $request->integer('seller_id'));
        }

        return $query->latest()->paginate(10, ['id', 'shop_id', 'category_id', 'name', 'base_price', 'sale_price', 'stock_quantity', 'status'], 'product_page')->withQueryString()->toArray();
    }

    private function generateCode(): string
    {
        do {
            $code = 'BSAB'.Str::upper(Str::random(6));
        } while (Voucher::where('code', $code)->exists());

        return $code;
    }
}