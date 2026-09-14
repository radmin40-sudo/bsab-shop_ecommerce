<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Spatie\Permission\Models\Role;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();
        $user = User::query()->where('email', $googleUser->getEmail())->first();

        if (! $user) {
            $user = User::create([
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'Google user',
                'email' => $googleUser->getEmail(),
                'email_verified_at' => now(),
                'role' => 'customer',
                'avatar' => $googleUser->getAvatar(),
                'password' => Hash::make(Str::random(40)),
            ]);

            Role::findOrCreate('customer', 'web');
            $user->assignRole('customer');
        }

        Auth::login($user);
        request()->session()->regenerate();

        return to_route('dashboard');
    }
}
