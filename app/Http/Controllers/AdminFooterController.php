<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminFooterController extends Controller
{
    public function index(): Response
    {
        $settings = SiteSetting::homeSettings();
        $managedSlugs = ['web-dev', 'return-policy', 'privacy-policy', 'terms-conditions', 'sustainability', 'our-story', 'contact-us', 'shipping-info'];
        $savedPages = collect($settings['footer_pages'])->keyBy('slug');
        $defaultPages = collect(SiteSetting::defaults()['footer_pages']);
        $settings['footer_pages'] = $defaultPages
            ->map(function (array $default) use ($savedPages, $managedSlugs): array {
                $saved = $savedPages->get($default['slug']);
                if (! $saved) {
                    return $default;
                }

                return in_array($default['slug'], $managedSlugs, true)
                    ? array_replace_recursive($default, $saved)
                    : $saved;
            })
            ->concat($savedPages->reject(fn (array $page): bool => $defaultPages->contains('slug', $page['slug'])))
            ->values()
            ->all();

        return Inertia::render('admin/footer', [
            'siteSettings' => $settings,
            'deliveryZones' => \App\Models\DeliveryZone::query()->orderBy('sort_order')->orderBy('name')->get(),
            'deliveryOptions' => $settings['shipping_options'],
            'deliverySteps' => $settings['shipping_steps'],
        ]);
    }

    public function updatePage(Request $request, string $slug): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'content' => ['required', 'string', 'max:50000'],
            'content_sections' => ['sometimes', 'array', 'max:40'],
            'content_sections.*.title' => ['required', 'string', 'max:200'],
            'content_sections.*.content' => ['required', 'string', 'max:10000'],
            'content_sections.*.items' => ['sometimes', 'array', 'max:50'],
            'content_sections.*.items.*' => ['required', 'string', 'max:1000'],
            'hero_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('images.max_upload_kb')],
            'remove_hero_image' => ['sometimes', 'boolean'],
            'footer_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('images.max_upload_kb')],
            'remove_footer_image' => ['sometimes', 'boolean'],
            'team_members' => ['sometimes', 'array', 'max:20'],
            'team_members.*.name' => ['required', 'string', 'max:150'],
            'team_members.*.role' => ['required', 'string', 'max:150'],
            'team_members.*.description' => ['required', 'string', 'max:1000'],
            'team_members.*.photo_upload' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('images.max_upload_kb')],
            'team_members.*.remove_photo' => ['sometimes', 'boolean'],
            'contact_details' => ['sometimes', 'array'],
            'contact_details.email' => ['sometimes', 'required', 'email', 'max:254'],
            'contact_details.phone' => ['sometimes', 'required', 'string', 'max:50'],
            'contact_details.address' => ['sometimes', 'required', 'string', 'max:500'],
            'contact_details.support_hours' => ['sometimes', 'required', 'string', 'max:255'],
            'contact_details.response_time' => ['sometimes', 'required', 'string', 'max:255'],
            'delivery_options' => ['sometimes', 'array:local_delivery,seller_delivery,pickup'],
            'delivery_options.local_delivery' => ['required_with:delivery_options', 'boolean'],
            'delivery_options.seller_delivery' => ['required_with:delivery_options', 'boolean'],
            'delivery_options.pickup' => ['required_with:delivery_options', 'boolean'],
            'delivery_steps' => ['sometimes', 'array', 'size:5'],
            'delivery_steps.*.title' => ['required', 'string', 'max:120'],
            'delivery_steps.*.description' => ['required', 'string', 'max:500'],
        ]);

        $oldImages = [];
        $uploadedImages = [];

        foreach (['hero_image', 'footer_image'] as $imageField) {
            $removeField = 'remove_'.$imageField;
            if ($request->hasFile($imageField)) {
                $data[$imageField.'_path'] = $request->file($imageField)->store('informational-pages/'.$slug, 'public');
                $uploadedImages[] = $data[$imageField.'_path'];
            } elseif ($request->boolean($removeField)) {
                $data[$imageField.'_path'] = null;
            } else {
                unset($data[$imageField.'_path']);
            }
            unset($data[$imageField], $data[$removeField]);
        }

        if (isset($data['team_members'])) {
            foreach ($data['team_members'] as $index => &$member) {
                $uploadKey = "team_members.{$index}.photo_upload";
                $removePhoto = (bool) ($member['remove_photo'] ?? false);
                unset($member['photo_upload'], $member['remove_photo']);

                if ($request->hasFile($uploadKey)) {
                    $member['photo'] = $request->file($uploadKey)->store('informational-pages/'.$slug.'/team', 'public');
                    $uploadedImages[] = $member['photo'];
                } elseif ($removePhoto) {
                    $member['photo'] = null;
                }
            }
            unset($member);
        }

        DB::transaction(function () use ($slug, $data, &$oldImages): void {
            $setting = SiteSetting::query()->where('key', 'footer_pages')->lockForUpdate()->first();
            $pages = $setting ? json_decode($setting->value, true, 512, JSON_THROW_ON_ERROR) : SiteSetting::defaults()['footer_pages'];
            $default = collect(SiteSetting::defaults()['footer_pages'])->firstWhere('slug', $slug);
            $index = collect($pages)->search(fn (array $page): bool => ($page['slug'] ?? null) === $slug);

            if ($index === false) {
                $pages[] = $default;
                $index = array_key_last($pages);
            }

            $page = array_replace($pages[$index], array_diff_key($data, array_flip(['delivery_options', 'delivery_steps'])));
            foreach (['hero_image_path', 'footer_image_path'] as $imageKey) {
                if (array_key_exists($imageKey, $data)) {
                    if (! empty($pages[$index][$imageKey])) {
                        $oldImages[] = $pages[$index][$imageKey];
                    }
                    $page[$imageKey] = $data[$imageKey];
                }
            }
            if (isset($data['team_members'])) {
                foreach ($data['team_members'] as $memberIndex => $member) {
                    $existingPhoto = $pages[$index]['team_members'][$memberIndex]['photo'] ?? null;
                    if (array_key_exists('photo', $member)) {
                        if ($existingPhoto) {
                            $oldImages[] = $existingPhoto;
                        }
                        $page['team_members'][$memberIndex]['photo'] = $member['photo'];
                    }
                }
            }
            $pages[$index] = $page;
            SiteSetting::updateOrCreate(
                ['key' => 'footer_pages'],
                ['value' => json_encode($pages, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)],
            );

            foreach (['delivery_options' => 'shipping_options', 'delivery_steps' => 'shipping_steps'] as $field => $key) {
                if (isset($data[$field])) {
                    SiteSetting::updateOrCreate(
                        ['key' => $key],
                        ['value' => json_encode($data[$field], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)],
                    );
                }
            }
        });

        foreach ($oldImages as $oldImage) {
            Storage::disk('public')->delete($oldImage);
        }

        return back()->with('pageSaved', $slug);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'footer_text' => ['required', 'string', 'max:500'],
            'footer_tagline' => ['required', 'string', 'max:500'],
            'footer_quick_links_title' => ['required', 'string', 'max:255'],
            'footer_care_title' => ['required', 'string', 'max:255'],
            'footer_about_title' => ['required', 'string', 'max:255'],
            'footer_install_title' => ['required', 'string', 'max:255'],
            'footer_install_text' => ['required', 'string', 'max:500'],
            'footer_install_button' => ['required', 'string', 'max:100'],
            'footer_links' => ['required', 'array:quick_links,customer_care,about'],
            'footer_links.quick_links' => ['present', 'array', 'max:20'],
            'footer_links.customer_care' => ['present', 'array', 'max:20'],
            'footer_links.about' => ['present', 'array', 'max:20'],
            'footer_links.*.*.label' => ['required', 'string', 'max:100'],
            'footer_links.*.*.href' => [
                'required',
                'string',
                'max:2048',
                function (string $attribute, mixed $value, Closure $fail): void {
                    $isRelativePath = is_string($value)
                        && str_starts_with($value, '/')
                        && ! str_starts_with($value, '//')
                        && ! str_starts_with($value, '/\\')
                        && ! preg_match('/[\x00-\x20\\\\]/', $value);
                    $url = is_string($value) ? parse_url($value) : false;
                    $isHttpUrl = is_array($url)
                        && in_array(strtolower($url['scheme'] ?? ''), ['http', 'https'], true)
                        && ! empty($url['host'])
                        && filter_var($value, FILTER_VALIDATE_URL) !== false;

                    if (! $isRelativePath && ! $isHttpUrl) {
                        $fail('The :attribute must be a relative path or an HTTP(S) URL.');
                    }
                },
            ],
            'footer_pages' => ['present', 'array', 'max:50'],
            'footer_pages.*.title' => ['required', 'string', 'max:150'],
            'footer_pages.*.slug' => ['required', 'alpha_dash', 'max:100', 'distinct'],
            'footer_pages.*.content' => ['required', 'string', 'max:50000'],
            'footer_pages.*.team_members' => ['sometimes', 'array', 'max:20'],
            'footer_pages.*.team_members.*.name' => ['required', 'string', 'max:150'],
            'footer_pages.*.team_members.*.role' => ['required', 'string', 'max:150'],
            'footer_pages.*.team_members.*.description' => ['required', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($data): void {
            foreach ([
                'footer_text',
                'footer_tagline',
                'footer_quick_links_title',
                'footer_care_title',
                'footer_about_title',
                'footer_install_title',
                'footer_install_text',
                'footer_install_button',
            ] as $key) {
                SiteSetting::updateOrCreate(['key' => $key], ['value' => $data[$key]]);
            }

            foreach (['footer_links', 'footer_pages'] as $key) {
                SiteSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => json_encode($data[$key], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)],
                );
            }
        });

        return back()->with('success', 'Footer content updated successfully.');
    }
}
