<?php

use App\Http\Controllers\AdminCategoryController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AI\ProductAIController;
use App\Http\Controllers\Auth\AdminRegistrationController;
use App\Http\Controllers\LaravelCrudTesterController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SellerProductController;
use App\Http\Controllers\SellerShopController;
use App\Http\Controllers\TestGeminiImageController;
use App\Http\Controllers\VoucherController;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\SiteSetting;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$extractGeminiDiagnosticError = function (mixed $payload, int $status): string {
    if (is_array($payload)) {
        $message = data_get($payload, 'error.message');

        if (is_string($message) && trim($message) !== '') {
            return trim($message);
        }

        $errors = data_get($payload, 'error.errors');

        if (is_array($errors)) {
            foreach ($errors as $error) {
                if (is_array($error) && isset($error['message']) && is_string($error['message']) && trim($error['message']) !== '') {
                    return trim($error['message']);
                }
            }
        }

        $message = data_get($payload, 'message');

        if (is_string($message) && trim($message) !== '') {
            return trim($message);
        }

        $error = data_get($payload, 'error');

        if (is_string($error) && trim($error) !== '') {
            return trim($error);
        }
    }

    if (is_string($payload) && trim($payload) !== '') {
        return trim($payload);
    }

    return match ($status) {
        400 => 'Invalid Gemini request.',
        401 => 'API key not valid.',
        403 => 'Gemini API access forbidden.',
        404 => 'Gemini model unavailable or unsupported for this project.',
        429 => 'Gemini API rate limit reached.',
        500 => 'Gemini API server error.',
        default => 'Gemini API request failed.',
    };
};

$storefrontProps = fn (?int $userId = null) => [
    'siteSettings' => SiteSetting::homeSettings(),
    'categories' => Category::query()->withCount('products')->orderBy('name')->get(['id', 'name', 'slug', 'image']),
    'products' => Product::published()
        ->with(['shop:id,name', 'category:id,name,slug', 'images' => fn ($query) => $query->where('is_primary', true)->limit(1)])
        ->latest()
        ->limit(20)
        ->get(),
    'availableVouchers' => Voucher::with('shop:id,name')
        ->where(function ($query) {
            $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
        })
        ->where(function ($query) {
            $query->whereNull('usage_limit')->orWhereColumn('times_used', '<', 'usage_limit');
        })
        ->when($userId, fn ($query) => $query->whereDoesntHave('redemptions', fn ($redemptionQuery) => $redemptionQuery->where('user_id', $userId)))
        ->latest()
        ->get(['id', 'code', 'type', 'value', 'shop_id', 'min_spend', 'expires_at']),
];

Route::get('/', function (Request $request) use ($storefrontProps) {
    if ($request->user()?->hasRole('admin')) {
        return to_route('admin.dashboard');
    }

    if ($request->user()?->hasRole('seller')) {
        return to_route('seller.dashboard');
    }

    return Inertia::render('welcome', $storefrontProps($request->user()?->id));
})->name('home');

Route::get('/marketplace', fn () => Inertia::render('customer/marketplace', $storefrontProps()))->name('marketplace');

Route::get('/test', [LaravelCrudTesterController::class, 'index'])->name('tester.index');
Route::match(['get', 'post'], '/test/run', [LaravelCrudTesterController::class, 'runAll'])->name('tester.run-all');
Route::match(['get', 'post'], '/test/run/{entity}', [LaravelCrudTesterController::class, 'runSingle'])->name('tester.run-single');

Route::get('/test-gemini-image', [TestGeminiImageController::class, 'page'])->name('test.gemini.image.page');
Route::post('/test-gemini-image', [TestGeminiImageController::class, 'test'])->name('test.gemini.image');

