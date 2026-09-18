<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Gemini Image AI Tester</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            background: #f4f6f8;
            color: #1f2937;
        }
        .container {
            max-width: 980px;
            margin: 40px auto;
            padding: 24px;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
        }
        h1 {
            margin-top: 0;
            font-size: 2rem;
        }
        .muted {
            color: #4b5563;
        }
        form {
            display: grid;
            gap: 18px;
            margin-top: 24px;
        }
        .field {
            display: grid;
            gap: 8px;
        }
        .field label {
            font-weight: 700;
        }
        input[type="file"] {
            padding: 10px;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            background: #f8fafc;
        }
        button {
            padding: 12px 18px;
            border: 0;
            border-radius: 10px;
            background: #2563eb;
            color: white;
            font-weight: 700;
            cursor: pointer;
        }
        button:disabled {
            background: #93c5fd;
            cursor: not-allowed;
        }
        .preview {
            max-width: 320px;
            margin-top: 12px;
            border-radius: 12px;
            border: 1px solid #dbe2ea;
            background: #f8fafc;
            padding: 8px;
        }
        .preview img {
            width: 100%;
            border-radius: 8px;
            display: block;
        }
        .status {
            margin-top: 20px;
            padding: 18px;
            border-radius: 12px;
            background: #eef2ff;
            border-left: 6px solid #4f46e5;
        }
        .status.success {
            background: #ecfdf5;
            border-left-color: #10b981;
        }
        .status.error {
            background: #fef2f2;
            border-left-color: #ef4444;
        }
        .result-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
            margin-top: 18px;
        }
        .panel {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            background: #f9fafb;
        }
        pre {
            white-space: pre-wrap;
            word-break: break-word;
            margin: 0;
            font-size: 0.92rem;
        }
        .meta {
            margin-top: 12px;
            font-size: 0.95rem;
            color: #374151;
        }
        .meta strong {
            color: #111827;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>GEMINI IMAGE AI TESTER</h1>
        <p class="muted">Upload a product image to test whether Gemini can analyze images.</p>

        <form id="gemini-image-form" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="field">
                <label for="image">Choose Image</label>
                <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp">
            </div>

            <div id="image-preview" class="preview" style="display:none;">
                <img id="preview-image" src="" alt="Selected preview">
            </div>

            <div class="meta" id="selected-image-label">
                <strong>Selected image:</strong> <span id="selected-image-name">None</span>
            </div>

            <button id="submit-button" type="submit">🖼️ Test Image Analysis</button>
        </form>

        <div id="status" class="status" style="display:none;"></div>

        @if (!empty($result))
            <div id="result-container" class="result-container">
                @if ($result['success'])
                    <div class="status success">
                        <h2>✅ GEMINI IMAGE ANALYSIS SUCCESS</h2>
                        <div class="meta">
                            <div><strong>HTTP Status:</strong> {{ $result['http_status'] ?? '—' }}</div>
                            <div><strong>Stage:</strong> {{ $result['stage'] ?? '—' }}</div>
                            <div><strong>Model:</strong> {{ $result['model'] ?? '—' }}</div>
                        </div>
                    </div>

                    <div class="result-grid">
                        <div class="panel">
                            <h3>Product Analysis</h3>
                            <div class="meta">
                                <div><strong>Product Name:</strong> {{ data_get($result, 'analysis.name') ?? 'null' }}</div>
                                <div><strong>Product Type:</strong> {{ data_get($result, 'analysis.product_type') ?? 'null' }}</div>
                                <div><strong>Category:</strong> {{ data_get($result, 'analysis.category') ?? 'null' }}</div>
                                <div><strong>Description:</strong> {{ data_get($result, 'analysis.description') ?? 'null' }}</div>
                                <div><strong>Colors:</strong> {{ is_array(data_get($result, 'analysis.colors')) ? implode(', ', data_get($result, 'analysis.colors')) : '[]' }}</div>
                                <div><strong>Sizes:</strong> {{ is_array(data_get($result, 'analysis.sizes')) ? implode(', ', data_get($result, 'analysis.sizes')) : '[]' }}</div>
                                <div><strong>Material:</strong> {{ data_get($result, 'analysis.material') ?? 'null' }}</div>
                                <div><strong>Brand:</strong> {{ data_get($result, 'analysis.brand') ?? 'null' }}</div>
                                <div><strong>Attributes:</strong> {{ is_array(data_get($result, 'analysis.attributes')) ? json_encode(data_get($result, 'analysis.attributes')) : '{}' }}</div>
                                <div><strong>Tags:</strong> {{ is_array(data_get($result, 'analysis.tags')) ? implode(', ', data_get($result, 'analysis.tags')) : '[]' }}</div>
                            </div>
                        </div>

                        <div class="panel">
                            <h3>Diagnostic Information</h3>
                            <div class="meta">
                                <div><strong>HTTP Status:</strong> {{ $result['http_status'] ?? '—' }}</div>
                                <div><strong>Stage:</strong> {{ $result['stage'] ?? '—' }}</div>
                                <div><strong>Message:</strong> {{ $result['message'] ?? '—' }}</div>
                                <div><strong>Image MIME Type:</strong> {{ data_get($result, 'image.mime_type') ?? '—' }}</div>
                                <div><strong>Image Size:</strong> {{ data_get($result, 'image.size') ?? '—' }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="panel" style="margin-top: 20px;">
                        <h3>Raw Gemini Text</h3>
                        <pre>{{ data_get($result, 'raw_text') ?? '—' }}</pre>
                    </div>
                @else
                    <div class="status error">
                        <h2>❌ GEMINI IMAGE TEST FAILED</h2>
                        <div class="meta">
                            <div><strong>Stage:</strong> {{ $result['stage'] ?? '—' }}</div>
                            <div><strong>HTTP Status:</strong> {{ $result['http_status'] ?? '—' }}</div>
                            <div><strong>Error:</strong> {{ $result['error'] ?? '—' }}</div>
                        </div>
                    </div>

                    @if (!empty($result['response']))
                        <div class="panel" style="margin-top: 20px;">
                            <h3>Gemini Response</h3>
                            <pre>{{ json_encode($result['response'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) }}</pre>
                        </div>
                    @endif
                @endif
            </div>
        @endif
    </div>

    <script>
        const input = document.getElementById('image');
        const preview = document.getElementById('image-preview');
        const previewImage = document.getElementById('preview-image');
        const selectedImageName = document.getElementById('selected-image-name');
        const form = document.getElementById('gemini-image-form');
        const submitButton = document.getElementById('submit-button');
        const status = document.getElementById('status');

        input.addEventListener('change', function () {
            const file = this.files[0];

            if (!file) {
                preview.style.display = 'none';
                selectedImageName.textContent = 'None';
                return;
            }

            selectedImageName.textContent = file.name;

            const reader = new FileReader();

            reader.onload = function (e) {
                previewImage.src = e.target.result;
                preview.style.display = 'block';
            };

            reader.readAsDataURL(file);
        });

        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const file = input.files[0];

            if (!file) {
                status.style.display = 'block';
                status.className = 'status error';
                status.innerHTML = '<strong>❌ No image selected.</strong> Please choose an image first.';
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Analyzing Image...';
            status.style.display = 'block';
            status.className = 'status';
            status.innerHTML = 'Analyzing image with Gemini...';

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch('{{ route('test.gemini.image') }}', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: formData,
                });

                const text = await response.text();
                let data;

                try {
                    data = JSON.parse(text);
                } catch (error) {
                    data = { success: false, stage: 'json_parsing', http_status: response.status, message: 'Invalid JSON response', error: text };
                }

                if (response.ok && data.success) {
                    status.className = 'status success';
                    status.innerHTML = `
                        <h3>✅ GEMINI IMAGE ANALYSIS SUCCESS</h3>
                        <div><strong>HTTP Status:</strong> ${data.http_status}</div>
                        <div><strong>Stage:</strong> ${data.stage}</div>
                        <div><strong>Message:</strong> ${data.message}</div>
                    `;

                    const panel = document.createElement('div');
                    panel.className = 'panel';
                    panel.style.marginTop = '18px';
                    panel.innerHTML = `
                        <h3>Product Analysis</h3>
                        <div class="meta">
                            <div><strong>Product Name:</strong> ${data.analysis?.name ?? 'null'}</div>
                            <div><strong>Product Type:</strong> ${data.analysis?.product_type ?? 'null'}</div>
                            <div><strong>Category:</strong> ${data.analysis?.category ?? 'null'}</div>
                            <div><strong>Description:</strong> ${data.analysis?.description ?? 'null'}</div>
                            <div><strong>Colors:</strong> ${(data.analysis?.colors ?? []).join(', ') || '[]'}</div>
                            <div><strong>Sizes:</strong> ${(data.analysis?.sizes ?? []).join(', ') || '[]'}</div>
                            <div><strong>Material:</strong> ${data.analysis?.material ?? 'null'}</div>
                            <div><strong>Brand:</strong> ${data.analysis?.brand ?? 'null'}</div>
                            <div><strong>Attributes:</strong> ${JSON.stringify(data.analysis?.attributes ?? {})}</div>
                            <div><strong>Tags:</strong> ${(data.analysis?.tags ?? []).join(', ') || '[]'}</div>
                        </div>
                    `;

                    status.appendChild(panel);
                } else {
                    status.className = 'status error';
                    status.innerHTML = `
                        <h3>❌ GEMINI IMAGE TEST FAILED</h3>
                        <div><strong>Stage:</strong> ${data.stage}</div>
                        <div><strong>HTTP Status:</strong> ${data.http_status}</div>
                        <div><strong>Error:</strong> ${data.error}</div>
                    `;
                }
            } catch (error) {
                status.className = 'status error';
                status.style.display = 'block';
                status.innerHTML = `
                    <h3>❌ GEMINI IMAGE TEST FAILED</h3>
                    <div><strong>Stage:</strong> gemini_request</div>
                    <div><strong>HTTP Status:</strong> 500</div>
                    <div><strong>Error:</strong> ${error.message}</div>
                `;
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = '🖼️ Test Image Analysis';
            }
        });
    </script>
</body>
</html>
