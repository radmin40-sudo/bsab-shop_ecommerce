<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::query()
            ->with([
                'user:id,name,email',
                'items.shop:id,name',
                'items.product:id,name',
                'items.product.images:id,product_id,path,is_primary',
            ])
            ->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->string('payment_status'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($orderQuery) use ($search) {
                $orderQuery->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        $orders = $query->paginate(20)->withQueryString();

        return response()->json(array_merge($orders->toArray(), [
            'stats' => [
                'total' => Order::count(),
                'today' => Order::whereDate('created_at', today())->count(),
                'in_progress' => Order::whereIn('status', ['pending', 'processing', 'accepted', 'shipped'])->count(),
                'revenue' => Order::sum('total'),
            ],
        ]));
    }
}
