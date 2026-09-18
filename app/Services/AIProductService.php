<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AIProductService
{
    public function analyze(UploadedFile $image): array
    {
        $apiKey = config('services.gemini.api_key');

        if (blank($apiKey)) {
            throw new \RuntimeException('AI analysis is unavailable because the Gemini API key is not configured.');
        }

        $mimeType = $image->getMimeType();
        $supportedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (! $image->isValid() || ! in_array($mimeType, $supportedMimeTypes, true)) {
            throw new \RuntimeException('Invalid image file. Please upload a JPG, JPEG, PNG, or WebP image.');
        }

        $lastError = null;

        foreach (['gemini-3.6-flash'] as $model) {
            try {
                return $this->requestGeminiAnalysis($image, $model, $apiKey);
            } catch (\Throwable $exception) {
                $lastError = $exception;

                if ($this->shouldRetryModel($exception, $model)) {
                    continue;
                }

                throw $exception;
            }
        }

        throw $lastError ?? new \RuntimeException('Unable to analyze this image right now. Please try again.');
    }

    private function requestGeminiAnalysis(UploadedFile $image, string $model, string $apiKey): array
    {
        $response = Http::acceptJson()
            ->timeout(60)
            ->connectTimeout(10)
            ->withHeaders([
                'x-goog-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $this->buildPrompt(),
                            ],
                            [
                                'inline_data' => [
                                    'mime_type' => $image->getMimeType(),
                                    'data' => base64_encode($image->getContent()),
                                ],
                            ],
                        ],
                    ],
                ],
            ]);

        if (! $response->successful()) {
            $status = $response->status();
            $responseBody = $this->safeErrorBody($response->body());
            $message = $this->mapHttpError($status, $responseBody);

            Log::error('Gemini AI Error', [
                'model' => $model,
                'status' => $status,
                'message' => $message,
                'response_body' => $responseBody,
            ]);

            throw new \RuntimeException($message);
        }

        $payload = $response->json();
        $text = $this->extractResponseText($payload);

        return $this->normalizeAnalysis($this->parseJson($text));
    }

    private function shouldRetryModel(\Throwable $exception, string $model): bool
    {
        if ($model !== 'gemini-3.6-flash') {
            return false;
        }

        $message = strtolower($exception->getMessage());

        return str_contains($message, 'model')
            || str_contains($message, 'not available')
            || str_contains($message, 'unsupported');
    }

    private function safeErrorBody(string $body): string
    {
        $trimmed = trim($body);

        return mb_substr($trimmed, 0, 500);
    }

    private function mapHttpError(int $status, string $responseBody): string
    {
        $normalizedBody = strtolower($responseBody);

        if (str_contains($normalizedBody, 'api key not valid') || str_contains($normalizedBody, 'api_key_invalid')) {
            return 'Gemini API key is invalid or unavailable. Please check the configured API key.';
        }

        if ($status === 401) {
            return 'Gemini API access is not authorized. Please check the API key and project permissions.';
        }

        if ($status === 403) {
            return 'Gemini API access is forbidden for this request.';
        }

        if ($status === 400) {
            return 'The Gemini request was invalid. Please try again with a valid product image.';
        }

        if ($status === 404) {
            return 'Gemini model is unavailable for this project. Please use a supported free-tier multimodal model.';
        }

        if ($status === 429) {
            return 'Gemini API rate limit reached. Please try again in a moment.';
        }

        if ($status >= 500) {
            return 'Gemini API is temporarily unavailable. Please try again in a moment.';
        }

        return 'Unable to analyze this image right now. Please try again.';
    }

    private function buildPrompt(): string
    {
        return <<<'PROMPT'
You are an e-commerce catalog assistant helping a seller prepare product listings from an uploaded product image.

Return only valid JSON that matches this structure:
{
    "name": "string or null",
    "category": "string or null",
    "product_type": "string or null",
    "description": "string or null",
    "colors": ["string"],
    "sizes": ["string"],
    "material": "string or null",
    "brand": "string or null",
    "attributes": {
        "style": "string or null"
    },
    "options": [
        {
            "name": "string",
            "values": ["string"]
        }
    ],
    "tags": ["string"]
}

Rules:
- Only include values that are clearly visible or strongly implied by the image.
- Do not guess business-critical values such as price, stock, shipping fee, or availability.
- Do not hallucinate. If uncertain, use null or an empty array.
- For sizes, only include sizes that are visually identifiable. If the size cannot be determined from the image, leave it empty.
- Keep category broad and realistic (for example: Shoes, Vegetables, Dresses, Electronics, Food, Clothing, Beauty, Home Decor).
- Return only JSON, with no markdown fences or extra explanation.
PROMPT;
    }

    private function extractResponseText(array $payload): string
    {
        $parts = data_get($payload, 'candidates.0.content.parts', []);

        foreach ($parts as $part) {
            if (isset($part['text']) && is_string($part['text']) && trim($part['text']) !== '') {
                return $part['text'];
            }
        }

        throw new \RuntimeException('Gemini returned an invalid response.');
    }

    private function parseJson(string $text): array
    {
        $json = trim($text);

        if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $json, $matches)) {
            $json = trim($matches[1]);
        }

        $decoded = json_decode($json, true);

        if (! is_array($decoded)) {
            throw new \RuntimeException('Gemini returned a malformed JSON response.');
        }

        return $decoded;
    }

    private function normalizeAnalysis(array $data): array
    {
        $analysis = [
            'name' => $this->normalizeString(data_get($data, 'name')),
            'category' => $this->normalizeString(data_get($data, 'category')),
            'product_type' => $this->normalizeString(data_get($data, 'product_type')) ? Str::slug(data_get($data, 'product_type')) : null,
            'description' => $this->normalizeString(data_get($data, 'description')),
            'colors' => $this->normalizeStringList(data_get($data, 'colors', [])),
            'sizes' => $this->normalizeStringList(data_get($data, 'sizes', [])),
            'material' => $this->normalizeString(data_get($data, 'material')),
            'brand' => $this->normalizeString(data_get($data, 'brand')),
            'attributes' => $this->normalizeAttributes(data_get($data, 'attributes', [])),
            'options' => $this->normalizeOptions(data_get($data, 'options', [])),
            'tags' => $this->normalizeStringList(data_get($data, 'tags', []), true),
        ];

        $matchedCategory = $analysis['category'] ? $this->matchCategory($analysis['category']) : null;

        if ($matchedCategory) {
            $analysis['category_id'] = $matchedCategory->id;
            $analysis['category_name'] = $matchedCategory->name;
            $analysis['category_match_warning'] = null;
        } else {
            $analysis['category_id'] = null;
            $analysis['category_name'] = null;
            $analysis['category_match_warning'] = $analysis['category']
                ? 'No matching category was found in your catalog. Please choose a category manually.'
                : null;
        }

        return $analysis;
    }

    private function normalizeAttributes(mixed $attributes): array
    {
        if (! is_array($attributes)) {
            return [];
        }

        $normalized = [];

        foreach ($attributes as $key => $value) {
            $key = $this->normalizeString((string) $key);

            if ($key === null || $key === '') {
                continue;
            }

            $normalizedValue = $this->normalizeScalarValue($value);

            if ($normalizedValue !== null) {
                $normalized[$key] = $normalizedValue;
            }
        }

        return $normalized;
    }

    private function normalizeOptions(mixed $options): array
    {
        if (! is_array($options)) {
            return [];
        }

        $normalized = [];

        foreach ($options as $option) {
            if (! is_array($option)) {
                continue;
            }

            $name = $this->normalizeString(data_get($option, 'name'));
            $values = $this->normalizeStringList(data_get($option, 'values', []));

            if (! $name || empty($values)) {
                continue;
            }

            $normalized[] = [
                'name' => $name,
                'values' => $values,
            ];
        }

        return $normalized;
    }

    private function normalizeScalarValue(mixed $value): string|null
    {
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_scalar($value)) {
            return $this->normalizeString((string) $value);
        }

        if (is_array($value) && count($value) > 0) {
            $flattened = [];

            foreach ($value as $item) {
                $normalized = $this->normalizeString((string) $item);

                if ($normalized) {
                    $flattened[] = $normalized;
                }
            }

            return $flattened ? implode(', ', $flattened) : null;
        }

        return null;
    }

    private function matchCategory(string $category): ?Category
    {
        $normalized = $this->normalizeCategoryToken($category);

        if ($normalized === '') {
            return null;
        }

        $categories = Category::query()->get(['id', 'name']);

        foreach ($categories as $item) {
            if ($this->normalizeCategoryToken($item->name) === $normalized) {
                return $item;
            }
        }

        return null;
    }

    private function normalizeCategoryToken(string $value): string
    {
        return strtolower(preg_replace('/[^a-z0-9]+/i', ' ', trim($value)) ?? '');
    }

    private function normalizeStringList(mixed $items, bool $normalizeTags = false): array
    {
        if (! is_array($items)) {
            return [];
        }

        $normalized = [];

        foreach ($items as $item) {
            $value = $this->normalizeString((string) $item);

            if ($value === null || $value === '') {
                continue;
            }

            if ($normalizeTags) {
                $value = strtolower($value);
            }

            $normalized[] = $value;
        }

        return array_values(array_unique($normalized));
    }

    private function normalizeString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim((string) $value);

        return $normalized === '' ? null : $normalized;
    }
}
