import { informationalPageImage } from '@/lib/informational-page-image';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownLeft,
    ArrowLeft,
    BadgeCheck,
    CalendarClock,
    CheckCircle2,
    Gift,
    House,
    Info,
    Leaf,
    MapPin,
    Package,
    PackageCheck,
    ShoppingCart,
    Sprout,
    Truck,
} from 'lucide-react';

type DeliveryZone = {
    id: number;
    name: string;
    barangay: string;
    description: string | null;
    delivery_fee: string;
    is_free_delivery: boolean;
    free_delivery_minimum: string | null;
    estimated_delivery_text: string;
};

type DeliveryOptionKey = 'local_delivery' | 'seller_delivery' | 'pickup';
type ShippingStep = { title: string; description: string };

const options: Record<DeliveryOptionKey, { title: string; description: string; icon: typeof Truck }> = {
    local_delivery: {
        title: 'Local Delivery',
        description: 'Seller or BSAB-Shop delivery personnel delivers the order directly to your address.',
        icon: Truck,
    },
    seller_delivery: {
        title: 'Seller Delivery',
        description: 'The seller personally handles delivery to you and coordinates the arrangements.',
        icon: PackageCheck,
    },
    pickup: {
        title: 'Pickup',
        description: "Collect your order from the seller's designated pickup location when available.",
        icon: MapPin,
    },
};

const defaultSteps: ShippingStep[] = [
    { title: 'Customer places order', description: 'Choose products from local sellers and submit your order.' },
    { title: 'Seller confirms order', description: 'The seller reviews your order and confirms availability.' },
    { title: 'Seller prepares products', description: 'Your items are prepared for delivery or pickup.' },
    { title: 'Delivery is scheduled', description: 'The seller or delivery team coordinates a suitable time.' },
    { title: 'Customer receives order', description: 'Receive your order at the address or collect it from the seller.' },
];

const processIcons = [ShoppingCart, BadgeCheck, Package, CalendarClock, House];