Route::get('/test-gemini', function () use ($extractGeminiDiagnosticError) {
    $apiKey = config('services.gemini.api_key');

    if (blank($apiKey)) {
        return response()->json([
            'success' => false,
            'error' => 'GEMINI_API_KEY is missing',
        ], 500);
    }

    $models = ['gemini-3.6-flash'];
    $lastResponse = null;

    foreach ($models as $model) {
        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'x-goog-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => 'Reply with exactly: GEMINI TEST SUCCESS',
                                ],
                            ],
                        ],
                    ],
                ]);

            $status = $response->status();
            $payload = $response->json();
            $lastResponse = $payload;

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'http_status' => $status,
                    'message' => 'Gemini API connection successful',
                    'response' => $payload,
                ]);
            }

            if ($status === 404) {
                $lastResponse = $payload;

                continue;
            }

            $errorMessage = $extractGeminiDiagnosticError($payload, $status);

            return response()->json([
                'success' => false,
                'http_status' => $status,
                'message' => 'Gemini API request failed',
                'error' => $errorMessage,
                'response' => $payload,
            ], $status >= 400 ? $status : 500);
        } catch (Throwable $exception) {
            $errorMessage = $exception->getMessage();

            if (str_contains(strtolower($errorMessage), 'timeout')) {
                return response()->json([
                    'success' => false,
                    'http_status' => 504,
                    'message' => 'Gemini API request timed out',
                    'error' => $errorMessage,
                ], 504);
            }

            if (str_contains(strtolower($errorMessage), 'connection')) {
                return response()->json([
                    'success' => false,
                    'http_status' => 503,
                    'message' => 'Gemini API connection failed',
                    'error' => $errorMessage,
                ], 503);
            }

            return response()->json([
                'success' => false,
                'http_status' => 500,
                'message' => 'Gemini API request failed',
                'error' => $errorMessage,
            ], 500);
        }
    }

    $fallbackError = $extractGeminiDiagnosticError($lastResponse ?? null, 404);

    return response()->json([
        'success' => false,
        'http_status' => 404,
        'message' => 'Gemini API request failed',
        'error' => $fallbackError,
        'response' => $lastResponse,
    ], 404);
})->name('test.gemini');

Route::get('/products/{product}', function (Product $product) {
    abort_unless($product->status !== 'rejected', 404);

    $similarProducts = Product::published()
        ->where('id', '!=', $product->id)
        ->where(function ($query) use ($product) {
            $query->where('category_id', $product->category_id)
                ->orWhere('shop_id', $product->shop_id);
        })
        ->with([
            'shop:id,name',
            'category:id,name,slug',
            'metrics',
            'images' => fn ($imageQuery) => $imageQuery->where('is_primary', true)->limit(1),
        ])
        ->latest()
        ->limit(4)
        ->get();

    return Inertia::render('customer/product-detail', [
        'product' => $product->load([
            'shop:id,name',
            'category:id,name,slug',
            'metrics',
            'images',
            'options.values',
            'variants.optionValues.optionValue.option',
        ]),
        'similarProducts' => $similarProducts,
    ]);
})->name('products.show');

Route::get('/search', function (Request $request) {
    $query = trim((string) $request->query('q', ''));
    $terms = preg_split('/\s+/', mb_strtolower($query), -1, PREG_SPLIT_NO_EMPTY) ?: [];

    return Inertia::render('customer/search', [
        'query' => $query,
        'products' => empty($terms) ? collect() : Product::published()
            ->with(['shop:id,name', 'category:id,name,slug', 'images' => fn ($imageQuery) => $imageQuery->where('is_primary', true)->limit(1)])
            ->where(function ($productQuery) use ($terms) {
                foreach ($terms as $term) {
                    $productQuery->where(function ($termQuery) use ($term) {
                        $termQuery->where('name', 'like', '%'.$term.'%')
                            ->orWhere('description', 'like', '%'.$term.'%')
                            ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', '%'.$term.'%'))
                            ->orWhereHas('shop', fn ($shopQuery) => $shopQuery->where('name', 'like', '%'.$term.'%'));
                    });
                }
            })
            ->latest()
            ->get(),
    ]);
})->name('search');

Route::get('/dashboard', function (Request $request) {
    if ($request->user()->hasRole('admin')) {
        return to_route('admin.dashboard');
    }

    if ($request->user()->hasRole('seller')) {
        return to_route('seller.dashboard');
    }

    return to_route('home');
})->middleware('auth')->name('dashboard');

Route::middleware(['guest', 'throttle:5,1'])->prefix('admin/portal')->group(function () {
    Route::get('/register', [AdminRegistrationController::class, 'create'])->name('admin.register');
    Route::post('/register', [AdminRegistrationController::class, 'store'])->name('admin.register.store');
});

