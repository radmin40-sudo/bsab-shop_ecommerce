import { PortalLayout } from '@/components/portal-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Check, ImagePlus, UsersRound } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

type TeamMember = {
    name: string;
    role: string;
    description: string;
    photo?: string | null;
    photo_upload?: File | null;
    remove_photo?: boolean;
};

type ContentSection = { title: string; content: string; items?: string[] };
type ContactDetails = { email: string; phone: string; address: string; support_hours: string; response_time: string };
type ShippingStep = { title: string; description: string };
type PageContent = {
    title: string;
    slug: string;
    content: string;
    content_sections?: ContentSection[];
    team_members?: TeamMember[];
    hero_image_path?: string | null;
    footer_image_path?: string | null;
    contact_details?: ContactDetails;
};
type PageFormData = {
    title: string;
    content: string;
    content_sections: ContentSection[];
    team_members: TeamMember[];
    contact_details: ContactDetails;
    delivery_options: { local_delivery: boolean; seller_delivery: boolean; pickup: boolean };
    delivery_steps: ShippingStep[];
    hero_image: File | null;
    remove_hero_image: boolean;
    footer_image: File | null;
    remove_footer_image: boolean;
};
type FooterSettings = {
    footer_text: string;
    footer_tagline: string;
    footer_quick_links_title: string;
    footer_care_title: string;
    footer_about_title: string;
    footer_install_title: string;
    footer_install_text: string;
    footer_install_button: string;
    footer_links: Record<string, { label: string; href: string }[]>;
    footer_pages: PageContent[];
};
type DeliveryZone = { id: number; name: string; barangay: string; status: string };

const pageOrder = ['web-dev', 'return-policy', 'privacy-policy', 'terms-conditions', 'sustainability', 'our-story', 'contact-us', 'shipping-info'];
const pageNames: Record<string, string> = {
    'web-dev': 'Team Developers',
    'return-policy': 'Return Policy',
    'privacy-policy': 'Privacy Policy',
    'terms-conditions': 'Terms & Conditions',
    sustainability: 'Sustainability',
    'our-story': 'Our Story',
    'contact-us': 'Contact Us',
    'shipping-info': 'Shipping Information',
};

