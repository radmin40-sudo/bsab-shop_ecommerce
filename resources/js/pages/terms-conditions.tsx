import { informationalPageImage } from '@/lib/informational-page-image';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    FileCheck2,
    FileClock,
    Handshake,
    Leaf,
    PackageCheck,
    Scale,
    ShieldCheck,
    Sprout,
    Truck,
    UserRound,
    type LucideIcon,
} from 'lucide-react';

type FooterPageContent = {
    title: string;
    slug: string;
    content: string;
    hero_image_path?: string | null;
    footer_image_path?: string | null;
    content_sections?: { title: string; content: string }[];
};

const terms = [
    {
        title: 'Acceptance of Terms',
        icon: Handshake,
        content:
            'By accessing, browsing, or purchasing from BSAB-Shop, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website or services.',
    },
    {
        title: 'Products and Services',
        icon: Sprout,
        content:
            'BSAB-Shop offers local agricultural products, local goods, and related services. We strive to ensure accurate product descriptions and availability, but we do not guarantee that all information is error-free. We reserve the right to modify or discontinue any product or service at any time without prior notice.',
    },
    {
        title: 'Orders and Payments',
        icon: CreditCard,
        secondaryIcon: ShieldCheck,
        content:
            'All orders are subject to confirmation and availability. Payment must be made through the approved methods provided on our website. We reserve the right to cancel or refuse any order if there are issues with payment, fraud, or product availability.',
    },
    {
        title: 'Shipping and Delivery',
        icon: Truck,
        content:
            'We will make every effort to deliver your order on time. Delivery times may vary depending on your location and the availability of products. BSAB-Shop is not responsible for delays caused by third-party logistics, weather conditions, or other unforeseen events.',
    },
    {
        title: 'Returns and Refunds',
        icon: PackageCheck,
        content:
            'If you receive a damaged, defective, or incorrect product, please contact us within 7 days of receiving your order. We will review your request and provide a replacement or refund, subject to our return policy. Certain items may not be eligible for return or refund.',
    },
    {
        title: 'User Responsibilities',
        icon: UserRound,
        secondaryIcon: ShieldCheck,
        content:
            'You agree to use our website and services for lawful purposes only. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.',
    },
    {
        title: 'Intellectual Property',
        icon: ShieldCheck,
        content:
            'All content on BSAB-Shop, including logos, images, text, and product information, is the property of BSAB-Shop or its respective owners. You may not copy, distribute, or use any content without our prior written permission.',
    },
    {
        title: 'Limitation of Liability',
        icon: ShieldCheck,
        content:
            'BSAB-Shop is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our total liability, if any, will be limited to the amount paid for the product or service in question.',
    },
    {
        title: 'Changes to Terms',
        icon: FileClock,
        content:
            'We reserve the right to update or modify these Terms & Conditions at any time. Changes will be posted on this page with the updated effective date. Your continued use of our services constitutes acceptance of the revised terms.',
    },
    {
        title: 'Governing Law',
        icon: Scale,
        content:
            'These Terms & Conditions are governed by the laws of the Philippines. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the relevant courts in the Philippines.',
    },
];

