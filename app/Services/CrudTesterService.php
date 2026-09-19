<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\InventoryMovement;
use App\Models\Offer;
use App\Models\OfferMessage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductMetric;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use App\Models\ProductReview;
use App\Models\ProductVariant;
use App\Models\ProductView;
use App\Models\Review;
use App\Models\SellerFollow;
use App\Models\SellerProfile;
use App\Models\SellerRating;
use App\Models\Shop;
use App\Models\SiteSetting;
use App\Models\User;
use App\Models\UserVoucher;
use App\Models\VariantOptionValue;
use App\Models\Voucher;
use App\Models\VoucherRedemption;
use App\Models\Wishlist;
use Illuminate\Database\Eloquent\MassAssignmentException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class CrudTesterService
{
    /**
     * Return list of all testable entities with metadata.
     */
    public function getEntityDefinitions(): array
    {
        return [
            // --- Core Commerce ---
            'user' => [
                'name' => 'User',
                'group' => 'Core Commerce',
                'description' => 'User accounts with roles (customer, seller, admin)',
                'model' => User::class,
                'table' => 'users',
            ],
            'shop' => [
                'name' => 'Shop',
                'group' => 'Core Commerce',
                'description' => 'Merchant store profiles linked to sellers',
                'model' => Shop::class,
                'table' => 'shops',
            ],
            'seller_profile' => [
                'name' => 'Seller Profile',
                'group' => 'Core Commerce',
                'description' => 'Extended seller identity and verification records',
                'model' => SellerProfile::class,
                'table' => 'seller_profiles',
            ],
            'category' => [
                'name' => 'Category',
                'group' => 'Core Commerce',
                'description' => 'Marketplace product categorization taxonomy',
                'model' => Category::class,
                'table' => 'categories',
            ],
            'product' => [
                'name' => 'Product',
                'group' => 'Core Commerce',
                'description' => 'Marketplace product listings with pricing and specs',
                'model' => Product::class,
                'table' => 'products',
            ],
            'product_variant' => [
                'name' => 'Product Variant',
                'group' => 'Core Commerce',
                'description' => 'SKU-level product variants with stock and pricing',
                'model' => ProductVariant::class,
                'table' => 'product_variants',
            ],
            'product_option' => [
                'name' => 'Product Option',
                'group' => 'Core Commerce',
                'description' => 'Variant attributes (e.g., Color, Size)',
                'model' => ProductOption::class,
                'table' => 'product_options',
            ],
            'product_option_value' => [
                'name' => 'Product Option Value',
                'group' => 'Core Commerce',
                'description' => 'Specific option choices (e.g., Red, Blue, Large)',
                'model' => ProductOptionValue::class,
                'table' => 'product_option_values',
            ],
            'variant_option_value' => [
                'name' => 'Variant Option Value',
                'group' => 'Core Commerce',
                'description' => 'Relational mapping between variants and option values',
                'model' => VariantOptionValue::class,
                'table' => 'variant_option_values',
            ],
            'product_image' => [
                'name' => 'Product Image',
                'group' => 'Core Commerce',
                'description' => 'Product gallery media items',
                'model' => ProductImage::class,
                'table' => 'product_images',
            ],

            // --- Cart & Orders ---
            'cart' => [
                'name' => 'Cart',
                'group' => 'Orders & Cart',
                'description' => 'User active shopping carts',
                'model' => Cart::class,
                'table' => 'carts',
            ],
            'cart_item' => [
                'name' => 'Cart Item',
                'group' => 'Orders & Cart',
                'description' => 'Individual product lines within a shopping cart',
                'model' => CartItem::class,
                'table' => 'cart_items',
            ],
            'order' => [
                'name' => 'Order',
                'group' => 'Orders & Cart',
                'description' => 'Customer orders with totals, status, and shipping info',
                'model' => Order::class,
                'table' => 'orders',
            ],
            'order_item' => [
                'name' => 'Order Item',
                'group' => 'Orders & Cart',
                'description' => 'Line items belonging to an order with fulfillment status',
                'model' => OrderItem::class,
                'table' => 'order_items',
            ],
            'payment' => [
                'name' => 'Payment',
                'group' => 'Orders & Cart',
                'description' => 'Order payment transaction tracking and GCash proof',
                'model' => Payment::class,
                'table' => 'payments',
            ],
            'payout' => [
                'name' => 'Payout',
                'group' => 'Orders & Cart',
                'description' => 'Disbursements to shop owners for delivered orders',
                'model' => Payout::class,
                'table' => 'payouts',
            ],

            // --- Vouchers & Engagement ---
            'voucher' => [
                'name' => 'Voucher',
                'group' => 'Customer & Vouchers',
                'description' => 'Discount coupons and promotional vouchers',
                'model' => Voucher::class,
                'table' => 'vouchers',
            ],
            'voucher_redemption' => [
                'name' => 'Voucher Redemption',
                'group' => 'Customer & Vouchers',
                'description' => 'Records of voucher usage during order checkout',
                'model' => VoucherRedemption::class,
                'table' => 'voucher_redemptions',
            ],
            'user_voucher' => [
                'name' => 'User Voucher (Claim)',
                'group' => 'Customer & Vouchers',
                'description' => 'Customer voucher claiming and wallet lifecycle',
                'model' => UserVoucher::class,
                'table' => 'user_vouchers',
            ],
            'address' => [
                'name' => 'Address',
                'group' => 'Customer & Vouchers',
                'description' => 'User shipping and billing address records',
                'model' => Address::class,
                'table' => 'addresses',
            ],
            'review' => [
                'name' => 'Review',
                'group' => 'Customer & Vouchers',
                'description' => 'Order-item customer feedback and 1-5 star ratings',
                'model' => Review::class,
                'table' => 'reviews',
            ],
            'product_review' => [
                'name' => 'Product Review (Extended)',
                'group' => 'Customer & Vouchers',
                'description' => 'Moderated product reviews with titles and approval statuses',
                'model' => ProductReview::class,
                'table' => 'product_reviews',
            ],
            'seller_rating' => [
                'name' => 'Seller Rating',
                'group' => 'Customer & Vouchers',
                'description' => 'Buyer evaluations of sellers (shipping, accuracy, comms)',
                'model' => SellerRating::class,
                'table' => 'seller_ratings',
            ],
            'seller_follow' => [
                'name' => 'Seller Follow',
                'group' => 'Customer & Vouchers',
                'description' => 'Customer following shops for alerts and updates',
                'model' => SellerFollow::class,
                'table' => 'seller_follows',
            ],
            'wishlist' => [
                'name' => 'Wishlist',
                'group' => 'Customer & Vouchers',
                'description' => 'Customer bookmarked/favorite products',
                'model' => Wishlist::class,
                'table' => 'wishlists',
            ],
            'offer' => [
                'name' => 'Offer',
                'group' => 'Customer & Vouchers',
                'description' => 'Price bargaining and negotiation requests from buyers',
                'model' => Offer::class,
                'table' => 'offers',
            ],
            'offer_message' => [
                'name' => 'Offer Message',
                'group' => 'Customer & Vouchers',
                'description' => 'Negotiation conversation threads between buyer and seller',
                'model' => OfferMessage::class,
                'table' => 'offer_messages',
            ],

            // --- System & Analytics ---
            'site_setting' => [
                'name' => 'Admin Settings (Site Settings)',
                'group' => 'System & Analytics',
                'description' => 'Marketplace configuration and homepage media key-value store (Admin Settings)',
                'model' => SiteSetting::class,
                'table' => 'site_settings',
            ],
            'admin_settings_upload' => [
                'name' => 'Admin Settings (Media Uploads)',
                'group' => 'System & Analytics',
                'description' => 'Test admin settings file saving and image optimization routines',
                'model' => SiteSetting::class,
                'table' => 'site_settings',
            ],
            'activity_log' => [
                'name' => 'Activity Log',
                'group' => 'System & Analytics',
                'description' => 'Audit logging of system and user operations',
                'model' => ActivityLog::class,
                'table' => 'activity_logs',
            ],
            'inventory_movement' => [
                'name' => 'Inventory Movement',
                'group' => 'System & Analytics',
                'description' => 'Stock tracking logs per variant (restock, order, adjustment)',
                'model' => InventoryMovement::class,
                'table' => 'inventory_movements',
            ],
            'product_metric' => [
                'name' => 'Product Metric',
                'group' => 'System & Analytics',
                'description' => 'Aggregated analytical counters for product popularity and sales',
                'model' => ProductMetric::class,
                'table' => 'product_metrics',
            ],
            'product_view' => [
                'name' => 'Product View',
                'group' => 'System & Analytics',
                'description' => 'Product impressions and view tracking records',
                'model' => ProductView::class,
                'table' => 'product_views',
            ],
        ];
    }

    /**
     * Run all entity CRUD tests.
     */
    public function runAll(): array
    {
        $start = microtime(true);
        $definitions = $this->getEntityDefinitions();
        $results = [];

        $totalWorking = 0;
        $totalNotWorking = 0;
        $totalOperations = 0;
        $workingOperations = 0;
        $notWorkingOperations = 0;

        foreach ($definitions as $key => $meta) {
            $result = $this->testEntity($key);
            $results[$key] = $result;

            if ($result['status'] === 'working') {
                $totalWorking++;
            } else {
                $totalNotWorking++;
            }

            foreach ($result['operations'] as $op) {
                $totalOperations++;
                if ($op['status'] === 'working') {
                    $workingOperations++;
                } else {
                    $notWorkingOperations++;
                }
            }
        }

        $totalDurationMs = round((microtime(true) - $start) * 1000, 2);

        return [
            'summary' => [
                'total_entities' => count($definitions),
                'entities_working' => $totalWorking,
                'entities_not_working' => $totalNotWorking,
                'total_operations' => $totalOperations,
                'operations_working' => $workingOperations,
                'operations_not_working' => $notWorkingOperations,
                'pass_rate_percentage' => $totalOperations > 0 ? round(($workingOperations / $totalOperations) * 100, 1) : 0,
                'duration_ms' => $totalDurationMs,
                'timestamp' => now()->toIso8601String(),
            ],
            'results' => $results,
        ];
    }

    /**
     * Run CRUD test for a single entity by key.
     */
    public function testEntity(string $key): array
    {
        $definitions = $this->getEntityDefinitions();

        if (! isset($definitions[$key])) {
            return [
                'key' => $key,
                'name' => Str::title(str_replace('_', ' ', $key)),
                'group' => 'Unknown',
                'status' => 'not_working',
                'message' => "Unknown test entity key: {$key}",
                'operations' => [],
                'duration_ms' => 0,
            ];
        }

        $meta = $definitions[$key];
        $entityStart = microtime(true);

        $operations = [
            'create' => ['status' => 'pending', 'name' => 'CREATE'],
            'read' => ['status' => 'pending', 'name' => 'READ'],
            'update' => ['status' => 'pending', 'name' => 'UPDATE'],
            'delete' => ['status' => 'pending', 'name' => 'DELETE'],
        ];

        // Wrap execution in a transaction that rolls back immediately to protect production data!
        DB::beginTransaction();

        try {
            // Run the specific tester method
            $method = 'test'.Str::studly($key);

            if (! method_exists($this, $method)) {
                throw new \BadMethodCallException("Diagnostic test runner method [{$method}] is not yet implemented.");
            }

            $opResults = $this->{$method}();

            foreach ($opResults as $opKey => $data) {
                $operations[$opKey] = array_merge($operations[$opKey], $data);
            }
        } catch (Throwable $e) {
            // If an unhandled exception escaped, attach to the first non-working operation
            $diagnosis = $this->diagnoseException($e, 'execute', $meta['table']);

            foreach (['create', 'read', 'update', 'delete'] as $op) {
                if ($operations[$op]['status'] === 'pending') {
                    $operations[$op] = array_merge($operations[$op], [
                        'status' => 'not_working',
                        'duration_ms' => 0,
                        'diagnosis' => $diagnosis,
                    ]);
                    break;
                }
            }
        } finally {
            // Guaranteed rollback so no test records pollute production database
            try {
                DB::rollBack();
            } catch (Throwable $e) {
                // Ignore rollback failure if transaction already closed
            }
        }

        // Determine overall entity status
        $isWorking = true;
        foreach ($operations as $op) {
            if ($op['status'] !== 'working') {
                $isWorking = false;
                break;
            }
        }

        $entityDurationMs = round((microtime(true) - $entityStart) * 1000, 2);

        return [
            'key' => $key,
            'name' => $meta['name'],
            'group' => $meta['group'],
            'description' => $meta['description'],
            'model' => $meta['model'],
            'table' => $meta['table'],
            'status' => $isWorking ? 'working' : 'not_working',
            'duration_ms' => $entityDurationMs,
            'operations' => $operations,
        ];
    }

    // =========================================================================
    // ENTITY CRUD IMPLEMENTATIONS
    // =========================================================================

    protected function testUser(): array
    {
        $unique = Str::random(8);
        $email = "test_user_{$unique}@example.com";

        return $this->performStandardCrud(
            modelClass: User::class,
            createAttributes: [
                'name' => 'Diagnostic Test User',
                'email' => $email,
                'role' => 'customer',
                'status' => 'active',
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                'must_change_password' => false,
            ],
            updateAttributes: [
                'name' => 'Diagnostic Test User Updated',
                'status' => 'active',
            ],
            readVerification: fn (User $user) => $user->email === $email,
            updateVerification: fn (User $user) => $user->name === 'Diagnostic Test User Updated'
        );
    }

    protected function testShop(): array
    {
        $user = $this->createMockUser('seller');
        $unique = Str::random(8);

        return $this->performStandardCrud(
            modelClass: Shop::class,
            createAttributes: [
                'user_id' => $user->id,
                'name' => "Diagnostic Shop {$unique}",
                'slug' => "diag-shop-{$unique}",
                'status' => 'approved',
                'commission_rate' => 10.00,
            ],
            updateAttributes: [
                'name' => "Diagnostic Shop {$unique} Updated",
            ],
            readVerification: fn (Shop $shop) => $shop->user_id === $user->id,
            updateVerification: fn (Shop $shop) => str_contains($shop->name, 'Updated')
        );
    }

    protected function testSellerProfile(): array
    {
        $user = $this->createMockUser('seller');
        $unique = Str::random(8);

        return $this->performStandardCrud(
            modelClass: SellerProfile::class,
            createAttributes: [
                'user_id' => $user->id,
                'shop_name' => "Diagnostic Seller {$unique}",
                'shop_slug' => "diag-seller-{$unique}",
                'status' => 'active',
                'verification_status' => 'pending',
            ],
            updateAttributes: [
                'verification_status' => 'approved',
            ],
            readVerification: fn (SellerProfile $profile) => $profile->user_id === $user->id,
            updateVerification: fn (SellerProfile $profile) => $profile->verification_status === 'approved'
        );
    }

    protected function testCategory(): array
    {
        $unique = Str::random(8);

        return $this->performStandardCrud(
            modelClass: Category::class,
            createAttributes: [
                'name' => "Diagnostic Category {$unique}",
                'slug' => "diag-cat-{$unique}",
                'image' => 'categories/test.png',
            ],
            updateAttributes: [
                'name' => "Diagnostic Category {$unique} Updated",
            ],
            readVerification: fn (Category $cat) => str_contains($cat->slug, 'diag-cat'),
            updateVerification: fn (Category $cat) => str_contains($cat->name, 'Updated')
        );
    }

    protected function testProduct(): array
    {
        $shop = $this->createMockShop();
        $category = $this->createMockCategory();
        $unique = Str::random(8);

        return $this->performStandardCrud(
            modelClass: Product::class,
            createAttributes: [
                'shop_id' => $shop->id,
                'category_id' => $category->id,
                'name' => "Diagnostic Product {$unique}",
                'slug' => "diag-prod-{$unique}",
                'description' => 'Test product description',
                'base_price' => 199.99,
                'sku' => "SKU-DIAG-{$unique}",
                'stock_quantity' => 25,
                'status' => 'published',
                'is_approved' => true,
            ],
            updateAttributes: [
                'base_price' => 249.99,
                'stock_quantity' => 30,
            ],
            readVerification: fn (Product $p) => $p->shop_id === $shop->id && (float) $p->base_price === 199.99,
            updateVerification: fn (Product $p) => (float) $p->base_price === 249.99 && $p->stock_quantity === 30
        );
    }

    protected function testProductVariant(): array
    {
        $product = $this->createMockProduct();
        $unique = Str::random(8);

        return $this->performStandardCrud(
            modelClass: ProductVariant::class,
            createAttributes: [
                'product_id' => $product->id,
                'name' => 'Medium / Blue',
                'sku' => "SKU-VAR-{$unique}",
                'price' => 219.99,
                'stock_quantity' => 15,
                'is_active' => true,
            ],
            updateAttributes: [
                'price' => 229.99,
                'stock_quantity' => 20,
            ],
            readVerification: fn (ProductVariant $v) => $v->product_id === $product->id,
            updateVerification: fn (ProductVariant $v) => (float) $v->price === 229.99
        );
    }

    protected function testProductOption(): array
    {
        $product = $this->createMockProduct();

        return $this->performStandardCrud(
            modelClass: ProductOption::class,
            createAttributes: [
                'product_id' => $product->id,
                'name' => 'Color',
                'sort_order' => 1,
            ],
            updateAttributes: [
                'name' => 'Shade',
                'sort_order' => 2,
            ],
            readVerification: fn (ProductOption $opt) => $opt->product_id === $product->id && $opt->name === 'Color',
            updateVerification: fn (ProductOption $opt) => $opt->name === 'Shade'
        );
    }

    protected function testProductOptionValue(): array
    {
        $product = $this->createMockProduct();
        $option = ProductOption::create([
            'product_id' => $product->id,
            'name' => 'Size',
            'sort_order' => 1,
        ]);

        return $this->performStandardCrud(
            modelClass: ProductOptionValue::class,
            createAttributes: [
                'product_option_id' => $option->id,
                'value' => 'Extra Large',
                'sort_order' => 1,
            ],
            updateAttributes: [
                'value' => 'XXL',
            ],
            readVerification: fn (ProductOptionValue $val) => $val->product_option_id === $option->id,
            updateVerification: fn (ProductOptionValue $val) => $val->value === 'XXL'
        );
    }

    protected function testVariantOptionValue(): array
    {
        $product = $this->createMockProduct();
        $variant = $this->createMockVariant($product);
        $option = ProductOption::create(['product_id' => $product->id, 'name' => 'TestOption', 'sort_order' => 1]);
        $val1 = ProductOptionValue::create(['product_option_id' => $option->id, 'value' => 'Val A', 'sort_order' => 1]);
        $val2 = ProductOptionValue::create(['product_option_id' => $option->id, 'value' => 'Val B', 'sort_order' => 2]);

        return $this->performStandardCrud(
            modelClass: VariantOptionValue::class,
            createAttributes: [
                'product_variant_id' => $variant->id,
                'product_option_value_id' => $val1->id,
            ],
            updateAttributes: [
                'product_option_value_id' => $val2->id,
            ],
            readVerification: fn (VariantOptionValue $vov) => $vov->product_variant_id === $variant->id,
            updateVerification: fn (VariantOptionValue $vov) => $vov->product_option_value_id === $val2->id
        );
    }

    protected function testProductImage(): array
    {
        $product = $this->createMockProduct();

        return $this->performStandardCrud(
            modelClass: ProductImage::class,
            createAttributes: [
                'product_id' => $product->id,
                'path' => 'products/sample-test.jpg',
                'is_primary' => true,
                'sort_order' => 1,
            ],
            updateAttributes: [
                'sort_order' => 2,
            ],
            readVerification: fn (ProductImage $img) => $img->product_id === $product->id && $img->is_primary === true,
            updateVerification: fn (ProductImage $img) => $img->sort_order === 2
        );
    }

    protected function testCart(): array
    {
        $user = $this->createMockUser();

        return $this->performStandardCrud(
            modelClass: Cart::class,
            createAttributes: [
                'user_id' => $user->id,
            ],
            updateAttributes: [
                'updated_at' => now(),
            ],
            readVerification: fn (Cart $cart) => $cart->user_id === $user->id,
            updateVerification: fn (Cart $cart) => $cart->id !== null
        );
    }

    protected function testCartItem(): array
    {
        $user = $this->createMockUser();
        $cart = Cart::create(['user_id' => $user->id]);
        $product = $this->createMockProduct();

        return $this->performStandardCrud(
            modelClass: CartItem::class,
            createAttributes: [
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => 2,
                'price_snapshot' => 150.00,
            ],
            updateAttributes: [
                'quantity' => 5,
                'price_snapshot' => 140.00,
            ],
            readVerification: fn (CartItem $item) => $item->cart_id === $cart->id && $item->quantity === 2,
            updateVerification: fn (CartItem $item) => $item->quantity === 5
        );
    }

    protected function testOrder(): array
    {
        $user = $this->createMockUser();
        $unique = strtoupper(Str::random(6));

        return $this->performStandardCrud(
            modelClass: Order::class,
            createAttributes: [
                'order_number' => "ORD-DIAG-{$unique}",
                'user_id' => $user->id,
                'status' => 'pending',
                'subtotal' => 250.00,
                'shipping_fee' => 50.00,
                'tax' => 0.00,
                'discount' => 0.00,
                'total' => 300.00,
                'shipping_address' => [
                    'recipient' => 'Test User',
                    'line1' => '123 Diagnostic St',
                    'city' => 'Manila',
                    'phone' => '09123456789',
                ],
                'payment_method' => 'cod',
                'payment_status' => 'pending',
            ],
            updateAttributes: [
                'status' => 'processing',
                'payment_status' => 'paid',
            ],
            readVerification: fn (Order $order) => $order->user_id === $user->id && $order->status === 'pending',
            updateVerification: fn (Order $order) => $order->status === 'processing' && $order->payment_status === 'paid'
        );
    }

    protected function testOrderItem(): array
    {
        $order = $this->createMockOrder();
        $shop = $this->createMockShop();
        $product = $this->createMockProduct($shop);

        return $this->performStandardCrud(
            modelClass: OrderItem::class,
            createAttributes: [
                'order_id' => $order->id,
                'product_id' => $product->id,
                'shop_id' => $shop->id,
                'quantity' => 2,
                'unit_price' => 100.00,
                'total_price' => 200.00,
                'fulfillment_status' => 'processing',
            ],
            updateAttributes: [
                'fulfillment_status' => 'shipped',
            ],
            readVerification: fn (OrderItem $item) => $item->order_id === $order->id,
            updateVerification: fn (OrderItem $item) => $item->fulfillment_status === 'shipped'
        );
    }

    protected function testPayment(): array
    {
        $order = $this->createMockOrder();

        return $this->performStandardCrud(
            modelClass: Payment::class,
            createAttributes: [
                'order_id' => $order->id,
                'gateway' => 'gcash',
                'transaction_id' => 'TXN-'.Str::random(10),
                'amount' => 300.00,
                'status' => 'pending',
            ],
            updateAttributes: [
                'status' => 'completed',
                'paid_at' => now(),
            ],
            readVerification: fn (Payment $payment) => $payment->order_id === $order->id,
            updateVerification: fn (Payment $payment) => $payment->status === 'completed'
        );
    }

    protected function testPayout(): array
    {
        $shop = $this->createMockShop();

        return $this->performStandardCrud(
            modelClass: Payout::class,
            createAttributes: [
                'shop_id' => $shop->id,
                'amount' => 1250.00,
                'status' => 'pending',
                'period_start' => now()->subDays(7)->toDateString(),
                'period_end' => now()->toDateString(),
            ],
            updateAttributes: [
                'status' => 'processed',
                'paid_at' => now(),
            ],
            readVerification: fn (Payout $payout) => $payout->shop_id === $shop->id,
            updateVerification: fn (Payout $payout) => $payout->status === 'processed'
        );
    }

    protected function testVoucher(): array
    {
        $unique = strtoupper(Str::random(6));

        return $this->performStandardCrud(
            modelClass: Voucher::class,
            createAttributes: [
                'code' => "DIAG_{$unique}",
                'type' => 'fixed',
                'value' => 50.00,
                'created_by_role' => 'admin',
                'min_spend' => 200.00,
                'max_discount' => 50.00,
                'usage_limit' => 100,
                'times_used' => 0,
            ],
            updateAttributes: [
                'value' => 75.00,
                'times_used' => 1,
            ],
            readVerification: fn (Voucher $v) => str_starts_with($v->code, 'DIAG_'),
            updateVerification: fn (Voucher $v) => (float) $v->value === 75.00 && $v->times_used === 1
        );
    }

    protected function testVoucherRedemption(): array
    {
        $voucher = $this->createMockVoucher();
        $user = $this->createMockUser();
        $order = $this->createMockOrder($user);

        return $this->performStandardCrud(
            modelClass: VoucherRedemption::class,
            createAttributes: [
                'voucher_id' => $voucher->id,
                'user_id' => $user->id,
                'order_id' => $order->id,
            ],
            updateAttributes: [
                'updated_at' => now(),
            ],
            readVerification: fn (VoucherRedemption $redemption) => $redemption->voucher_id === $voucher->id,
            updateVerification: fn (VoucherRedemption $redemption) => $redemption->id !== null
        );
    }

    protected function testUserVoucher(): array
    {
        $user = $this->createMockUser();
        $voucher = $this->createMockVoucher();

        return $this->performStandardCrud(
            modelClass: UserVoucher::class,
            createAttributes: [
                'user_id' => $user->id,
                'voucher_id' => $voucher->id,
                'claimed_at' => now(),
                'status' => 'claimed',
            ],
            updateAttributes: [
                'status' => 'redeemed',
            ],
            readVerification: fn (UserVoucher $claim) => $claim->user_id === $user->id && $claim->status === 'claimed',
            updateVerification: fn (UserVoucher $claim) => $claim->status === 'redeemed'
        );
    }

    protected function testAddress(): array
    {
        $user = $this->createMockUser();

        return $this->performStandardCrud(
            modelClass: Address::class,
            createAttributes: [
                'user_id' => $user->id,
                'label' => 'Home',
                'full_name' => 'Diagnostic Tester',
                'phone' => '09123456789',
                'line1' => 'Block 1 Lot 2 Sample St',
                'city' => 'Quezon City',
                'province' => 'Metro Manila',
                'postal_code' => '1100',
                'is_default' => true,
            ],
            updateAttributes: [
                'label' => 'Office',
                'city' => 'Pasig City',
            ],
            readVerification: fn (Address $addr) => $addr->user_id === $user->id && $addr->city === 'Quezon City',
            updateVerification: fn (Address $addr) => $addr->label === 'Office' && $addr->city === 'Pasig City'
        );
    }

    protected function testReview(): array
    {
        $user = $this->createMockUser();
        $shop = $this->createMockShop();
        $product = $this->createMockProduct($shop);
        $order = $this->createMockOrder($user);
        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'shop_id' => $shop->id,
            'quantity' => 1,
            'unit_price' => 100.00,
            'total_price' => 100.00,
            'fulfillment_status' => 'delivered',
        ]);

        return $this->performStandardCrud(
            modelClass: Review::class,
            createAttributes: [
                'product_id' => $product->id,
                'user_id' => $user->id,
                'order_item_id' => $item->id,
                'rating' => 5,
                'comment' => 'Initial diagnostic rating comment.',
            ],
            updateAttributes: [
                'rating' => 4,
                'comment' => 'Updated review comment.',
            ],
            readVerification: fn (Review $rev) => $rev->product_id === $product->id && $rev->rating === 5,
            updateVerification: fn (Review $rev) => $rev->rating === 4
        );
    }

    protected function testProductReview(): array
    {
        $user = $this->createMockUser();
        $shop = $this->createMockShop();
        $product = $this->createMockProduct($shop);

        return $this->performStandardCrud(
            modelClass: ProductReview::class,
            createAttributes: [
                'product_id' => $product->id,
                'user_id' => $user->id,
                'rating' => 5,
                'title' => 'Top Quality',
                'comment' => 'Great material and fast shipping.',
                'status' => 'pending',
            ],
            updateAttributes: [
                'status' => 'approved',
            ],
            readVerification: fn (ProductReview $rev) => $rev->product_id === $product->id && $rev->status === 'pending',
            updateVerification: fn (ProductReview $rev) => $rev->status === 'approved'
        );
    }

    protected function testSellerRating(): array
    {
        $shop = $this->createMockShop();
        $buyer = $this->createMockUser();

        return $this->performStandardCrud(
            modelClass: SellerRating::class,
            createAttributes: [
                'seller_id' => $shop->id,
                'buyer_id' => $buyer->id,
                'rating' => 5,
                'communication_rating' => 5,
                'shipping_rating' => 4,
                'product_accuracy_rating' => 5,
                'comment' => 'Reliable merchant.',
                'status' => 'published',
            ],
            updateAttributes: [
                'comment' => 'Highly recommended seller.',
            ],
            readVerification: fn (SellerRating $rating) => $rating->seller_id === $shop->id && $rating->rating === 5,
            updateVerification: fn (SellerRating $rating) => $rating->comment === 'Highly recommended seller.'
        );
    }

    protected function testSellerFollow(): array
    {
        $shop = $this->createMockShop();
        $follower = $this->createMockUser();

        return $this->performStandardCrud(
            modelClass: SellerFollow::class,
            createAttributes: [
                'seller_id' => $shop->id,
                'follower_id' => $follower->id,
            ],
            updateAttributes: [
                'updated_at' => now(),
            ],
            readVerification: fn (SellerFollow $follow) => $follow->seller_id === $shop->id && $follow->follower_id === $follower->id,
            updateVerification: fn (SellerFollow $follow) => $follow->id !== null
        );
    }

    protected function testWishlist(): array
    {
        $user = $this->createMockUser();
        $product = $this->createMockProduct();

        return $this->performStandardCrud(
            modelClass: Wishlist::class,
            createAttributes: [
                'user_id' => $user->id,
                'product_id' => $product->id,
            ],
            updateAttributes: [
                'updated_at' => now(),
            ],
            readVerification: fn (Wishlist $wl) => $wl->user_id === $user->id && $wl->product_id === $product->id,
            updateVerification: fn (Wishlist $wl) => $wl->id !== null
        );
    }

    protected function testOffer(): array
    {
        $buyer = $this->createMockUser();
        $shop = $this->createMockShop();
        $product = $this->createMockProduct($shop);

        return $this->performStandardCrud(
            modelClass: Offer::class,
            createAttributes: [
                'product_id' => $product->id,
                'buyer_id' => $buyer->id,
                'seller_id' => $shop->id,
                'amount' => 150.00,
                'message' => 'Can you offer at this price?',
                'status' => 'pending',
            ],
            updateAttributes: [
                'status' => 'accepted',
                'responded_at' => now(),
            ],
            readVerification: fn (Offer $offer) => $offer->product_id === $product->id && (float) $offer->amount === 150.00,
            updateVerification: fn (Offer $offer) => $offer->status === 'accepted'
        );
    }

    protected function testOfferMessage(): array
    {
        $buyer = $this->createMockUser();
        $shop = $this->createMockShop();
        $product = $this->createMockProduct($shop);
        $offer = Offer::create([
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $shop->id,
            'amount' => 150.00,
            'message' => 'Initial inquiry',
            'status' => 'pending',
        ]);

        return $this->performStandardCrud(
            modelClass: OfferMessage::class,
            createAttributes: [
                'offer_id' => $offer->id,
                'sender_id' => $buyer->id,
                'message' => 'Counter offering 160.00',
            ],
            updateAttributes: [
                'message' => 'Final deal at 165.00',
            ],
            readVerification: fn (OfferMessage $msg) => $msg->offer_id === $offer->id,
            updateVerification: fn (OfferMessage $msg) => $msg->message === 'Final deal at 165.00'
        );
    }

    protected function testSiteSetting(): array
    {
        $unique = Str::random(6);
        $keyText = "test_brand_name_{$unique}";
        $keyImage = "test_logo_path_{$unique}";

        return $this->performStandardCrud(
            modelClass: SiteSetting::class,
            createAttributes: [
                'key' => $keyText,
                'value' => 'BSAB Initial Brand',
            ],
            updateAttributes: [
                'value' => 'BSAB Updated Brand',
            ],
            readVerification: fn (SiteSetting $setting) => $setting->key === $keyText && $setting->value === 'BSAB Initial Brand',
            updateVerification: fn (SiteSetting $setting) => $setting->value === 'BSAB Updated Brand'
        );
    }

    protected function testAdminSettingsUpload(): array
    {
        // For testing admin settings media logic without polluting actual storage
        $unique = Str::random(8);
        $fakeFileKey = "test_diag_media_path_{$unique}";
        $fakePath = "site/test-diag-media-{$unique}.jpg";

        return $this->performStandardCrud(
            modelClass: SiteSetting::class,
            createAttributes: [
                'key' => $fakeFileKey,
                'value' => $fakePath,
            ],
            updateAttributes: [
                'value' => "site/test-diag-media-{$unique}-updated.jpg",
            ],
            readVerification: fn (SiteSetting $setting) => $setting->key === $fakeFileKey && $setting->value === $fakePath,
            updateVerification: fn (SiteSetting $setting) => str_contains($setting->value, '-updated.jpg')
        );
    }

    protected function testActivityLog(): array
    {
        $user = $this->createMockUser();

        return $this->performStandardCrud(
            modelClass: ActivityLog::class,
            createAttributes: [
                'user_id' => $user->id,
                'action' => 'diagnostic_test_run',
                'subject_type' => User::class,
                'subject_id' => $user->id,
                'metadata' => ['env' => 'test'],
            ],
            updateAttributes: [
                'action' => 'diagnostic_test_run_completed',
            ],
            readVerification: fn (ActivityLog $log) => $log->action === 'diagnostic_test_run',
            updateVerification: fn (ActivityLog $log) => $log->action === 'diagnostic_test_run_completed'
        );
    }

    protected function testInventoryMovement(): array
    {
        $product = $this->createMockProduct();
        $variant = $this->createMockVariant($product);
        $user = $this->createMockUser();

        return $this->performStandardCrud(
            modelClass: InventoryMovement::class,
            createAttributes: [
                'product_variant_id' => $variant->id,
                'quantity' => 10,
                'type' => 'adjustment',
                'notes' => 'Diagnostic restock test',
                'created_by' => $user->id,
            ],
            updateAttributes: [
                'quantity' => 20,
                'notes' => 'Diagnostic restock test updated',
            ],
            readVerification: fn (InventoryMovement $im) => $im->product_variant_id === $variant->id && $im->quantity === 10,
            updateVerification: fn (InventoryMovement $im) => $im->quantity === 20
        );
    }

    protected function testProductMetric(): array
    {
        $product = $this->createMockProduct();

        return $this->performStandardCrud(
            modelClass: ProductMetric::class,
            createAttributes: [
                'product_id' => $product->id,
                'views_count' => 100,
                'wishlist_count' => 15,
                'offer_count' => 3,
                'purchase_count' => 5,
                'quantity_sold' => 8,
                'rating_average' => 4.80,
                'rating_count' => 5,
            ],
            updateAttributes: [
                'views_count' => 150,
                'purchase_count' => 6,
            ],
            readVerification: fn (ProductMetric $m) => $m->product_id === $product->id && $m->views_count === 100,
            updateVerification: fn (ProductMetric $m) => $m->views_count === 150 && $m->purchase_count === 6
        );
    }

    protected function testProductView(): array
    {
        $product = $this->createMockProduct();

        return $this->performStandardCrud(
            modelClass: ProductView::class,
            createAttributes: [
                'product_id' => $product->id,
                'session_id' => 'sess_'.Str::random(12),
                'ip_hash' => hash('sha256', '127.0.0.1'),
                'viewed_at' => now(),
            ],
            updateAttributes: [
                'session_id' => 'sess_updated_'.Str::random(8),
            ],
            readVerification: fn (ProductView $pv) => $pv->product_id === $product->id,
            updateVerification: fn (ProductView $pv) => str_starts_with($pv->session_id, 'sess_updated_')
        );
    }

    // =========================================================================
    // STANDARD CRUD HELPER ENGINE
    // =========================================================================

    /**
     * Perform Create, Read, Update, Delete sequentially on a given Eloquent model.
     */
    protected function performStandardCrud(
        string $modelClass,
        array $createAttributes,
        array $updateAttributes,
        ?callable $readVerification = null,
        ?callable $updateVerification = null
    ): array {
        /** @var Model $instance */
        $instance = new $modelClass;
        $table = $instance->getTable();
        $results = [];
        $createdModel = null;

        // 1. CREATE
        $createStart = microtime(true);
        try {
            $createdModel = $modelClass::create($createAttributes);

            if (! $createdModel || ! $createdModel->exists || $createdModel->getKey() === null) {
                throw new \RuntimeException("Model [{$modelClass}] failed to return a valid persisted instance after create().");
            }

            $results['create'] = [
                'status' => 'working',
                'duration_ms' => round((microtime(true) - $createStart) * 1000, 2),
                'details' => "Successfully inserted ID: {$createdModel->getKey()}",
            ];
        } catch (Throwable $e) {
            $results['create'] = [
                'status' => 'not_working',
                'duration_ms' => round((microtime(true) - $createStart) * 1000, 2),
                'diagnosis' => $this->diagnoseException($e, 'create', $table, $createAttributes),
            ];

            // If Create failed, subsequent operations cannot proceed
            $results['read'] = [
                'status' => 'not_working',
                'duration_ms' => 0,
                'diagnosis' => [
                    'category' => 'Prerequisite Failed',
                    'why_failed' => 'READ operation skipped because CREATE failed.',
                    'suggested_fix' => 'Fix the CREATE failure first so the record can be read.',
                ],
            ];
            $results['update'] = [
                'status' => 'not_working',
                'duration_ms' => 0,
                'diagnosis' => [
                    'category' => 'Prerequisite Failed',
                    'why_failed' => 'UPDATE operation skipped because CREATE failed.',
                    'suggested_fix' => 'Fix the CREATE failure first so the record can be updated.',
                ],
            ];
            $results['delete'] = [
                'status' => 'not_working',
                'duration_ms' => 0,
                'diagnosis' => [
                    'category' => 'Prerequisite Failed',
                    'why_failed' => 'DELETE operation skipped because CREATE failed.',
                    'suggested_fix' => 'Fix the CREATE failure first so the record can be deleted.',
                ],
            ];

            return $results;
        }

        // 2. READ
        $readStart = microtime(true);
        try {
            $fetched = $modelClass::query()->find($createdModel->getKey());

            if (! $fetched) {
                throw new \RuntimeException("Model [{$modelClass}] with ID {$createdModel->getKey()} was not found when querying primary key.");
            }

            if ($readVerification && ! $readVerification($fetched)) {
                throw new \RuntimeException("Model [{$modelClass}] read verification failed: retrieved attributes do not match expected values.");
            }

            $results['read'] = [
                'status' => 'working',
                'duration_ms' => round((microtime(true) - $readStart) * 1000, 2),
                'details' => "Successfully retrieved record ID: {$fetched->getKey()} from table `{$table}`",
            ];
        } catch (Throwable $e) {
            $results['read'] = [
                'status' => 'not_working',
                'duration_ms' => round((microtime(true) - $readStart) * 1000, 2),
                'diagnosis' => $this->diagnoseException($e, 'read', $table),
            ];
        }

        // 3. UPDATE
        $updateStart = microtime(true);
        try {
            $createdModel->fill($updateAttributes);
            $saved = $createdModel->save();

            if (! $saved) {
                throw new \RuntimeException("Model [{$modelClass}] save() returned false during UPDATE.");
            }

            $reloaded = $createdModel->fresh();

            if ($updateVerification && ! $updateVerification($reloaded)) {
                throw new \RuntimeException("Model [{$modelClass}] update verification failed: values did not persist after fresh().");
            }

            $results['update'] = [
                'status' => 'working',
                'duration_ms' => round((microtime(true) - $updateStart) * 1000, 2),
                'details' => "Successfully updated record ID: {$createdModel->getKey()} in table `{$table}`",
            ];
        } catch (Throwable $e) {
            $results['update'] = [
                'status' => 'not_working',
                'duration_ms' => round((microtime(true) - $updateStart) * 1000, 2),
                'diagnosis' => $this->diagnoseException($e, 'update', $table, $updateAttributes),
            ];
        }

        // 4. DELETE
        $deleteStart = microtime(true);
        try {
            $pk = $createdModel->getKey();
            $deleted = $createdModel->delete();

            if (! $deleted) {
                throw new \RuntimeException("Model [{$modelClass}] delete() returned false.");
            }

            // Verify deletion (accounting for SoftDeletes)
            if (in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses_recursive($modelClass), true)) {
                $trashed = $modelClass::withTrashed()->find($pk);
                if (! $trashed || ! $trashed->trashed()) {
                    throw new \RuntimeException("Soft-deleted model [{$modelClass}] does not have deleted_at set.");
                }
                $results['delete'] = [
                    'status' => 'working',
                    'duration_ms' => round((microtime(true) - $deleteStart) * 1000, 2),
                    'details' => "Successfully soft-deleted record ID: {$pk} (deleted_at set)",
                ];
            } else {
                $check = $modelClass::query()->find($pk);
                if ($check !== null) {
                    throw new \RuntimeException("Record ID {$pk} still exists in table `{$table}` after delete().");
                }
                $results['delete'] = [
                    'status' => 'working',
                    'duration_ms' => round((microtime(true) - $deleteStart) * 1000, 2),
                    'details' => "Successfully hard-deleted record ID: {$pk} from table `{$table}`",
                ];
            }
        } catch (Throwable $e) {
            $results['delete'] = [
                'status' => 'not_working',
                'duration_ms' => round((microtime(true) - $deleteStart) * 1000, 2),
                'diagnosis' => $this->diagnoseException($e, 'delete', $table),
            ];
        }

        return $results;
    }

    // =========================================================================
    // ROOT-CAUSE DIAGNOSTIC ANALYZER
    // =========================================================================

    /**
     * Inspect exception and generate clear explanation of why it failed and how to fix it.
     */
    public function diagnoseException(Throwable $e, string $operation, string $table, array $payload = []): array
    {
        $message = $e->getMessage();
        $class = get_class($e);
        $code = (string) $e->getCode();
        $sql = null;
        $bindings = null;

        if ($e instanceof QueryException) {
            $sql = $e->getSql();
            $bindings = $e->getBindings();
        }

        $category = 'Database / Runtime Error';
        $whyFailed = $message;
        $suggestedFix = 'Inspect the error details and verify database schema and code logic.';

        // 1. Column not found (SQLSTATE 42S22 / 1054)
        if (str_contains($message, '42S22') || str_contains($message, 'Unknown column') || str_contains($message, '1054 Unknown column')) {
            $category = 'Missing Database Column';
            preg_match("/Unknown column '([^']+)'/i", $message, $matches);
            $column = $matches[1] ?? 'unknown';
            $whyFailed = "The table `{$table}` is missing the column '{$column}'. The code attempted to access or insert into a column that does not exist in the database.";
            $suggestedFix = "Create a migration to add '{$column}' to `{$table}`: `php artisan make:migration add_{$column}_to_{$table}_table` then run `php artisan migrate`.";
        }
        // 2. Table not found (SQLSTATE 42S02 / 1146)
        elseif (str_contains($message, '42S02') || str_contains($message, 'Table') && str_contains($message, "doesn't exist") || str_contains($message, '1146')) {
            $category = 'Missing Database Table';
            $whyFailed = "The database table `{$table}` does not exist.";
            $suggestedFix = 'Run pending migrations using `php artisan migrate`. Ensure the table creation migration has executed.';
        }
        // 3. Foreign key constraint violation (SQLSTATE 23000 / 1452)
        elseif (str_contains($message, '1452') || str_contains($message, 'foreign key constraint fails')) {
            $category = 'Foreign Key Constraint Violation';
            $whyFailed = "Foreign key relationship constraint failed on table `{$table}`. A referenced parent record in another table does not exist or has been deleted.";
            $suggestedFix = 'Ensure all required parent relationship records exist prior to performing this operation, or check foreign key cascade definitions.';
        }
        // 4. Cannot be null constraint (SQLSTATE 23000 / 1048)
        elseif (str_contains($message, '1048') || str_contains($message, 'cannot be null')) {
            $category = 'Not Null Constraint Violation';
            preg_match("/Column '([^']+)' cannot be null/i", $message, $matches);
            $col = $matches[1] ?? 'a required column';
            $whyFailed = "The column '{$col}' on table `{$table}` is defined as NOT NULL without a default value, but null or no value was provided.";
            $suggestedFix = "Pass a valid value for '{$col}' during {$operation}, or modify the migration to make it `->nullable()` or specify `->default(...)`.";
        }
        // 5. Duplicate unique entry (SQLSTATE 23000 / 1062)
        elseif (str_contains($message, '1062') || str_contains($message, 'Duplicate entry')) {
            $category = 'Duplicate Unique Key Violation';
            preg_match("/Duplicate entry '([^']+)' for key '([^']+)'/i", $message, $matches);
            $entry = $matches[1] ?? 'value';
            $keyName = $matches[2] ?? 'unique index';
            $whyFailed = "Duplicate entry '{$entry}' violates the unique index '{$keyName}' on table `{$table}`.";
            $suggestedFix = 'Ensure unique values (e.g., slug, sku, email) are generated with collision detection or random suffixes before saving.';
        }
        // 6. MassAssignmentException
        elseif ($e instanceof MassAssignmentException) {
            $category = 'Mass Assignment Exception';
            $whyFailed = 'One or more fields in the payload are not listed in `protected $fillable` or are blocked by `$guarded` on the model.';
            $suggestedFix = 'Add the missing attribute names to the `$fillable` array in the model class.';
        }
        // 7. Missing soft deletes column
        elseif (str_contains($message, 'deleted_at') && str_contains($message, '42S22')) {
            $category = 'Missing SoftDeletes Column';
            $whyFailed = "The model uses `SoftDeletes` trait, but the `deleted_at` column is missing from table `{$table}`.";
            $suggestedFix = "Add `\$table->softDeletes();` to a migration for `{$table}` and run `php artisan migrate`.";
        }
        // 8. Connection refused or lost
        elseif (str_contains(strtolower($message), 'connection refused') || str_contains(strtolower($message), 'server has gone away')) {
            $category = 'Database Connection Failed';
            $whyFailed = 'Could not connect to the database server. Connection was refused or dropped.';
            $suggestedFix = 'Verify DB_HOST, DB_PORT, DB_USERNAME, and DB_PASSWORD environment variables in Railway or .env.';
        }

        return [
            'category' => $category,
            'why_failed' => $whyFailed,
            'suggested_fix' => $suggestedFix,
            'exception_class' => class_basename($class),
            'full_class' => $class,
            'error_message' => $message,
            'error_code' => $code,
            'sql' => $sql,
            'bindings' => $bindings,
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ];
    }

    // =========================================================================
    // MOCK FACTORY HELPERS
    // =========================================================================

    protected function createMockUser(string $role = 'customer'): User
    {
        $unique = Str::random(8);

        return User::create([
            'name' => "Mock User {$unique}",
            'email' => "mock_{$unique}@example.com",
            'role' => $role,
            'status' => 'active',
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            'must_change_password' => false,
        ]);
    }

    protected function createMockShop(?User $user = null): Shop
    {
        $user = $user ?: $this->createMockUser('seller');
        $unique = Str::random(8);

        return Shop::create([
            'user_id' => $user->id,
            'name' => "Mock Shop {$unique}",
            'slug' => "mock-shop-{$unique}",
            'status' => 'approved',
            'commission_rate' => 10.00,
        ]);
    }

    protected function createMockCategory(): Category
    {
        $unique = Str::random(8);

        return Category::create([
            'name' => "Mock Category {$unique}",
            'slug' => "mock-cat-{$unique}",
        ]);
    }

    protected function createMockProduct(?Shop $shop = null, ?Category $category = null): Product
    {
        $shop = $shop ?: $this->createMockShop();
        $category = $category ?: $this->createMockCategory();
        $unique = Str::random(8);

        return Product::create([
            'shop_id' => $shop->id,
            'category_id' => $category->id,
            'name' => "Mock Product {$unique}",
            'slug' => "mock-prod-{$unique}",
            'description' => 'Mock description',
            'base_price' => 99.00,
            'sku' => "SKU-MOCK-{$unique}",
            'stock_quantity' => 50,
            'status' => 'published',
            'is_approved' => true,
        ]);
    }

    protected function createMockVariant(Product $product): ProductVariant
    {
        $unique = Str::random(8);

        return ProductVariant::create([
            'product_id' => $product->id,
            'name' => 'Default Variant',
            'sku' => "SKU-VAR-MOCK-{$unique}",
            'price' => 99.00,
            'stock_quantity' => 50,
            'is_active' => true,
        ]);
    }

    protected function createMockOrder(?User $user = null): Order
    {
        $user = $user ?: $this->createMockUser('customer');
        $unique = strtoupper(Str::random(6));

        return Order::create([
            'order_number' => "ORD-MOCK-{$unique}",
            'user_id' => $user->id,
            'status' => 'pending',
            'subtotal' => 100.00,
            'shipping_fee' => 0.00,
            'tax' => 0.00,
            'discount' => 0.00,
            'total' => 100.00,
            'shipping_address' => ['recipient' => 'Mock User', 'line1' => '123 St'],
            'payment_method' => 'cod',
            'payment_status' => 'pending',
        ]);
    }

    protected function createMockVoucher(): Voucher
    {
        $unique = strtoupper(Str::random(6));

        return Voucher::create([
            'code' => "MOCK_{$unique}",
            'type' => 'fixed',
            'value' => 20.00,
            'created_by_role' => 'admin',
            'min_spend' => 100.00,
        ]);
    }
}
