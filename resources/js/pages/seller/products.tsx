import { PortalLayout, StatCard } from '@/components/portal-layout';
import { optimizeImages } from '@/lib/image-upload';
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
    image: File | null;
    images: File[];
    product_video: File | null;
    is_active: boolean;
};

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

function isKnownImageMime(file: File) {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
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
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const form = useForm<ProductForm>(blank);
    const visibleProducts = useMemo(
        () =>
            products.filter(
                (product) => product.name.toLowerCase().includes(search.toLowerCase()) || product.sku.toLowerCase().includes(search.toLowerCase()),
            ),
        [products, search],
    );
    const published = products.filter((product) => product.status === 'published').length;
    const lowStock = products.filter((product) => product.stock_quantity < 5).length;

    const show = (product?: Product) => {
        const isEditing = Boolean(product);

        setEditing(product ?? null);
        setOpen(true);
        setExistingImages(product?.images ?? []);
        setExistingVideo(product?.short_video_path ?? '');

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
            : { ...blank };

        form.setData(productForm);
        form.clearErrors();
    };
    const close = () => {
        setOpen(false);
        setEditing(null);
        setImageProcessing(false);
        setImageError('');
        setExistingImages([]);
        setExistingVideo('');
        if (cropImage) URL.revokeObjectURL(cropImage.url);
        setCropImage(null);
        setCropQueue([]);
        form.reset();
        form.clearErrors();
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
    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        if (!editing && !form.data.product_options.trim()) {
            form.setError('product_options', 'Add at least one product variant option, for example: Crop: Tomato, Lettuce.');
            return;
        }

        const options = { preserveScroll: true, forceFormData: true, onSuccess: close };
        form.transform((data) => (editing ? { ...data, _method: 'patch' } : data));
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

    const analyzeWithAi = async () => {
        const sourceImage = form.data.image ?? form.data.images[0] ?? null;

        if (!sourceImage) {
            setImageError('Please choose an image first before running AI analysis.');
            return;
        }

        if (!isKnownImageMime(sourceImage)) {
            setImageError('Please select a JPG, PNG, or WebP image for AI analysis.');
            return;
        }

        setAiAnalyzing(true);
        setImageError('');

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
            const formData = new FormData();
            formData.append('image', sourceImage);

            const response = await fetch(route('seller.products.ai-analyze'), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData,
            });

            const payload = await response.json();

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Unable to analyze this image right now. Please try again.');
            }

            const analysis = payload.data ?? {};

            form.setData('name', analysis.name ?? form.data.name);
            form.setData('description', analysis.description ?? form.data.description);
            form.setData('brand', analysis.brand ?? form.data.brand);
            form.setData('material', analysis.material ?? form.data.material);
            form.setData('color', analysis.colors?.[0] ?? form.data.color);
            form.setData('size', analysis.sizes?.join(', ') ?? form.data.size);
            form.setData(
                'product_options',
                analysis.options?.length
                    ? analysis.options
                          .map((option: { name?: string; values?: string[] }) => `${option.name}: ${option.values?.join(', ') ?? ''}`)
                          .join('\n')
                    : form.data.product_options,
            );

            if (analysis.category_id) {
                form.setData('category_id', String(analysis.category_id));
            } else {
                form.setData('category_id', '');
            }

            if (analysis.category_name) {
                form.setError('category_id', '');
            }

            setImageError('');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to analyze this image right now. Please try again.';
            setImageError(message);
        } finally {
            setAiAnalyzing(false);
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
                        onClick={() => show()}
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
                                    <th className="border-r border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">Brand</th>
                                    <th className="border-r border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">Category</th>
                                    <th className="border-r border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">Price</th>
                                    <th className="border-b border-[#ddd] px-3 py-3 text-left font-semibold whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf0eb]">
                                {visibleProducts.map((product) => {
                                    const image = product.images?.find((item) => item.is_primary) ?? product.images?.[0];
                                    const video = product.short_video_path ? `/storage/${product.short_video_path}` : '';
                                    const imageCount = product.images?.length ?? 0;
                                    const status = displayStatus(product.status);
                                    const active = statusClass(product.status);
                                    const createdAt = product.created_at
                                        ? new Date(product.created_at).toLocaleDateString('en-US', {
                                              day: 'numeric',
                                              month: 'short',
                                              year: 'numeric',
                                          })
                                        : '—';
                                    const isExpanded = viewProductId === product.id;
                                    const price = product.sale_price || product.base_price;

                                    return (
                                        <Fragment key={product.id}>
                                            <tr className="hover:bg-[#fafafa]">
                                                <td className="border-r border-b border-[#eee] px-3 py-3 align-middle whitespace-nowrap">
                                                    {image ? (
                                                        <img
                                                            src={`/storage/${image.path}`}
                                                            alt={product.name}
                                                            className="block h-16 w-16 shrink-0 rounded-[7px] border border-[#ddd] object-cover"
                                                        />
                                                    ) : (
                                                        <span className="flex h-16.25 w-16.25 items-center justify-center rounded-[7px] border border-[#ddd] bg-[#f5f5f5] text-[11px] text-[#888]">
                                                            <ImagePlus size={18} />
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="max-w-62.5 border-r border-b border-[#eee] px-3 py-3 align-middle font-semibold whitespace-normal">
                                                    {product.name}
                                                </td>
                                                <td className="border-r border-b border-[#eee] px-3 py-3 align-middle whitespace-nowrap text-[#657066]">
                                                    {product.brand ?? '—'}
                                                </td>
                                                <td className="border-r border-b border-[#eee] px-3 py-3 align-middle whitespace-nowrap text-[#657066]">
                                                    {product.category?.name ?? 'Uncategorized'}
                                                </td>
                                                <td className="border-r border-b border-[#eee] px-3 py-3 align-middle font-semibold whitespace-nowrap">
                                                    {formatMoney(price)}
                                                </td>
                                                <td className="border-b border-[#eee] px-3 py-3 align-middle whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewProductId(isExpanded ? null : product.id)}
                                                            className="rounded-[6px] border border-[#ddd] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#222] hover:bg-[#f5f5f5]"
                                                        >
                                                            <Eye size={13} className="mr-1 inline" /> {isExpanded ? 'Hide' : 'View'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => show(product)}
                                                            className="rounded-[6px] border border-[#ddd] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#222] hover:bg-[#f5f5f5]"
                                                        >
                                                            <Pencil size={13} className="mr-1 inline" /> Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                window.confirm(`Delete ${product.name}?`) &&
                                                                form.delete(route('seller.products.destroy', product.id), { preserveScroll: true })
                                                            }
                                                            className="rounded-[6px] border border-[#ddd] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#b00020] hover:bg-[#fff0f2]"
                                                        >
                                                            <Trash2 size={13} className="mr-1 inline" /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr key={`${product.id}-details`} className="bg-[#fafafa]">
                                                    <td colSpan={6} className="border-r border-b border-[#eee] px-3 py-4">
                                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    SKU
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.sku || '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Model
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.model ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Condition
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222] capitalize">
                                                                    {product.condition ?? 'new'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Stock
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.stock_quantity}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Selling Unit
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.selling_unit ?? 'Piece'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Barcode
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.barcode ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Color
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.color ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Size
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.size ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Material
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.material ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Weight
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.weight ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Volume
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.volume ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Pack Qty
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.pack_quantity ?? '1'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Length
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.length ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Width
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.width ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Height
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.height ?? '—'}</div>
                                                            </div>
                                                            <div className="md:col-span-2 xl:col-span-3">
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Description
                                                                </div>
                                                                <div className="mt-1 text-sm leading-5 text-[#222]">{product.description ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Warranty
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{product.warranty ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Country
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">
                                                                    {product.country_of_origin ?? 'Philippines'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Total Images
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">
                                                                    {imageCount} {imageCount === 1 ? 'image' : 'images'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Status
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{status}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Created At
                                                                </div>
                                                                <div className="mt-1 text-sm text-[#222]">{createdAt}</div>
                                                            </div>
                                                            <div className="md:col-span-2 xl:col-span-3">
                                                                <div className="text-[10px] font-semibold tracking-wide text-[#657066] uppercase">
                                                                    Product Video
                                                                </div>
                                                                <div className="mt-2">
                                                                    {video ? (
                                                                        <video
                                                                            src={video}
                                                                            controls
                                                                            className="h-23.75 w-42.5 rounded-[7px] border border-[#ddd] bg-black object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-[12px] text-[#999]">No video</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                                {visibleProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#657066]">
                                            {search ? 'No products match your search.' : 'No products yet. Add your first product to get started.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e2420]/35 p-5">
                        <form
                            noValidate
                            onSubmit={submit}
                            className="product-form grid max-h-[90vh] w-full max-w-3xl gap-4 overflow-y-auto border bg-white p-6"
                        >
                            <h1>{editing ? 'Edit product' : 'New product'}</h1>

                            <div className="form-group">
                                <label className="grid gap-2 text-sm font-semibold">
                                    <span>
                                        Product Images <span className="optional">*</span>
                                    </span>
                                    <label className="upload-box">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            multiple
                                            onChange={async (event) => {
                                                const selected = Array.from(event.target.files ?? []);
                                                const incoming = await optimizeImages(selected, { maxWidth: 2000, maxHeight: 2000 });
                                                if (!incoming.length) return;

                                                const unsupported = incoming.find((file) => !isKnownImageMime(file));
                                                if (unsupported) {
                                                    setImageError('Please select JPG, PNG, or WebP images.');
                                                    return;
                                                }

                                                setImageError('');

                                                const existing = form.data.images ?? [];
                                                const allImages = [...existing, ...incoming];
                                                const nextQueue = [...cropQueue, ...incoming];

                                                form.setData('images', allImages);
                                                if (!form.data.image || existing.length === 0) {
                                                    form.setData('image', incoming[0]);
                                                }

                                                setCropQueue(nextQueue);

                                                if (!cropImage) {
                                                    chooseCrop(nextQueue[0], allImages);
                                                }
                                            }}
                                        />
                                        <div className="upload-title">Upload Product Images</div>
                                        <div className="upload-text">Select multiple images. The first image will be the primary image.</div>
                                    </label>
                                    {imageError && <span className="text-xs font-normal text-[#a23b2d]">{imageError}</span>}
                                    <div className="flex items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={analyzeWithAi}
                                            disabled={aiAnalyzing}
                                            className="rounded-[6px] bg-[#1e2420] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
                                        >
                                            {aiAnalyzing ? 'Analyzing...' : '✨ Analyze with AI'}
                                        </button>
                                    </div>
                                    {form.data.image && (
                                        <img
                                            src={URL.createObjectURL(form.data.image)}
                                            alt="Cropped product preview"
                                            className="aspect-square h-32 w-32 rounded-xl object-cover"
                                        />
                                    )}
                                    {existingImages.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {existingImages.map((image, index) => (
                                                <img
                                                    key={`${image.path}-${index}`}
                                                    src={`/storage/${image.path}`}
                                                    alt="Current product"
                                                    className="aspect-square h-24 w-24 rounded-lg border object-cover"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {imageProcessing && <span className="text-xs font-normal text-[#657066]">Preparing crop...</span>}
                                    {form.errors.image && <span className="text-xs text-[#a23b2d]">{form.errors.image}</span>}
                                    <span className="help">JPG, PNG, or WebP. Maximum 5 MB. Select multiple images for the product gallery.</span>
                                    <div id="imagePreview" className="image-preview">
                                        <div className="flex flex-wrap gap-2">
                                            {form.data.images.length > 0 &&
                                                form.data.images.map((file, index) => {
                                                    const isPending = cropQueue.some((queued) => queued === file);
                                                    return (
                                                        <div key={`${file.name}-${index}`} className="relative">
                                                            <img
                                                                src={URL.createObjectURL(file)}
                                                                alt={file.name}
                                                                className="aspect-square h-16 w-16 rounded-lg border object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeQueuedImage(file)}
                                                                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#b00020] text-[10px] font-bold text-white"
                                                                aria-label={`Remove ${file.name}`}
                                                            >
                                                                ×
                                                            </button>
                                                            <span className="absolute top-0 left-0 rounded bg-black/70 px-1 text-[10px] text-white">
                                                                {isPending ? 'Pending' : 'Done'}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="grid gap-2 text-sm font-semibold">
                                    <span>
                                        Product Video <span className="optional">Optional</span>
                                    </span>
                                    <label className="upload-box">
                                        <input
                                            type="file"
                                            accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/3gpp"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0] ?? null;
                                                form.setData('product_video', file);
                                            }}
                                        />
                                        <div className="upload-title">Upload Short Product Video</div>
                                        <div className="upload-text">Maximum 60 seconds and 50 MB.</div>
                                    </label>
                                    <div id="videoPreview" className="video-preview">
                                        {form.data.product_video ? (
                                            <video
                                                src={URL.createObjectURL(form.data.product_video)}
                                                controls
                                                className="h-24 w-32 rounded-lg border object-cover"
                                            />
                                        ) : existingVideo ? (
                                            <video src={`/storage/${existingVideo}`} controls className="h-24 w-32 rounded-lg border object-cover" />
                                        ) : null}
                                    </div>
                                    {form.errors.product_video && <span className="text-xs text-[#a23b2d]">{form.errors.product_video}</span>}
                                    <span className="help">Optional short video: MP4, MOV, WebM, AVI, M4V, or 3GP. Maximum 10 MB.</span>
                                </label>
                            </div>

                            <h2>Basic information</h2>

                            <div className="grid-2">
                                <div className="form-group">
                                    <Field
                                        label="Name"
                                        value={form.data.name}
                                        error={form.errors.name}
                                        onChange={(value) => form.setData('name', value)}
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <Field label="Brand" value={form.data.brand} onChange={(value) => form.setData('brand', value)} />
                                </div>
                                <div className="form-group">
                                    <Field label="Model" value={form.data.model} onChange={(value) => form.setData('model', value)} />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="grid gap-2 text-sm font-semibold">
                                        <span>Category</span>
                                        <select
                                            value={form.data.category_id}
                                            onChange={(event) => form.setData('category_id', event.target.value)}
                                            className="border px-3 py-2.5 font-normal"
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {form.errors.category_id && <span className="text-xs text-[#a23b2d]">{form.errors.category_id}</span>}
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label className="grid gap-2 text-sm font-semibold">
                                        <span>Condition</span>
                                        <select
                                            value={form.data.condition}
                                            onChange={(event) => form.setData('condition', event.target.value)}
                                            className="border px-3 py-2.5 font-normal"
                                        >
                                            <option value="new">New</option>
                                            <option value="used">Used</option>
                                            <option value="refurbished">Refurbished</option>
                                        </select>
                                    </label>
                                </div>
                            </div>

                            <h2>Pricing & inventory</h2>

                            <div className="grid-3">
                                <div className="form-group">
                                    <Field
                                        label="Base price"
                                        type="number"
                                        value={form.data.base_price}
                                        error={form.errors.base_price}
                                        onChange={(value) => form.setData('base_price', value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <Field
                                        label="Sale price"
                                        type="number"
                                        value={form.data.sale_price}
                                        error={form.errors.sale_price}
                                        onChange={(value) => form.setData('sale_price', value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <Field
                                        label="Stock quantity"
                                        type="number"
                                        value={form.data.stock_quantity}
                                        error={form.errors.stock_quantity}
                                        onChange={(value) => form.setData('stock_quantity', value)}
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="grid gap-2 text-sm font-semibold">
                                        <span>Selling unit</span>
                                        <select
                                            value={form.data.selling_unit}
                                            onChange={(event) => form.setData('selling_unit', event.target.value)}
                                            className="border px-3 py-2.5 font-normal"
                                        >
                                            <option value="piece">Piece</option>
                                            <option value="kg">Kilogram</option>
                                            <option value="g">Gram</option>
                                            <option value="liter">Liter</option>
                                            <option value="ml">Milliliter</option>
                                            <option value="meter">Meter</option>
                                            <option value="cm">Centimeter</option>
                                            <option value="pack">Pack</option>
                                            <option value="box">Box</option>
                                            <option value="set">Set</option>
                                        </select>
                                    </label>
                                </div>
                            </div>

                            <h2>Product attributes</h2>

                            <div className="grid-3">
                                <div className="form-group">
                                    <Field label="Color" value={form.data.color} onChange={(value) => form.setData('color', value)} />
                                </div>
                                <div className="form-group">
                                    <Field label="Size" value={form.data.size} onChange={(value) => form.setData('size', value)} />
                                </div>
                                <div className="form-group">
                                    <Field label="Material" value={form.data.material} onChange={(value) => form.setData('material', value)} />
                                </div>
                            </div>

                            <div className="grid-3">
                                <div className="form-group">
                                    <Field label="Weight" value={form.data.weight} onChange={(value) => form.setData('weight', value)} />
                                </div>
                                <div className="form-group">
                                    <Field label="Volume" value={form.data.volume} onChange={(value) => form.setData('volume', value)} />
                                </div>
                                <div className="form-group">
                                    <Field
                                        label="Pack quantity"
                                        type="number"
                                        value={form.data.pack_quantity}
                                        onChange={(value) => form.setData('pack_quantity', value)}
                                    />
                                </div>
                            </div>

                            <h2>Dimensions</h2>

                            <div className="grid-3">
                                <div className="form-group">
                                    <Field label="Length" value={form.data.length} onChange={(value) => form.setData('length', value)} />
                                </div>
                                <div className="form-group">
                                    <Field label="Width" value={form.data.width} onChange={(value) => form.setData('width', value)} />
                                </div>
                                <div className="form-group">
                                    <Field label="Height" value={form.data.height} onChange={(value) => form.setData('height', value)} />
                                </div>
                            </div>

                            <h2>Additional specifications</h2>

                            <div id="attributeList">
                                <div className="attribute-row">
                                    <input
                                        type="text"
                                        name="attribute_name[]"
                                        placeholder="e.g. Sleeve type"
                                        className="border px-3 py-2.5 font-normal"
                                    />
                                    <input
                                        type="text"
                                        name="attribute_value[]"
                                        placeholder="e.g. Short sleeve"
                                        className="border px-3 py-2.5 font-normal"
                                    />
                                    <button type="button" className="border px-3 py-2 text-sm">
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <button type="button" className="add-button w-fit">
                                + Add specification
                            </button>

                            <h2>Product variants</h2>
                            <label className="form-group grid gap-2 text-sm font-semibold">
                                <span>Variant options {!editing && <span className="optional">*</span>}</span>
                                <textarea
                                    value={form.data.product_options}
                                    onChange={(event) => form.setData('product_options', event.target.value)}
                                    placeholder={'Crop: Tomato, Lettuce\nPack: 1 pack, 2 packs'}
                                    className="min-h-24 border px-3 py-2.5 font-normal"
                                    required={!editing}
                                />
                                <span className="help">
                                    {editing
                                        ? 'Use one option per line. Leave empty to use a default variant.'
                                        : 'Required. Use one option per line, for example Crop: Tomato, Lettuce or Pack: 1 pack, 2 packs.'}
                                </span>
                                {form.errors.product_options && <span className="text-xs text-[#a23b2d]">{form.errors.product_options}</span>}
                            </label>

                            <p className="help">SKU, barcode, and variant SKUs are generated automatically when the product is saved.</p>

                            <h2>Description</h2>

                            <label className="form-group grid gap-2 text-sm font-semibold">
                                <span>Description</span>
                                <textarea
                                    value={form.data.description}
                                    onChange={(event) => form.setData('description', event.target.value)}
                                    placeholder="e.g. Comfortable cotton T-shirt with a regular fit"
                                    className="min-h-24 border px-3 py-2.5 font-normal"
                                />
                                {form.errors.description && <span className="text-xs text-[#a23b2d]">{form.errors.description}</span>}
                            </label>

                            <h2>Other information</h2>

                            <div className="grid-2">
                                <div className="form-group">
                                    <Field label="Warranty" value={form.data.warranty} onChange={(value) => form.setData('warranty', value)} />
                                </div>
                                <div className="form-group">
                                    <Field
                                        label="Country of origin"
                                        value={form.data.country_of_origin}
                                        onChange={(value) => form.setData('country_of_origin', value)}
                                    />
                                </div>
                            </div>

                            <label className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(event) => form.setData('is_active', event.target.checked)}
                                />
                                <span>Product is active</span>
                            </label>

                            <div className="actions">
                                <button type="button" onClick={close} className="cancel">
                                    Cancel
                                </button>
                                <button type="submit" disabled={form.processing || imageProcessing || Boolean(cropImage)} className="save">
                                    {form.processing ? 'Saving...' : 'Save product'}
                                </button>
                            </div>
                        </form>
                        {cropImage && (
                            <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#1e2420]/55 p-5">
                                <div className="w-full max-w-md border bg-white p-6 shadow-2xl">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-serif text-2xl">Crop product image</h3>
                                            <p className="mt-1 text-sm text-[#657066]">Drag the image to frame the product.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                URL.revokeObjectURL(cropImage.url);
                                                setCropImage(null);
                                            }}
                                            className="text-sm text-[#657066]"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    <div
                                        className="relative mx-auto mt-6 aspect-square w-full max-w-80 touch-none overflow-hidden bg-[#e9f1e9]"
                                        onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
                                        onPointerMove={(event) => {
                                            if (event.buttons !== 1) return;
                                            setCropImage((current) =>
                                                current ? { ...current, x: current.x + event.movementX, y: current.y + event.movementY } : current,
                                            );
                                        }}
                                    >
                                        <img
                                            src={cropImage.url}
                                            alt="Crop preview"
                                            draggable={false}
                                            className="pointer-events-none absolute top-1/2 left-1/2 max-w-none select-none"
                                            style={{
                                                width: `${Math.max(320, (cropImage.width / cropImage.height) * 320) * cropImage.zoom}px`,
                                                transform: `translate(-50%, -50%) translate(${cropImage.x}px, ${cropImage.y}px)`,
                                            }}
                                        />
                                    </div>
                                    <label className="mt-5 grid gap-2 text-xs font-bold text-[#657066]">
                                        Zoom
                                        <input
                                            type="range"
                                            min="1"
                                            max="3"
                                            step="0.05"
                                            value={cropImage.zoom}
                                            onChange={(event) => setCropImage({ ...cropImage, zoom: Number(event.target.value) })}
                                        />
                                    </label>
                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            disabled={imageProcessing}
                                            onClick={applyAutoCrop}
                                            className="border border-[#b9d0ad] px-4 py-3 text-sm font-semibold text-[#2c7a3b] disabled:opacity-50"
                                        >
                                            Auto crop
                                        </button>
                                        <button
                                            type="button"
                                            disabled={imageProcessing}
                                            onClick={applyCrop}
                                            className="bg-[#1e2420] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                                        >
                                            {imageProcessing ? 'Preparing...' : 'Use this crop'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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
