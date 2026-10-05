import { PortalLayout } from '@/components/portal-layout';
import { Head, useForm } from '@inertiajs/react';
import { Check, FileText, ImagePlus, LayoutTemplate, Loader2, Save, Sparkles } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type SiteSettings = {
    brand_name?: string;
    logo_path?: string | null;
    login_background_path?: string | null;
    hero_media_path?: string | null;
    hero_media_type?: 'image' | 'video' | null;
    hero_title?: string;
    hero_highlight?: string;
    hero_description?: string;
    cta_label?: string;
    feature_one?: string;
    feature_two?: string;
    feature_three?: string;
    products_title?: string;
    products_subtitle?: string;
    footer_text?: string;
    footer_tagline?: string;
};

type StorageStatusEntry = {
    key: string;
    value: string | null;
    inDatabase: boolean;
    existsOnDisk: boolean;
};

type HomePageProps = {
    siteSettings: SiteSettings;
    storageStatus?: Record<string, StorageStatusEntry>;
};

function imageUrl(path?: string | null) {
    if (!path) return null;
    return path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`;
}

export default function HomepageEditor({ siteSettings, storageStatus }: HomePageProps) {
    const [saved, setSaved] = useState(false);
    const [mediaPreviews, setMediaPreviews] = useState<Record<string, string>>({});
    const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
    const [previewMode, setPreviewMode] = useState<'default' | 'brand'>('default');

    const form = useForm({
        brand_name: siteSettings.brand_name ?? 'BSABShop',
        logo: null as File | null,
        login_background: null as File | null,
        hero_media: null as File | null,
        hero_title: siteSettings.hero_title ?? 'Best picks.',
        hero_highlight: siteSettings.hero_highlight ?? 'Best prices.',
        hero_description: siteSettings.hero_description ?? 'Discover products from every category, curated by our marketplace sellers.',
        cta_label: siteSettings.cta_label ?? 'Shop now',
        feature_one: siteSettings.feature_one ?? 'Fresh & Quality Products',
        feature_two: siteSettings.feature_two ?? 'Trusted Sellers',
        feature_three: siteSettings.feature_three ?? 'Fast & Safe Delivery',
        products_title: siteSettings.products_title ?? 'Featured Products',
        products_subtitle: siteSettings.products_subtitle ?? 'Handpicked for you. Quality products at the best prices.',
        footer_text: siteSettings.footer_text ?? '© 2026 BSABShop Marketplace - every price, checked twice.',
        footer_tagline: siteSettings.footer_tagline ?? 'A greener marketplace for a better tomorrow.',
    });

    const errors = useMemo(() => form.errors as Record<string, string>, [form.errors]);

    useEffect(() => {
        const previews: Record<string, string> = {};
        const sources = [
            ['logo', form.data.logo],
            ['login_background', form.data.login_background],
            ['hero_media', form.data.hero_media],
        ] as const;

        for (const [field, file] of sources) {
            if (file instanceof File) {
                previews[field] = URL.createObjectURL(file);
            }
        }

        setMediaPreviews(previews);

        return () => {
            Object.values(previews).forEach((preview) => URL.revokeObjectURL(preview));
        };
    }, [form.data.logo, form.data.login_background, form.data.hero_media]);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaved(false);
        form.post(route('admin.homepage.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setSaved(true),
            onError: () => setSaved(false),
        });
    }

    function renderImage(field: 'logo' | 'login_background' | 'hero_media', src?: string | null, fallback?: React.ReactNode) {
        const previewUrl = mediaPreviews[field] ?? src;
        const broken = brokenImages[field];

        if (previewUrl && !broken) {
            return <img src={previewUrl} alt={field} className="h-full w-full object-cover" onError={() => setBrokenImages((prev) => ({ ...prev, [field]: true }))} />;
        }

        return fallback ?? null;
    }

    const inputClass = 'w-full rounded-xl border border-[#dfe7e1] bg-white px-3 py-2.5 text-sm text-[#173b27] outline-none transition focus:border-[#2c9350] focus:ring-2 focus:ring-[#e5f3e9]';
    const labelClass = 'grid gap-1.5 text-xs font-semibold text-[#315947]';

    return (
        <>
            <Head title="Homepage Editor" />
            <PortalLayout role="admin" title="Homepage Editor" eyebrow="Storefront settings">
                <div className="mx-auto max-w-6xl space-y-6 p-4 pb-12 md:p-8">
                    <div className="rounded-2xl border border-[#dfe7e1] bg-[#f9fcf9] p-4 shadow-[0_10px_30px_rgba(21,58,36,0.04)] sm:p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#eaf6ee] text-[#1d7a43]">
                                    <LayoutTemplate size={20} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-[#2c9350] uppercase">BSAB-Shop</p>
                                    <h1 className="mt-1 text-2xl font-black text-[#173b27]">Homepage editor</h1>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode((current) => (current === 'default' ? 'brand' : 'default'))}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#dfe7e1] bg-white px-3 py-2 text-xs font-semibold text-[#335d49]"
                                >
                                    <Sparkles size={14} /> {previewMode === 'default' ? 'Brand preview' : 'Default preview'}
                                </button>
                                <button
                                    type="submit"
                                    form="homepage-form"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#1f7a42] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(31,122,66,0.18)] transition hover:bg-[#186738]"
                                >
                                    {form.processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {form.processing ? 'Saving homepage...' : 'Save homepage'}
                                </button>
                            </div>
                        </div>
                        {saved && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#d9f1e2] bg-[#ebfaf0] px-3 py-2 text-sm text-[#236e3d]">
                                <Check size={16} /> Homepage content saved successfully.
                            </div>
                        )}
                    </div>

                    <form id="homepage-form" onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-6">
                            <section className="rounded-2xl border border-[#dfe7e1] bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf6ee] text-[#1d7a43]">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-[#173b27]">Brand & hero</h2>
                                        <p className="text-sm text-[#6a7c70]">Basic storefront branding and homepage messaging.</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className={labelClass}>
                                        Brand name
                                        <input
                                            value={form.data.brand_name}
                                            onChange={(event) => form.setData('brand_name', event.target.value)}
                                            className={inputClass}
                                        />
                                        {errors.brand_name && <span className="font-normal text-red-600">{errors.brand_name}</span>}
                                    </label>
                                    <label className={labelClass}>
                                        CTA label
                                        <input
                                            value={form.data.cta_label}
                                            onChange={(event) => form.setData('cta_label', event.target.value)}
                                            className={inputClass}
                                        />
                                        {errors.cta_label && <span className="font-normal text-red-600">{errors.cta_label}</span>}
                                    </label>
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <label className={labelClass}>
                                        Hero title
                                        <input
                                            value={form.data.hero_title}
                                            onChange={(event) => form.setData('hero_title', event.target.value)}
                                            className={inputClass}
                                        />
                                        {errors.hero_title && <span className="font-normal text-red-600">{errors.hero_title}</span>}
                                    </label>
                                    <label className={labelClass}>
                                        Hero highlight
                                        <input
                                            value={form.data.hero_highlight}
                                            onChange={(event) => form.setData('hero_highlight', event.target.value)}
                                            className={inputClass}
                                        />
                                        {errors.hero_highlight && <span className="font-normal text-red-600">{errors.hero_highlight}</span>}
                                    </label>
                                </div>

                                <label className={`${labelClass} mt-4`}>
                                    Hero description
                                    <textarea
                                        rows={4}
                                        value={form.data.hero_description}
                                        onChange={(event) => form.setData('hero_description', event.target.value)}
                                        className={inputClass}
                                    />
                                    {errors.hero_description && <span className="font-normal text-red-600">{errors.hero_description}</span>}
                                </label>

                                <div className="mt-4 grid gap-4 md:grid-cols-3">
                                    {[
                                        ['feature_one', 'Feature 1'],
                                        ['feature_two', 'Feature 2'],
                                        ['feature_three', 'Feature 3'],
                                    ].map(([field, label]) => (
                                        <label key={field} className={labelClass}>
                                            {label}
                                            <input
                                                value={form.data[field as keyof typeof form.data] as string}
                                                onChange={(event) => form.setData(field as 'feature_one' | 'feature_two' | 'feature_three', event.target.value)}
                                                className={inputClass}
                                            />
                                        </label>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-[#dfe7e1] bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf6ee] text-[#1d7a43]">
                                        <ImagePlus size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-[#173b27]">Marketplace content</h2>
                                        <p className="text-sm text-[#6a7c70]">Featured sections and footer messaging.</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className={labelClass}>
                                        Products title
                                        <input
                                            value={form.data.products_title}
                                            onChange={(event) => form.setData('products_title', event.target.value)}
                                            className={inputClass}
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        Footer tagline
                                        <input
                                            value={form.data.footer_tagline}
                                            onChange={(event) => form.setData('footer_tagline', event.target.value)}
                                            className={inputClass}
                                        />
                                    </label>
                                </div>

                                <label className={`${labelClass} mt-4`}>
                                    Products subtitle
                                    <textarea
                                        rows={3}
                                        value={form.data.products_subtitle}
                                        onChange={(event) => form.setData('products_subtitle', event.target.value)}
                                        className={inputClass}
                                    />
                                </label>

                                <label className={`${labelClass} mt-4`}>
                                    Footer text
                                    <textarea
                                        rows={3}
                                        value={form.data.footer_text}
                                        onChange={(event) => form.setData('footer_text', event.target.value)}
                                        className={inputClass}
                                    />
                                </label>

                            </section>
                        </div>

                        <aside className="space-y-6">
                            <section className="rounded-2xl border border-[#dfe7e1] bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf6ee] text-[#1d7a43]">
                                        <ImagePlus size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-[#173b27]">Brand media</h2>
                                        <p className="text-sm text-[#6a7c70]">Logo, background and hero visuals.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="rounded-xl border border-[#dfe7e1] bg-[#f8fbf8] p-3">
                                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#315947]">
                                            <span>Brand logo</span>
                                            <span className="rounded-full bg-[#eaf6ee] px-2 py-1 text-[10px] text-[#1d7a43]">
                                                {storageStatus?.logo_path?.inDatabase ? 'Stored' : 'Default'}
                                            </span>
                                        </div>
                                        <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl border border-[#dfe7e1] bg-white">
                                            {renderImage('logo', imageUrl(siteSettings.logo_path), (
                                                <span className="text-3xl font-black text-[#2c9350]">{(form.data.brand_name || 'B').slice(0, 1).toUpperCase()}</span>
                                            ))}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                            onChange={(event) => form.setData('logo', event.target.files?.[0] ?? null)}
                                            className="mt-3 w-full text-sm text-[#4d6558] file:mr-3 file:rounded-full file:border-0 file:bg-[#eaf6ee] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#1d7a43]"
                                        />
                                        {errors.logo && <span className="mt-2 block font-normal text-red-600">{errors.logo}</span>}
                                    </div>

                                    <div className="rounded-xl border border-[#dfe7e1] bg-[#f8fbf8] p-3">
                                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#315947]">
                                            <span>Login background</span>
                                            <span className="rounded-full bg-[#eaf6ee] px-2 py-1 text-[10px] text-[#1d7a43]">
                                                {storageStatus?.login_background_path?.inDatabase ? 'Stored' : 'Default'}
                                            </span>
                                        </div>
                                        <div className="h-28 overflow-hidden rounded-xl border border-[#dfe7e1] bg-white">
                                            {renderImage('login_background', imageUrl(siteSettings.login_background_path), (
                                                <div className="flex h-full items-center justify-center text-xs font-medium text-[#71867f]">Using default login background</div>
                                            ))}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={(event) => form.setData('login_background', event.target.files?.[0] ?? null)}
                                            className="mt-3 w-full text-sm text-[#4d6558] file:mr-3 file:rounded-full file:border-0 file:bg-[#eaf6ee] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#1d7a43]"
                                        />
                                        {errors.login_background && <span className="mt-2 block font-normal text-red-600">{errors.login_background}</span>}
                                    </div>

                                    <div className="rounded-xl border border-[#dfe7e1] bg-[#f8fbf8] p-3">
                                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#315947]">
                                            <span>Hero media</span>
                                            <span className="rounded-full bg-[#eaf6ee] px-2 py-1 text-[10px] text-[#1d7a43]">
                                                {siteSettings.hero_media_type ?? 'Image'}
                                            </span>
                                        </div>
                                        <div className="h-32 overflow-hidden rounded-xl border border-[#dfe7e1] bg-white">
                                            {siteSettings.hero_media_path && !brokenImages.hero_media ? (
                                                <img
                                                    src={mediaPreviews.hero_media ?? imageUrl(siteSettings.hero_media_path)}
                                                    alt="Homepage hero media preview"
                                                    className="h-full w-full object-cover"
                                                    onError={() => setBrokenImages((prev) => ({ ...prev, hero_media: true }))}
                                                />
                                            ) : mediaPreviews.hero_media ? (
                                                <img src={mediaPreviews.hero_media} alt="Hero media preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-xs font-medium text-[#71867f]">Using default homepage hero</div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/svg+xml,video/mp4,video/webm,video/quicktime"
                                            onChange={(event) => form.setData('hero_media', event.target.files?.[0] ?? null)}
                                            className="mt-3 w-full text-sm text-[#4d6558] file:mr-3 file:rounded-full file:border-0 file:bg-[#eaf6ee] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#1d7a43]"
                                        />
                                        {errors.hero_media && <span className="mt-2 block font-normal text-red-600">{errors.hero_media}</span>}
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </form>
                </div>
            </PortalLayout>
        </>
    );
}
