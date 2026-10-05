import { informationalPageImage } from '@/lib/informational-page-image';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Box,
    CalendarDays,
    Check,
    CheckCircle2,
    ClipboardList,
    Contact,
    FileCheck2,
    FileText,
    Flower2,
    Leaf,
    Lightbulb,
    MessageCircle,
    MoreHorizontal,
    Package,
    PackageCheck,
    RefreshCw,
    RotateCcw,
    ShieldCheck,
    Sprout,
    Store,
    Truck,
    UserRound,
    Wallet,
    XCircle,
    type LucideIcon,
} from 'lucide-react';

type FooterPageContent = {
    title: string;
    slug: string;
    content: string;
    hero_image_path?: string | null;
    content_sections?: { title: string; content: string }[];
};

const reasons = [
    { title: 'Damaged product', description: 'Product arrived with physical damage.', icon: Box },
    { title: 'Defective product', description: 'Product has a manufacturing defect.', icon: ShieldCheck },
    { title: 'Incorrect product received', description: 'Different product than ordered.', icon: RefreshCw },
    { title: 'Missing item', description: 'Some items are not included in the order.', icon: Package },
    { title: 'Incomplete order', description: 'Order is incomplete or missing parts.', icon: ClipboardList },
    { title: 'Wrong size or variation', description: 'Size, color, or variation does not match when allowed.', icon: Store },
    { title: 'Product does not match the order', description: 'Product does not meet the order details when applicable.', icon: FileCheck2 },
];

const restrictedExamples: { label: string; icon: LucideIcon }[] = [
    { label: 'Seeds', icon: Sprout },
    { label: 'Plants', icon: Flower2 },
    { label: 'Fertilizers', icon: Leaf },
    { label: 'Opened agricultural supplies', icon: Package },
    { label: 'Used agricultural tools', icon: PackageCheck },
    { label: 'Custom-made products', icon: FileText },
    { label: 'Perishable products', icon: ClockIcon },
    { label: 'Products damaged through customer misuse', icon: ShieldCheck },
    { label: 'Products marked non-returnable by the seller', icon: XCircle },
];

function ClockIcon(props: React.ComponentProps<typeof CalendarDays>) {
    return <CalendarDays {...props} />;
}

const conditionItems = [
    'Unused when required, in the original packaging',
    'In acceptable condition',
    'Complete with included accessories',
    'Returned with original packaging when applicable',
    'Accompanied by required documentation or evidence',
];

const evidenceItems = [
    'Photos of the product',
    'Photos of the packaging',
    'Videos showing the problem',
    'Order number',
    'Product information',
    'Description of the issue',
    'Other supporting evidence requested by the seller',
];

const submitSteps = [
    'Select the product that needs to be returned.',
    'Choose the return reason.',
    'Provide a description of the problem.',
    'Upload photos or videos when required.',
    'Submit the return request.',
    'Wait for seller or BSAB-Shop review.',
];

const statusSteps = [
    { label: 'Submitted', icon: FileCheck2 },
    { label: 'Under Review', icon: MessageCircle },
    { label: 'Approved / Rejected', icon: BadgeCheck },
    { label: 'Return Processing', icon: PackageCheck },
    { label: 'Completed', icon: CheckCircle2 },
];

const resolutions = [
    { title: 'Refund', icon: Wallet },
    { title: 'Replacement', icon: PackageCheck },
    { title: 'Exchange', icon: RefreshCw },
    { title: 'Store credit', icon: BadgeCheck },
    { title: 'Other', icon: MoreHorizontal },
];

function Section({ number, title, children, className = '' }: { number: number; title: string; children: React.ReactNode; className?: string }) {
    return (
        <section className={`min-w-0 rounded-xl border border-[#d8ece8] bg-white p-3 shadow-[0_2px_10px_rgba(20,52,40,0.025)] sm:p-4 ${className}`}>
            <div className="mb-3 flex items-start gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#12623f] text-sm font-bold text-white shadow-sm sm:size-9">
                    {number}
                </span>
                <h2 className="pt-1 text-sm leading-5 font-bold text-[#07543d] sm:text-base">{title}</h2>
            </div>
            <div className="text-xs leading-5 text-[#345d5b] sm:text-[13px] sm:leading-[1.55]">{children}</div>
        </section>
    );
}

