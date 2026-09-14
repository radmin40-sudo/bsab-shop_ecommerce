<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        @php
            $logoPath = data_get($page, 'props.siteSettings.logo_path');
            $faviconUrl = $logoPath
                ? (str_starts_with($logoPath, 'http') || str_starts_with($logoPath, '/') ? $logoPath : asset('storage/'.$logoPath))
                : asset('favicon.png');
            $faviconType = $logoPath && str_ends_with(strtolower($logoPath), '.svg') ? 'image/svg+xml' : 'image/png';
        @endphp
        <link rel="icon" type="{{ $faviconType }}" href="{{ $faviconUrl }}?v={{ rawurlencode((string) ($logoPath ?: 'default')) }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
