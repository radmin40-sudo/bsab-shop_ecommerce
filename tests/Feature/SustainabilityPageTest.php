<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class SustainabilityPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_sustainability_page_uses_the_dedicated_layout(): void
    {
        $this->get(route('footer-pages.show', ['slug' => 'sustainability']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('sustainability')
                ->where('footerPage.slug', 'sustainability'));
    }
}