function CheckList({ items, columns = 1 }: { items: string[]; columns?: 1 | 2 }) {
    return (
        <ul className={`grid gap-x-4 gap-y-1.5 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
            {items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#167443] text-white">
                        <Check size={10} strokeWidth={3.2} />
                    </span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

function InfoBox({
    children,
    tone = 'green',
    icon: Icon = Lightbulb,
}: {
    children: React.ReactNode;
    tone?: 'green' | 'blue' | 'red';
    icon?: LucideIcon;
}) {
    const tones = {
        green: 'border-[#d9eee1] bg-[#edf8f2] text-[#315f50]',
        blue: 'border-[#d3e7f3] bg-[#eff7fc] text-[#35627a]',
        red: 'border-[#f3d8d5] bg-[#fff2f0] text-[#98483e]',
    };

    return (
        <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs leading-5 ${tones[tone]}`}>
            <Icon className="mt-0.5 shrink-0" size={16} />
            <div>{children}</div>
        </div>
    );
}

function ReturnHeroLandscape() {
    return (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#edf8f3]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#edf8f3] via-[#edf8f3]/95 to-[#e1f3e9]" />
            <svg
                className="absolute inset-y-0 right-0 h-full w-[48%] opacity-60"
                viewBox="0 0 500 160"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
            >
                <path d="m0 112 78-57 61 36 83-65 79 61 83-49 116 39v83H0z" fill="#b8d9b1" />
                <path d="m0 133 95-48 69 29 81-45 97 51 77-32 81 29v43H0z" fill="#80b77c" />
                <path d="M0 144c81-27 167-17 247 2 91 21 162 7 253-17v31H0z" fill="#7dbb69" />
                <path d="M170 160c76-21 147-24 229-8M234 160c70-14 131-15 205-4" stroke="#d7edba" strokeWidth="3" />
                <path
                    d="M419 136c-1-20 5-34 18-45m-13 33c-13-11-18-23-16-36m20 21c11-14 21-21 36-24"
                    stroke="#337e47"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path d="M420 115c-12 2-20-3-24-14 13-2 21 3 24 14m7-3c3-12 10-18 23-19-2 12-9 18-23 19" fill="#4d9b56" />
            </svg>
        </div>
    );
}

