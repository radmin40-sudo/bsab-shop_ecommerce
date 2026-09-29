<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\SiteSetting;
use App\Services\ImageOptimizationService;
use App\Support\ClientMetadata;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingsController extends Controller
{
    public function index(Request $request): Response
    {
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Viewed admin settings',
            'metadata' => [
                'event_type' => 'activity',
                'status' => 'success',
                'message' => 'Admin settings page viewed',
                'method' => $request->method(),
                'route' => $request->route()?->uri(),
                'request_source' => 'web',
                'ip_address' => $request->ip(),
                ...ClientMetadata::fromUserAgent($request->userAgent(), $request->header('Sec-CH-UA-Model')),
            ],
        ]);

        $logPath = storage_path('logs/laravel.log');
        $logLines = File::exists($logPath)
            ? array_slice(file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [], -80)
            : [];
        $activityLogs = ActivityLog::query()
            ->with('user:id,name,email,role,avatar')
            ->latest('created_at')
            ->limit(40)
            ->get()
            ->map(fn (ActivityLog $log) => $this->activityEntry($log))
            ->values();
        $systemLogs = collect($logLines)
            ->map(fn (string $line) => $this->systemLogEntry($line))
            ->filter()
            ->values();
        $entries = $activityLogs->concat($systemLogs)
            ->sortByDesc('timestamp')
            ->take(80)
            ->values();

        return Inertia::render('admin/settings', [
            'cache' => [
                'config' => config('app.env'),
                'lastModified' => File::exists($logPath) ? File::lastModified($logPath) : null,
            ],
            'logs' => [
                'size' => File::exists($logPath) ? File::size($logPath) : 0,
                'updatedAt' => File::exists($logPath) ? Carbon::createFromTimestamp(File::lastModified($logPath))->toISOString() : null,
                'entries' => $entries,
                'stats' => [
                    'activeSessions' => $activityLogs->where('eventType', 'login')->where('status', 'success')->count(),
                    'uniqueDevices' => $activityLogs->pluck('device')->filter()->unique()->count(),
                    'uniqueIps' => $entries->pluck('ip')->filter()->unique()->count(),
                    'failedLogins' => $entries->where('eventType', 'login')->where('status', 'failed')->count(),
                    'securityAlerts' => $entries->whereIn('severity', ['warning', 'critical'])->count(),
                    'systemErrors' => $entries->whereIn('severity', ['error', 'critical'])->count(),
                ],
            ],
            'siteSettings' => SiteSetting::homeSettings(),
            'storageStatus' => SiteSetting::mediaStorageStatus(),
        ]);
    }

    private function activityEntry(ActivityLog $log): array
    {
        $metadata = is_array($log->metadata) ? $log->metadata : [];
        $action = (string) $log->action;
        $isFailure = str_contains(strtolower($action), 'fail') || ($metadata['status'] ?? null) === 'failed';

        return [
            'id' => 'activity-'.$log->id,
            'timestamp' => $log->created_at?->toISOString(),
            'severity' => $isFailure ? 'warning' : 'info',
            'eventType' => $metadata['event_type'] ?? (str_contains(strtolower($action), 'login') ? 'login' : 'activity'),
            'action' => $action,
            'status' => $metadata['status'] ?? ($isFailure ? 'failed' : 'success'),
            'user' => $log->user?->name ?? 'System',
            'email' => $log->user?->email,
            'role' => $log->user?->role,
            'method' => $metadata['method'] ?? null,
            'route' => $metadata['route'] ?? null,
            'requestSource' => $metadata['request_source'] ?? null,
            'statusCode' => $metadata['status_code'] ?? null,
            'ip' => $metadata['ip_address'] ?? null,
            'device' => $metadata['device'] ?? null,
            'browser' => $metadata['browser'] ?? null,
            'operatingSystem' => $metadata['operating_system'] ?? null,
            'userAgent' => $metadata['user_agent'] ?? null,
            'message' => $metadata['message'] ?? $action,
            'trace' => $metadata['trace'] ?? null,
        ];
    }

    private function systemLogEntry(string $line): ?array
    {
        if (! preg_match('/^\[([^\]]+)\].*?\.([A-Z]+):\s?(.*)$/', $line, $matches)) {
            return null;
        }

        $message = $matches[3];
        $context = [];

        if (preg_match('/\s(\{.*\})$/', $message, $contextMatches)) {
            $decodedContext = json_decode($contextMatches[1], true);

            if (is_array($decodedContext) && (isset($decodedContext['ip_address']) || isset($decodedContext['user_agent']))) {
                $context = $decodedContext;
                $message = trim(substr($message, 0, -strlen($contextMatches[0])));
            }
        }

        if (! isset($context['ip_address']) && preg_match('/`ip_address`\s*=\s*([^,]+),\s*`user_agent`\s*=\s*(.*?)\s+where\s+`/i', $message, $requestMatches)) {
            $context['ip_address'] = trim($requestMatches[1]);
            $context = array_merge($context, ClientMetadata::fromUserAgent(trim($requestMatches[2])), ['request_source' => 'web']);
        }

        $level = strtolower($matches[2]);
        $severity = match ($level) {
            'critical', 'emergency', 'alert' => 'critical',
            'error' => 'error',
            'warning' => 'warning',
            default => 'info',
        };

        return [
            'id' => 'system-'.md5($line),
            'timestamp' => rescue(fn () => Carbon::parse($matches[1])->toISOString()),
            'severity' => $severity,
            'eventType' => 'system',
            'action' => strtoupper($matches[2]).' system event',
            'status' => $severity === 'info' ? 'success' : 'attention',
            'user' => 'System',
            'email' => null,
            'role' => null,
            'method' => $context['method'] ?? null,
            'route' => $context['route'] ?? null,
            'requestSource' => $context['request_source'] ?? null,
            'statusCode' => null,
            'ip' => $context['ip_address'] ?? null,
            'device' => $context['device'] ?? null,
            'browser' => $context['browser'] ?? null,
            'operatingSystem' => $context['operating_system'] ?? null,
            'userAgent' => $context['user_agent'] ?? null,
            'message' => $message,
            'trace' => null,
        ];
    }

    public function clearCache(): RedirectResponse
    {
        Artisan::call('optimize:clear');

        return back()->with('success', 'Application cache cleared successfully.');
    }

    public function clearLogs(): RedirectResponse
    {
        $logPath = storage_path('logs/laravel.log');

        if (File::exists($logPath)) {
            File::put($logPath, '');
        }

        return back()->with('success', 'Application logs cleared successfully.');
    }

    public function clearCategories(): RedirectResponse
    {
        Category::query()->delete();

        return back()->with('success', 'All categories were deleted successfully.');
    }

    public function clearProducts(): RedirectResponse
    {
        Product::query()->delete();

        return back()->with('success', 'All products were deleted successfully.');
    }

    public function clearOrders(): RedirectResponse
    {
        Order::withTrashed()->forceDelete();

        return back()->with('success', 'All orders were permanently deleted successfully.');
    }

    public function saveHomeContent(Request $request, ImageOptimizationService $images): RedirectResponse
    {
        $data = $request->validate([
            'brand_name' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:'.config('images.max_upload_kb')],
            'login_background' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('images.max_upload_kb')],
            'hero_media' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,svg,mp4,webm,mov', 'max:20480'],
            'hero_title' => ['nullable', 'string', 'max:255'],
            'hero_highlight' => ['nullable', 'string', 'max:255'],
            'hero_description' => ['nullable', 'string', 'max:500'],
            'cta_label' => ['nullable', 'string', 'max:255'],
            'feature_one' => ['nullable', 'string', 'max:255'],
            'feature_two' => ['nullable', 'string', 'max:255'],
            'feature_three' => ['nullable', 'string', 'max:255'],
            'products_title' => ['nullable', 'string', 'max:255'],
            'products_subtitle' => ['nullable', 'string', 'max:500'],
            'footer_text' => ['nullable', 'string', 'max:500'],
            'footer_tagline' => ['nullable', 'string', 'max:500'],
            'footer_quick_links_title' => ['nullable', 'string', 'max:255'],
            'footer_care_title' => ['nullable', 'string', 'max:255'],
            'footer_about_title' => ['nullable', 'string', 'max:255'],
            'footer_newsletter_title' => ['nullable', 'string', 'max:255'],
            'footer_newsletter_text' => ['nullable', 'string', 'max:500'],
            'newsletter_placeholder' => ['nullable', 'string', 'max:255'],
        ]);

        if ($request->boolean('remove_logo')) {
            $existingPath = SiteSetting::where('key', 'logo_path')->value('value');
            if ($existingPath && ! SiteSetting::isExternalPath($existingPath)) {
                Storage::disk('public')->delete($existingPath);
            }
            SiteSetting::updateOrCreate(['key' => 'logo_path'], ['value' => null]);
        }

        if ($request->boolean('remove_login_background')) {
            $existingPath = SiteSetting::where('key', 'login_background_path')->value('value');
            if ($existingPath && ! SiteSetting::isExternalPath($existingPath)) {
                Storage::disk('public')->delete($existingPath);
            }
            SiteSetting::updateOrCreate(['key' => 'login_background_path'], ['value' => null]);
        }

        if ($request->boolean('remove_hero_media')) {
            $existingPath = SiteSetting::where('key', 'hero_media_path')->value('value');
            if ($existingPath && ! SiteSetting::isExternalPath($existingPath)) {
                Storage::disk('public')->delete($existingPath);
            }
            SiteSetting::updateOrCreate(['key' => 'hero_media_path'], ['value' => null]);
            SiteSetting::updateOrCreate(['key' => 'hero_media_type'], ['value' => null]);
        }

        foreach ($data as $key => $value) {
            if ($key === 'logo') {
                if ($request->hasFile('logo')) {
                    $existingPath = SiteSetting::where('key', 'logo_path')->value('value');
                    if ($existingPath && ! SiteSetting::isExternalPath($existingPath)) {
                        Storage::disk('public')->delete($existingPath);
                    }
                    $path = $images->store($request->file('logo'), 'site', ['max_dimension' => config('images.logo_max_dimension')]);
                    SiteSetting::updateOrCreate(['key' => 'logo_path'], ['value' => $path]);
                }

                continue;
            }

            if ($key === 'hero_media') {
                if ($request->hasFile('hero_media')) {
                    $existingPath = SiteSetting::where('key', 'hero_media_path')->value('value');
                    if ($existingPath && ! SiteSetting::isExternalPath($existingPath)) {
                        Storage::disk('public')->delete($existingPath);
                    }
                    $file = $request->file('hero_media');
                    $path = str_starts_with((string) $file->getMimeType(), 'image/')
                        ? $images->store($file, 'site', [
                            'max_width' => config('images.banner_max_width'),
                            'max_height' => config('images.banner_max_height'),
                        ])
                        : $file->store('site', 'public');
                    $type = str_starts_with((string) $file->getMimeType(), 'video/') ? 'video' : 'image';
                    SiteSetting::updateOrCreate(['key' => 'hero_media_path'], ['value' => $path]);
                    SiteSetting::updateOrCreate(['key' => 'hero_media_type'], ['value' => $type]);
                }

                continue;
            }

            if ($key === 'login_background') {
                if ($request->hasFile('login_background')) {
                    $existingPath = SiteSetting::where('key', 'login_background_path')->value('value');
                    if ($existingPath && ! SiteSetting::isExternalPath($existingPath)) {
                        Storage::disk('public')->delete($existingPath);
                    }
                    $path = $images->store($request->file('login_background'), 'site', [
                        'max_width' => config('images.banner_max_width'),
                        'max_height' => config('images.banner_max_height'),
                    ]);
                    SiteSetting::updateOrCreate(['key' => 'login_background_path'], ['value' => $path]);
                }

                continue;
            }

            if (! $request->has($key)) {
                continue;
            }

            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value ?: null]);
        }

        return back()->with('success', 'Homepage content updated successfully.');
    }
}
