import { informationalPageImage } from '@/lib/informational-page-image';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BadgeHelp,
    CalendarDays,
    Check,
    Clock3,
    ExternalLink,
    Facebook,
    Headphones,
    Leaf,
    Mail,
    MapPin,
    MessageCircle,
    MessageSquare,
    PackageSearch,
    Phone,
    Send,
    Sprout,
    UserRound,
    Wallet,
    Youtube,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { type FormEvent } from 'react';

type FooterPageContent = {
    title: string;
    slug: string;
    content: string;
    hero_image_path?: string | null;
    contact_details?: { email: string; phone: string; address: string; support_hours: string; response_time: string };
    content_sections?: { title: string; content: string }[];
};

const forest = '#145c38';

function FarmLandscape({ footer = false }: { footer?: boolean }) {
    return (
        <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-full"
            viewBox="0 0 680 220"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
        >
            <defs>
                <linearGradient id={footer ? 'footerSky' : 'heroSky'} x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#e4f7f0" />
                    <stop offset="1" stopColor="#b7dfc1" />
                </linearGradient>
                <linearGradient id={footer ? 'footerField' : 'heroField'} x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#9ccf82" />
                    <stop offset="1" stopColor="#3c9a53" />
                </linearGradient>
            </defs>
            <path fill={footer ? 'url(#footerSky)' : 'url(#heroSky)'} d="M0 0h680v220H0z" />
            <circle cx="530" cy="44" r="22" fill="#fff5c4" opacity=".86" />
            <path d="m215 112 115-89 77 59 79-66 194 112v92H215z" fill="#a7cfa4" />
            <path d="m330 23 77 59 79-66 52 31-93-16-38 41-59-32-59 33-74 16z" fill="#d4e9c8" />
            <path d="m0 137 130-66 109 58 105-52 163 55v88H0z" fill="#7fb878" />
            <path d="M0 169c141-41 302-33 440 0 84 20 164 16 240-8v59H0z" fill={footer ? 'url(#footerField)' : 'url(#heroField)'} />
            <path
                d="M347 220c72-37 152-55 239-62M402 220c68-28 140-39 231-39M462 220c64-20 126-25 171-25"
                stroke="#d8edb9"
                strokeWidth="4"
                opacity=".85"
            />
            <path
                d="M106 186c-10-23-9-43 4-59m-4 43c-16-18-21-31-19-45m19 33c12-20 18-33 18-49"
                stroke="#397e45"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path d="M104 153c-13 1-19-4-23-13 13-2 20 2 23 13m5 1c13-1 20-7 23-16-14 0-21 5-23 16" fill="#4b9b55" />
            <path
                d="M584 161c-10-21-8-40 5-56m-4 43c-15-16-20-29-18-42m18 30c11-19 17-31 17-46"
                stroke="#317646"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path d="M585 127c-13 1-19-4-23-13 13-2 20 2 23 13m5 1c13-1 20-7 23-16-14 0-21 5-23 16" fill="#438b4c" />
            {!footer && (
                <g transform="translate(125 0)">
                    <path d="M175 128 215 94l41 34h-81Z" fill="#fff" stroke="#b9d8c0" strokeWidth="3" />
                    <path d="m195 111 20-17 20 17-20 17-20-17Z" stroke="#b9d8c0" strokeWidth="2" />
                    <path d="m215 94 20 17-20 17m-20-17h40" stroke="#b9d8c0" strokeWidth="2" />
                    <path d="M214 52c0-15 12-27 27-27s27 12 27 27c0 20-27 49-27 49s-27-29-27-49Z" fill={forest} />
                    <circle cx="241" cy="52" r="9" fill="#e7f5e8" />
                    <g transform="translate(294 118)">
                        <path d="M0 0h42l15 12h31v27H0z" fill="#174b31" />
                        <path d="M8 6h27v18H8z" fill="#d9eee0" />
                        <path d="M42 4v20h16L42 4Z" fill="#bfe2c9" />
                        <circle cx="18" cy="40" r="8" fill="#123d29" />
                        <circle cx="18" cy="40" r="3" fill="#e7f5e8" />
                        <circle cx="69" cy="40" r="8" fill="#123d29" />
                        <circle cx="69" cy="40" r="3" fill="#e7f5e8" />
                    </g>
                </g>
            )}
        </svg>
    );
}

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
    return (
        <div className="mb-4 flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#145c38] text-sm font-bold text-white shadow-sm">
                {number}
            </span>
            <div className="min-w-0 pt-0.5">
                <h2 className="text-base leading-5 font-bold text-[#183a2a] sm:text-lg">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-[#557264]">{description}</p>
            </div>
        </div>
    );
}

