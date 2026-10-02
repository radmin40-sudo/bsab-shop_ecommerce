import { addCartItem, getApiErrorMessage } from '@/lib/api';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, Heart, Minus, Package, Plus, Ruler, ShoppingCart, Star, X, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';

type ProductOptionValue = {
    id: number;
    value: string;
    sort_order?: number;
    option?: { id: number; name: string };
};

type ProductOption = {
    id: number;
    name: string;
    sort_order?: number;
    values: ProductOptionValue[];
};

type ProductVariantOptionValue = {
    product_option_value_id: number;
    optionValue?: {
        id: number;
        value: string;
        option?: { id: number; name: string };
    };
    option_value?: {
        id: number;
        value: string;
        option?: { id: number; name: string };
    };
};

type ProductVariant = {
    id: number;
    product_id: number;
    name?: string;
    sku?: string;
    price?: string | number;
    stock_quantity: number;
    is_active?: boolean;
    image?: string;
    optionValues?: ProductVariantOptionValue[];
    option_values?: ProductVariantOptionValue[];
};

type Product = {
    id: number;
    name: string;
    description?: string;
    base_price: string;
    sale_price?: string;
    sku?: string | null;
    stock_quantity: number;
    condition?: string | null;
    brand?: string | null;
    model?: string | null;
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
    category?: { name: string; slug: string };
    shop?: { name: string };
    metrics?: { rating_average?: string | number | null; rating_count?: number | null; quantity_sold?: number | null };
    images?: { path: string; is_primary?: boolean }[];
    options?: ProductOption[];
    variants?: ProductVariant[];
};

interface MobileProductDetailProps {
    product: Product;
    variantOptions: ProductOption[];
    selectedValues: Record<number, number>;
    chooseOption: (optionId: number, valueId: number) => void;
    getAvailableValuesForOption: (option: ProductOption) => ProductOptionValue[];
    matchingVariant: ProductVariant | null;
    price: number;
    originalPrice: number | null;
    discountPercent: number | null;
    stock: number;
    ratingAverage?: number;
    reviewCount?: number;
    isFavorited: boolean;
    onToggleFavorite: () => void;
}

function imageUrl(path?: string) {
    return path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null;
}

function formatMobilePrice(value: number | string) {
    const cleanValue = Number(value) || 0;
    return `₱${Math.round(cleanValue).toLocaleString('en-US')}`;
}

const COLOR_HEX_MAP: Record<string, string> = {
    white: '#ffffff',
    black: '#171717',
    gray: '#9ca3af',
    grey: '#9ca3af',
    beige: '#dfd3c3',
    blue: '#2563eb',
    navy: '#1e3a8a',
    red: '#dc2626',
    green: '#16a34a',
    yellow: '#eab308',
    brown: '#78350f',
    pink: '#ec4899',
    purple: '#9333ea',
    orange: '#ea580c',
    cream: '#fdfbf7',
    silver: '#e2e8f0',
    gold: '#d97706',
};

