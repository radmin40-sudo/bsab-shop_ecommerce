<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherClaim;
use App\Models\VoucherUsage;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VoucherService
{
    public function availableForCustomer(User $user): Collection
    {
        $query = Voucher::query()
            ->where('is_active', true)
            ->where(fn ($builder) => $builder->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($builder) => $builder->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->withCount([
                'claims',
                'usages',
                'usages as user_used_count' => fn ($builder) => $builder->where('user_id', $user->id)->where('status', 'used'),
            ])
            ->withExists([
                'claims as claimed_by_user' => fn ($builder) => $builder->where('user_id', $user->id)->where('status', 'claimed'),
            ])
            ->latest();

        if ($user->orders()->exists()) {
            $query->whereNotIn('customer_eligibility', ['new_customer', 'first_order']);
        }

        return $query->get()->filter(function (Voucher $voucher) use ($user) {
            if ($voucher->total_usage_limit !== null && $voucher->usages_count >= $voucher->total_usage_limit) {
                return false;
            }

            if ($voucher->per_customer_usage_limit !== null && $voucher->user_used_count >= $voucher->per_customer_usage_limit) {
                return false;
            }

            return true;
        })->values();
    }

    public function newClaimableCount(User $user): int
    {
        return $this->availableForCustomer($user)
            ->filter(fn (Voucher $voucher) => $voucher->requires_claim && ! $voucher->claimed_by_user)
            ->count();
    }

    public function availableForProduct(Product $product, ?User $user = null): Collection
    {
        $query = Voucher::query()
            ->where('is_active', true)
            ->where(fn ($builder) => $builder->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($builder) => $builder->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->where(fn ($builder) => $builder->whereNull('seller_id')->orWhere('seller_id', $product->shop_id))
            ->where(function ($builder) use ($product) {
                $builder->where('apply_to', 'all')
                    ->orWhere(fn ($target) => $target->where('apply_to', 'products')->whereHas('products', fn ($products) => $products->whereKey($product->id)))
                    ->orWhere(fn ($target) => $target->where('apply_to', 'categories')->whereHas('categories', fn ($categories) => $categories->whereKey($product->category_id)))
                    ->orWhere(fn ($target) => $target->where('apply_to', 'sellers')->where(fn ($sellers) => $sellers->where('seller_id', $product->shop_id)->orWhereHas('sellers', fn ($shops) => $shops->whereKey($product->shop_id))))
                    ->orWhere(fn ($target) => $target->where('apply_to', 'variants')->whereHas('variants', fn ($variants) => $variants->where('product_id', $product->id)));
            })
            ->withCount(['claims', 'usages'])
            ->latest();

        if (! $user) {
            $query->where('customer_eligibility', 'all')->where('requires_claim', false);
        } else {
            if ($user->orders()->exists()) {
                $query->whereNotIn('customer_eligibility', ['new_customer', 'first_order']);
            }

        }

        return $query->get()->filter(function (Voucher $voucher) use ($user) {
            if ($voucher->total_usage_limit !== null && $voucher->usages_count >= $voucher->total_usage_limit) {
                return false;
            }

            return ! $user || $voucher->per_customer_usage_limit === null
                || $voucher->usages()->where('user_id', $user->id)->where('status', 'used')->count() < $voucher->per_customer_usage_limit;
        })->each(function (Voucher $voucher) use ($user) {
            $voucher->setAttribute('claimed_by_user', $user
                ? $voucher->claims()->where('user_id', $user->id)->where('status', 'claimed')->exists()
                : false);
        })->values();
    }

    public function applyCode(Cart $cart, User $user, string $code): array
    {
        $voucher = Voucher::query()->whereRaw('UPPER(code) = ?', [mb_strtoupper(trim($code))])->first();
        if (! $voucher) {
            throw ValidationException::withMessages(['voucher_code' => 'Voucher code was not found.']);
        }

        $this->quote($voucher, $user, $cart->items()->with('product.category', 'variant')->get());
        $cart->update(['voucher_id' => $voucher->id]);

        return $this->quote($voucher, $user, $cart->items()->with('product.category', 'variant')->get());
    }

    public function quote(Voucher $voucher, User $user, iterable $items): array
    {
        $items = $items instanceof Collection ? $items : collect($items);
        $this->assertAvailable($voucher, $user);

        $eligibleSubtotal = 0.0;
        foreach ($items as $item) {
            if ($this->isProductEligible($voucher, $item)) {
                $eligibleSubtotal += (float) $item->price_snapshot * (int) $item->quantity;
            }
        }

        if ($eligibleSubtotal < (float) $voucher->minimum_spend) {
            throw ValidationException::withMessages(['voucher_code' => 'Minimum spend for this voucher has not been reached.']);
        }

        if ($eligibleSubtotal <= 0 && ! $voucher->free_shipping && $voucher->type !== 'free_shipping') {
            throw ValidationException::withMessages(['voucher_code' => 'This voucher does not apply to products in your cart.']);
        }

        $discount = match ($voucher->type) {
            'percentage' => $eligibleSubtotal * ((float) $voucher->discount_value / 100),
            'free_shipping' => 0.0,
            default => (float) $voucher->discount_value,
        };

        if ($voucher->maximum_discount !== null) {
            $discount = min($discount, (float) $voucher->maximum_discount);
        }

        $discount = round(min($discount, $eligibleSubtotal), 2);

        return [
            'voucher_id' => $voucher->id,
            'code' => $voucher->code,
            'name' => $voucher->name,
            'type' => $voucher->type,
            'eligible_subtotal' => round($eligibleSubtotal, 2),
            'discount' => $discount,
            'free_shipping' => $voucher->free_shipping || $voucher->type === 'free_shipping',
            'expires_at' => $voucher->expires_at?->toISOString(),
        ];
    }

    public function isProductEligible(Voucher $voucher, CartItem $item): bool
    {
        $product = $item->product;
        if (! $product || $product->status === 'rejected' || ! $product->is_active) {
            return false;
        }

        if ($item->variant && (! $item->variant->is_active || $item->variant->stock_quantity < $item->quantity)) {
            return false;
        }

        if (! $item->variant && $product->variants()->where('is_active', true)->exists() && $product->variants()->where('is_active', true)->sum('stock_quantity') < $item->quantity) {
            return false;
        }

        if (! $item->variant && ! $product->variants()->where('is_active', true)->exists() && $product->stock_quantity < $item->quantity) {
            return false;
        }

        $scope = $voucher->apply_to;
        if ($voucher->seller_id && (int) $product->shop_id !== (int) $voucher->seller_id) {
            return false;
        }

        return match ($scope) {
            'products' => $voucher->products()->whereKey($product->id)->exists(),
            'categories' => $voucher->categories()->whereKey($product->category_id)->exists(),
            'variants' => $item->variant_id && $voucher->variants()->whereKey($item->variant_id)->exists(),
            'sellers' => $voucher->sellers()->whereKey($product->shop_id)->exists() || (int) $voucher->seller_id === (int) $product->shop_id,
            default => true,
        };
    }

    public function claim(Voucher $voucher, User $user): VoucherClaim
    {
        return DB::transaction(function () use ($voucher, $user) {
            $lockedVoucher = Voucher::query()->lockForUpdate()->findOrFail($voucher->id);
            $this->assertAvailable($lockedVoucher, $user, allowUnclaimed: true);

            if ($lockedVoucher->claim_limit !== null && $lockedVoucher->claims()->whereIn('status', ['claimed', 'used'])->count() >= $lockedVoucher->claim_limit) {
                throw ValidationException::withMessages(['voucher' => 'This voucher has reached its claim limit.']);
            }

            if ($lockedVoucher->claims()->where('user_id', $user->id)->where('status', 'claimed')->exists()) {
                throw ValidationException::withMessages(['voucher' => 'You have already claimed this voucher.']);
            }

            $userClaims = $lockedVoucher->claims()->where('user_id', $user->id)->whereIn('status', ['claimed', 'used'])->count();
            if ($lockedVoucher->per_customer_usage_limit !== null && $userClaims >= $lockedVoucher->per_customer_usage_limit) {
                throw ValidationException::withMessages(['voucher' => 'You have reached the claim limit for this voucher.']);
            }

            return VoucherClaim::create([
                'voucher_id' => $lockedVoucher->id,
                'user_id' => $user->id,
                'status' => 'claimed',
                'claimed_at' => now(),
            ]);
        });
    }

    public function recordUsage(Voucher $voucher, User $user, $order, float $discount): VoucherUsage
    {
        $claim = $voucher->claims()
            ->where('user_id', $user->id)
            ->where('status', 'claimed')
            ->oldest('claimed_at')
            ->first();

        if ($voucher->requires_claim && ! $claim) {
            throw ValidationException::withMessages(['voucher_code' => 'Claim this voucher before using it.']);
        }

        $usage = VoucherUsage::create([
            'voucher_id' => $voucher->id,
            'user_id' => $user->id,
            'order_id' => $order->id,
            'claim_id' => $claim?->id,
            'code_snapshot' => $voucher->code,
            'discount_amount' => $discount,
            'status' => 'used',
            'used_at' => now(),
        ]);

        $claim?->update(['status' => 'used', 'order_id' => $order->id, 'used_at' => now(), 'discount_amount' => $discount]);

        return $usage;
    }

    public function releaseUsageForCancelledOrder($order): void
    {
        $usage = $order->voucherUsages()->where('status', 'used')->first();
        if (! $usage) {
            return;
        }

        $usage->update(['status' => 'cancelled']);
        $usage->claim?->update(['status' => 'cancelled']);
    }

    private function assertAvailable(Voucher $voucher, User $user, bool $allowUnclaimed = false): void
    {
        $now = now();
        if (! $voucher->is_active || ($voucher->starts_at && $voucher->starts_at->isFuture()) || ($voucher->expires_at && $voucher->expires_at->isPast())) {
            throw ValidationException::withMessages(['voucher_code' => 'This voucher is not currently active.']);
        }

        if ($voucher->total_usage_limit !== null && $voucher->usages()->where('status', 'used')->count() >= $voucher->total_usage_limit) {
            throw ValidationException::withMessages(['voucher_code' => 'This voucher has reached its usage limit.']);
        }

        if ($voucher->per_customer_usage_limit !== null && $voucher->usages()->where('user_id', $user->id)->where('status', 'used')->count() >= $voucher->per_customer_usage_limit) {
            throw ValidationException::withMessages(['voucher_code' => 'You have already used this voucher the maximum number of times.']);
        }

        if (in_array($voucher->customer_eligibility, ['new_customer', 'first_order'], true) && $user->orders()->exists()) {
            throw ValidationException::withMessages(['voucher_code' => 'This voucher is available to new customers only.']);
        }

        if (! $allowUnclaimed && $voucher->requires_claim && ! $voucher->claims()->where('user_id', $user->id)->where('status', 'claimed')->exists()) {
            throw ValidationException::withMessages(['voucher_code' => 'Claim this voucher before using it.']);
        }
    }
}