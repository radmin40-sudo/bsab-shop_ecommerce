<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ContactUsTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_page_uses_the_dedicated_contact_layout(): void
    {
        $this->get(route('footer-pages.show', ['slug' => 'contact-us']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('contact-us')
                ->where('footerPage.slug', 'contact-us'));
    }

    public function test_contact_form_sends_a_message_and_redirects_with_confirmation(): void
    {
        Mail::shouldReceive('raw')->once();

        $this->from('/pages/contact-us')
            ->post(route('footer-pages.contact'), [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan@example.com',
                'phone' => '+63 912 345 6789',
                'subject' => 'Order inquiry',
                'message' => 'I need help with my order.',
            ])
            ->assertRedirect('/pages/contact-us')
            ->assertSessionHas('success');
    }

    public function test_contact_form_rejects_invalid_submission(): void
    {
        Mail::shouldReceive('raw')->never();

        $this->from('/pages/contact-us')
            ->post(route('footer-pages.contact'), [
                'name' => '',
                'email' => 'not-an-email',
                'phone' => '',
                'subject' => '',
                'message' => '',
            ])
            ->assertRedirect('/pages/contact-us')
            ->assertSessionHasErrors(['name', 'email', 'phone', 'subject', 'message']);
    }
}
