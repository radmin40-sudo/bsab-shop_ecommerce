<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserVoucher;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoucherClaimController extends Controller
{
    public function index(Request $request)
    {
        $vouchers = Voucher::with('shop:id,name')->latest()->get();
        $claims = UserVoucher::where('user_id', $request->user()->id)->get()->keyBy('voucher_id');
        $present = fn (Voucher $voucher) => $this->present($voucher, $claims->get($voucher->id));

        return response()->json([
            'vouchers' => $vouchers->map($present)->values(),
            'claimed_vouchers' => $vouchers->filter(fn (Voucher $voucher) => $claims->has($voucher->id))->map($present)->values(),
        ]);
    }

    public function claim(Request $request, Voucher $voucher)
    {
        $claim = DB::transaction(function () use ($request, $voucher) {
            $lockedVoucher = Voucher::whereKey($voucher->id)->lockForUpdate()->firstOrFail();
            if (UserVoucher::where('user_id', $request->user()->id)->where('voucher_id', $lockedVoucher->id)->exists()) {
                abort(422, 'ALREADY_CLAIMED');
            }
            $state = $this->state($lockedVoucher);
            abort_if($state === 'inactive', 422, 'Voucher is currently unavailable.');
            abort_if($state === 'not_started', 422, 'Voucher is not available yet.');
            abort_if($state === 'expired', 422, 'Voucher has expired.');
            abort_if($state === 'fully_claimed', 422, 'CLAIM_LIMIT_REACHED');

            $claim = UserVoucher::create(['user_id' => $request->user()->id, 'voucher_id' => $lockedVoucher->id, 'claimed_at' => now(), 'status' => 'claimed']);
            $lockedVoucher->increment('total_claimed');

            return $claim;
        });

        $voucher->refresh();
        $limit = $voucher->total_claim_limit ?? $voucher->usage_limit;
        $claimed = $voucher->total_claimed ?? $voucher->times_used;

        return response()->json(['success' => true, 'message' => 'Voucher claimed successfully', 'voucher' => $this->present($voucher, $claim), 'remainingClaims' => $limit === null ? null : max(0, $limit - $claimed)], 201);
    }

    private function present(Voucher $voucher, ?UserVoucher $claim): array
    {
        $limit = $voucher->total_claim_limit ?? $voucher->usage_limit;
        $claimed = $voucher->total_claimed ?? $voucher->times_used;

        return ['id' => $voucher->id, 'code' => $voucher->code, 'title' => $voucher->title ?: $this->discountLabel($voucher), 'description' => $voucher->description, 'type' => $voucher->type, 'value' => $voucher->value, 'min_spend' => $voucher->min_spend, 'max_discount' => $voucher->max_discount, 'total_claim_limit' => $limit, 'total_claimed' => $claimed, 'remaining_claims' => $limit === null ? null : max(0, $limit - $claimed), 'expires_at' => $voucher->expiration_date ?: $voucher->expires_at, 'start_date' => $voucher->start_date, 'status' => $claim ? 'claimed' : $this->state($voucher), 'shop' => $voucher->shop];
    }

    private function state(Voucher $voucher): string
    {
        if ($voucher->status !== 'active') {
            return 'inactive';
        }
        if ($voucher->start_date?->isFuture()) {
            return 'not_started';
        }
        if (($voucher->expiration_date ?: $voucher->expires_at)?->isPast()) {
            return 'expired';
        }
        $limit = $voucher->total_claim_limit ?? $voucher->usage_limit;

        return $limit !== null && ($voucher->total_claimed ?? $voucher->times_used) >= $limit ? 'fully_claimed' : 'available';
    }

    private function discountLabel(Voucher $voucher): string
    {
        return strtolower($voucher->type) === 'percent' ? $voucher->value.'% OFF' : '₱'.$voucher->value.' OFF';
    }
}
