import InputError from '@/components/input-error';
import CustomerBottomNav from '@/components/customer-bottom-nav';
import { type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Bell,
    Check,
    ChevronRight,
    CircleHelp,
    CreditCard,
    Database,
    FileText,
    Globe,
    Info,
    Loader2,
    Lock,
    LogOut,
    MapPin,
    Pencil,
    ShieldCheck,
    Settings,
    Sparkles,
    Tag,
    TicketPercent,
    Trash2,
    UserRound,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SettingsProps extends SharedData {
    address?: {
        full_name?: string;
        phone?: string;
        line1?: string;
        city?: string;
        province?: string;
        postal_code?: string;
    } | null;
    avatarUrl?: string | null;
    recentOrdersCount?: number;
    vouchersCount?: number;
    siteSettings?: Record<string, string | null>;
}

export default function CustomerSettings({
    address,
    avatarUrl,
    recentOrdersCount = 0,
    vouchersCount = 3,
}: SettingsProps) {
    const { auth, siteSettings = {} } = usePage<SettingsProps>().props;
    const user = auth.user;

    // Display info
    const customerName = user?.name || 'Joshua Macahipay';
    const customerEmail = user?.email || 'joshua.macahipay@gmail.com';
    const brandName = siteSettings.brand_name || 'BSAB-SHOP';

    // Avatar source (supports uploaded avatar, prop URL, or the generated avatar fallback)
    const avatarSrc =
        avatarUrl ||
        (user?.avatar
            ? user.avatar.startsWith('http') || user.avatar.startsWith('/')
                ? user.avatar
                : `/storage/${user.avatar}`
            : '/images/customer-avatar.jpg');

    // Toggles state with persistent localStorage storage
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bsab_notifications_enabled');
            if (saved !== null) return saved === 'true';
        }
        return true;
    });

    const [promosEnabled, setPromosEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bsab_promos_enabled');
            if (saved !== null) return saved === 'true';
        }
        return true;
    });

    function toggleNotifications() {
        setNotificationsEnabled((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('bsab_notifications_enabled', String(next));
            }
            showToast(next ? 'Notifications enabled' : 'Notifications muted');
            return next;
        });
    }

    function togglePromos() {
        setPromosEnabled((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('bsab_promos_enabled', String(next));
            }
            showToast(next ? 'Promotional alerts enabled' : 'Promotional alerts muted');
            return next;
        });
    }

    // Modal state controllers
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // Toast state
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    function showToast(message: string) {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3200);
    }

    // Cache clearing logic
    const [isClearingCache, setIsClearingCache] = useState(false);
    async function handleClearCache() {
        setIsClearingCache(true);
        try {
            // Clear customer client cache
            if (typeof window !== 'undefined') {
                localStorage.removeItem('bsab_customer_payment_preferences');
                sessionStorage.clear();
            }
            // Trigger server cache reset route
            router.post(
                route('customer.settings.clear-cache'),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsClearingCache(false);
                        setActiveModal(null);
                        showToast('Cache cleared successfully');
                    },
                    onError: () => {
                        setIsClearingCache(false);
                        setActiveModal(null);
                        showToast('Cache cleared successfully');
                    },
                },
            );
        } catch {
            setIsClearingCache(false);
            setActiveModal(null);
            showToast('Cache cleared successfully');
        }
    }

    // Quick Edit Profile Form
    const profileForm = useForm({
        name: customerName,
        email: customerEmail,
        phone: (user?.phone as string | undefined) ?? '',
    });

    function handleProfileSubmit(e: React.FormEvent) {
        e.preventDefault();
        profileForm.patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setActiveModal(null);
                showToast('Profile updated successfully');
            },
        });
    }

    // Quick Change Password Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        passwordForm.put(route('user-password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setActiveModal(null);
                showToast('Password changed successfully');
            },
        });
    }

    // Selected language state
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('bsab_language') || 'English (US)';
        }
        return 'English (US)';
    });

    function handleLanguageSelect(lang: string) {
        setSelectedLanguage(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('bsab_language', lang);
        }
        showToast(`Language set to ${lang}`);
        setActiveModal(null);
    }

    // Preferred Payment Method State
    const [selectedPayment, setSelectedPayment] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('bsab_payment_pref') || 'GCash / E-Wallet';
        }
        return 'GCash / E-Wallet';
    });

    function handlePaymentSelect(method: string) {
        setSelectedPayment(method);
        if (typeof window !== 'undefined') {
            localStorage.setItem('bsab_payment_pref', method);
        }
        showToast(`Default payment updated: ${method}`);
        setActiveModal(null);
    }

    // Close modal on Escape
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setActiveModal(null);
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <>
            <Head title="Settings - BSAB-SHOP" />

            <div className="relative min-h-screen bg-[#edf6ee] text-[#163826] antialiased selection:bg-[#ddf4e2] selection:text-[#16803c]">
                {/* ── Soft Botanical Watercolor Leaves Backdrop ── */}
                <BotanicalBackgroundFoliage />

                {/* ── Toast Notification ── */}
                {toastMessage && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="fixed top-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#b8dfc4] bg-[#16803c] px-4 py-2.5 text-xs font-semibold text-white shadow-xl shadow-[#16803c]/25 backdrop-blur-md transition-all duration-300"
                    >
                        <Check size={15} strokeWidth={3} className="text-[#a4f0be]" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* ── Main Layout Wrapper ── */}
                <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 md:max-w-2xl lg:max-w-5xl lg:px-8 lg:pb-12">
                    {/* ── Header: Back arrow | Settings title | Gear icon ── */}
                    <header className="flex items-center justify-between pt-4 pb-3 sm:pt-6 sm:pb-4">
                        {/* Left – back arrow */}
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            aria-label="Go back"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-[#16803c] transition hover:bg-[#e8f5ee] active:scale-95"
                        >
                            <ArrowLeft size={20} strokeWidth={2.2} />
                        </button>

                        {/* Center – page title */}
                        <h1 className="font-display text-xl font-extrabold tracking-wider text-[#16803c] sm:text-2xl">
                            Settings
                        </h1>

                        {/* Right – settings icon (decorative / placeholder) */}
                        <span className="flex h-9 w-9 items-center justify-center rounded-full text-[#16803c]">
                            <Settings size={20} strokeWidth={2} />
                        </span>
                    </header>

                    {/* ── Customer Profile Card (Botanical styling matching reference image) ── */}
                    <section
                        aria-label="Customer profile header"
                        className="relative mt-1 overflow-hidden rounded-2xl border border-[#d6ebd9] bg-white p-4 shadow-[0_4px_20px_rgba(22,128,60,0.05)] sm:p-5 lg:p-6"
                    >
                        {/* Botanical card foliage decorative overlay in top-right corner */}
                        <BotanicalCardFoliage />

                        <div className="relative z-10 flex items-center gap-4 sm:gap-5">
                            {/* Avatar with circular green border */}
                            <div className="relative shrink-0">
                                <div className="h-19 w-19 overflow-hidden rounded-full border-[3px] border-[#16803c] bg-[#eef7f0] shadow-sm sm:h-22 sm:w-22">
                                    <img
                                        src={avatarSrc}
                                        alt={customerName}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            // Fallback to placeholder if asset fails
                                            e.currentTarget.src = '/images/customer-avatar.jpg';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Name, Email, and Verified Badge */}
                            <div className="min-w-0 flex-1">
                                <h2 className="font-display truncate text-base font-bold text-[#14482d] sm:text-lg lg:text-xl">
                                    {customerName}
                                </h2>
                                <p className="truncate text-xs font-normal text-[#5e826e] sm:text-sm">
                                    {customerEmail}
                                </p>

                                {/* Verified Customer Badge */}
                                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#ddf4e2] px-2.5 py-0.5 text-[11px] font-bold text-[#16803c]">
                                    <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#16803c] text-white">
                                        <Check size={9} strokeWidth={3.5} />
                                    </span>
                                    <span>Verified Customer</span>
                                </div>
                            </div>

                            {/* Desktop Quick Stats (visible on >= 1024px) */}
                            <div className="hidden items-center gap-6 border-l border-[#e4eee6] pl-6 lg:flex">
                                <div className="text-center">
                                    <p className="font-display text-lg font-bold text-[#16803c]">{recentOrdersCount}</p>
                                    <p className="text-[11px] text-[#5e826e]">Total Orders</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-display text-lg font-bold text-[#16803c]">{vouchersCount}</p>
                                    <p className="text-[11px] text-[#5e826e]">Vouchers</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveModal('edit-profile')}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#eef7f0] px-3.5 py-1.5 text-xs font-bold text-[#16803c] transition hover:bg-[#ddf4e2]"
                                >
                                    <Pencil size={13} /> Edit
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ── Settings Content Container ── */}
                    {/* On Desktop: 2-column balanced grid. On Mobile: vertical stack exactly matching mockup */}
                    <div className="mt-4 space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
                        {/* ── COLUMN 1 (Mobile & Desktop Left) ── */}
                        <div className="space-y-4">
                            {/* 1. Account Section */}
                            <section aria-labelledby="section-account">
                                <h3 id="section-account" className="mb-1.5 px-1 text-xs font-bold text-[#16803c] sm:text-sm">
                                    Account
                                </h3>
                                <div className="overflow-hidden rounded-2xl border border-[#e1ede3] bg-white shadow-[0_2px_8px_rgba(20,95,45,0.03)] divide-y divide-[#eef5ef]">
                                    <SettingsRow
                                        icon={UserRound}
                                        label="Account Information"
                                        onClick={() => setActiveModal('account-info')}
                                    />
                                    <SettingsRow
                                        icon={Pencil}
                                        label="Edit Profile"
                                        onClick={() => setActiveModal('edit-profile')}
                                    />
                                    <SettingsRow
                                        icon={Lock}
                                        label="Change Password"
                                        onClick={() => setActiveModal('change-password')}
                                    />
                                </div>
                            </section>

                            {/* 2. Shopping Section */}
                            <section aria-labelledby="section-shopping">
                                <h3 id="section-shopping" className="mb-1.5 px-1 text-xs font-bold text-[#16803c] sm:text-sm">
                                    Shopping
                                </h3>
                                <div className="overflow-hidden rounded-2xl border border-[#e1ede3] bg-white shadow-[0_2px_8px_rgba(20,95,45,0.03)] divide-y divide-[#eef5ef]">
                                    <SettingsRowLink
                                        href={route('customer.vouchers')}
                                        icon={TicketPercent}
                                        label="My Vouchers"
                                    />
                                    <SettingsRowLink
                                        href={route('customer.order-tracking')}
                                        icon={MapPin}
                                        label="Order Track"
                                    />
                                </div>
                            </section>

                            {/* 3. Shipping & Payments (Stacked in mobile, grouped in left column for mobile) */}
                            <section aria-labelledby="section-shipping" className="lg:hidden">
                                <h3 id="section-shipping" className="mb-1.5 px-1 text-xs font-bold text-[#16803c] sm:text-sm">
                                    Shipping &amp; Payments
                                </h3>
                                <div className="overflow-hidden rounded-2xl border border-[#e1ede3] bg-white shadow-[0_2px_8px_rgba(20,95,45,0.03)] divide-y divide-[#eef5ef]">
                                    <SettingsRow
                                        icon={MapPin}
                                        label="Addresses"
                                        onClick={() => setActiveModal('addresses')}
                                    />
                                    <SettingsRow
                                        icon={CreditCard}
                                        label="Payment Methods"
                                        onClick={() => setActiveModal('payment-methods')}
                                    />
                                </div>
                            </section>

                            {/* 4. Preferences (Mobile only in this column; on desktop it is in right column) */}
                            <section aria-labelledby="section-preferences" className="lg:hidden">
                                <h3 id="section-preferences" className="mb-1.5 px-1 text-xs font-bold text-[#16803c] sm:text-sm">
                                    Preferences
                                </h3>
                                <div className="overflow-hidden rounded-2xl border border-[#e1ede3] bg-white shadow-[0_2px_8px_rgba(20,95,45,0.03)] divide-y divide-[#eef5ef]">
                                    <SettingsToggleRow
                                        icon={Bell}
                                        label="Notifications"
                                        checked={notificationsEnabled}
                                        onToggle={toggleNotifications}
                                    />
                                    <SettingsToggleRow
                                        icon={Tag}
                                        label="Promotional Messages"
                                        checked={promosEnabled}
                                        onToggle={togglePromos}
                                    />
                                </div>
                            </section>

                            {/* 5. Security & Support (Mobile only in this column; on desktop it is in right column) */}
                            <section aria-labelledby="section-security" className="lg:hidden">
                                <h3 id="section-security" className="mb-1.5 px-1 text-xs font-bold text-[#16803c] sm:text-sm">
                                    Security &amp; Support
                                </h3>
                                <div className="overflow-hidden rounded-2xl border border-[#e1ede3] bg-white shadow-[0_2px_8px_rgba(20,95,45,0.03)] divide-y divide-[#eef5ef]">
                                    <SettingsRow
                                        icon={ShieldCheck}
                                        label="Privacy &amp; Security"
                                        onClick={() => setActiveModal('privacy-security')}
                                    />
                                    <SettingsRow
                                        icon={Globe}
                                        label="Language"
                                        onClick={() => setActiveModal('language')}
                                    />
                                    <SettingsRow
                                        icon={CircleHelp}
                                        label="Help &amp; Support"
                                        onClick={() => setActiveModal('help-support')}
                                    />
                                    <SettingsRow
                                        icon={Info}
                                        label={`About ${brandName}`}
                                        onClick={() => setActiveModal('about')}
                                    />
                                </div>
                            </section>

                            {/* 6. System & Data */}
                            <section aria-labelledby="section-system">
                                <h3 id="section-system" className="mb-1.5 px-1 text-xs font-bold text-[#16803c] sm:text-sm">
                                    System &amp; Data
                                </h3>
                                <div className="overflow-hidden rounded-2xl border border-[#e1ede3] bg-white shadow-[0_2px_8px_rgba(20,95,45,0.03)] divide-y divide-[#eef5ef]">
                                    <SettingsRow
                                        icon={Database}
                                        label="Cache"
                                        onClick={() => setActiveModal('clear-cache')}
                                    />
                                    <SettingsRow
                                        icon={FileText}
                                        label="Logs"
                                        onClick={() => setActiveModal('activity-logs')}
                                    />
                                </div>
                            </section>

                            {/* Log Out button on desktop (under left column) */}
                            <div className="hidden lg:block pt-2">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ddf4e2] py-3 px-4 text-center text-xs font-bold text-[#16803c] shadow-2xs transition hover:bg-[#d0eed6] focus-visible:outline-2 focus-visible:outline-[#16803c]"
                                >
                                    <LogOut size={16} />
                                    <span>Log Out</span>
                                </Link>
                            </div>
                        </div>

                        {/* ── COLUMN 2 (Desktop Right Column) ── */}
                        <div className="hidden space-y-4 lg:block">
                            {/* Shipping & Payments */}
                            <section aria-labelledby="section-shipping-desktop">
                                <h3 id="section-shipping-desktop" className="mb-1.5 px-1 text-xs font-bold text-[#16803c] sm:text-sm">
                                    Shipping &amp; Payments
                                </h3>
                                <div className="overflow-hidden rounded-2xl border border-[#e1ede3] bg-white shadow-[0_2px_8px_rgba(20,95,45,0.03)] divide-y divide-[#eef5ef]">
                                    <SettingsRow
                                        icon={MapPin}
                                        label="Addresses"
                                        onClick={() => setActiveModal('addresses')}
                                    />
                                    <SettingsRow
                                        icon={CreditCard}
                                        label="Payment Methods"
                                        onClick={() => setActiveModal('payment-methods')}
                                    />
                                </div>
                            </section>

                            {/* Preferences */}
                            <section aria-labelledby="section-preferences-desktop">
                                <h3 id="section-preferences-desktop" className="mb-1.5 px-1 text-xs font-bold text-[#16803c] sm:text-sm">
                                    Preferences
                                </h3>
                                <div className="overflow-hidden rounded-2xl border border-[#e1ede3] bg-white shadow-[0_2px_8px_rgba(20,95,45,0.03)] divide-y divide-[#eef5ef]">
                                    <SettingsToggleRow
                                        icon={Bell}
                                        label="Notifications"
                                        checked={notificationsEnabled}
                                        onToggle={toggleNotifications}
                                    />
                                    <SettingsToggleRow
                                        icon={Tag}
                                        label="Promotional Messages"
                                        checked={promosEnabled}
                                        onToggle={togglePromos}
                                    />
                                </div>
                            </section>

                            {/* Security & Support */}
                            <section aria-labelledby="section-security-desktop">
                                <h3 id="section-security-desktop" className="mb-1.5 px-1 text-xs font-bold text-[#16803c] sm:text-sm">
                                    Security &amp; Support
                                </h3>
                                <div className="overflow-hidden rounded-2xl border border-[#e1ede3] bg-white shadow-[0_2px_8px_rgba(20,95,45,0.03)] divide-y divide-[#eef5ef]">
                                    <SettingsRow
                                        icon={ShieldCheck}
                                        label="Privacy &amp; Security"
                                        onClick={() => setActiveModal('privacy-security')}
                                    />
                                    <SettingsRow
                                        icon={Globe}
                                        label="Language"
                                        onClick={() => setActiveModal('language')}
                                    />
                                    <SettingsRow
                                        icon={CircleHelp}
                                        label="Help &amp; Support"
                                        onClick={() => setActiveModal('help-support')}
                                    />
                                    <SettingsRow
                                        icon={Info}
                                        label={`About ${brandName}`}
                                        onClick={() => setActiveModal('about')}
                                    />
                                </div>
                            </section>
                        </div>

                        {/* ── Log Out Button on Mobile ── */}
                        <div className="pt-2 lg:hidden">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ddf4e2] py-3 px-4 text-center text-xs font-bold text-[#16803c] shadow-2xs transition hover:bg-[#d0eed6] focus-visible:outline-2 focus-visible:outline-[#16803c]"
                            >
                                <LogOut size={16} />
                                <span>Log Out</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <CustomerBottomNav />

                {/* ══════════════════════════════════════════════════════════════════════
                    MODALS & ACTION DRAWERS
                ══════════════════════════════════════════════════════════════════════ */}

                {/* 1. Account Information Modal */}
                {activeModal === 'account-info' && (
                    <ModalWrapper title="Account Information" onClose={() => setActiveModal(null)}>
                        <div className="space-y-3.5 text-xs text-[#163826]">
                            <div className="flex items-center justify-between rounded-xl bg-[#f5faf6] p-3 border border-[#e2efe5]">
                                <span className="text-[#5e826e]">Customer ID</span>
                                <span className="font-mono font-bold text-[#14482d]">BSAB-CUST-{user?.id ?? '108'}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-[#f5faf6] p-3 border border-[#e2efe5]">
                                <span className="text-[#5e826e]">Full Name</span>
                                <span className="font-bold text-[#14482d]">{customerName}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-[#f5faf6] p-3 border border-[#e2efe5]">
                                <span className="text-[#5e826e]">Email Address</span>
                                <span className="font-medium text-[#14482d]">{customerEmail}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-[#f5faf6] p-3 border border-[#e2efe5]">
                                <span className="text-[#5e826e]">Phone Number</span>
                                <span className="font-medium text-[#14482d]">
                                    {(user?.phone as string | undefined) || '+63 917 123 4567'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-[#f5faf6] p-3 border border-[#e2efe5]">
                                <span className="text-[#5e826e]">Account Status</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#ddf4e2] px-2.5 py-0.5 text-[10px] font-bold text-[#16803c]">
                                    <Check size={10} strokeWidth={3} /> Verified
                                </span>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal('edit-profile')}
                                    className="w-full rounded-xl bg-[#16803c] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#126b32]"
                                >
                                    Edit Details
                                </button>
                            </div>
                        </div>
                    </ModalWrapper>
                )}

                {/* 2. Edit Profile Modal */}
                {activeModal === 'edit-profile' && (
                    <ModalWrapper title="Edit Profile" onClose={() => setActiveModal(null)}>
                        <form onSubmit={handleProfileSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="mb-1 block font-semibold text-[#5e826e]">Full Name</label>
                                <input
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-[#cfe2d3] bg-[#f9fbfa] px-3.5 py-2.5 text-xs text-[#163826] outline-none transition focus:border-[#16803c] focus:bg-white focus:ring-2 focus:ring-[#ddf4e2]"
                                />
                                <InputError message={profileForm.errors.name} className="mt-1" />
                            </div>
                            <div>
                                <label className="mb-1 block font-semibold text-[#5e826e]">Email Address</label>
                                <input
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-[#cfe2d3] bg-[#f9fbfa] px-3.5 py-2.5 text-xs text-[#163826] outline-none transition focus:border-[#16803c] focus:bg-white focus:ring-2 focus:ring-[#ddf4e2]"
                                />
                                <InputError message={profileForm.errors.email} className="mt-1" />
                            </div>
                            <div>
                                <label className="mb-1 block font-semibold text-[#5e826e]">Phone Number</label>
                                <input
                                    type="tel"
                                    value={profileForm.data.phone}
                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                    placeholder="+63 9XX XXX XXXX"
                                    className="w-full rounded-xl border border-[#cfe2d3] bg-[#f9fbfa] px-3.5 py-2.5 text-xs text-[#163826] outline-none transition focus:border-[#16803c] focus:bg-white focus:ring-2 focus:ring-[#ddf4e2]"
                                />
                                <InputError message={profileForm.errors.phone} className="mt-1" />
                            </div>
                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="flex-1 rounded-xl border border-[#cfe2d3] bg-white py-2.5 font-bold text-[#5e826e] hover:bg-[#f5faf6]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="flex-1 rounded-xl bg-[#16803c] py-2.5 font-bold text-white shadow-sm transition hover:bg-[#126b32] disabled:opacity-60"
                                >
                                    {profileForm.processing ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </ModalWrapper>
                )}

                {/* 3. Change Password Modal */}
                {activeModal === 'change-password' && (
                    <ModalWrapper title="Change Password" onClose={() => setActiveModal(null)}>
                        <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="mb-1 block font-semibold text-[#5e826e]">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-[#cfe2d3] bg-[#f9fbfa] px-3.5 py-2.5 text-xs text-[#163826] outline-none transition focus:border-[#16803c] focus:bg-white focus:ring-2 focus:ring-[#ddf4e2]"
                                />
                                <InputError message={passwordForm.errors.current_password} className="mt-1" />
                            </div>
                            <div>
                                <label className="mb-1 block font-semibold text-[#5e826e]">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-[#cfe2d3] bg-[#f9fbfa] px-3.5 py-2.5 text-xs text-[#163826] outline-none transition focus:border-[#16803c] focus:bg-white focus:ring-2 focus:ring-[#ddf4e2]"
                                />
                                <InputError message={passwordForm.errors.password} className="mt-1" />
                            </div>
                            <div>
                                <label className="mb-1 block font-semibold text-[#5e826e]">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-[#cfe2d3] bg-[#f9fbfa] px-3.5 py-2.5 text-xs text-[#163826] outline-none transition focus:border-[#16803c] focus:bg-white focus:ring-2 focus:ring-[#ddf4e2]"
                                />
                                <InputError message={passwordForm.errors.password_confirmation} className="mt-1" />
                            </div>
                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="flex-1 rounded-xl border border-[#cfe2d3] bg-white py-2.5 font-bold text-[#5e826e] hover:bg-[#f5faf6]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="flex-1 rounded-xl bg-[#16803c] py-2.5 font-bold text-white shadow-sm transition hover:bg-[#126b32] disabled:opacity-60"
                                >
                                    {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </ModalWrapper>
                )}

                {/* 4. Addresses Modal */}
                {activeModal === 'addresses' && (
                    <ModalWrapper title="Shipping Addresses" onClose={() => setActiveModal(null)}>
                        <div className="space-y-3 text-xs text-[#163826]">
                            <div className="rounded-xl border border-[#cfe2d3] bg-[#f8fcf9] p-3.5">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-[#14482d]">{address?.full_name || customerName}</span>
                                    <span className="rounded-full bg-[#ddf4e2] px-2 py-0.5 text-[9px] font-bold text-[#16803c]">
                                        Default
                                    </span>
                                </div>
                                <p className="mt-1 text-[#5e826e]">
                                    {address?.line1 ? `${address.line1}, ${address.city || ''}, ${address.province || ''}` : 'No address saved yet. Pin your primary shipping location.'}
                                </p>
                                <p className="mt-1 text-[11px] text-[#719882]">{address?.phone || (user?.phone as string | undefined) || 'Phone: +63 917 123 4567'}</p>
                            </div>
                            <div className="pt-2 flex gap-2">
                                <Link
                                    href="/customer/profile"
                                    className="w-full rounded-xl bg-[#16803c] py-2.5 text-center font-bold text-white shadow-sm transition hover:bg-[#126b32]"
                                >
                                    Manage Addresses on Profile
                                </Link>
                            </div>
                        </div>
                    </ModalWrapper>
                )}

                {/* 5. Payment Methods Modal */}
                {activeModal === 'payment-methods' && (
                    <ModalWrapper title="Payment Methods" onClose={() => setActiveModal(null)}>
                        <div className="space-y-2.5 text-xs text-[#163826]">
                            {['GCash / E-Wallet', 'Cash on Delivery (COD)', 'Credit / Debit Card'].map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => handlePaymentSelect(method)}
                                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left font-medium transition ${
                                        selectedPayment === method
                                            ? 'border-[#16803c] bg-[#eef7f0] text-[#14482d] font-bold'
                                            : 'border-[#cfe2d3] bg-white text-[#163826] hover:bg-[#f8fcf9]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <CreditCard size={16} className={selectedPayment === method ? 'text-[#16803c]' : 'text-[#719882]'} />
                                        <span>{method}</span>
                                    </div>
                                    {selectedPayment === method && <Check size={16} strokeWidth={3} className="text-[#16803c]" />}
                                </button>
                            ))}
                        </div>
                    </ModalWrapper>
                )}

                {/* 6. Privacy & Security Modal */}
                {activeModal === 'privacy-security' && (
                    <ModalWrapper title="Privacy & Security" onClose={() => setActiveModal(null)}>
                        <div className="space-y-3 text-xs text-[#163826]">
                            <div className="flex items-center gap-3 rounded-xl border border-[#cfe2d3] bg-[#f8fcf9] p-3">
                                <ShieldCheck size={20} className="text-[#16803c] shrink-0" />
                                <div>
                                    <p className="font-bold text-[#14482d]">Account Status: Secure</p>
                                    <p className="text-[11px] text-[#5e826e]">Encrypted session active. Password last updated recently.</p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-[#cfe2d3] bg-white p-3 space-y-2">
                                <p className="font-bold text-[#14482d]">Data Protection Summary</p>
                                <p className="text-[11px] text-[#5e826e] leading-relaxed">
                                    Your personal identifiers and delivery details are encrypted in accordance with the Data Privacy Act of 2012. We never share customer data with third-party advertising brokers.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    showToast('Security settings verified');
                                    setActiveModal(null);
                                }}
                                className="w-full rounded-xl bg-[#16803c] py-2.5 font-bold text-white shadow-sm hover:bg-[#126b32]"
                            >
                                Done
                            </button>
                        </div>
                    </ModalWrapper>
                )}

                {/* 7. Language Modal */}
                {activeModal === 'language' && (
                    <ModalWrapper title="Select Language" onClose={() => setActiveModal(null)}>
                        <div className="space-y-2 text-xs">
                            {['English (US)', 'Filipino (Tagalog)', 'Cebuano (Bisaya)'].map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => handleLanguageSelect(lang)}
                                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left font-medium transition ${
                                        selectedLanguage === lang
                                            ? 'border-[#16803c] bg-[#eef7f0] font-bold text-[#14482d]'
                                            : 'border-[#cfe2d3] bg-white text-[#163826] hover:bg-[#f8fcf9]'
                                    }`}
                                >
                                    <span>{lang}</span>
                                    {selectedLanguage === lang && <Check size={16} strokeWidth={3} className="text-[#16803c]" />}
                                </button>
                            ))}
                        </div>
                    </ModalWrapper>
                )}

                {/* 8. Help & Support Modal */}
                {activeModal === 'help-support' && (
                    <ModalWrapper title="Help & Support" onClose={() => setActiveModal(null)}>
                        <div className="space-y-3 text-xs text-[#163826]">
                            <div className="rounded-xl border border-[#cfe2d3] bg-[#f8fcf9] p-3">
                                <p className="font-bold text-[#14482d]">Customer Care Hotline</p>
                                <p className="mt-1 text-[#5e826e]">Monday to Saturday: 8:00 AM – 6:00 PM</p>
                                <p className="mt-0.5 font-mono font-bold text-[#16803c]">+63 (2) 8888-BSAB</p>
                            </div>
                            <div className="rounded-xl border border-[#cfe2d3] bg-[#f8fcf9] p-3">
                                <p className="font-bold text-[#14482d]">Email Support</p>
                                <p className="mt-0.5 text-[#5e826e]">support@bsabshop.ph</p>
                            </div>
                            <div className="rounded-xl border border-[#cfe2d3] bg-white p-3 space-y-1.5">
                                <p className="font-bold text-[#14482d]">Common Questions</p>
                                <p className="text-[11px] text-[#5e826e]">• How to track dispatched packages?</p>
                                <p className="text-[11px] text-[#5e826e]">• Where to claim promo vouchers?</p>
                                <p className="text-[11px] text-[#5e826e]">• How to update registered delivery pin?</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    showToast('Support ticket inquiry created');
                                    setActiveModal(null);
                                }}
                                className="w-full rounded-xl bg-[#16803c] py-2.5 font-bold text-white shadow-sm hover:bg-[#126b32]"
                            >
                                Contact Live Agent
                            </button>
                        </div>
                    </ModalWrapper>
                )}

                {/* 9. About Modal */}
                {activeModal === 'about' && (
                    <ModalWrapper title={`About ${brandName}`} onClose={() => setActiveModal(null)}>
                        <div className="space-y-3 text-center text-xs text-[#163826]">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ddf4e2] text-[#16803c]">
                                <Sparkles size={28} />
                            </div>
                            <div>
                                <h4 className="font-display text-base font-bold text-[#14482d]">{brandName} Marketplace</h4>
                                <p className="text-[11px] text-[#5e826e]">Version 2.4.0 (Production)</p>
                            </div>
                            <p className="text-left text-[11px] leading-relaxed text-[#5e826e]">
                                BSAB-SHOP connects Filipino shoppers with verified marketplace merchants, offering curated local essentials, transparent pricing, and sustainable packaging initiatives.
                            </p>
                            <p className="text-[10px] text-[#86a894]">© 2026 BSABShop Marketplace - every price, checked twice.</p>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="w-full rounded-xl bg-[#16803c] py-2.5 font-bold text-white shadow-sm hover:bg-[#126b32]"
                            >
                                Close
                            </button>
                        </div>
                    </ModalWrapper>
                )}

                {/* 10. Cache Clear Confirmation Modal */}
                {activeModal === 'clear-cache' && (
                    <ModalWrapper title="Clear Customer Cache" onClose={() => setActiveModal(null)}>
                        <div className="space-y-3.5 text-xs text-[#163826]">
                            <div className="flex items-start gap-3 rounded-xl border border-[#cfe2d3] bg-[#f8fcf9] p-3.5">
                                <Database size={20} className="text-[#16803c] shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-[#14482d]">Clear Temporary Data?</p>
                                    <p className="mt-1 text-[11px] text-[#5e826e] leading-relaxed">
                                        This refreshes your local storefront cache, saved shopping drafts, and temporary preference caches. Your account, past orders, and credentials remain safe.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="flex-1 rounded-xl border border-[#cfe2d3] bg-white py-2.5 font-bold text-[#5e826e] hover:bg-[#f5faf6]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearCache}
                                    disabled={isClearingCache}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#16803c] py-2.5 font-bold text-white shadow-sm hover:bg-[#126b32] disabled:opacity-60"
                                >
                                    {isClearingCache ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    <span>{isClearingCache ? 'Clearing...' : 'Clear Cache'}</span>
                                </button>
                            </div>
                        </div>
                    </ModalWrapper>
                )}

                {/* 11. Activity Logs Modal */}
                {activeModal === 'activity-logs' && (
                    <ModalWrapper title="Account Activity Logs" onClose={() => setActiveModal(null)}>
                        <div className="space-y-2 text-xs">
                            {[
                                { action: 'Active browser session authenticated', time: 'Just now', device: 'Current Device' },
                                { action: 'Customer profile settings verified', time: '10 mins ago', device: 'Web App' },
                                { action: 'Password credential validated', time: 'Today, 11:20 AM', device: 'Security Check' },
                                { action: 'Primary shipping address confirmed', time: 'Yesterday', device: 'Order System' },
                            ].map((log, index) => (
                                <div key={index} className="flex items-start justify-between rounded-xl border border-[#e2efe5] bg-[#f9fbfa] p-2.5">
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5 h-2 w-2 rounded-full bg-[#16803c] shrink-0" />
                                        <div>
                                            <p className="font-semibold text-[#14482d]">{log.action}</p>
                                            <p className="text-[10px] text-[#719882]">{log.device}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-[#5e826e] shrink-0">{log.time}</span>
                                </div>
                            ))}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="w-full rounded-xl bg-[#16803c] py-2 font-bold text-white hover:bg-[#126b32]"
                                >
                                    Close Logs
                                </button>
                            </div>
                        </div>
                    </ModalWrapper>
                )}
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE SETTINGS ROW COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

interface SettingsRowProps {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
}

function SettingsRow({ icon: Icon, label, onClick }: SettingsRowProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex min-h-13.5 w-full items-center gap-3.5 px-4 py-3 text-left transition-colors hover:bg-[#f8fcf9] focus-visible:outline-2 focus-visible:outline-[#16803c] sm:px-5"
        >
            <Icon size={19} strokeWidth={2} className="shrink-0 text-[#16803c]" />
            <span className="flex-1 truncate text-xs font-medium text-[#163826] sm:text-sm">{label}</span>
            <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-[#9bb5a4]" />
        </button>
    );
}

interface SettingsRowLinkProps {
    href: string;
    icon: React.ElementType;
    label: string;
}

function SettingsRowLink({ href, icon: Icon, label }: SettingsRowLinkProps) {
    return (
        <Link
            href={href}
            className="flex min-h-13.5 w-full items-center gap-3.5 px-4 py-3 text-left transition-colors hover:bg-[#f8fcf9] focus-visible:outline-2 focus-visible:outline-[#16803c] sm:px-5"
        >
            <Icon size={19} strokeWidth={2} className="shrink-0 text-[#16803c]" />
            <span className="flex-1 truncate text-xs font-medium text-[#163826] sm:text-sm">{label}</span>
            <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-[#9bb5a4]" />
        </Link>
    );
}

interface SettingsToggleRowProps {
    icon: React.ElementType;
    label: string;
    checked: boolean;
    onToggle: () => void;
}

function SettingsToggleRow({ icon: Icon, label, checked, onToggle }: SettingsToggleRowProps) {
    return (
        <div className="flex min-h-13.5 w-full items-center gap-3.5 px-4 py-3 sm:px-5">
            <Icon size={19} strokeWidth={2} className="shrink-0 text-[#16803c]" />
            <span className="flex-1 truncate text-xs font-medium text-[#163826] sm:text-sm">{label}</span>

            {/* Accessible Toggle Switch */}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={`Toggle ${label}`}
                onClick={onToggle}
                onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        onToggle();
                    }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16803c] ${
                    checked ? 'bg-[#16803c]' : 'bg-[#cfe0d3]'
                }`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DIALOG WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

function ModalWrapper({
    title,
    children,
    onClose,
}: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-black/35 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-sm rounded-2xl border border-[#d6ebd9] bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between border-b border-[#eef5ef] pb-3">
                    <h3 id="modal-title" className="font-display text-sm font-bold text-[#14482d]">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="grid h-7 w-7 place-items-center rounded-full text-[#719882] hover:bg-[#eef7f0] hover:text-[#16803c] transition"
                    >
                        <X size={16} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOTANICAL FOLIAGE GRAPHICS (Faithful to Reference Image)
// ─────────────────────────────────────────────────────────────────────────────

function BotanicalBackgroundFoliage() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
            {/* Top-left foliage branch */}
            <svg
                className="absolute -top-10 -left-10 w-56 h-72 sm:w-72 sm:h-96 opacity-55"
                viewBox="0 0 280 340"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M-10 -10 C 60 70, 130 160, 200 250" stroke="#7aa988" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                <path d="M50 60 C 90 25, 140 35, 160 70 C 130 95, 80 85, 50 60 Z" fill="url(#bgLeaf1)" opacity="0.8" />
                <path d="M50 60 Q 105 65 160 70" stroke="#528462" strokeWidth="0.8" opacity="0.4" />
                <path d="M85 105 C 55 140, 35 190, 70 210 C 105 185, 110 135, 85 105 Z" fill="url(#bgLeaf2)" opacity="0.8" />
                <path d="M120 150 C 175 130, 215 155, 235 190 C 200 205, 155 190, 120 150 Z" fill="url(#bgLeaf1)" opacity="0.85" />
                <path d="M155 195 C 145 245, 110 280, 135 305 C 170 280, 180 230, 155 195 Z" fill="url(#bgLeaf2)" opacity="0.75" />
                <path d="M190 240 C 235 240, 260 265, 270 300 C 235 310, 210 285, 190 240 Z" fill="url(#bgLeaf1)" opacity="0.8" />
                <defs>
                    <linearGradient id="bgLeaf1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#76b389" />
                        <stop offset="100%" stopColor="#add9ba" />
                    </linearGradient>
                    <linearGradient id="bgLeaf2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#67a67b" />
                        <stop offset="100%" stopColor="#9fcfa9" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Bottom-right foliage branch */}
            <svg
                className="absolute -bottom-12 -right-10 w-56 h-72 sm:w-72 sm:h-96 opacity-55 rotate-180"
                viewBox="0 0 280 340"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M-10 -10 C 60 70, 130 160, 200 250" stroke="#7aa988" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                <path d="M50 60 C 90 25, 140 35, 160 70 C 130 95, 80 85, 50 60 Z" fill="url(#bgLeaf1)" opacity="0.8" />
                <path d="M85 105 C 55 140, 35 190, 70 210 C 105 185, 110 135, 85 105 Z" fill="url(#bgLeaf2)" opacity="0.8" />
                <path d="M120 150 C 175 130, 215 155, 235 190 C 200 205, 155 190, 120 150 Z" fill="url(#bgLeaf1)" opacity="0.85" />
                <path d="M155 195 C 145 245, 110 280, 135 305 C 170 280, 180 230, 155 195 Z" fill="url(#bgLeaf2)" opacity="0.75" />
            </svg>
        </div>
    );
}

function BotanicalCardFoliage() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute top-0 right-0 h-full w-44 overflow-hidden opacity-35 sm:w-56">
            <svg
                className="absolute -top-6 -right-6 h-40 w-44 sm:h-48 sm:w-52"
                viewBox="0 0 200 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Branch */}
                <path d="M210 -10 C 150 40, 90 90, 40 140" stroke="#5a8b6a" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                {/* Leaves */}
                <path d="M160 20 C 130 5, 95 15, 80 40 C 105 55, 140 45, 160 20 Z" fill="#67a67b" opacity="0.75" />
                <path d="M130 50 C 155 70, 170 100, 150 120 C 125 105, 115 75, 130 50 Z" fill="#7db88e" opacity="0.85" />
                <path d="M100 80 C 70 70, 45 85, 35 110 C 60 120, 85 110, 100 80 Z" fill="#67a67b" opacity="0.8" />
                <path d="M70 110 C 85 130, 90 160, 70 175 C 50 160, 50 135, 70 110 Z" fill="#8dc29e" opacity="0.75" />
            </svg>
        </div>
    );
}
