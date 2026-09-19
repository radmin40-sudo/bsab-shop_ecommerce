<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ImageOptimizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminSellerController extends Controller
{
    public function index()
    {
        return User::role('seller')->with('shop')->paginate(20);
    }

    public function store(Request $request, ImageOptimizationService $images)
    {
        $data = $request->validate(['name' => 'required|string|max:255', 'email' => 'required|email|unique:users,email', 'phone' => 'nullable|string|max:30', 'password' => 'nullable|string|min:12', 'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:'.config('images.max_upload_kb'), 'shop_name' => 'required|string|max:255', 'commission_rate' => 'nullable|numeric|min:0|max:100']);
        $seller = DB::transaction(function () use ($data, $request, $images) {
            $avatar = $request->hasFile('avatar')
                ? $images->store($request->file('avatar'), 'avatars', ['max_dimension' => config('images.profile_max_dimension')])
                : null;
            $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'role' => 'seller', 'phone' => $data['phone'] ?? null, 'avatar' => $avatar, 'password' => Hash::make($data['password'] ?? Str::password(16)), 'must_change_password' => ! isset($data['password'])]);
            $user->assignRole('seller');
            $user->shop()->create(['created_by' => $request->user()->id, 'name' => $data['shop_name'], 'slug' => Str::slug($data['shop_name']).'-'.Str::lower(Str::random(5)), 'commission_rate' => $data['commission_rate'] ?? 10]);

            return $user->load('shop');
        });

        return response()->json($seller, 201);
    }

    public function update(Request $request, User $seller, ImageOptimizationService $images)
    {
        abort_unless($seller->hasRole('seller'), 404);
        $data = $request->validate(['name' => 'sometimes|string|max:255', 'phone' => 'nullable|string|max:30', 'status' => 'sometimes|in:active,suspended', 'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:'.config('images.max_upload_kb')]);
        if ($request->hasFile('avatar')) {
            if ($seller->avatar) {
                Storage::disk('public')->delete($seller->avatar);
            }
            $data['avatar'] = $images->store($request->file('avatar'), 'avatars', ['max_dimension' => config('images.profile_max_dimension')]);
        }
        $seller->update($data);
        if ($request->filled('shop_name')) {
            $seller->shop->update(['name' => $request->validate(['shop_name' => 'string|max:255'])['shop_name']]);
        }

        return $seller->load('shop');
    }

    public function suspend(User $seller)
    {
        abort_unless($seller->hasRole('seller'), 404);
        $seller->update(['status' => 'suspended']);

        return $seller;
    }

    public function reactivate(User $seller)
    {
        abort_unless($seller->hasRole('seller'), 404);
        $seller->update(['status' => 'active']);

        return $seller;
    }

    public function destroy(User $seller)
    {
        abort_unless($seller->hasRole('seller'), 404);
        if ($seller->avatar) {
            Storage::disk('public')->delete($seller->avatar);
        }
        DB::transaction(fn () => $seller->delete());

        return response()->noContent();
    }
}
