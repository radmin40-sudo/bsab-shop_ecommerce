<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminSellerCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_seller_creation_sets_the_database_role_to_seller(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Role::findOrCreate('admin', 'web');
        Role::findOrCreate('seller', 'web');
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/sellers', [
            'name' => 'Fresh Seller',
            'email' => 'fresh-seller@example.com',
            'password' => 'ChangeMe123!Secure',
            'shop_name' => 'Fresh Seller Shop',
            'commission_rate' => 10,
        ]);

        $response->assertCreated();
        $seller = User::where('email', 'fresh-seller@example.com')->firstOrFail();

        $this->assertSame('seller', $seller->role);
        $this->assertTrue($seller->hasRole('seller'));
        $this->assertDatabaseHas('shops', ['user_id' => $seller->id, 'name' => 'Fresh Seller Shop']);
    }
}