<?php

return [
    'max_upload_kb' => (int) env('IMAGE_MAX_UPLOAD_KB', 10240),
    'webp_quality' => (int) env('IMAGE_WEBP_QUALITY', 82),
    'profile_max_dimension' => 800,
    'logo_max_dimension' => 1200,
    'banner_max_width' => 2000,
    'banner_max_height' => 1200,
    'product_max_dimension' => 2000,
    'category_max_dimension' => 1200,
    'promotion_max_dimension' => 1600,
];
