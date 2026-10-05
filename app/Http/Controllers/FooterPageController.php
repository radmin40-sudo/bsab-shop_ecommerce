<?php

namespace App\Http\Controllers;

use App\Models\DeliveryZone;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class FooterPageController extends Controller
{
    public function show(string $slug): Response
    {
        $footerPages = SiteSetting::homeSettings()['footer_pages'];
        $page = collect($footerPages)
            ->firstWhere('slug', $slug);
        $defaultPage = collect(SiteSetting::defaults()['footer_pages'])->firstWhere('slug', $slug);
        if ($defaultPage) {
            $page = array_replace_recursive($defaultPage, $page ?? []);
        }

        if ($slug === 'contact-us') {
            $page ??= collect(SiteSetting::defaults()['footer_pages'])->firstWhere('slug', $slug);

            return Inertia::render('contact-us', [
                'footerPage' => $page,
                'success' => session('success'),
            ]);
        }

        if ($slug === 'sustainability') {
            $page ??= collect(SiteSetting::defaults()['footer_pages'])->firstWhere('slug', $slug);

            return Inertia::render('sustainability', [
                'footerPage' => $page,
            ]);
        }

        if ($slug === 'our-story') {
            $page ??= collect(SiteSetting::defaults()['footer_pages'])->firstWhere('slug', $slug);

            return Inertia::render('our-story', [
                'footerPage' => $page,
            ]);
        }

        if ($slug === 'terms-conditions') {
            $page ??= collect(SiteSetting::defaults()['footer_pages'])->firstWhere('slug', $slug);

            return Inertia::render('terms-conditions', [
                'footerPage' => $page,
            ]);
        }

        if ($slug === 'privacy-policy') {
            $page ??= collect(SiteSetting::defaults()['footer_pages'])->firstWhere('slug', $slug);

            return Inertia::render('privacy-policy', [
                'footerPage' => $page,
            ]);
        }

        if ($slug === 'web-dev') {
            $page ??= collect(SiteSetting::defaults()['footer_pages'])->firstWhere('slug', $slug);

            return Inertia::render('web-dev', [
                'footerPage' => $page,
            ]);
        }

        if ($slug === 'shipping-info') {
            $page ??= collect(SiteSetting::defaults()['footer_pages'])->firstWhere('slug', $slug);
            $settings = SiteSetting::homeSettings();

            return Inertia::render('shipping-info', [
                'footerPage' => $page,
                'deliveryZones' => DeliveryZone::active()->get(),
                'deliveryOptions' => $settings['shipping_options'],
                'deliverySteps' => $settings['shipping_steps'],
            ]);
        }

        if ($slug === 'return-policy') {
            $page ??= collect(SiteSetting::defaults()['footer_pages'])->firstWhere('slug', $slug);

            return Inertia::render('return-policy', [
                'footerPage' => $page,
            ]);
        }

        abort_unless($page, 404);

        return Inertia::render('footer-page', [
            'footerPage' => $page,
        ]);
    }

    public function submitContact(Request $request): RedirectResponse
    {
        $contact = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:254'],
            'phone' => ['required', 'string', 'max:30'],
            'subject' => ['required', 'string', 'in:Order inquiry,Returns & refunds,Account help,Product support,Other'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $contactPage = collect(SiteSetting::homeSettings()['footer_pages'])->firstWhere('slug', 'contact-us');
        $recipient = $contactPage['contact_details']['email'] ?? 'support@bsab-shop.com';

        Mail::raw(
            "Full Name: {$contact['name']}\nEmail Address: {$contact['email']}\nPhone Number: {$contact['phone']}\n\n{$contact['message']}",
            function (Message $message) use ($contact): void {
                $message
                    ->to($recipient)
                    ->replyTo($contact['email'], $contact['name'])
                    ->subject("BSAB-Shop contact: {$contact['subject']}");
            },
        );

        return to_route('footer-pages.show', ['slug' => 'contact-us'])
            ->with('success', 'Thanks for reaching out. Your message has been sent.');
    }
}