function FarmTermsLandscape() {
    return (
        <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 900 220" preserveAspectRatio="xMidYMid slice" fill="none">
            <defs>
                <linearGradient id="termsSky" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#e6f7f0" />
                    <stop offset="1" stopColor="#b4dfc2" />
                </linearGradient>
                <linearGradient id="termsField" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#a5d07d" />
                    <stop offset="1" stopColor="#36874b" />
                </linearGradient>
            </defs>
            <path fill="url(#termsSky)" d="M0 0h900v220H0z" />
            <circle cx="760" cy="37" r="23" fill="#fff1bd" opacity=".86" />
            <path d="m220 132 132-87 86 61 90-86 104 91 268-49v158H220z" fill="#b2d7ad" />
            <path d="m352 45 48 61 38-23 44 35 46-98 89 92-87-45-45 56-48-29-39 27-46-42-62 39z" fill="#e2f0d8" />
            <path d="m0 157 147-81 115 59 123-67 153 83 146-68 216 42v95H0z" fill="#7cba79" />
            <path d="M0 181c163-46 313-32 452 2 152 37 291 19 448-18v55H0z" fill="url(#termsField)" />
            <path
                d="M369 220c130-38 244-44 357-33 65 7 117-1 174-20M450 220c104-26 195-30 291-18 57 7 107-1 159-14"
                stroke="#d9edbc"
                strokeWidth="4"
                opacity=".85"
            />
            <path
                d="M86 188c-3-30 7-54 28-72m-23 54c-22-17-31-35-30-56m35 32c17-23 36-37 61-41"
                stroke="#397b46"
                strokeWidth="5"
                strokeLinecap="round"
            />
            <path
                d="M90 158c-17 4-29-3-36-17 18-4 29 2 36 17m9-4c5-18 16-28 34-31-2 19-13 28-34 31m-6-14c-17-8-24-20-22-39 17 6 25 18 22 39"
                fill="#4a9b58"
            />
            <g transform="translate(560 53)">
                <circle cx="80" cy="58" r="63" fill="#e7f5e9" opacity=".82" />
                <circle cx="80" cy="58" r="52" fill="#fff" stroke="#31814d" strokeWidth="5" />
                <path d="M60 22h40l14 14v65H60z" fill="#fff" stroke="#145c38" strokeWidth="5" strokeLinejoin="round" />
                <path d="M100 22v16h14M70 48h30M70 60h30M70 72h20" stroke="#145c38" strokeWidth="4" strokeLinecap="round" />
                <path d="m82 88 10 10 20-23" stroke="#13814a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                <path
                    d="M29 106c-15-20-16-37-4-54m9 42c-16 1-27-6-33-21 18-2 29 5 33 21m-1-18c1-17 10-27 27-31-1 18-9 28-27 31m103 29c17-19 20-36 10-54m-6 43c16-1 28-9 32-24-18-1-29 7-32 24m-1-19c1-16-8-27-25-32 0 18 8 29 25 32"
                    fill="#4c9f5b"
                />
            </g>
            <path
                d="M777 190c-4-24 4-44 21-58m-18 42c-17-13-24-27-23-43m27 25c13-17 27-28 47-31"
                stroke="#347b46"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path d="M780 165c-14 3-23-2-29-13 15-3 24 2 29 13m7-3c4-14 13-22 27-24-1 15-10 22-27 24" fill="#58a761" />
        </svg>
    );
}

function NumberedTerm({
    number,
    title,
    icon: Icon,
    secondaryIcon: SecondaryIcon,
    content,
}: {
    number: number;
    title: string;
    icon: LucideIcon;
    secondaryIcon?: LucideIcon;
    content: string;
}) {
    return (
        <article className="min-h-[142px] rounded-xl border border-[#d6ebe8] bg-gradient-to-br from-white to-[#f3faf7] p-3 sm:min-h-[155px] sm:p-4">
            <div className="mb-2 flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#075e39] text-sm font-bold text-white shadow-sm">
                    {number}
                </span>
                <h2 className="text-base leading-5 font-bold text-[#064e3b] sm:text-[17px]">{title}</h2>
            </div>
            <div className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[82px_minmax(0,1fr)] sm:gap-3.5">
                <span className="relative flex size-16 items-center justify-center rounded-lg bg-[#e9f7ef] text-[#075e39] sm:size-[74px] sm:rounded-xl">
                    <Icon size={34} strokeWidth={2.3} />
                    {SecondaryIcon && (
                        <span className="absolute right-1 bottom-1 flex size-6 items-center justify-center rounded-full bg-[#e9f7ef] text-[#075e39]">
                            <SecondaryIcon size={18} strokeWidth={2.5} />
                        </span>
                    )}
                </span>
                <p className="text-xs leading-[1.65] text-[#315e57] sm:text-[13px]">{content}</p>
            </div>
        </article>
    );
}

