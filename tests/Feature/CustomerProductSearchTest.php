<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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

        $this->actingAs($customer)
            ->get(route('customer.products', ['q' => 'phone case']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('customer/products')
                ->where('query', 'phone case'));
    }
}
