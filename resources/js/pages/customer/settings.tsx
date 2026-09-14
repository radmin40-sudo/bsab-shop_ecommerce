import { PortalLayout } from '@/components/portal-layout';
import { Head, Link } from '@inertiajs/react';
import { Bell, KeyRound, ShieldCheck, SlidersHorizontal, Sparkles, Ticket } from 'lucide-react';

const settingsNav = [
    { label: 'Notifications', href: route('customer.settings.notifications') },
    { label: 'Display', href: route('customer.settings.display') },
    { label: 'Security', href: route('customer.settings.security') },
    { label: 'Password', href: route('customer.settings.password') },
    { label: 'Saved preferences', href: route('customer.settings.saved-preferences') },
];

export default function CustomerSettings() {
    return (
        <>
            <Head title="Settings" />
            <PortalLayout role="customer" title="Settings" eyebrow="Account preferences">
                <div className="mb-8">
                    <p className="text-xs font-bold tracking-[0.18em] text-[#2c9350] uppercase">Preferences</p>
                    <h1 className="font-display mt-2 text-3xl font-bold text-[#163b24]">Settings</h1>
                    <p className="mt-2 max-w-2xl text-sm text-[#647568]">
                        Manage how you experience BSABShop, from notifications to account security and saved preferences.
                    </p>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    <Link
                        href={route('customer.vouchers')}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1f7a42] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(31,122,66,0.18)] transition hover:bg-[#185f35]"
                    >
                        <Ticket size={16} /> View vouchers
                    </Link>
                    {settingsNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="inline-flex items-center rounded-full border border-[#def0e2] bg-white px-3.5 py-2 text-xs font-semibold text-[#1b4332] transition hover:border-[#bedec7] hover:bg-[#f5fcf7]"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <section id="notifications" className="rounded-3xl border border-[#def0e2] bg-white p-5 shadow-[0_10px_25px_rgba(22,59,36,0.04)]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf7ee] text-[#1f7a42]">
                            <Bell size={20} />
                        </div>
                        <h2 className="font-display mt-4 text-xl font-bold text-[#163b24]">Notifications</h2>
                        <p className="mt-2 text-sm leading-6 text-[#647568]">Turn order updates, product alerts, and promotional offers on or off.</p>
                    </section>

                    <section id="display" className="rounded-3xl border border-[#def0e2] bg-white p-5 shadow-[0_10px_25px_rgba(22,59,36,0.04)]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef3d7] text-[#9b6a00]">
                            <SlidersHorizontal size={20} />
                        </div>
                        <h2 className="font-display mt-4 text-xl font-bold text-[#163b24]">Display</h2>
                        <p className="mt-2 text-sm leading-6 text-[#647568]">
                            Adjust how listings, categories, and deals are presented on your storefront experience.
                        </p>
                    </section>

                    <section id="security" className="rounded-3xl border border-[#def0e2] bg-white p-5 shadow-[0_10px_25px_rgba(22,59,36,0.04)]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf7ff] text-[#1d6fa8]">
                            <ShieldCheck size={20} />
                        </div>
                        <h2 className="font-display mt-4 text-xl font-bold text-[#163b24]">Security</h2>
                        <p className="mt-2 text-sm leading-6 text-[#647568]">
                            Review your account protection settings and help keep your profile secure.
                        </p>
                    </section>

                    <section id="password" className="rounded-3xl border border-[#def0e2] bg-white p-5 shadow-[0_10px_25px_rgba(22,59,36,0.04)]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ecff] text-[#6b42c1]">
                            <KeyRound size={20} />
                        </div>
                        <h2 className="font-display mt-4 text-xl font-bold text-[#163b24]">Password</h2>
                        <p className="mt-2 text-sm leading-6 text-[#647568]">Update your password to maintain secure access to your account.</p>
                    </section>

                    <section
                        id="saved-preferences"
                        className="rounded-3xl border border-[#def0e2] bg-white p-5 shadow-[0_10px_25px_rgba(22,59,36,0.04)] md:col-span-2 xl:col-span-2"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f7eb] text-[#27a957]">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="font-display mt-4 text-xl font-bold text-[#163b24]">Saved preferences</h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-[#647568]">
                            Your saved category interests, product recommendations, and market alerts will appear here as your account evolves.
                        </p>
                    </section>
                </div>
            </PortalLayout>
        </>
    );
}
