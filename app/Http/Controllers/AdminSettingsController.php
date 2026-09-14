<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ActivityLog;
use App\Models\Order;
use App\Models\Product;
use App\Models\SiteSetting;
use App\Models\Voucher;
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
    public function index(): Response
    {
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
            'method' => null,
            'route' => null,
            'statusCode' => null,
            'ip' => null,
            'device' => null,
            'browser' => null,
            'operatingSystem' => null,
            'userAgent' => null,
            'message' => $matches[3],
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

    public function clearVouchers(): RedirectResponse
    {
        Voucher::query()->delete();

        return back()->with('success', 'All vouchers were deleted successfully.');
    }

    public function saveHomeContent(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'brand_name' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
            'login_background' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
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

        foreach ($data as $key => $value) {
            if ($key === 'logo') {
                $existingPath = SiteSetting::where('key', 'logo_path')->value('value');
                if ($request->hasFile('logo')) {
                    if ($existingPath) {
                        Storage::disk('public')->delete($existingPath);
                    }
                    $path = $request->file('logo')->store('site', 'public');
                    SiteSetting::updateOrCreate(['key' => 'logo_path'], ['value' => $path]);
                }
                continue;
            }

            if ($key === 'hero_media') {
                $existingPath = SiteSetting::where('key', 'hero_media_path')->value('value');
                if ($request->hasFile('hero_media')) {
                    if ($existingPath) {
                        Storage::disk('public')->delete($existingPath);
                    }
                    $file = $request->file('hero_media');
                    $path = $file->store('site', 'public');
                    $type = str_starts_with((string) $file->getMimeType(), 'video/') ? 'video' : 'image';
                    SiteSetting::updateOrCreate(['key' => 'hero_media_path'], ['value' => $path]);
                    SiteSetting::updateOrCreate(['key' => 'hero_media_type'], ['value' => $type]);
                }
                continue;
            }

            if ($key === 'login_background') {
                $existingPath = SiteSetting::where('key', 'login_background_path')->value('value');
                if ($request->hasFile('login_background')) {
                    if ($existingPath) {
                        Storage::disk('public')->delete($existingPath);
                    }
                    $path = $request->file('login_background')->store('site', 'public');
                    SiteSetting::updateOrCreate(['key' => 'login_background_path'], ['value' => $path]);
                }
                continue;
            }

            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value ?: null]);
        }

        return back()->with('success', 'Homepage content updated successfully.');
    }
}
