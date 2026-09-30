<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProductAIAnalysisTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_can_analyze_a_product_image_and_receive_normalized_suggestions(): void
    {
        Role::findOrCreate('seller');
        $user = User::factory()->create();
        $user->assignRole('seller');
        $category = Category::create([
            'name' => 'Shoes',
            'slug' => 'shoes-'.uniqid(),
            'image' => null,
        ]);
        config(['services.gemini.api_key' => 'test-gemini-key']);

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => [
                        'parts' => [[
                            'text' => json_encode([
                                'name' => 'Trail Runner',
                                'category' => 'Shoes',
                                'brand' => 'Northline',
                                'colors' => ['Black'],
                                'options' => [['name' => 'Size', 'values' => ['8', '9']]],
                            ]),
                        ]],
                    ],
                ]],
            ]),
        ]);

        $response = $this->actingAs($user, 'web')->post('/seller/products/ai-analyze', [
            'image' => $this->productImage(),
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Trail Runner')
            ->assertJsonPath('data.brand', 'Northline')
            ->assertJsonPath('data.category_id', $category->id)
            ->assertJsonPath('data.options.0.name', 'Size')
            ->assertJsonPath('data.options.0.values.1', '9');

        Http::assertSent(fn ($request) => str_contains($request->url(), 'gemini-2.5-flash:generateContent')
            && $request->hasHeader('x-goog-api-key', 'test-gemini-key'));
    }

    public function test_gemini_permission_errors_return_actionable_guidance(): void
    {
        Role::findOrCreate('seller');
        $user = User::factory()->create();
        $user->assignRole('seller');
        config(['services.gemini.api_key' => 'test-gemini-key']);

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'error' => ['message' => 'This API key does not have permission to use this API.'],
            ], 403),
        ]);

        $response = $this->actingAs($user, 'web')->post('/seller/products/ai-analyze', [
            'image' => $this->productImage(),
        ]);

        $response->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Gemini access is forbidden. Check that the API key is valid, the Generative Language API is enabled for its Google project, and the key allows Gemini requests.');
    }

    private function productImage(): UploadedFile
    {
        return new UploadedFile(
            base_path('public/images/sneakers/sneaker-top.jpg'),
            'trail-runner.jpg',
            'image/jpeg',
            null,
            true,
        );
    }
}