function ReasonCards({ labels = [] }: { labels?: string[] }) {
    return (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {reasons.map(({ title, description, icon: Icon }, index) => {
                const label = labels[index] ?? title;
                return (
                    <div key={label} className="flex min-h-[80px] items-start gap-2.5 rounded-lg border border-[#e1eee9] bg-[#f3faf6] p-2.5">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#176344]">
                            <Icon size={21} strokeWidth={2.2} />
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-xs leading-4 font-bold text-[#164b3a]">{label}</h3>
                            <p className="mt-0.5 text-[11px] leading-4 text-[#4a6868]">{description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function RestrictionCards({ labels = [] }: { labels?: string[] }) {
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {restrictedExamples.map(({ label: defaultLabel, icon: Icon }, index) => {
                const label = labels[index] ?? defaultLabel;
                return (
                    <div key={label} className="flex min-h-[48px] items-center gap-2 rounded-lg border border-[#e2eee9] bg-[#f7fbf9] px-2.5 py-2">
                        <Icon size={16} className="shrink-0 text-[#176344]" />
                        <span className="text-[11px] leading-4 font-medium text-[#385c58]">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}

function StatusTimeline({ labels = [] }: { labels?: string[] }) {
    return (
        <ol className="grid gap-2 sm:grid-cols-5 sm:items-start sm:gap-1">
            {statusSteps.map(({ label: defaultLabel, icon: Icon }, index) => {
                const label = labels[index] ?? defaultLabel;
                return (
                    <li key={label} className="flex items-center gap-2 sm:flex-col sm:gap-1.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e4f3e9] text-[#11653e] ring-1 ring-[#bcdcc8]">
                            <Icon size={16} />
                        </span>
                        <span className="flex-1 text-xs font-semibold text-[#315a50] sm:min-h-8 sm:text-center">{label}</span>
                        {index < statusSteps.length - 1 && <ArrowRight className="hidden text-[#63a37a] sm:block" size={15} />}
                    </li>
                );
            })}
        </ol>
    );
}

function ResolutionCards({ labels = [] }: { labels?: string[] }) {
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {resolutions.map(({ title: defaultTitle, icon: Icon }, index) => {
                const title = labels[index] ?? defaultTitle;
                return (
                    <div
                        key={title}
                        className="flex min-h-[65px] flex-col items-center justify-center gap-1.5 rounded-lg border border-[#dfede7] bg-[#f3faf6] p-2 text-center"
                    >
                        <Icon size={19} className="text-[#176344]" />
                        <span className="text-[11px] leading-4 font-semibold text-[#385c58]">{title}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function ReturnPolicy({ footerPage }: { footerPage: FooterPageContent }) {
    const sectionTitle = (number: number, fallback: string) => footerPage.content_sections?.[number - 1]?.title ?? fallback;
    const sectionItems = (number: number, fallback: string[]) => footerPage.content_sections?.[number - 1]?.items ?? fallback;

    return (
        <>
            <Head title={footerPage.title} />
            <main className="min-h-screen bg-[#fbfdfc] px-3 pt-2 pb-8 text-[#193d3a] sm:px-5 sm:pt-3 sm:pb-10">
                <div className="mx-auto max-w-[1440px]">
                    <Link
                        href="/"
                        className="mb-3 inline-flex min-h-8 items-center gap-1.5 rounded-lg px-1.5 text-xs font-semibold text-[#176344] transition hover:bg-[#edf7f1] focus-visible:ring-2 focus-visible:ring-[#258b50] focus-visible:outline-none"
                    >
                        <ArrowLeft size={15} aria-hidden="true" /> Back
                    </Link>

                    <header className="relative isolate mb-3 overflow-hidden rounded-xl border border-[#d9eee6] bg-[#edf8f3]">
                        <ReturnHeroLandscape />
                        {footerPage.hero_image_path && (
                            <img
                                src={informationalPageImage(footerPage.hero_image_path) ?? ''}
                                alt=""
                                className="absolute inset-y-0 right-0 h-full w-1/2 object-cover object-center"
                            />
                        )}
                        <div className="relative z-10 flex min-h-[132px] items-center gap-3.5 px-4 py-4 sm:min-h-[152px] sm:gap-5 sm:px-6 sm:py-5">
                            <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-[#075e39] text-white shadow-sm sm:size-[74px]">
                                <PackageCheck size={39} strokeWidth={2.1} />
                            </span>
                            <div className="max-w-[800px]">
                                <h1 className="font-display text-2xl leading-tight font-bold tracking-tight text-[#07543d] sm:text-4xl">
                                    {footerPage.title ?? 'Return Policy'}
                                </h1>
                                <p className="mt-2 max-w-[700px] text-xs leading-5 text-[#3e6660] sm:text-sm sm:leading-6">{footerPage.content}</p>
                            </div>
                        </div>
                    </header>

                    <div className="grid items-start gap-2.5 md:grid-cols-2 lg:gap-3">
                        <div className="grid min-w-0 content-start gap-2.5 lg:gap-3">
                            <Section number={1} title={sectionTitle(1, 'Return Policy Overview')}>
                                <p>
                                    {footerPage.content_sections?.[0]?.content ??
                                        'Customers may request a return when an order qualifies under the BSAB-Shop return policy and applicable seller conditions.'}
                                </p>
                                <p className="mt-2 font-semibold text-[#28584b]">Return eligibility may depend on:</p>
                                <CheckList
                                    columns={2}
                                    items={sectionItems(1, [
                                        'Product condition',
                                        'Product category',
                                        'Reason for return',
                                        'Evidence provided by the customer',
                                        'Seller’s return rules',
                                        'Time limit configured by the administrator',
                                    ])}
                                />
                                <div className="mt-3">
                                    <InfoBox tone="blue" icon={MessageCircle}>
                                        Not every product is automatically eligible for return. Please review the applicable return conditions before
                                        submitting a request.
                                    </InfoBox>
                                </div>
                            </Section>

                            <Section number={3} title={sectionTitle(3, 'Return Time Limit')}>
                                <div className="flex items-center gap-3 rounded-lg border border-[#d5ebe1] bg-[#edf8f2] p-3">
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white text-[#176344]">
                                        <CalendarDays size={27} />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold text-[#3f6760]">Return Request Period:</p>
                                        <p className="text-base font-bold text-[#14543a]">[Admin Configured Days] days</p>
                                    </div>
                                </div>
                                <p className="mt-2">
                                    {footerPage.content_sections?.[2]?.content ??
                                        'The return request period is configured by the administrator and may vary.'}
                                </p>
                                <p className="mt-2 font-semibold text-[#28584b]">The administrator can configure:</p>
                                <CheckList
                                    items={sectionItems(3, [
                                        'Return request period',
                                        'Whether the period begins from order date or delivery date',
                                        'Whether late requests are automatically rejected',
                                        'Whether individual products can have different return periods',
                                    ])}
                                />
                                <div className="mt-3">
                                    <InfoBox>
                                        Example: If the administrator configures a 7-day return period, submit your request within that allowed
                                        period.
                                    </InfoBox>
                                </div>
                            </Section>

                            <Section number={5} title={sectionTitle(5, 'Product Condition Requirements')}>
                                <p className="mb-2">{footerPage.content_sections?.[4]?.content}</p>
                                <p className="mb-2 font-semibold text-[#28584b]">Returned products should generally be:</p>
                                <CheckList items={sectionItems(5, conditionItems)} />
                                <div className="mt-3">
                                    <InfoBox tone="red" icon={AlertCircle}>
                                        Products showing signs of misuse, intentional damage, unauthorized modification, or improper handling may be
                                        rejected.
                                    </InfoBox>
                                </div>
                            </Section>

                            <Section number={6} title={sectionTitle(6, 'Return Request Process')}>
                                <p>You may be required to provide:</p>
                                <div className="mt-2">
                                    <CheckList columns={2} items={sectionItems(6, evidenceItems)} />
                                </div>
                                <div className="mt-3">
                                    <InfoBox>Clear evidence can help the seller evaluate your return request.</InfoBox>
                                </div>
                            </Section>

                            <Section number={8} title={sectionTitle(8, 'Required Evidence')}>
                                <p>You may be required to provide:</p>
                                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_0.8fr] sm:items-center">
                                    <CheckList items={sectionItems(8, evidenceItems)} />
                                    <InfoBox>Clear evidence can help the seller evaluate your return request.</InfoBox>
                                </div>
                            </Section>

                            <Section number={10} title={sectionTitle(10, 'Return Shipping / Delivery')}>
                                <div className="grid gap-3 sm:grid-cols-[1fr_0.85fr]">
                                    <div>
                                        <p className="mb-2">Return delivery arrangements depend on the reason for return and the seller’s policy.</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                [UserRound, 'Customer returns to seller'],
                                                [Truck, 'Seller arranges collection'],
                                                [PackageCheck, 'BSAB-Shop/local personnel handles collection when available'],
                                                [Contact, 'Customer coordinates with seller'],
                                            ].map(([Icon, defaultLabel], index) => {
                                                const ItemIcon = Icon as LucideIcon;
                                                const label = sectionItems(10, [])[index] ?? defaultLabel;
                                                return (
                                                    <div
                                                        key={label as string}
                                                        className="flex min-h-[70px] flex-col items-center justify-center gap-1.5 rounded-lg border border-[#e2eee9] bg-[#f3faf6] p-2 text-center"
                                                    >
                                                        <ItemIcon size={19} className="text-[#176344]" />
                                                        <span className="text-[10px] leading-4 font-medium text-[#385c58]">{label as string}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-[#d9eee1] bg-[#edf8f2] p-3">
                                        <p className="font-semibold text-[#14543a]">
                                            Return shipping responsibility is configurable by the administrator or seller.
                                        </p>
                                        <p className="mt-2">Possible settings:</p>
                                        <ul className="mt-1 list-inside list-disc space-y-0.5">
                                            <li>Customer pays</li>
                                            <li>Seller pays</li>
                                            <li>Free return</li>
                                            <li>Determined case-by-case</li>
                                        </ul>
                                    </div>
                                </div>
                            </Section>
                        </div>

                        <div className="grid min-w-0 content-start gap-2.5 lg:gap-3">
                            <Section number={2} title={sectionTitle(2, 'Eligible Return Reasons')}>
                                <p className="mb-2">{footerPage.content_sections?.[1]?.content}</p>
                                <p className="mb-2">
                                    The following return reasons are supported and can be enabled or disabled by the administrator:
                                </p>
                                <ReasonCards labels={sectionItems(2, [])} />
                                <div className="mt-3">
                                    <InfoBox>
                                        Administrators can enable or disable specific return reasons based on products, sellers, and business rules.
                                    </InfoBox>
                                </div>
                            </Section>

                            <Section number={4} title={sectionTitle(4, 'Products That May Not Be Returnable')}>
                                <p className="mb-2">{footerPage.content_sections?.[3]?.content}</p>
                                <p className="mb-2">Certain products may have special return restrictions. Examples include:</p>
                                <RestrictionCards labels={sectionItems(4, [])} />
                                <div className="mt-3">
                                    <InfoBox icon={ShieldCheck}>
                                        Return eligibility is configurable according to the existing product system. Not all listed categories are
                                        automatically non-returnable.
                                    </InfoBox>
                                </div>
                            </Section>

                            <Section number={7} title={sectionTitle(7, 'How to Submit a Return Request')}>
                                <p className="mb-2">{footerPage.content_sections?.[6]?.content}</p>
                                <div className="grid gap-3 sm:grid-cols-[1fr_0.85fr]">
                                    <div>
                                        <p className="mb-2">Return the BSAB-Shop order page:</p>
                                        <ol className="space-y-1.5">
                                            {sectionItems(7, submitSteps).map((step, index) => (
                                                <li key={step} className="flex items-start gap-2">
                                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e6f3eb] text-[11px] font-bold text-[#14613f]">
                                                        {index + 1}
                                                    </span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                        <Link
                                            href="/customer/orders"
                                            className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#12623f] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0d4e32] focus-visible:ring-2 focus-visible:ring-[#21834f] focus-visible:ring-offset-2"
                                        >
                                            <RotateCcw size={15} /> Request Return <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                    <div className="flex items-start gap-2 rounded-lg border border-[#d9eee1] bg-[#edf8f2] p-3">
                                        <InfoBox icon={ShieldCheck}>
                                            You can only submit a return request if your order and product are eligible according to the return policy
                                            and seller rules.
                                        </InfoBox>
                                    </div>
                                </div>
                            </Section>

                            <Section number={9} title={sectionTitle(9, 'Return Approval')}>
                                <p className="mb-2">{footerPage.content_sections?.[8]?.content}</p>
                                <p className="mb-3">The seller or authorized administrator will review your request and determine if it qualifies.</p>
                                <StatusTimeline labels={sectionItems(9, [])} />
                                <div className="mt-3">
                                    <InfoBox icon={CheckCircle2}>
                                        You can view the current status of your return request from your order page.
                                    </InfoBox>
                                </div>
                            </Section>

                            <Section number={11} title={sectionTitle(11, 'Return Resolutions')}>
                                <p className="mb-2">{footerPage.content_sections?.[10]?.content}</p>
                                <p className="mb-2">
                                    Available resolutions may depend on the product, seller policy, return reason, and administrator configuration.
                                </p>
                                <ResolutionCards labels={sectionItems(11, [])} />
                            </Section>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
