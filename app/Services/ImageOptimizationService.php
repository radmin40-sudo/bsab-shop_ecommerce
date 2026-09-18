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
        if (! in_array($mime, ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'], true)) {
            throw new RuntimeException('The uploaded file is not a supported image.');
        }

        if ($mime === 'image/svg+xml' || $mime === 'image/gif' || ! function_exists('imagewebp')) {
            return $this->storeOriginal($file, $directory, $mime);
        }

        $info = @getimagesize($file->getRealPath());
        if (! is_array($info) || empty($info[0]) || empty($info[1])) {
            throw new RuntimeException('The uploaded image could not be read.');
        }

        $source = $this->createSource($file, $mime);
        if (! $source) {
            throw new RuntimeException('The uploaded image could not be processed.');
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
            throw new RuntimeException('The uploaded image could not be optimized.');
        }

        $path = trim($directory, '/').'/'.Str::lower(Str::random(40)).'.webp';
        $contents = file_get_contents($temporaryPath);
        if ($contents === false || $contents === '' || ! Storage::disk('public')->put($path, $contents) || ! Storage::disk('public')->exists($path)) {
            @unlink($temporaryPath);
            imagedestroy($source);
            imagedestroy($canvas);

            return $this->storeOriginal($file, $directory, $mime);
        }
        @unlink($temporaryPath);
        imagedestroy($source);
        imagedestroy($canvas);

        return $path;
    }

    private function actualMime(UploadedFile $file): string
    {
        $handle = finfo_open(FILEINFO_MIME_TYPE);
        $mime = $handle ? @finfo_file($handle, $file->getRealPath()) : false;
        if ($handle) {
            finfo_close($handle);
        }

        return is_string($mime) ? $mime : (string) $file->getMimeType();
    }

    private function createSource(UploadedFile $file, string $mime): mixed
    {
        return match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($file->getRealPath()),
            'image/png' => @imagecreatefrompng($file->getRealPath()),
            'image/webp' => @imagecreatefromwebp($file->getRealPath()),
            default => null,
        };
    }

    private function orient(mixed $image, UploadedFile $file, string $mime): mixed
    {
        if ($mime !== 'image/jpeg' || ! function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($file->getRealPath());
        $orientation = (int) ($exif['Orientation'] ?? 1);
        if ($orientation === 3) {
            imageflip($image, IMG_FLIP_BOTH);
        } elseif ($orientation === 6) {
            $image = imagerotate($image, -90, 0);
        } elseif ($orientation === 8) {
            $image = imagerotate($image, 90, 0);
        }

        return $image;
    }

    private function storeOriginal(UploadedFile $file, string $directory, string $mime): string
    {
        $extension = match ($mime) {
            'image/svg+xml' => 'svg',
            'image/gif' => 'gif',
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => 'dat',
        };
        $path = trim($directory, '/').'/'.Str::lower(Str::random(40)).'.'.$extension;
        $contents = file_get_contents($file->getRealPath());
        if ($contents === false || $contents === '' || ! Storage::disk('public')->put($path, $contents)) {
            throw new RuntimeException('The uploaded image could not be saved.');
        }

        return $path;
    }
}
