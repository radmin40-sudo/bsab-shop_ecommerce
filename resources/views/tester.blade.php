<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Tester - Laravel | BSAB Marketplace</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&family=fira-code:400,500&display=swap" rel="stylesheet" />
    <style>
        :root {
            --bg-base: #090d16;
            --bg-surface: #0f172a;
            --bg-card: #131d33;
            --bg-card-hover: #192542;
            --border-subtle: #1e293b;
            --border-bright: #334155;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --text-faint: #64748b;
            --brand-primary: #3b82f6;
            --brand-gradient: linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #6366f1 100%);
            --color-success: #10b981;
            --color-success-bg: rgba(16, 185, 129, 0.12);
            --color-success-border: rgba(16, 185, 129, 0.3);
            --color-danger: #f43f5e;
            --color-danger-bg: rgba(244, 63, 94, 0.12);
            --color-danger-border: rgba(244, 63, 94, 0.35);
            --color-warning: #f59e0b;
            --color-warning-bg: rgba(245, 158, 11, 0.12);
            --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
            --font-mono: 'Fira Code', monospace;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-sans);
            background: var(--bg-base);
            color: var(--text-main);
            min-height: 100vh;
            line-height: 1.5;
            overflow-x: hidden;
        }

        /* Top Banner & Header */
        .top-nav {
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border-subtle);
            position: sticky;
            top: 0;
            z-index: 50;
            padding: 16px 24px;
        }

        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
        }

        .brand-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .brand-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            border-radius: 999px;
            background: rgba(56, 189, 248, 0.12);
            border: 1px solid rgba(56, 189, 248, 0.3);
            font-size: 0.85rem;
            font-weight: 700;
            color: #38bdf8;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        .pulse-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 10px #10b981;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 14px #10b981; }
            100% { transform: scale(0.95); opacity: 0.8; }
        }

        .brand-title {
            font-size: 1.45rem;
            font-weight: 800;
            background: var(--brand-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.02em;
        }

        .env-pill {
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(99, 102, 241, 0.15);
            border: 1px solid rgba(99, 102, 241, 0.3);
            color: #a5b4fc;
            font-family: var(--font-mono);
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            border: none;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
        }

        .btn-primary {
            background: var(--brand-gradient);
            color: #ffffff;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }

        .btn-primary:active {
            transform: translateY(0);
        }

        .btn-secondary {
            background: var(--bg-surface);
            color: var(--text-muted);
            border: 1px solid var(--border-bright);
        }

        .btn-secondary:hover {
            background: var(--bg-card);
            color: var(--text-main);
            border-color: #475569;
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
        }

        /* Main Container */
        .main-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px;
        }

        /* System Info Strip */
        .system-strip {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-bottom: 24px;
        }

        .sys-card {
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .sys-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-faint);
            font-weight: 700;
        }

        .sys-value {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-main);
            font-family: var(--font-mono);
            display: flex;
            align-items: center;
            gap: 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Metrics Scorecard */
        .scorecard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .stat-card {
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: 14px;
            padding: 18px 20px;
            position: relative;
            overflow: hidden;
            transition: border-color 0.2s ease;
        }

        .stat-card.success-card {
            border-left: 4px solid var(--color-success);
        }

        .stat-card.danger-card {
            border-left: 4px solid var(--color-danger);
        }

        .stat-card.info-card {
            border-left: 4px solid var(--brand-primary);
        }

        .stat-card.time-card {
            border-left: 4px solid var(--color-warning);
        }

        .stat-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            font-weight: 600;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            display: flex;
            align-items: baseline;
            gap: 6px;
        }

        .stat-sub {
            font-size: 0.85rem;
            color: var(--text-faint);
            font-weight: 500;
        }

        /* Progress Bar */
        .progress-wrapper {
            margin-bottom: 24px;
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 16px 20px;
            display: none;
        }

        .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .progress-track {
            height: 10px;
            background: var(--bg-card);
            border-radius: 999px;
            overflow: hidden;
            position: relative;
        }

        .progress-bar {
            height: 100%;
            background: var(--brand-gradient);
            border-radius: 999px;
            width: 0%;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Filters & Search Toolbar */
        .toolbar {
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: 14px;
            padding: 14px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
            margin-bottom: 24px;
        }

        .filter-tabs {
            display: flex;
            gap: 6px;
            background: var(--bg-base);
            padding: 4px;
            border-radius: 10px;
            border: 1px solid var(--border-subtle);
        }

        .tab-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 0.825rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .tab-btn.active {
            background: var(--bg-card);
            color: var(--text-main);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }

        .tab-btn.active.tab-working {
            color: #34d399;
        }

        .tab-btn.active.tab-broken {
            color: #fb7185;
        }

        .search-box {
            position: relative;
            flex: 1;
            max-width: 320px;
        }

        .search-box input {
            width: 100%;
            background: var(--bg-base);
            border: 1px solid var(--border-bright);
            padding: 8px 14px 8px 36px;
            border-radius: 8px;
            color: var(--text-main);
            font-size: 0.875rem;
            outline: none;
            transition: border-color 0.2s;
        }

        .search-box input:focus {
            border-color: var(--brand-primary);
        }

        .search-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-faint);
            pointer-events: none;
        }

        /* Entity Cards Grid */
        .entities-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
        }

        .entity-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 14px;
            overflow: hidden;
            transition: all 0.2s ease;
        }

        .entity-card:hover {
            border-color: var(--border-bright);
            background: var(--bg-card-hover);
        }

        .entity-card.state-working {
            border-left: 4px solid var(--color-success);
        }

        .entity-card.state-broken {
            border-left: 4px solid var(--color-danger);
        }

        .entity-card.state-idle {
            border-left: 4px solid #475569;
        }

        .card-header {
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .card-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .entity-name {
            font-size: 1.15rem;
            font-weight: 700;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .group-tag {
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 0.725rem;
            font-weight: 600;
            background: rgba(148, 163, 184, 0.1);
            color: #94a3b8;
            border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .table-tag {
            font-family: var(--font-mono);
            font-size: 0.75rem;
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.08);
            padding: 3px 8px;
            border-radius: 6px;
        }

        .card-controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        .badge-working {
            background: var(--color-success-bg);
            color: #34d399;
            border: 1px solid var(--color-success-border);
        }

        .badge-broken {
            background: var(--color-danger-bg);
            color: #fb7185;
            border: 1px solid var(--color-danger-border);
        }

        .badge-idle {
            background: rgba(100, 116, 139, 0.15);
            color: #94a3b8;
            border: 1px solid rgba(100, 116, 139, 0.3);
        }

        .btn-sm {
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-bright);
            color: var(--text-main);
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-sm:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: #64748b;
        }

        /* CRUD Badges Bar */
        .crud-bar {
            padding: 14px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(0, 0, 0, 0.15);
            flex-wrap: wrap;
        }

        .op-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 12px;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 700;
            font-family: var(--font-mono);
            letter-spacing: 0.02em;
        }

        .op-working {
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .op-broken {
            background: rgba(244, 63, 94, 0.18);
            color: #fb7185;
            border: 1px solid rgba(244, 63, 94, 0.4);
        }

        .op-idle {
            background: rgba(51, 65, 85, 0.4);
            color: #64748b;
            border: 1px solid rgba(51, 65, 85, 0.6);
        }

        .op-duration {
            font-size: 0.7rem;
            color: var(--text-faint);
            font-weight: normal;
        }

        .entity-desc {
            font-size: 0.825rem;
            color: var(--text-muted);
            margin-left: auto;
        }

        /* Diagnostic Panel (Why it didn't work) */
        .diagnostic-panel {
            padding: 16px 20px;
            background: rgba(15, 23, 42, 0.6);
            border-top: 1px solid rgba(255, 255, 255, 0.04);
            display: none;
        }

        .diagnostic-panel.visible {
            display: block;
        }

        .fail-banner {
            background: rgba(244, 63, 94, 0.08);
            border: 1px solid rgba(244, 63, 94, 0.3);
            border-radius: 10px;
            padding: 14px 16px;
            margin-bottom: 12px;
        }

        .fail-title {
            color: #fb7185;
            font-weight: 700;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
        }

        .fail-why {
            color: #e2e8f0;
            font-size: 0.875rem;
            line-height: 1.5;
            margin-bottom: 10px;
        }

        .fix-box {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.25);
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 0.85rem;
            color: #a7f3d0;
        }

        .fix-label {
            font-weight: 700;
            color: #34d399;
            text-transform: uppercase;
            font-size: 0.725rem;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .code-block {
            background: #090d16;
            border: 1px solid var(--border-subtle);
            border-radius: 8px;
            padding: 10px 14px;
            font-family: var(--font-mono);
            font-size: 0.8rem;
            color: #cbd5e1;
            overflow-x: auto;
            margin-top: 8px;
        }

        .meta-specs {
            display: flex;
            gap: 16px;
            margin-top: 10px;
            font-size: 0.75rem;
            color: var(--text-faint);
            flex-wrap: wrap;
        }

        .meta-specs span {
            font-family: var(--font-mono);
            color: #94a3b8;
        }

        .toggle-details-btn {
            background: transparent;
            border: none;
            color: #38bdf8;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            padding: 0;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .toggle-details-btn:hover {
            text-decoration: underline;
        }

        /* Spinner */
        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: inline-block;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Footer */
        .footer {
            margin-top: 48px;
            padding: 24px 0;
            border-top: 1px solid var(--border-subtle);
            text-align: center;
            font-size: 0.825rem;
            color: var(--text-faint);
        }

        .footer a {
            color: #38bdf8;
            text-decoration: none;
        }
    </style>
</head>
<body>

    <!-- Sticky Navigation Bar -->
    <header class="top-nav">
        <div class="nav-container">
            <div class="brand-section">
                <div class="brand-badge">
                    <span class="pulse-dot"></span>
                    <span>Tester - Laravel</span>
                </div>
                <h1 class="brand-title">Marketplace CRUD Diagnostic</h1>
                <span class="env-pill">{{ $systemInfo['is_railway'] ? 'Railway Production' : 'Local Sandbox' }}</span>
            </div>

            <div class="nav-actions">
                <a href="/admin/settings" class="btn btn-secondary" target="_blank">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>Admin Settings</span>
                </a>
                <button id="btnRunAll" class="btn btn-primary" onclick="runAllTests()">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <span>Run All Tests</span>
                </button>
                <button id="btnExport" class="btn btn-secondary" onclick="exportReport()">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    <span>Export JSON</span>
                </button>
            </div>
        </div>
    </header>

    <main class="main-content">

        <!-- System & Database Information Strip -->
        <section class="system-strip">
            <div class="sys-card">
                <span class="sys-label">Laravel Version</span>
                <span class="sys-value">v{{ $systemInfo['laravel_version'] }}</span>
            </div>
            <div class="sys-card">
                <span class="sys-label">PHP Runtime</span>
                <span class="sys-value">v{{ $systemInfo['php_version'] }}</span>
            </div>
            <div class="sys-card">
                <span class="sys-label">Database Status</span>
                <span class="sys-value">
                    @if($systemInfo['database']['connected'])
                        <span style="color: #10b981;">● Connected</span> ({{ $systemInfo['database']['driver'] }})
                    @else
                        <span style="color: #f43f5e;">● Disconnected</span>
                    @endif
                </span>
            </div>
            <div class="sys-card">
                <span class="sys-label">Database Target</span>
                <span class="sys-value" title="{{ $systemInfo['database']['database'] }}@ {{ $systemInfo['database']['host'] }}">
                    {{ $systemInfo['database']['database'] }}
                </span>
            </div>
            <div class="sys-card">
                <span class="sys-label">Database Tables</span>
                <span class="sys-value">{{ $systemInfo['database']['table_count'] }} Tables ({{ $systemInfo['database']['migrations_count'] }} Migrations)</span>
            </div>
        </section>

        <!-- Live Scorecard -->
        <section class="scorecard-grid">
            <div class="stat-card info-card">
                <div class="stat-label">Total CRUD Operations</div>
                <div class="stat-number" id="statTotalOps">
                    {{ count($entities) * 4 }}
                    <span class="stat-sub">across {{ count($entities) }} entities</span>
                </div>
            </div>
            <div class="stat-card success-card">
                <div class="stat-label">Working (Passing)</div>
                <div class="stat-number" style="color: #34d399;" id="statWorking">
                    0
                    <span class="stat-sub" id="statWorkingPct">0%</span>
                </div>
            </div>
            <div class="stat-card danger-card">
                <div class="stat-label">Not Working (Failing)</div>
                <div class="stat-number" style="color: #fb7185;" id="statBroken">
                    0
                    <span class="stat-sub" id="statBrokenPct">0%</span>
                </div>
            </div>
            <div class="stat-card time-card">
                <div class="stat-label">Total Latency</div>
                <div class="stat-number" id="statDuration" style="color: #fbbf24;">
                    0 <span class="stat-sub">ms</span>
                </div>
            </div>
        </section>

        <!-- Dynamic Execution Progress Bar -->
        <section class="progress-wrapper" id="progressWrapper">
            <div class="progress-header">
                <span id="progressStatusText">Running diagnostics...</span>
                <span id="progressPctText">0%</span>
            </div>
            <div class="progress-track">
                <div class="progress-bar" id="progressBar"></div>
            </div>
        </section>

        <!-- Filters & Search Toolbar -->
        <section class="toolbar">
            <div class="filter-tabs">
                <button class="tab-btn active" data-filter="all" onclick="setFilter('all')">
                    All Entities ({{ count($entities) }})
                </button>
                <button class="tab-btn tab-working" data-filter="working" onclick="setFilter('working')">
                    Working (<span id="tabWorkingCount">0</span>)
                </button>
                <button class="tab-btn tab-broken" data-filter="broken" onclick="setFilter('broken')">
                    Not Working (<span id="tabBrokenCount">0</span>)
                </button>
            </div>

            <div class="search-box">
                <svg class="search-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input type="text" id="searchInput" placeholder="Search model or table..." oninput="filterEntities()" />
            </div>
        </section>

        <!-- Entity Test Cards Grid -->
        <section class="entities-grid" id="entitiesContainer">
            @foreach($entities as $key => $meta)
                <div class="entity-card state-idle" id="card-{{ $key }}" data-entity="{{ $key }}" data-name="{{ strtolower($meta['name']) }}" data-table="{{ strtolower($meta['table']) }}" data-status="idle">
                    <div class="card-header">
                        <div class="card-meta">
                            <span class="entity-name">
                                {{ $meta['name'] }}
                            </span>
                            <span class="group-tag">{{ $meta['group'] }}</span>
                            <span class="table-tag">tbl: {{ $meta['table'] }}</span>
                        </div>
                        <div class="card-controls">
                            <span class="status-badge badge-idle" id="status-{{ $key }}">IDLE</span>
                            <button class="btn-sm" onclick="runSingleTest('{{ $key }}')">Test This</button>
                            <button class="toggle-details-btn" onclick="toggleDetails('{{ $key }}')">
                                <span id="toggleText-{{ $key }}">Details ▾</span>
                            </button>
                        </div>
                    </div>

                    <div class="crud-bar">
                        <div class="op-badge op-idle" id="op-{{ $key }}-create">
                            <span>[C] CREATE</span>
                            <span class="op-duration" id="dur-{{ $key }}-create">--</span>
                        </div>
                        <div class="op-badge op-idle" id="op-{{ $key }}-read">
                            <span>[R] READ</span>
                            <span class="op-duration" id="dur-{{ $key }}-read">--</span>
                        </div>
                        <div class="op-badge op-idle" id="op-{{ $key }}-update">
                            <span>[U] UPDATE</span>
                            <span class="op-duration" id="dur-{{ $key }}-update">--</span>
                        </div>
                        <div class="op-badge op-idle" id="op-{{ $key }}-delete">
                            <span>[D] DELETE</span>
                            <span class="op-duration" id="dur-{{ $key }}-delete">--</span>
                        </div>

                        <span class="entity-desc">{{ $meta['description'] }}</span>
                    </div>

                    <!-- Diagnostic Drawer -->
                    <div class="diagnostic-panel" id="diag-{{ $key }}">
                        <div class="diag-content" id="diag-content-{{ $key }}">
                            <p style="color: var(--text-faint); font-size: 0.85rem;">Click "Run All Tests" or "Test This" to execute CRUD operations and inspect database diagnostics.</p>
                        </div>
                    </div>
                </div>
            @endforeach
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p><strong>Tester - Laravel</strong> &bull; Production Diagnostic Engine &bull; Safe transactional sandbox protects live data.</p>
            <p style="margin-top: 4px;">Host: {{ $systemInfo['current_host'] }} &bull; Target: <a href="https://bsab-shopecommerce-production.up.railway.app/test" target="_blank">bsab-shopecommerce-production.up.railway.app/test</a></p>
        </footer>

    </main>

    <script>
        const entitiesList = @json(array_keys($entities));
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        let currentFilter = 'all';
        let testResultsCache = {};
        let isRunning = false;

        // Run all tests sequentially with real-time live updates
        async function runAllTests() {
            if (isRunning) return;
            isRunning = true;

            const btnRun = document.getElementById('btnRunAll');
            btnRun.disabled = true;
            btnRun.innerHTML = '<span class="spinner"></span> <span>Testing...</span>';

            const progressWrapper = document.getElementById('progressWrapper');
            const progressBar = document.getElementById('progressBar');
            const progressStatusText = document.getElementById('progressStatusText');
            const progressPctText = document.getElementById('progressPctText');

            progressWrapper.style.display = 'block';
            progressBar.style.width = '0%';

            let workingOpsTotal = 0;
            let brokenOpsTotal = 0;
            let totalDurationMs = 0;

            const startTime = performance.now();

            for (let i = 0; i < entitiesList.length; i++) {
                const key = entitiesList[i];
                const pct = Math.round(((i) / entitiesList.length) * 100);
                progressBar.style.width = pct + '%';
                progressPctText.innerText = pct + '%';
                progressStatusText.innerText = `Testing entity: ${key} (${i + 1}/${entitiesList.length})...`;

                try {
                    const res = await fetch(`/test/run/${key}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        }
                    });

                    const data = await res.json();
                    testResultsCache[key] = data;
                    renderEntityResult(key, data);

                    // Count operations
                    if (data.operations) {
                        for (const opKey in data.operations) {
                            if (data.operations[opKey].status === 'working') {
                                workingOpsTotal++;
                            } else {
                                brokenOpsTotal++;
                            }
                        }
                    }
                    totalDurationMs += (data.duration_ms || 0);
                } catch (err) {
                    console.error('Test error for ' + key, err);
                }

                updateScorecards(workingOpsTotal, brokenOpsTotal, Math.round(performance.now() - startTime));
            }

            progressBar.style.width = '100%';
            progressPctText.innerText = '100%';
            progressStatusText.innerText = 'All diagnostic tests completed!';

            setTimeout(() => {
                progressWrapper.style.display = 'none';
            }, 3000);

            btnRun.disabled = false;
            btnRun.innerHTML = '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> <span>Run All Tests</span>';
            isRunning = false;
        }

        // Run test for a single entity
        async function runSingleTest(key) {
            const card = document.getElementById(`card-${key}`);
            const statusBadge = document.getElementById(`status-${key}`);
            statusBadge.className = 'status-badge badge-idle';
            statusBadge.innerHTML = '<span class="spinner"></span> TESTING';

            try {
                const res = await fetch(`/test/run/${key}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json'
                    }
                });

                const data = await res.json();
                testResultsCache[key] = data;
                renderEntityResult(key, data);
                recalculateGlobalStats();
            } catch (err) {
                console.error(err);
                statusBadge.className = 'status-badge badge-broken';
                statusBadge.innerText = 'ERROR';
            }
        }

        // Render result for an individual entity
        function renderEntityResult(key, data) {
            const card = document.getElementById(`card-${key}`);
            const statusBadge = document.getElementById(`status-${key}`);
            const diagPanel = document.getElementById(`diag-${key}`);
            const diagContent = document.getElementById(`diag-content-${key}`);

            if (data.status === 'working') {
                card.className = 'entity-card state-working';
                card.setAttribute('data-status', 'working');
                statusBadge.className = 'status-badge badge-working';
                statusBadge.innerText = '✓ WORKING';
            } else {
                card.className = 'entity-card state-broken';
                card.setAttribute('data-status', 'broken');
                statusBadge.className = 'status-badge badge-broken';
                statusBadge.innerText = '✗ NOT WORKING';
                // Automatically open details if broken so developer sees why immediately!
                diagPanel.classList.add('visible');
                document.getElementById(`toggleText-${key}`).innerText = 'Hide Details ▴';
            }

            // Render 4 CRUD operations
            let diagnosticsHtml = '';

            for (const opKey of ['create', 'read', 'update', 'delete']) {
                const badge = document.getElementById(`op-${key}-${opKey}`);
                const dur = document.getElementById(`dur-${key}-${opKey}`);
                const op = data.operations[opKey];

                if (!op) continue;

                dur.innerText = `${op.duration_ms || 0}ms`;

                if (op.status === 'working') {
                    badge.className = 'op-badge op-working';
                } else {
                    badge.className = 'op-badge op-broken';

                    // Build diagnosis view
                    if (op.diagnosis) {
                        diagnosticsHtml += `
                            <div class="fail-banner">
                                <div class="fail-title">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
                                    <span>[${opKey.toUpperCase()}] Failed: ${op.diagnosis.category || 'Error'}</span>
                                </div>
                                <div class="fail-why">
                                    <strong>Why it didn't work:</strong> ${escapeHtml(op.diagnosis.why_failed || op.diagnosis.error_message)}
                                </div>
                                <div class="fix-box">
                                    <div class="fix-label">Recommended Fix</div>
                                    <div>${escapeHtml(op.diagnosis.suggested_fix || 'Verify schema and fillable attributes.')}</div>
                                </div>
                                ${op.diagnosis.sql ? `
                                    <div class="code-block"><strong>Failed SQL:</strong> ${escapeHtml(op.diagnosis.sql)}</div>
                                ` : ''}
                                <div class="meta-specs">
                                    ${op.diagnosis.exception_class ? `<div>Exception: <span>${escapeHtml(op.diagnosis.exception_class)}</span></div>` : ''}
                                    ${op.diagnosis.error_code ? `<div>Code: <span>${escapeHtml(op.diagnosis.error_code)}</span></div>` : ''}
                                    ${op.diagnosis.file ? `<div>File: <span>${escapeHtml(op.diagnosis.file)}:${op.diagnosis.line}</span></div>` : ''}
                                </div>
                            </div>
                        `;
                    }
                }
            }

            if (data.status === 'working') {
                diagnosticsHtml = `
                    <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; padding: 12px 16px; color: #a7f3d0; font-size: 0.85rem;">
                        <strong>✓ All CRUD operations verified successfully:</strong> Create, Read, Update, and Delete passed with full database integrity.
                    </div>
                `;
            }

            diagContent.innerHTML = diagnosticsHtml;
        }

        // Toggle Diagnostic Details Drawer
        function toggleDetails(key) {
            const panel = document.getElementById(`diag-${key}`);
            const text = document.getElementById(`toggleText-${key}`);
            if (panel.classList.contains('visible')) {
                panel.classList.remove('visible');
                text.innerText = 'Details ▾';
            } else {
                panel.classList.add('visible');
                text.innerText = 'Hide Details ▴';
            }
        }

        // Update top scorecards
        function updateScorecards(working, broken, durationMs) {
            const total = working + broken;
            document.getElementById('statWorking').innerHTML = `${working} <span class="stat-sub">${total > 0 ? Math.round((working/total)*100) : 0}%</span>`;
            document.getElementById('statBroken').innerHTML = `${broken} <span class="stat-sub">${total > 0 ? Math.round((broken/total)*100) : 0}%</span>`;
            document.getElementById('statDuration').innerHTML = `${durationMs} <span class="stat-sub">ms</span>`;

            // Update tab badges
            let entitiesWorking = 0;
            let entitiesBroken = 0;
            document.querySelectorAll('.entity-card').forEach(card => {
                const s = card.getAttribute('data-status');
                if (s === 'working') entitiesWorking++;
                if (s === 'broken') entitiesBroken++;
            });
            document.getElementById('tabWorkingCount').innerText = entitiesWorking;
            document.getElementById('tabBrokenCount').innerText = entitiesBroken;
        }

        function recalculateGlobalStats() {
            let workingOps = 0;
            let brokenOps = 0;
            let duration = 0;

            for (const key in testResultsCache) {
                const data = testResultsCache[key];
                duration += (data.duration_ms || 0);
                if (data.operations) {
                    for (const opKey in data.operations) {
                        if (data.operations[opKey].status === 'working') workingOps++;
                        else brokenOps++;
                    }
                }
            }

            updateScorecards(workingOps, brokenOps, Math.round(duration));
        }

        // Filter tabs (All / Working / Broken)
        function setFilter(filter) {
            currentFilter = filter;
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
            });
            filterEntities();
        }

        // Filter entities by status and search query
        function filterEntities() {
            const query = document.getElementById('searchInput').value.toLowerCase().trim();

            document.querySelectorAll('.entity-card').forEach(card => {
                const status = card.getAttribute('data-status');
                const name = card.getAttribute('data-name');
                const table = card.getAttribute('data-table');

                const matchesFilter = (currentFilter === 'all')
                    || (currentFilter === 'working' && status === 'working')
                    || (currentFilter === 'broken' && status === 'broken');

                const matchesQuery = !query || name.includes(query) || table.includes(query);

                card.style.display = (matchesFilter && matchesQuery) ? 'block' : 'none';
            });
        }

        // Export diagnostic report
        function exportReport() {
            const report = {
                title: 'Tester - Laravel Diagnostic Export',
                exported_at: new Date().toISOString(),
                system_info: @json($systemInfo),
                results: testResultsCache
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `laravel-tester-report-${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        // Auto-run tests on page load for immediate instant verification!
        document.addEventListener('DOMContentLoaded', () => {
            runAllTests();
        });
    </script>
</body>
</html>
