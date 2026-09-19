<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
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
        $periodStart = now()->startOfDay()->subDays(29);
        $paidOrders = Order::query()->where('payment_status', 'paid');
        $recentOrders = Order::query()->with('user:id,name')->latest()->limit(6)->get(['id', 'order_number', 'user_id', 'status', 'payment_status', 'total', 'created_at']);
        $sales = (clone $paidOrders)->where('created_at', '>=', $periodStart)->sum('total');
        $previousSales = (clone $paidOrders)
            ->whereBetween('created_at', [$periodStart->copy()->subDays(30), $periodStart->copy()->subDay()])
            ->sum('total');
        $salesChange = $previousSales > 0 ? (($sales - $previousSales) / $previousSales) * 100 : null;

        $dailySales = (clone $paidOrders)
            ->where('created_at', '>=', $periodStart)
            ->selectRaw('DATE(created_at) as date, SUM(total) as total, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chart = collect(range(0, 29))->map(function (int $offset) use ($periodStart, $dailySales) {
            $date = $periodStart->copy()->addDays($offset);
            $row = $dailySales->get($date->toDateString());

            return [
                'label' => $date->format('M j'),
                'sales' => round((float) ($row->total ?? 0), 2),
                'orders' => (int) ($row->orders ?? 0),
            ];
        })->values();

        $statusCounts = Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');
        $topCategories = Category::query()
            ->withCount('products')
            ->orderByDesc('products_count')
            ->limit(6)
            ->get(['id', 'name', 'products_count']);

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'grossSales' => round((float) $sales, 2),
                'salesChange' => $salesChange === null ? null : round($salesChange, 1),
                'orders' => Order::query()->count(),
                'awaitingOrders' => Order::query()->whereIn('status', ['pending', 'processing'])->count(),
                'activeSellers' => Shop::query()->where('status', 'approved')->count(),
                'newSellers' => Shop::query()->where('created_at', '>=', now()->startOfMonth())->count(),
                'customers' => User::query()->where('role', 'customer')->count(),
                'newCustomers' => User::query()->where('role', 'customer')->where('created_at', '>=', now()->startOfMonth())->count(),
                'products' => Product::query()->count(),
                'pendingProducts' => Product::query()->where('is_approved', false)->count(),
                'categories' => Category::query()->count(),
                'vouchers' => \App\Models\Voucher::query()->count(),
            ],
            'chart' => $chart,
            'orderStatuses' => $statusCounts->map(fn ($total, $status) => ['status' => $status, 'total' => (int) $total])->values(),
            'topCategories' => $topCategories,
            'recentOrders' => $recentOrders,
            'generatedAt' => Carbon::now()->toISOString(),
        ]);
    }
}
