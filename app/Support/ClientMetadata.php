<?php

namespace App\Support;

class ClientMetadata
{
    public static function fromUserAgent(?string $userAgent, ?string $reportedModel = null): array
    {
        $userAgent ??= '';
        $deviceModel = self::cleanDeviceModel($reportedModel) ?? self::deviceModelFromUserAgent($userAgent);

        $device = match (true) {
            $deviceModel !== null => $deviceModel,
            $userAgent === '' => null,
            str_contains($userAgent, 'iPad') => 'iPad',
            str_contains($userAgent, 'iPhone') => 'iPhone',
            str_contains($userAgent, 'iPod') => 'iPod',
            str_contains($userAgent, 'Android') && ! str_contains($userAgent, 'Mobile') => 'Android tablet',
            str_contains($userAgent, 'Android') => 'Android mobile',
            preg_match('/Mobile/i', $userAgent) === 1 => 'Mobile device',
            default => 'Desktop',
        };

        $browser = match (true) {
            $userAgent === '' => null,
            str_contains($userAgent, 'Edg/') => 'Microsoft Edge',
            str_contains($userAgent, 'OPR/') => 'Opera',
            str_contains($userAgent, 'Firefox/') => 'Firefox',
            str_contains($userAgent, 'Chrome/') => 'Chrome',
            str_contains($userAgent, 'Safari/') => 'Safari',
            default => 'Unknown browser',
        };

        $operatingSystem = match (true) {
            $userAgent === '' => null,
            str_contains($userAgent, 'Windows') => 'Windows',
            str_contains($userAgent, 'Android') => 'Android',
            str_contains($userAgent, 'iPhone'), str_contains($userAgent, 'iPad'), str_contains($userAgent, 'iPod') => 'iOS',
            str_contains($userAgent, 'Mac OS') => 'macOS',
            str_contains($userAgent, 'Linux') => 'Linux',
            default => 'Unknown operating system',
        };

        return [
            'device' => $device,
            'browser' => $browser,
            'operating_system' => $operatingSystem,
            'user_agent' => $userAgent ?: null,
        ];
    }

    private static function deviceModelFromUserAgent(string $userAgent): ?string
    {
        if (! preg_match('/Android\s[\d.]+;([^)]*)/i', $userAgent, $matches)) {
            return null;
        }

        foreach (array_reverse(explode(';', $matches[1])) as $candidate) {
            $candidate = preg_replace('/\s*Build\/.*$/i', '', trim($candidate)) ?? '';
            $model = self::cleanDeviceModel($candidate);

            if ($model !== null) {
                return $model;
            }
        }

        return null;
    }

    private static function cleanDeviceModel(?string $model): ?string
    {
        $model = trim((string) $model, " \t\n\r\0\x0B\"'");
        $model = preg_replace('/[\x00-\x1F\x7F]/', '', $model) ?? '';

        if ($model === '' || in_array(strtolower($model), ['k', 'u', 'wv', 'mobile', 'tablet', 'linux'], true)) {
            return null;
        }

        return substr($model, 0, 80);
    }
}