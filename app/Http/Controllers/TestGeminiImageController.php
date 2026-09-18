<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TestGeminiImageController extends Controller
{
    public function page()
    {
        return view('test-gemini-image');
    }

    public function test(Request $request)
    {
        $selectedImageName = $request->file('image')?->getClientOriginalName();
        $stage = 'configuration';

        try {
            $apiKey = config('services.gemini.api_key');

            if (blank($apiKey)) {
                return $this->renderResult(
                    $request,
                    [
                        'success' => false,
                        'stage' => 'configuration',
                        'http_status' => 500,
                        'message' => 'Gemini API key is missing',
                        'error' => 'GEMINI_API_KEY is not configured for this environment.',
                    ],
                    $selectedImageName
                );
            }

            $stage = 'validation';
            $validated = $request->validate([
                'image' => ['required', 'file', 'image', 'mimes:jpeg,png,webp', 'max:4096'],
            ]);

            $image = $request->file('image');

            if (! $image instanceof \Illuminate\Http\UploadedFile) {
                return $this->renderResult(
                    $request,
                    [
                        'success' => false,
                        'stage' => 'validation',
                        'http_status' => 422,
                        'message' => 'Image validation failed',
                        'error' => 'No valid uploaded image was provided.',
                    ],
                    $selectedImageName
                );
            }

            $mimeType = $image->getMimeType();
            $supportedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

            if (! in_array($mimeType, $supportedMimeTypes, true)) {
                return $this->renderResult(
                    $request,
                    [
                        'success' => false,
                        'stage' => 'validation',
                        'http_status' => 415,
                        'message' => 'Unsupported image type',
                        'error' => 'Unsupported image MIME type: '.$mimeType.'. Only JPEG, PNG, and WebP are allowed.',
                    ],
                    $selectedImageName
                );
            }

            $stage = 'image_read';
            $imageContents = $image->getContent();

            if ($imageContents === false || $imageContents === null || trim($imageContents) === '') {
                return $this->renderResult(
                    $request,
                    [
                        'success' => false,
                        'stage' => 'image_read',
                        'http_status' => 500,
                        'message' => 'Image read failed',
                        'error' => 'The uploaded image could not be read from disk.',
                    ],
                    $selectedImageName
                );
            }

            $stage = 'image_encoding';
            $base64Data = base64_encode($imageContents);

            $stage = 'gemini_request';
            $prompt = <<<'PROMPT'
Analyze the uploaded product image for an e-commerce marketplace.

Identify only information that can reasonably be determined from the image.

Return ONLY valid JSON.

Do not use Markdown.
Do not wrap the JSON in ```json fences.

Use this exact structure:
{
    "name": null,
    "product_type": null,
    "category": null,
    "description": null,
    "colors": [],
    "sizes": [],
    "material": null,
    "brand": null,
    "attributes": {},
    "tags": []
}

Rules:
- Do not hallucinate.
- If something cannot be determined, use null.
- If a list cannot be determined, use [].
- Do not invent brand names.
- Do not invent prices.
- Do not invent stock quantities.
- Do not invent exact measurements.
- Only identify visible characteristics.
- The description should be based only on the image.
- Colors should describe visible colors.
- Product type should be the most reasonable type visible in the image.
- Category should be a reasonable e-commerce category.
- Sizes should only be returned if they are actually visible or clearly indicated in the image.
- Material should be null if it cannot reasonably be determined.
- Brand should be null if no brand is visible.
PROMPT;

            $response = Http::acceptJson()
                ->timeout(60)
                ->connectTimeout(10)
                ->withHeaders([
                    'x-goog-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent', [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => $prompt,
                                ],
                                [
                                    'inline_data' => [
                                        'mime_type' => $mimeType,
                                        'data' => $base64Data,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ]);

            $httpStatus = $response->status();
            $payload = $response->json();

            if (! $response->successful()) {
                $errorMessage = $this->extractGeminiErrorMessage($payload, $httpStatus);

                return $this->renderResult(
                    $request,
                    [
                        'success' => false,
                        'stage' => 'gemini_request',
                        'http_status' => $httpStatus,
                        'message' => 'Gemini request failed',
                        'error' => $errorMessage,
                        'response' => $payload,
                    ],
                    $selectedImageName
                );
            }

            $stage = 'gemini_response';
            $rawText = $this->extractGeminiResponseText($payload);

            $stage = 'json_parsing';
            $analysis = json_decode($rawText, true);

            if (! is_array($analysis)) {
                return $this->renderResult(
                    $request,
                    [
                        'success' => false,
                        'stage' => 'json_parsing',
                        'http_status' => $httpStatus,
                        'message' => 'Gemini returned malformed JSON',
                        'error' => 'Gemini returned a response that could not be parsed as JSON.',
                        'raw_text' => $rawText,
                        'response' => $payload,
                    ],
                    $selectedImageName
                );
            }

            $result = [
                'success' => true,
                'stage' => 'complete',
                'http_status' => $httpStatus,
                'message' => 'Gemini image analysis successful',
                'image' => [
                    'mime_type' => $mimeType,
                    'size' => $image->getSize(),
                ],
                'analysis' => $analysis,
                'raw_text' => $rawText,
                'model' => $payload['modelVersion'] ?? 'gemini-3.6-flash',
            ];

            return $this->renderResult($request, $result, $selectedImageName);
        } catch (ValidationException $exception) {
            $errorMessage = $exception->validator->errors()->first();

            return $this->renderResult(
                $request,
                [
                    'success' => false,
                    'stage' => 'validation',
                    'http_status' => 422,
                    'message' => 'Image validation failed',
                    'error' => $errorMessage,
                ],
                $selectedImageName
            );
        } catch (\Throwable $exception) {
            $message = $exception->getMessage();
            $status = 500;

            if (str_contains(strtolower($message), 'timeout')) {
                $status = 504;
            }

            if (str_contains(strtolower($message), 'connection')) {
                $status = 503;
            }

            return $this->renderResult(
                $request,
                [
                    'success' => false,
                    'stage' => $stage,
                    'http_status' => $status,
                    'message' => 'Gemini image test failed',
                    'error' => $message,
                ],
                $selectedImageName
            );
        }
    }

    private function renderResult(Request $request, array $result, ?string $selectedImageName = null)
    {
        if ($request->expectsJson()) {
            return response()->json($result, $result['http_status'] ?? 200);
        }

        return view('test-gemini-image', [
            'result' => $result,
            'selectedImageName' => $selectedImageName,
        ]);
    }

    private function extractGeminiErrorMessage(mixed $payload, int $status): string
    {
        if (is_array($payload)) {
            $message = data_get($payload, 'error.message');

            if (is_string($message) && trim($message) !== '') {
                return trim($message);
            }

            $errors = data_get($payload, 'error.errors');

            if (is_array($errors)) {
                foreach ($errors as $error) {
                    if (is_array($error) && isset($error['message']) && is_string($error['message']) && trim($error['message']) !== '') {
                        return trim($error['message']);
                    }
                }
            }

            $message = data_get($payload, 'message');

            if (is_string($message) && trim($message) !== '') {
                return trim($message);
            }
        }

        return match ($status) {
            400 => 'Gemini rejected the request. Check image format or request structure.',
            401 => 'Gemini API authentication failed.',
            403 => 'Gemini API access is forbidden for this request.',
            404 => 'Gemini model or endpoint was not found.',
            429 => 'Gemini rate limit reached.',
            500 => 'Gemini server error.',
            503 => 'Gemini is temporarily unavailable.',
            default => 'Gemini request failed.',
        };
    }

    private function extractGeminiResponseText(array $payload): string
    {
        $parts = data_get($payload, 'candidates.0.content.parts', []);

        foreach ($parts as $part) {
            if (isset($part['text']) && is_string($part['text']) && trim($part['text']) !== '') {
                return $part['text'];
            }
        }

        throw new \RuntimeException('Gemini returned an invalid response body.');
    }
}
