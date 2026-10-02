<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductView;
use App\Models\Shop;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $isAnalytics = $request->routeIs('admin.analytics');
        $range = $isAnalytics && in_array($request->query('range'), ['7', '30', '90', 'year', 'custom'], true)
            ? (string) $request->query('range')
            : '30';
        $periodEnd = now()->endOfDay();
        if ($range === 'custom' && $request->filled(['from', 'to'])) {
            $dates = $request->validate([
                'from' => ['required', 'date', 'before_or_equal:today'],
                'to' => ['required', 'date', 'after_or_equal:from', 'before_or_equal:today'],
            ]);
            $periodStart = Carbon::parse($dates['from'])->startOfDay();
            $periodEnd = Carbon::parse($dates['to'])->endOfDay()->min(now()->endOfDay());
        } else {
            $periodStart = match ($range) {
                'year' => now()->startOfYear(),
                'custom' => now()->startOfDay()->subDays(29),
                default => now()->startOfDay()->subDays((int) $range - 1),
            };
        }
        $periodDays = max(1, $periodStart->copy()->startOfDay()->diffInDays($periodEnd->copy()->startOfDay()) + 1);
        $bucketSize = $periodDays > 60 ? 7 : 1;
        $chartOffsets = range(0, (int) ceil(($periodDays - 1) / $bucketSize));
        $paidOrders = Order::query()->where('payment_status', 'paid');
        $recentOrders = Order::query()->with('user:id,name')->latest()->limit(6)->get(['id', 'order_number', 'user_id', 'status', 'payment_status', 'total', 'created_at']);
        $sales = (clone $paidOrders)->whereBetween('created_at', [$periodStart, $periodEnd])->sum('total');
        $previousSales = (clone $paidOrders)
            ->whereBetween('created_at', [$periodStart->copy()->subDays($periodDays), $periodStart->copy()->subSecond()])
            ->sum('total');
        $salesChange = $previousSales > 0 ? (($sales - $previousSales) / $previousSales) * 100 : null;

        $dailySales = (clone $paidOrders)
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->selectRaw('DATE(created_at) as date, SUM(total) as total, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $dailyOrders = Order::query()
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->pluck('total', 'date');
        $dailyCustomers = User::query()
            ->where('role', 'customer')
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->pluck('total', 'date');
        $dailyViews = ProductView::query()
            ->whereBetween('viewed_at', [$periodStart, $periodEnd])
            ->selectRaw('DATE(viewed_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->pluck('total', 'date');
        $dailySessions = ProductView::query()
            ->whereBetween('viewed_at', [$periodStart, $periodEnd])
            ->whereNotNull('session_id')
            ->selectRaw('DATE(viewed_at) as date, COUNT(DISTINCT session_id) as total')
            ->groupBy('date')
            ->pluck('total', 'date');
        $dailyPendingReviews = ProductReview::query()
            ->where('status', 'pending')
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        $chart = collect($chartOffsets)->map(function (int $offset) use ($periodStart, $periodEnd, $bucketSize, $dailySales, $dailyOrders) {
            $date = $periodStart->copy()->startOfDay()->addDays($offset * $bucketSize);
            $bucketEnd = $date->copy()->addDays($bucketSize - 1)->min($periodEnd);
            $sales = 0;
            $orders = 0;
            for ($day = $date->copy(); $day->lte($bucketEnd); $day->addDay()) {
                $row = $dailySales->get($day->toDateString());
                $sales += (float) ($row->total ?? 0);
                $orders += (int) $dailyOrders->get($day->toDateString(), 0);
            }

            return [
                'label' => $date->format('M j'),
                'sales' => round($sales, 2),
                'orders' => $orders,
            ];
        })->values();

        $statusCounts = Order::query()
            ->when($isAnalytics, fn ($query) => $query->whereBetween('created_at', [$periodStart, $periodEnd]))
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');
        $orderStatuses = collect(['pending', 'processing', 'accepted', 'shipped', 'delivered', 'cancelled'])
            ->map(fn (string $status) => ['status' => $status, 'total' => (int) $statusCounts->get($status, 0)])
            ->values();

        $categoryRevenue = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.payment_status', 'paid')
            ->whereNull('orders.deleted_at')
            ->whereBetween('orders.created_at', [$periodStart, $periodEnd])
            ->whereNull('products.deleted_at')
            ->selectRaw('categories.id as category_id, SUM(order_items.total_price) as revenue')
            ->groupBy('categories.id')
            ->pluck('revenue', 'category_id');
        $topCategories = Category::query()
            ->withCount('products')
            ->orderByDesc('products_count')
            ->limit(6)
            ->get(['id', 'name'])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'products_count' => (int) $category->products_count,
                'revenue' => round((float) $categoryRevenue->get($category->id, 0), 2),
            ]);

        $topProductTotals = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereNull('orders.deleted_at')
            ->where('orders.status', '!=', 'cancelled')
            ->when($isAnalytics, fn ($query) => $query->whereBetween('orders.created_at', [$periodStart, $periodEnd]))
            ->selectRaw('order_items.product_id, SUM(order_items.quantity) as units_sold, SUM(order_items.total_price) as revenue')
            ->groupBy('order_items.product_id')
            ->orderByDesc('units_sold')
            ->limit(5)
            ->get()
            ->keyBy('product_id');
        $topProductIds = $topProductTotals->keys();
        $topProductViews = ProductView::query()
            ->whereIn('product_id', $topProductIds)
            ->whereBetween('viewed_at', [$periodStart, $periodEnd])
            ->selectRaw('product_id, COUNT(*) as total')
            ->groupBy('product_id')
            ->pluck('total', 'product_id');
        $productPerformanceTotals = ProductView::query()
            ->whereBetween('viewed_at', [$periodStart, $periodEnd])
            ->selectRaw('product_id, COUNT(*) as views')
            ->groupBy('product_id')
            ->orderByDesc('views')
            ->limit(5)
            ->get()
            ->keyBy('product_id');
        $productPerformanceIds = $productPerformanceTotals->keys();
        $productPerformance = Product::query()
            ->whereIn('id', $productPerformanceIds)
            ->get(['id', 'name'])
            ->map(function (Product $product) use ($productPerformanceTotals, $topProductTotals) {
                $sales = $topProductTotals->get($product->id);

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'views' => (int) ($productPerformanceTotals->get($product->id)->views ?? 0),
                    'unitsSold' => (int) ($sales->units_sold ?? 0),
                ];
            });
        $topProducts = Product::query()
            ->with(['images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order')])
            ->whereIn('id', $topProductIds)
            ->get(['id', 'name'])
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'image' => $product->images->first()?->path,
                'unitsSold' => (int) ($topProductTotals->get($product->id)->units_sold ?? 0),
                'revenue' => round((float) ($topProductTotals->get($product->id)->revenue ?? 0), 2),
                'views' => (int) $topProductViews->get($product->id, 0),
            ]);

        $chartWithDates = collect($chartOffsets)->map(function (int $offset) use ($periodStart, $periodEnd, $bucketSize, $dailyOrders, $dailyCustomers, $dailyViews, $dailySessions, $dailyPendingReviews) {
            $date = $periodStart->copy()->startOfDay()->addDays($offset * $bucketSize);
            $bucketEnd = $date->copy()->addDays($bucketSize - 1)->min($periodEnd);
            $totals = ['orders' => 0, 'customers' => 0, 'views' => 0, 'sessions' => 0, 'pendingReviews' => 0];
            for ($day = $date->copy(); $day->lte($bucketEnd); $day->addDay()) {
                $key = $day->toDateString();
                $totals['orders'] += (int) $dailyOrders->get($key, 0);
                $totals['customers'] += (int) $dailyCustomers->get($key, 0);
                $totals['views'] += (int) $dailyViews->get($key, 0);
                $totals['sessions'] += (int) $dailySessions->get($key, 0);
                $totals['pendingReviews'] += (int) $dailyPendingReviews->get($key, 0);
            }

            return [
                'label' => $date->format('M j'),
                'date' => $date->toDateString(),
                'orders' => $totals['orders'],
                'customers' => $totals['customers'],
                'views' => $totals['views'],
                'pendingReviews' => $totals['pendingReviews'],
                'conversion' => $totals['sessions'] > 0 ? round(($totals['orders'] / $totals['sessions']) * 100, 1) : 0,
            ];
        })->values();
        $trackedSessions = (int) ProductView::query()
            ->whereBetween('viewed_at', [$periodStart, $periodEnd])
            ->whereNotNull('session_id')
            ->distinct('session_id')
            ->count('session_id');
        $paidOrdersCount = (clone $paidOrders)->whereBetween('created_at', [$periodStart, $periodEnd])->count();
        $paymentOverview = Order::query()
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->selectRaw('payment_status, COUNT(*) as orders, SUM(total) as amount')
            ->groupBy('payment_status')
            ->get()
            ->keyBy('payment_status');

        return Inertia::render($isAnalytics ? 'admin/analytics' : 'admin/dashboard', [
            'metrics' => [
                'grossSales' => round((float) $sales, 2),
                'salesChange' => $salesChange === null ? null : round($salesChange, 1),
                'orders' => Order::query()->when($isAnalytics, fn ($query) => $query->whereBetween('created_at', [$periodStart, $periodEnd]))->count(),
                'paidOrders' => $paidOrdersCount,
                'awaitingOrders' => Order::query()->whereIn('status', ['pending', 'processing'])->when($isAnalytics, fn ($query) => $query->whereBetween('created_at', [$periodStart, $periodEnd]))->count(),
                'activeSellers' => Shop::query()->where('status', 'approved')->count(),
                'newSellers' => Shop::query()->when($isAnalytics, fn ($query) => $query->whereBetween('created_at', [$periodStart, $periodEnd]), fn ($query) => $query->where('created_at', '>=', now()->startOfMonth()))->count(),
                'customers' => User::query()->where('role', 'customer')->count(),
                'newCustomers' => User::query()->where('role', 'customer')->when($isAnalytics, fn ($query) => $query->whereBetween('created_at', [$periodStart, $periodEnd]), fn ($query) => $query->where('created_at', '>=', now()->startOfMonth()))->count(),
                'products' => Product::query()->count(),
                'pendingProducts' => Product::query()->where('is_approved', false)->count(),
                'categories' => Category::query()->count(),
                'productViews' => (int) ProductView::query()->whereBetween('viewed_at', [$periodStart, $periodEnd])->count(),
                'pendingReviews' => ProductReview::query()->where('status', 'pending')->count(),
                'conversionRate' => $trackedSessions > 0 ? round(($paidOrdersCount / $trackedSessions) * 100, 1) : null,
                'visitsTracked' => false,
            ],
            'chart' => $chart,
            'orderStatuses' => $orderStatuses,
            'topCategories' => $topCategories,
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'productPerformance' => $productPerformance,
            'customerGrowth' => $chartWithDates->map(fn ($point) => ['label' => $point['label'], 'value' => $point['customers']]),
            'productViewsTrend' => $chartWithDates->map(fn ($point) => ['label' => $point['label'], 'value' => $point['views']]),
            'pendingReviewsTrend' => $chartWithDates->map(fn ($point) => ['label' => $point['label'], 'value' => $point['pendingReviews']]),
            'conversionTrend' => $chartWithDates->map(fn ($point) => ['label' => $point['label'], 'value' => $point['conversion']]),
            'generatedAt' => Carbon::now()->toISOString(),
            'period' => [
                'range' => $range,
                'from' => $periodStart->toDateString(),
                'to' => $periodEnd->toDateString(),
                'days' => $periodDays,
            ],
            'paymentOverview' => collect(['paid', 'pending', 'failed', 'refunded'])->map(fn (string $status) => [
                'status' => $status,
                'orders' => (int) ($paymentOverview->get($status)->orders ?? 0),
                'amount' => round((float) ($paymentOverview->get($status)->amount ?? 0), 2),
            ])->values(),
        ]);
    }
}
