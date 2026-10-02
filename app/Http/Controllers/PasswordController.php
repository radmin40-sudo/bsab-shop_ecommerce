<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('welcome');
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $passwordRule = $user->hasRole('seller')
            ? Password::min(8)->mixedCase()->numbers()->symbols()
            : Password::defaults();
        $rules = ['password' => ['required', 'confirmed', $passwordRule]];

        if (! $user->hasAnyRole(['admin', 'seller'])) {
            $rules['current_password'] = ['required', 'current_password'];
        }

        $data = $request->validate($rules);
        $user->update(['password' => Hash::make($data['password'])]);

        if ($user->hasRole('admin')) {
            return to_route('admin.profile');
        }

        if ($user->hasRole('seller')) {
            return to_route('seller.profile');
        }

        if ($user->hasRole('customer')) {
            return to_route('customer.profile');
        }

        return to_route('user-password.edit');
    }
}
