<?php

namespace App\Http\Controllers;

use App\Services\CrudTesterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\View\View;
use Throwable;

class LaravelCrudTesterController extends Controller
{
    public function __construct(
        protected CrudTesterService $crudTester
    ) {}

    /**
     * Display the Tester - Laravel dashboard or return JSON diagnostics.
     */
    public function index(Request $request): View|JsonResponse
    {
        $systemInfo = $this->gatherSystemDiagnostics();
        $definitions = $this->crudTester->getEntityDefinitions();

        // If JSON requested (API mode or monitoring)
        if ($request->wantsJson() || $request->query('format') === 'json') {
            $results = $this->crudTester->runAll();

            return response()->json([
                'title' => 'Tester - Laravel',
                'system_info' => $systemInfo,
                'summary' => $results['summary'],
                'results' => $results['results'],
            ]);
        }

        return view('tester', [
            'systemInfo' => $systemInfo,
            'entities' => $definitions,
            'groups' => collect($definitions)->groupBy('group')->all(),
        ]);
    }

    /**
     * Run all CRUD tests via AJAX.
     */
    public function runAll(): JsonResponse
    {
        $results = $this->crudTester->runAll();

        return response()->json($results);
    }

    /**
     * Run CRUD test for a specific entity via AJAX.
     */
    public function runSingle(string $entity): JsonResponse
    {
        $result = $this->crudTester->testEntity($entity);

        return response()->json($result);
    }

    /**
     * Collect system environment & database health details.
     */
    protected function gatherSystemDiagnostics(): array
    {
        $dbConnected = false;
        $dbDriver = 'unknown';
        $dbDatabase = 'unknown';
        $tableCount = 0;
        $migrationsCount = 0;
        $dbError = null;

        try {
            $dbDriver = DB::connection()->getDriverName();
            $dbDatabase = DB::connection()->getDatabaseName();
            $dbConnected = true;

            if (Schema::hasTable('migrations')) {
                $migrationsCount = DB::table('migrations')->count();
            }

            if ($dbDriver === 'mysql') {
                $tables = DB::select('SHOW TABLES');
                $tableCount = count($tables);
            } elseif ($dbDriver === 'sqlite') {
                $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
                $tableCount = count($tables);
            }
        } catch (Throwable $e) {
            $dbConnected = false;
            $dbError = $e->getMessage();
        }

        $host = request()->getHost();
        $isRailway = ! empty(env('RAILWAY_ENVIRONMENT'))
            || ! empty(env('RAILWAY_STATIC_URL'))
            || str_contains($host, 'railway.app');

        return [
            'app_name' => config('app.name', 'Laravel'),
            'app_url' => config('app.url'),
            'current_host' => $host,
            'environment' => app()->environment(),
            'debug_mode' => config('app.debug', false),
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'is_railway' => $isRailway,
            'database' => [
                'connected' => $dbConnected,
                'default' => config('database.default'),
                'driver' => $dbDriver,
                'database' => $dbDatabase,
                'host' => config('database.connections.'.config('database.default').'.host', '127.0.0.1'),
                'port' => config('database.connections.'.config('database.default').'.port', '3306'),
                'table_count' => $tableCount,
                'migrations_count' => $migrationsCount,
                'error' => $dbError,
            ],
            'server_time' => now()->toIso8601String(),
        ];
    }
}
