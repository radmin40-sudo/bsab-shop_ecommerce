import InputError from '@/components/input-error';
import MapPickerModal from '@/components/map-picker-modal';
import { optimizeImage } from '@/lib/image-upload';
import { type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    Check,
    ChevronDown,
    ChevronRight,
    CircleHelp,
    CreditCard,
    Grid2X2,
    Heart,
    Home,
    LogOut,
    MapPin,
    Menu,
    Package,
    Pencil,
    Search,
    Settings,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
    Star,
    TicketPercent,
    UserRound,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type ProfileTab = 'Personal Information' | 'Addresses' | 'Payment Methods' | 'Security';

const tabs: ProfileTab[] = ['Personal Information', 'Addresses', 'Payment Methods', 'Security'];

const quickLinks = [
    { label: 'My Orders', href: '/customer/orders', icon: Package },
    { label: 'My Addresses', tab: 'Addresses' as ProfileTab, icon: MapPin },
    { label: 'Payment Methods', tab: 'Payment Methods' as ProfileTab, icon: CreditCard },
    { label: 'My Vouchers', href: '/customer/vouchers', icon: TicketPercent },
    { label: 'Wishlist', href: '/customer/favorites', icon: Heart },
    { label: 'Help & Support', href: '/customer/settings', icon: CircleHelp },
];

export default function CustomerProfile() {
    const { auth, address, avatarUrl, cartCount = 0, siteSettings = {} } = usePage<
        SharedData & {
            address?: { full_name: string; phone: string; line1: string; city: string; province: string; postal_code: string };
            avatarUrl?: string | null;
            cartCount?: number;
            siteSettings?: Record<string, string | null>;
        }
    >().props;
    const user = auth.user;
    const brandName = siteSettings.brand_name || 'BSABShop';
    const logoPath = siteSettings.logo_path
        ? siteSettings.logo_path.startsWith('http') || siteSettings.logo_path.startsWith('/')
            ? siteSettings.logo_path
            : `/storage/${siteSettings.logo_path}`
        : null;
    const { data, setData, post, processing, recentlySuccessful, errors, transform } = useForm({
        _method: 'patch',
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: (user?.phone as string | undefined) ?? '',
        avatar: null as File | null,
        address: {
            full_name: address?.full_name ?? user?.name ?? '',
            phone: address?.phone ?? (user?.phone as string | undefined) ?? '',
            line1: address?.line1 ?? '',
            city: address?.city ?? '',
            province: address?.province ?? '',
            postal_code: address?.postal_code ?? '',
        },
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [paymentData, setPaymentData] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bsab_customer_payment_preferences');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    // ignore
                }
            }
        }
        return {
            method: 'GCash / E-Wallet',
            accountName: user?.name ?? 'Customer',
            accountNumber: (user?.phone as string | undefined) ?? '0917-000-0000',
            billingNote: 'Default checkout payment',
        };
    });
    const [paymentSaved, setPaymentSaved] = useState(false);

    const [activeTab, setActiveTab] = useState<ProfileTab>('Personal Information');
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [isEditingSecurity, setIsEditingSecurity] = useState(false);
    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const memberSince = (user as any)?.created_at
        ? new Date((user as any).created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Apr 10, 2026';

    useEffect(() => {
        if (!data.avatar) {
            setAvatarPreview(null);
            return;
        }
        const imageUrl = URL.createObjectURL(data.avatar);
        setAvatarPreview(imageUrl);
        return () => URL.revokeObjectURL(imageUrl);
    }, [data.avatar]);

    const profileImage = avatarPreview || avatarUrl || user?.avatar;
    const avatarSource = profileImage
        ? profileImage.startsWith('http') || profileImage.startsWith('/') || profileImage.startsWith('blob:')
            ? profileImage
            : `/storage/${profileImage}`
        : null;

    function submit(event: React.FormEvent) {
        event.preventDefault();
        transform((formData) => ({
            ...formData,
            address: Object.values(formData.address).some(Boolean) ? formData.address : undefined,
        }));
        post(route('profile.update'), { forceFormData: true, preserveScroll: true, onSuccess: () => setIsEditing(false) });
    }

    function submitAddress(event: React.FormEvent) {
        event.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setIsEditingAddress(false),
        });
    }

    function submitPayment(event: React.FormEvent) {
        event.preventDefault();
        if (typeof window !== 'undefined') {
            localStorage.setItem('bsab_customer_payment_preferences', JSON.stringify(paymentData));
        }
        setPaymentSaved(true);
        setTimeout(() => setPaymentSaved(false), 2500);
        setIsEditingPayment(false);
    }

    function submitSecurity(event: React.FormEvent) {
        event.preventDefault();
        passwordForm.put(route('user-password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setIsEditingSecurity(false);
            },
        });
    }

    function submitSearch(event: React.FormEvent) {
        event.preventDefault();
        router.get('/search', { q: search.trim() });
    }

    function editProfile() {
        setActiveTab('Personal Information');
        setIsEditing(true);
    }
    function editAddress() {
        setActiveTab('Addresses');
        setIsEditingAddress(true);
    }
    function editPayment() {
        setActiveTab('Payment Methods');
        setIsEditingPayment(true);
    }
    function editSecurity() {
        setActiveTab('Security');
        setIsEditingSecurity(true);
    }

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Products', href: '/customer/products', icon: Grid2X2 },
        { label: 'Orders', href: '/customer/orders', icon: Package },
        { label: 'Favorites', href: '/customer/favorites', icon: Heart },
    ];

    function accountOptions() {
        return (
            <div className="absolute top-[calc(100%+8px)] right-0 z-40 w-52 overflow-hidden rounded-xl border border-[#d9eee0] bg-white shadow-[0_12px_30px_rgba(21,91,53,0.14)]">
                <div className="border-b border-[#e8f1e9] px-4 py-3">
                    <p className="truncate text-[12px] font-bold text-[#155f38]">{user?.name}</p>
                    <p className="truncate text-[10px] text-[#6b8a78]">{user?.email}</p>
                </div>
                <div className="p-1.5">
                    <Link href="/customer/profile" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-medium text-[#155f38] hover:bg-[#f0fbf3]">
                        <UserRound size={15} /> Profile
                    </Link>
                    <Link href="/customer/settings" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-medium text-[#315b42] hover:bg-[#f0fbf3]">
                        <Settings size={15} /> Settings
                    </Link>
                    <hr className="my-1 border-[#e8f1e9]" />
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-[#a33c38] hover:bg-[#fff4f1]"
                    >
                        <LogOut size={15} /> Log out
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Your profile" />
            <div className="min-h-screen overflow-hidden bg-[#f7fbf7] text-[#173b2a]">
                <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-12 -left-10 h-32 w-20 rotate-[-35deg] rounded-[100%_0] border border-[#b8e2c2]/60 bg-[#c9edcf]/30" />
                    <div className="absolute top-0 left-10 h-24 w-14 rotate-[-20deg] rounded-[100%_0] border border-[#b8e2c2]/60 bg-[#c9edcf]/25" />
                    <div className="absolute -top-10.5 right-10 h-32 w-20 rotate-35 rounded-[100%_0] border border-[#b8e2c2]/60 bg-[#c9edcf]/30" />
                    <div className="absolute -right-7.5 -bottom-7.5 h-36 w-24 rotate-35 rounded-[100%_0] border border-[#b8e2c2]/50 bg-[#c9edcf]/25" />
                    <div className="absolute -bottom-8.75 -left-5 h-32 w-20 -rotate-35 rounded-[100%_0] border border-[#b8e2c2]/50 bg-[#c9edcf]/25" />
                </div>

                {/* ── Click-outside overlay for dropdowns ── */}
                {(accountMenuOpen || mobileMenuOpen) && (
                    <div
                        className="fixed inset-0 z-20"
                        aria-hidden="true"
                        onClick={() => { setAccountMenuOpen(false); setMobileMenuOpen(false); }}
                    />
                )}

                <header className="relative z-30 border-b border-[#dde5df] bg-white" style={{ minHeight: '70px' }}>
                    <div className="mx-auto flex h-[70px] w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">

                        {/* ── Brand ── */}
                        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${brandName} home`}>
                            {logoPath
                                ? <img src={logoPath} alt={brandName} className="h-9 w-9 rounded-full object-cover ring-2 ring-[#dde5df]" />
                                : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f7f2] text-[#176B45]"><Sparkles size={18} /></span>
                            }
                            <span className="font-display text-[18px] font-extrabold tracking-tight text-[#176B45]">{brandName}</span>
                        </Link>

                        {/* ── Desktop Nav ── */}
                        <nav className="ml-2 hidden items-center lg:flex" aria-label="Main navigation">
                            {navItems.map(({ label, href, icon: Icon }) => {
                                const isActive = typeof window !== 'undefined'
                                    ? href === '/' ? window.location.pathname === '/'
                                        : window.location.pathname.startsWith(href)
                                    : false;
                                return (
                                    <Link
                                        key={label}
                                        href={href}
                                        className={`relative flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                                            isActive ? 'text-[#176B45]' : 'text-[#26352D] hover:text-[#176B45]'
                                        }`}
                                    >
                                        <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                                        {label}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#176B45]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* ── Search bar ── */}
                        <form
                            onSubmit={submitSearch}
                            className="mx-4 hidden flex-1 items-center gap-2 rounded-full border border-[#DDE5DF] bg-[#f9fbfa] px-4 py-2 transition-all focus-within:border-[#176B45] focus-within:ring-2 focus-within:ring-[#e8f4ed] lg:flex"
                        >
                            <Search size={15} className="shrink-0 text-[#6b8a78]" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search for products, brands and more..."
                                aria-label="Search products"
                                className="w-full min-w-0 bg-transparent text-[13px] text-[#26352D] outline-none placeholder:text-[#8fa898]"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="shrink-0 text-[#8fa898] hover:text-[#26352D]">
                                    <X size={14} />
                                </button>
                            )}
                        </form>

                        {/* ── Right actions ── */}
                        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
                            {/* Mobile search – full-row below (handled by sm form below) */}
                            {/* Cart */}
                            <Link
                                href="/customer/cart"
                                aria-label={`Cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
                                className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#26352D] transition hover:bg-[#E8F1EB]"
                            >
                                <ShoppingCart size={20} strokeWidth={2} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#176B45] px-1 text-[9px] font-bold text-white">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Account */}
                            <div className="relative">
                                <button
                                    type="button"
                                    id="account-menu-btn"
                                    onClick={() => { setAccountMenuOpen(!accountMenuOpen); setMobileMenuOpen(false); }}
                                    aria-haspopup="true"
                                    aria-expanded={accountMenuOpen}
                                    aria-label="Account menu"
                                    className="flex items-center gap-2 rounded-full px-1.5 py-1 text-[#26352D] transition hover:bg-[#E8F1EB]"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#52b788] text-[10px] font-bold text-white ring-2 ring-[#E8F1EB]">
                                        {avatarSource
                                            ? <img src={avatarSource} alt={user?.name ?? 'You'} className="h-full w-full object-cover" />
                                            : (user?.name ?? 'You').slice(0, 2).toUpperCase()
                                        }
                                    </span>
                                    <ChevronDown size={14} className={`hidden transition-transform lg:block ${accountMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {accountMenuOpen && accountOptions()}
                            </div>

                            {/* Hamburger – mobile only */}
                            <button
                                type="button"
                                onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setAccountMenuOpen(false); }}
                                aria-label="Toggle navigation menu"
                                aria-expanded={mobileMenuOpen}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-[#26352D] transition hover:bg-[#E8F1EB] lg:hidden"
                            >
                                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* ── Mobile search row ── */}
                    <div className="border-t border-[#DDE5DF] px-4 pb-3 pt-2 lg:hidden">
                        <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border border-[#DDE5DF] bg-[#f9fbfa] px-4 py-2 focus-within:border-[#176B45] focus-within:ring-2 focus-within:ring-[#e8f4ed]">
                            <Search size={15} className="shrink-0 text-[#6b8a78]" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search for products, brands and more..."
                                aria-label="Search products"
                                className="w-full min-w-0 bg-transparent text-[13px] text-[#26352D] outline-none placeholder:text-[#8fa898]"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch('')} aria-label="Clear" className="text-[#8fa898] hover:text-[#26352D]">
                                    <X size={14} />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* ── Mobile nav drawer ── */}
                    {mobileMenuOpen && (
                        <div className="border-t border-[#DDE5DF] bg-white px-4 pb-4 lg:hidden">
                            <nav className="mt-2 flex flex-col gap-0.5" aria-label="Mobile navigation">
                                {navItems.map(({ label, href, icon: Icon }) => {
                                    const isActive = typeof window !== 'undefined'
                                        ? href === '/' ? window.location.pathname === '/'
                                            : window.location.pathname.startsWith(href)
                                        : false;
                                    return (
                                        <Link
                                            key={label}
                                            href={href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-semibold transition ${
                                                isActive
                                                    ? 'bg-[#E8F1EB] text-[#176B45]'
                                                    : 'text-[#26352D] hover:bg-[#f5faf6] hover:text-[#176B45]'
                                            }`}
                                        >
                                            <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                                            {label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    )}
                </header>

                <main className="relative z-0 mx-auto max-w-360 px-3 pt-3 pb-24 md:px-5 md:pt-5 md:pb-10 lg:px-8">
                    <section className="relative hidden min-h-28 overflow-hidden rounded-lg bg-[linear-gradient(105deg,#087b3f_0%,#24934b_58%,#92d88d_100%)] px-6 py-4 text-white shadow-[0_8px_20px_rgba(19,119,60,0.13)] md:block lg:px-7">
                        <div aria-hidden="true" className="absolute -top-14 right-12 h-48 w-32 rotate-38 rounded-[100%_0] border border-white/15 bg-white/10" />
                        <div aria-hidden="true" className="absolute -right-4 -bottom-20 h-48 w-32 rotate-48 rounded-[100%_0] border border-white/15 bg-[#045b32]/20" />
                        <div className="relative flex h-full items-center gap-4">
                            <Avatar src={avatarSource} name={user?.name ?? 'Customer'} size="large" />
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-[19px] font-bold">{user?.name}</h1>
                                <p className="mt-0.5 truncate text-xs text-white/90">{user?.email}</p>
                                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#cdf5d6] px-2.5 py-1 text-[10px] font-semibold text-[#087b3f]"><Check size={12} strokeWidth={3} />Verified Customer</span>
                            </div>
                            <button type="button" onClick={editProfile} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[11px] font-bold text-[#087b3f] shadow-sm transition hover:bg-[#effbf2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Pencil size={14} />Edit Profile</button>
                        </div>
                    </section>

                    <section className="relative overflow-hidden rounded-xl border border-[#d9eee0] bg-white p-4 shadow-[0_5px_20px_rgba(26,99,56,0.07)] md:hidden">
                        <div aria-hidden="true" className="absolute -top-8 right-0 h-28 w-20 rotate-35 rounded-[100%_0] bg-[#dff6e4]" />
                        <div className="relative flex items-center gap-3">
                            <Avatar src={avatarSource} name={user?.name ?? 'Customer'} size="medium" />
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-[15px] font-bold text-[#16412d]">{user?.name}</h1>
                                <p className="truncate text-[10px] text-[#5f806d]">{user?.email}</p>
                                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#ddf7e4] px-2 py-1 text-[9px] font-semibold text-[#087b3f]"><Check size={11} strokeWidth={3} />Verified Customer</span>
                            </div>
                            <button type="button" onClick={editProfile} aria-label="Edit profile" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f5fcf7] text-[#1f7a42] transition hover:bg-[#edf9f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c9350]"><Pencil size={16} /></button>
                        </div>
                    </section>

                    <section aria-label="Customer statistics" className="mt-3 grid grid-cols-3 gap-2 md:mt-3 md:grid-cols-4 md:gap-2.5">
                        <Stat icon={Package} value="12" label="Total Orders" compactLabel="Orders" />
                        <Stat icon={CircleDollar} value="₱8,450" label="Total Spent" compactLabel="Total Spent" />
                        <Stat icon={TicketPercent} value="3" label="Vouchers" compactLabel="Vouchers" />
                        <div className="hidden md:block"><Stat icon={Star} value="4.8" label="Customer Rating" /></div>
                    </section>

                    <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1.65fr)_minmax(260px,0.85fr)] lg:mt-3 lg:gap-3">
                        <section className="overflow-hidden rounded-lg border border-[#d9eee0] bg-white shadow-[0_5px_20px_rgba(26,99,56,0.05)] block">
                            <div role="tablist" aria-label="Profile sections" className="flex overflow-x-auto border-b border-[#e6f1e9] px-2 md:px-4">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === tab}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setIsEditing(false);
                                            setIsEditingAddress(false);
                                            setIsEditingPayment(false);
                                            setIsEditingSecurity(false);
                                        }}
                                        className={`shrink-0 border-b-2 px-3 py-3 text-[10px] font-semibold transition md:px-4 md:text-[11px] ${activeTab === tab ? 'border-[#078b48] text-[#087b3f]' : 'border-transparent text-[#648373] hover:text-[#087b3f]'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 md:p-5">
                                {activeTab === 'Personal Information' && (
                                    <form onSubmit={submit}>
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <h2 className="text-[15px] font-bold text-[#174a32]">Personal Information</h2>
                                            {isEditing ? (
                                                <button type="button" onClick={() => { setIsEditing(false); setData('avatar', null); }} className="text-[10px] font-semibold text-[#668373] hover:text-[#087b3f]">Cancel</button>
                                            ) : (
                                                <button type="button" onClick={editProfile} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#087b3f] hover:text-[#045b32]"><Pencil size={13} />Edit details</button>
                                            )}
                                        </div>
                                        <div className="grid gap-5 md:grid-cols-[112px_minmax(0,1fr)]">
                                            <div className="flex items-center gap-3 md:flex-col md:items-center">
                                                <Avatar src={avatarSource} name={user?.name ?? 'Customer'} size="profile" />
                                                <div className="md:text-center">
                                                    <label className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-[10px] font-semibold transition ${isEditing ? 'bg-[#078b48] text-white hover:bg-[#056d39]' : 'hidden'}`}>
                                                        <Pencil size={12} />Change Photo
                                                        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={!isEditing} onChange={async (event) => { const file = event.target.files?.[0]; setData('avatar', file ? await optimizeImage(file, { maxWidth: 800, maxHeight: 800 }) : null); }} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                                                <ProfileField label="Full Name" value={data.name} editable={isEditing} onChange={(value) => setData('name', value)} error={errors.name} />
                                                <ProfileField label="Email Address" value={data.email} type="email" editable={isEditing} onChange={(value) => setData('email', value)} error={errors.email} />
                                                <ProfileField label="Phone Number" value={data.phone} editable={isEditing} onChange={(value) => setData('phone', value)} error={errors.phone} />
                                            </div>
                                        </div>
                                        <div className="mt-5 border-t border-[#e7f1e9] pt-4">
                                            <h3 className="text-[13px] font-bold text-[#174a32]">Account Details</h3>
                                            <div className="mt-3 grid gap-3 text-[10px] sm:grid-cols-3">
                                                <div><p className="text-[#6b8a78]">Member Since</p><p className="mt-1 font-medium text-[#245d3d]">{memberSince}</p></div>
                                                <div><p className="text-[#6b8a78]">Account Type</p><p className="mt-1 font-medium text-[#245d3d]">Customer</p></div>
                                                <div><p className="text-[#6b8a78]">Verification Status</p><span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#ddf7e4] px-2 py-1 font-semibold text-[#087b3f]"><Check size={11} strokeWidth={3} />Verified</span></div>
                                            </div>
                                        </div>
                                        <InputError message={errors.avatar} className="mt-2" />
                                        {isEditing && (
                                            <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-[#e7f1e9] pt-4">
                                                {recentlySuccessful && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#087b3f]"><Check size={14} />Saved</span>}
                                                <button type="submit" disabled={processing} className="rounded-full bg-[#078b48] px-5 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#056d39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#078b48] disabled:opacity-60">{processing ? 'Saving...' : 'Save Changes'}</button>
                                            </div>
                                        )}
                                    </form>
                                )}

                                {activeTab === 'Addresses' && (
                                    <form onSubmit={submitAddress}>
                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-2.5">
                                                <h2 className="text-[15px] font-bold text-[#174a32]">Addresses</h2>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsMapPickerOpen(true)}
                                                    className="inline-flex items-center gap-1 rounded-full border border-[#bce3c7] bg-[#f0fbf3] px-2.5 py-1 text-[10px] font-bold text-[#087b3f] transition hover:bg-[#ddf7e4] hover:border-[#078b48] shadow-2xs"
                                                >
                                                    <MapPin size={12} />Pick on Map
                                                </button>
                                            </div>
                                            {isEditingAddress ? (
                                                <button type="button" onClick={() => setIsEditingAddress(false)} className="text-[10px] font-semibold text-[#668373] hover:text-[#087b3f]">Cancel</button>
                                            ) : (
                                                <button type="button" onClick={editAddress} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#087b3f] hover:text-[#045b32]"><Pencil size={13} />Edit details</button>
                                            )}
                                        </div>
                                        <div className="grid gap-5 md:grid-cols-[112px_minmax(0,1fr)]">
                                            <div className="flex items-center gap-3 md:flex-col md:items-center">
                                                <span className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full border-[3px] border-white bg-[#d8f2df] text-[#087b3f] shadow-[0_0_0_1px_#c7e8d0]">
                                                    <MapPin size={32} />
                                                </span>
                                                <div className="md:text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsMapPickerOpen(true)}
                                                        className="inline-flex items-center gap-1 rounded-full bg-[#078b48] px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#056d39]"
                                                    >
                                                        <MapPin size={11} />Pick on Map
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="mb-3 flex items-center justify-between rounded-xl border border-[#d2ead8] bg-[#f5fbf6] p-2.5 sm:px-3 sm:py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="grid h-6 w-6 place-items-center rounded-md bg-[#ddf7e4] text-[#078b48]">
                                                            <MapPin size={13} />
                                                        </span>
                                                        <span className="text-[10px] font-medium text-[#2d5d42]">
                                                            {data.address.line1 ? `${data.address.line1}, ${data.address.city || ''}` : 'No address pinned yet — pinpoint location on map'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsMapPickerOpen(true)}
                                                        className="rounded-full border border-[#bce2c7] bg-white px-2.5 py-0.5 text-[9px] font-bold text-[#087b3f] transition hover:bg-[#eaf8ee]"
                                                    >
                                                        Open Map
                                                    </button>
                                                </div>
                                                <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                                                    <ProfileField label="Full Name" value={data.address.full_name} editable={isEditingAddress} onChange={(value) => setData('address', { ...data.address, full_name: value })} error={errors['address.full_name']} />
                                                    <ProfileField label="Phone Number" value={data.address.phone} editable={isEditingAddress} onChange={(value) => setData('address', { ...data.address, phone: value })} error={errors['address.phone']} />
                                                    <ProfileField label="Address Line" value={data.address.line1} editable={isEditingAddress} onChange={(value) => setData('address', { ...data.address, line1: value })} error={errors['address.line1']} />
                                                    <ProfileField label="City" value={data.address.city} editable={isEditingAddress} onChange={(value) => setData('address', { ...data.address, city: value })} error={errors['address.city']} />
                                                    <ProfileField label="Province" value={data.address.province} editable={isEditingAddress} onChange={(value) => setData('address', { ...data.address, province: value })} error={errors['address.province']} />
                                                    <ProfileField label="Postal Code" value={data.address.postal_code} editable={isEditingAddress} onChange={(value) => setData('address', { ...data.address, postal_code: value })} error={errors['address.postal_code']} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-5 border-t border-[#e7f1e9] pt-4">
                                            <h3 className="text-[13px] font-bold text-[#174a32]">Account Details</h3>
                                            <div className="mt-3 grid gap-3 text-[10px] sm:grid-cols-3">
                                                <div><p className="text-[#6b8a78]">Member Since</p><p className="mt-1 font-medium text-[#245d3d]">{memberSince}</p></div>
                                                <div><p className="text-[#6b8a78]">Account Type</p><p className="mt-1 font-medium text-[#245d3d]">Customer</p></div>
                                                <div><p className="text-[#6b8a78]">Verification Status</p><span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#ddf7e4] px-2 py-1 font-semibold text-[#087b3f]"><Check size={11} strokeWidth={3} />Verified</span></div>
                                            </div>
                                        </div>
                                        {isEditingAddress && (
                                            <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-[#e7f1e9] pt-4">
                                                {recentlySuccessful && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#087b3f]"><Check size={14} />Saved</span>}
                                                <button type="submit" disabled={processing} className="rounded-full bg-[#078b48] px-5 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#056d39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#078b48] disabled:opacity-60">{processing ? 'Saving...' : 'Save Changes'}</button>
                                            </div>
                                        )}
                                    </form>
                                )}

                                {activeTab === 'Payment Methods' && (
                                    <form onSubmit={submitPayment}>
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <h2 className="text-[15px] font-bold text-[#174a32]">Payment Methods</h2>
                                            {isEditingPayment ? (
                                                <button type="button" onClick={() => setIsEditingPayment(false)} className="text-[10px] font-semibold text-[#668373] hover:text-[#087b3f]">Cancel</button>
                                            ) : (
                                                <button type="button" onClick={editPayment} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#087b3f] hover:text-[#045b32]"><Pencil size={13} />Edit details</button>
                                            )}
                                        </div>
                                        <div className="grid gap-5 md:grid-cols-[112px_minmax(0,1fr)]">
                                            <div className="flex items-center gap-3 md:flex-col md:items-center">
                                                <span className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full border-[3px] border-white bg-[#d8f2df] text-[#087b3f] shadow-[0_0_0_1px_#c7e8d0]">
                                                    <CreditCard size={32} />
                                                </span>
                                                <div className="md:text-center">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ddf7e4] px-2.5 py-1 text-[10px] font-semibold text-[#087b3f]">
                                                        <Check size={11} strokeWidth={3} />Active
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                                                <ProfileField label="Preferred Method" value={paymentData.method} editable={isEditingPayment} onChange={(value) => setPaymentData((p: any) => ({ ...p, method: value }))} />
                                                <ProfileField label="Account / Cardholder Name" value={paymentData.accountName} editable={isEditingPayment} onChange={(value) => setPaymentData((p: any) => ({ ...p, accountName: value }))} />
                                                <ProfileField label="Account / Mobile Number" value={paymentData.accountNumber} editable={isEditingPayment} onChange={(value) => setPaymentData((p: any) => ({ ...p, accountNumber: value }))} />
                                                <ProfileField label="Billing Note / Instructions" value={paymentData.billingNote} editable={isEditingPayment} onChange={(value) => setPaymentData((p: any) => ({ ...p, billingNote: value }))} />
                                            </div>
                                        </div>
                                        <div className="mt-5 border-t border-[#e7f1e9] pt-4">
                                            <h3 className="text-[13px] font-bold text-[#174a32]">Account Details</h3>
                                            <div className="mt-3 grid gap-3 text-[10px] sm:grid-cols-3">
                                                <div><p className="text-[#6b8a78]">Member Since</p><p className="mt-1 font-medium text-[#245d3d]">{memberSince}</p></div>
                                                <div><p className="text-[#6b8a78]">Account Type</p><p className="mt-1 font-medium text-[#245d3d]">Customer</p></div>
                                                <div><p className="text-[#6b8a78]">Verification Status</p><span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#ddf7e4] px-2 py-1 font-semibold text-[#087b3f]"><Check size={11} strokeWidth={3} />Verified</span></div>
                                            </div>
                                        </div>
                                        {isEditingPayment && (
                                            <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-[#e7f1e9] pt-4">
                                                {paymentSaved && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#087b3f]"><Check size={14} />Saved</span>}
                                                <button type="submit" className="rounded-full bg-[#078b48] px-5 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#056d39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#078b48]">Save Changes</button>
                                            </div>
                                        )}
                                    </form>
                                )}

                                {activeTab === 'Security' && (
                                    <form onSubmit={submitSecurity}>
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <h2 className="text-[15px] font-bold text-[#174a32]">Security</h2>
                                            {isEditingSecurity ? (
                                                <button type="button" onClick={() => { setIsEditingSecurity(false); passwordForm.reset(); }} className="text-[10px] font-semibold text-[#668373] hover:text-[#087b3f]">Cancel</button>
                                            ) : (
                                                <button type="button" onClick={editSecurity} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#087b3f] hover:text-[#045b32]"><Pencil size={13} />Edit details</button>
                                            )}
                                        </div>
                                        <div className="grid gap-5 md:grid-cols-[112px_minmax(0,1fr)]">
                                            <div className="flex items-center gap-3 md:flex-col md:items-center">
                                                <span className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full border-[3px] border-white bg-[#d8f2df] text-[#087b3f] shadow-[0_0_0_1px_#c7e8d0]">
                                                    <ShieldCheck size={32} />
                                                </span>
                                                <div className="md:text-center">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ddf7e4] px-2.5 py-1 text-[10px] font-semibold text-[#087b3f]">
                                                        <Check size={11} strokeWidth={3} />Protected
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                                                <ProfileField label="Current Password" type="password" value={isEditingSecurity ? passwordForm.data.current_password : '••••••••••••'} editable={isEditingSecurity} onChange={(value) => passwordForm.setData('current_password', value)} error={passwordForm.errors.current_password} />
                                                <ProfileField label="New Password" type="password" value={isEditingSecurity ? passwordForm.data.password : '••••••••••••'} editable={isEditingSecurity} onChange={(value) => passwordForm.setData('password', value)} error={passwordForm.errors.password} />
                                                <ProfileField label="Confirm New Password" type="password" value={isEditingSecurity ? passwordForm.data.password_confirmation : '••••••••••••'} editable={isEditingSecurity} onChange={(value) => passwordForm.setData('password_confirmation', value)} error={passwordForm.errors.password_confirmation} />
                                            </div>
                                        </div>
                                        <div className="mt-5 border-t border-[#e7f1e9] pt-4">
                                            <h3 className="text-[13px] font-bold text-[#174a32]">Account Details</h3>
                                            <div className="mt-3 grid gap-3 text-[10px] sm:grid-cols-3">
                                                <div><p className="text-[#6b8a78]">Member Since</p><p className="mt-1 font-medium text-[#245d3d]">{memberSince}</p></div>
                                                <div><p className="text-[#6b8a78]">Account Type</p><p className="mt-1 font-medium text-[#245d3d]">Customer</p></div>
                                                <div><p className="text-[#6b8a78]">Verification Status</p><span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#ddf7e4] px-2 py-1 font-semibold text-[#087b3f]"><Check size={11} strokeWidth={3} />Verified</span></div>
                                            </div>
                                        </div>
                                        {isEditingSecurity && (
                                            <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-[#e7f1e9] pt-4">
                                                {passwordForm.recentlySuccessful && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#087b3f]"><Check size={14} />Saved</span>}
                                                <button type="submit" disabled={passwordForm.processing} className="rounded-full bg-[#078b48] px-5 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#056d39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#078b48] disabled:opacity-60">{passwordForm.processing ? 'Saving...' : 'Save Changes'}</button>
                                            </div>
                                        )}
                                    </form>
                                )}
                            </div>
                        </section>

                        <aside className="hidden space-y-3 md:block">
                            <section className="relative overflow-hidden rounded-lg border border-[#d8efdf] bg-[linear-gradient(135deg,#f3fff5,#e5f8e9)] p-4">
                                <div aria-hidden="true" className="absolute -top-6 right-2 h-24 w-16 rotate-35 rounded-[100%_0] bg-[#bfe8c6]/55" />
                                <div className="relative">
                                    <div className="flex items-center gap-2 text-[#078b48]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#078b48] text-white"><ShoppingBag size={19} /></span><div><p className="text-[14px] font-extrabold">BSAB-SHOP</p><p className="text-[9px] text-[#528368]">Quality Products. Better You.</p></div></div>
                                    <h2 className="mt-3 text-[12px] font-bold text-[#175a37]">More vouchers, more savings!</h2>
                                    <p className="mt-1 max-w-67.5 text-[10px] leading-4 text-[#44785a]">Check out our latest vouchers and enjoy exclusive discounts on your favorite products.</p>
                                    <Link href="/customer/vouchers" className="mt-3 flex items-center justify-center gap-2 rounded-md bg-[#078b48] py-2 text-[10px] font-bold text-white transition hover:bg-[#056d39]">View Vouchers <ChevronRight size={14} /></Link>
                                </div>
                            </section>
                            <section className="rounded-lg border border-[#d9eee0] bg-white p-3.5">
                                <h2 className="mb-2 text-[12px] font-bold text-[#174a32]">Quick Links</h2>
                                <div className="divide-y divide-[#edf4ef]">
                                    {quickLinks.map(({ label, href, tab, icon: Icon }) => href ? <Link key={label} href={href} className="flex items-center gap-2.5 py-2 text-[10px] text-[#3b6f50] transition hover:text-[#078b48]"><Icon size={15} className="text-[#078b48]" /><span className="flex-1">{label}</span><ChevronRight size={13} /></Link> : <button key={label} type="button" onClick={() => setActiveTab(tab!)} className="flex w-full items-center gap-2.5 py-2 text-left text-[10px] text-[#3b6f50] transition hover:text-[#078b48]"><Icon size={15} className="text-[#078b48]" /><span className="flex-1">{label}</span><ChevronRight size={13} /></button>)}
                                </div>
                            </section>
                        </aside>
                    </div>

                    <section aria-label="Account menu" className="mt-3 overflow-hidden rounded-xl border border-[#dceee2] bg-white px-4 shadow-[0_3px_12px_rgba(26,99,56,0.05)] md:hidden">
                        <div className="divide-y divide-[#e8f2eb]">
                            {[
                                { label: 'My Orders', href: '/customer/orders', icon: Package },
                                { label: 'My Addresses', tab: 'Addresses' as ProfileTab, icon: MapPin },
                                { label: 'Payment Methods', tab: 'Payment Methods' as ProfileTab, icon: CreditCard },
                                { label: 'My Vouchers', href: '/customer/vouchers', icon: TicketPercent },
                                { label: 'Wishlist', href: '/customer/favorites', icon: Heart },
                            ].map(({ label, href, tab, icon: Icon }) => {
                                const rowContent = <><Icon size={20} strokeWidth={2.5} className="shrink-0 text-[#078b48]" /><span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#315b42]">{label}</span><ChevronRight size={16} className="shrink-0 text-[#577b65]" /></>;
                                return href ? <Link key={label} href={href} className="flex min-h-12 items-center gap-3">{rowContent}</Link> : <button key={label} type="button" onClick={() => setActiveTab(tab!)} className="flex min-h-12 w-full items-center gap-3 text-left">{rowContent}</button>;
                            })}
                            <button type="button" role="switch" aria-checked={notificationsEnabled} onClick={() => setNotificationsEnabled(!notificationsEnabled)} className="flex min-h-12 w-full items-center gap-3 text-left">
                                <Bell size={20} strokeWidth={2.5} className="shrink-0 text-[#078b48]" />
                                <span className="flex-1 text-[12px] font-medium text-[#315b42]">Notifications</span>
                                <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${notificationsEnabled ? 'bg-[#078b48]' : 'bg-[#b5c9ba]'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${notificationsEnabled ? 'left-4.5' : 'left-0.5'}`} /></span>
                            </button>
                            <Link href="/customer/settings" className="flex min-h-12 items-center gap-3"><CircleHelp size={20} strokeWidth={2.5} className="shrink-0 text-[#078b48]" /><span className="flex-1 text-[12px] font-medium text-[#315b42]">Help &amp; Support</span><ChevronRight size={16} className="shrink-0 text-[#577b65]" /></Link>
                            <Link href="/customer/settings" className="flex min-h-12 items-center gap-3"><Settings size={20} strokeWidth={2.5} className="shrink-0 text-[#078b48]" /><span className="flex-1 text-[12px] font-medium text-[#315b42]">Settings</span><ChevronRight size={16} className="shrink-0 text-[#577b65]" /></Link>
                        </div>
                    </section>

                    <Link href={route('logout')} method="post" as="button" className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#d9f6e1] text-[11px] font-bold text-[#087b3f] transition hover:bg-[#c8efd3] md:hidden"><LogOut size={16} />Log Out</Link>
                </main>

                <nav aria-label="Mobile navigation" className="fixed right-0 bottom-0 left-0 z-30 grid h-15.5 grid-cols-5 border-t border-[#d9eee0] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-5px_18px_rgba(23,95,52,0.08)] md:hidden">
                    {[
                        { label: 'Home', href: '/', icon: Home },
                        { label: 'Products', href: '/customer/products', icon: Grid2X2 },
                        { label: 'Favorites', href: '/customer/favorites', icon: Heart },
                        { label: 'Cart', href: '/customer/cart', icon: ShoppingCart, badge: true },
                        { label: 'Profile', href: '/customer/profile', icon: UserRound, active: true },
                    ].map(({ label, href, icon: Icon, badge, active }) => <Link key={label} href={href} aria-current={active ? 'page' : undefined} className={`relative flex flex-col items-center justify-center gap-0.5 text-[9px] ${active ? 'font-bold text-[#078b48]' : 'text-[#658071]'}`}>
                        <span className="relative"><Icon size={18} strokeWidth={active ? 2.5 : 2} />{badge && <span className="absolute -top-1.5 -right-2 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-[#078b48] px-0.5 text-[8px] text-white">{cartCount}</span>}</span>{label}
                    </Link>)}
                </nav>
            </div>
            <MapPickerModal
                isOpen={isMapPickerOpen}
                onClose={() => setIsMapPickerOpen(false)}
                initialAddress={data.address}
                onSelectLocation={(loc) => {
                    setData('address', {
                        ...data.address,
                        line1: loc.line1 || data.address.line1,
                        city: loc.city || data.address.city,
                        province: loc.province || data.address.province,
                        postal_code: loc.postal_code || data.address.postal_code,
                    });
                    setIsEditingAddress(true);
                }}
            />
        </>
    );
}

function Avatar({ src, name, size }: { src: string | null | undefined; name: string; size: 'small' | 'medium' | 'large' | 'profile' }) {
    const dimensions = { small: 'h-8 w-8 text-[10px]', medium: 'h-[68px] w-[68px] text-lg', large: 'h-[76px] w-[76px] text-xl', profile: 'h-[76px] w-[76px] text-xl' }[size];
    return <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-[#d8f2df] font-bold text-[#087b3f] shadow-[0_0_0_1px_#c7e8d0] ${dimensions}`}>
        {src ? <img src={src} alt={`${name} profile`} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
    </span>;
}

function Stat({ icon: Icon, value, label, compactLabel }: { icon: typeof Package; value: string; label: string; compactLabel?: string }) {
    return <article className="flex min-h-13.5 items-center gap-2 rounded-lg border border-[#dceee2] bg-white px-2.5 py-2 shadow-[0_2px_8px_rgba(26,99,56,0.04)] md:min-h-13.5 md:px-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#def7e5] text-[#087b3f] md:h-9 md:w-9"><Icon size={17} strokeWidth={2.5} /></span>
        <span className="min-w-0"><strong className="block truncate text-[11px] font-bold text-[#1e5939] md:text-[12px]">{value}</strong><span className="block truncate text-[8px] text-[#668574] md:text-[9px]">{compactLabel && <><span className="md:hidden">{compactLabel}</span><span className="hidden md:inline">{label}</span></>}{!compactLabel && label}</span></span>
    </article>;
}

function ProfileField({ label, value, type = 'text', editable, onChange, error }: { label: string; value: string; type?: string; editable: boolean; onChange: (value: string) => void; error?: string }) {
    return <label className="block text-[10px] font-medium text-[#5b806a]">{label}
        <input type={type} value={value} readOnly={!editable} onChange={(event) => onChange(event.target.value)} className={`mt-1.5 w-full rounded-md border px-2.5 py-2 text-[10px] text-[#255e3e] outline-none transition focus:border-[#4eb56d] focus:ring-2 focus:ring-[#dff5e5] ${editable ? 'border-[#d8e9dc] bg-white' : 'border-[#e1f0e5] bg-[#fbfefb]'}`} />
        {error && <InputError message={error} className="mt-1" />}
    </label>;
}

function CircleDollar({ size = 20, ...props }: React.ComponentProps<typeof CreditCard>) {
    return <span className="relative grid place-items-center"><CreditCard size={size} {...props} /><span className="absolute text-[9px] font-extrabold">₱</span></span>;
}