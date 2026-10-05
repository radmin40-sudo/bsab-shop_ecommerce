<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class OurStoryPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_our_story_page_uses_the_dedicated_layout(): void
    {
        $this->get(route('footer-pages.show', ['slug' => 'our-story']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('our-story')
                ->where('footerPage.slug', 'our-story'));
    }
}
