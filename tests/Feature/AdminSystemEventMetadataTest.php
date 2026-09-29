<?php

namespace Tests\Feature;

use App\Http\Controllers\AdminSettingsController;
use App\Logging\AddRequestContextToLog;
use Illuminate\Http\Request;
use Monolog\Handler\TestHandler;
use Monolog\Logger;
use ReflectionMethod;
use Tests\TestCase;

class AdminSystemEventMetadataTest extends TestCase
{
    public function test_log_records_include_request_device_and_ip_context(): void
    {
        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0';
        $request = Request::create('/admin/settings', 'GET', server: [
            'REMOTE_ADDR' => '127.0.0.1',
            'HTTP_USER_AGENT' => $userAgent,
        ]);
        app()->instance('request', $request);

        $handler = new TestHandler;
        $logger = new Logger('request-context-test', [$handler]);
        (new AddRequestContextToLog)($logger);
        $logger->error('Test system error');

        $context = $handler->getRecords()[0]->context;

        $this->assertSame('127.0.0.1', $context['ip_address']);
        $this->assertSame('web', $context['request_source']);
        $this->assertSame('Desktop', $context['device']);
        $this->assertSame('Microsoft Edge', $context['browser']);
        $this->assertSame('Windows', $context['operating_system']);
        $this->assertSame($userAgent, $context['user_agent']);
    }

    public function test_system_event_parser_recovers_ip_and_device_from_session_sql_error(): void
    {
        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0';
        $line = '[2026-09-28 10:00:16] local.ERROR: Database connection failed (SQL: update `sessions` set `ip_address` = 127.0.0.1, `user_agent` = '.$userAgent.' where `id` = session-token)';
        $parser = new ReflectionMethod(AdminSettingsController::class, 'systemLogEntry');
        $entry = $parser->invoke(app(AdminSettingsController::class), $line);

        $this->assertSame('127.0.0.1', $entry['ip']);
        $this->assertSame('Desktop', $entry['device']);
        $this->assertSame('Microsoft Edge', $entry['browser']);
        $this->assertSame('Windows', $entry['operatingSystem']);
        $this->assertSame($userAgent, $entry['userAgent']);
    }

    public function test_android_model_is_extracted_from_user_agent_when_client_hint_is_unavailable(): void
    {
        $metadata = \App\Support\ClientMetadata::fromUserAgent(
            'Mozilla/5.0 (Linux; Android 11; RMX2185 Build/RP1A.200720.011) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
        );

        $this->assertSame('RMX2185', $metadata['device']);
    }
}