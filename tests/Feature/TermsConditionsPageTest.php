<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class TermsConditionsPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_terms_and_conditions_page_uses_the_dedicated_layout(): void
    {
        $this->get(route('footer-pages.show', ['slug' => 'terms-conditions']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('terms-conditions')
                ->where('footerPage.slug', 'terms-conditions'));
    }
}
