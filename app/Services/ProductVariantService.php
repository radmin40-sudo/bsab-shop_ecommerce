<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductOptionValue;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductVariantService
{
    public function parseOptionGroups(string $raw): array
    {
        $raw = trim($raw);
        if ($raw === '') {
            return [];
        }

        $groups = [];
        foreach (preg_split('/\r\n|\r|\n/', $raw) as $line) {
            $line = trim($line);
            if ($line === '' || ! str_contains($line, ':')) {
                continue;
            }

            [$groupName, $valueList] = array_map('trim', explode(':', $line, 2));
            $groupName = $this->normalizeGroupName($groupName);
            $values = $this->normalizeValues($valueList);

            if ($groupName === '' || $values === []) {
                continue;
            }

            $groups[] = [$groupName, $values];
        }

        return $groups;
    }

    protected function normalizeGroupName(string $groupName): string
    {
        $groupName = trim($groupName);
        $groupName = preg_replace('/\s+/', ' ', $groupName);
        $groupName = preg_replace('/^(Option|Product)\s+/i', '', $groupName);

        return ucfirst(strtolower(trim((string) $groupName)));
    }

    protected function normalizeValues(string $valueList): array
    {
        $segments = preg_split('/\s*,\s*/', trim($valueList));
        $values = [];

        foreach ($segments as $value) {
            $value = trim($value);
            if ($value === '') {
                continue;
            }

            $value = preg_replace('/\s+/', ' ', $value);
            $value = preg_replace('/\bkilograms?\b/i', 'kg', $value);
            $value = preg_replace('/\bgram(s)?\b/i', 'g', $value);
            $value = preg_replace('/\bkg\b/i', 'kg', $value);
            $value = preg_replace('/\b([0-9]+(?:\.\d+)?)\s*([a-z]+)\b/i', '$1$2', $value);
            $value = preg_replace('/\b([0-9]+(?:\.\d+)?)\s*kg\b/i', '$1kg', $value);
            $value = preg_replace('/\b([0-9]+(?:\.\d+)?)\s*g\b/i', '$1g', $value);

            $values[] = $value;
        }

        return array_values(array_unique($values));
    }

    public function syncFromOptionSpec(Product $product, string $raw): void
    {
        $groups = $this->parseOptionGroups($raw);

        DB::transaction(function () use ($product, $groups) {
            foreach ($product->options as $option) {
                foreach ($option->values as $value) {
                    $value->delete();
                }
                $option->delete();
            }

            foreach ($product->variants()->withTrashed()->get() as $variant) {
                $variant->optionValues()->delete();
                $variant->forceDelete();
            }

            if ($groups === []) {
                $this->createDefaultVariant($product);

                return;
            }

            $graph = [];
            foreach ($groups as $index => [$groupName, $values]) {
                $option = $product->options()->create([
                    'name' => $groupName,
                    'sort_order' => $index,
                ]);

                $valueModels = [];
                foreach ($values as $valueIndex => $valueName) {
                    $valueModels[] = $option->values()->create([
                        'value' => $valueName,
                        'sort_order' => $valueIndex,
                    ]);
                }

                $graph[] = [$option, $valueModels];
            }

            $combos = [[]];
            foreach ($graph as [$option, $valueModels]) {
                $next = [];
                foreach ($combos as $combo) {
                    foreach ($valueModels as $valueModel) {
                        $next[] = array_merge($combo, [$valueModel->id]);
                    }
                }
                $combos = $next;
            }

            foreach ($combos as $index => $combo) {
                $variantValues = ProductOptionValue::query()->whereIn('id', $combo)->get();
                $variantName = $variantValues->map(fn (ProductOptionValue $value) => $value->value)->implode(' / ');
                $baseSku = strtoupper(Str::slug($product->sku.'-'.$variantName.'-'.($index + 1)));
                $variant = $product->variants()->create([
                    'name' => $variantName ?: $product->name.' Variant '.($index + 1),
                    'sku' => $this->uniqueVariantSku($baseSku),
                    'price' => $product->sale_price ?? $product->base_price,
                    'stock_quantity' => (int) $product->stock_quantity,
                    'image' => null,
                    'is_active' => true,
                ]);

                foreach ($combo as $productOptionValueId) {
                    $variant->optionValues()->create([
                        'product_option_value_id' => $productOptionValueId,
                    ]);
                }
            }
        });
    }

    protected function createDefaultVariant(Product $product): void
    {
        $baseSku = strtoupper(Str::slug($product->sku.'-default'));

        $product->variants()->create([
            'name' => $product->name,
            'sku' => $this->uniqueVariantSku($baseSku),
            'price' => $product->sale_price ?? $product->base_price,
            'stock_quantity' => (int) $product->stock_quantity,
            'image' => null,
            'is_active' => true,
        ]);
    }

    protected function uniqueVariantSku(string $sku): string
    {
        $candidate = $sku;
        $counter = 1;

        while (ProductVariant::query()->withTrashed()->where('sku', $candidate)->exists()) {
            $candidate = $sku.'-'.$counter;
            $counter++;
        }

        return $candidate;
    }
}
