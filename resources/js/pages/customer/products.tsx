import { Head, router } from '@inertiajs/react';
import { Check, ChevronLeft, Heart, Home, Package, Search, ShoppingCart, SlidersHorizontal, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import '../../../css/design.css';
import ProductCard from '../../components/ProductCard';

/* ─── Types ─────────────────────────────────────────────── */
type Category = { id: number; name: string; slug: string };
type Product = {
    id: number;
    name: string;
    description?: string | null;
    base_price: string;
    sale_price?: string | null;
    stock_quantity: number;
    category?: { name: string; slug: string } | null;
    shop?: { name: string } | null;
    images?: { path: string }[];
};

/* ─── Page ───────────────────────────────────────────────── */
export default function CustomerProducts({ products = [], categories = [] }: { products?: Product[]; categories?: Category[] }) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [favorites, setFavorites] = useState<number[]>([]);
    const [sort, setSort] = useState('latest');
    const [popoverOpen, setPopoverOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    /* Close popover on outside click */
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setPopoverOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    /* Filtering + sorting */
    const filteredProducts = useMemo(() => {
        const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const result = products.filter((p) => {
            const text = [p.name, p.description, p.shop?.name, p.category?.name].filter(Boolean).join(' ').toLowerCase();
            return (category === 'all' || p.category?.slug === category) && (terms.length === 0 || terms.every((t) => text.includes(t)));
        });
        if (sort === 'price-low') return [...result].sort((a, b) => Number(a.sale_price ?? a.base_price) - Number(b.sale_price ?? b.base_price));
        if (sort === 'price-high') return [...result].sort((a, b) => Number(b.sale_price ?? b.base_price) - Number(a.sale_price ?? a.base_price));
        return result;
    }, [products, query, category, sort]);

    const inStock = products.filter((p) => p.stock_quantity > 0).length;

    const sortLabels: Record<string, string> = {
        latest: 'Newest first',
        'price-low': 'Price low→high',
        'price-high': 'Price high→low',
    };

    return (
        <>
            <Head title="Products – Fresh Arrivals" />

            <div className="wrap">
                {/* ── Top bar ─────────────────────────────── */}
                <div className="topbar">
                    <a href="/" className="icon-btn plain" aria-label="Back to home">
                        <ChevronLeft size={20} />
                    </a>

                    <div className="search-pill">
                        <Search size={16} />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search products, vendors…"
                            aria-label="Search products"
                        />
                    </div>

                    <button className="icon-btn accent" aria-label="Cart">
                        <ShoppingCart size={20} />
                        <span className="cart-badge">0</span>
                    </button>
                </div>

                {/* ── Title row ───────────────────────────── */}
                <div className="title-row">
                    <div className="title-group">
                        <h1>Fresh Arrivals</h1>
                        <span className="count-badge">{filteredProducts.length}</span>
                    </div>

                    {/* Sort popover */}
                    <div className="popover-anchor" ref={popoverRef}>
                        <button
                            className="icon-btn ghost"
                            aria-label="Sort options"
                            aria-expanded={popoverOpen}
                            onClick={() => setPopoverOpen((o) => !o)}
                        >
                            <SlidersHorizontal size={17} />
                        </button>

                        <div className={`popover${popoverOpen ? 'open' : ''}`}>
                            <h3>Sort by</h3>
                            {(['latest', 'price-low', 'price-high'] as const).map((opt) => (
                                <button
                                    key={opt}
                                    className={`sort-opt${sort === opt ? 'active' : ''}`}
                                    onClick={() => {
                                        setSort(opt);
                                        setPopoverOpen(false);
                                    }}
                                >
                                    {sortLabels[opt]}
                                    {sort === opt && <Check size={14} />}
                                </button>
                            ))}
                            <div className="divider" />
                            <p className="avail-note">
                                {inStock} of {products.length} items in stock
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Category chips ──────────────────────── */}
                <div className="chip-row">
                    <button className={`chip${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
                        All
                    </button>
                    {categories.map((cat) => (
                        <button key={cat.id} className={`chip${category === cat.slug ? 'active' : ''}`} onClick={() => setCategory(cat.slug)}>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* ── Product grid ────────────────────────── */}
                <div className="grid">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => {
                            const liked = favorites.includes(product.id);
                            return (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    liked={liked}
                                    onToggleFavorite={() =>
                                        setFavorites((cur) => (liked ? cur.filter((id) => id !== product.id) : [...cur, product.id]))
                                    }
                                    onOpenProduct={() => router.visit(route('products.show', product.id))}
                                />
                            );
                        })
                    ) : (
                        <div className="empty-state">No products match your search.</div>
                    )}
                </div>
            </div>

            {/* ── Bottom nav (mobile/tablet only) ────────── */}
            <nav className="bottom-nav">
                <a href="/" className="bottom-nav-item">
                    <Home size={22} />
                    <span>Home</span>
                </a>
                <a href="/customer/products" className="bottom-nav-item active">
                    <Package size={22} />
                    <span>Products</span>
                </a>
                <a href="/customer/favorites" className="bottom-nav-item">
                    <Heart size={22} />
                    <span>Favorites</span>
                </a>
                <a href="/customer/cart" className="bottom-nav-item">
                    <ShoppingCart size={22} />
                    <span>Cart</span>
                </a>
                <a href="/customer/account" className="bottom-nav-item">
                    <User size={22} />
                    <span>Account</span>
                </a>
            </nav>
        </>
    );
}
