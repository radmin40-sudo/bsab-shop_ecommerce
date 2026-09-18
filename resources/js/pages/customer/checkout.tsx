import { PortalLayout } from '@/components/portal-layout';
import { api, checkoutCart, currentUser, getCustomerVouchers, validateVoucher } from '@/lib/api';
import { optimizeImage } from '@/lib/image-upload';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Minus,
    PackageCheck,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Trash2,
    WalletCards,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'review' | 'success';
type AddressForm = { full_name: string; phone: string; line1: string; city: string; province: string; postal_code: string };
type CartItem = {
    id: number;
    quantity: number;
    price_snapshot: string;
    product?: {
        name: string;
        shop?: {
            id: number;
            name: string;
            gcash_enabled: boolean;
            gcash_account_name?: string | null;
            gcash_mobile_number?: string | null;
            gcash_qr_code_url?: string | null;
        };
        images?: { path: string; is_primary: boolean }[];
    };
};
type CartData = { items: CartItem[] };
type CheckoutProps = { selectedItemIds?: number[] };

const emptyAddress: AddressForm = { full_name: '', phone: '', line1: '', city: '', province: '', postal_code: '' };
const stepLabels = ['Cart', 'Shipping', 'Payment', 'Review'];

function formatPrice(value: number) {
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

function ProgressStepper({ step }: { step: CheckoutStep }) {
    const activeIndex = step === 'cart' ? 0 : step === 'shipping' ? 1 : step === 'payment' ? 2 : 3;

    return (
        <div className="mx-auto mt-4 flex w-full max-w-180 items-center justify-between gap-2 overflow-hidden rounded-full border border-[#dfeee5] bg-white/80 px-3 py-2 shadow-[0_8px_30px_rgba(22,59,36,0.04)] sm:px-4">
            {stepLabels.map((label, index) => {
                const isComplete = index < activeIndex;
                const isActive = index === activeIndex;
                const circleClass = isComplete
                    ? 'bg-[#1f7a42] text-white'
                    : isActive
                      ? 'border-[#1f7a42] bg-[#eaf8ee] text-[#1f7a42]'
                      : 'border-[#dfeee5] bg-[#f7faf7] text-[#7e8d87]';
                return (
                    <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${circleClass}`}>
                            {isComplete ? <Check size={14} /> : index + 1}
                        </div>
                        <span
                            className={`hidden truncate text-[10px] font-semibold sm:inline ${isActive ? 'text-[#163b24]' : isComplete ? 'text-[#2c7a3b]' : 'text-[#7e8d87]'}`}
                        >
                            {label}
                        </span>
                        {index < stepLabels.length - 1 && <div className="hidden h-px flex-1 bg-[#dfeee5] sm:block" />}
                    </div>
                );
            })}
        </div>
    );
}

function OrderSummary({
    items,
    subtotal,
    shippingCost,
    discount,
    total,
    step,
    onPlaceOrder,
    disabled,
    isSubmitting,
}: {
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    step: CheckoutStep;
    onPlaceOrder: () => void;
    disabled: boolean;
    isSubmitting: boolean;
}) {
    return (
        <aside className="rounded-[26px] border border-[#dfeee5] bg-[#ebf9ee] p-4 shadow-[0_12px_35px_rgba(22,59,36,0.06)] sm:p-5 lg:sticky lg:top-5">
            <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-[#163b24]">Order summary</h3>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold tracking-[0.16em] text-[#2c7a3b] uppercase">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="mt-5 space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-2.5">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-[#e9f6ea]">
                            {item.product?.images?.[0]?.path ? (
                                <img
                                    src={
                                        item.product.images[0].path.startsWith('/')
                                            ? item.product.images[0].path
                                            : `/storage/${item.product.images[0].path}`
                                    }
                                    alt={item.product?.name || 'Product'}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <ShoppingBag size={22} className="text-[#2c9350]" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#163b24]">{item.product?.name || 'Product'}</p>
                            <p className="mt-0.5 text-xs text-[#647568]">Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-[#163b24]">{formatPrice(Number(item.price_snapshot) * item.quantity)}</p>
                    </div>
                ))}
            </div>

            <div className="mt-5 space-y-2 text-sm text-[#647568]">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-[#2c7a3b]">
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                    </div>
                )}
                <div className="border-t border-[#dfeee5] pt-3">
                    <div className="flex justify-between text-base font-bold text-[#163b24]">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>
            </div>

            {(step === 'cart' || step === 'shipping' || step === 'payment' || step === 'review') && (
                <button
                    type="button"
                    disabled={disabled || isSubmitting}
                    onClick={onPlaceOrder}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f7a42] px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(31,122,66,0.25)] transition hover:bg-[#163b24] disabled:opacity-50"
                >
                    {step === 'cart' ? 'Proceed to Shipping' : step === 'shipping' ? 'Continue' : step === 'payment' ? 'Continue' : 'Place Order'}
                    <ArrowRight size={16} />
                </button>
            )}
        </aside>
    );
}

export default function CustomerCheckout() {
    const { selectedItemIds: initialSelectedItemIds = [] } = usePage<CheckoutProps>().props;
    const { data, isLoading } = useQuery<CartData>({
        queryKey: ['cart'],
        queryFn: async () => (await api.get('/customer/cart')).data,
    });
    const { data: voucherData } = useQuery({ queryKey: ['customer-vouchers'], queryFn: getCustomerVouchers });
    const items = data?.items || [];
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>(initialSelectedItemIds);
    const [step, setStep] = useState<CheckoutStep>('cart');
    const [address, setAddress] = useState<AddressForm>(emptyAddress);
    const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
    const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'cod'>('gcash');
    const [voucherCode, setVoucherCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [notice, setNotice] = useState('');
    const [gcashNumber, setGcashNumber] = useState('');
    const [gcashName, setGcashName] = useState('');
    const [gcashReceipt, setGcashReceipt] = useState<File | null>(null);
    const [qrPreview, setQrPreview] = useState<{ shopName: string; url: string } | null>(null);
    const [busy, setBusy] = useState(false);
    const [addressReady, setAddressReady] = useState(false);

    const selectedItems = useMemo(() => items.filter((item) => selectedItemIds.includes(item.id)), [items, selectedItemIds]);
    const subtotal = selectedItems.reduce((sum, item) => sum + Number(item.price_snapshot) * item.quantity, 0);
    const shippingCost = shippingMethod === 'express' ? 99 : subtotal > 1000 ? 0 : 0;
    const total = Math.max(0, subtotal + shippingCost - discount);

    useEffect(() => {
        if (!data) return;
        if (!selectedItemIds.length) {
            setSelectedItemIds(data.items.map((item) => item.id));
        } else {
            setSelectedItemIds((current) => current.filter((id) => data.items.some((item) => item.id === id)));
        }
    }, [data, selectedItemIds.length]);

    useEffect(() => {
        if (addressReady || isLoading) return;

        currentUser()
            .then((user) => {
                const saved =
                    ((user.addresses || []) as (AddressForm & { is_default?: boolean })[]).find((item) => item.is_default) || user.addresses?.[0];
                setAddress({ ...emptyAddress, full_name: saved?.full_name || user.name || '', phone: saved?.phone || user.phone || '', ...saved });
                setAddressReady(true);
            })
            .catch(() => setAddressReady(true));
    }, [addressReady, isLoading]);

    useEffect(() => {
        const shop = selectedItems.find((item) => item.product?.shop)?.product?.shop;
        setGcashNumber(shop?.gcash_mobile_number || '');
        setGcashName(shop?.gcash_account_name || '');
    }, [selectedItems]);

    useEffect(() => {
        if (voucherCode || discount > 0 || !subtotal || !voucherData?.claimed_vouchers?.length) return;

        const eligibleVoucher = voucherData.claimed_vouchers.find((voucher) => Number(voucher.min_spend) <= subtotal);
        if (!eligibleVoucher) return;

        setVoucherCode(eligibleVoucher.code);
        void validateVoucher(eligibleVoucher.code, subtotal)
            .then((result) => {
                setDiscount(result.discount);
                setNotice('');
            })
            .catch(() => {
                setVoucherCode('');
                setDiscount(0);
            });
    }, [discount, subtotal, voucherCode, voucherData]);

    async function submitOrder() {
        setBusy(true);
        setNotice('');

        try {
            await checkoutCart({
                shipping_address: address,
                payment_method: paymentMethod === 'gcash' ? 'gcash' : 'cash_on_delivery',
                voucher_code: voucherCode.trim(),
                selected_item_ids: selectedItemIds,
                gcash_receipt: paymentMethod === 'gcash' ? gcashReceipt : null,
            });
            setStep('success');
        } catch (error: any) {
            setNotice(error?.response?.data?.message || 'Checkout could not be completed.');
            setBusy(false);
        }
    }

    function goNext() {
        if (step === 'cart') {
            if (!selectedItems.length) {
                setNotice('Select at least one product to continue.');
                return;
            }
            setStep('shipping');
            return;
        }

        if (step === 'shipping') {
            setStep('payment');
            return;
        }

        if (step === 'payment') {
            if (paymentMethod === 'gcash' && (!gcashNumber.trim() || !gcashName.trim() || !gcashReceipt)) {
                setNotice('Enter your GCash details and upload your payment proof before continuing.');
                return;
            }
            setStep('review');
            return;
        }

        if (step === 'review') {
            void submitOrder();
        }
    }

    const renderCurrentStep = () => {
        if (step === 'success') {
            return (
                <div className="flex min-h-105 items-center justify-center">
                    <div className="w-full max-w-162.5 rounded-3xl border border-[#dfeee5] bg-white p-6 text-center shadow-[0_16px_42px_rgba(22,59,36,0.06)] sm:p-8">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#eaf8ee] text-[#1f7a42] shadow-inner shadow-[#1f7a42]/15">
                            <Check size={42} strokeWidth={3} />
                        </div>
                        <h2 className="font-display mt-6 text-3xl font-bold text-[#163b24]">Order Placed!</h2>
                        <p className="mt-2 text-sm text-[#647568]">Thank you for your purchase.</p>
                        <p className="mt-4 text-sm text-[#647568]">Your order #ORD123456 has been received and is being processed.</p>
                        <div className="mt-6 rounded-2xl border border-[#dfeee5] bg-[#f7faf7] p-4 text-left">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-[#163b24]">Delivery Method</span>
                                <span className="text-[#2c7a3b]">{paymentMethod === 'gcash' ? 'GCash' : 'Cash on Delivery'}</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm">
                                <span className="font-semibold text-[#163b24]">Estimated Delivery</span>
                                <span className="text-[#647568]">May 20 – May 23, 2025</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm">
                                <span className="font-semibold text-[#163b24]">Shipping</span>
                                <span className="text-[#647568]">Standard Shipping</span>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                className="flex-1 rounded-2xl bg-[#1f7a42] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(31,122,66,0.18)] hover:bg-[#163b24]"
                            >
                                View Order Details
                            </button>
                            <button
                                type="button"
                                onClick={() => router.visit('/customer/products')}
                                className="flex-1 rounded-2xl border border-[#dfeee5] bg-white px-5 py-3 text-sm font-bold text-[#163b24] hover:bg-[#f7faf7]"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 'cart') {
            return (
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-display text-2xl font-bold text-[#163b24]">
                            Your Items <span className="text-[#647568]">({selectedItems.length})</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {selectedItems.map((item) => {
                            const image = item.product?.images?.find((img) => img.is_primary) || item.product?.images?.[0];
                            const imgSrc = image
                                ? image.path.startsWith('http') || image.path.startsWith('/')
                                    ? image.path
                                    : `/storage/${image.path}`
                                : null;

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-3xl border border-[#dfeee5] bg-white p-3 shadow-[0_10px_30px_rgba(22,59,36,0.04)] sm:p-4"
                                >
                                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-[#eefaf1] sm:h-28 sm:w-28">
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={item.product?.name || 'Product'} className="h-full w-full object-cover" />
                                        ) : (
                                            <ShoppingBag className="text-[#2c9350]" size={30} />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-base font-bold text-[#163b24]">{item.product?.name || 'Product'}</p>
                                        <p className="mt-1 text-sm text-[#647568]">White / 9 (US)</p>
                                        <p className="mt-2 text-base font-bold text-[#163b24]">{formatPrice(Number(item.price_snapshot))}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <div className="flex items-center gap-2 rounded-full border border-[#dfeee5] bg-[#f5fcf7] px-2 py-1.5">
                                            <button
                                                type="button"
                                                className="flex h-7 w-7 items-center justify-center rounded-full text-[#1f7a42] hover:bg-white"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus size={13} />
                                            </button>
                                            <span className="w-4 text-center text-sm font-bold text-[#163b24]">{item.quantity}</span>
                                            <button
                                                type="button"
                                                className="flex h-7 w-7 items-center justify-center rounded-full text-[#1f7a42] hover:bg-white"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus size={13} />
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label="Remove item"
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4faf5] text-[#163b24] hover:bg-[#eaf8ee]"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (step === 'shipping') {
            return (
                <div className="space-y-5">
                    <div className="rounded-[26px] border border-[#dfeee5] bg-white p-4 shadow-[0_10px_30px_rgba(22,59,36,0.04)] sm:p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-xl font-bold text-[#163b24]">Delivery Address</h3>
                            <button type="button" className="rounded-full border border-[#dfeee5] px-3 py-1.5 text-xs font-semibold text-[#1f7a42]">
                                + Add New Address
                            </button>
                        </div>
                        <div className="mt-4 rounded-2xl border border-[#dfeee5] bg-[#f7faf7] p-4">
                            <p className="text-base font-bold text-[#163b24]">{address.full_name || 'Juan Dela Cruz'}</p>
                            <p className="mt-1 text-sm text-[#647568]">{address.phone || '+63 912 345 6789'}</p>
                            <p className="mt-2 text-sm text-[#647568]">{address.line1 || '123 Santos St., San Pedro'}</p>
                            <p className="text-sm text-[#647568]">
                                {address.city || 'Laguna'}, {address.postal_code || '4023'}
                            </p>
                        </div>
                    </div>

                </div>
            );
        }

        if (step === 'payment') {
            return (
                <div className="space-y-5">
                    <div className="rounded-[26px] border border-[#dfeee5] bg-white p-4 shadow-[0_10px_30px_rgba(22,59,36,0.04)] sm:p-5">
                        <h3 className="font-display text-xl font-bold text-[#163b24]">Choose Payment Method</h3>
                        <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('gcash')}
                                className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${paymentMethod === 'gcash' ? 'border-[#1f7a42] bg-[#ebf9ee]' : 'border-[#dfeee5] bg-[#f7faf7]'}`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff4e7] text-[#1f7a42]">
                                    <WalletCards size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-[#163b24]">GCash</p>
                                    <p className="text-sm text-[#647568]">Pay securely via GCash</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cod')}
                                className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${paymentMethod === 'cod' ? 'border-[#1f7a42] bg-[#ebf9ee]' : 'border-[#dfeee5] bg-[#f7faf7]'}`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff4e7] text-[#1f7a42]">
                                    <PackageCheck size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-[#163b24]">Cash on Delivery</p>
                                    <p className="text-sm text-[#647568]">Pay when you receive your order</p>
                                </div>
                            </button>
                        </div>

                        {paymentMethod === 'gcash' ? (
                            <div className="mt-5 rounded-3xl border border-[#dfeee5] bg-[#f7faf7] p-4">
                                <div className="mb-4 flex items-center gap-2 text-[#1f7a42]">
                                    <WalletCards size={18} />
                                    <div>
                                        <p className="font-bold text-[#163b24]">Pay with GCash</p>
                                        <p className="text-xs font-normal text-[#647568]">
                                            Scan the seller QR code, send the exact total, then upload your proof.
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                                    {Array.from(
                                        new Map(
                                            selectedItems
                                                .map((item) => item.product?.shop)
                                                .filter((shop) => shop?.gcash_qr_code_url)
                                                .map((shop) => [shop?.id, shop]),
                                        ).values(),
                                    ).map(
                                        (shop) =>
                                            shop?.gcash_qr_code_url && (
                                                <button
                                                    type="button"
                                                    key={shop.id}
                                                    onClick={() => setQrPreview({ shopName: shop.name, url: shop.gcash_qr_code_url || '' })}
                                                    className="flex items-center gap-3 rounded-2xl border border-[#cde8d2] bg-white p-3 text-left hover:border-[#1f7a42]"
                                                >
                                                    <img
                                                        src={shop.gcash_qr_code_url}
                                                        alt={`GCash QR code for ${shop.name}`}
                                                        className="h-24 w-24 rounded-xl object-contain"
                                                    />
                                                    <span className="min-w-0">
                                                        <span className="block text-xs font-bold tracking-wide text-[#2c7a3b] uppercase">
                                                            Scan to pay
                                                        </span>
                                                        <span className="mt-1 block truncate text-sm font-bold text-[#163b24]">{shop.name}</span>
                                                        <span className="mt-1 block text-xs text-[#647568]">Tap to enlarge QR</span>
                                                    </span>
                                                </button>
                                            ),
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-[#163b24]">
                                        GCash Number
                                        <input
                                            value={gcashNumber}
                                            readOnly
                                            className="mt-1 w-full rounded-xl border border-[#dfeee5] bg-[#f5faf6] px-3 py-2.5 text-sm text-[#163b24] outline-none"
                                        />
                                    </label>
                                    <label className="block text-sm font-semibold text-[#163b24]">
                                        Name on GCash Account
                                        <input
                                            value={gcashName}
                                            readOnly
                                            className="mt-1 w-full rounded-xl border border-[#dfeee5] bg-[#f5faf6] px-3 py-2.5 text-sm text-[#163b24] outline-none"
                                        />
                                    </label>
                                    <label className="block text-sm font-semibold text-[#163b24]">
                                        Payment proof
                                        <input
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={async (event) => {
                                                const file = event.target.files?.[0];
                                                setGcashReceipt(file ? await optimizeImage(file, { maxWidth: 1600, maxHeight: 1600 }) : null);
                                            }}
                                            className="mt-1 block w-full rounded-xl border border-dashed border-[#b8d9c0] bg-white px-3 py-2.5 text-sm text-[#647568] file:mr-3 file:rounded-lg file:border-0 file:bg-[#1f7a42] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
                                        />
                                        <span className="mt-1 block text-xs font-normal text-[#647568]">
                                            Upload a clear screenshot or photo of your completed GCash transfer.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 rounded-3xl border border-[#dfeee5] bg-[#f7faf7] p-4">
                                <div className="flex items-center gap-3 text-[#163b24]">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff4e7] text-[#1f7a42]">
                                        <PackageCheck size={22} />
                                    </div>
                                    <div>
                                        <p className="font-display text-xl font-bold">Cash on Delivery</p>
                                        <p className="text-sm text-[#647568]">Pay in cash when your order arrives at your doorstep.</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-3 text-sm text-[#647568]">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-[#2c7a3b]" /> No online payment needed
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-[#2c7a3b]" /> Safe & secure
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-[#2c7a3b]" /> Available nationwide
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (step === 'review') {
            return (
                <div className="space-y-5">
                    <div className="rounded-[26px] border border-[#dfeee5] bg-white p-4 shadow-[0_10px_30px_rgba(22,59,36,0.04)] sm:p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-xl font-bold text-[#163b24]">Shipping Address</h3>
                            <button type="button" onClick={() => setStep('shipping')} className="text-sm font-semibold text-[#1f7a42]">
                                Edit
                            </button>
                        </div>
                        <div className="mt-3 rounded-2xl border border-[#dfeee5] bg-[#f7faf7] p-4 text-sm text-[#647568]">
                            <p className="font-bold text-[#163b24]">{address.full_name || 'Juan Dela Cruz'}</p>
                            <p className="mt-1">{address.phone || '+63 912 345 6789'}</p>
                            <p className="mt-2">{address.line1 || '123 Santos St., San Pedro'}</p>
                            <p>
                                {address.city || 'Laguna'}, {address.postal_code || '4023'}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[26px] border border-[#dfeee5] bg-white p-4 shadow-[0_10px_30px_rgba(22,59,36,0.04)] sm:p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-xl font-bold text-[#163b24]">Shipping Method</h3>
                            <button type="button" onClick={() => setStep('shipping')} className="text-sm font-semibold text-[#1f7a42]">
                                Edit
                            </button>
                        </div>
                        <div className="mt-3 rounded-2xl border border-[#dfeee5] bg-[#f7faf7] p-4 text-sm text-[#647568]">
                            <p className="font-bold text-[#163b24]">{shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping'}</p>
                            <p className="mt-1">{shippingMethod === 'express' ? '1–2 business days' : '3–5 business days'}</p>
                            <p className="mt-1 text-[#2c7a3b]">{shippingMethod === 'express' ? '₱99' : 'FREE'}</p>
                        </div>
                    </div>

                    <div className="rounded-[26px] border border-[#dfeee5] bg-white p-4 shadow-[0_10px_30px_rgba(22,59,36,0.04)] sm:p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-xl font-bold text-[#163b24]">Payment Method</h3>
                            <button type="button" onClick={() => setStep('payment')} className="text-sm font-semibold text-[#1f7a42]">
                                Edit
                            </button>
                        </div>
                        <div className="mt-3 rounded-2xl border border-[#dfeee5] bg-[#f7faf7] p-4 text-sm text-[#647568]">
                            <p className="font-bold text-[#163b24]">{paymentMethod === 'gcash' ? 'GCash' : 'Cash on Delivery'}</p>
                            <p className="mt-1">{paymentMethod === 'gcash' ? 'Pay via GCash' : 'Pay when you receive your order'}</p>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    if (isLoading) {
        return (
            <>
                <Head title="Checkout" />
                <PortalLayout role="customer" title="Checkout" eyebrow="Loading order...">
                    <div className="rounded-3xl border border-[#def0e2] bg-white p-8 text-center text-[#647568]">Loading checkout...</div>
                </PortalLayout>
            </>
        );
    }

    if (!items.length) {
        return (
            <>
                <Head title="Checkout" />
                <PortalLayout role="customer" title="Checkout" eyebrow="Your cart">
                    <div className="rounded-[30px] border border-[#dfeee5] bg-white p-10 text-center shadow-[0_16px_42px_rgba(22,59,36,0.06)]">
                        <ShoppingBag className="mx-auto text-[#2c9350]" size={42} />
                        <h2 className="font-display mt-4 text-2xl font-bold text-[#163b24]">Your cart is empty</h2>
                        <Link
                            href={route('marketplace')}
                            className="mt-5 inline-flex rounded-full bg-[#1f7a42] px-5 py-3 text-sm font-bold text-white"
                        >
                            Continue shopping
                        </Link>
                    </div>
                </PortalLayout>
            </>
        );
    }

    if (!selectedItems.length) {
        return (
            <>
                <Head title="Checkout" />
                <PortalLayout role="customer" title="Checkout" eyebrow="Select items">
                    <div className="rounded-[30px] border border-[#dfeee5] bg-white p-10 text-center shadow-[0_16px_42px_rgba(22,59,36,0.06)]">
                        <ShoppingBag className="mx-auto text-[#2c9350]" size={42} />
                        <h2 className="font-display mt-4 text-2xl font-bold text-[#163b24]">Select products from your cart</h2>
                        <Link
                            href={route('customer.cart')}
                            className="mt-5 inline-flex rounded-full bg-[#1f7a42] px-5 py-3 text-sm font-bold text-white"
                        >
                            Back to cart
                        </Link>
                    </div>
                </PortalLayout>
            </>
        );
    }

    return (
        <>
            <Head title="Checkout" />
            <PortalLayout role="customer" title="Checkout" eyebrow="Complete your order" hideHeader>
                <div className="mx-auto max-w-300 px-3 pt-1 pb-6 sm:px-5 lg:px-6 lg:pb-10">
                    <div className="rounded-[30px] border border-[#dfeee5] bg-[#f3faf5] p-3 shadow-[0_15px_42px_rgba(22,59,36,0.04)] sm:p-4 lg:p-5">
                        <div className="flex items-center gap-3 px-1 pb-2">
                            <Link
                                href={route('customer.cart')}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfeee5] bg-white text-[#163b24]"
                            >
                                <ArrowLeft size={18} />
                            </Link>
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.18em] text-[#2c7a3b] uppercase">Checkout</p>
                                <h1 className="font-display text-2xl font-bold text-[#163b24]">Checkout</h1>
                            </div>
                        </div>

                        <ProgressStepper step={step} />

                        {notice && <div className="mt-4 rounded-2xl bg-[#fbeaea] px-4 py-3 text-sm font-semibold text-[#b3413a]">{notice}</div>}

                        <div className="mt-5 grid gap-6 lg:grid-cols-[1.55fr_0.95fr]">
                            <div className="rounded-[28px] border border-[#dfeee5] bg-[#f9fefb] p-3 sm:p-4 lg:p-5">
                                {renderCurrentStep()}
                            </div>

                            <div className="block">
                                <OrderSummary
                                    items={selectedItems}
                                    subtotal={subtotal}
                                    shippingCost={shippingMethod === 'express' ? 99 : subtotal >= 1000 ? 0 : 0}
                                    discount={discount}
                                    total={total}
                                    step={step}
                                    onPlaceOrder={goNext}
                                    disabled={busy || !selectedItems.length}
                                    isSubmitting={busy}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {qrPreview && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#163b24]/70 p-5"
                        role="dialog"
                        aria-modal="true"
                        aria-label="GCash QR code"
                    >
                        <div className="relative w-full max-w-sm rounded-[28px] bg-white p-5 text-center shadow-2xl">
                            <button
                                type="button"
                                onClick={() => setQrPreview(null)}
                                aria-label="Close QR code"
                                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f2fbf4] text-[#163b24]"
                            >
                                <X size={17} />
                            </button>
                            <p className="text-xs font-bold tracking-[0.16em] text-[#2c7a3b] uppercase">Scan to pay via GCash</p>
                            <h3 className="font-display mt-1 text-xl font-bold text-[#163b24]">{qrPreview.shopName}</h3>
                            <img
                                src={qrPreview.url}
                                alt={`Large GCash QR code for ${qrPreview.shopName}`}
                                className="mx-auto mt-5 aspect-square w-full max-w-72.5 rounded-2xl border border-[#dfeee5] object-contain p-3"
                            />
                            <button
                                type="button"
                                onClick={() => setQrPreview(null)}
                                className="mt-5 w-full rounded-2xl bg-[#1f7a42] py-3 text-sm font-bold text-white"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </PortalLayout>
        </>
    );
}
