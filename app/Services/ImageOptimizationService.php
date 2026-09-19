<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class ImageOptimizationService
{
    public function store(UploadedFile $file, string $directory, array $options = []): string
    {
        if (! $file->isValid()) {
            throw new RuntimeException('The uploaded image is invalid.');
        }

        $maxBytes = (int) config('images.max_upload_kb', 10240) * 1024;
        if (($file->getSize() ?: 0) > $maxBytes) {
            throw new RuntimeException('The uploaded image is too large.');
        }

        $mime = $this->actualMime($file);
        if (! $this->isSupportedImage($file, $mime)) {
            throw new RuntimeException('The uploaded file is not a supported image.');
        }

        try {
            if ($mime === 'image/svg+xml' || $mime === 'image/gif' || ! function_exists('imagewebp') || ! function_exists('imagecreatetruecolor')) {
                return $this->storeOriginal($file, $directory);
            }

            $info = @getimagesize($file->getRealPath());
            if (! is_array($info) || empty($info[0]) || empty($info[1])) {
                return $this->storeOriginal($file, $directory);
            }

            $source = $this->createSource($file, $mime);
            if (! $source) {
                return $this->storeOriginal($file, $directory);
            }

            $source = $this->orient($source, $file, $mime);
            $sourceWidth = imagesx($source);
            $sourceHeight = imagesy($source);

            $maxWidth = (int) ($options['max_width'] ?? $options['max_dimension'] ?? 2000);
            $maxHeight = (int) ($options['max_height'] ?? $options['max_dimension'] ?? 2000);
            $scale = min(1, $maxWidth / $sourceWidth, $maxHeight / $sourceHeight);
            $width = max(1, (int) round($sourceWidth * $scale));
            $height = max(1, (int) round($sourceHeight * $scale));

            $canvas = imagecreatetruecolor($width, $height);
            imagealphablending($canvas, false);
            imagesavealpha($canvas, true);
            imagefill($canvas, 0, 0, imagecolorallocatealpha($canvas, 255, 255, 255, 127));
            imagecopyresampled($canvas, $source, 0, 0, 0, 0, $width, $height, $sourceWidth, $sourceHeight);

            $temporaryPath = tempnam(sys_get_temp_dir(), 'bsab-image-');
            if ($temporaryPath === false || ! imagewebp($canvas, $temporaryPath, (int) ($options['quality'] ?? config('images.webp_quality', 82)))) {
                imagedestroy($source);
                imagedestroy($canvas);

                return $this->storeOriginal($file, $directory);
            }

            $path = trim($directory, '/').'/'.Str::lower(Str::random(40)).'.webp';
            $contents = file_get_contents($temporaryPath);
            if ($contents === false || $contents === '' || ! Storage::disk('public')->put($path, $contents) || ! Storage::disk('public')->exists($path)) {
                @unlink($temporaryPath);
                imagedestroy($source);
                imagedestroy($canvas);

                return $this->storeOriginal($file, $directory);
            }

            @unlink($temporaryPath);
            imagedestroy($source);
            imagedestroy($canvas);

            return $path;
        } catch (\Throwable $e) {
            report($e);

            return $this->storeOriginal($file, $directory);
        }
    }

    private function isSupportedImage(UploadedFile $file, string $mime): bool
    {
        $supportedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/x-png',
            'image/webp',
            'image/x-webp',
            'image/gif',
            'image/svg+xml',
            'image/bmp',
            'image/x-ms-bmp',
        ];

        if (in_array(strtolower($mime), $supportedMimes, true)) {
            return true;
        }

        $clientMime = strtolower((string) $file->getClientMimeType());
        if (in_array($clientMime, $supportedMimes, true) || str_starts_with($clientMime, 'image/')) {
            return true;
        }

        $extension = strtolower((string) $file->getClientOriginalExtension());

        return in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'], true);
    }

    private function actualMime(UploadedFile $file): string
    {
        $mime = false;
        if (function_exists('finfo_open')) {
            $handle = @finfo_open(FILEINFO_MIME_TYPE);
            if ($handle) {
                $mime = @finfo_file($handle, $file->getRealPath());
                finfo_close($handle);
            }
        }

        if (is_string($mime) && $mime !== 'application/octet-stream') {
            return strtolower($mime);
        }

        return strtolower((string) $file->getMimeType());
    }

    private function createSource(UploadedFile $file, string $mime): mixed
    {
        return match ($mime) {
            'image/jpeg', 'image/pjpeg' => function_exists('imagecreatefromjpeg') ? @imagecreatefromjpeg($file->getRealPath()) : null,
            'image/png', 'image/x-png' => function_exists('imagecreatefrompng') ? @imagecreatefrompng($file->getRealPath()) : null,
            'image/webp', 'image/x-webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($file->getRealPath()) : null,
            default => null,
        };
    }

    private function orient(mixed $image, UploadedFile $file, string $mime): mixed
    {
        if (! in_array($mime, ['image/jpeg', 'image/pjpeg'], true) || ! function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($file->getRealPath());
        $orientation = (int) ($exif['Orientation'] ?? 1);
        if ($orientation === 3) {
            imageflip($image, IMG_FLIP_BOTH);
        } elseif ($orientation === 6) {
            imageflip($image, IMG_FLIP_VERTICAL);
        } elseif ($orientation === 8) {
            imageflip($image, IMG_FLIP_HORIZONTAL);
        }

        return $image;
    }

    private function storeOriginal(UploadedFile $file, string $directory): string
    {
        $path = $file->store(trim($directory, '/'), 'public');
        if ($path === false || $path === '') {
            throw new RuntimeException('The uploaded image could not be saved.');
        }

        return $path;
    }
}
