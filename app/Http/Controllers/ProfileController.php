<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render($user->hasRole('admin') ? 'admin/profile' : ($user->hasRole('seller') ? 'seller/profile' : ($user->hasRole('customer') ? 'customer/profile' : 'welcome')), [
            'address' => $user->addresses()->where('is_default', true)->first() ?? $user->addresses()->first(),
            'avatarUrl' => $user->avatar ? '/storage/'.$user->avatar : null,
            'availableVouchers' => $user->hasRole('customer')
                ? Voucher::with('shop:id,name')
                    ->where(function ($query) {
                        $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
                    })
                    ->where(function ($query) {
                        $query->whereNull('usage_limit')->orWhereColumn('times_used', '<', 'usage_limit');
                    })
                    ->whereDoesntHave('redemptions', fn ($query) => $query->where('user_id', $user->id))
                    ->latest()
                    ->get(['id', 'code', 'type', 'value', 'shop_id', 'min_spend', 'max_discount', 'expires_at'])
                : [],
            'usedVouchers' => $user->hasRole('customer')
                ? $user->voucherRedemptions()->with(['voucher.shop:id,name', 'order:id,order_number,created_at'])->latest()->get()
                : [],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'address' => ['nullable', 'array'],
            'address.full_name' => ['required_with:address', 'string', 'max:255'],
            'address.phone' => ['required_with:address', 'string', 'max:50'],
            'address.line1' => ['required_with:address', 'string', 'max:255'],
            'address.city' => ['required_with:address', 'string', 'max:255'],
            'address.province' => ['required_with:address', 'string', 'max:255'],
            'address.postal_code' => ['required_with:address', 'string', 'max:20'],
        ]);
        if ($data['email'] !== $user->email) {
            $user->email_verified_at = null;
        }
        $user->fill(['name' => $data['name'], 'email' => $data['email'], 'phone' => $data['phone'] ?? null]);
        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        }
        $user->save();
        if (! empty($data['address'])) {
            $address = $user->addresses()->where('is_default', true)->first() ?? $user->addresses()->first();
            if ($address) {
                $address->update($data['address']);
            } else {
                $user->addresses()->create(array_merge($data['address'], ['label' => 'Home', 'is_default' => true]));
            }
        }

        if ($user->hasRole('admin')) {
            return to_route('admin.profile');
        }

        if ($user->hasRole('seller')) {
            return to_route('seller.profile');
        }

        return to_route('profile.edit');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);
        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('home');
    }
}
