import { PortalLayout } from '@/components/portal-layout';
import { Head } from '@inertiajs/react';
import { Bell, KeyRound, Store, UserRound } from 'lucide-react';

type SellerSettingsProps = {
    account?: { name: string; email: string; phone: string; seller_id: string };
    shop?: { name: string; status: string; business_type: string; location: string };
    preferences?: Array<{ label: string; enabled: boolean }>;
};

const defaultAccount = {
    name: 'Joshua Macahipay',
    email: 'joshua@bsabshop.com',
    phone: '+63 917 123 4567',
    seller_id: 'BSAB-S-1048',
};

const defaultShop = {
    name: 'ShiningAgrient',
    status: 'Approved',
    business_type: 'Agricultural Supplies',
    location: 'Lipa, Batangas',
};

const defaultPreferences = [
    { label: 'Order notifications', enabled: true },
    { label: 'Customer notifications', enabled: true },
    { label: 'Change password', enabled: true },
    { label: 'Login activity alerts', enabled: true },
];

export default function SellerSettings({ account = defaultAccount, shop = defaultShop, preferences = defaultPreferences }: SellerSettingsProps) {
    return (
        <>
            <Head title="Seller settings" />
            <PortalLayout role="seller" title="Settings" eyebrow="Workspace controls">
                <div className="space-y-6">
                    <section className="rounded-[26px] border border-[#def0e2] bg-white p-5 shadow-[0_6px_20px_rgba(22,59,36,0.04)]">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecf9f0] text-[#1f7a42]">
                                <UserRound size={18} />
                            </span>
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.16em] text-[#2f9d5b] uppercase">Account</p>
                                <h2 className="mt-1 text-2xl font-bold text-[#163b24]">Seller profile</h2>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Name" value={account.name} />
                            <Field label="Email" value={account.email} />
                            <Field label="Phone" value={account.phone} />
                            <Field label="Seller ID" value={account.seller_id} />
                        </div>
                    </section>

                    <section className="rounded-[26px] border border-[#def0e2] bg-white p-5 shadow-[0_6px_20px_rgba(22,59,36,0.04)]">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecf9f0] text-[#1f7a42]">
                                <Store size={18} />
                            </span>
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.16em] text-[#2f9d5b] uppercase">Shop</p>
                                <h2 className="mt-1 text-2xl font-bold text-[#163b24]">Shop information</h2>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Shop name" value={shop.name} />
                            <Field label="Shop status" value={shop.status} />
                            <Field label="Business type" value={shop.business_type} />
                            <Field label="Location" value={shop.location} />
                        </div>
                    </section>

                    <section className="rounded-[26px] border border-[#def0e2] bg-white p-5 shadow-[0_6px_20px_rgba(22,59,36,0.04)]">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecf9f0] text-[#1f7a42]">
                                <Bell size={18} />
                            </span>
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.16em] text-[#2f9d5b] uppercase">Notifications</p>
                                <h2 className="mt-1 text-2xl font-bold text-[#163b24]">Preferences</h2>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {preferences.slice(0, 2).map((item) => (
                                <ToggleRow key={item.label} label={item.label} enabled={item.enabled} />
                            ))}
                        </div>
                    </section>

                    <section className="rounded-[26px] border border-[#def0e2] bg-white p-5 shadow-[0_6px_20px_rgba(22,59,36,0.04)]">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecf9f0] text-[#1f7a42]">
                                <KeyRound size={18} />
                            </span>
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.16em] text-[#2f9d5b] uppercase">Security</p>
                                <h2 className="mt-1 text-2xl font-bold text-[#163b24]">Login security</h2>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {preferences.slice(2).map((item) => (
                                <ToggleRow key={item.label} label={item.label} enabled={item.enabled} />
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-end">
                        <button className="rounded-xl bg-[#1f7a42] px-5 py-3 text-sm font-semibold text-white">Save Changes</button>
                    </div>
                </div>
            </PortalLayout>
        </>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-bold tracking-[0.12em] text-[#7a8c82] uppercase">{label}</span>
            <input
                value={value}
                readOnly
                className="w-full rounded-xl border border-[#dfe9e1] bg-[#f8faf8] px-4 py-3 text-sm text-[#163b24] outline-none"
            />
        </label>
    );
}

function ToggleRow({ label, enabled = false }: { label: string; enabled?: boolean }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-[#e7efe8] bg-[#fbfdfb] px-4 py-3">
            <span className="text-sm font-medium text-[#203a2b]">{label}</span>
            <button
                type="button"
                className={`relative h-7 w-12 rounded-full transition ${enabled ? 'bg-[#1f7a42]' : 'bg-[#dfe7e0]'}`}
                aria-label={label}
            >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`} />
            </button>
        </div>
    );
}
