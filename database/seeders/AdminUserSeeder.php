<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@example.com')],
            [
                'name' => env('ADMIN_NAME', 'Administrator'),
                'password' => env('ADMIN_PASSWORD', 'ChangeMe123!'),
                'email_verified_at' => now(),
                'role' => 'admin',
                'status' => 'active',
                'must_change_password' => true,
            ],
        );

        $admin->syncRoles([Role::findOrCreate('admin', 'web')]);
    }
}