Route::middleware(['guest', 'throttle:5,1'])->group(function () {
    Route::get('/admin/register/super-secret-admin-token-change-me', [AdminRegistrationController::class, 'create'])
        ->name('admin.register.secret');
    Route::post('/admin/register/super-secret-admin-token-change-me', [AdminRegistrationController::class, 'store'])
        ->name('admin.register.secret.store');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('admin.profile');
    Route::get('/settings', [AdminSettingsController::class, 'index'])->name('admin.settings');
    Route::post('/settings/cache/clear', [AdminSettingsController::class, 'clearCache'])->name('admin.settings.cache.clear');
    Route::post('/settings/logs/clear', [AdminSettingsController::class, 'clearLogs'])->name('admin.settings.logs.clear');
    Route::post('/settings/categories/clear', [AdminSettingsController::class, 'clearCategories'])->name('admin.settings.categories.clear');
    Route::post('/settings/products/clear', [AdminSettingsController::class, 'clearProducts'])->name('admin.settings.products.clear');
    Route::post('/settings/orders/clear', [AdminSettingsController::class, 'clearOrders'])->name('admin.settings.orders.clear');
    Route::post('/settings/vouchers/clear', [AdminSettingsController::class, 'clearVouchers'])->name('admin.settings.vouchers.clear');
    Route::post('/settings/home-content', [AdminSettingsController::class, 'saveHomeContent'])->name('admin.settings.home-content');
    Route::get('/sellers', fn () => Inertia::render('admin/sellers'))->name('admin.sellers');
    Route::get('/customers', [AdminUserController::class, 'customers'])->name('admin.customers');
    Route::get('/products', [AdminProductController::class, 'index'])->name('admin.products');
    Route::patch('/products/approve-all', [AdminProductController::class, 'approveAll'])->name('admin.products.approve-all');
    Route::patch('/products/{product}', [AdminProductController::class, 'update'])->name('admin.products.update');
    Route::get('/orders', fn () => Inertia::render('admin/orders'))->name('admin.orders');
    Route::get('/users', [AdminUserController::class, 'index'])->name('admin.users');
    Route::post('/users', [AdminUserController::class, 'store'])->name('admin.users.store');
    Route::patch('/users/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
    Route::get('/categories', [AdminCategoryController::class, 'index'])->name('admin.categories');
    Route::post('/categories', [AdminCategoryController::class, 'store'])->name('admin.categories.store');
    Route::post('/categories/{category}', [AdminCategoryController::class, 'update'])->name('admin.categories.update.post');
    Route::patch('/categories/{category}', [AdminCategoryController::class, 'update'])->name('admin.categories.update');
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('admin.categories.destroy');
    Route::get('/vouchers', [VoucherController::class, 'index'])->name('admin.vouchers');
    Route::post('/vouchers', [VoucherController::class, 'store'])->name('admin.vouchers.store');
    Route::patch('/vouchers/{voucher}', [VoucherController::class, 'update'])->name('admin.vouchers.update');
    Route::delete('/vouchers/{voucher}', [VoucherController::class, 'destroy'])->name('admin.vouchers.destroy');
});

Route::middleware(['auth', 'role:seller'])->prefix('seller')->group(function () {
    Route::get('/', fn () => Inertia::render('seller/dashboard'))->name('seller.dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('seller.profile');
    Route::get('/products', [SellerProductController::class, 'index'])->name('seller.products');
    Route::post('/products/ai-analyze', [ProductAIController::class, 'analyze'])->name('seller.products.ai-analyze');
    Route::post('/products', [SellerProductController::class, 'store'])->name('seller.products.store');
    Route::patch('/products/{product}', [SellerProductController::class, 'update'])->name('seller.products.update');
    Route::delete('/products/{product}', [SellerProductController::class, 'destroy'])->name('seller.products.destroy');
    Route::get('/orders', fn () => Inertia::render('seller/orders'))->name('seller.orders');
    Route::get('/shop', [SellerShopController::class, 'show'])->name('seller.shop');
    Route::post('/shop', [SellerShopController::class, 'update'])->name('seller.shop.store');
    Route::patch('/shop', [SellerShopController::class, 'update'])->name('seller.shop.update');
    Route::get('/vouchers', [VoucherController::class, 'index'])->name('seller.vouchers');
    Route::post('/vouchers', [VoucherController::class, 'store'])->name('seller.vouchers.store');
    Route::patch('/vouchers/{voucher}', [VoucherController::class, 'update'])->name('seller.vouchers.update');
    Route::delete('/vouchers/{voucher}', [VoucherController::class, 'destroy'])->name('seller.vouchers.destroy');
});

Route::middleware(['auth', 'role:customer'])->prefix('customer')->group(function () use ($storefrontProps) {
    Route::get('/', fn () => to_route('customer.profile'))->name('customer.account');
    Route::get('/products', fn () => Inertia::render('customer/products', $storefrontProps()))->name('customer.products');
    Route::get('/categories', fn () => Inertia::render('customer/categories', [
        'categories' => Category::query()
            ->withCount('products')
            ->whereNull('parent_id')
            ->with([
                'children:id,parent_id,name,slug,image',
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'image']),
    ]))->name('customer.categories');
    Route::get('/categories/{category}', function (string $category) {
        $categoryModel = Category::query()
            ->where('slug', $category)
            ->firstOrFail();

        return Inertia::render('customer/category-show', [
            'category' => [
                'id' => $categoryModel->id,
                'name' => $categoryModel->name,
                'slug' => $categoryModel->slug,
                'image' => $categoryModel->image,
            ],
            'products' => Product::published()
                ->where('category_id', $categoryModel->id)
                ->with(['shop:id,name', 'category:id,name,slug', 'images' => fn ($imageQuery) => $imageQuery->where('is_primary', true)->limit(1)])
                ->latest()
                ->get(),
        ]);
    })->name('customer.categories.show');
    Route::get('/favorites', fn () => Inertia::render('customer/favorites', [
        'products' => Product::query()->with(['shop:id,name', 'category:id,name,slug', 'images' => fn ($query) => $query->where('is_primary', true)->limit(1)])->latest()->get(),
    ]))->name('customer.favorites');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('customer.profile');
    Route::get('/settings', fn () => Inertia::render('customer/settings'))->name('customer.settings');
    Route::get('/settings/notifications', fn () => Inertia::render('customer/settings/notifications'))->name('customer.settings.notifications');
    Route::get('/settings/display', fn () => Inertia::render('customer/settings/display'))->name('customer.settings.display');
    Route::get('/settings/security', fn () => Inertia::render('customer/settings/security'))->name('customer.settings.security');
    Route::get('/settings/password', fn () => Inertia::render('customer/settings/password'))->name('customer.settings.password');
    Route::get('/settings/saved-preferences', fn () => Inertia::render('customer/settings/saved-preferences'))->name('customer.settings.saved-preferences');
    Route::get('/vouchers', function (Request $request) {
        return Inertia::render('customer/vouchers', [
            'vouchers' => Voucher::query()
                ->with('shop:id,name')
                ->where(function ($query) {
                    $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->where(function ($query) {
                    $query->whereNull('usage_limit')->orWhereColumn('times_used', '<', 'usage_limit');
                })
                ->when($request->user()?->id, fn ($query, $userId) => $query->whereDoesntHave('redemptions', fn ($redemptionQuery) => $redemptionQuery->where('user_id', $userId)))
                ->latest()
                ->get(['id', 'code', 'type', 'value', 'shop_id', 'min_spend', 'expires_at']),
        ]);
    })->name('customer.vouchers');
    Route::get('/cart', fn () => Inertia::render('customer/cart'))->name('customer.cart');
    Route::get('/checkout', function (Request $request) {
        return Inertia::render('customer/checkout', [
            'selectedItemIds' => collect($request->input('selected_item_ids', []))->map(fn ($id) => (int) $id)->values()->all(),
        ]);
    })->name('customer.checkout');
    Route::get('/orders', fn () => Inertia::render('customer/orders'))->name('customer.orders');
    Route::get('/order-tracking', fn () => Inertia::render('customer/order-tracking'))->name('customer.order-tracking');
    Route::get('/orders/{order}', fn (Request $request, Order $order) => abort_unless($order->user_id === $request->user()->id, 403) ?: Inertia::render('customer/order-detail', ['orderId' => $order->id]))->name('customer.order');
});

Route::middleware('auth')->prefix('settings')->group(function () {
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('password', [PasswordController::class, 'edit'])->name('user-password.edit');
    Route::put('password', [PasswordController::class, 'update'])->name('user-password.update');
});

require __DIR__.'/auth.php';
