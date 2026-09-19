import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Dumbbell,
    Gift,
    Grid2X2,
    Heart,
    Home,
    LogOut,
    Package,
    Search,
    Settings,
    Shirt,
    ShoppingCart,
    Smartphone,
    Sofa,
    Sparkles,
    Star,
    UserRound,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Category = { id: number; name: string; slug: string; image?: string | null; products_count: number };
type Product = {
    id: number;
    name: string;
    description?: string;
    base_price: string;
    sale_price?: string;
    stock_quantity: number;
    selling_unit?: string | null;
    reviews_count?: number;
    status: string;
    is_approved: boolean;
    category?: { name: string; slug: string };
    shop?: { name: string };
    images?: { path: string }[];
};
type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high';

const categoryColors = ['#e4efe7', '#e8eee3', '#f4e8d9', '#e4edf0', '#f1e7df', '#e8efe1'];

function avatarUrl(avatar?: string) {
    return avatar ? (avatar.startsWith('http') || avatar.startsWith('/') ? avatar : `/storage/${avatar}`) : null;
}

function imageUrl(path?: string | null) {
    return path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null;
}

function getCategoryFallbackIcon(categoryName: string) {
    const normalized = categoryName.toLowerCase();

    if (/(fashion|clothing|wear|style|apparel)/.test(normalized)) return Shirt;
    if (/(electronics|tech|mobile|phone|computer|gadget)/.test(normalized)) return Smartphone;
    if (/(home|furniture|living|interior|decor)/.test(normalized)) return Sofa;
    if (/(sport|fitness|gym|active)/.test(normalized)) return Dumbbell;
    if (/(gift|promo|offer|special)/.test(normalized)) return Gift;

    return Grid2X2;
}

