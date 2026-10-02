<?php

namespace Tests\Feature;

use Tests\TestCase;

class SearchRouteTest extends TestCase
{
    public function test_old_search_url_is_not_available(): void
    {
        $this->get('/search?q=hi')->assertNotFound();
    }
}
