<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PrivacyPolicyPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_privacy_policy_page_uses_the_dedicated_layout(): void
    {
        $this->get(route('footer-pages.show', ['slug' => 'privacy-policy']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('privacy-policy')
                ->where('footerPage.slug', 'privacy-policy'));
    }
}
