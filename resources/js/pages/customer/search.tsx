import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, Grid2X2, Heart, Home, Image as ImageIcon, Search, ShoppingCart, SlidersHorizontal, UserRound, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type Product = {
    id: number;
    name: string;
    base_price: string;
    sale_price?: string;
    category?: { name: string; slug: string };
    shop?: { name: string };
    images?: { path: string }[];
};

function imageUrl(path?: string) {
    return path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null;
}

export default function SearchPage({ query = '', products = [] }: { query?: string; products?: Product[] }) {
    const [search, setSearch] = useState(query);
    const { cartCount = 0 } = usePage<{ cartCount?: number }>().props;
    const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
    const [filterOpen, setFilterOpen] = useState(false);

    const sortedProducts = useMemo(() => {
        const list = [...products];
        if (sortBy === 'price-asc') {
            list.sort((a, b) => parseFloat(a.sale_price ?? a.base_price) - parseFloat(b.sale_price ?? b.base_price));
        } else if (sortBy === 'price-desc') {
            list.sort((a, b) => parseFloat(b.sale_price ?? b.base_price) - parseFloat(a.sale_price ?? a.base_price));
        }
        return list;
    }, [products, sortBy]);

    function submitSearch(event: React.FormEvent) {
        event.preventDefault();
        router.get(route('search'), { q: search.trim() }, { preserveState: true });
    }

    return (
        <>
            <Head title={query ? `Search results for ${query}` : 'Search products'} />
            <div className="min-h-screen bg-[#f5fcf7] text-[#17281d]">
                <header className="border-b border-[#def0e2] bg-white">
                    <div className="mx-auto flex max-w-4xl items-center gap-4 px-5 py-4 sm:px-8">
                        <Link href={route('home')} className="flex shrink-0 items-center gap-2" aria-label="BSABShop home">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b4332] text-[#52b788]">S</span>
                            <span className="font-display text-xl font-bold text-[#1b4332]">BSABShop</span>
                        </Link>
                        <form
                            onSubmit={submitSearch}
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-[#def0e2] bg-[#f5fcf7] px-4 py-2.5 focus-within:border-[#2c9350] focus-within:ring-4 focus-within:ring-[#e6f7eb]"
                        >
                            <Search size={16} className="shrink-0 text-[#647568]" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search for products..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-[#9fb6a6]"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="text-[#5c6e63] hover:text-[#173b2a]">
                                    <X size={15} />
                                </button>
                            )}
                            {/* Universal filter icon - mobile size only */}
                            <button
                                type="button"
                                onClick={() => setFilterOpen(true)}
                                className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#1b4332] transition hover:bg-[#eaf4ed] hover:text-[#1f7a42] active:scale-95 sm:hidden"
                                aria-label="Open filter options"
                                title="Filter & sort products"
                            >
                                <SlidersHorizontal size={17} strokeWidth={2.2} />
                                {sortBy !== 'default' && (
                                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#1f7a42] ring-2 ring-white" />
                                )}
                            </button>
                        </form>
                    </div>
                </header>
                <main className="mx-auto max-w-4xl px-5 py-8 pb-28 sm:px-8">
                    {query ? (
                        <div className="mb-6">
                            <p className="text-xs font-bold tracking-[0.18em] text-[#2c9350] uppercase">Search results</p>
                            <h1 className="font-display mt-2 text-3xl font-bold text-[#163b24]">Results for &ldquo;{query}&rdquo;</h1>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <h1 className="font-display text-3xl font-bold text-[#163b24]">Search products</h1>
                        </div>
                    )}
                    {sortedProducts.length ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {sortedProducts.map((product) => {
                                const image = imageUrl(product.images?.[0]?.path);
                                const price = product.sale_price ?? product.base_price;
                                return (
                                    <Link
                                        key={product.id}
                                        href={route('products.show', product.id)}
                                        className="group overflow-hidden rounded-2xl border border-[#def0e2] bg-white shadow-[0_6px_20px_rgba(22,59,36,0.06)] transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex aspect-square items-center justify-center bg-[#e6f7eb]">
                                            {image ? (
                                                <img src={image} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon size={48} className="text-[#2c9350]" />
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <p className="text-[10px] font-bold tracking-[0.06em] text-[#2c9350] uppercase">
                                                {product.category?.name ?? 'Marketplace'}
                                            </p>
                                            <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-[#163b24]">{product.name}</h2>
                                            <p className="mt-1 truncate text-xs text-[#647568]">{product.shop?.name ?? 'BSABShop seller'}</p>
                                            <p className="font-display mt-3 text-lg font-bold text-[#163b24]">₱{Number(price).toLocaleString()}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="border border-dashed border-[#b8d9c0] bg-white px-5 py-16 text-center">
                            <Search className="mx-auto text-[#2c9350]" />
                            <h2 className="font-display mt-4 text-xl font-bold text-[#163b24]">No products found</h2>
                            {query && <p className="mt-2 text-sm text-[#647568]">Try searching with a different product name.</p>}
                            <Link href={route('home')} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1f7a42]">
                                <ArrowLeft size={15} /> Back to marketplace
                            </Link>
                        </div>
                    )}
                </main>
                <nav
                    className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t border-[#def0e2] bg-white px-2 py-2.5 pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
                    aria-label="Bottom navigation"
                >
                    <Link href="/" className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#9a9aa5] transition hover:text-[#1f7a42]">
                        <Home size={19} />
                        Home
                    </Link>
                    <Link href="/customer/products" className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#9a9aa5] transition hover:text-[#1f7a42]">
                        <Grid2X2 size={19} />
                        Products
                    </Link>
                    <Link href="/customer/favorites" className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#9a9aa5] transition hover:text-[#1f7a42]">
                        <Heart size={19} />
                        Favorites
                    </Link>
                    <Link href="/customer/cart" className="relative flex flex-col items-center gap-1 text-[10px] font-semibold text-[#9a9aa5] transition hover:text-[#1f7a42]">
                        <ShoppingCart size={19} />
                        Cart
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 left-1/2 ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2a9b59] px-1 text-[9px] font-bold text-white">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>
                    <Link href="/customer/profile" className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#9a9aa5] transition hover:text-[#1f7a42]">
                        <UserRound size={19} />
                        Profile
                    </Link>
                </nav>

                {/* ── Mobile Filter & Sort Modal ── */}
                {filterOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs sm:hidden"
                        onClick={() => setFilterOpen(false)}
                    >
                        <div
                            className="w-full max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-[#def0e2] bg-white p-5 shadow-2xl transition-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-[#e5eee7] pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5ec] text-[#1f7a42]">
                                        <SlidersHorizontal size={16} strokeWidth={2.2} />
                                    </span>
                                    <h3 className="font-display text-base font-bold text-[#145437]">Sort Search Results</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFilterOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#5c6e63] hover:bg-[#f5fcf7]"
                                    aria-label="Close filters"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4 py-4 text-xs">
                                <div>
                                    <span className="block font-bold text-[#184c35] mb-2">Sort by</span>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'default', label: 'Default / Relevance' },
                                            { id: 'price-asc', label: 'Price: Low to High' },
                                            { id: 'price-desc', label: 'Price: High to Low' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => {
                                                    setSortBy(opt.id as any);
                                                    setFilterOpen(false);
                                                }}
                                                className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-xs font-semibold transition ${
                                                    sortBy === opt.id
                                                        ? 'border-[#1f7a42] bg-[#f0faf3] text-[#1f7a42]'
                                                        : 'border-[#dfeae2] bg-[#fbfdfb] text-[#5c6e63] hover:bg-white'
                                                }`}
                                            >
                                                <span>{opt.label}</span>
                                                {sortBy === opt.id && <Check size={16} className="text-[#1f7a42]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
