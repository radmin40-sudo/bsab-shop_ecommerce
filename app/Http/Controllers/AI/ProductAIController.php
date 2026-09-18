<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Services\AIProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProductAIController extends Controller
{
    public function __construct(
        protected AIProductService $aiProductService,
    ) {}

    public function analyze(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if (! $request->user()?->hasRole('seller')) {
            return response()->json([
                'message' => 'Only sellers can analyze products with AI.',
            ], 403);
        }

        try {
            $analysis = $this->aiProductService->analyze($request->file('image'));

            return response()->json([
                'success' => true,
                'data' => $analysis,
            ]);
        } catch (\Throwable $exception) {
            Log::error('AI product analysis failed', [
                'message' => $exception->getMessage(),
                'user_id' => $request->user()?->id,
                'trace' => $exception->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage() ?: 'Unable to analyze this image. Please try again or enter the product information manually.',
            ], 422);
        }
    }
}