function ContactCard({
    icon: Icon,
    title,
    description,
    detail,
    badge,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    detail: string;
    badge?: string;
}) {
    return (
        <div className="rounded-xl border border-[#e1f0e7] bg-[#f1f9f4] p-4 transition hover:border-[#b7dbc4] hover:shadow-sm sm:p-5">
            <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-[#17633d] text-white shadow-sm">
                <Icon size={21} strokeWidth={2.2} />
            </span>
            <h3 className="text-sm font-bold text-[#183a2a]">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-[#557264]">{description}</p>
            <p className="mt-2 text-xs leading-5 font-bold wrap-break-word text-[#17633d]">{detail}</p>
            {badge && <span className="mt-2 inline-flex rounded-full bg-[#208447] px-2.5 py-1 text-[10px] font-semibold text-white">{badge}</span>}
        </div>
    );
}

const quickHelp = [
    { icon: PackageSearch, title: 'Order Inquiries', description: 'Track your order and delivery status.' },
    { icon: Wallet, title: 'Returns & Refunds', description: 'Learn about our return policy.' },
    { icon: UserRound, title: 'Account Help', description: 'Manage your account and settings.' },
    { icon: BadgeHelp, title: 'Product Support', description: 'Get help with product issues.' },
];

const preparationTips = [
    'Have your order number ready (if applicable).',
    'Include clear details about your concern.',
    'Attach photos or screenshots (if relevant).',
    'Check your spam folder for our email replies.',
    'Be patient — we’ll get back to you as soon as possible.',
];

export default function ContactUs({ footerPage, success }: { footerPage: FooterPageContent; success: string | null }) {
    const details = footerPage.contact_details ?? {
        email: 'support@bsab-shop.com',
        phone: '+63 912 345 6789',
        address: 'Hinobaan, Negros Occidental, Philippines',
        support_hours: 'Monday–Saturday, 8:00 AM–5:00 PM (Philippine Standard Time)',
        response_time: '24 hours',
    };
    const section = (index: number, title: string, description: string) => ({
        title: footerPage.content_sections?.[index]?.title ?? title,
        description: footerPage.content_sections?.[index]?.content ?? description,
    });
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/pages/contact-us', {
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Head title={footerPage?.title ?? 'Contact Us'} />
            <main className="min-h-screen bg-white px-3 py-3 text-[#183a2a] sm:px-5 sm:py-5">
                <div className="mx-auto max-w-375">
                    <Link
                        href="/"
                        className="mb-3 inline-flex items-center gap-2 px-1 text-xs font-semibold text-[#17633d] transition hover:text-[#0d4329]"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Back
                    </Link>

                    <section className="relative isolate mb-4 overflow-hidden rounded-xl border border-[#dcefe4] bg-[#edf8f2] px-5 py-6 sm:px-7 sm:py-7 lg:min-h-51 lg:px-8">
                        <FarmLandscape />
                        {footerPage.hero_image_path && (
                            <img
                                src={informationalPageImage(footerPage.hero_image_path) ?? ''}
                                alt=""
                                className="absolute inset-y-0 right-0 h-full w-1/2 object-cover object-center"
                            />
                        )}
                        <div className="absolute inset-0 bg-linear-to-r from-[#edf8f2] via-[#edf8f2]/95 to-transparent" />
                        <div className="relative z-10 flex max-w-112.5 items-start gap-4 sm:gap-5">
                            <span className="mt-1 flex size-16 shrink-0 items-center justify-center rounded-xl bg-[#145c38] text-white shadow-sm sm:size-19">
                                <Headphones size={39} strokeWidth={2.1} />
                            </span>
                            <div>
                                <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-[#133b2b] sm:text-4xl lg:text-[42px]">
                                    {footerPage.title ?? 'Contact Us'}
                                </h1>
                                <p className="mt-2 max-w-68.75 text-sm leading-6 text-[#48695a]">{footerPage.content}</p>
                            </div>
                        </div>
                        <p className="font-display absolute right-4 bottom-3 z-10 hidden max-w-42.5 -rotate-3 text-right text-sm leading-5 font-bold text-[#1c5738] italic sm:right-5 sm:bottom-4 sm:block sm:text-base">
                            Together for a Stronger Local Agriculture Community
                            <Sprout className="ml-1 inline-block text-[#3d8b4a]" size={20} />
                        </p>
                    </section>

                    <div className="grid gap-3 md:grid-cols-[1.15fr_1fr] md:items-start">
                        <div className="space-y-3">
                            <section className="rounded-xl border border-[#dcecf2] bg-white p-4 sm:p-5">
                                <SectionHeading
                                    number="1"
                                    title={
                                        section(
                                            0,
                                            'Contact Methods',
                                            'Choose the best way to reach us. We’re available during our support hours and will get back to you as soon as possible.',
                                        ).title
                                    }
                                    description={
                                        section(
                                            0,
                                            'Contact Methods',
                                            'Choose the best way to reach us. We’re available during our support hours and will get back to you as soon as possible.',
                                        ).description
                                    }
                                />
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <ContactCard
                                        icon={MessageCircle}
                                        title="Live Chat"
                                        description="Get instant help from our support team during support hours."
                                        detail="Chat with our team"
                                        badge="Available"
                                    />
                                    <ContactCard
                                        icon={Mail}
                                        title="Email Us"
                                        description={`Send us a message and we’ll reply within ${details.response_time}.`}
                                        detail={details.email}
                                    />
                                    <ContactCard
                                        icon={Phone}
                                        title="Call Us"
                                        description="Speak with our support team during business hours."
                                        detail={details.phone}
                                    />
                                    <ContactCard
                                        icon={MapPin}
                                        title="Visit Us"
                                        description={`Our local office is in ${details.address}.`}
                                        detail={details.address}
                                    />
                                </div>
                            </section>

                            <section className="rounded-xl border border-[#dcecf2] bg-white p-4 sm:p-5">
                                <SectionHeading
                                    number="3"
                                    title={
                                        section(2, 'Quick Help & FAQ', 'Find answers to common questions and get quick help with your concerns.')
                                            .title
                                    }
                                    description={
                                        section(2, 'Quick Help & FAQ', 'Find answers to common questions and get quick help with your concerns.')
                                            .description
                                    }
                                />
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {quickHelp.map(({ icon: Icon, title, description }) => (
                                        <Link
                                            key={title}
                                            href={title === 'Returns & Refunds' ? '/pages/return-policy' : '/pages/contact-us'}
                                            className="group rounded-xl border border-[#e1f0e7] bg-[#f1f9f4] p-3 transition hover:border-[#b7dbc4] hover:bg-[#e8f5ec]"
                                        >
                                            <span className="mb-2 flex size-8 items-center justify-center rounded-full bg-[#17633d] text-white">
                                                <Icon size={17} />
                                            </span>
                                            <h3 className="text-xs leading-4 font-bold text-[#183a2a]">{title}</h3>
                                            <p className="mt-1 min-h-8 text-[11px] leading-4 text-[#557264]">{description}</p>
                                            <ArrowRight className="mt-1 text-[#17633d] transition group-hover:translate-x-1" size={16} />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <section className="rounded-xl border border-[#dcecf2] bg-white p-4 sm:p-5">
                            <SectionHeading
                                number="2"
                                title={
                                    section(1, 'Send Us a Message', 'Fill out the form below and we’ll get back to you as soon as possible.').title
                                }
                                description={
                                    section(1, 'Send Us a Message', 'Fill out the form below and we’ll get back to you as soon as possible.')
                                        .description
                                }
                            />
                            {success && (
                                <p
                                    role="status"
                                    className="mb-3 rounded-lg border border-[#b9dfc5] bg-[#eff9f1] px-3 py-2 text-xs font-medium text-[#145c38]"
                                >
                                    {success}
                                </p>
                            )}
                            <form className="space-y-3" method="post" onSubmit={submit}>
                                <div>
                                    <label htmlFor="contact-name" className="mb-1 block text-xs font-semibold text-[#284a39]">
                                        Full Name <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="contact-name"
                                        name="name"
                                        autoComplete="name"
                                        required
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        placeholder="Enter your full name"
                                        aria-invalid={Boolean(form.errors.name)}
                                        className="w-full rounded-lg border border-[#dce8ed] px-3 py-2.5 text-sm text-[#183a2a] transition outline-none placeholder:text-[#9aaeb7] focus:border-[#288253] focus:ring-2 focus:ring-[#288253]/15"
                                    />
                                    {form.errors.name && <p className="mt-1 text-xs text-red-700">{form.errors.name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="mb-1 block text-xs font-semibold text-[#284a39]">
                                        Email Address <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="contact-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={form.data.email}
                                        onChange={(event) => form.setData('email', event.target.value)}
                                        placeholder="Enter your email address"
                                        aria-invalid={Boolean(form.errors.email)}
                                        className="w-full rounded-lg border border-[#dce8ed] px-3 py-2.5 text-sm text-[#183a2a] transition outline-none placeholder:text-[#9aaeb7] focus:border-[#288253] focus:ring-2 focus:ring-[#288253]/15"
                                    />
                                    {form.errors.email && <p className="mt-1 text-xs text-red-700">{form.errors.email}</p>}
                                </div>
                                <div>
                                    <label htmlFor="contact-phone" className="mb-1 block text-xs font-semibold text-[#284a39]">
                                        Phone Number <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="contact-phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        required
                                        value={form.data.phone}
                                        onChange={(event) => form.setData('phone', event.target.value)}
                                        placeholder="Enter your phone number"
                                        aria-invalid={Boolean(form.errors.phone)}
                                        className="w-full rounded-lg border border-[#dce8ed] px-3 py-2.5 text-sm text-[#183a2a] transition outline-none placeholder:text-[#9aaeb7] focus:border-[#288253] focus:ring-2 focus:ring-[#288253]/15"
                                    />
                                    {form.errors.phone && <p className="mt-1 text-xs text-red-700">{form.errors.phone}</p>}
                                </div>
                                <div>
                                    <label htmlFor="contact-subject" className="mb-1 block text-xs font-semibold text-[#284a39]">
                                        Subject <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        id="contact-subject"
                                        name="subject"
                                        required
                                        value={form.data.subject}
                                        onChange={(event) => form.setData('subject', event.target.value)}
                                        aria-invalid={Boolean(form.errors.subject)}
                                        className="w-full rounded-lg border border-[#dce8ed] bg-white px-3 py-2.5 text-sm text-[#78909c] transition outline-none focus:border-[#288253] focus:ring-2 focus:ring-[#288253]/15"
                                    >
                                        <option value="" disabled>
                                            Select a subject
                                        </option>
                                        <option>Order inquiry</option>
                                        <option>Returns & refunds</option>
                                        <option>Account help</option>
                                        <option>Product support</option>
                                        <option>Other</option>
                                    </select>
                                    {form.errors.subject && <p className="mt-1 text-xs text-red-700">{form.errors.subject}</p>}
                                </div>
                                <div>
                                    <label htmlFor="contact-message" className="mb-1 block text-xs font-semibold text-[#284a39]">
                                        Message <span className="text-red-600">*</span>
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        required
                                        rows={5}
                                        value={form.data.message}
                                        onChange={(event) => form.setData('message', event.target.value)}
                                        placeholder="Tell us how we can help you..."
                                        aria-invalid={Boolean(form.errors.message)}
                                        className="w-full resize-y rounded-lg border border-[#dce8ed] px-3 py-2.5 text-sm text-[#183a2a] transition outline-none placeholder:text-[#9aaeb7] focus:border-[#288253] focus:ring-2 focus:ring-[#288253]/15"
                                    />
                                    {form.errors.message && <p className="mt-1 text-xs text-red-700">{form.errors.message}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#146238] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0e4d2c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146238] disabled:cursor-wait disabled:opacity-70"
                                >
                                    <Send size={16} fill="currentColor" /> {form.processing ? 'Sending…' : 'Send Message'}
                                </button>
                            </form>
                        </section>
                    </div>

                    <section className="relative isolate mt-3 overflow-hidden rounded-xl border border-[#dcefe4] bg-[#eff8f3] px-4 py-5 sm:px-6 sm:py-6">
                        <div className="absolute inset-0 bg-linear-to-r from-[#eff8f3] via-[#eff8f3]/90 to-transparent" />
                        <FarmLandscape footer />
                        <div className="relative z-10">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-full bg-[#145c38] text-white">
                                        <Clock3 size={21} />
                                    </span>
                                    <div>
                                        <h2 className="text-base font-bold text-[#183a2a] sm:text-lg">Our Support Hours</h2>
                                        <p className="mt-1 text-xs text-[#557264]">We’re here to assist you during the following hours:</p>
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-4 pl-1 sm:pl-12 md:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                        <CalendarDays className="shrink-0 text-[#145c38]" size={27} />
                                        <div className="text-xs leading-5 text-[#315a43]">
                                            <p className="font-semibold">{details.support_hours}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 border-t border-[#c6dfce] pt-3 md:border-t-0 md:border-l md:pt-0 md:pl-5">
                                        <Zap className="shrink-0 text-[#145c38]" size={24} fill="currentColor" />
                                        <div className="text-xs leading-5 text-[#315a43]">
                                            <p className="font-semibold">Response Time</p>
                                            <p>We typically respond within</p>
                                            <p className="font-bold text-[#183a2a]">
                                                {details.response_time} <span className="font-normal">(except on weekends and holidays).</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <section className="rounded-xl border border-[#dcecf2] bg-white p-4 sm:p-5">
                            <SectionHeading
                                number="5"
                                title={
                                    section(
                                        4,
                                        'Additional Ways to Reach Us',
                                        'You can also follow us on our official channels for updates, news, and announcements.',
                                    ).title
                                }
                                description="You can also follow us on our official channels for updates, news, and announcements."
                            />
                            <div className="grid gap-2 sm:grid-cols-2">
                                <a
                                    href="https://www.facebook.com/BSABShop"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 rounded-xl border border-[#e1f0e7] bg-[#f1f9f4] p-3 transition hover:border-[#b7dbc4]"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-full bg-[#1877f2] text-white">
                                        <Facebook size={21} fill="currentColor" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <strong className="block text-xs text-[#183a2a]">Facebook</strong>
                                        <span className="mt-1 block text-[11px] text-[#557264]">@BSAB-Shop</span>
                                    </span>
                                    <ExternalLink size={14} className="text-[#17633d]" />
                                </a>
                                <a
                                    href="https://m.me/BSABShop"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 rounded-xl border border-[#e1f0e7] bg-[#f1f9f4] p-3 transition hover:border-[#b7dbc4]"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-full bg-[#1687ff] text-white">
                                        <MessageCircle size={20} fill="currentColor" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <strong className="block text-xs text-[#183a2a]">Messenger</strong>
                                        <span className="mt-1 block text-[11px] text-[#557264]">Chat with us</span>
                                    </span>
                                    <ExternalLink size={14} className="text-[#17633d]" />
                                </a>
                                <a
                                    href="https://www.youtube.com/@BSABShop"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 rounded-xl border border-[#e1f0e7] bg-[#f1f9f4] p-3 transition hover:border-[#b7dbc4]"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-full bg-[#e62117] text-white">
                                        <Youtube size={22} fill="currentColor" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <strong className="block text-xs text-[#183a2a]">YouTube</strong>
                                        <span className="mt-1 block text-[11px] text-[#557264]">@BSAB-Shop</span>
                                    </span>
                                    <ExternalLink size={14} className="text-[#17633d]" />
                                </a>
                                <a
                                    href="/#announcements"
                                    className="flex items-center gap-3 rounded-xl border border-[#e1f0e7] bg-[#f1f9f4] p-3 transition hover:border-[#b7dbc4]"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-full bg-[#17633d] text-white">
                                        <MessageSquare size={20} fill="currentColor" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <strong className="block text-xs text-[#183a2a]">Announcements</strong>
                                        <span className="mt-1 block text-[11px] text-[#557264]">Latest updates and promos</span>
                                    </span>
                                    <ExternalLink size={14} className="text-[#17633d]" />
                                </a>
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#dcecf2] bg-white p-4 sm:p-5">
                            <SectionHeading
                                number="6"
                                title={section(5, 'Before You Contact Us', 'Here are a few tips to help us assist you faster:').title}
                                description="Here are a few tips to help us assist you faster:"
                            />
                            <ul className="space-y-3 pt-1">
                                {preparationTips.map((tip) => (
                                    <li key={tip} className="flex items-start gap-3 text-xs leading-5 text-[#315a43] sm:text-sm">
                                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#16703e] text-white">
                                            <Check size={13} strokeWidth={3} />
                                        </span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    <section className="relative isolate mt-3 flex min-h-34.5 items-center gap-4 overflow-hidden rounded-xl border border-[#dcefe4] bg-[#eff8f3] px-5 py-5 sm:gap-5 sm:px-7">
                        <FarmLandscape footer />
                        <div className="absolute inset-0 bg-linear-to-r from-[#eff8f3] via-[#eff8f3]/95 to-transparent" />
                        <span className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full bg-[#145c38] text-white sm:size-16">
                            <Leaf size={35} fill="currentColor" />
                        </span>
                        <div className="relative z-10 max-w-lg">
                            <h2 className="text-lg font-bold text-[#183a2a] sm:text-xl">We’re Here to Help!</h2>
                            <p className="mt-1 text-xs leading-5 text-[#557264] sm:text-sm">
                                Your satisfaction matters to us. Don’t hesitate to reach out — we’re always happy to assist you.
                            </p>
                        </div>
                        <p className="font-display absolute right-4 bottom-3 z-10 hidden max-w-47.5 -rotate-3 text-right text-sm leading-5 font-bold text-[#1c5738] italic sm:right-5 sm:bottom-4 sm:block sm:text-base">
                            Support Local
                            <br />
                            Shop Local
                            <br />
                            Grow Together <Sprout className="inline-block text-[#3d8b4a]" size={19} />
                        </p>
                    </section>
                </div>
            </main>
        </>
    );
}
