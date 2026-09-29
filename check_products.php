<?php
require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$products = \App\Models\Product::where('status', 'published')
    ->where('is_approved', true)
    ->with(['shop:id,name', 'category:id,name,slug', 'images' => function($q) {
        $q->where('is_primary', true)->limit(1);
    }])
    ->latest()
    ->limit(20)
    ->get(['id','name','status','is_approved','is_active','base_price','sale_price','stock_quantity','category_id','shop_id']);

echo "Count: " . $products->count() . PHP_EOL;
foreach ($products as $p) {
    echo "ID:{$p->id} Name:{$p->name} is_active:{$p->is_active} stock:{$p->stock_quantity} shop:" . ($p->shop->name ?? 'null') . " category:" . ($p->category->name ?? 'null') . PHP_EOL;
    foreach ($p->images as $img) {
        echo "  Image: {$img->path}" . PHP_EOL;
    }
}

// Also check total counts
echo PHP_EOL . "=== Summary ===" . PHP_EOL;
echo "Total products: " . \App\Models\Product::count() . PHP_EOL;
echo "Published: " . \App\Models\Product::where('status','published')->count() . PHP_EOL;
echo "Approved: " . \App\Models\Product::where('is_approved',true)->count() . PHP_EOL;
echo "Published+Approved: " . \App\Models\Product::where('status','published')->where('is_approved',true)->count() . PHP_EOL;
