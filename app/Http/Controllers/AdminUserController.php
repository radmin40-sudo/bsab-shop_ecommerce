<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdminUserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/users', [
            'users' => User::with('roles:id,name')->latest()->get(['id', 'name', 'email', 'role', 'status', 'created_at']),
        ]);
    }

    public function customers(): Response
    {
        return Inertia::render('admin/customers', [
            'customers' => User::query()
                ->where('role', 'customer')
                ->withCount('orders')
                ->latest()
                ->get(['id', 'name', 'email', 'status', 'created_at']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Rules\Password::defaults()],
            'role' => ['required', Rule::in(['admin', 'seller', 'customer'])],
            'status' => ['required', Rule::in(['active', 'suspended'])],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'password' => Hash::make($data['password']),
            'status' => $data['status'],
        ]);
        Role::findOrCreate($data['role'], 'web');
        $user->assignRole($data['role']);

        return to_route('admin.users');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', Rules\Password::defaults()],
            'role' => ['required', Rule::in(['admin', 'seller', 'customer'])],
            'status' => ['required', Rule::in(['active', 'suspended'])],
        ]);

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'status' => $data['status'],
        ]);
        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();
        Role::findOrCreate($data['role'], 'web');
        $user->syncRoles([$data['role']]);

        return to_route('admin.users');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($request->user()->is($user), 422, 'You cannot delete your own admin account.');
        $user->delete();

        return to_route('admin.users');
    }
}
