<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\ImageOptimizationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class AdminSellerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::role('seller')->with(['shop', 'sellerProfile']);

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function (Builder $sellerQuery) use ($search) {
                $sellerQuery->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('shop', fn (Builder $shopQuery) => $shopQuery->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->string('status'));
        }

        match ($request->input('sort', 'newest')) {
            'oldest' => $query->oldest(),
            'name' => $query->orderBy('name'),
            default => $query->latest(),
        };

        $sellers = $query->paginate(20)->withQueryString();
        $shopIds = $sellers->getCollection()->pluck('shop.id')->filter()->values();
        $performance = $shopIds->isEmpty()
            ? collect()
            : OrderItem::query()
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->whereIn('order_items.shop_id', $shopIds)
                ->whereNull('orders.deleted_at')
                ->selectRaw('order_items.shop_id, COUNT(DISTINCT order_items.order_id) as orders_count, SUM(CASE WHEN orders.status != ? THEN order_items.total_price ELSE 0 END) as total_sales', ['cancelled'])
                ->groupBy('order_items.shop_id')
                ->get()
                ->keyBy('shop_id');

        $sellers->getCollection()->transform(function (User $seller) use ($performance) {
            $shop = $seller->shop;
            $stats = $shop ? $performance->get($shop->id) : null;
            $shop?->loadCount('products');
            $seller->setAttribute('seller_metrics', [
                'products' => (int) ($shop->products_count ?? 0),
                'orders' => (int) ($stats->orders_count ?? 0),
                'sales' => round((float) ($stats->total_sales ?? 0), 2),
                'shop_visits' => null,
            ]);

            return $seller;
        });

        $sellerQuery = User::role('seller');
        $newThisMonth = (clone $sellerQuery)->where('created_at', '>=', now()->startOfMonth())->count();
        $growthStart = now()->startOfDay()->subDays(29);
        $growthCounts = (clone $sellerQuery)
            ->where('created_at', '>=', $growthStart)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->pluck('total', 'date');
        $growth = collect(range(0, 29))->map(function (int $offset) use ($growthStart, $growthCounts) {
            $date = $growthStart->copy()->addDays($offset);

            return ['label' => $date->format('M j'), 'value' => (int) $growthCounts->get($date->toDateString(), 0)];
        })->values();

        return response()->json(array_merge($sellers->toArray(), [
            'stats' => [
                'total' => (clone $sellerQuery)->count(),
                'active' => (clone $sellerQuery)->where('status', 'active')->count(),
                'inactive' => (clone $sellerQuery)->where('status', 'inactive')->count(),
                'suspended' => (clone $sellerQuery)->where('status', 'suspended')->count(),
                'new_this_month' => $newThisMonth,
            ],
            'growth' => $growth,
            'growth_has_data' => $growth->sum('value') > 0,
        ]));
    }

    public function store(Request $request, ImageOptimizationService $images)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', 'string', 'min:12', 'confirmed'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'suspended'])],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('images.max_upload_kb')],
            'shop_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('images.max_upload_kb')],
            'shop_name' => ['required', 'string', 'max:255'],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);
        $seller = DB::transaction(function () use ($data, $request, $images) {
            $avatar = $request->hasFile('avatar')
                ? $images->store($request->file('avatar'), 'avatars', ['max_dimension' => config('images.profile_max_dimension')])
                : null;
            $logo = $request->hasFile('shop_image')
                ? $images->store($request->file('shop_image'), 'shops', ['max_dimension' => config('images.profile_max_dimension', 800)])
                : null;
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => 'seller',
                'phone' => $data['phone'] ?? null,
                'avatar' => $avatar,
                'status' => $data['status'] ?? 'active',
                'password' => Hash::make($data['password'] ?? Str::password(16)),
                'must_change_password' => ! isset($data['password']),
            ]);
            $user->assignRole('seller');
            DB::table('users')->where('id', $user->id)->update(['role' => 'seller']);
            $user->refresh();
            $user->shop()->create([
                'created_by' => $request->user()->id,
                'name' => $data['shop_name'],
                'slug' => Str::slug($data['shop_name']).'-'.Str::lower(Str::random(5)),
                'logo' => $logo,
                'commission_rate' => $data['commission_rate'] ?? 10,
            ]);

            return $user->load(['shop', 'sellerProfile']);
        });

        return response()->json($seller, 201);
    }

    public function update(Request $request, User $seller, ImageOptimizationService $images)
    {
        abort_unless($seller->hasRole('seller'), 404);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($seller->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('images.max_upload_kb')],
            'shop_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('images.max_upload_kb')],
            'shop_name' => ['sometimes', 'string', 'max:255'],
        ]);
        if ($request->hasFile('avatar')) {
            if ($seller->avatar) {
                Storage::disk('public')->delete($seller->avatar);
            }
            $data['avatar'] = $images->store($request->file('avatar'), 'avatars', ['max_dimension' => config('images.profile_max_dimension')]);
        }
        if ($request->hasFile('shop_image')) {
            $seller->shop?->logo && Storage::disk('public')->delete($seller->shop->logo);
            $shopImage = $images->store($request->file('shop_image'), 'shops', ['max_dimension' => config('images.profile_max_dimension', 800)]);
            $seller->shop?->update(['logo' => $shopImage]);
            unset($data['shop_image']);
        }
        $shopName = $data['shop_name'] ?? null;
        unset($data['shop_name'], $data['shop_image']);
        $seller->update($data);
        if ($shopName !== null) {
            $seller->shop?->update(['name' => $shopName]);
        }

        return $seller->load(['shop', 'sellerProfile']);
    }

    public function suspend(User $seller)
    {
        abort_unless($seller->hasRole('seller'), 404);
        $seller->update(['status' => 'suspended']);

        return $seller;
    }

    public function reactivate(User $seller)
    {
        abort_unless($seller->hasRole('seller'), 404);
        $seller->update(['status' => 'active']);

        return $seller;
    }

    public function destroy(User $seller)
    {
        abort_unless($seller->hasRole('seller'), 404);
        if ($seller->avatar) {
            Storage::disk('public')->delete($seller->avatar);
        }
        DB::transaction(fn () => $seller->delete());

        return response()->noContent();
    }
}
