import { PortalLayout, StatCard } from '@/components/portal-layout';
import { prepareSanctum } from '@/lib/api';
import { Head, useForm } from '@inertiajs/react';
import { Eye, ImagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { FormEventHandler, Fragment, useMemo, useState } from 'react';

type Product = {
    id: number;
    name: string;
    sku: string;
    description: string | null;
    base_price: string;
    sale_price: string | null;
    stock_quantity: number;
    status: string;
    short_video_path?: string | null;
    category?: { id: number; name: string } | null;
    images?: { path: string; is_primary: boolean }[];
    brand?: string | null;
    model?: string | null;
    condition?: string | null;
    selling_unit?: string | null;
    barcode?: string | null;
    color?: string | null;
    size?: string | null;
    material?: string | null;
    weight?: string | null;
    volume?: string | null;
    pack_quantity?: number | string | null;
    length?: string | null;
    width?: string | null;
    height?: string | null;
    warranty?: string | null;
    country_of_origin?: string | null;
    product_options?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    slug?: string | null;
    currency?: string | null;
    is_active?: boolean | null;
    is_approved?: boolean | null;
    authenticity_status?: string | null;
    verification_status?: string | null;
    published_at?: string | null;
    variants?: {
        id: number;
        name: string;
        sku: string;
        price: string | null;
        stock_quantity: number;
        is_active: boolean;
        option_values?: {
            option_value?: {
                value: string;
                option?: { name: string } | null;
            } | null;
        }[];
    }[];
};
type Category = { id: number; name: string };
type ProductForm = {
    _method?: 'patch';
    category_id: string;
    name: string;
    description: string;
    base_price: string;
    sale_price: string;
    stock_quantity: string;
    brand: string;
    model: string;
    condition: string;
    selling_unit: string;
    color: string;
    size: string;
    material: string;
    weight: string;
    volume: string;
    pack_quantity: string;
    length: string;
    width: string;
    height: string;
    warranty: string;
    country_of_origin: string;
    product_options: string;
    variant_stocks?: string;
    variant_prices?: string;
    image: File | null;
    images: File[];
    product_video: File | null;
    is_active: boolean;
};

type VariantValue = { id: string; value: string };
type VariantGroup = { id: string; type: string; values: VariantValue[] };
type VariantCombination = { key: string; label: string; name: string };

const variantTypeOptions = [
    'Size',
    'Weight',
    'Pack Size',
    'Volume',
    'Length',
    'Diameter',
    'Capacity',
    'Variety',
    'Grade',
    'Color',
    'Material',
    'Type',
    'Form',
    'Growth Stage',
    'Quantity',
    'Model',
];

const defaultVariantValueMap: Record<string, string[]> = {
    Size: ['Small', 'Medium', 'Large', 'XL', 'XXL'],
    Weight: ['1kg', '5kg', '10kg', '25kg'],
    'Pack Size': ['10 seeds', '50 seeds', '100 seeds'],
    Volume: ['250ml', '500ml', '1L', '5L'],
    Length: ['5m', '10m', '20m', '50m'],
    Diameter: ['16mm', '20mm', '25mm'],
    Capacity: ['5L', '10L', '20L'],
    Variety: ['Hybrid', 'Open-pollinated'],
    Grade: ['Standard', 'Premium'],
    Color: ['Green', 'Black', 'White', 'Red', 'Blue'],
    Material: ['Plastic', 'Metal', 'Stainless'],
    Type: ['Organic', 'Synthetic'],
    Form: ['Granular', 'Powder', 'Liquid'],
    'Growth Stage': ['Starter', 'Grower', 'Finisher'],
    Quantity: ['1pc', '5pcs', '10pcs'],
    Model: ['Model A', 'Model B', 'Model C'],
};

const categoryDefaultVariantMap: Record<string, string> = {
    'Rice / Grains': 'Weight',
    Seeds: 'Pack Size',
    Fertilizer: 'Weight',
    Pesticide: 'Volume',
    'Farm Tools': 'Quantity',
    Irrigation: 'Length',
    'Livestock Supplies': 'Weight',
    'Garden Supplies': 'Size',
    Clothing: 'Size',
    Footwear: 'Size',
    Electronics: 'Capacity',
    'Other Product': 'Size',
};

const createVariantGroup = (type = 'Weight', values = defaultVariantValueMap[type] ?? ['Small', 'Medium']): VariantGroup => ({
    id: `group-${Math.random().toString(36).slice(2, 10)}`,
    type,
    values: values.map((value, index) => ({
        id: `${type}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        value,
    })),
});

function buildVariantCombinations(groups: VariantGroup[]): VariantCombination[] {
    const activeGroups = groups
        .map((group) => ({ ...group, values: group.values.filter((value) => value.value.trim()) }))
        .filter((group) => group.values.length > 0);

    if (activeGroups.length === 0) {
        return [];
    }

    let combinations = [{ keys: [] as string[], labels: [] as string[] }];
    for (const group of activeGroups) {
        combinations = combinations.flatMap((combination) =>
            group.values.map((value) => ({
                keys: [...combination.keys, value.id],
                labels: [...combination.labels, `${group.type}: ${value.value.trim()}`],
            })),
        );
    }

    return combinations.map((combination) => ({
        key: combination.keys.join('|'),
        label: combination.labels.join(' / '),
        name: combination.labels.map((label) => label.slice(label.indexOf(':') + 2)).join(' / '),
    }));
}

function parseVariantGroups(raw: string): VariantGroup[] {
    const groups = raw
        .split(/\r?\n/)
        .map((line, groupIndex) => {
            const separator = line.indexOf(':');
            if (separator < 1) return null;
            const type = line.slice(0, separator).trim();
            const values = line
                .slice(separator + 1)
                .split(',')
                .map((value, valueIndex) => ({
                    id: `edit-${groupIndex}-${valueIndex}`,
                    value: value.trim(),
                }))
                .filter((value) => value.value);
            return type && values.length ? { id: `edit-group-${groupIndex}`, type, values } : null;
        })
        .filter((group): group is VariantGroup => group !== null);

    return groups;
}

const blank: ProductForm = {
    category_id: '',
    name: '',
    description: '',
    base_price: '',
    sale_price: '',
    stock_quantity: '0',
    brand: '',
    model: '',
    condition: 'new',
    selling_unit: 'piece',
    color: '',
    size: '',
    material: '',
    weight: '',
    volume: '',
    pack_quantity: '1',
    length: '',
    width: '',
    height: '',
    warranty: '',
    country_of_origin: '',
    product_options: '',
    image: null,
    images: [],
    product_video: null,
    is_active: true,
};

type CropImage = { file: File; url: string; width: number; height: number; zoom: number; x: number; y: number };

function readSourceImage(file: File): Promise<{ url: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            resolve({ url, width: image.naturalWidth, height: image.naturalHeight });
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Unable to read image.'));
        };
        image.src = url;
    });
}

function cropToSquare(crop: CropImage): Promise<File> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1000;
            canvas.height = 1000;
            const context = canvas.getContext('2d');
            if (!context) {
                reject(new Error('Unable to prepare image.'));
                return;
            }
            const viewport = 320;
            const scale = Math.max(viewport / crop.width, viewport / crop.height) * crop.zoom;
            const renderedWidth = crop.width * scale;
            const renderedHeight = crop.height * scale;
            const left = (viewport - renderedWidth) / 2 + crop.x;
            const top = (viewport - renderedHeight) / 2 + crop.y;
            const sourceSize = viewport / scale;
            const sourceX = Math.max(0, Math.min(crop.width - sourceSize, -left / scale));
            const sourceY = Math.max(0, Math.min(crop.height - sourceSize, -top / scale));
            context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 1000, 1000);
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Unable to prepare image.'));
                        return;
                    }
                    resolve(new File([blob], crop.file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }));
                },
                'image/jpeg',
                0.9,
            );
        };
        image.onerror = () => reject(new Error('Unable to read image.'));
        image.src = crop.url;
    });
}

function formatMoney(value?: string | number | null) {
    if (value === null || value === undefined || value === '') {
        return '₱0.00';
    }

    const amount = Number(value);
    if (Number.isNaN(amount)) {
        return '₱0.00';
    }

    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function statusClass(status: string) {
    return status === 'published' || status === 'active' ? 'active' : 'inactive';
}

function displayStatus(status: string) {
    return status ? status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Draft';
}

export default function SellerProducts({ products, categories }: { products: Product[]; categories: Category[] }) {
    const [editing, setEditing] = useState<Product | null>(null);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [imageProcessing, setImageProcessing] = useState(false);
    const [imageError, setImageError] = useState('');
    const [cropQueue, setCropQueue] = useState<File[]>([]);
    const [cropImage, setCropImage] = useState<CropImage | null>(null);
    const [existingImages, setExistingImages] = useState<{ path: string; is_primary: boolean }[]>([]);
    const [existingVideo, setExistingVideo] = useState('');
    const [viewProductId, setViewProductId] = useState<number | null>(null);
    const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([createVariantGroup()]);
    const [variantStocks, setVariantStocks] = useState<Record<string, string>>({});
    const [variantPrices, setVariantPrices] = useState<Record<string, string>>({});
    const [variantLocked, setVariantLocked] = useState(false);
    const form = useForm<ProductForm>(blank);
    const variantCombinations = buildVariantCombinations(variantGroups);
    const allocatedStockTotal = variantCombinations.reduce((total, combination) => {
        const stock = Number(variantStocks[combination.key]);
        return total + (Number.isInteger(stock) && stock > 0 ? stock : 0);
    }, 0);
    const visibleProducts = useMemo(
        () =>
            products.filter(
                (product) => product.name.toLowerCase().includes(search.toLowerCase()) || product.sku.toLowerCase().includes(search.toLowerCase()),
            ),
        [products, search],
    );
    const published = products.filter((product) => product.status === 'published').length;
    const lowStock = products.filter((product) => product.stock_quantity < 5).length;

    const openModal = (product?: Product) => {
        const isEditing = Boolean(product);

        setEditing(product ?? null);
        setOpen(true);
        setExistingImages(product?.images ?? []);
        setExistingVideo(product?.short_video_path ?? '');

        const selectedCategory = product?.category?.name ?? categories[0]?.name ?? 'Rice / Grains';
        const defaultType = categoryDefaultVariantMap[selectedCategory] ?? 'Weight';
        const initialVariants = product?.product_options ? parseVariantGroups(product.product_options) : [createVariantGroup(defaultType)];

        const productForm = product
            ? {
                  category_id: String(product.category?.id ?? ''),
                  name: product.name,
                  description: product.description ?? '',
                  base_price: String(product.base_price ?? ''),
                  sale_price: String(product.sale_price ?? ''),
                  stock_quantity: String(product.stock_quantity ?? 0),
                  brand: product.brand ?? '',
                  model: product.model ?? '',
                  condition: product.condition ?? 'new',
                  selling_unit: product.selling_unit ?? 'piece',
                  color: product.color ?? '',
                  size: product.size ?? '',
                  material: product.material ?? '',
                  weight: product.weight ?? '',
                  volume: product.volume ?? '',
                  pack_quantity: String(product.pack_quantity ?? '1'),
                  length: product.length ?? '',
                  width: product.width ?? '',
                  height: product.height ?? '',
                  warranty: product.warranty ?? '',
                  country_of_origin: product.country_of_origin ?? '',
                  product_options: product.product_options ?? '',
                  image: null,
                  images: [],
                  product_video: null,
                  is_active: isEditing ? product.status === 'published' || product.status === 'active' : true,
              }
            : { ...blank, category_id: String(categories[0]?.id ?? '') };

        form.setData(productForm);
        form.clearErrors();
        setVariantGroups(initialVariants);
        const existingByName = new Map((product?.variants ?? []).map((variant) => [variant.name, variant]));
        const initialCombinations = buildVariantCombinations(initialVariants);
        setVariantStocks(
            Object.fromEntries(
                initialCombinations.map((combination) => [
                    combination.key,
                    existingByName.has(combination.name) ? String(existingByName.get(combination.name)?.stock_quantity ?? '') : '',
                ]),
            ),
        );
        setVariantPrices(
            Object.fromEntries(initialCombinations.map((combination) => [combination.key, existingByName.get(combination.name)?.price ?? ''])),
        );
        setVariantLocked(false);
    };
    const closeModal = () => {
        setOpen(false);
        setEditing(null);
        setImageProcessing(false);
        setImageError('');
        setExistingImages([]);
        setExistingVideo('');
        setVariantGroups([createVariantGroup()]);
        setVariantStocks({});
        setVariantPrices({});
        setVariantLocked(false);
        if (cropImage) URL.revokeObjectURL(cropImage.url);
        setCropImage(null);
        setCropQueue([]);
        form.reset();
        form.clearErrors();
    };
    const adaptProduct = (nextCategoryId: string) => {
        const categoryName = categories.find((item) => String(item.id) === nextCategoryId)?.name ?? '';
        form.setData('category_id', nextCategoryId);

        if (!variantLocked && categoryName) {
            const defaultType = categoryDefaultVariantMap[categoryName] ?? 'Size';
            setVariantGroups((current) => {
                if (!current.length) {
                    return [createVariantGroup(defaultType)];
                }

                const next = [...current];
                next[0] = {
                    ...next[0],
                    type: defaultType,
                    values: (defaultVariantValueMap[defaultType] ?? ['Small']).map((value) => ({
                        id: `${defaultType}-${Math.random().toString(36).slice(2, 8)}`,
                        value,
                    })),
                };
                return next;
            });
        }
    };
    const addVariantGroup = () => {
        setVariantLocked(true);
        setVariantGroups((current) => [...current, createVariantGroup('Size')]);
    };
    const removeVariantGroup = (id: string) => {
        setVariantGroups((current) => (current.length > 1 ? current.filter((group) => group.id !== id) : current));
    };
    const addVariantValue = (groupId: string) => {
        setVariantLocked(true);
        setVariantGroups((current) =>
            current.map((group) =>
                group.id === groupId
                    ? {
                          ...group,
                          values: [...group.values, { id: `value-${Math.random().toString(36).slice(2, 9)}`, value: '' }],
                      }
                    : group,
            ),
        );
    };
    const removeVariantValue = (groupId: string, valueId: string) => {
        setVariantGroups((current) =>
            current.map((group) => (group.id === groupId ? { ...group, values: group.values.filter((value) => value.id !== valueId) } : group)),
        );
    };
    const changeVariantType = (groupId: string, nextType: string) => {
        setVariantLocked(true);
        setVariantGroups((current) =>
            current.map((group) => {
                if (group.id !== groupId) return group;
                const preset = defaultVariantValueMap[nextType] ?? ['Custom'];
                return {
                    ...group,
                    type: nextType,
                    values: preset.map((value, index) => ({
                        id: `${nextType}-${index}-${Math.random().toString(36).slice(2, 8)}`,
                        value,
                    })),
                };
            }),
        );
    };
    const previewImages = (files: FileList | null) => {
        if (!files || !files.length) return;
        const selected = Array.from(files);
        const allowed = selected.filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type));
        if (!allowed.length) {
            setImageError('Please choose JPG, PNG, or WebP images.');
            return;
        }
        form.setData('images', [...form.data.images, ...allowed]);
        form.setData('image', allowed[0]);
        setImageError('');
    };
    const previewVideo = (file: File | null) => {
        form.setData('product_video', file);
    };
    const buildVariantOptionSpec = (groups: VariantGroup[]) =>
        groups
            .filter((group) => group.values.some((value) => value.value.trim()))
            .map((group) => {
                const values = group.values
                    .filter((value) => value.value.trim())
                    .map((value) => value.value.trim())
                    .join(', ');

                return `${group.type}: ${values}`;
            })
            .join('\n');
    const saveProduct = async (event: React.FormEvent) => {
        event.preventDefault();
        const variantText = buildVariantOptionSpec(variantGroups);
        const stockValues = variantCombinations.map((combination) => Number(variantStocks[combination.key] || 0));
        const priceValues = variantCombinations.map((combination) => variantPrices[combination.key] ?? '');
        const totalStock = stockValues.reduce((total, stock) => total + stock, 0);
        if (priceValues.some((value) => value === '' || !Number.isFinite(Number(value)) || Number(value) < 0)) {
            form.setError('variant_prices', 'Enter a valid price for every variant combination.');
            return;
        }
        form.setData('product_options', variantText);

        const options = { preserveScroll: true, forceFormData: true, onSuccess: closeModal };
        form.transform((data) => ({
            ...data,
            stock_quantity: String(totalStock),
            product_options: variantText,
            variant_stocks: JSON.stringify(stockValues),
            variant_prices: JSON.stringify(priceValues),
            ...(editing ? { _method: 'patch' } : {}),
        }));
        await prepareSanctum();
        form.post(editing ? route('seller.products.update', editing.id) : route('seller.products.store'), options);
    };

    const chooseCrop = (file: File, files: File[]) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            setImageProcessing(false);
            setCropImage({
                file,
                url,
                width: image.naturalWidth,
                height: image.naturalHeight,
                zoom: 1,
                x: 0,
                y: 0,
            });
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            setImageProcessing(false);
            setImageError('This image could not be read. Please choose another file.');
        };
        image.src = url;

        form.setData('image', file);
        form.setData('images', files);
    };
    const submit: FormEventHandler = async (event) => {
        event.preventDefault();
        if (!editing && !form.data.product_options.trim()) {
            form.setError('product_options', 'Add at least one product variant option, for example: Crop: Tomato, Lettuce.');
            return;
        }

        const variantText = buildVariantOptionSpec(variantGroups);
        form.setData('product_options', variantText);

        const options = { preserveScroll: true, forceFormData: true, onSuccess: close };
        form.transform((data) => ({
            ...data,
            product_options: variantText,
            ...(editing ? { _method: 'patch' } : {}),
        }));
        await prepareSanctum();
        form.post(editing ? route('seller.products.update', editing.id) : route('seller.products.store'), options);
    };
    const applyCurrentCrop = async (auto = false) => {
        if (!cropImage) return;
        setImageProcessing(true);
        try {
            const currentFile = cropImage.file;
            const currentCrop = auto ? { ...cropImage, zoom: 1, x: 0, y: 0 } : cropImage;

            const croppedFile = await cropToSquare({
                ...currentCrop,
                file: currentFile,
            });

            const nextImages = [...form.data.images];
            const selectedIndex = nextImages.findIndex((file) => file === currentFile);
            if (selectedIndex >= 0) {
                nextImages[selectedIndex] = croppedFile;
            } else {
                nextImages.push(croppedFile);
            }

            const remaining = cropQueue.slice(1);
            form.setData('images', nextImages);
            form.setData('image', croppedFile);

            URL.revokeObjectURL(cropImage.url);
            setCropImage(null);

            if (remaining.length > 0) {
                const nextFile = remaining[0];
                setCropQueue(remaining);
                chooseCrop(nextFile, nextImages);
            } else {
                setCropQueue([]);
            }
        } catch {
            setImageError('This image could not be cropped. Please choose another file.');
        } finally {
            setImageProcessing(false);
        }
    };

    const applyCrop = async () => {
        await applyCurrentCrop(false);
    };

    const applyAutoCrop = async () => {
        await applyCurrentCrop(true);
    };

    const removeQueuedImage = (fileToRemove: File) => {
        const nextImages = form.data.images.filter((file) => file !== fileToRemove);
        const nextCropQueue = cropQueue.filter((file) => file !== fileToRemove);

        form.setData('images', nextImages);
        setCropQueue(nextCropQueue);

        if (cropImage && cropImage.file === fileToRemove) {
            URL.revokeObjectURL(cropImage.url);
            setCropImage(null);
        }

        if (form.data.image === fileToRemove) {
            form.setData('image', nextImages[0] ?? null);
        }

        if (nextCropQueue.length > 0 && (!cropImage || cropImage.file === fileToRemove)) {
            chooseCrop(nextCropQueue[0], nextImages);
        }
    };

    return (
        <>
            <Head title="Products" />
            <PortalLayout role="seller" title="Products" eyebrow="Morrow Studio">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3 border border-[#dfe3dc] bg-white px-4 py-3 sm:w-80">
                        <Search size={17} className="text-[#657066]" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search products"
                            className="w-full bg-transparent text-sm outline-none"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center justify-center gap-2 bg-[#1e2420] px-4 py-3 text-sm font-semibold text-white"
                    >
                        <Plus size={17} /> Add product
                    </button>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <StatCard label="Total products" value={String(products.length)} detail="In your catalog" />
                    <StatCard label="Published" value={String(published)} detail="Visible in storefront" tone="green" />
                    <StatCard label="Low stock" value={String(lowStock)} detail="Fewer than 5 units" tone="warm" />
                </div>
                <section className="mt-6 overflow-x-auto border border-[#dfe3dc] bg-white">
                    <div className="table-wrapper">
                        <table className="w-full min-w-225 border-collapse text-[13px]">
                            <thead className="bg-[#f7f7f7]">
                                <tr>
                                    <th className="border-r border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">Image</th>
                                    <th className="border-r border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">
                                        Product Name
                                    </th>
                                    <th className="border-r border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">SKU</th>
                                    <th className="border-r border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">Brand</th>
                                    <th className="border-r border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">Category</th>
                                    <th className="border-r border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">Variant</th>
                                    <th className="border-r border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">Price</th>
                                    <th className="border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf0eb]">
                                {visibleProducts.map((product) => {
                                    const image = product.images?.find((item) => item.is_primary) ?? product.images?.[0];
                                    const status = displayStatus(product.status);
                                    const price = product.sale_price || product.base_price;
                                    const isExpanded = viewProductId === product.id;
                                    const variantSummary = (product.product_options || '')
                                        .split(/\n|;/)
                                        .map((entry) => entry.trim())
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .join(' • ');
                                    const variantPrices = product.variants ?? [];
                                    const details: [string, string][] = [
                                        ['Product ID', String(product.id)],
                                        ['Slug', product.slug ?? '—'],
                                        ['SKU', product.sku],
                                        ['Barcode', product.barcode ?? '—'],
                                        ['Brand', product.brand ?? '—'],
                                        ['Model', product.model ?? '—'],
                                        ['Category', product.category?.name ?? 'Uncategorized'],
                                        ['Condition', product.condition ?? '—'],
                                        ['Base price', formatMoney(product.base_price)],
                                        ['Sale price', product.sale_price ? formatMoney(product.sale_price) : '—'],
                                        ['Total stock', String(product.stock_quantity)],
                                        ['Selling unit', product.selling_unit ?? '—'],
                                        ['Color', product.color ?? '—'],
                                        ['Size', product.size ?? '—'],
                                        ['Material', product.material ?? '—'],
                                        ['Weight', product.weight ?? '—'],
                                        ['Volume', product.volume ?? '—'],
                                        ['Pack quantity', product.pack_quantity == null ? '—' : String(product.pack_quantity)],
                                        ['Length', product.length ?? '—'],
                                        ['Width', product.width ?? '—'],
                                        ['Height', product.height ?? '—'],
                                        ['Warranty', product.warranty ?? '—'],
                                        ['Country of origin', product.country_of_origin ?? '—'],
                                        ['Currency', product.currency ?? 'PHP'],
                                        ['Status', status],
                                        ['Approved', product.is_approved == null ? '—' : product.is_approved ? 'Yes' : 'No'],
                                        ['Active', product.is_active == null ? '—' : product.is_active ? 'Yes' : 'No'],
                                        ['Authenticity', product.authenticity_status ?? '—'],
                                        ['Verification', product.verification_status ?? '—'],
                                        ['Published at', product.published_at ?? '—'],
                                        ['Created at', product.created_at ?? '—'],
                                        ['Updated at', product.updated_at ?? '—'],
                                        ['Description', product.description ?? '—'],
                                        ['Variant options', product.product_options || 'None'],
                                    ];

                                    return (
                                        <Fragment key={product.id}>
                                            <tr className="align-middle hover:bg-[#fafcfb]">
                                                <td className="border-r border-b border-[#eee] px-3 py-3 align-middle whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {image ? (
                                                            <img
                                                                src={`/storage/${image.path}`}
                                                                alt={product.name}
                                                                className="h-14 w-14 rounded-[10px] border border-[#dfe5df] object-cover"
                                                            />
                                                        ) : (
                                                            <span className="flex h-14 w-14 items-center justify-center rounded-[10px] border border-[#dfe5df] bg-[#f5f7f5] text-[#8e9b96]">
                                                                <ImagePlus size={18} />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="border-r border-b border-[#eee] px-3 py-3 align-middle whitespace-normal">
                                                    <div className="font-semibold text-[#17352b]">{product.name}</div>
                                                </td>
                                                <td className="border-r border-b border-[#eee] px-3 py-3 align-middle whitespace-nowrap text-[#4b5852]">
                                                    {product.sku || '—'}
                                                </td>
                                                <td className="border-r border-b border-[#eee] px-3 py-3 align-middle whitespace-nowrap text-[#4b5852]">
                                                    {product.brand ?? '—'}
                                                </td>
                                                <td className="border-r border-b border-[#eee] px-3 py-3 align-middle whitespace-nowrap text-[#4b5852]">
                                                    {product.category?.name ?? 'Uncategorized'}
                                                </td>
                                                <td className="border-r border-b border-[#eee] px-3 py-3 align-middle whitespace-normal text-[#4b5852]">
                                                    {variantSummary || 'No variants'}
                                                </td>
                                                <td className="border-r border-b border-[#eee] px-3 py-3 align-middle whitespace-nowrap text-[#17352b]">
                                                    <div className="font-semibold">{formatMoney(price)}</div>
                                                    <div className="mt-1 text-[11px] text-[#6b796f]">
                                                        {product.sale_price ? `Was ${formatMoney(product.base_price)}` : 'Regular price'}
                                                    </div>
                                                    {variantPrices.length > 0 && (
                                                        <div className="mt-2 space-y-0.5 text-[10px] text-[#52665a]">
                                                            {variantPrices.slice(0, 3).map((variant) => (
                                                                <div key={variant.id} className="max-w-40 truncate">
                                                                    {variant.name}:{' '}
                                                                    <span className="font-semibold text-[#176b3c]">{formatMoney(variant.price)}</span>
                                                                </div>
                                                            ))}
                                                            {variantPrices.length > 3 && (
                                                                <div className="font-semibold text-[#176b3c]">
                                                                    +{variantPrices.length - 3} more prices
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="border-b border-[#eee] px-3 py-3 align-middle whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewProductId(isExpanded ? null : product.id)}
                                                            className="rounded-[7px] border border-[#dfe4e1] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#1d2d26] hover:bg-[#f3f6f4]"
                                                        >
                                                            <Eye size={12} className="mr-1 inline" /> {isExpanded ? 'Hide' : 'View'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openModal(product)}
                                                            className="rounded-[7px] border border-[#dfe4e1] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#1d2d26] hover:bg-[#f3f6f4]"
                                                        >
                                                            <Pencil size={12} className="mr-1 inline" /> Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                window.confirm(`Delete ${product.name}?`) &&
                                                                form.delete(route('seller.products.destroy', product.id), { preserveScroll: true })
                                                            }
                                                            className="rounded-[7px] border border-[#dfe4e1] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#b00020] hover:bg-[#fff2f4]"
                                                        >
                                                            <Trash2 size={12} className="mr-1 inline" /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr key={`${product.id}-details`} className="bg-[#fafcfb]">
                                                    <td colSpan={8} className="border-b border-[#eee] px-3 py-4">
                                                        <h3 className="mb-3 text-sm font-semibold text-[#17352b]">Full product details</h3>
                                                        <div className="overflow-x-auto border border-[#e3e8e4] bg-white">
                                                            <table className="w-full min-w-[680px] border-collapse text-left text-xs">
                                                                <tbody>
                                                                    {Array.from({ length: Math.ceil(details.length / 2) }, (_, rowIndex) => {
                                                                        const first = details[rowIndex * 2];
                                                                        const second = details[rowIndex * 2 + 1];

                                                                        return (
                                                                            <tr
                                                                                key={`${product.id}-detail-${rowIndex}`}
                                                                                className="border-b border-[#edf0ee] last:border-b-0"
                                                                            >
                                                                                <th className="w-[16%] bg-[#f7f9f7] px-3 py-2 text-left font-semibold text-[#657066]">
                                                                                    {first[0]}
                                                                                </th>
                                                                                <td className="w-[34%] px-3 py-2 break-words text-[#27352e]">
                                                                                    {first[1]}
                                                                                </td>
                                                                                {second ? (
                                                                                    <>
                                                                                        <th className="w-[16%] bg-[#f7f9f7] px-3 py-2 text-left font-semibold text-[#657066]">
                                                                                            {second[0]}
                                                                                        </th>
                                                                                        <td className="w-[34%] px-3 py-2 break-words text-[#27352e]">
                                                                                            {second[1]}
                                                                                        </td>
                                                                                    </>
                                                                                ) : (
                                                                                    <td colSpan={2} />
                                                                                )}
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        {product.images?.length ? (
                                                            <div className="mt-4">
                                                                <h4 className="mb-2 text-xs font-semibold text-[#17352b]">Product images</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {product.images.map((item) => (
                                                                        <img
                                                                            key={item.path}
                                                                            src={`/storage/${item.path}`}
                                                                            alt={product.name}
                                                                            className="h-16 w-16 rounded border border-[#dfe5df] object-cover"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                        {product.short_video_path && (
                                                            <div className="mt-3 text-xs text-[#4b5852]">
                                                                Product video:{' '}
                                                                <a
                                                                    className="underline"
                                                                    href={`/storage/${product.short_video_path}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    Open video
                                                                </a>
                                                            </div>
                                                        )}
                                                        {product.variants?.length ? (
                                                            <div className="mt-4">
                                                                <h4 className="mb-2 text-xs font-semibold text-[#17352b]">Variant inventory</h4>
                                                                <div className="overflow-x-auto border border-[#e3e8e4] bg-white">
                                                                    <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                                                                        <thead className="bg-[#f7f9f7] text-[#657066]">
                                                                            <tr>
                                                                                <th className="border-b border-[#e3e8e4] px-3 py-2">Variant</th>
                                                                                <th className="border-b border-[#e3e8e4] px-3 py-2">SKU</th>
                                                                                <th className="border-b border-[#e3e8e4] px-3 py-2">Options</th>
                                                                                <th className="border-b border-[#e3e8e4] px-3 py-2">Price</th>
                                                                                <th className="border-b border-[#e3e8e4] px-3 py-2">Stock</th>
                                                                                <th className="border-b border-[#e3e8e4] px-3 py-2">Status</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {product.variants.map((variant) => (
                                                                                <tr
                                                                                    key={variant.id}
                                                                                    className="border-b border-[#edf0ee] last:border-b-0"
                                                                                >
                                                                                    <td className="px-3 py-2 text-[#27352e]">{variant.name}</td>
                                                                                    <td className="px-3 py-2 text-[#4b5852]">{variant.sku}</td>
                                                                                    <td className="px-3 py-2 text-[#4b5852]">
                                                                                        {variant.option_values
                                                                                            ?.map((assignment) => {
                                                                                                const optionValue = assignment.option_value;
                                                                                                return optionValue
                                                                                                    ? `${optionValue.option?.name ?? 'Option'}: ${optionValue.value}`
                                                                                                    : null;
                                                                                            })
                                                                                            .filter(Boolean)
                                                                                            .join(' • ') || '—'}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-[#27352e]">
                                                                                        {formatMoney(variant.price)}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-[#27352e]">
                                                                                        {variant.stock_quantity}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-[#4b5852]">
                                                                                        {variant.is_active ? 'Active' : 'Inactive'}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                                {visibleProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#657066]">
                                            {search ? 'No products match your search.' : 'No products yet. Add your first product to get started.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#122219]/40 p-3 sm:p-6">
                        <div className="relative w-full max-w-[920px] overflow-hidden rounded-[18px] border border-[#d8ddd8] bg-white shadow-[0_30px_80px_rgba(17,35,26,0.14)]">
                            <div className="flex items-center justify-between border-b border-[#edf0ee] px-5 py-4 sm:px-6">
                                <h2 className="font-serif text-[28px] font-semibold tracking-[-0.03em] text-[#18362d]">New product</h2>
                                <button type="button" onClick={closeModal} className="text-3xl leading-none text-[#3d4b46]">
                                    ×
                                </button>
                            </div>

                            <div className="max-h-[82vh] overflow-y-auto bg-[#f8faf8] p-5 sm:p-6">
                                <div className="space-y-5">
                                    <div className="rounded-[12px] border border-[#dfe6e2] bg-white p-4 sm:p-5">
                                        <label className="block text-sm font-semibold text-[#17352b]">
                                            Product Images <span className="text-[#d9485f]">*</span>
                                        </label>
                                        <label className="mt-3 flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#cfd8d3] bg-[#fbfcfb] px-6 py-5 text-center transition hover:border-[#168c4d] hover:bg-[#f4fbf6]">
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                multiple
                                                onChange={(event) => previewImages(event.target.files)}
                                                className="hidden"
                                            />
                                            <div className="mb-2 rounded-full bg-[#edf7f0] p-3 text-[#168c4d]">
                                                <ImagePlus size={18} />
                                            </div>
                                            <div className="text-lg font-semibold text-[#17352b]">Upload Product Images</div>
                                            <div className="mt-1 text-sm text-[#66756f]">
                                                Select multiple images. The first image will be the primary image.
                                            </div>
                                        </label>
                                        {imageError && <div className="mt-3 text-xs text-[#a13b32]">{imageError}</div>}
                                        {editing && existingImages.length > 0 && (
                                            <div className="mt-4">
                                                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                                                    <span className="text-xs font-semibold text-[#17352b]">Current images</span>
                                                    <span className="text-[11px] text-[#66756f]">Uploading new images replaces these.</span>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    {existingImages.map((image) => (
                                                        <div key={image.path} className="relative">
                                                            <img
                                                                src={`/storage/${image.path}`}
                                                                alt={`${editing.name} current image`}
                                                                className="h-20 w-20 rounded-[10px] border border-[#dfe3dc] object-cover"
                                                            />
                                                            {image.is_primary && (
                                                                <span className="absolute top-1 left-1 rounded-full bg-[#168c4d] px-2 py-0.5 text-[9px] font-semibold text-white">
                                                                    Primary
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {form.data.images.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-3">
                                                {form.data.images.map((file, index) => (
                                                    <div key={`${file.name}-${index}`} className="relative">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={file.name}
                                                            className="h-20 w-20 rounded-[10px] border border-[#dfe3dc] object-cover"
                                                        />
                                                        <span
                                                            className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-semibold ${index === 0 ? 'bg-[#168c4d] text-white' : 'bg-[#edf8f1] text-[#0d6f3c]'}`}
                                                        >
                                                            {index === 0 ? 'Primary' : 'Image'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const next = form.data.images.filter((_, itemIndex) => itemIndex !== index);
                                                                form.setData('images', next);
                                                                form.setData('image', next[0] ?? null);
                                                            }}
                                                            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#171717] text-[10px] text-white"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-[12px] border border-[#dfe6e2] bg-white p-4 sm:p-5">
                                        <label className="block text-sm font-semibold text-[#17352b]">
                                            Product Video <span className="text-[#6d7a73]">Optional</span>
                                        </label>
                                        <label className="mt-3 flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#cfd8d3] bg-[#fbfcfb] px-6 py-5 text-center transition hover:border-[#168c4d] hover:bg-[#f4fbf6]">
                                            <input
                                                type="file"
                                                accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/3gpp,video/m4v"
                                                onChange={(event) => previewVideo(event.target.files?.[0] ?? null)}
                                                className="hidden"
                                            />
                                            <div className="mb-2 rounded-full bg-[#edf7f0] p-3 text-[#168c4d]">
                                                <Plus size={18} />
                                            </div>
                                            <div className="text-lg font-semibold text-[#17352b]">Upload Short Product Video</div>
                                            <div className="mt-1 text-sm text-[#66756f]">Maximum 60 seconds and 50 MB.</div>
                                        </label>
                                        {form.data.product_video && (
                                            <div className="mt-4">
                                                <video
                                                    src={URL.createObjectURL(form.data.product_video)}
                                                    controls
                                                    className="h-28 w-full rounded-[10px] border object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-[12px] border border-[#dfe6e2] bg-white p-4 sm:p-5">
                                        <div className="mb-4 text-sm font-semibold tracking-[0.08em] text-[#5c6b62] uppercase">
                                            Product Information
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <label className="block text-sm font-semibold text-[#17352b]">
                                                Product name <span className="text-[#d9485f]">*</span>
                                                <input
                                                    value={form.data.name}
                                                    onChange={(event) => form.setData('name', event.target.value)}
                                                    placeholder="Premium Rice (Local)"
                                                    className="mt-2 w-full rounded-[10px] border border-[#d7ddd9] bg-white px-3 py-2.5 text-sm text-[#17352b] transition outline-none focus:border-[#168c4d]"
                                                />
                                            </label>
                                            <label className="block text-sm font-semibold text-[#17352b]">
                                                Brand
                                                <input
                                                    value={form.data.brand}
                                                    onChange={(event) => form.setData('brand', event.target.value)}
                                                    placeholder="e.g. Northline"
                                                    className="mt-2 w-full rounded-[10px] border border-[#d7ddd9] bg-white px-3 py-2.5 text-sm text-[#17352b] transition outline-none focus:border-[#168c4d]"
                                                />
                                            </label>
                                            <label className="block text-sm font-semibold text-[#17352b]">
                                                Product category <span className="text-[#d9485f]">*</span>
                                                <select
                                                    value={form.data.category_id}
                                                    onChange={(event) => adaptProduct(event.target.value)}
                                                    className="mt-2 w-full rounded-[10px] border border-[#d7ddd9] bg-white px-3 py-2.5 text-sm text-[#17352b] transition outline-none focus:border-[#168c4d]"
                                                >
                                                    <option value="">Select category</option>
                                                    {categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>

                                        <label className="mt-4 block text-sm font-semibold text-[#17352b]">
                                            Description
                                            <textarea
                                                value={form.data.description}
                                                onChange={(event) => form.setData('description', event.target.value)}
                                                placeholder="Describe your product in detail"
                                                className="mt-2 min-h-[110px] w-full rounded-[10px] border border-[#d7ddd9] bg-white px-3 py-2.5 text-sm text-[#17352b] transition outline-none focus:border-[#168c4d]"
                                            />
                                        </label>
                                    </div>

                                    <div className="rounded-[12px] border border-[#dfe6e2] bg-white p-4 sm:p-5">
                                        <div className="mb-4 text-sm font-semibold tracking-[0.08em] text-[#5c6b62] uppercase">
                                            Pricing & Inventory
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <label className="block text-sm font-semibold text-[#17352b]">
                                                Selling price (₱) <span className="text-[#d9485f]">*</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={form.data.base_price}
                                                    onChange={(event) => form.setData('base_price', event.target.value)}
                                                    placeholder="0.00"
                                                    className="mt-2 w-full rounded-[10px] border border-[#d7ddd9] bg-white px-3 py-2.5 text-sm text-[#17352b] transition outline-none focus:border-[#168c4d]"
                                                />
                                            </label>
                                            <label className="block text-sm font-semibold text-[#17352b]">
                                                Regular price (₱)
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={form.data.sale_price}
                                                    onChange={(event) => form.setData('sale_price', event.target.value)}
                                                    placeholder="0.00"
                                                    className="mt-2 w-full rounded-[10px] border border-[#d7ddd9] bg-white px-3 py-2.5 text-sm text-[#17352b] transition outline-none focus:border-[#168c4d]"
                                                />
                                            </label>
                                            <label className="block text-sm font-semibold text-[#17352b]">
                                                Total stock <span className="text-[#d9485f]">*</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={String(allocatedStockTotal)}
                                                    readOnly
                                                    placeholder="0"
                                                    className="mt-2 w-full rounded-[10px] border border-[#d7ddd9] bg-white px-3 py-2.5 text-sm text-[#17352b] transition outline-none read-only:bg-[#f4f6f4] focus:border-[#168c4d]"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="rounded-[12px] border border-[#dfe6e2] bg-white p-4 sm:p-5">
                                        <div className="mb-4 text-sm font-semibold tracking-[0.08em] text-[#5c6b62] uppercase">Product Variants</div>
                                        {variantGroups.map((group, groupIndex) => (
                                            <div key={group.id} className="mb-5 rounded-[12px] border border-[#e4e8e5] bg-[#fafcfb] p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-semibold tracking-[0.08em] text-[#5c6b62] uppercase">
                                                            Variant Type
                                                        </label>
                                                        <select
                                                            value={group.type}
                                                            onChange={(event) => changeVariantType(group.id, event.target.value)}
                                                            className="mt-2 w-full rounded-[10px] border border-[#d7ddd9] bg-white px-3 py-2.5 text-sm text-[#17352b] transition outline-none focus:border-[#168c4d]"
                                                        >
                                                            {[...new Set([...variantTypeOptions, group.type])].map((option) => (
                                                                <option key={option} value={option}>
                                                                    {option}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariantGroup(group.id)}
                                                        className="mt-7 inline-flex items-center justify-center rounded-[8px] border border-[#dfe4e1] bg-white p-2 text-[#3d4b46]"
                                                        aria-label="Delete variant type"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="mb-2 text-xs font-semibold tracking-[0.08em] text-[#5c6b62] uppercase">
                                                        Variant Values
                                                    </div>
                                                    <div className="space-y-2">
                                                        {group.values.map((value) => (
                                                            <div key={value.id} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                                                <input
                                                                    value={value.value}
                                                                    onChange={(event) => {
                                                                        setVariantLocked(true);
                                                                        setVariantGroups((current) =>
                                                                            current.map((item) =>
                                                                                item.id === group.id
                                                                                    ? {
                                                                                          ...item,
                                                                                          values: item.values.map((entry) =>
                                                                                              entry.id === value.id
                                                                                                  ? { ...entry, value: event.target.value }
                                                                                                  : entry,
                                                                                          ),
                                                                                      }
                                                                                    : item,
                                                                            ),
                                                                        );
                                                                    }}
                                                                    placeholder={group.type}
                                                                    className="rounded-[10px] border border-[#d7ddd9] bg-white px-3 py-2.5 text-sm text-[#17352b] transition outline-none focus:border-[#168c4d]"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeVariantValue(group.id, value.id)}
                                                                    className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border border-[#dfe4e1] bg-white text-[#3d4b46]"
                                                                    aria-label="Delete value"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => addVariantValue(group.id)}
                                                        className="mt-3 inline-flex items-center gap-2 rounded-[8px] border border-[#dfe4e1] bg-white px-3 py-2 text-sm font-semibold text-[#17352b]"
                                                    >
                                                        <Plus size={14} /> Add value
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addVariantGroup}
                                            className="mt-2 inline-flex items-center gap-2 rounded-[8px] border border-[#dfe4e1] bg-white px-3 py-2 text-sm font-semibold text-[#17352b]"
                                        >
                                            <Plus size={14} /> Add variant type
                                        </button>
                                        {variantCombinations.length > 0 && (
                                            <div className="mt-5 border-t border-[#e7ebe8] pt-4">
                                                <div className="mb-3">
                                                    <div className="text-sm font-semibold text-[#17352b]">Variant price & inventory</div>
                                                    <p className="mt-1 text-xs text-[#66756f]">
                                                        Set a price and stock for every variant. Product total stock is calculated from these
                                                        quantities.
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    {variantCombinations.map((combination) => (
                                                        <div
                                                            key={combination.key}
                                                            className="grid gap-2 rounded-[8px] border border-[#e4e8e5] bg-white p-3 sm:grid-cols-[minmax(0,1fr)_130px_110px] sm:items-center"
                                                        >
                                                            <span className="min-w-0 text-sm font-medium text-[#3d4b46]">{combination.label}</span>
                                                            <label className="flex items-center gap-2 text-[11px] font-semibold text-[#65766a]">
                                                                <span>Price ₱</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={variantPrices[combination.key] ?? ''}
                                                                    onChange={(event) =>
                                                                        setVariantPrices((current) => ({
                                                                            ...current,
                                                                            [combination.key]: event.target.value,
                                                                        }))
                                                                    }
                                                                    aria-label={`Price for ${combination.label}`}
                                                                    placeholder={form.data.sale_price || form.data.base_price || '0.00'}
                                                                    className="w-full min-w-0 rounded-[8px] border border-[#d7ddd9] bg-white px-2.5 py-2 text-sm text-[#17352b] outline-none focus:border-[#168c4d]"
                                                                />
                                                            </label>
                                                            <label className="flex items-center gap-2 text-[11px] font-semibold text-[#65766a]">
                                                                <span>Stock</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="1"
                                                                    value={variantStocks[combination.key] ?? ''}
                                                                    onChange={(event) =>
                                                                        setVariantStocks((current) => ({
                                                                            ...current,
                                                                            [combination.key]: event.target.value,
                                                                        }))
                                                                    }
                                                                    aria-label={`Stock for ${combination.label}`}
                                                                    placeholder="0"
                                                                    className="w-full min-w-0 rounded-[8px] border border-[#d7ddd9] bg-white px-2.5 py-2 text-sm text-[#17352b] outline-none focus:border-[#168c4d]"
                                                                />
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                {form.errors.variant_prices && (
                                                    <p className="mt-2 text-xs font-medium text-[#a13b32]">{form.errors.variant_prices}</p>
                                                )}
                                                {form.errors.variant_stocks && (
                                                    <p className="mt-2 text-xs font-medium text-[#a13b32]">{form.errors.variant_stocks}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#edf0ee] bg-white px-5 py-4 sm:px-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-[10px] border border-[#d7ddd9] bg-white px-4 py-2.5 text-sm font-semibold text-[#17352b]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={saveProduct}
                                    className="rounded-[10px] bg-[#0d6f3c] px-4 py-2.5 text-sm font-semibold text-white"
                                >
                                    Save product
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </PortalLayout>
        </>
    );
}

function Field({
    label,
    type = 'text',
    value,
    error,
    onChange,
}: {
    label: string;
    type?: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="grid gap-2 text-sm font-semibold">
            <span>{label}</span>
            <input
                required={label !== 'Sale price'}
                type={type}
                min={type === 'number' ? '0' : undefined}
                step={label === 'Stock quantity' ? '1' : type === 'number' ? '0.01' : undefined}
                value={value}
                placeholder={fieldPlaceholder(label)}
                onChange={(event) => onChange(event.target.value)}
                className="border px-3 py-2.5 font-normal"
            />
            {error && <span className="text-xs text-[#a23b2d]">{error}</span>}
        </label>
    );
}

function fieldPlaceholder(label: string): string {
    const placeholders: Record<string, string> = {
        Name: 'e.g. Classic Cotton T-Shirt',
        Brand: 'e.g. Northline',
        Model: 'e.g. Classic 2026',
        'Base price': 'e.g. 499.00',
        'Sale price': 'e.g. 399.00 (optional)',
        'Stock quantity': 'e.g. 100',
        Color: 'e.g. Navy blue (optional)',
        Size: 'e.g. Medium (optional)',
        Material: 'e.g. 100% cotton (optional)',
        Weight: 'e.g. 250 g (optional)',
        Volume: 'e.g. 500 ml (optional)',
        'Pack quantity': 'e.g. 1',
        Length: 'e.g. 30 cm (optional)',
        Width: 'e.g. 25 cm (optional)',
        Height: 'e.g. 5 cm (optional)',
        Warranty: 'e.g. 6 months (optional)',
        'Country of origin': 'e.g. Philippines (optional)',
    };

    return placeholders[label] ?? `Enter ${label.toLowerCase()}`;
}
