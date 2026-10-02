import { PortalLayout } from '@/components/portal-layout';
import { prepareSanctum } from '@/lib/api';
import { optimizeImage } from '@/lib/image-upload';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BadgeCheck, CircleCheck, FileText, Flame, Image, Link2, PencilLine, QrCode, ShieldCheck, Smartphone, Store, UserRound, WalletCards, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';

type ShopPageProps = {
    shop: {
        id: number;
        name: string;
        slug: string;
        logo: string | null;
        banner: string | null;
        description: string | null;
        gcash_enabled: boolean;
        gcash_account_name: string | null;
        gcash_mobile_number: string | null;
        gcash_qr_code: string | null;
    };
};

export default function SellerShop() {
    const { shop } = usePage<ShopPageProps>().props;
    const [form, setForm] = useState({
        name: shop.name,
        slug: shop.slug,
        description: shop.description ?? '',
        gcash_enabled: shop.gcash_enabled,
        gcash_account_name: shop.gcash_account_name ?? '',
        gcash_mobile_number: shop.gcash_mobile_number ?? '',
    });
    const [qrCode, setQrCode] = useState<File | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [notice, setNotice] = useState('');
    const [saving, setSaving] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isQrPreviewOpen, setIsQrPreviewOpen] = useState(false);

    const qrCodePreview = useMemo(() => {
        if (qrCode) {
            return URL.createObjectURL(qrCode);
        }

        return shop.gcash_qr_code ?? null;
    }, [qrCode, shop.gcash_qr_code]);

    useEffect(() => {
        return () => {
            if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
        };
    }, [logoPreview]);

    function resetForm() {
        setForm({
            name: shop.name,
            slug: shop.slug,
            description: shop.description ?? '',
            gcash_enabled: shop.gcash_enabled,
            gcash_account_name: shop.gcash_account_name ?? '',
            gcash_mobile_number: shop.gcash_mobile_number ?? '',
        });
        setQrCode(null);
        setLogoFile(null);
        setLogoPreview(null);
    }

    function openEditor() {
        resetForm();
        setNotice('');
        setIsEditOpen(true);
    }

    function closeEditor() {
        setIsEditOpen(false);
        setNotice('');
        setQrCode(null);
        setLogoFile(null);
        setLogoPreview(null);
    }

    async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setNotice('Choose a JPG, PNG, or WebP image.');
            event.target.value = '';
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setNotice('The shop profile image must be 2 MB or smaller.');
            event.target.value = '';
            return;
        }

        setNotice('');
        const optimized = await optimizeImage(file, { maxWidth: 800, maxHeight: 800, maxBytes: 2 * 1024 * 1024 });
        setLogoFile(optimized);
        setLogoPreview(URL.createObjectURL(optimized));
    }

    async function submit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setNotice('');

        try {
            await prepareSanctum();
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('slug', form.slug);
            formData.append('description', form.description);
            formData.append('gcash_enabled', form.gcash_enabled ? '1' : '0');
            if (logoFile) formData.append('logo', logoFile);
            if (form.gcash_account_name) formData.append('gcash_account_name', form.gcash_account_name);
            if (form.gcash_mobile_number) formData.append('gcash_mobile_number', form.gcash_mobile_number);
            if (qrCode) formData.append('gcash_qr_code', qrCode);

            const response = await fetch('/seller/shop', {
                method: 'POST',
                body: formData,
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                let serverMessage = 'Unable to save your shop profile right now.';

                try {
                    const data = await response.json();

                    if (data?.message) {
                        serverMessage = data.message;
                    }
                } catch {
                    // ignore JSON parse failures and keep the default message
                }

                throw new Error(serverMessage);
            }

            setIsEditOpen(false);
            setNotice('');
            setLogoFile(null);
            setLogoPreview(null);
            router.reload({ only: ['shop'] });
        } catch (error) {
            setNotice(error instanceof Error ? error.message : 'Unable to save your shop profile right now.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <Head title="Shop Profile" />
            <PortalLayout role="seller" title="Shop profile" eyebrow={shop.name}>
                <div className="space-y-4">
                    <div>
                        <h1 className="mt-2 text-2xl font-bold text-[#1d3327]">Shop Profile</h1>
                        <p className="mt-1 text-sm text-[#728078]">Manage your shop information and settings.</p>
                    </div>

                    <div className="space-y-3">
                            <section className="relative isolate overflow-hidden rounded-xl border border-[#e3eae5] bg-white shadow-[0_4px_15px_rgba(29,61,42,0.06)]">
                                <div
                                    className="absolute inset-0 -z-10 bg-[linear-gradient(112deg,#0d3327_0%,#15583a_58%,#0c2b23_100%)]"
                                    style={shop.banner ? { backgroundImage: `linear-gradient(90deg,rgba(9,39,29,0.82),rgba(9,39,29,0.25)),url("${shop.banner}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                                />
                                <div className="pointer-events-none absolute -right-8 top-0 -z-10 h-full w-[45%] bg-[radial-gradient(ellipse_at_center,rgba(69,157,101,0.23),transparent_70%)]" />
                                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <div className="flex min-w-0 items-center gap-3.5">
                                        <div className="flex h-17 w-17 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/90 bg-[#0c241e] text-[#c5e8b8] shadow-[0_4px_14px_rgba(0,0,0,0.2)]">
                                            {logoPreview || shop.logo ? <img src={logoPreview || shop.logo || ''} alt={`${shop.name} logo`} className="h-full w-full object-cover" /> : <span className="relative flex items-center justify-center"><Flame size={31} strokeWidth={1.7} /><span className="absolute -bottom-2 text-[8px] font-bold tracking-wide">BD</span></span>}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f6ec] px-2 py-0.5 text-[9px] font-semibold text-[#247448]">
                                                <BadgeCheck size={11} /> Verified Seller
                                            </span>
                                            <h2 className="mt-1.5 truncate text-lg font-bold text-white sm:text-xl">{shop.name}</h2>
                                            <p className="mt-0.5 text-[10px] text-white/80">Your storefront identity</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={openEditor} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-[#d4e3d8] bg-white px-3 py-2 text-[11px] font-semibold text-[#294c38] transition hover:bg-[#f1f8f3] sm:self-center">
                                        <PencilLine size={13} /> Edit shop profile
                                    </button>
                                </div>
                            </section>

                            <section className="rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_13px_rgba(31,70,48,0.045)] sm:p-5">
                                <div className="mb-3 flex items-center gap-2.5">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5ec] text-[#28734c]"><Store size={16} /></span>
                                    <h2 className="text-sm font-bold text-[#273a2e]">Shop Information</h2>
                                </div>
                                <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                                    <ShopDetail icon={Store} label="Shop name" value={shop.name} />
                                    <ShopDetail icon={Link2} label="Shop slug" value={shop.slug} />
                                    <ShopDetail icon={FileText} label="Description" value={shop.description || 'No description added yet.'} className="sm:col-span-2" multiline />
                                    <ShopDetail icon={CircleCheck} label="GCash status" value={shop.gcash_enabled ? 'Enabled' : 'Disabled'} status={shop.gcash_enabled} />
                                    <ShopDetail icon={UserRound} label="GCash account" value={shop.gcash_account_name || 'Not set'} />
                                    <ShopDetail icon={Smartphone} label="GCash mobile" value={shop.gcash_mobile_number || 'Not set'} />
                                </div>
                            </section>

                            <section className="rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_13px_rgba(31,70,48,0.045)] sm:p-5">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5ec] text-[#28734c]"><QrCode size={16} /></span>
                                    <div>
                                        <h2 className="text-xs font-bold text-[#293b30]">GCash QR Code</h2>
                                        <p className="mt-0.5 text-[10px] text-[#819087]">Scan this QR code to pay using GCash.</p>
                                    </div>
                                </div>
                                <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(150px,0.7fr)_minmax(0,1.3fr)]">
                                    <div className="flex min-h-42 items-center justify-center rounded-lg border border-[#e8eeea] bg-[#f8fbf9] p-3">
                                        {shop.gcash_qr_code ? (
                                            <button type="button" onClick={() => setIsQrPreviewOpen(true)} className="rounded-md bg-white p-2 shadow-sm" aria-label="Enlarge GCash QR code">
                                                <img src={shop.gcash_qr_code} alt="GCash payment QR code" className="h-36 w-36 object-contain" />
                                            </button>
                                        ) : (
                                            <div className="flex h-36 w-36 items-center justify-center rounded-md border border-dashed border-[#cbd9ce] text-center text-[10px] text-[#78877e]">No GCash QR uploaded</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center rounded-lg border border-[#e8eeea] bg-white p-4">
                                        <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#1478f2]">
                                            <WalletCards size={22} /> GCash
                                        </div>
                                        <p className="mt-1 text-xs font-semibold text-[#34473b]">Pay with GCash</p>
                                        <div className="mt-3 flex items-center gap-2 rounded-md bg-[#f0f8f2] px-3 py-2 text-[10px] font-medium text-[#388054]">
                                            <ShieldCheck size={14} className="shrink-0" /> Easy &amp; Secure Payment
                                        </div>
                                        <p className="mt-2 text-[10px] leading-4 text-[#839087]">Use GCash to complete your purchase quickly and safely.</p>
                                    </div>
                                </div>
                            </section>
                    </div>
                </div>

                {isQrPreviewOpen && shop.gcash_qr_code && (
                    <div
                        className="fixed inset-0 z-60 flex items-center justify-center bg-[#07130c]/80 p-4 backdrop-blur-sm"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Enlarged GCash QR code"
                        onClick={() => setIsQrPreviewOpen(false)}
                    >
                        <div
                            className="relative max-h-[92vh] max-w-[92vw] rounded-3xl bg-[#1268f4] p-4 shadow-2xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setIsQrPreviewOpen(false)}
                                className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe3dc] bg-white text-[#163b24] shadow-lg transition hover:bg-[#edf7ed]"
                                aria-label="Close enlarged QR code"
                            >
                                <X size={19} />
                            </button>
                            <img
                                src={shop.gcash_qr_code}
                                alt="Enlarged GCash QR code"
                                className="max-h-[84vh] max-w-[84vw] rounded-2xl bg-white object-contain p-3"
                            />
                            <p className="mt-3 text-center text-sm font-semibold text-white">GCash QR Code</p>
                        </div>
                    </div>
                )}

                {isEditOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1720]/40 p-4">
                        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#dfe3dc] bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-[#edf2ed] px-6 py-4">
                                <div>
                                    <h3 className="font-serif text-2xl text-[#163b24]">Edit shop profile</h3>
                                    <p className="mt-1 text-sm text-[#657066]">Update your storefront details and GCash setup.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeEditor}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe3dc] text-[#657066] transition hover:border-[#2c7a3b] hover:text-[#2c7a3b]"
                                    aria-label="Close edit modal"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={submit} className="space-y-6 p-6">
                                <section className="rounded-2xl border border-[#e5ece7] bg-[#f9fcfa] p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#dce8df] bg-[#0c241e] text-[#c5e8b8]">
                                            {logoPreview || shop.logo ? <img src={logoPreview || shop.logo || ''} alt={`${shop.name} logo preview`} className="h-full w-full object-cover" /> : <Flame size={26} />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-[#203a2c]">Shop profile image</p>
                                            <p className="mt-1 text-xs text-[#748178]">JPG, PNG, or WebP up to 2 MB.</p>
                                        </div>
                                        <label htmlFor="shop-logo-upload" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d5e3d9] bg-white px-3 py-2 text-xs font-semibold text-[#2e6845] transition hover:bg-[#eff8f1]">
                                            <Image size={14} /> Choose image
                                        </label>
                                        <input id="shop-logo-upload" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleLogoChange} />
                                    </div>
                                </section>
                                <section className="grid gap-5 sm:grid-cols-2">
                                    <label className="text-sm font-semibold">
                                        Shop name
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="mt-2 block w-full border border-[#dfe3dc] px-3 py-3 font-normal outline-none focus:border-[#9a6b45]"
                                        />
                                    </label>

                                    <label className="text-sm font-semibold">
                                        Shop slug
                                        <input
                                            name="slug"
                                            value={form.slug}
                                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                            className="mt-2 block w-full border border-[#dfe3dc] px-3 py-3 font-normal outline-none focus:border-[#9a6b45]"
                                        />
                                    </label>

                                    <label className="text-sm font-semibold sm:col-span-2">
                                        Description
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            rows={4}
                                            className="mt-2 block w-full resize-none border border-[#dfe3dc] px-3 py-3 font-normal outline-none focus:border-[#9a6b45]"
                                        />
                                    </label>
                                </section>

                                <section className="rounded-2xl border border-[#dfe3dc] bg-[#f8faf8] p-5">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h4 className="font-serif text-2xl text-[#163b24]">GCash payment setup</h4>
                                            <p className="mt-1 text-sm text-[#657066]">
                                                Enable GCash and provide the account details customers will use for online payment.
                                            </p>
                                        </div>
                                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#163b24]">
                                            <input
                                                name="gcash_enabled"
                                                type="checkbox"
                                                checked={form.gcash_enabled}
                                                onChange={(e) => setForm({ ...form, gcash_enabled: e.target.checked })}
                                                className="h-4 w-4"
                                            />
                                            Enable GCash
                                        </label>
                                    </div>

                                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                                        <label className="text-sm font-semibold">
                                            Account name
                                            <input
                                                name="gcash_account_name"
                                                value={form.gcash_account_name}
                                                onChange={(e) => setForm({ ...form, gcash_account_name: e.target.value })}
                                                placeholder="Juan Dela Cruz"
                                                className="mt-2 block w-full border border-[#dfe3dc] px-3 py-3 font-normal outline-none focus:border-[#9a6b45]"
                                            />
                                        </label>

                                        <label className="text-sm font-semibold">
                                            Mobile number
                                            <input
                                                name="gcash_mobile_number"
                                                value={form.gcash_mobile_number}
                                                onChange={(e) => setForm({ ...form, gcash_mobile_number: e.target.value })}
                                                placeholder="09XX XXX XXXX"
                                                className="mt-2 block w-full border border-[#dfe3dc] px-3 py-3 font-normal outline-none focus:border-[#9a6b45]"
                                            />
                                        </label>
                                    </div>

                                    <div className="mt-6 grid gap-6 md:grid-cols-[1fr_260px]">
                                        <div>
                                            <p className="text-sm font-semibold text-[#163b24]">QR code image</p>
                                            <input
                                                name="gcash_qr_code"
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    setQrCode(file ? await optimizeImage(file, { maxWidth: 1200, maxHeight: 1200 }) : null);
                                                }}
                                                className="mt-2 block w-full text-sm text-[#163b24] file:mr-3 file:rounded-xl file:border-0 file:bg-[#1f7a42] file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
                                            />
                                            <p className="mt-2 text-xs text-[#657066]">Upload a QR code image for your GCash payment details.</p>
                                        </div>

                                        <div className="flex items-center justify-center rounded-2xl border border-[#dfe3dc] bg-white p-4">
                                            {qrCodePreview ? (
                                                <img src={qrCodePreview} alt="GCash QR preview" className="h-44 w-44 rounded-xl object-contain" />
                                            ) : (
                                                <div className="flex h-44 w-44 items-center justify-center rounded-xl border border-dashed border-[#c9d5c7] bg-[#f8faf8] text-center text-xs text-[#657066]">
                                                    No QR image uploaded yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {notice && <div className="rounded-xl bg-[#fbeaea] px-4 py-3 text-sm font-semibold text-[#b3413a]">{notice}</div>}

                                <div className="flex items-center justify-end gap-3 border-t border-[#edf2ed] pt-5">
                                    <button
                                        type="button"
                                        onClick={closeEditor}
                                        className="border border-[#dfe3dc] bg-white px-4 py-3 text-sm font-semibold text-[#163b24]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-[#1e2420] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                                    >
                                        <Image size={16} />
                                        {saving ? 'Saving…' : 'Save shop profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </PortalLayout>
        </>
    );
}

function ShopDetail({
    icon: Icon,
    label,
    value,
    className = '',
    multiline = false,
    status,
}: {
    icon: typeof Store;
    label: string;
    value: string;
    className?: string;
    multiline?: boolean;
    status?: boolean;
}) {
    return (
        <div className={`min-w-0 rounded-lg border border-[#edf1ee] bg-white p-3 ${className}`}>
            <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f5ec] text-[#28734c]">
                    <Icon size={15} strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold uppercase text-[#829087]">{label}</p>
                    {status === undefined ? (
                        <p className={`mt-1 text-xs font-medium text-[#33473a] ${multiline ? 'leading-5' : 'truncate'}`}>{value}</p>
                    ) : (
                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${status ? 'bg-[#e7f5eb] text-[#267748]' : 'bg-[#f1f3f1] text-[#68756d]'}`}>
                            {value}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
