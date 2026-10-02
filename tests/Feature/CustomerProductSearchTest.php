<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CustomerProductSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_products_page_receives_the_search_query_from_the_url(): void
    {
        Role::findOrCreate('customer', 'web');
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        $response = $this->actingAs($customer)
            ->get(route('customer.products', ['q' => 'phone case']));

        $response->assertOk()->assertSee('phone case');
    }
}