export default function TermsConditions({ footerPage }: { footerPage: FooterPageContent }) {
    const editableSections = footerPage.content_sections?.length ? footerPage.content_sections : terms;

    return (
        <>
            <Head title={footerPage?.title ?? 'Terms & Conditions'} />
            <main className="min-h-screen bg-white px-3 py-3 text-[#173c2b] sm:px-5 sm:py-4">
                <div className="mx-auto max-w-[1500px]">
                    <Link
                        href="/"
                        className="mb-3 inline-flex items-center gap-2 px-1 text-xs font-semibold text-[#17633d] transition hover:text-[#0d4329]"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Back
                    </Link>

                    <section className="relative isolate mb-3 min-h-[142px] overflow-hidden rounded-xl border border-[#dcefe4] bg-[#edf8f2] px-4 py-5 sm:min-h-[164px] sm:px-6 sm:py-5">
                        <FarmTermsLandscape />
                        {footerPage.hero_image_path && (
                            <img
                                src={informationalPageImage(footerPage.hero_image_path) ?? ''}
                                alt=""
                                className="absolute inset-y-0 right-0 h-full w-1/2 object-cover object-center"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#edf8f2] via-[#edf8f2]/95 to-transparent" />
                        <div className="relative z-10 flex max-w-[610px] items-start gap-3.5 sm:gap-5">
                            <span className="mt-1 flex size-16 shrink-0 items-center justify-center rounded-xl bg-[#075e39] text-white shadow-sm sm:size-[74px]">
                                <FileCheck2 size={42} strokeWidth={2.2} />
                            </span>
                            <div>
                                <h1 className="font-display text-2xl leading-tight font-bold tracking-tight text-[#064e3b] sm:text-4xl lg:text-[42px]">
                                    {footerPage.title ?? 'Terms & Conditions'}
                                </h1>
                                <p className="mt-2 max-w-[400px] text-xs leading-5 text-[#456b59] sm:text-sm sm:leading-6">{footerPage.content}</p>
                            </div>
                        </div>
                        <p className="font-display absolute right-3 bottom-3 z-10 hidden max-w-[170px] -rotate-3 text-right text-sm leading-5 font-bold text-[#145c38] italic sm:block md:right-6 md:max-w-[190px] md:text-base">
                            Together
                            <br />
                            for a Greener
                            <br />
                            Tomorrow
                            <Sprout className="ml-1 inline-block text-[#3d8b4a]" size={19} />
                        </p>
                    </section>

                    <div className="grid gap-2.5 md:grid-cols-2">
                        {terms.map(({ title, icon, secondaryIcon, content }, index) => (
                            <NumberedTerm
                                key={editableSections[index]?.title ?? title}
                                number={index + 1}
                                title={editableSections[index]?.title ?? title}
                                icon={icon}
                                secondaryIcon={secondaryIcon}
                                content={editableSections[index]?.content ?? content}
                            />
                        ))}
                    </div>

                    <footer className="relative isolate mt-3 grid min-h-[145px] overflow-hidden rounded-xl border border-[#dcefe4] bg-[#edf8f2] md:grid-cols-[1.05fr_1fr] md:items-center">
                        <div className="relative min-h-[145px] overflow-hidden">
                            <img
                                src={
                                    informationalPageImage(footerPage.footer_image_path) ??
                                    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=90'
                                }
                                alt="Hands holding rich soil and a young seedling against a green field"
                                className="absolute inset-0 size-full object-cover object-center"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#edf8f2]/20 to-[#edf8f2]" />
                        </div>
                        <div className="relative flex min-h-[145px] flex-col justify-center px-5 py-5 sm:pl-7">
                            <div className="flex items-center gap-3">
                                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#075e39] text-white">
                                    <FileCheck2 size={27} />
                                    <CheckCircle2 className="absolute right-0.5 bottom-1" size={15} fill="#075e39" stroke="white" />
                                </span>
                                <div>
                                    <h2 className="font-display text-2xl leading-7 font-bold text-[#064e3b] sm:text-3xl">BSAB-Shop</h2>
                                    <p className="mt-1 text-[10px] font-medium text-[#456b59] sm:text-xs">
                                        Local Products • Local Sellers • A Stronger Hinoba-an
                                    </p>
                                </div>
                            </div>
                            <div className="my-3 h-px w-full max-w-[330px] bg-[#9bc9aa]" />
                            <p className="font-display text-sm leading-5 font-bold text-[#17633d] italic sm:text-base">
                                Good for Farmers. Good for Communities. Good for the Planet.
                            </p>
                            <Leaf className="absolute top-1 right-3 hidden size-20 rotate-[-30deg] text-[#79b96e]/65 sm:block" fill="currentColor" />
                            <Leaf
                                className="absolute right-1 bottom-0 hidden size-14 rotate-[28deg] text-[#79b96e]/60 sm:block"
                                fill="currentColor"
                            />
                        </div>
                    </footer>
                </div>
            </main>
        </>
    );
}