export default function Welcome({
    categories = [],
    products = [],
    siteSettings = {},
}: {
    categories?: Category[];
    products?: Product[];
    siteSettings?: Record<string, string | null>;
}) {
    const { auth } = usePage<SharedData>().props;
    const brandName = siteSettings.brand_name || 'BSABShop';
    const logoPath = siteSettings.logo_path ? imageUrl(siteSettings.logo_path) : null;
    const heroMediaPath = siteSettings.hero_media_path ? imageUrl(siteSettings.hero_media_path) : null;
    const heroMediaType = siteSettings.hero_media_type;
    const heroTitle = siteSettings.hero_title || 'Best picks.';
    const heroHighlight = siteSettings.hero_highlight || 'Best prices.';
    const heroDescription = siteSettings.hero_description || 'Discover products from every category, curated by our marketplace sellers.';
    const ctaLabel = siteSettings.cta_label || 'Shop now';
    const featureOne = siteSettings.feature_one || 'Fresh & Quality Products';
    const featureTwo = siteSettings.feature_two || 'Trusted Sellers';
    const featureThree = siteSettings.feature_three || 'Fast & Safe Delivery';
    const productsTitle = siteSettings.products_title || 'Featured Products';
    const productsSubtitle = siteSettings.products_subtitle || 'Handpicked for you. Quality products at the best prices.';
    const footerText = siteSettings.footer_text || '© 2026 BSABShop Marketplace - every price, checked twice.';
    const footerTagline = siteSettings.footer_tagline || 'A greener marketplace for a better tomorrow.';
    const footerQuickLinksTitle = siteSettings.footer_quick_links_title || 'Quick Links';
    const footerCareTitle = siteSettings.footer_care_title || 'Customer Care';
    const footerAboutTitle = siteSettings.footer_about_title || 'About our marketplace';
    const footerNewsletterTitle = siteSettings.footer_newsletter_title || 'Stay in the loop';
    const footerNewsletterText = siteSettings.footer_newsletter_text || 'Get the latest deals and updates.';
    const newsletterPlaceholder = siteSettings.newsletter_placeholder || 'Enter your email address';
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [showNewOnly, setShowNewOnly] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('popular');
    const [liked, setLiked] = useState<number[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(window.localStorage.getItem('sprig-favorites') || '[]');
        } catch {
            return [];
        }
    });
    const [accountOpen, setAccountOpen] = useState(false);
    const searchableText = (product: Product) =>
        [product.name, product.description, product.category?.name, product.shop?.name].filter(Boolean).join(' ').toLowerCase();
    const visibleProducts = useMemo(
        () =>
            products.filter(
                (product) =>
                    (activeCategory === 'all' || product.category?.slug === activeCategory) &&
                    search
                        .trim()
                        .toLowerCase()
                        .split(/\s+/)
                        .filter(Boolean)
                        .every((term) => searchableText(product).includes(term)),
            ),
        [activeCategory, products, search],
    );
    const searchResults = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return visibleProducts;
        return visibleProducts.filter((product) =>
            query
                .split(/\s+/)
                .filter(Boolean)
                .every((term) => searchableText(product).includes(term)),
        );
    }, [search, visibleProducts]);
    const recommendations = useMemo(() => {
        if (!search.trim() || !searchResults.length) return [];
        const categorySlug = searchResults[0].category?.slug;
        return products
            .filter((product) => product.id !== searchResults[0].id && (!categorySlug || product.category?.slug === categorySlug))
            .slice(0, 4);
    }, [products, search, searchResults]);

    const productFeed = useMemo(() => {
        const sourceProducts = search.trim() ? searchResults : products;
        const filteredProducts = sourceProducts.filter(
            (product) => activeCategory === 'all' || product.category?.slug === activeCategory,
        );

        if (sortOption === 'price-low' || sortOption === 'price-high') {
            return [...filteredProducts].sort((first, second) => {
                const firstPrice = Number(first.sale_price ?? first.base_price);
                const secondPrice = Number(second.sale_price ?? second.base_price);
                return sortOption === 'price-low' ? firstPrice - secondPrice : secondPrice - firstPrice;
            });
        }

        return showNewOnly ? filteredProducts.slice(0, 20) : filteredProducts;
    }, [activeCategory, products, search, searchResults, showNewOnly, sortOption]);

    function openProduct(product: Product) {
        router.visit(route('products.show', product.id));
    }

    function toggleFavorite(productId: number) {
        setLiked((current) => {
            const next = current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId];
            window.localStorage.setItem('sprig-favorites', JSON.stringify(next));
            return next;
        });
    }

    function submitSearch(event: React.FormEvent) {
        event.preventDefault();
        router.get(route('search'), { q: search.trim() }, { preserveState: true });
    }

    return (
        <>
            <Head title={`${brandName} Marketplace - Best Picks, Best Prices`} />
            <div className="min-h-screen bg-[#f7fbf7] text-[#173b2a] antialiased">
                <header className="border-b border-[#e5eee7] bg-white">
                    <div className="mx-auto flex w-full max-w-110 flex-wrap items-center gap-3 px-4 py-3 sm:max-w-195 sm:px-5 lg:max-w-7xl lg:flex-nowrap lg:gap-5 lg:px-8">
                        <Link href={route('home')} className="flex shrink-0 items-center gap-2" aria-label={`${brandName} home`}>
                            {logoPath ? (
                                <img src={logoPath} alt={brandName} className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                                <span className="flex h-9 w-9 items-center justify-center rounded-full text-[#25804a]">
                                    <Sparkles size={18} />
                                </span>
                            )}
                            <span className="font-display text-xl font-bold text-[#145c3d]">{brandName}</span>
                        </Link>
                        <nav className="hidden items-center gap-1 sm:ml-auto lg:flex" aria-label="Desktop navigation">
                            <Link
                                href={route('home')}
                                className="flex items-center gap-1.5 border-b-2 border-[#2d9960] px-3 py-2 text-xs font-semibold text-[#1f7a42]"
                            >
                                <Home size={15} /> Home
                            </Link>
                            <Link
                                href={auth.user ? route('customer.products') : route('login')}
                                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-[#647568] hover:bg-[#f5fcf7]"
                            >
                                <Grid2X2 size={15} /> Products
                            </Link>
                            <Link
                                href={auth.user ? route('customer.orders') : route('login')}
                                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-[#647568] hover:bg-[#f5fcf7]"
                            >
                                <Package size={15} /> Orders
                            </Link>
                            <Link
                                href={auth.user ? route('customer.favorites') : route('login')}
                                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-[#647568] hover:bg-[#f5fcf7]"
                            >
                                <Heart size={15} /> Favorites
                            </Link>
                        </nav>
                        <form
                            onSubmit={submitSearch}
                            className="order-2 flex w-full items-center gap-2 rounded-full border border-[#dfeae2] bg-[#fbfdfb] px-4 py-2.5 focus-within:border-[#2c9350] focus-within:ring-4 focus-within:ring-[#e6f7eb] sm:order-1 sm:w-auto sm:max-w-130 sm:flex-1 lg:order-2 lg:mx-0 lg:my-0 lg:max-w-155"
                        >
                            <Search size={16} className="shrink-0 text-[#647568]" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search for products, brands and more..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-[#5c6e63]"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                                    <X size={15} className="text-[#5c6e63]" />
                                </button>
                            )}
                        </form>
                        <div className="order-1 ml-auto flex items-center justify-end gap-2 sm:order-2 sm:ml-5 lg:hidden">
                            <Link
                                href={route('customer.cart')}
                                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#dfeae2] bg-[#f5fcf7] text-[#1b4332] shadow-sm transition hover:bg-[#edf9f0]"
                                aria-label="Open cart"
                            >
                                <ShoppingCart size={18} strokeWidth={2.2} />
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2a9b59] px-1 text-[9px] font-bold text-white">
                                    0
                                </span>
                            </Link>

                            {auth.user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setAccountOpen(!accountOpen)}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfeae2] bg-[#f5fcf7] text-[#1b4332] shadow-sm transition hover:bg-[#edf9f0]"
                                        aria-label="Open account menu"
                                        aria-expanded={accountOpen}
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#52b788] text-[10px] font-bold text-[#1b4332]">
                                            {avatarUrl(auth.user.avatar) ? (
                                                <img
                                                    src={avatarUrl(auth.user.avatar) as string}
                                                    alt={auth.user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                auth.user.name.slice(0, 2).toUpperCase()
                                            )}
                                        </span>
                                    </button>
                                    {accountOpen && (
                                        <div className="absolute top-12 right-0 z-20 w-44 rounded-xl border border-[#def0e2] bg-white p-1.5 shadow-[0_8px_25px_rgba(22,59,36,0.1)]">
                                            <Link
                                                href={route('customer.account')}
                                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[#f5fcf7]"
                                            >
                                                <UserRound size={16} /> Account
                                            </Link>
                                            <Link
                                                href={route('customer.settings')}
                                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[#f5fcf7]"
                                            >
                                                <Settings size={16} /> Settings
                                            </Link>
                                            <hr className="my-1 border-[#def0e2]" />
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#d96c5a] hover:bg-[#fdf0ed]"
                                            >
                                                <LogOut size={16} /> Log out
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center justify-center rounded-full bg-[#1f7a42] px-4 py-2 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(31,122,66,0.18)] ring-2 ring-[#edf8f0] transition hover:bg-[#186a3a]"
                                >
                                    Log in
                                </Link>
                            )}
                        </div>
                        <div className="order-1 ml-auto hidden items-center justify-end gap-2 sm:order-2 sm:ml-5 lg:order-3 lg:ml-0 lg:flex">
                            {auth.user ? (
                                <>
                                    <Link
                                        href={route('customer.cart')}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#def0e2] bg-white text-[#1b4332] transition hover:bg-[#f5fcf7]"
                                        aria-label="Open cart"
                                    >
                                        <ShoppingCart size={17} />
                                    </Link>
                                    <div className="relative">
                                        <button
                                            onClick={() => setAccountOpen(!accountOpen)}
                                            className="flex items-center gap-2 rounded-full border border-[#def0e2] bg-white px-2.5 py-1.5 text-[#1b4332] shadow-sm transition hover:bg-[#f5fcf7]"
                                            aria-label="Open account menu"
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#52b788] text-[10px] font-bold text-[#1b4332]">
                                                {avatarUrl(auth.user.avatar) ? (
                                                    <img
                                                        src={avatarUrl(auth.user.avatar) as string}
                                                        alt={auth.user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    auth.user.name.slice(0, 2).toUpperCase()
                                                )}
                                            </span>
                                        </button>
                                        {accountOpen && (
                                            <div className="absolute top-12 right-0 z-20 w-44 rounded-xl border border-[#def0e2] bg-white p-1.5 shadow-[0_8px_25px_rgba(22,59,36,0.1)]">
                                                <Link
                                                    href={route('customer.account')}
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[#f5fcf7]"
                                                >
                                                    <UserRound size={16} /> Account
                                                </Link>
                                                <Link
                                                    href={route('customer.settings')}
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[#f5fcf7]"
                                                >
                                                    <Settings size={16} /> Settings
                                                </Link>
                                                <hr className="my-1 border-[#def0e2]" />
                                                <Link
                                                    href={route('logout')}
                                                    method="post"
                                                    as="button"
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#d96c5a] hover:bg-[#fdf0ed]"
                                                >
                                                    <LogOut size={16} /> Log out
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center justify-center rounded-full bg-[#1f7a42] px-4 py-2 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(31,122,66,0.18)] ring-2 ring-[#edf8f0] transition hover:bg-[#186a3a] sm:px-5 sm:py-2.5"
                                >
                                    Log in
                                </Link>
                            )}
                        </div>
                    </div>
                </header>
                <main className="mx-auto flex max-w-310 flex-col px-5 pb-24 sm:px-8 lg:pb-12">
                    <nav
                        className="order-2 mt-3 flex scrollbar-none gap-3 overflow-x-auto rounded-2xl border border-[#e3eee6] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(38,104,63,0.04)] [&::-webkit-scrollbar]:hidden"
                        aria-label="Product categories"
                    >
                        <button
                            onClick={() => setActiveCategory('all')}
                            className="flex min-w-17 shrink-0 flex-col items-center gap-1.5 text-[10px] font-semibold text-[#1b4332]"
                        >
                            <span
                                className={`flex h-10 w-10 items-center justify-center rounded-full border ${activeCategory === 'all' ? 'border-[#5bb47b] bg-[#5bb47b] text-white' : 'border-[#dce8de] bg-[#f8fcf8] text-[#2d6a4f]'}`}
                            >
                                <Grid2X2 size={18} />
                            </span>
                            All
                        </button>
                        {categories.map((category, index) => {
                            const categoryImage = imageUrl(category.image);
                            const FallbackIcon = getCategoryFallbackIcon(category.name);

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.slug)}
                                    className={`flex min-w-17 shrink-0 flex-col items-center gap-1.5 text-[10px] font-semibold ${activeCategory === category.slug ? 'text-[#1b4332]' : 'text-[#5c6e63]'}`}
                                >
                                    <span
                                        className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border ${activeCategory === category.slug ? 'border-[#5bb47b] bg-[#5bb47b] text-white' : 'border-[#dce8de] text-[#2d6a4f]'}`}
                                        style={
                                            activeCategory === category.slug
                                                ? undefined
                                                : { backgroundColor: categoryColors[index % categoryColors.length] }
                                        }
                                    >
                                        {categoryImage ? (
                                            <img src={categoryImage} alt={category.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <FallbackIcon size={18} strokeWidth={1.8} />
                                        )}
                                    </span>
                                    <span className="max-w-16 truncate">{category.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                    <section
                        className="relative order-1 mt-3 min-h-60 overflow-hidden rounded-2xl border border-[#e1ebdf] bg-[#eef6e8] bg-cover bg-center px-6 py-8 shadow-[0_8px_25px_rgba(22,59,36,0.06)] sm:min-h-60 sm:px-11 sm:py-9"
                        style={{
                            backgroundImage:
                                heroMediaType !== 'video' && heroMediaPath
                                    ? `linear-gradient(90deg, rgba(248,253,247,.98) 0%, rgba(248,253,247,.88) 42%, rgba(248,253,247,.08) 75%), url('${heroMediaPath}')`
                                    : undefined,
                        }}
                    >
                        {heroMediaType === 'video' && heroMediaPath && (
                            <video src={heroMediaPath} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
                        )}
                        {heroMediaPath && <div className="absolute inset-0 bg-linear-to-r from-[#f8fdf7] via-[#f8fdf7]/85 to-transparent" />}
                        <div className="relative z-10">
                            <span className="inline-flex rounded-full bg-[#e2f2e4] px-3 py-1 text-[10px] font-bold tracking-[.08em] text-[#2c8050] uppercase">
                                {brandName} Marketplace
                            </span>
                            <h1 className="font-display mt-3 max-w-107.5 text-[clamp(30px,4vw,44px)] leading-[1.02] font-bold text-[#145437]">
                                {heroTitle}
                                <br />
                                <span className="text-[#249653]">{heroHighlight}</span>
                            </h1>
                            <p className="my-4 max-w-95 text-xs leading-5 text-[#5d7768] sm:text-sm">{heroDescription}</p>
                            <a
                                href="#products"
                                className="inline-flex items-center gap-3 rounded-full bg-[#23834b] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#23834b]/20"
                            >
                                {ctaLabel} <ArrowRight size={15} />
                            </a>
                            <div className="mt-5 hidden items-center gap-5 text-[10px] font-semibold text-[#527160] sm:flex">
                                <span>✦ {featureOne}</span>
                                <span>♢ {featureTwo}</span>
                                <span>▣ {featureThree}</span>
                            </div>
                        </div>
                    </section>
                    <div
                        id="products"
                        className="order-3 mt-5 mb-3 flex items-end justify-between gap-4 rounded-t-2xl border border-b-0 border-[#e3eee6] bg-white px-4 pt-4 sm:px-5"
                    >
                        <div>
                            <h2 className="font-display text-xl font-bold text-[#184c35]">
                                {search.trim() ? 'Search results' : productsTitle}{' '}
                                <span className="text-sm font-medium text-[#5c6e63]">
                                    ({search.trim() ? searchResults.length : Math.min(productFeed.length, 20)})
                                </span>
                            </h2>
                            <p className="mt-1 text-xs text-[#789184]">{productsSubtitle}</p>
                        </div>
                    </div>
                    <div className="order-4 grid grid-cols-2 gap-3 rounded-b-2xl border border-t-0 border-[#e3eee6] bg-white px-4 pb-5 sm:grid-cols-3 sm:gap-4 sm:px-5 lg:grid-cols-5">
                        {productFeed.map((product) => {
                            const price = product.sale_price ?? product.base_price;
                            const image = product.images?.[0]?.path;
                            return (
                                <article
                                    key={product.id}
                                    onClick={() => openProduct(product)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            openProduct(product);
                                        }
                                    }}
                                    role="link"
                                    tabIndex={0}
                                    className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[#e4ece5] bg-white shadow-[0_3px_12px_rgba(22,59,36,0.05)] transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="relative flex aspect-square items-center justify-center bg-[#f1f5f1]">
                                        {image ? (
                                            <img
                                                src={image.startsWith('http') || image.startsWith('/') ? image : `/storage/${image}`}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Package size={58} strokeWidth={1.2} className="text-[#2c9350]" />
                                        )}
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                toggleFavorite(product.id);
                                            }}
                                            className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white ${liked.includes(product.id) ? 'text-[#2c9350]' : 'text-[#647568]'}`}
                                            aria-label={
                                                liked.includes(product.id)
                                                    ? `Remove ${product.name} from favorites`
                                                    : `Add ${product.name} to favorites`
                                            }
                                            aria-pressed={liked.includes(product.id)}
                                            title={liked.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <Heart size={15} fill={liked.includes(product.id) ? '#2c9350' : 'none'} />
                                        </button>
                                    </div>
                                    <div className="flex flex-1 flex-col p-2.5">
                                        <span className="text-[9px] font-bold tracking-[.06em] text-[#2c9350] uppercase">
                                            {product.category?.name ?? 'Marketplace'}
                                        </span>
                                        <h3 className="mt-1 line-clamp-2 text-xs font-semibold">{product.name}</h3>
                                        <div className="mt-2 flex items-center gap-1 text-[10px] text-[#5c6e63]">
                                            <Star size={12} fill="#f3b33d" className="text-[#f3b33d]" />
                                            <span>4.8</span>
                                            <span className="text-[#91a197]">({product.reviews_count ?? 0})</span>
                                        </div>
                                        <div className="mt-auto pt-3">
                                            <div className="font-display mb-2 text-sm font-bold text-[#16804a]">
                                                ₱{Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                <span className="ml-1 text-[10px] font-medium text-[#789184]">/{product.selling_unit || 'pc'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    {!searchResults.length && (
                        <div className="order-4 rounded-2xl border border-dashed border-[#c4e3ce] bg-[#fbfaf6] py-16 text-center text-sm text-[#5c6e63]">
                            No products found.
                        </div>
                    )}
                    {!!recommendations.length && (
                        <section className="order-5 mt-10">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-display text-xl font-bold text-[#163b24]">You may also like</h2>
                                    <p className="mt-1 text-sm text-[#647568]">More picks from the same category.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                                {recommendations.map((product) => {
                                    const price = product.sale_price ?? product.base_price;
                                    const image = product.images?.[0]?.path;
                                    return (
                                        <article
                                            key={product.id}
                                            onClick={() => openProduct(product)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    openProduct(product);
                                                }
                                            }}
                                            role="link"
                                            tabIndex={0}
                                            className="flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-[#def0e2] bg-white shadow-[0_6px_20px_rgba(22,59,36,0.06)] transition hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            <div className="relative flex aspect-square items-center justify-center bg-[#efe9dd]">
                                                {image ? (
                                                    <img
                                                        src={image.startsWith('http') || image.startsWith('/') ? image : `/storage/${image}`}
                                                        alt={product.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <Package size={58} strokeWidth={1.2} className="text-[#2c9350]" />
                                                )}
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleFavorite(product.id);
                                                    }}
                                                    className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white ${liked.includes(product.id) ? 'text-[#2c9350]' : 'text-[#647568]'}`}
                                                    aria-label={
                                                        liked.includes(product.id)
                                                            ? `Remove ${product.name} from favorites`
                                                            : `Add ${product.name} to favorites`
                                                    }
                                                    aria-pressed={liked.includes(product.id)}
                                                    title={liked.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                                                >
                                                    <Heart size={15} fill={liked.includes(product.id) ? '#2c9350' : 'none'} />
                                                </button>
                                            </div>
                                            <div className="flex flex-1 flex-col p-3.5">
                                                <span className="text-[10px] font-bold tracking-[.06em] text-[#2c9350] uppercase">
                                                    {product.category?.name ?? 'Marketplace'}
                                                </span>
                                                <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{product.name}</h3>
                                                <p className="mt-1 truncate text-xs text-[#647568]">{product.shop?.name ?? 'BSABShop seller'}</p>
                                                <div className="mt-2 flex items-center gap-1 text-xs text-[#5c6e63]">
                                                    <Star size={12} fill="#2c9350" className="text-[#2c9350]" /> New listing
                                                </div>
                                                <div className="mt-auto pt-3">
                                                    <div className="font-display mb-2 text-lg font-bold text-[#163b24]">
                                                        ₱{Number(price).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                    <footer className="order-10 mt-8 border-t border-[#e0ebe2] bg-white px-5 py-7 text-xs text-[#61786b] sm:px-7">
                        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr]">
                            <div>
                                <div className="flex items-center gap-2 text-base font-bold text-[#145c3d]">
                                    {logoPath ? (
                                        <img src={logoPath} alt={brandName} className="h-8 w-8 rounded-full object-cover" />
                                    ) : (
                                        <Sparkles size={24} />
                                    )}
                                    {brandName}
                                </div>
                                <p className="mt-2 max-w-52 text-[10px] leading-4">{footerTagline}</p>
                                <p className="mt-7 text-[10px]">{footerText}</p>
                            </div>
                            <div>
                                <p className="font-bold text-[#315947]">{footerQuickLinksTitle}</p>
                                <div className="mt-2 grid gap-1.5 text-[10px]">
                                    <Link href={route('home')} className="hover:text-[#1f7a42]">
                                        Home
                                    </Link>
                                    <Link href={auth.user ? route('customer.products') : route('login')} className="hover:text-[#1f7a42]">
                                        Products
                                    </Link>
                                    <Link href={auth.user ? route('customer.orders') : route('login')} className="hover:text-[#1f7a42]">
                                        Orders
                                    </Link>
                                    <Link href={auth.user ? route('customer.favorites') : route('login')} className="hover:text-[#1f7a42]">
                                        Favorites
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-[#315947]">{footerCareTitle}</p>
                                <div className="mt-2 grid gap-1.5 text-[10px]">
                                    <span>Help Center</span>
                                    <span>Shipping Info</span>
                                    <span>Return Policy</span>
                                    <span>Contact Us</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-[#315947]">{footerAboutTitle}</p>
                                <div className="mt-2 grid gap-1.5 text-[10px]">
                                    <span>Our Story</span>
                                    <span>Sustainability</span>
                                    <span>Terms &amp; Conditions</span>
                                    <span>Privacy Policy</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-[#315947]">{footerNewsletterTitle}</p>
                                <p className="mt-1 text-[10px]">{footerNewsletterText}</p>
                                <div className="mt-3 flex overflow-hidden rounded-lg border border-[#dce8de] bg-[#fbfdfb]">
                                    <input
                                        aria-label="Email address"
                                        placeholder={newsletterPlaceholder}
                                        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[10px] outline-none"
                                    />
                                    <button aria-label="Subscribe" className="bg-[#258b50] px-3 text-white">
                                        →
                                    </button>
                                </div>
                                <div className="mt-3 flex gap-2 text-[#315947]">
                                    <span>◉</span>
                                    <span>◎</span>
                                    <span>◍</span>
                                    <span>♪</span>
                                </div>
                            </div>
                        </div>
                    </footer>
                </main>
                <nav
                    className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t border-[#dce8de] bg-[#fbfaf6] px-2 py-2.5 lg:hidden"
                    aria-label="Mobile navigation"
                >
                    <a href="#" className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#1b4332]">
                        <Home size={19} />
                        Home
                    </a>
                    <Link
                        href={auth.user ? route('customer.products') : route('login')}
                        className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#5c6e63]"
                    >
                        <Grid2X2 size={19} />
                        Products
                    </Link>
                    <Link
                        href={auth.user ? route('customer.favorites') : route('login')}
                        className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#5c6e63]"
                    >
                        <Heart size={19} />
                        Favorites
                    </Link>
                    <Link
                        href={auth.user ? route('customer.cart') : route('login')}
                        className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#5c6e63]"
                    >
                        <ShoppingCart size={19} />
                        Cart
                    </Link>
                    <Link
                        href={auth.user ? route('customer.account') : route('login')}
                        className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#5c6e63]"
                    >
                        <UserRound size={19} />
                        Account
                    </Link>
                </nav>
            </div>
        </>
    );
}
