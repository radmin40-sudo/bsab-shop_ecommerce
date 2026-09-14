import { PortalLayout } from '@/components/portal-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Heart, ShoppingCart, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Product = {
    id: number;
    name: string;
    base_price: string;
    sale_price?: string;
    stock_quantity: number;
    status: string;
    is_approved: boolean;
    category?: { name: string; slug: string };
    shop?: { name: string };
    images?: { path: string }[];
};

// Distinct muted colours for initials placeholders
const PLACEHOLDER_COLORS = ['#3d5a7a', '#5c3b2e', '#2e5c3b', '#5c3b5a', '#3b4e5c', '#7a5c2e', '#4b3d7a', '#5c4b2e'];
function getPlaceholderColor(id: number) {
    return PLACEHOLDER_COLORS[id % PLACEHOLDER_COLORS.length];
}
function getInitials(name: string) {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}
function formatPrice(price: number | string) {
    return '₱' + Number(price).toLocaleString('en-PH', { maximumFractionDigits: 0 });
}

function readFavorites(): number[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(window.localStorage.getItem('sprig-favorites') || '[]') as number[];
    } catch {
        return [];
    }
}

type Toast = { id: number; message: string; undoFn?: () => void };
let _toastId = 0;

export default function CustomerFavorites({ products = [] }: { products?: Product[] }) {
    const [favoriteIds, setFavoriteIds] = useState<number[]>(readFavorites);
    const [removing, setRemoving] = useState<Set<number>>(new Set());
    const [toast, setToast] = useState<Toast | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Try to read cart count from Inertia shared props
    const { props } = usePage<{ cartCount?: number }>();
    const cartCount = (props as any).cartCount ?? 0;

    const favorites = useMemo(() => products.filter((p) => favoriteIds.includes(p.id)), [favoriteIds, products]);

    useEffect(() => {
        window.localStorage.setItem('sprig-favorites', JSON.stringify(favoriteIds));
    }, [favoriteIds]);

    function showToast(message: string, undoFn?: () => void) {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        const id = ++_toastId;
        setToast({ id, message, undoFn });
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    }

    function dismissToast() {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(null);
    }

    function removeFavorite(productId: number) {
        const removedIndex = favoriteIds.indexOf(productId);
        setRemoving((prev) => new Set(prev).add(productId));
        setTimeout(() => {
            setFavoriteIds((cur) => cur.filter((id) => id !== productId));
            setRemoving((prev) => {
                const n = new Set(prev);
                n.delete(productId);
                return n;
            });
            showToast('Removed from favorites', () => {
                setFavoriteIds((cur) => {
                    const next = cur.filter((id) => id !== productId);
                    next.splice(removedIndex, 0, productId);
                    return next;
                });
                dismissToast();
            });
        }, 200);
    }

    function clearAll() {
        setFavoriteIds([]);
        showToast('All favorites cleared');
    }

    return (
        <>
            <Head title="Favorites" />
            <PortalLayout role="customer" hideHeader>
                {/* Top nav */}
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href={route('marketplace')}
                        className="flex items-center gap-1.5 text-sm font-medium text-[#4a5568] transition-colors hover:text-[#163b24]"
                    >
                        <ArrowLeft size={16} />
                        Back to shop
                    </Link>
                    <Link
                        href={route('customer.cart')}
                        className="flex items-center gap-2 rounded-full border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-[#163b24] shadow-sm transition-shadow hover:shadow"
                    >
                        <ShoppingCart size={16} />
                        Cart
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2c9350] text-[10px] font-bold text-white">
                            {cartCount}
                        </span>
                    </Link>
                </div>

                {/* Page header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#163b24]">Favorites</h1>
                    {favorites.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap items-start justify-between gap-2">
                            <p className="text-sm text-[#647568]">
                                {favorites.length} product{favorites.length !== 1 ? 's' : ''} you've saved — add them to your cart or let them go
                                anytime.
                            </p>
                            <button
                                onClick={clearAll}
                                className="shrink-0 text-sm text-[#647568] underline-offset-2 transition-colors hover:text-[#163b24] hover:underline"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Grid */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 gap-5.5 sm:grid-cols-3 lg:grid-cols-4">
                        {favorites.map((product) => {
                            const rawImage = product.images?.[0]?.path;
                            const imgSrc = rawImage
                                ? rawImage.startsWith('http') || rawImage.startsWith('/')
                                    ? rawImage
                                    : `/storage/${rawImage}`
                                : null;

                            const basePrice = Number(product.base_price);
                            const salePrice = product.sale_price ? Number(product.sale_price) : null;
                            const hasSale = salePrice !== null && salePrice < basePrice;
                            const displayPrice = hasSale ? salePrice! : basePrice;
                            const discountPct = hasSale ? Math.round((1 - salePrice! / basePrice) * 100) : 0;

                            const isFading = removing.has(product.id);
                            return (
                                <article
                                    key={product.id}
                                    onClick={() => router.visit(route('products.show', product.id))}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            router.visit(route('products.show', product.id));
                                        }
                                    }}
                                    role="link"
                                    tabIndex={0}
                                    className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(22,59,36,0.08)]"
                                    style={{
                                        opacity: isFading ? 0 : 1,
                                        transform: isFading ? 'scale(0.95)' : 'scale(1)',
                                        transition: 'opacity 200ms ease, transform 200ms ease',
                                    }}
                                >
                                    {/* Image / placeholder */}
                                    <div className="relative aspect-4/3 w-full overflow-hidden">
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="flex h-full w-full items-center justify-center"
                                                style={{ backgroundColor: getPlaceholderColor(product.id) }}
                                            >
                                                <span className="text-2xl font-bold tracking-wider text-white/80">{getInitials(product.name)}</span>
                                            </div>
                                        )}
                                        {/* Heart / remove button */}
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                removeFavorite(product.id);
                                            }}
                                            className="absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2c9350] shadow-md transition-transform hover:scale-110"
                                            aria-label={`Remove ${product.name} from favorites`}
                                        >
                                            <Heart size={16} fill="currentColor" />
                                        </button>
                                    </div>

                                    {/* Card body */}
                                    <div className="flex flex-1 flex-col p-4">
                                        <span className="text-[11px] font-bold tracking-wide text-[#2c9350] uppercase">
                                            {product.category?.name ?? 'Marketplace'}
                                        </span>
                                        <h2 className="mt-1 line-clamp-2 text-sm leading-snug font-bold text-[#163b24]">{product.name}</h2>
                                        <p className="mt-0.5 truncate text-xs text-[#8a9490]">Sold by {product.shop?.name ?? 'BSABShop Seller'}</p>

                                        {/* Price */}
                                        <div className="mt-3 flex flex-wrap items-baseline gap-1.5">
                                            <span className="text-lg font-extrabold text-[#163b24]">{formatPrice(displayPrice)}</span>
                                            {hasSale && (
                                                <>
                                                    <span className="text-xs text-[#9ca3af] line-through">{formatPrice(basePrice)}</span>
                                                    <span className="rounded-full bg-[#dcfce7] px-1.5 py-0.5 text-[10px] font-bold text-[#2c9350]">
                                                        -{discountPct}%
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty state */
                    <section className="flex flex-col items-center justify-center rounded-3xl border border-[#e5e7eb] bg-white px-8 py-20 text-center shadow-sm">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdf4] text-[#2c9350]">
                            <Heart size={32} strokeWidth={1.5} />
                        </div>
                        <h2 className="mt-5 text-2xl font-bold text-[#163b24]">No favorites yet</h2>
                        <p className="mt-2 max-w-xs text-sm text-[#647568]">Save products from the marketplace and they will appear here.</p>
                        <Link
                            href={route('marketplace')}
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2c9350] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#247a43]"
                        >
                            Browse products
                        </Link>
                    </section>
                )}

                {/* Toast */}
                {toast && (
                    <div
                        key={toast.id}
                        className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#1a2e1f] px-5 py-3 text-sm text-white shadow-xl"
                        style={{ animation: 'favFadeInUp 0.2s ease' }}
                    >
                        <span>{toast.message}</span>
                        {toast.undoFn && (
                            <button onClick={toast.undoFn} className="font-bold text-[#4ade80] transition-colors hover:text-[#86efac]">
                                Undo
                            </button>
                        )}
                        <button onClick={dismissToast} className="ml-1 text-white/60 transition-colors hover:text-white" aria-label="Dismiss">
                            <X size={14} />
                        </button>
                    </div>
                )}
                <style>{`
                    @keyframes favFadeInUp {
                        from { opacity: 0; transform: translate(-50%, 10px); }
                        to   { opacity: 1; transform: translate(-50%, 0); }
                    }
                `}</style>
            </PortalLayout>
        </>
    );
}
