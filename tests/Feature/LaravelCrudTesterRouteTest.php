<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LaravelCrudTesterRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_tester_page_can_be_rendered(): void
    {
        $response = $this->get('/test');

        $response->assertStatus(200);
        $response->assertSee('Tester - Laravel');
        $response->assertSee('Marketplace CRUD Diagnostic');
    }

    public function test_tester_json_format_can_be_retrieved(): void
    {
        $response = $this->get('/test?format=json');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'title',
            'system_info' => [
                'laravel_version',
                'php_version',
                'database',
            ],
            'summary' => [
                'total_entities',
                'total_operations',
                'pass_rate_percentage',
            ],
            'results',
        ]);
    }

    public function test_single_entity_crud_test_can_be_executed(): void
    {
        $response = $this->postJson('/test/run/user');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'key',
            'name',
            'status',
            'operations' => [
                'create',
                'read',
                'update',
                'delete',
            ],
        ]);
    }

    public function test_run_all_crud_tests_endpoint_executes_safely(): void
    {
        $response = $this->postJson('/test/run');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'summary' => [
                'total_entities',
                'entities_working',
                'entities_not_working',
                'total_operations',
                'operations_working',
                'operations_not_working',
                'pass_rate_percentage',
                'duration_ms',
            ],
            'results',
        ]);
    }
}