function imageUrl(path?: string | null) {
    if (!path) return null;
    return path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`;
}

function PageEditor({
    page,
    deliveryOptions,
    deliverySteps,
    deliveryZones,
}: {
    page: PageContent;
    deliveryOptions: PageFormData['delivery_options'];
    deliverySteps: ShippingStep[];
    deliveryZones: DeliveryZone[];
}) {
    const [saved, setSaved] = useState(false);
    const [heroPreview, setHeroPreview] = useState<string | null>(null);
    const [footerPreview, setFooterPreview] = useState<string | null>(null);
    const form = useForm<PageFormData>({
        title: page.title,
        content: page.content,
        content_sections: page.content_sections ?? [],
        team_members: (page.team_members ?? []).map((member) => ({ ...member, photo_upload: null, remove_photo: false })),
        contact_details: page.contact_details ?? { email: '', phone: '', address: '', support_hours: '', response_time: '' },
        delivery_options: { ...deliveryOptions },
        delivery_steps: deliverySteps.map((step) => ({ ...step })),
        hero_image: null,
        remove_hero_image: false,
        footer_image: null,
        remove_footer_image: false,
    });
    const errors = form.errors as Record<string, string>;
    const inputClass =
        'w-full rounded-lg border border-[#dfe8e1] bg-white px-3 py-2.5 text-sm text-[#173b27] outline-none transition focus:border-[#2c9350]';
    const labelClass = 'grid gap-1.5 text-xs font-semibold text-[#315947]';

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaved(false);
        form.transform((data) => {
            const { team_members, contact_details, delivery_options, delivery_steps, ...common } = data;
            return {
                ...common,
                _method: 'put',
                ...(page.slug === 'web-dev' ? { team_members } : {}),
                ...(page.slug === 'contact-us' ? { contact_details } : {}),
                ...(page.slug === 'shipping-info' ? { delivery_options, delivery_steps } : {}),
            };
        });
        form.post(route('admin.footer.pages.update', { slug: page.slug }), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setSaved(true),
        });
    }

    function updateSection(index: number, field: keyof ContentSection, value: string | string[]) {
        form.setData(
            'content_sections',
            form.data.content_sections.map((section, sectionIndex) => (sectionIndex === index ? { ...section, [field]: value } : section)),
        );
    }

    function updateMember(index: number, field: keyof TeamMember, value: string | File | boolean | null) {
        form.setData(
            'team_members',
            form.data.team_members.map((member, memberIndex) => (memberIndex === index ? { ...member, [field]: value } : member)),
        );
    }

    const currentHero = imageUrl(page.hero_image_path);
    const currentFooter = imageUrl(page.footer_image_path);

    useEffect(() => {
        if (!form.data.hero_image) {
            setHeroPreview(null);
            return;
        }
        const url = URL.createObjectURL(form.data.hero_image);
        setHeroPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.hero_image]);

    useEffect(() => {
        if (!form.data.footer_image) {
            setFooterPreview(null);
            return;
        }
        const url = URL.createObjectURL(form.data.footer_image);
        setFooterPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.footer_image]);

    return (
        <form onSubmit={submit} className="rounded-2xl border border-[#dcebe0] bg-white p-5 shadow-sm sm:p-7">
            <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4ec] text-[#267443]">
                        {page.slug === 'web-dev' ? <UsersRound size={21} /> : <ImagePlus size={21} />}
                    </span>
                    <div>
                        <h2 className="font-display text-xl font-bold text-[#173b27]">{pageNames[page.slug] ?? page.title}</h2>
                        <p className="mt-1 text-sm text-[#6a7c70]">Edit and save this page without changing any other page.</p>
                    </div>
                </div>
                <Link
                    href={route('footer-pages.show', { slug: page.slug })}
                    target="_blank"
                    className="text-xs font-semibold text-[#1f7a42] hover:underline"
                >
                    Preview public page
                </Link>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                <label className={labelClass}>
                    Page title
                    <input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} className={inputClass} />
                    {errors.title && <span className="font-normal text-red-600">{errors.title}</span>}
                </label>
                <label className={`${labelClass} md:col-span-1`}>
                    Page description / introduction
                    <textarea
                        rows={3}
                        value={form.data.content}
                        onChange={(event) => form.setData('content', event.target.value)}
                        className={inputClass}
                    />
                    {errors.content && <span className="font-normal text-red-600">{errors.content}</span>}
                </label>
            </div>
            <aside className="mt-4 rounded-xl border border-[#dcebe0] bg-[#f7fbf7] p-4">
                <p className="text-xs font-bold tracking-wide text-[#4e8b62] uppercase">Live text and image preview</p>
                <div className="mt-2 flex items-center gap-4">
                    {(heroPreview || currentHero) && (
                        <img src={heroPreview ?? currentHero ?? ''} alt="" className="h-16 w-28 rounded-lg object-cover" />
                    )}
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-[#173b27]">{form.data.title || 'Page title'}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6a7c70]">{form.data.content || 'Page introduction preview'}</p>
                    </div>
                </div>
            </aside>

            {form.data.content_sections.length > 0 && (
                <section className="mt-5">
                    <div className="mb-3">
                        <h3 className="font-semibold text-[#315947]">Page sections</h3>
                        <p className="mt-1 text-xs text-[#6a7c70]">Edit the section headings and copy shown on this public page.</p>
                    </div>
                    <div className="space-y-3">
                        {form.data.content_sections.map((section, index) => (
                            <div key={`section-${index}`} className="grid gap-3 rounded-xl border border-[#e4ebe6] bg-[#fbfdfb] p-3 sm:p-4">
                                <label className={labelClass}>
                                    Section heading
                                    <input
                                        value={section.title}
                                        onChange={(event) => updateSection(index, 'title', event.target.value)}
                                        className={inputClass}
                                    />
                                    {errors[`content_sections.${index}.title`] && (
                                        <span className="font-normal text-red-600">{errors[`content_sections.${index}.title`]}</span>
                                    )}
                                </label>
                                <label className={labelClass}>
                                    Section content
                                    <textarea
                                        rows={3}
                                        value={section.content}
                                        onChange={(event) => updateSection(index, 'content', event.target.value)}
                                        className={inputClass}
                                    />
                                    {errors[`content_sections.${index}.content`] && (
                                        <span className="font-normal text-red-600">{errors[`content_sections.${index}.content`]}</span>
                                    )}
                                </label>
                                {section.items && (
                                    <label className={labelClass}>
                                        List items (one item per line)
                                        <textarea
                                            rows={Math.min(Math.max(section.items.length, 3), 8)}
                                            value={section.items.join('\n')}
                                            onChange={(event) => updateSection(index, 'items', event.target.value.split('\n'))}
                                            className={inputClass}
                                        />
                                    </label>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {page.slug === 'web-dev' && (
                <section className="mt-5">
                    <h3 className="mb-3 font-semibold text-[#315947]">Team members and profile photos</h3>
                    <div className="space-y-3">
                        {form.data.team_members.map((member, index) => (
                            <div
                                key={`member-${index}`}
                                className="grid gap-3 rounded-xl border border-[#e4ebe6] bg-[#fbfdfb] p-3 sm:grid-cols-2 sm:p-4"
                            >
                                <label className={labelClass}>
                                    Name
                                    <input
                                        value={member.name}
                                        onChange={(event) => updateMember(index, 'name', event.target.value)}
                                        className={inputClass}
                                    />
                                    {errors[`team_members.${index}.name`] && (
                                        <span className="font-normal text-red-600">{errors[`team_members.${index}.name`]}</span>
                                    )}
                                </label>
                                <label className={labelClass}>
                                    Role
                                    <input
                                        value={member.role}
                                        onChange={(event) => updateMember(index, 'role', event.target.value)}
                                        className={inputClass}
                                    />
                                </label>
                                <label className={`${labelClass} sm:col-span-2`}>
                                    Description
                                    <textarea
                                        rows={2}
                                        value={member.description}
                                        onChange={(event) => updateMember(index, 'description', event.target.value)}
                                        className={inputClass}
                                    />
                                </label>
                                <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                                    {imageUrl(member.photo) && (
                                        <img
                                            src={imageUrl(member.photo) ?? ''}
                                            alt={`${member.name} profile preview`}
                                            className="size-14 rounded-full border border-[#dcebe0] object-cover"
                                        />
                                    )}
                                    <label className={`${labelClass} min-w-0 flex-1`}>
                                        Replace profile photo
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={(event) => updateMember(index, 'photo_upload', event.target.files?.[0] ?? null)}
                                            className="text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#eaf4ec] file:px-3 file:py-2 file:font-semibold file:text-[#267443]"
                                        />
                                    </label>
                                    {member.photo && (
                                        <label className="flex items-center gap-2 text-xs text-[#526c5d]">
                                            <input
                                                type="checkbox"
                                                checked={member.remove_photo ?? false}
                                                onChange={(event) => updateMember(index, 'remove_photo', event.target.checked)}
                                            />{' '}
                                            Remove photo
                                        </label>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {page.slug === 'contact-us' && (
                <section className="mt-5">
                    <h3 className="mb-3 font-semibold text-[#315947]">Contact details and support hours</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {(
                            [
                                ['email', 'Support email'],
                                ['phone', 'Phone number'],
                                ['address', 'Office address'],
                                ['support_hours', 'Support hours'],
                                ['response_time', 'Response time'],
                            ] as const
                        ).map(([key, label]) => (
                            <label key={key} className={labelClass}>
                                {label}
                                <input
                                    value={form.data.contact_details[key]}
                                    onChange={(event) => form.setData('contact_details', { ...form.data.contact_details, [key]: event.target.value })}
                                    className={inputClass}
                                />
                                {errors[`contact_details.${key}`] && (
                                    <span className="font-normal text-red-600">{errors[`contact_details.${key}`]}</span>
                                )}
                            </label>
                        ))}
                    </div>
                </section>
            )}

            {page.slug === 'shipping-info' && (
                <section className="mt-5 rounded-xl border border-[#e4ebe6] bg-[#fbfdfb] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-[#315947]">Delivery configuration</h3>
                            <p className="mt-1 text-xs text-[#6a7c70]">
                                These options and steps are saved with this page. Manage delivery zones using the existing zone editor.
                            </p>
                        </div>
                        <Link href={route('admin.shipping')} className="text-xs font-semibold text-[#1f7a42] hover:underline">
                            Manage delivery zones
                        </Link>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4">
                        {(
                            [
                                ['local_delivery', 'Local delivery'],
                                ['seller_delivery', 'Seller delivery'],
                                ['pickup', 'Pickup'],
                            ] as const
                        ).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-2 text-sm text-[#315947]">
                                <input
                                    type="checkbox"
                                    checked={form.data.delivery_options[key]}
                                    onChange={(event) =>
                                        form.setData('delivery_options', { ...form.data.delivery_options, [key]: event.target.checked })
                                    }
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {form.data.delivery_steps.map((step, index) => (
                            <div key={`delivery-step-${index}`} className="grid gap-2 rounded-lg border border-[#e4ebe6] bg-white p-3">
                                <label className={labelClass}>
                                    Step {index + 1} title
                                    <input
                                        value={step.title}
                                        onChange={(event) =>
                                            form.setData(
                                                'delivery_steps',
                                                form.data.delivery_steps.map((item, i) =>
                                                    i === index ? { ...item, title: event.target.value } : item,
                                                ),
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </label>
                                <label className={labelClass}>
                                    Description
                                    <textarea
                                        rows={2}
                                        value={step.description}
                                        onChange={(event) =>
                                            form.setData(
                                                'delivery_steps',
                                                form.data.delivery_steps.map((item, i) =>
                                                    i === index ? { ...item, description: event.target.value } : item,
                                                ),
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </label>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-[#6a7c70]">
                        Delivery options are{' '}
                        {deliveryOptions.local_delivery || deliveryOptions.seller_delivery || deliveryOptions.pickup
                            ? 'configured below'
                            : 'currently disabled'}
                        .
                    </p>
                    <div className="mt-3 rounded-lg border border-[#e4ebe6] bg-white p-3">
                        <p className="text-xs font-semibold text-[#315947]">Configured delivery zones ({deliveryZones.length})</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {deliveryZones.map((zone) => (
                                <span key={zone.id} className="rounded-full bg-[#edf6ee] px-3 py-1 text-xs text-[#315947]">
                                    {zone.barangay} · {zone.status}
                                </span>
                            ))}
                            {deliveryZones.length === 0 && <span className="text-xs text-[#718175]">No delivery zones configured.</span>}
                        </div>
                    </div>
                </section>
            )}

            <section className="mt-5 grid gap-3 sm:grid-cols-2">
                {(
                    [
                        ['hero_image', 'remove_hero_image', 'Hero image', currentHero],
                        ['footer_image', 'remove_footer_image', 'Footer / supporting image', currentFooter],
                    ] as const
                ).map(([key, removeKey, label, current]) => (
                    <div key={key} className="rounded-xl border border-[#e4ebe6] bg-[#fbfdfb] p-3">
                        <label className={labelClass}>
                            {label} (optional replacement)
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) => form.setData(key, event.target.files?.[0] ?? null)}
                                className="text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#eaf4ec] file:px-3 file:py-2 file:font-semibold file:text-[#267443]"
                            />
                            {errors[key] && <span className="font-normal text-red-600">{errors[key]}</span>}
                        </label>
                        <div className="mt-3 flex min-h-16 items-center gap-3">
                            {(key === 'hero_image' ? heroPreview : footerPreview) || current ? (
                                <img
                                    src={(key === 'hero_image' ? heroPreview : footerPreview) ?? current ?? ''}
                                    alt={`${label} preview`}
                                    className="h-16 w-28 rounded-lg border border-[#dcebe0] object-cover"
                                />
                            ) : (
                                <p className="text-xs text-[#7b8f80]">The current illustrated image is retained unless you upload a replacement.</p>
                            )}
                            {current && (
                                <label className="flex items-center gap-2 text-xs text-[#526c5d]">
                                    <input
                                        type="checkbox"
                                        checked={form.data[removeKey]}
                                        onChange={(event) => form.setData(removeKey, event.target.checked)}
                                    />{' '}
                                    Remove saved image
                                </label>
                            )}
                        </div>
                    </div>
                ))}
            </section>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#188747] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#126d39] disabled:cursor-wait disabled:opacity-50"
                >
                    <Check size={16} /> {form.processing ? `Saving ${pageNames[page.slug]}...` : `Submit ${pageNames[page.slug]}`}
                </button>
                {saved && (
                    <p role="status" className="text-sm font-medium text-[#176b3b]">
                        {pageNames[page.slug]} saved successfully.
                    </p>
                )}
                {Object.keys(errors).length > 0 && (
                    <p role="alert" className="text-sm font-medium text-red-700">
                        Please correct the highlighted fields.
                    </p>
                )}
            </div>
        </form>
    );
}

export default function AdminFooter({
    siteSettings,
    deliveryZones = [],
    deliveryOptions,
    deliverySteps = [],
}: {
    siteSettings: Partial<FooterSettings>;
    deliveryZones?: DeliveryZone[];
    deliveryOptions: PageFormData['delivery_options'];
    deliverySteps?: ShippingStep[];
}) {
    const pages = [...(siteSettings.footer_pages ?? [])]
        .filter((page) => pageOrder.includes(page.slug))
        .sort((a, b) => pageOrder.indexOf(a.slug) - pageOrder.indexOf(b.slug));

    return (
        <>
            <Head title="Content management" />
            <PortalLayout role="admin" title="Content management" eyebrow="Storefront content">
                <main className="mx-auto max-w-6xl space-y-6">
                    <header className="rounded-2xl border border-[#dcebe0] bg-white p-5 shadow-sm sm:p-7">
                        <p className="text-xs font-bold tracking-[0.18em] text-[#4e8b62] uppercase">Storefront</p>
                        <h1 className="font-display mt-1 text-2xl font-bold text-[#173b27] sm:text-3xl">Informational page editor</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6a7c70]">
                            Edit each public page below. Every section saves independently; unsaved edits in other sections remain untouched.
                        </p>
                    </header>
                    {pages.map((page) => (
                        <PageEditor
                            key={page.slug}
                            page={page}
                            deliveryOptions={deliveryOptions}
                            deliverySteps={deliverySteps}
                            deliveryZones={deliveryZones}
                        />
                    ))}
                    {deliveryZones.length > 0 && (
                        <p className="sr-only" aria-hidden="true">
                            {deliveryZones.map((zone) => `${zone.name} ${zone.barangay} ${zone.status}`).join(', ')}
                        </p>
                    )}
                </main>
            </PortalLayout>
        </>
    );
}