function peso(value: string | number) {
    return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Section({
    id,
    number,
    title,
    className = '',
    children,
}: {
    id: string;
    number: number;
    title: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <section
            id={id}
            className={`scroll-mt-20 rounded-xl border border-[#e2e9e6] bg-white p-4 shadow-[0_3px_14px_rgba(20,52,40,0.035)] sm:p-5 ${className}`}
        >
            <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#125a3c] text-xs font-bold text-white shadow-sm">
                    {number}
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="font-display text-base leading-6 font-bold text-[#162d3b] sm:text-lg">{title}</h2>
                    <div className="mt-2.5 text-[12px] leading-5 text-[#526476] sm:text-[13px]">{children}</div>
                </div>
            </div>
        </section>
    );
}

export default function ShippingInfo({
    footerPage,
    deliveryZones = [],
    deliveryOptions,
    deliverySteps = defaultSteps,
}: {
    footerPage: { title: string; content: string; hero_image_path?: string | null };
    deliveryZones: DeliveryZone[];
    deliveryOptions: Record<DeliveryOptionKey, boolean>;
    deliverySteps?: ShippingStep[];
}) {
    return (
        <>
            <Head title={footerPage.title} />
            <main className="min-h-screen bg-[#f7f9f8] px-3 pb-8 text-[#172b3b] sm:px-5 sm:pb-10">
                <div className="sticky top-0 z-20 -mx-3 mb-2 border-b border-[#e7ece9] bg-white/95 px-3 py-2 backdrop-blur sm:-mx-5 sm:px-5">
                    <div className="mx-auto max-w-7xl">
                        <button
                            type="button"
                            onClick={() => {
                                const previousPage = document.referrer ? new URL(document.referrer) : null;
                                const canReturnToPreviousPage =
                                    previousPage?.origin === window.location.origin &&
                                    previousPage.pathname + previousPage.search + previousPage.hash !==
                                        window.location.pathname + window.location.search + window.location.hash;

                                if (canReturnToPreviousPage && window.history.length > 1) {
                                    window.history.back();
                                    return;
                                }

                                window.location.assign('/');
                            }}
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#1d6748] transition hover:bg-[#edf5ef] focus-visible:ring-2 focus-visible:ring-[#258b50] focus-visible:outline-none"
                        >
                            <ArrowLeft size={17} /> Back
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl">
                    <header className="relative isolate mb-4 overflow-hidden rounded-xl border border-[#e1e9e4] bg-white shadow-[0_4px_18px_rgba(22,59,36,0.05)]">
                        <div className="grid min-h-44 items-center md:grid-cols-[1.05fr_0.95fr]">
                            <div className="relative z-10 p-5 sm:p-7">
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e9dc] bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#1f7a42] uppercase">
                                    <MapPin size={12} /> Hinoba-an, Negros Occidental
                                </div>
                                <h1 className="font-display mt-2.5 text-2xl leading-tight font-bold text-[#173b32] sm:text-3xl">
                                    Shipping Information
                                </h1>
                                <p className="mt-2 max-w-2xl text-xs leading-5 text-[#465d6b] sm:text-[13px] sm:leading-6">{footerPage.content}</p>
                            </div>
                            <div
                                aria-hidden="true"
                                className="relative hidden h-full min-h-44 overflow-hidden bg-linear-to-r from-[#edf5ef] via-[#dae9dc] to-[#d4e3d5] md:block"
                            >
                                {footerPage.hero_image_path && (
                                    <img
                                        src={informationalPageImage(footerPage.hero_image_path) ?? ''}
                                        alt=""
                                        className="absolute inset-0 size-full object-cover"
                                    />
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-14 bg-[#c4d8c4]/75 [clip-path:polygon(0_65%,19%_22%,35%_52%,59%_8%,76%_49%,100%_0,100%_100%,0_100%)]" />
                                <div className="absolute right-[13%] bottom-6 left-[7%] h-px rotate-[-12deg] bg-white/90" />
                                <div className="font-display absolute top-4 right-10 text-right text-[11px] leading-4 font-semibold text-[#246d49] italic">
                                    Support Local
                                    <br />
                                    Shop Local
                                    <br />
                                    Grow Together
                                </div>
                                <div className="absolute bottom-5 left-[19%] flex h-12 w-12 items-center justify-center rounded-full bg-white/75 text-[#145b3d] shadow-md">
                                    <MapPin size={32} fill="#145b3d" className="text-white" />
                                </div>
                                <div className="absolute right-[28%] bottom-5 flex h-10 w-14 items-center justify-center rounded-lg bg-[#183e31] text-white shadow-lg">
                                    <Truck size={30} strokeWidth={1.8} />
                                </div>
                                <Leaf size={44} className="absolute top-7 right-[3%] rotate-12 text-[#7ba77b]/70" />
                                <div className="absolute top-0 bottom-0 left-0 w-20 bg-linear-to-r from-[#edf5ef] to-transparent" />
                            </div>
                        </div>
                    </header>

                    <div className="grid items-start gap-3 md:grid-cols-2 md:gap-4">
                        <Section id="delivery-area" number={1} title="Local Delivery Only">
                            <p>BSAB-Shop serves customers within the Hinoba-an local area.</p>
                            <div className="mt-2.5 rounded-lg border border-[#e0ece3] bg-linear-to-r from-[#f0f7f1] to-[#f8fbf8] p-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#155f41] text-white">
                                        <MapPin size={19} fill="currentColor" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#32704f]">Delivery Area</p>
                                        <p className="text-sm font-bold text-[#183b33]">Hinoba-an, Negros Occidental</p>
                                    </div>
                                </div>
                                <ul className="mt-2.5 space-y-1.5 pl-11 text-[11px] leading-4 text-[#435a65]">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[#258b50]" /> Hinoba-an town proper
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[#258b50]" /> Supported barangays within Hinoba-an
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[#258b50]" /> Other locations configured by the
                                        administrator
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-2 flex gap-2 rounded-lg border border-[#cfe4f8] bg-[#edf6ff] px-3 py-2.5 text-[10px] leading-4 text-[#24649b]">
                                <Info size={15} className="mt-0.5 shrink-0" />
                                <p>
                                    BSAB-Shop currently does not offer nationwide shipping. Orders outside the supported Hinoba-an delivery area
                                    cannot be processed for local delivery.
                                </p>
                            </div>
                        </Section>

                        <Section id="delivery-fees" number={2} title="Local Delivery Fees">
                            <p>Fees are configured by the administrator and shared with checkout. Only active zones appear here.</p>
                            <div className="mt-2.5 overflow-x-auto rounded-lg border border-[#e3e9e7]">
                                <table className="w-full min-w-105 text-left text-[10px]">
                                    <thead className="bg-[#f3f6f5] text-[9px] font-bold text-[#263d4b]">
                                        <tr>
                                            <th className="px-2.5 py-2">Delivery Area</th>
                                            <th className="px-2.5 py-2">Estimated Delivery</th>
                                            <th className="px-2.5 py-2">Delivery Fee</th>
                                            <th className="px-2.5 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e4ebe6] bg-white">
                                        {deliveryZones.map((zone) => (
                                            <tr key={zone.id}>
                                                <td className="px-2.5 py-2 font-medium text-[#294653]">
                                                    <p>{zone.name}</p>
                                                    <p className="text-[9px] text-[#758791]">{zone.barangay}</p>
                                                </td>
                                                <td className="px-2.5 py-2 text-[#435a65]">{zone.estimated_delivery_text}</td>
                                                <td className="px-2.5 py-2 font-semibold text-[#1e4a38]">
                                                    {zone.is_free_delivery
                                                        ? zone.free_delivery_minimum
                                                            ? `${peso(zone.delivery_fee)}; FREE at/over ${peso(zone.free_delivery_minimum)}`
                                                            : 'FREE DELIVERY'
                                                        : peso(zone.delivery_fee)}
                                                </td>
                                                <td className="px-2.5 py-2">
                                                    <span className="rounded-full bg-[#eaf5ed] px-2 py-1 text-[9px] font-bold text-[#27744d]">
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {deliveryZones.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-3 py-4 text-center text-[10px] text-[#758791]">
                                                    No active delivery zones are configured yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-2 flex gap-2 rounded-lg border border-[#d7eee0] bg-[#f0f8f2] px-3 py-2 text-[10px] leading-4 text-[#386a50]">
                                <Sprout size={15} className="mt-0.5 shrink-0" />
                                <p>Admins can add, edit, disable, or reorder zones and fees. Checkout uses these same active values.</p>
                            </div>
                        </Section>

                        <Section id="delivery-calculation" number={3} title="Shipping Fee Calculation">
                            <p>The fee is looked up dynamically from the selected barangay’s active delivery zone.</p>
                            <div className="mt-2.5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1 rounded-lg bg-[#f2f5f4] p-2">
                                {[
                                    { label: 'Customer Address', sub: 'Barangay', icon: MapPin },
                                    { label: 'Delivery Zone', sub: 'Found automatically', icon: House },
                                    { label: 'Active Delivery Fee', sub: 'Retrieved from admin', icon: BadgeCheck },
                                ].map((step, index) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.label} className="contents">
                                            <div className="flex min-w-0 flex-col items-center text-center">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#17613f] shadow-sm">
                                                    <Icon size={17} />
                                                </span>
                                                <span className="mt-1 text-[9px] leading-3 font-bold text-[#284654]">{step.label}</span>
                                                <span className="text-[8px] leading-3 text-[#70818a]">{step.sub}</span>
                                            </div>
                                            {index < 2 && <ArrowDownLeft size={14} className="rotate-[-45deg] text-[#278451]" />}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                                <div className="rounded-lg border border-[#e5ece9] p-2.5">
                                    <p className="mb-1.5 text-[10px] font-bold text-[#247145]">Example: system lookup</p>
                                    <p className="flex justify-between gap-2 text-[9px]">
                                        <span>Customer selects</span>
                                        <span className="font-semibold text-[#294653]">Poblacion</span>
                                    </p>
                                    <p className="mt-1 flex justify-between gap-2 text-[9px]">
                                        <span>System finds</span>
                                        <span className="font-semibold text-[#294653]">Hinoba-an Poblacion</span>
                                    </p>
                                    <p className="mt-1 flex justify-between gap-2 text-[9px]">
                                        <span>System retrieves</span>
                                        <span className="font-bold text-[#294653]">Configured fee</span>
                                    </p>
                                </div>
                                <div className="rounded-lg border border-[#e5ece9] p-2.5">
                                    <p className="mb-1.5 text-[10px] font-bold text-[#294653]">Checkout example</p>
                                    <p className="flex justify-between gap-2 text-[9px]">
                                        <span>Product Subtotal</span>
                                        <span>{peso(500)}</span>
                                    </p>
                                    <p className="mt-1 flex justify-between gap-2 text-[9px]">
                                        <span>Local Delivery Fee</span>
                                        <span>Configured fee</span>
                                    </p>
                                    <p className="mt-1 flex justify-between gap-2 border-t border-[#e5ece9] pt-1 text-[9px] font-bold">
                                        <span>Order Total</span>
                                        <span>Subtotal + fee</span>
                                    </p>
                                </div>
                            </div>
                            <p className="mt-2 flex gap-1.5 rounded-lg border border-[#cfe4f8] bg-[#edf6ff] px-2.5 py-2 text-[9px] leading-4 text-[#24649b]">
                                <Info size={13} className="mt-0.5 shrink-0" />
                                Never hard-code a fee in the frontend. Shipping Info and Checkout use the same database zone and fee.
                            </p>
                        </Section>

                        <Section id="free-delivery" number={4} title="Optional Free Delivery">
                            <p>Administrators can enable or disable free delivery for each delivery zone.</p>
                            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                                <div className="flex items-center gap-2 rounded-lg bg-[#eff7f1] p-2.5">
                                    <Gift size={18} className="shrink-0 text-[#26824e]" />
                                    <div>
                                        <p className="text-[10px] font-bold text-[#246641]">Free Delivery · Enabled</p>
                                        <p className="text-[9px] leading-4 text-[#587066]">Customer sees FREE DELIVERY instead of the fee.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-[#f2f5f4] p-2.5">
                                    <Truck size={18} className="shrink-0 text-[#5a7180]" />
                                    <div>
                                        <p className="text-[10px] font-bold text-[#294654]">Regular fee · Disabled</p>
                                        <p className="text-[9px] leading-4 text-[#70818a]">Customer sees the zone’s configured fee.</p>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-2 text-[9px] text-[#70818a]">Free-delivery settings are managed per zone in the admin panel.</p>
                        </Section>

                        <Section id="free-delivery-minimum" number={5} title="Optional Free Delivery Minimum">
                            <p>Administrators may set an order minimum. Examples only — actual rules and fees always come from the database.</p>
                            <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                                <div className="rounded-lg bg-[#f2f5f4] p-2.5 text-[9px] leading-4">
                                    <p className="font-bold text-[#294653]">Example configuration</p>
                                    <p className="mt-1">
                                        Illustrative fee: <b>₱50.00</b>
                                    </p>
                                    <p>
                                        Free-delivery minimum: <b>₱1,000.00</b>
                                    </p>
                                </div>
                                <div className="rounded-lg border border-[#d8eadc] bg-[#f0f8f2] p-2.5 text-[9px] leading-4">
                                    <p className="font-bold text-[#23734a]">✓ Order at/over ₱1,000.00</p>
                                    <p className="mt-1 flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₱1,200.00</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Delivery Fee</span>
                                        <b>FREE</b>
                                    </p>
                                    <p className="mt-1 flex justify-between border-t border-[#d8eadc] pt-1 font-bold">
                                        <span>Total</span>
                                        <span>₱1,200.00</span>
                                    </p>
                                </div>
                                <div className="rounded-lg border border-[#e3e9e7] bg-[#f8f9f9] p-2.5 text-[9px] leading-4">
                                    <p className="font-bold text-[#5c6d77]">○ Order below ₱1,000.00</p>
                                    <p className="mt-1 flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₱800.00</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Delivery Fee</span>
                                        <span>₱50.00*</span>
                                    </p>
                                    <p className="mt-1 flex justify-between border-t border-[#e3e9e7] pt-1 font-bold">
                                        <span>Total</span>
                                        <span>₱850.00*</span>
                                    </p>
                                </div>
                            </div>
                            <p className="mt-2 text-[9px] text-[#70818a]">
                                *Illustrative only. The configured database delivery fee is used for real orders.
                            </p>
                        </Section>

                        <Section id="delivery-time" number={6} title="Delivery Time">
                            <p>Estimates are editable by admins and retrieved from each active delivery zone.</p>
                            <div className="mt-2.5 overflow-x-auto rounded-lg border border-[#e3e9e7]">
                                <table className="w-full min-w-70 text-left text-[10px]">
                                    <thead className="bg-[#f3f6f5] text-[9px] font-bold text-[#263d4b]">
                                        <tr>
                                            <th className="px-2.5 py-2">Delivery Area</th>
                                            <th className="px-2.5 py-2">Estimated Delivery</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e4ebe6]">
                                        {deliveryZones.length > 0 ? (
                                            deliveryZones.map((zone) => (
                                                <tr key={zone.id}>
                                                    <td className="px-2.5 py-2">{zone.name}</td>
                                                    <td className="px-2.5 py-2">{zone.estimated_delivery_text}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <>
                                                <tr>
                                                    <td className="px-2.5 py-2">Hinoba-an Poblacion</td>
                                                    <td className="px-2.5 py-2">Same day–2 days</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-2.5 py-2">Nearby Barangays</td>
                                                    <td className="px-2.5 py-2">1–3 days</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-2.5 py-2">More Distant Barangays</td>
                                                    <td className="px-2.5 py-2">2–5 days</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {deliveryZones.length === 0 && (
                                <p className="mt-1.5 text-[9px] text-[#788891]">Examples only — estimates appear here when zones are activated.</p>
                            )}
                        </Section>

                        <Section id="delivery-options" number={7} title="Delivery Options">
                            <p>Administrators control which fulfillment options are enabled.</p>
                            <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                                {(Object.entries(options) as [DeliveryOptionKey, (typeof options)[DeliveryOptionKey]][]).map(([key, option]) => {
                                    const Icon = option.icon;
                                    const enabled = deliveryOptions[key];
                                    return (
                                        <div key={key} className="rounded-lg border border-[#e2e9e6] bg-[#fbfcfc] p-2.5">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${enabled ? 'bg-[#eaf5ed] text-[#1f7a42]' : 'bg-[#f0f2f2] text-[#829098]'}`}
                                                >
                                                    <Icon size={20} />
                                                </span>
                                                <h3 className="text-[10px] font-bold text-[#24414e]">{option.title}</h3>
                                            </div>
                                            <p className="mt-2 min-h-12 text-[9px] leading-4 text-[#687b85]">{option.description}</p>
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-bold uppercase ${enabled ? 'bg-[#eaf5ed] text-[#26734a]' : 'bg-[#eff1f1] text-[#75828a]'}`}
                                            >
                                                <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-[#258b50]' : 'bg-[#89959b]'}`} />
                                                {enabled ? 'Enabled' : 'Unavailable'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>

                        <Section id="how-delivery-works" number={8} title="How Local Delivery Works" className="md:col-span-2">
                            <ol className="relative grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                                {deliverySteps.map((step, index) => {
                                    const Icon = processIcons[index % processIcons.length];

                                    return (
                                        <li key={`${index}-${step.title}`} className="relative rounded-lg border border-[#e3e9e7] bg-[#fbfcfc] p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#125a3c] text-[10px] font-bold text-white">
                                                    {index + 1}
                                                </span>
                                                <Icon size={17} className="text-[#24714a]" />
                                            </div>
                                            <h3 className="mt-2 text-[11px] font-bold text-[#203c49]">{step.title}</h3>
                                            <p className="mt-1 text-[10px] leading-4 text-[#687b85]">{step.description}</p>
                                        </li>
                                    );
                                })}
                            </ol>
                        </Section>

                        <Section id="delivery-address" number={9} title="Delivery Address">
                            <p>For a smooth local delivery, provide these details during checkout:</p>
                            <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                                {[
                                    'Full name',
                                    'Active mobile number',
                                    'Barangay',
                                    'Street / Sitio',
                                    'House number or landmark',
                                    'Additional delivery instructions',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-1.5 text-[10px]">
                                        <CheckCircle2 size={13} className="shrink-0 text-[#258b50]" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2.5 rounded-lg border border-[#cfe4f8] bg-[#edf6ff] p-2.5 text-[10px] leading-4 text-[#24649b]">
                                Barangay must match an active zone. <strong>Sorry, BSAB-Shop currently does not deliver to this location.</strong>
                            </p>
                        </Section>

                        <Section id="agricultural-delivery" number={10} title="Agricultural Product Delivery">
                            <div className="flex gap-2.5">
                                <Sprout size={19} className="mt-0.5 shrink-0 text-[#258b50]" />
                                <div>
                                    <p>Agricultural products may require special delivery arrangements, including:</p>
                                    <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                                        {[
                                            'Agricultural tools',
                                            'Farm supplies',
                                            'Seeds',
                                            'Plants',
                                            'Fertilizers',
                                            'Large agricultural equipment',
                                        ].map((item) => (
                                            <li key={item} className="flex items-center gap-2">
                                                <CheckCircle2 size={13} className="text-[#258b50]" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="mt-3">
                                        Large, heavy, fragile, or special-handling products may have special delivery arrangements or additional fees
                                        determined by the seller.
                                    </p>
                                </div>
                            </div>
                        </Section>

                        <Section id="failed-delivery" number={11} title="Failed Delivery">
                            <p>A delivery attempt may be unsuccessful if:</p>
                            <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                                {[
                                    'Customer is unavailable',
                                    'Address is incorrect',
                                    'Address is incomplete',
                                    'Phone number is unreachable',
                                    'Delivery location cannot be identified',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-2">
                                        <AlertTriangle size={15} className="text-amber-600" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2.5">
                                The seller or delivery personnel may contact you to arrange another delivery schedule. Please keep your phone
                                available and provide clear address details.
                            </p>
                        </Section>

                        <Section id="order-issues" number={12} title="Damaged, Missing, or Incorrect Orders">
                            <p>If there is a problem with your delivery, please:</p>
                            <ol className="mt-3 list-inside list-decimal space-y-2">
                                <li>Take photos or videos of the package and product.</li>
                                <li>Keep the original packaging.</li>
                                <li>Report the problem through your BSAB-Shop order page.</li>
                                <li>Contact the seller or BSAB-Shop support.</li>
                                <li>Provide the order number and supporting evidence.</li>
                            </ol>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {['Damaged product', 'Missing item', 'Incorrect product', 'Incomplete order'].map((item) => (
                                    <span key={item} className="rounded-full bg-[#eaf8ee] px-3 py-1.5 text-xs font-semibold text-[#1f7a42]">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </Section>
                    </div>
                </div>
            </main>
        </>
    );
}
