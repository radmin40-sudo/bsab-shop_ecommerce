import { PortalLayout } from '@/components/portal-layout';
import { prepareSanctum } from '@/lib/api';
import { optimizeImage } from '@/lib/image-upload';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, CircleCheck, FileText, Image, Link2, PencilLine, ShieldCheck, Smartphone, Store, UserRound, WalletCards, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type ShopPageProps = {
    shop: {
        id: number;
        name: string;
        slug: string;
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
            router.reload({ only: ['shop'] });
        } catch (error) {
            setNotice(error instanceof Error ? error.message : 'Unable to save your shop profile right now.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <Head title="Shop profile" />
            <PortalLayout role="seller" title="Shop profile" eyebrow={shop.name}>
                <div className="space-y-6">
                    <section className="relative overflow-hidden rounded-[30px] border border-[#dfe3dc] bg-[#edf7ed] p-6 shadow-[0_14px_30px_rgba(22,59,36,0.08)]">
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-70"
                            style={{
                                backgroundImage:
                                    "linear-gradient(90deg, rgba(237,247,237,0.9) 0%, rgba(237,247,237,0.8) 45%, rgba(237,247,237,0.25) 100%), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80')",
                            }}
                        />
                        <div className="absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-[#edf7ed]/70 to-transparent" />

                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#dfe3dc] bg-white/80 shadow-[0_10px_24px_rgba(22,59,36,0.12)]">
                                    <Store size={34} className="text-[#1f7a42]" />
                                </div>

                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#b2d9b9] bg-white/80 px-3 py-1 text-xs font-bold text-[#1f7a42]">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dff3e4]">
                                            <Check size={12} />
                                        </span>
                                        Verified Seller
                                    </div>
                                    <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#163b24] sm:text-5xl">{shop.name}</h2>
                                    <p className="mt-1 text-base text-[#163b24] sm:text-xl">Your storefront identity</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={openEditor}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#dfe3dc] bg-white/90 px-4 py-3 text-sm font-semibold text-[#163b24] shadow-[0_8px_16px_rgba(22,59,36,0.08)] transition hover:border-[#2c7a3b] hover:text-[#2c7a3b]"
                            >
                                <PencilLine size={16} />
                                Edit shop profile
                            </button>
                        </div>
                    </section>

                    <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
                        <div className="rounded-3xl border border-[#dfe3dc] bg-white px-6 py-3 shadow-[0_10px_22px_rgba(22,59,36,0.04)]">
                            <div className="flex items-center gap-4 border-b border-[#edf2ed] py-4">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8f5e8] text-[#1f7a42]"><Store size={24} /></span>
                                <div>
                                    <p className="text-xs font-bold tracking-wide text-[#71809b] uppercase">Shop name</p>
                                    <p className="mt-1 text-lg font-semibold text-[#163b24]">{shop.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 border-b border-[#edf2ed] py-4">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8f5e8] text-[#1f7a42]"><Link2 size={24} /></span>
                                <div>
                                    <p className="text-xs font-bold tracking-wide text-[#71809b] uppercase">Shop slug</p>
                                    <p className="mt-1 text-base text-[#163b24]">{shop.slug}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 border-b border-[#edf2ed] py-4">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8f5e8] text-[#1f7a42]"><FileText size={23} /></span>
                                <div>
                                    <p className="text-xs font-bold tracking-wide text-[#71809b] uppercase">Description</p>
                                    <p className="mt-1 text-base leading-6 whitespace-pre-line text-[#163b24]">{shop.description || 'No description added yet.'}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 border-b border-[#edf2ed] py-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3 border-r border-[#edf2ed] sm:pr-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f5e8] text-[#1f7a42]"><CircleCheck size={22} /></span>
                                    <div>
                                        <p className="text-[10px] font-bold tracking-wide text-[#71809b] uppercase">GCash status</p>
                                        <p className="mt-1 inline-flex rounded-full bg-[#e4f4e4] px-3 py-1 text-sm font-semibold text-[#237a3d]">{shop.gcash_enabled ? 'Enabled' : 'Disabled'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f5e8] text-[#1f7a42]"><UserRound size={22} /></span>
                                    <div>
                                        <p className="text-[10px] font-bold tracking-wide text-[#71809b] uppercase">GCash account</p>
                                        <p className="mt-1 text-sm font-semibold text-[#163b24]">{shop.gcash_account_name || 'Not set'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="my-3 flex items-center gap-3 rounded-xl bg-[#eff8ef] px-3 py-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e1f2e2] text-[#1f7a42]"><Smartphone size={21} /></span>
                                <div>
                                    <p className="text-[10px] font-bold tracking-wide text-[#71809b] uppercase">GCash mobile</p>
                                    <p className="mt-1 text-base font-semibold text-[#163b24]">{shop.gcash_mobile_number || 'Not set'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-[#dfe3dc] bg-white p-5 shadow-[0_10px_22px_rgba(22,59,36,0.04)]">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold tracking-tight text-[#1478f2]">G<span className="text-[#2f67f0]">Cash</span></span>
                                    <h3 className="text-xl font-semibold text-[#163b24]">GCash QR Code</h3>
                                </div>

                                <span className="inline-flex items-center gap-2 rounded-full border border-[#c9ddcf] bg-[#edf7ed] px-3 py-1 text-xs font-bold text-[#1f7a42]">
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#dff3e4]">
                                        <ShieldCheck size={10} />
                                    </span>
                                    Secure Payment
                                </span>
                            </div>

                            <p className="mt-3 text-sm text-[#657066]">Scan this QR code to pay using GCash.</p>

                            <div className="mt-5 rounded-[28px] border border-[#e5ebef] bg-[#fbfcfd] p-4 shadow-inner">
                                <div className="rounded-3xl bg-white p-4">
                                    <div className="flex items-center justify-center rounded-[18px] bg-[#f8faf8] p-4">
                                        {shop.gcash_qr_code ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsQrPreviewOpen(true)}
                                                className="cursor-zoom-in rounded-xl bg-[#1268f4] p-4 shadow-[0_12px_20px_rgba(18,104,244,0.22)] transition hover:scale-[1.02] hover:shadow-[0_16px_26px_rgba(18,104,244,0.3)]"
                                                aria-label="Enlarge GCash QR code"
                                            >
                                                <img src={shop.gcash_qr_code} alt="GCash QR code" className="h-44 w-44 rounded-lg bg-white object-contain p-2" />
                                            </button>
                                        ) : (
                                            <div className="flex h-44 w-44 items-center justify-center rounded-xl border border-dashed border-[#c9d5c7] bg-[#f8faf8] text-center text-xs text-[#657066]">
                                                No QR image uploaded yet
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center justify-center gap-2 text-2xl font-bold text-[#1478f2]"><WalletCards size={25} /> GCash</div>
                                    <p className="mt-1 text-center text-sm text-[#657066]">Pay with GCash</p>

                                    <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-bold tracking-[0.14em] text-[#657066] uppercase">
                                        <div className="rounded-xl border border-[#dfe3dc] bg-[#f8faf8] px-2 py-2">Scan</div>
                                        <div className="rounded-xl border border-[#dfe3dc] bg-[#f8faf8] px-2 py-2">Enter Amount</div>
                                        <div className="rounded-xl border border-[#dfe3dc] bg-[#f8faf8] px-2 py-2">Confirm</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="flex flex-col gap-4 rounded-[28px] border border-[#dfe3dc] bg-[#edf7ed] p-5 shadow-[0_10px_22px_rgba(22,59,36,0.04)] sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#dfe3dc] bg-white/90">
                                <Store size={26} className="text-[#1f7a42]" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-semibold text-[#163b24]">Easy &amp; Secure Payment</h3>
                                <p className="mt-1 text-sm text-[#657066]">Use GCash to complete your purchase quickly and safely.</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-serif text-3xl italic text-[#1f7a42] leading-none">Shop Fresh</p>
                            <p className="font-serif text-3xl italic text-[#1f7a42] leading-none">Shop Local</p>
                        </div>
                    </section>
                </div>

                {isQrPreviewOpen && shop.gcash_qr_code && (
                    <div
                        className="fixed inset-0 z-60 flex items-center justify-center bg-[#07130c]/80 p-4 backdrop-blur-sm"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Enlarged GCash QR code"
                        onClick={() => setIsQrPreviewOpen(false)}
                    >
                        <div className="relative max-h-[92vh] max-w-[92vw] rounded-3xl bg-[#1268f4] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                            <button
                                type="button"
                                onClick={() => setIsQrPreviewOpen(false)}
                                className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe3dc] bg-white text-[#163b24] shadow-lg transition hover:bg-[#edf7ed]"
                                aria-label="Close enlarged QR code"
                            >
                                <X size={19} />
                            </button>
                            <img src={shop.gcash_qr_code} alt="Enlarged GCash QR code" className="max-h-[84vh] max-w-[84vw] rounded-2xl bg-white object-contain p-3" />
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
