import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Box,
    ChevronDown,
    ChevronRight,
    CircleDollarSign,
    CircleUserRound,
    ClipboardList,
    Grid2X2,
    Heart,
    Home,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Search,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
    Store,
    Tag,
    Tags,
    Ticket,
    UserRound,
    Users,
    UsersRound,
    X,
} from 'lucide-react';
import { useState } from 'react';

type PortalRole = 'admin' | 'seller' | 'customer';

type NavigationItem = { label: string; href: string; icon: typeof BarChart3 };

const navigation: Record<PortalRole, NavigationItem[]> = {
    admin: [
        { label: 'Products', href: '/admin/products', icon: Package },
        { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
        { label: 'Categories', href: '/admin/categories', icon: Tags },
        { label: 'Vouchers', href: '/admin/vouchers', icon: Ticket },
        { label: 'Sellers', href: '/admin/sellers', icon: Store },
        { label: 'Customers', href: '/admin/customers', icon: Users },
        { label: 'Users', href: '/admin/users', icon: UserRound },
        { label: 'Profile', href: '/admin/profile', icon: CircleUserRound },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
    seller: [
        { label: 'Overview', href: '/seller', icon: LayoutDashboard },
        { label: 'Products', href: '/seller/products', icon: Package },
        { label: 'Orders', href: '/seller/orders', icon: ClipboardList },
        { label: 'Profile', href: '/seller/profile', icon: CircleUserRound },
        { label: 'Shop Profile', href: '/seller/shop', icon: Store },
        { label: 'Vouchers', href: '/seller/vouchers', icon: Tag },
    ],
    customer: [
        { label: 'Account', href: '/customer/profile', icon: CircleUserRound },
        { label: 'Products', href: '/customer/products', icon: Tag },
        { label: 'Favorites', href: '/customer/favorites', icon: Heart },
        { label: 'My orders', href: '/customer/orders', icon: Package },
        { label: 'Cart', href: '/customer/cart', icon: ShoppingCart },
        { label: 'Profile', href: '/customer/profile', icon: Settings },
    ],
};

const adminNavigationGroups: { label: string; items: NavigationItem[] }[] = [
    [{ label: 'Admin Overview', href: '/admin', icon: BarChart3 }],
    [
        { label: 'Products', href: '/admin/products', icon: Package },
        { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
        { label: 'Categories', href: '/admin/categories', icon: Tags },
        { label: 'Vouchers', href: '/admin/vouchers', icon: Ticket },
    ],
    [
        { label: 'Sellers', href: '/admin/sellers', icon: Store },
        { label: 'Customers', href: '/admin/customers', icon: Users },
        { label: 'Users', href: '/admin/users', icon: UserRound },
    ],
    [
        { label: 'Profile', href: '/admin/profile', icon: CircleUserRound },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
].map((items, index) => ({
    label: ['Workspace', 'Marketplace', 'Account Management', 'System'][index],
    items,
}));

const sellerNavigationGroups: { id: string; label: string; items: NavigationItem[] }[] = [
    { id: 'workspace', label: 'Seller Workspace', items: [{ label: 'Overview', href: '/seller', icon: LayoutDashboard }] },
    {
        id: 'marketplace',
        label: 'Marketplace',
        items: [
            { label: 'Products', href: '/seller/products', icon: Package },
            { label: 'Orders', href: '/seller/orders', icon: ClipboardList },
            { label: 'Vouchers', href: '/seller/vouchers', icon: Tag },
        ],
    },
    {
        id: 'account',
        label: 'Account',
        items: [
            { label: 'Profile', href: '/seller/profile', icon: CircleUserRound },
            { label: 'Shop Profile', href: '/seller/shop', icon: Store },
        ],
    },
];

export function PortalLayout({
    role,
    eyebrow,
    title,
    hideHeader = false,
    children,
}: {
    role: PortalRole;
    title: string;
    eyebrow?: string;
    hideHeader?: boolean;
    children: React.ReactNode;
}) {
    const page = usePage<{ auth: { user: { name: string; email: string; avatar?: string } }; siteSettings?: Record<string, string | null> }>();
    const { auth } = page.props;
    const siteSettings = page.props.siteSettings ?? {};
    const brandName = siteSettings.brand_name || 'BSABShop';
    const logoPath = siteSettings.logo_path
        ? siteSettings.logo_path.startsWith('http') || siteSettings.logo_path.startsWith('/')
            ? siteSettings.logo_path
            : `/storage/${siteSettings.logo_path}`
        : null;
    const url = typeof page.url === 'string' ? page.url : '';
    const [open, setOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    if (role === 'customer') return <CustomerLayout auth={auth} url={url} hideHeader={hideHeader} children={children} />;
    const initials = auth.user.name
        .split(' ')
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="min-h-screen bg-[#f5fcf7] text-[#17281d]">
            <aside
                className={`fixed inset-y-0 left-0 z-30 flex h-screen w-60 flex-col overflow-y-auto border-r border-[#def0e2] bg-white p-4 shadow-[0_6px_20px_rgba(22,59,36,0.04)] transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center gap-2 border-b border-[#def0e2] px-2 pb-5">
                    <Link
                        href="/"
                        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-[#48ad68] to-[#1f7a42] text-white shadow-lg shadow-[#1f7a42]/20"
                        aria-label={`${brandName} home`}
                    >
                        {logoPath ? <img src={logoPath} alt={brandName} className="h-full w-full object-cover" /> : <Store size={20} />}
                    </Link>
                    <div>
                        <Link href="/" className="font-display text-lg font-bold text-[#163b24]">
                            {brandName}
                        </Link>
                        <p className="font-mono text-[10px] tracking-wider text-[#2c9350] uppercase">{role} hub</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="lg:hidden" aria-label="Close navigation">
                        <X size={20} />
                    </button>
                </div>
                <div className="mt-5 rounded-[14px] bg-[#e6f7eb] p-3">
                    <p className="text-[10px] font-bold tracking-[0.14em] text-[#2c9350] uppercase">{role} workspace</p>
                    <p className="mt-1 truncate text-sm font-semibold text-[#163b24]">{auth.user.name}</p>
                    <p className="mt-0.5 truncate text-xs text-[#647568]">{auth.user.email}</p>
                </div>
                <nav className="space-y-1">
                    {role === 'admin'
                        ? adminNavigationGroups.map((group, groupIndex) => (
                              <div key={group.label} className={groupIndex > 0 ? 'mt-4 border-t border-[#dcebe0] pt-3' : ''}>
                                  <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.14em] text-[#9fb6a6] uppercase">{group.label}</p>
                                  <div className="space-y-1">
                                      {group.items.map((item) => {
                                          const Icon = item.icon;
                                          const active = item.href === '/admin' ? url === '/admin' : url === item.href || url.startsWith(item.href);
                                          return (
                                              <Link
                                                  key={item.href}
                                                  href={item.href}
                                                  className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition ${active ? 'bg-[#e6f7eb] font-semibold text-[#1f7a42]' : 'font-medium text-[#17281d]/70 hover:bg-[#f5fcf7] hover:text-[#1f7a42]'}`}
                                              >
                                                  <Icon size={18} />
                                                  {item.label}
                                                  {active && <ChevronRight size={15} className="ml-auto" />}
                                              </Link>
                                          );
                                      })}
                                  </div>
                              </div>
                          ))
                        : role === 'seller'
                          ? sellerNavigationGroups.map((group, groupIndex) => (
                                <div key={group.id} className={groupIndex === 3 ? 'mt-4 border-t border-[#dcebe0] pt-3' : ''}>
                                    {group.label && (
                                        <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.14em] text-[#9fb6a6] uppercase">{group.label}</p>
                                    )}
                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const active =
                                                item.href === '/seller' ? url === '/seller' : url === item.href || url.startsWith(item.href);
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition ${active ? 'bg-[#e6f7eb] font-semibold text-[#1f7a42]' : 'font-medium text-[#17281d]/70 hover:bg-[#f5fcf7] hover:text-[#1f7a42]'}`}
                                                >
                                                    <Icon size={20} strokeWidth={2} />
                                                    {item.label}
                                                    {active && <ChevronRight size={15} className="ml-auto" />}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                          : navigation.customer.map((item) => {
                                const Icon = item.icon;
                                const active = url === item.href || (item.href !== `/${role}` && url.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition ${active ? 'bg-[#e6f7eb] font-semibold text-[#1f7a42]' : 'font-medium text-[#17281d]/70 hover:bg-[#f5fcf7] hover:text-[#1f7a42]'}`}
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                        {active && <ChevronRight size={15} className="ml-auto" />}
                                    </Link>
                                );
                            })}
                </nav>
                <div className="mt-auto space-y-1 border-t border-[#dcebe0] pt-4">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm text-[#647568] hover:bg-[#fbeaea] hover:text-[#b3413a]"
                    >
                        <LogOut size={20} strokeWidth={2} /> Log out
                    </Link>
                </div>
            </aside>
            {open && (
                <button
                    className="fixed inset-0 z-20 bg-[#163b24]/30 lg:hidden"
                    onClick={() => setOpen(false)}
                    aria-label="Close navigation overlay"
                />
            )}
            <div className="lg:pl-60">
                <header className="sticky top-0 z-10 flex h-17 items-center gap-3 border-b border-[#def0e2] bg-[#f5fcf7]/90 px-4 backdrop-blur-md sm:gap-5 sm:px-7">
                    <button
                        onClick={() => setOpen(true)}
                        className="rounded-lg p-2 text-[#315640] transition hover:bg-[#e6f7eb] lg:hidden"
                        aria-label="Open navigation"
                    >
                        <Menu size={21} />
                    </button>
                    <div className="hidden min-w-0 items-center gap-2 border-l border-[#dcebe0] pl-5 sm:flex">
                        <div>
                            <p className="truncate text-sm font-semibold text-[#173b27]">{title}</p>
                            <p className="text-[10px] font-bold tracking-[0.14em] text-[#8ba193] uppercase">{eyebrow || `${role} workspace`}</p>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2.5">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
                                className="flex items-center gap-2 rounded-xl border border-[#dcebe0] bg-white/85 py-1 pr-2 pl-1 shadow-[0_2px_8px_rgba(22,59,36,0.04)] transition hover:border-[#a9d4b5] hover:bg-white"
                                aria-label="Open profile settings"
                                aria-expanded={profileMenuOpen}
                            >
                                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-[#48ad68] to-[#1f7a42] text-[11px] font-bold text-white">
                                    {auth.user.avatar ? (
                                        <img
                                            src={`/storage/${auth.user.avatar}`}
                                            alt={auth.user.name}
                                            className="h-full w-full object-cover"
                                            onError={(event) => {
                                                event.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        initials
                                    )}
                                </span>
                                <span className="hidden text-left sm:block">
                                    <span className="block max-w-28 truncate text-xs font-semibold text-[#173b27]">{auth.user.name}</span>
                                    <span className="block text-[10px] text-[#7d9184] capitalize">{role}</span>
                                </span>
                                <ChevronDown size={14} className={`text-[#7d9184] transition ${profileMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {profileMenuOpen && (
                                <div className="absolute top-[calc(100%+0.6rem)] right-0 z-40 w-48 rounded-xl border border-[#dcebe0] bg-white p-1.5 shadow-[0_12px_30px_rgba(22,59,36,0.12)]">
                                    <Link
                                        href={role === 'admin' ? '/admin/profile' : '/seller/profile'}
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#294231] transition hover:bg-[#f5fcf7] hover:text-[#1f7a42]"
                                    >
                                        <CircleUserRound size={16} /> Profile
                                    </Link>
                                    {role === 'admin' && (
                                        <Link
                                            href="/admin/settings"
                                            onClick={() => setProfileMenuOpen(false)}
                                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#294231] transition hover:bg-[#f5fcf7] hover:text-[#1f7a42]"
                                        >
                                            <Settings size={16} /> Settings
                                        </Link>
                                    )}
                                    <div className="my-1 border-t border-[#edf3ee]" />
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#b3413a] transition hover:bg-[#fbeaea]"
                                    >
                                        <LogOut size={16} /> Log out
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-7 [&_section]:rounded-[20px] [&_section]:border-[#def0e2] [&_section]:shadow-[0_6px_20px_rgba(22,59,36,0.06)]">
                    {children}
                </main>
            </div>
        </div>
    );
}

function CustomerLayout({
    auth,
    url,
    hideHeader,
    children,
}: {
    auth: { user: { name: string; email: string; avatar?: string } };
    url: string;
    hideHeader: boolean;
    children: React.ReactNode;
}) {
    const [accountOpen, setAccountOpen] = useState(false);
    const [search, setSearch] = useState('');
    const customerLinks = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Products', href: '/customer/products', icon: Grid2X2 },
        { label: 'Favorites', href: '/customer/favorites', icon: Heart },
        { label: 'Cart', href: '/customer/cart', icon: ShoppingCart },
        { label: 'Account', href: '/customer/account', icon: UserRound },
    ];

    function isActiveLink(href: string) {
        if (href === '/') return url === '/';
        return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
    }

    function submitSearch(event: React.FormEvent) {
        event.preventDefault();
        router.get('/search', { q: search.trim() });
    }

    return (
        <div className="min-h-screen bg-[#f5fcf7] text-[#17281d] antialiased">
            {!hideHeader && (
                <header className="border-b border-[#def0e2] bg-white">
                    <div className="mx-auto flex max-w-310 flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap sm:px-8 lg:gap-4">
                        <div className="relative flex shrink-0 items-center gap-2 sm:hidden">
                            <div className="flex items-center gap-1 rounded-full p-1 hover:bg-[#f5fcf7]">
                                <Link href="/customer/profile" className="flex items-center gap-2" aria-label="Open profile account">
                                    <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#52b788] text-xs font-bold text-[#1b4332]">
                                        {auth.user.avatar ? (
                                            <img
                                                src={
                                                    auth.user.avatar.startsWith('http') || auth.user.avatar.startsWith('/')
                                                        ? auth.user.avatar
                                                        : `/storage/${auth.user.avatar}`
                                                }
                                                alt={auth.user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            auth.user.name.slice(0, 2).toUpperCase()
                                        )}
                                    </span>
                                    <span className="max-w-28 truncate text-sm font-semibold text-[#1b4332]">{auth.user.name}</span>
                                </Link>
                                <button onClick={() => setAccountOpen(!accountOpen)} aria-label="Open account menu">
                                    <ChevronDown size={14} className={`text-[#647568] transition ${accountOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            {accountOpen && (
                                <div className="absolute top-12 left-0 z-20 w-48 rounded-xl border border-[#def0e2] bg-white p-1.5 shadow-[0_8px_25px_rgba(22,59,36,0.1)]">
                                    <Link
                                        href="/customer/profile"
                                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[#f5fcf7]"
                                    >
                                        <UserRound size={16} /> Account
                                    </Link>
                                    <Link
                                        href="/customer/settings"
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
                        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="BSABShop home">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b4332] text-[#52b788]">
                                <Sparkles size={18} />
                            </span>
                            <span className="font-display text-xl font-bold text-[#1b4332]">BSABShop</span>
                        </Link>
                        <nav className="hidden items-center gap-1 sm:ml-auto lg:flex" aria-label="Customer navigation">
                            {customerLinks.slice(0, 4).map((item) => {
                                const Icon = item.icon;
                                const active = isActiveLink(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold hover:bg-[#f5fcf7] ${active ? 'text-[#1f7a42]' : 'text-[#647568]'}`}
                                    >
                                        <Icon size={15} /> {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <form
                            onSubmit={submitSearch}
                            className="order-2 flex w-full items-center gap-2 rounded-full border border-[#def0e2] bg-white px-4 py-2.5 focus-within:border-[#2c9350] focus-within:ring-4 focus-within:ring-[#e6f7eb] sm:order-1 sm:w-auto sm:max-w-130 sm:flex-1 lg:order-2 lg:mx-0 lg:my-0 lg:max-w-155"
                        >
                            <Search size={16} className="shrink-0 text-[#647568]" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search for products, brands and more..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-[#9fb6a6]"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                                    <X size={15} className="text-[#5c6e63]" />
                                </button>
                            )}
                        </form>
                        <div className="order-1 ml-auto hidden items-center justify-end gap-2 sm:order-2 sm:ml-5 lg:order-3 lg:ml-0 lg:flex">
                            <Link
                                href="/customer/cart"
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
                                        {auth.user.avatar ? (
                                            <img
                                                src={
                                                    auth.user.avatar.startsWith('http') || auth.user.avatar.startsWith('/')
                                                        ? auth.user.avatar
                                                        : `/storage/${auth.user.avatar}`
                                                }
                                                alt={auth.user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            auth.user.name.slice(0, 2).toUpperCase()
                                        )}
                                    </span>
                                    <ChevronDown size={14} className={`text-[#5c6e63] transition ${accountOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {accountOpen && (
                                    <div className="absolute top-12 right-0 z-20 w-44 rounded-xl border border-[#def0e2] bg-white p-1.5 shadow-[0_8px_25px_rgba(22,59,36,0.1)]">
                                        <Link
                                            href="/customer/profile"
                                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[#f5fcf7]"
                                        >
                                            <UserRound size={16} /> Account
                                        </Link>
                                        <Link
                                            href="/customer/settings"
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
                        </div>
                    </div>
                </header>
            )}
            <main className="mx-auto max-w-310 px-5 py-6 pb-28 sm:px-8 sm:py-8 lg:pb-12">{children}</main>
            <nav
                className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t border-[#def0e2] bg-white px-2 py-2.5 pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
                aria-label="Bottom navigation"
            >
                {customerLinks.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveLink(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                                active ? 'text-[#1f7a42]' : 'text-[#9A9AA5] hover:text-[#1f7a42]'
                            }`}
                        >
                            <Icon size={22} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export function StatCard({
    label,
    value,
    detail,
    tone = 'plain',
    marketto = false,
}: {
    label: string;
    value: string;
    detail: string;
    tone?: 'plain' | 'warm' | 'green';
    marketto?: boolean;
}) {
    const labelKey = label.toLowerCase();
    const Icon =
        labelKey.includes('sales') || labelKey.includes('revenue')
            ? CircleDollarSign
            : labelKey.includes('order')
              ? ShoppingBag
              : labelKey.includes('seller')
                ? Store
                : labelKey.includes('customer') || labelKey.includes('user') || labelKey.includes('account')
                  ? UsersRound
                  : labelKey.includes('voucher') || labelKey.includes('code')
                    ? Ticket
                    : labelKey.includes('product') || labelKey.includes('stock')
                      ? Box
                      : labelKey.includes('categor')
                        ? Tag
                        : BarChart3;

    return (
        <div className="rounded-[20px] border border-[#def0e2] bg-white p-5 shadow-[0_6px_20px_rgba(22,59,36,0.08)]">
            <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium text-[#647568]">{label}</p>
                <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] ${tone === 'warm' ? 'bg-[#fff3d6] text-[#946a0c]' : tone === 'green' || marketto ? 'bg-[#e6f7eb] text-[#2c9350]' : 'bg-[#f5fcf7] text-[#647568]'}`}
                >
                    <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
                </span>
            </div>
            <p className="font-display mt-3 text-3xl font-bold text-[#163b24]">{value}</p>
            <p
                className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${tone === 'warm' ? 'bg-[#fff3d6] text-[#946a0c]' : 'bg-[#e6f7eb] text-[#1f7a42]'}`}
            >
                {detail}
            </p>
        </div>
    );
}
