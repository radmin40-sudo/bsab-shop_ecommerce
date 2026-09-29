<?php

namespace App\Logging;

use App\Support\ClientMetadata;
use Illuminate\Http\Request;
use Monolog\Logger;
use Monolog\LogRecord;

class AddRequestContextToLog
{
    public function __invoke(Logger $logger): void
    {
        $logger->pushProcessor(function (LogRecord $record): LogRecord {
            if (! app()->bound('request')) {
                return $record;
            }

            $request = app('request');

            if (! $request instanceof Request || ! $request->server->has('REMOTE_ADDR')) {
                return app()->runningInConsole()
                    ? $record->with(context: array_merge(['request_source' => 'console'], $record->context))
                    : $record;
            }

            $requestContext = [
                'request_source' => 'web',
                'ip_address' => $request->ip(),
                ...ClientMetadata::fromUserAgent($request->userAgent(), $request->header('Sec-CH-UA-Model')),
                'method' => $request->method(),
                'route' => $request->route()?->uri(),
            ];

            return $record->with(context: array_merge($requestContext, $record->context));
        });
    }
}