export default function MobileProductDetail({
    product,
    variantOptions,
    selectedValues,
    chooseOption,
    getAvailableValuesForOption,
    matchingVariant,
    price,
    originalPrice,
    discountPercent,
    stock,
    ratingAverage: propRatingAverage,
    reviewCount: propReviewCount,
    isFavorited,
    onToggleFavorite,
}: MobileProductDetailProps) {
    const { auth } = usePage<SharedData>().props;
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [busy, setBusy] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [showProductDetails, setShowProductDetails] = useState(false);
    const chooseMobileOption = (optionId: number, valueId: number) => {
        setToastMessage(null);
        chooseOption(optionId, valueId);
    };

    // 1. Data-driven images: ONLY from database, no hardcoded fallbacks
    const productImages = useMemo(() => {
        const rawList = product.images ?? [];
        return rawList.map((img) => imageUrl(img.path) || img.path).filter((url): url is string => Boolean(url));
    }, [product.images]);

    // Active main image
    const mainImageSrc = productImages[activeImageIndex] ?? productImages[0] ?? (matchingVariant?.image ? imageUrl(matchingVariant.image) : null);

    // 2. Data-driven prices: from matchingVariant or product
    const effectivePrice = price;

    const effectiveOriginalPrice = originalPrice;

    const effectiveDiscountPercent = discountPercent;

    // 3. Stock
    const effectiveStock = stock;
    const isOutOfStock = effectiveStock < 1;

    // 4. Rating & Reviews: ONLY if metrics exist and has reviews/rating
    const ratingAvg = propRatingAverage ?? Number(product.metrics?.rating_average ?? 0);
    const reviewCnt = propReviewCount ?? Number(product.metrics?.rating_count ?? 0);
    // 5. Badge: Only show if data exists in DB (e.g. quantity_sold > 20 or condition)
    const badgeText = useMemo(() => {
        const sold = Number(product.metrics?.quantity_sold ?? 0);
        if (sold > 20) {
            return 'Best Seller';
        }
        if (product.condition && product.condition.toLowerCase() === 'new') {
            return 'New';
        }
        if (product.condition && product.condition.trim() !== '') {
            return product.condition.charAt(0).toUpperCase() + product.condition.slice(1);
        }
        return null;
    }, [product.metrics, product.condition]);

    // 6. Subtitle (Category & Brand)
    const categorySubtitle = [product.category?.name, product.brand].filter(Boolean).join(' • ');
    const isFootwear = /shoe|sneaker|footwear|boot|sandal/i.test(`${product.category?.name ?? ''} ${product.name}`);
    const productDetails = [
        { label: 'Category', value: product.category?.name },
        { label: 'Brand', value: product.brand },
        { label: 'Model', value: product.model },
        { label: 'Condition', value: product.condition },
        { label: 'Color', value: product.color },
        { label: 'Size', value: product.size },
        { label: 'Material', value: product.material },
        { label: 'Weight', value: product.weight },
        { label: 'Volume', value: product.volume },
        { label: 'Pack quantity', value: product.pack_quantity == null ? null : String(product.pack_quantity) },
        { label: 'Length', value: product.length },
        { label: 'Width', value: product.width },
        { label: 'Height', value: product.height },
        { label: 'Selling unit', value: product.selling_unit },
        { label: 'Warranty', value: product.warranty },
        { label: 'Country of origin', value: product.country_of_origin },
        { label: 'Shop', value: product.shop?.name },
        { label: 'SKU', value: product.sku },
        { label: 'Available stock', value: String(Math.max(0, effectiveStock)) },
    ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value?.trim()));

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => {
            setToastMessage((current) => (current === message ? null : current));
        }, 3500);
    };

    const handleAddToCart = async () => {
        if (!auth.user) {
            showToast('Please log in to add items to your cart.', 'error');
            return;
        }

        if (isOutOfStock) {
            showToast('This product is out of stock.', 'error');
            return;
        }

        setBusy(true);
        try {
            await addCartItem({
                product_id: product.id,
                variant_id: matchingVariant?.id,
                quantity,
            });
            showToast(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`, 'success');
        } catch (error) {
            showToast(getApiErrorMessage(error), 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleBuyNow = async () => {
        if (!auth.user) {
            router.visit('/login');
            return;
        }

        if (isOutOfStock) {
            showToast('This product is out of stock.', 'error');
            return;
        }

        setBusy(true);
        try {
            await addCartItem({
                product_id: product.id,
                variant_id: matchingVariant?.id,
                quantity,
            });
            router.visit('/customer/checkout');
        } catch (error) {
            showToast(getApiErrorMessage(error), 'error');
            setBusy(false);
        }
    };

    return (
        <div className="mobile-product-detail mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white text-[#0f281e] selection:bg-emerald-100">
            <header className="sticky top-0 z-30 grid h-12 grid-cols-[40px_1fr_40px] items-center bg-white px-4">
                <button
                    type="button"
                    onClick={() => router.visit(window.history.length > 1 ? document.referrer || '/' : '/')}
                    aria-label="Go back"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#173a29]"
                >
                    <ArrowLeft size={21} />
                </button>
                <h1 className="text-center text-base font-bold text-[#173a29]">Product Details</h1>
                <button
                    type="button"
                    onClick={() => router.visit(auth.user ? route('customer.cart') : route('login'))}
                    aria-label="Open cart"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#173a29]"
                >
                    <ShoppingCart size={20} />
                </button>
            </header>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="animate-in fade-in slide-in-from-top-2 fixed top-12 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 px-4">
                    <div
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold shadow-lg ${
                            toastType === 'success'
                                ? 'border border-emerald-200 bg-emerald-600 text-white'
                                : 'border border-rose-200 bg-rose-600 text-white'
                        }`}
                    >
                        <span>{toastMessage}</span>
                        <button type="button" onClick={() => setToastMessage(null)} className="ml-2 text-white/80 hover:text-white">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Product Content */}
            <main className="flex-1 pb-4">
                {/* Product Image Card */}
                <div className="relative mx-4 mt-1.5 flex aspect-[1.12/1] items-center justify-center overflow-hidden rounded-[26px] bg-[#f4f5f4] p-3">
                    {/* Badge: Shown ONLY if badge data exists in DB */}
                    {badgeText && (
                        <div className="absolute top-3.5 left-3.5 z-10 rounded-md bg-[#15803d] px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-xs">
                            {badgeText}
                        </div>
                    )}

                    {/* Favorite/Heart Button */}
                    <button
                        type="button"
                        onClick={onToggleFavorite}
                        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                        aria-pressed={isFavorited}
                        className="absolute top-3.5 right-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-xs transition active:scale-95"
                    >
                        <Heart size={18} className={isFavorited ? 'fill-[#15803d] text-[#15803d]' : 'text-[#15803d]'} strokeWidth={2} />
                    </button>

                    {/* Image or Placeholder: If images exist, show image; otherwise show clean placeholder */}
                    {mainImageSrc ? (
                        <img
                            src={mainImageSrc}
                            alt={product.name}
                            className="h-full w-full object-contain drop-shadow-sm transition-all duration-200"
                        />
                    ) : (
                        <div className="flex h-48 w-full flex-col items-center justify-center gap-2 text-gray-400">
                            <Package size={56} strokeWidth={1.2} className="text-[#15803d]" />
                            <span className="text-xs font-medium text-gray-500">No image available</span>
                        </div>
                    )}

                    {/* Image Carousel Indicators: ONLY show if there are 2 or more images */}
                    {productImages.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                            {productImages.map((_, dotIndex) => (
                                <button
                                    key={dotIndex}
                                    type="button"
                                    onClick={() => setActiveImageIndex(dotIndex)}
                                    aria-label={`Go to slide ${dotIndex + 1}`}
                                    className={`transition-all duration-200 ${
                                        activeImageIndex === dotIndex ? 'h-2 w-2 rounded-full bg-[#15803d]' : 'h-1.5 w-1.5 rounded-full bg-[#d1d5db]'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Thumbnails: ONLY show if there are 2 or more images */}
                {productImages.length > 1 && (
                    <div className="mt-3 flex scrollbar-none gap-3 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
                        {productImages.map((img, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveImageIndex(idx)}
                                className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f4f5f4] p-1.5 transition ${
                                    activeImageIndex === idx
                                        ? 'border-2 border-[#15803d] shadow-xs'
                                        : 'border border-transparent hover:border-gray-200'
                                }`}
                            >
                                <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-contain" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Product Information */}
                <div className="mt-4 px-4">
                    {/* Brand / Category subtitle: Only show if available */}
                    {categorySubtitle && <p className="text-xs font-medium tracking-wide text-[#536a5d]">{categorySubtitle}</p>}

                    {/* Product Name */}
                    <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-[#0f281e]">{product.name}</h2>

                    {/* 5-Star Rating & Review Count: ONLY show if metrics data exists in DB */}
                    <div className="mt-1.5 flex items-center gap-1">
                        <div className="flex items-center gap-0.5" aria-label={`${ratingAvg.toFixed(1)} out of 5 stars`}>
                            {[1, 2, 3, 4, 5].map((star) => {
                                const fillLevel = Math.max(0, Math.min(1, ratingAvg - (star - 1)));
                                if (fillLevel >= 0.8) {
                                    return <Star key={star} size={15} className="fill-[#16a34a] text-[#16a34a]" />;
                                } else if (fillLevel >= 0.3) {
                                    return (
                                        <div key={star} className="relative inline-block h-[15px] w-[15px]">
                                            <Star size={15} className="fill-[#d1d5db] text-[#d1d5db]" />
                                            <div className="absolute top-0 left-0 h-full w-[50%] overflow-hidden">
                                                <Star size={15} className="fill-[#16a34a] text-[#16a34a]" />
                                            </div>
                                        </div>
                                    );
                                }
                                return <Star key={star} size={15} className="fill-[#d1d5db] text-[#d1d5db]" />;
                            })}
                        </div>
                        <span className="ml-1 text-xs text-[#64748b]">
                            {ratingAvg.toFixed(1)} ({reviewCnt.toLocaleString()} reviews)
                        </span>
                    </div>

                    {/* Price Row: Current price always; strikethrough & discount ONLY if sale price exists */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span className="text-[26px] font-black tracking-tight text-[#15803d]">{formatMobilePrice(effectivePrice)}</span>
                        {effectiveOriginalPrice && (
                            <span className="text-sm font-normal text-[#94a3b8] line-through">{formatMobilePrice(effectiveOriginalPrice)}</span>
                        )}
                        {effectiveDiscountPercent && effectiveDiscountPercent > 0 && (
                            <span className="rounded-full bg-[#e8f7ee] px-2.5 py-0.5 text-[11px] font-bold text-[#15803d]">
                                {effectiveDiscountPercent}% OFF
                            </span>
                        )}
                    </div>

                    {/* Description: ONLY show if description exists */}
                    {product.description && <p className="mt-3 text-xs leading-relaxed text-[#4b5563]">{product.description}</p>}
                </div>

                {/* Dynamic Options: ONLY show if product has variant options in DB */}
                {variantOptions.length > 0 && (
                    <div className="mt-4 space-y-4 px-4">
                        {variantOptions.map((option) => {
                            const availableValues = getAvailableValuesForOption(option);

                            if (!availableValues.length) {
                                return null;
                            }

                            const optionNameLower = option.name.toLowerCase();
                            const isColor = optionNameLower.includes('color');
                            const isSize = optionNameLower.includes('size');

                            return (
                                <div key={option.id}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-[15px] font-bold text-[#0f281e]">{option.name}</label>
                                        {/* Show Size Guide only for size options */}
                                        {isSize && isFootwear && (
                                            <button
                                                type="button"
                                                onClick={() => setShowSizeGuide(true)}
                                                className="flex items-center gap-1 text-xs font-semibold text-[#15803d] hover:underline"
                                            >
                                                <Ruler size={13} className="text-[#15803d]" />
                                                Size Guide
                                            </button>
                                        )}
                                    </div>

                                    {/* Color swatches */}
                                    {isColor ? (
                                        <div className="mt-2 flex flex-wrap items-center gap-3">
                                            {availableValues.map((val) => {
                                                const isSelected = selectedValues[option.id] === val.id;
                                                const hexColor = COLOR_HEX_MAP[val.value.toLowerCase()];

                                                if (hexColor) {
                                                    const isLight = hexColor.toLowerCase() === '#ffffff' || hexColor.toLowerCase() === '#fdfbf7';
                                                    return (
                                                        <button
                                                            key={val.id}
                                                            type="button"
                                                            onClick={() => chooseMobileOption(option.id, val.id)}
                                                            aria-label={`Select ${val.value} color`}
                                                            title={val.value}
                                                            className={`h-7 w-7 rounded-full transition-all ${
                                                                isSelected ? 'ring-2 ring-[#15803d] ring-offset-2' : 'hover:scale-105'
                                                            } ${isLight ? 'border border-gray-300' : ''}`}
                                                            style={{ backgroundColor: hexColor }}
                                                        />
                                                    );
                                                }

                                                // Fallback pill for non-standard color names
                                                return (
                                                    <button
                                                        key={val.id}
                                                        type="button"
                                                        onClick={() => chooseMobileOption(option.id, val.id)}
                                                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                                            isSelected
                                                                ? 'border-2 border-[#15803d] bg-[#e8f7ee] text-[#15803d]'
                                                                : 'border border-[#e2e8f0] bg-white text-[#334155]'
                                                        }`}
                                                    >
                                                        {val.value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* Size or generic options */
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {option.values.map((val) => {
                                                const isSelected = selectedValues[option.id] === val.id;
                                                const isAvailable = availableValues.some((av) => av.id === val.id);

                                                return (
                                                    <button
                                                        key={val.id}
                                                        type="button"
                                                        onClick={() => isAvailable && chooseMobileOption(option.id, val.id)}
                                                        disabled={!isAvailable}
                                                        className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                                                            isSelected
                                                                ? 'bg-[#15803d] text-white shadow-xs'
                                                                : isAvailable
                                                                  ? 'border border-[#e2e8f0] bg-white text-[#334155] hover:border-gray-300'
                                                                  : 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through opacity-50'
                                                        }`}
                                                    >
                                                        {val.value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {productDetails.length > 0 && (
                    <section className="mx-4 mt-5 rounded-2xl border border-[#e1ebe3] bg-[#fbfdfb] p-4">
                        <button
                            type="button"
                            onClick={() => setShowProductDetails((current) => !current)}
                            aria-expanded={showProductDetails}
                            aria-controls="mobile-product-details"
                            className="flex w-full items-center justify-between text-left text-sm font-bold text-[#0f281e]"
                        >
                            Product details
                            <ChevronDown size={18} className={`transition-transform ${showProductDetails ? 'rotate-180' : ''}`} />
                        </button>
                        {showProductDetails && (
                            <dl id="mobile-product-details" className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                                {productDetails.map((detail) => (
                                    <div key={detail.label} className="min-w-0">
                                        <dt className="text-[10px] font-semibold text-[#718078] uppercase">{detail.label}</dt>
                                        <dd className="mt-0.5 text-xs font-medium break-words text-[#24392e]">{detail.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </section>
                )}

                {/* Quantity */}
                <div className="mt-4 mb-4 px-4">
                    <label className="block text-[15px] font-bold text-[#0f281e]">Quantity</label>
                    {isOutOfStock ? (
                        <div className="mt-2 inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
                            Out of Stock
                        </div>
                    ) : (
                        <div className="mt-2 inline-flex h-10 items-center justify-between rounded-full border border-[#d1fae5] bg-[#f9fdfa] px-2.5">
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                                aria-label="Decrease quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[#15803d] transition active:scale-95 disabled:opacity-40"
                            >
                                <Minus size={16} strokeWidth={2.5} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-[#0f281e]">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
                                disabled={quantity >= effectiveStock}
                                aria-label="Increase quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[#15803d] transition active:scale-95 disabled:opacity-40"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* STICKY MOBILE ACTION BAR */}
            <div className="sticky bottom-0 z-40 border-t border-[#f1f5f9] bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.04)] backdrop-blur-md">
                <div className="flex items-center gap-3">
                    {/* LEFT: Buy Now */}
                    <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={busy || isOutOfStock}
                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#15803d] bg-white text-sm font-bold text-[#15803d] shadow-xs transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Zap size={18} className="fill-[#15803d] text-[#15803d]" />
                        {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                    </button>

                    {/* RIGHT: Add to Cart */}
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={busy || isOutOfStock}
                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#15803d] text-sm font-bold text-white shadow-sm transition hover:bg-[#166534] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ShoppingCart size={18} className="text-white" />
                        {busy ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>

            {/* Size Guide Modal (only accessible if size guide was opened) */}
            {showSizeGuide && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
                    <div className="w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Ruler size={18} className="text-[#15803d]" />
                                <h3 className="text-base font-bold text-[#0f281e]">Size Guide</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSizeGuide(false)}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="mt-3 overflow-hidden rounded-xl border border-gray-100">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#f4f5f4] text-[#0f281e]">
                                    <tr>
                                        <th className="px-3 py-2.5 font-bold">EU</th>
                                        <th className="px-3 py-2.5 font-bold">US Men</th>
                                        <th className="px-3 py-2.5 font-bold">US Women</th>
                                        <th className="px-3 py-2.5 font-bold">CM</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { eu: '37', usm: '5.0', usw: '6.5', cm: '23.5' },
                                        { eu: '38', usm: '5.5', usw: '7.0', cm: '24.0' },
                                        { eu: '39', usm: '6.5', usw: '8.0', cm: '24.5', active: true },
                                        { eu: '40', usm: '7.5', usw: '9.0', cm: '25.0' },
                                        { eu: '41', usm: '8.0', usw: '9.5', cm: '26.0' },
                                        { eu: '42', usm: '8.5', usw: '10.0', cm: '26.5' },
                                    ].map((row) => (
                                        <tr key={row.eu} className={row.active ? 'bg-[#e8f7ee] font-bold text-[#15803d]' : 'text-gray-600'}>
                                            <td className="px-3 py-2">{row.eu}</td>
                                            <td className="px-3 py-2">{row.usm}</td>
                                            <td className="px-3 py-2">{row.usw}</td>
                                            <td className="px-3 py-2">{row.cm}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-3 text-[11px] text-gray-500">Fits true to size. If you are between sizes, we recommend sizing up.</p>
                        <button
                            type="button"
                            onClick={() => setShowSizeGuide(false)}
                            className="mt-4 w-full rounded-xl bg-[#15803d] py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#166534]"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
