<?php

namespace Tests\Feature;

use App\Models\DeliveryZone;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminShippingManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_delivery_zones_options_and_steps(): void
    {
        DeliveryZone::query()->delete();

        Role::findOrCreate('admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->get(route('admin.shipping'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('admin/shipping')
                ->has('deliveryZones', 0)
                ->where('deliveryOptions.local_delivery', true)
                ->has('deliverySteps', 5));

        $payload = [
            'name' => 'Hinoba-an Poblacion',
            'barangay' => 'Poblacion',
            'description' => 'Town proper deliveries',
            'delivery_fee' => '42.75',
            'is_free_delivery' => true,
            'free_delivery_minimum' => '1000.00',
            'estimated_delivery_min' => 0,
            'estimated_delivery_max' => 2,
            'estimated_delivery_text' => 'Same day–2 days',
            'status' => 'active',
        ];

        $this->actingAs($admin)
            ->post(route('admin.shipping.zones.store'), $payload)
            ->assertRedirect();
        $zone = DeliveryZone::query()->firstOrFail();
        $this->assertSame('42.75', $zone->delivery_fee);
        $this->assertSame('1000.00', $zone->free_delivery_minimum);

        $this->actingAs($admin)
            ->put(route('admin.shipping.content'), [
                'delivery_options' => [
                    'local_delivery' => true,
                    'seller_delivery' => false,
                    'pickup' => true,
                ],
                'delivery_steps' => [
                    ['title' => 'Place order', 'description' => 'Submit the order.'],
                    ['title' => 'Confirm', 'description' => 'Seller confirms it.'],
                    ['title' => 'Prepare', 'description' => 'Seller prepares the items.'],
                    ['title' => 'Schedule', 'description' => 'Arrange local delivery.'],
                    ['title' => 'Receive', 'description' => 'Receive or pick up the items.'],
                ],
            ])
            ->assertRedirect();

        $settings = SiteSetting::homeSettings();
        $this->assertFalse($settings['shipping_options']['seller_delivery']);
        $this->assertSame('Place order', $settings['shipping_steps'][0]['title']);

        $this->get(route('footer-pages.show', ['slug' => 'shipping-info']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('shipping-info')
                ->has('deliveryZones', 1)
                ->where('deliveryZones.0.delivery_fee', '42.75')
                ->where('deliverySteps.0.title', 'Place order'));

        $secondZone = DeliveryZone::create([
            'name' => 'Barangay Zone 2',
            'barangay' => 'Barangay 2',
            'delivery_fee' => '25.00',
            'estimated_delivery_text' => '1–3 days',
            'status' => 'active',
            'sort_order' => 2,
        ]);

        $this->actingAs($admin)
            ->put(route('admin.shipping.zones.reorder'), ['delivery_zone_ids' => [$secondZone->id, $zone->id]])
            ->assertRedirect();
        $this->assertSame(
            [$secondZone->id, $zone->id],
            DeliveryZone::query()->orderBy('sort_order')->pluck('id')->all(),
        );

        $this->actingAs($admin)
            ->put(route('admin.shipping.zones.update', $zone), [...$payload, 'delivery_fee' => '45.10', 'status' => 'inactive'])
            ->assertRedirect();
        $this->assertSame('45.10', $zone->fresh()->delivery_fee);
        $this->assertSame('inactive', $zone->fresh()->status);

        $this->actingAs($admin)
            ->delete(route('admin.shipping.zones.destroy', $secondZone))
            ->assertRedirect();
        $this->assertDatabaseMissing('delivery_zones', ['id' => $secondZone->id]);
    }

    public function test_only_admins_can_manage_delivery_zones(): void
    {
        $this->get(route('admin.shipping'))->assertRedirect(route('login'));

        Role::findOrCreate('customer', 'web');
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        $this->actingAs($customer)->get(route('admin.shipping'))->assertForbidden();
    }

    public function test_public_shipping_page_hides_inactive_delivery_zones(): void
    {
        DeliveryZone::query()->delete();

        DeliveryZone::create([
            'name' => 'Disabled area',
            'barangay' => 'Disabled',
            'delivery_fee' => 10,
            'estimated_delivery_text' => '1–2 days',
            'status' => 'inactive',
        ]);

        $this->get(route('footer-pages.show', ['slug' => 'shipping-info']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('shipping-info')
                ->has('deliveryZones', 0));
    }
}
