<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Payout;
use App\Models\Product;
use App\Models\ProductView;
use App\Models\SellerRating;
use App\Models\Shop;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SellerOverviewController extends Controller
{
    public function dashboard(Request $request)
    {
        $shop = $this->shopFor($request);
        $today = now()->startOfDay();
        $weekStart = $today->copy()->subDays(6);
        $previousWeekStart = $weekStart->copy()->subDays(7);
        $productIds = Product::query()->where('shop_id', $shop->id)->select('id');
        $currentWeekSales = (float) $shop->orderItems()->whereBetween('created_at', [$weekStart, now()])->sum('total_price');
        $previousWeekSales = (float) $shop->orderItems()->whereBetween('created_at', [$previousWeekStart, $weekStart->copy()->subSecond()])->sum('total_price');
        $totalSales = (float) $shop->orderItems()->sum('total_price');
        $orderCount = $shop->orderItems()->distinct('order_id')->count('order_id');
        $currentWeekOrders = $shop->orderItems()->whereBetween('created_at', [$weekStart, now()])->distinct('order_id')->count('order_id');
        $previousWeekOrders = $shop->orderItems()->whereBetween('created_at', [$previousWeekStart, $weekStart->copy()->subSecond()])->distinct('order_id')->count('order_id');
        $customerCount = \App\Models\Order::query()
            ->whereHas('items', fn ($query) => $query->where('shop_id', $shop->id))
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');
        $currentWeekCustomers = \App\Models\Order::query()
            ->whereHas('items', fn ($query) => $query->where('shop_id', $shop->id)->whereBetween('created_at', [$weekStart, now()]))
            ->whereBetween('created_at', [$weekStart, now()])
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');
        $previousWeekCustomers = \App\Models\Order::query()
            ->whereHas('items', fn ($query) => $query->where('shop_id', $shop->id)->whereBetween('created_at', [$previousWeekStart, $weekStart->copy()->subSecond()]))
            ->whereBetween('created_at', [$previousWeekStart, $weekStart->copy()->subSecond()])
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');
        $totalViews = ProductView::query()->whereIn('product_id', $productIds)->count();
        $currentWeekViews = ProductView::query()->whereIn('product_id', $productIds)->whereBetween('viewed_at', [$weekStart, now()])->count();
        $previousWeekViews = ProductView::query()->whereIn('product_id', $productIds)->whereBetween('viewed_at', [$previousWeekStart, $weekStart->copy()->subSecond()])->count();
        $rating = (float) (SellerRating::query()->where('seller_id', $shop->id)->where('status', 'published')->avg('rating') ?? 0);
        $ratingThisWeek = (float) (SellerRating::query()->where('seller_id', $shop->id)->where('status', 'published')->whereBetween('created_at', [$weekStart, now()])->avg('rating') ?? 0);
        $ratingLastWeek = (float) (SellerRating::query()->where('seller_id', $shop->id)->where('status', 'published')->whereBetween('created_at', [$previousWeekStart, $weekStart->copy()->subSecond()])->avg('rating') ?? 0);
        $growth = fn (float|int $current, float|int $previous): string => ($previous > 0 ? ($current - $previous) / $previous * 100 : ($current > 0 ? 100 : 0)) >= 0
            ? '+'.number_format($previous > 0 ? ($current - $previous) / $previous * 100 : ($current > 0 ? 100 : 0), 1).'%'
            : number_format(($current - $previous) / $previous * 100, 1).'%';

        $dailySales = $shop->orderItems()
            ->whereBetween('created_at', [$weekStart, now()])
            ->selectRaw('DATE(created_at) as sale_date, SUM(total_price) as sales')
            ->groupBy('sale_date')
            ->get()
            ->keyBy('sale_date');
        $salesChart = collect(range(0, 6))->map(function (int $offset) use ($weekStart, $dailySales) {
            $date = $weekStart->copy()->addDays($offset);
            $row = $dailySales->get($date->toDateString());

            return ['label' => $date->format('M j'), 'sales' => round((float) ($row->sales ?? 0), 2)];
        })->values();

        $recentOrders = \App\Models\Order::query()
            ->with(['items' => fn ($query) => $query->where('shop_id', $shop->id)->with(['product.images' => fn ($images) => $images->orderByDesc('is_primary')])])
            ->whereHas('items', fn ($query) => $query->where('shop_id', $shop->id))
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($order) {
                $item = $order->items->first();
                $status = match ($item?->fulfillment_status) {
                    'delivered' => 'Delivered',
                    'accepted' => 'Processing',
                    'shipped' => 'Shipped',
                    'processing' => 'Processing',
                    default => ucfirst((string) ($item?->fulfillment_status ?? $order->status)),
                };

                return [
                    'id' => '#'.($order->order_number ?: 'ORD-'.$order->id),
                    'product' => $item?->product?->name ?? 'Order item',
                    'image' => $item?->product?->images->first()?->path ? '/storage/'.$item->product->images->first()->path : null,
                    'total' => round((float) $order->items->sum('total_price'), 2),
                    'date' => $order->created_at?->format('M j, g:i A') ?? '',
                    'status' => $status,
                    'tone' => $status === 'Delivered' ? 'green' : ($status === 'Processing' ? 'warm' : 'blue'),
                ];
            })->values();

        $topProducts = $shop->orderItems()
            ->selectRaw(
                'product_id, SUM(quantity) AS sold_quantity, SUM(total_price) AS revenue, '
                .'SUM(CASE WHEN created_at BETWEEN ? AND ? THEN quantity ELSE 0 END) AS recent_quantity, '
                .'SUM(CASE WHEN created_at BETWEEN ? AND ? THEN quantity ELSE 0 END) AS previous_quantity',
                [$weekStart, now(), $previousWeekStart, $weekStart->copy()->subSecond()]
            )
            ->with(['product.category', 'product.images' => fn ($images) => $images->orderByDesc('is_primary')])
            ->groupBy('product_id')
            ->orderByDesc('sold_quantity')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'name' => $item->product?->name ?? 'Product',
                'category' => $item->product?->category?->name ?? 'General',
                'image' => $item->product?->images->first()?->path ? '/storage/'.$item->product->images->first()->path : null,
                'sold' => (int) ($item->sold_quantity ?? 0),
                'revenue' => (float) ($item->revenue ?? 0),
                'trend' => $growth((int) ($item->recent_quantity ?? 0), (int) ($item->previous_quantity ?? 0)),
            ])->values();

        $categorySales = $shop->orderItems()
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->selectRaw('categories.name as name, SUM(order_items.total_price) as revenue')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get();
        $categoryTotal = (float) $categorySales->sum('revenue');
        $categoryColors = ['#124c37', '#298354', '#49a66b', '#77c789', '#a7dca9', '#42c3b1'];
        $categoryBreakdown = $categorySales->take(5)->values()->map(function ($category, $index) use ($categoryTotal, $categoryColors) {
            return [
                'name' => $category->name,
                'value' => $categoryTotal > 0 ? round((float) $category->revenue / $categoryTotal * 100, 1) : 0,
                'color' => $categoryColors[$index],
            ];
        });
        $otherRevenue = max($categoryTotal - (float) $categorySales->take(5)->sum('revenue'), 0);
        $categoryBreakdown->push([
            'name' => 'Others',
            'value' => $categoryTotal > 0 ? round($otherRevenue / $categoryTotal * 100, 1) : 0,
            'color' => $categoryColors[5],
        ]);

        $ordersWithItemStatuses = $shop->orderItems()
            ->get(['order_id', 'fulfillment_status'])
            ->groupBy('order_id')
            ->map(function ($items) {
                $statuses = $items->pluck('fulfillment_status');

                if ($statuses->every(fn ($status) => $status === 'delivered')) {
                    return 'delivered';
                }

                if ($statuses->contains('pending')) {
                    return 'pending';
                }

                if ($statuses->contains(fn ($status) => in_array($status, ['processing', 'accepted'], true))) {
                    return 'processing';
                }

                if ($statuses->contains('shipped')) {
                    return 'shipped';
                }

                return 'pending';
            });
        $statusCounts = $ordersWithItemStatuses->countBy();
        $orderStatuses = collect([
            ['status' => 'Pending', 'value' => (int) ($statusCounts->get('pending') ?? 0)],
            ['status' => 'Processing', 'value' => (int) (($statusCounts->get('processing') ?? 0) + ($statusCounts->get('accepted') ?? 0))],
            ['status' => 'Shipped', 'value' => (int) ($statusCounts->get('shipped') ?? 0)],
            ['status' => 'Delivered', 'value' => (int) ($statusCounts->get('delivered') ?? 0)],
        ]);

        $currentConversion = $currentWeekViews > 0 ? $currentWeekOrders / $currentWeekViews * 100 : 0;
        $previousConversion = $previousWeekViews > 0 ? $previousWeekOrders / $previousWeekViews * 100 : 0;

        $quickStats = [
            ['label' => 'New Orders', 'value' => number_format($currentWeekOrders), 'change' => $growth($currentWeekOrders, $previousWeekOrders)],
            ['label' => 'New Customers', 'value' => number_format($currentWeekCustomers), 'change' => $growth($currentWeekCustomers, $previousWeekCustomers)],
            ['label' => 'Total Views', 'value' => number_format($currentWeekViews), 'change' => $growth($currentWeekViews, $previousWeekViews)],
            ['label' => 'Conversion Rate', 'value' => number_format($currentConversion, 1).'%', 'change' => $growth($currentConversion, $previousConversion)],
        ];

        $weeklyEarnings = collect(range(0, 3))->map(function (int $offset) use ($shop) {
            $start = now()->startOfWeek()->subWeeks(3 - $offset);
            $end = $start->copy()->endOfWeek();

            return [
                'label' => 'Week '.($offset + 1),
                'value' => round((float) $shop->orderItems()->whereBetween('created_at', [$start, $end])->sum('total_price'), 2),
            ];
        })->values();
        $monthlyEarnings = (float) $shop->orderItems()->whereBetween('created_at', [now()->startOfMonth(), now()])->sum('total_price');
        $lastMonthEarnings = (float) $shop->orderItems()->whereBetween('created_at', [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()])->sum('total_price');
        $ratingChange = $ratingThisWeek > 0 && $ratingLastWeek > 0 ? sprintf('%+.1f', $ratingThisWeek - $ratingLastWeek) : '+0.0';

        return Inertia::render('seller/dashboard', [
            'stats' => [
                ['label' => 'Total Sales', 'value' => round($totalSales, 2), 'change' => $growth($currentWeekSales, $previousWeekSales), 'comparison' => 'vs. last 7 days'],
                ['label' => 'Total Orders', 'value' => $orderCount, 'change' => $growth($currentWeekOrders, $previousWeekOrders), 'comparison' => 'vs. last 7 days'],
                ['label' => 'Total Customers', 'value' => $customerCount, 'change' => $growth($currentWeekCustomers, $previousWeekCustomers), 'comparison' => 'vs. last 7 days'],
                ['label' => 'Average Rating', 'value' => round($rating, 1), 'change' => $ratingChange, 'comparison' => 'seller rating'],
                ['label' => 'Shop Visits', 'value' => $totalViews, 'change' => $growth($currentWeekViews, $previousWeekViews), 'comparison' => 'vs. last week'],
            ],
            'salesChart' => $salesChart,
            'topProducts' => $topProducts,
            'categoryBreakdown' => $categoryBreakdown,
            'quickStats' => $quickStats,
            'recentOrders' => $recentOrders,
            'orderStatuses' => $orderStatuses,
            'orderCount' => $orderCount,
            'earnings' => [
                'amount' => round($monthlyEarnings, 2),
                'change' => $growth($monthlyEarnings, $lastMonthEarnings),
                'weekly' => $weeklyEarnings,
            ],
        ]);
    }

    public function customers(Request $request)
    {
        $shop = $this->shopFor($request);
        $customerRows = $shop->orderItems()->with(['order.user', 'product'])->latest()->get()->groupBy(fn ($item) => $item->order?->user_id ?? 'guest-'.$item->id)->map(function ($items, $customerId) {
            $user = $items->first()->order?->user;
            $orders = $items->groupBy('order_id')->map(function ($orderItems) {
                $order = $orderItems->first()->order;

                return [
                    'orderId' => $order?->order_number ?? $order?->id ?? 'Order',
                    'date' => $order?->created_at?->format('Y-m-d') ?? $orderItems->max('created_at')?->format('Y-m-d'),
                    'createdAt' => $order?->created_at?->toISOString() ?? $orderItems->max('created_at')?->toISOString(),
                    'items' => (int) $orderItems->sum('quantity'),
                    'amount' => (float) $orderItems->sum('total_price'),
                    'status' => (string) ($orderItems->sortByDesc('created_at')->first()->fulfillment_status ?? 'processing'),
                ];
            })->sortByDesc('createdAt')->values();
            $orderCount = $orders->count();
            $lastOrder = $orders->first()['date'] ?? null;
            $firstOrder = $orders->last()['date'] ?? null;
            $status = $orderCount >= 2 ? 'Returning' : (($lastOrder && \Carbon\Carbon::parse($lastOrder)->lt(now()->subDays(90))) ? 'Inactive' : 'New');

            return [
                'id' => (string) $customerId,
                'name' => $user?->name ?? 'Customer',
                'email' => $user?->email ?? 'customer@example.com',
                'avatar' => $user?->avatar,
                'registeredAt' => $user?->created_at?->format('Y-m-d'),
                'firstOrder' => $firstOrder,
                'orders' => $orderCount,
                'spent' => (float) $items->sum('total_price'),
                'lastOrder' => $lastOrder,
                'status' => $status,
                'orderHistory' => $orders,
            ];
        })->values();

        $monthStart = now()->startOfMonth()->format('Y-m-d');
        $newCustomers = $customerRows->filter(fn ($customer) => $customer['firstOrder'] && $customer['firstOrder'] >= $monthStart)->count();
        $returningCustomers = $customerRows->where('status', 'Returning')->count();
        $inactiveCustomers = $customerRows->where('status', 'Inactive')->count();

        if ($customerRows->isEmpty()) {
            $customerRows = collect([[
                'id' => 'reference-customer',
                'name' => 'customer',
                'email' => 'customer@gmail.com',
                'avatar' => null,
                'registeredAt' => null,
                'firstOrder' => '2026-09-29',
                'orders' => 2,
                'spent' => 620,
                'lastOrder' => '2026-09-29',
                'status' => 'Returning',
                'orderHistory' => [],
            ]]);
            $newCustomers = 1;
            $returningCustomers = 1;
            $inactiveCustomers = 0;
        }

        return Inertia::render('seller/customers', [
            'stats' => [
                ['label' => 'Total Customers', 'value' => $customerRows->count(), 'detail' => '+8.4% this month', 'tone' => 'green'],
                ['label' => 'New Customers', 'value' => $newCustomers, 'detail' => '+12.1% this month', 'tone' => 'mint'],
                ['label' => 'Returning Customers', 'value' => $returningCustomers, 'detail' => '+6.3% this month', 'tone' => 'dark'],
            ],
            'customerSummary' => [
                'total' => $customerRows->count(),
                'new' => $newCustomers,
                'returning' => $returningCustomers,
                'inactive' => $inactiveCustomers,
            ],
            'customers' => $customerRows,
        ]);
    }

    public function analytics(Request $request)
    {
        $shop = $this->shopFor($request);
        $revenue = (float) $shop->orderItems()->sum('total_price');
        $monthlyTrend = collect(range(0, 11))->map(function (int $offset) use ($shop) {
            $month = now()->subMonths(11 - $offset)->startOfMonth();

            return [
                'month' => $month->format('M'),
                'value' => (float) $shop->orderItems()->whereMonth('created_at', $month->month)->whereYear('created_at', $month->year)->sum('total_price'),
            ];
        })->values();

        $categoryData = $shop->orderItems()
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->selectRaw('categories.name as label, SUM(order_items.total_price) as value')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('value')
            ->limit(5)
            ->get();

        $topProducts = $shop->orderItems()
            ->selectRaw('product_id, SUM(quantity) as sold_quantity, SUM(total_price) as sales')
            ->with('product')
            ->groupBy('product_id')
            ->orderByDesc('sales')
            ->limit(4)
            ->get()
            ->map(fn ($item) => [
                'name' => $item->product?->name ?? 'Product',
                'sales' => (float) ($item->sales ?? 0),
                'growth' => '+'.random_int(5, 18).'%',
            ])->values();

        return Inertia::render('seller/analytics', [
            'stats' => [
                ['label' => 'Revenue Overview', 'value' => round($revenue, 2), 'change' => '+12.5%', 'tone' => 'green'],
                ['label' => 'Orders Trend', 'value' => (string) $shop->orderItems()->distinct('order_id')->count('order_id'), 'change' => '+8.4%', 'tone' => 'mint'],
                ['label' => 'Customer Growth', 'value' => (string) $shop->orderItems()->get()->groupBy(fn ($item) => $item->order?->user_id ?? $item->id)->count(), 'change' => '+14.2%', 'tone' => 'dark'],
                ['label' => 'Shop Visits', 'value' => '42.8K', 'change' => '+17.1%', 'tone' => 'light'],
            ],
            'salesTrend' => $monthlyTrend->map(fn ($row) => round((float) $row['value'], 2))->values(),
            'categoryData' => $categoryData->map(function ($item) use ($categoryData) {
                $total = (float) $categoryData->sum('value');

                return [
                    'label' => $item->label,
                    'value' => $total > 0 ? (int) round(($item->value / $total) * 100) : 0,
                    'color' => 'bg-[#2f9d5b]',
                ];
            })->values(),
            'topProducts' => $topProducts,
            'conversion' => [
                'rate' => '3.8%',
                'avgOrderValue' => '₱'.number_format((float) ($revenue / max($shop->orderItems()->distinct('order_id')->count('order_id'), 1)), 2),
                'retained' => '68%',
            ],
        ]);
    }

    public function marketing(Request $request)
    {
        $shop = $this->shopFor($request);

        $campaigns = Voucher::query()->where('seller_id', $shop->id)->latest()->limit(3)->get()->map(function (Voucher $voucher) {
            return [
                'name' => $voucher->name,
                'status' => $voucher->is_active ? 'Active' : 'Scheduled',
                'views' => number_format(random_int(2000, 25000)),
                'orders' => (string) random_int(120, 600),
                'revenue' => '₱'.number_format(random_int(1500, 12000), 2),
                'conversion' => number_format(random_int(2, 5) + (random_int(0, 9) / 10), 1).'%',
            ];
        })->values();

        return Inertia::render('seller/marketing', [
            'stats' => [
                ['label' => 'Campaigns', 'value' => (string) $campaigns->count(), 'detail' => $campaigns->count() > 0 ? 'Active' : 'No campaigns'],
                ['label' => 'Promotions', 'value' => (string) $campaigns->count(), 'detail' => '2 expiring'],
                ['label' => 'Conversion', 'value' => '3.8%', 'detail' => '+0.6%'],
            ],
            'campaigns' => $campaigns,
        ]);
    }

    public function payments(Request $request)
    {
        $shop = $this->shopFor($request);
        $totalEarnings = (float) $shop->orderItems()->sum('total_price');
        $paidOut = (float) $shop->payouts()->where('status', 'paid')->sum('amount');
        $pending = (float) $shop->payouts()->whereIn('status', ['pending', 'processing'])->sum('amount');
        $available = max($totalEarnings - $paidOut, 0);

        $payouts = $shop->payouts()->latest()->limit(5)->get()->map(function (Payout $payout) {
            return [
                'id' => $payout->id ? 'PYO-'.$payout->id : 'PYO-0001',
                'amount' => (float) $payout->amount,
                'method' => $payout->status === 'paid' ? 'GCash' : 'Bank Transfer',
                'status' => ucfirst((string) $payout->status),
                'date' => $payout->paid_at?->format('Y-m-d') ?? $payout->created_at?->format('Y-m-d') ?? now()->format('Y-m-d'),
            ];
        })->values();

        return Inertia::render('seller/payments', [
            'stats' => [
                ['label' => 'Available Balance', 'value' => round($available, 2), 'detail' => 'Ready to withdraw', 'tone' => 'green'],
                ['label' => 'Total Earnings', 'value' => round($totalEarnings, 2), 'detail' => 'This year', 'tone' => 'mint'],
                ['label' => 'Pending Earnings', 'value' => round($pending, 2), 'detail' => 'Awaiting settlement', 'tone' => 'dark'],
                ['label' => 'Withdrawable', 'value' => round(max($available - $pending, 0), 2), 'detail' => '72 hours', 'tone' => 'light'],
            ],
            'payouts' => $payouts,
        ]);
    }

    public function settings(Request $request)
    {
        $shop = $this->shopFor($request);
        $user = $request->user();

        return Inertia::render('seller/settings', [
            'account' => [
                'name' => $user?->name ?? 'Seller',
                'email' => $user?->email ?? 'seller@example.com',
                'phone' => $user?->phone ?? '+63 917 000 0000',
                'seller_id' => 'BSAB-S-'.($shop->id ?? 1),
            ],
            'shop' => [
                'name' => $shop->name,
                'status' => ucfirst((string) $shop->status),
                'business_type' => $shop->description ? Str::limit($shop->description, 30) : 'Agricultural Supplies',
                'location' => 'Lipa, Batangas',
            ],
            'preferences' => [
                ['label' => 'Order notifications', 'enabled' => true],
                ['label' => 'Customer notifications', 'enabled' => true],
                ['label' => 'Change password', 'enabled' => true],
                ['label' => 'Login activity alerts', 'enabled' => true],
            ],
        ]);
    }

    public function orders(Request $request)
    {
        $shop = $this->shopFor($request);

        return Inertia::render('seller/orders', [
            'orders' => $shop->orderItems()->with('order.user', 'product.images')->latest()->limit(20)->get()->values(),
        ]);
    }

    private function shopFor(Request $request): Shop
    {
        $user = $request->user();

        return $user->shop ?? $user->shop()->create([
            'name' => $user->name.' Shop',
            'slug' => Str::slug($user->name).'-'.Str::lower(Str::random(5)),
            'status' => 'approved',
            'commission_rate' => 10,
        ]);
    }
}