import { PortalLayout } from '@/components/portal-layout';
import { api, checkoutCart, currentUser, removeCartItem, updateCartItem, validateVoucher } from '@/lib/api';
import { Head, Link, router } from '@inertiajs/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, BadgePercent, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useState } from 'react';

type CartItem = {
    id: number;
    quantity: number;
    price_snapshot: string;
    product?: { name: string; shop?: { name: string }; images?: { path: string; is_primary: boolean }[] };
};
type CartData = { items: CartItem[]; available_vouchers?: AvailableVoucher[] };
type AddressForm = { full_name: string; phone: string; line1: string; city: string; province: string; postal_code: string };
type UserAddress = AddressForm & { is_default: boolean };
type AvailableVoucher = {
    id: number;
    code: string;
    type: string;
    value: string;
    min_spend: string;
    expires_at?: string | null;
    shop?: { name: string } | null;
};

function formatPrice(n: number) {
    return '₱' + n.toLocaleString('en-PH', { maximumFractionDigits: 0 });
}

export default function CustomerCart() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery<CartData>({
        queryKey: ['cart'],
        queryFn: async () => (await api.get('/customer/cart')).data,
    });
    const items: CartItem[] = data?.items || [];
    const availableVouchers: AvailableVoucher[] = data?.available_vouchers || [];

    const [busyId, setBusyId] = useState<number | null>(null);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutBusy, setCheckoutBusy] = useState(false);
    const [voucherCode, setVoucherCode] = useState(() => {
        if (typeof window === 'undefined') return '';
        return window.localStorage.getItem('sprig-claimed-voucher-code') || '';
    });
    const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
    const [usedVoucherCode, setUsedVoucherCode] = useState('');
    const [voucherBusy, setVoucherBusy] = useState(false);
    const [notice, setNotice] = useState('');
    const [address, setAddress] = useState<AddressForm>({
        full_name: '',
        phone: '',
        line1: '',
        city: '',
        province: '',
        postal_code: '',
    });

    const subtotal = items.reduce((sum, item) => sum + Number(item.price_snapshot) * item.quantity, 0);
    const total = Math.max(0, subtotal - (appliedVoucher?.discount || 0));

    async function changeQuantity(item: CartItem, quantity: number) {
        if (quantity < 1) return;
        setBusyId(item.id);
        setNotice('');
        const previousData = queryClient.getQueryData<CartData>(['cart']);
        queryClient.setQueryData<CartData>(['cart'], (current) =>
            current
                ? { ...current, items: current.items.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity } : cartItem)) }
                : current,
        );
        setAppliedVoucher(null);
        try {
            await updateCartItem(item.id, quantity);
            await queryClient.invalidateQueries({ queryKey: ['cart'] });
        } catch {
            queryClient.setQueryData(['cart'], previousData);
            setNotice('Unable to update this item.');
        } finally {
            setBusyId(null);
        }
    }

    async function removeItem(item: CartItem) {
        setBusyId(item.id);
        setNotice('');
        const previousData = queryClient.getQueryData<CartData>(['cart']);
        queryClient.setQueryData<CartData>(['cart'], (current) =>
            current ? { ...current, items: current.items.filter((cartItem) => cartItem.id !== item.id) } : current,
        );
        setAppliedVoucher(null);
        try {
            await removeCartItem(item.id);
            await queryClient.invalidateQueries({ queryKey: ['cart'] });
        } catch {
            queryClient.setQueryData(['cart'], previousData);
            setNotice('Unable to remove this item.');
        } finally {
            setBusyId(null);
        }
    }

    async function applyVoucher(event: React.FormEvent) {
        event.preventDefault();
        if (!voucherCode.trim()) return;
        setVoucherBusy(true);
        setNotice('');
        try {
            setAppliedVoucher(await validateVoucher(voucherCode.trim(), subtotal));
        } catch (error: any) {
            setAppliedVoucher(null);
            const message = error?.response?.data?.message || 'That voucher code is not valid.';
            if (message === 'You have already used this voucher.') setUsedVoucherCode(voucherCode.trim().toUpperCase());
            setNotice(message);
        } finally {
            setVoucherBusy(false);
        }
    }

    async function openCheckout() {
        setCheckoutLoading(true);
        setNotice('');
        try {
            const user = await currentUser();
            const addresses = (user.addresses || []) as UserAddress[];
            const saved = addresses.find((a) => a.is_default) || addresses[0];
            setAddress({
                full_name: saved?.full_name || user.name || '',
                phone: saved?.phone || user.phone || '',
                line1: saved?.line1 || '',
                city: saved?.city || '',
                province: saved?.province || '',
                postal_code: saved?.postal_code || '',
            });
            setCheckoutOpen(true);
        } catch {
            setNotice('Unable to load your personal information. Please try again.');
        } finally {
            setCheckoutLoading(false);
        }
    }

    async function submitCheckout(event: React.FormEvent) {
        event.preventDefault();
        setCheckoutBusy(true);
        setNotice('');
        try {
            await checkoutCart({
                shipping_address: address,
                payment_method: 'cash_on_delivery',
                voucher_code: appliedVoucher?.code || '',
            });
            router.visit('/customer/orders');
        } catch (error: any) {
            setNotice(error?.response?.data?.message || 'Checkout could not be completed.');
            setCheckoutBusy(false);
        }
    }

    return (
        <>
            <Head title="Your cart" />
            <PortalLayout role="customer" hideHeader>
                {/* Page title */}
                <div className="mb-7 flex items-center gap-3">
                    <Link
                        href={route('marketplace')}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#def0e2] bg-white text-[#1b4332] transition-colors hover:bg-[#f5fcf7]"
                        aria-label="Back to shop"
                    >
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 12H5" />
                            <path d="M12 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-2xl font-bold text-[#163b24]">My Cart</h1>
                </div>

                {notice && <div className="mb-4 rounded-xl bg-[#fbeaea] px-4 py-3 text-sm font-semibold text-[#b3413a]">{notice}</div>}

                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    {/* Cart items */}
                    <div className="min-w-0 flex-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-24 text-[#647568]">Loading your cart…</div>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#def0e2] bg-white py-24 text-center shadow-sm">
                                <ShoppingCart size={42} strokeWidth={1.4} className="text-[#52b788]" />
                                <p className="mt-4 text-xl font-bold text-[#163b24]">Your cart is empty</p>
                                <p className="mt-2 text-sm text-[#647568]">Find something you love in the marketplace.</p>
                                <Link
                                    href={route('marketplace')}
                                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1f7a42] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#163b24]"
                                >
                                    Continue shopping
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-[#def0e2] bg-white shadow-sm">
                                {items.map((item, index) => {
                                    const image = item.product?.images?.find((img) => img.is_primary) || item.product?.images?.[0];
                                    const imgSrc = image
                                        ? image.path.startsWith('http') || image.path.startsWith('/')
                                            ? image.path
                                            : `/storage/${image.path}`
                                        : null;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex items-center gap-4 px-5 py-5 sm:px-6 ${index !== 0 ? 'border-t border-[#e6f7eb]' : ''}`}
                                            style={{ opacity: busyId === item.id ? 0.5 : 1, transition: 'opacity 150ms' }}
                                        >
                                            <div className="h-19.5 w-19.5 shrink-0 overflow-hidden rounded-xl bg-[#e6f7eb]">
                                                {imgSrc ? (
                                                    <img
                                                        src={imgSrc}
                                                        alt={item.product?.name || 'Product'}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#2c9350]">
                                                        {(item.product?.name || 'P').slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-[#163b24]">{item.product?.name}</p>
                                                {item.product?.shop?.name && (
                                                    <p className="mt-0.5 text-xs text-[#647568]">{item.product.shop.name}</p>
                                                )}
                                                <p className="mt-2 text-[15px] font-bold text-[#163b24]">
                                                    {formatPrice(Number(item.price_snapshot))}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <div className="flex items-center gap-3 rounded-full border border-[#def0e2] bg-[#f5fcf7] px-3.5 py-2">
                                                    <button
                                                        onClick={() => changeQuantity(item, item.quantity - 1)}
                                                        disabled={busyId === item.id || item.quantity <= 1}
                                                        className="text-[#1f7a42] disabled:opacity-30"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus size={13} />
                                                    </button>
                                                    <span className="w-4 text-center text-sm font-semibold text-[#163b24]">{item.quantity}</span>
                                                    <button
                                                        onClick={() => changeQuantity(item, item.quantity + 1)}
                                                        disabled={busyId === item.id}
                                                        className="text-[#1f7a42] disabled:opacity-30"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus size={13} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item)}
                                                    disabled={busyId === item.id}
                                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f7a42] text-white transition-colors hover:bg-[#163b24] disabled:opacity-50"
                                                    aria-label={`Remove ${item.product?.name}`}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Order Summary panel */}
                    <div className="w-full shrink-0 lg:w-80 xl:w-96">
                        <div className="rounded-2xl border border-[#def0e2] bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-[#163b24]">Order Summary</h2>
                            <div className="mt-5 space-y-3 text-sm text-[#647568]">
                                <div className="flex justify-between">
                                    <span>
                                        Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})
                                    </span>
                                    <span className="font-medium text-[#163b24]">{formatPrice(subtotal)}</span>
                                </div>
                                {appliedVoucher && (
                                    <div className="flex justify-between font-semibold text-[#2c7a3b]">
                                        <span>Voucher discount</span>
                                        <span>-{formatPrice(appliedVoucher.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-xs text-[#647568]">At checkout</span>
                                </div>
                            </div>
                            <div className="my-5 border-t border-[#e6f7eb]" />
                            <div className="flex justify-between text-[15px] font-bold text-[#163b24]">
                                <span>Total Cost</span>
                                <span>{formatPrice(total)}</span>
                            </div>

                            {/* Promo code */}
                            <div className="mt-5">
                                {availableVouchers.length > 0 && !appliedVoucher && (
                                    <select
                                        value={availableVouchers.some((v) => v.code === voucherCode) ? voucherCode : ''}
                                        onChange={(e) => {
                                            setVoucherCode(e.target.value);
                                            setNotice('');
                                        }}
                                        className="mb-2 w-full rounded-xl border border-[#def0e2] bg-[#f5fcf7] px-3 py-2.5 text-sm text-[#163b24] outline-none focus:border-[#2c9350]"
                                    >
                                        <option value="">Choose an available voucher</option>
                                        {availableVouchers.map((v) => (
                                            <option key={v.id} value={v.code}>
                                                {v.code} · {v.type === 'percent' ? `${v.value}% off` : `₱${v.value} off`}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {appliedVoucher ? (
                                    <div className="flex items-center justify-between rounded-xl bg-[#edf7ed] px-3 py-2.5 text-sm font-semibold text-[#2c7a3b]">
                                        <div className="flex items-center gap-2">
                                            <BadgePercent size={15} />
                                            <span>{appliedVoucher.code} applied</span>
                                        </div>
                                        <button type="button" onClick={() => setAppliedVoucher(null)} aria-label="Remove voucher">
                                            <X size={15} />
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={applyVoucher} className="flex gap-2">
                                        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#def0e2] bg-[#f5fcf7] px-3 py-2.5">
                                            <BadgePercent size={15} className="shrink-0 text-[#647568]" />
                                            <input
                                                value={voucherCode}
                                                onChange={(e) => {
                                                    setVoucherCode(e.target.value);
                                                    setNotice('');
                                                }}
                                                disabled={usedVoucherCode === voucherCode.trim().toUpperCase()}
                                                placeholder="Promo Code"
                                                className="w-full bg-transparent text-sm text-[#163b24] outline-none placeholder:text-[#9fb6a6] disabled:cursor-not-allowed disabled:opacity-60"
                                            />
                                        </div>
                                        <button
                                            disabled={voucherBusy || usedVoucherCode === voucherCode.trim().toUpperCase()}
                                            className="rounded-xl bg-[#1f7a42] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#163b24] disabled:opacity-50"
                                        >
                                            {voucherBusy ? '…' : 'Apply'}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Checkout */}
                            <div className="mt-5">
                                {checkoutOpen ? (
                                    <form onSubmit={submitCheckout} className="space-y-3">
                                        <p className="text-sm font-bold text-[#163b24]">Delivery details</p>
                                        {(['full_name', 'phone', 'line1', 'city', 'province', 'postal_code'] as const).map((field) => (
                                            <input
                                                key={field}
                                                required
                                                value={address[field]}
                                                onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                                                placeholder={field === 'line1' ? 'Address' : field.replace('_', ' ')}
                                                className="w-full rounded-xl border border-[#def0e2] bg-[#f5fcf7] px-3 py-2.5 text-sm text-[#163b24] outline-none focus:border-[#2c9350]"
                                            />
                                        ))}
                                        <button
                                            disabled={checkoutBusy || !items.length}
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f7a42] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#163b24] disabled:opacity-50"
                                        >
                                            {checkoutBusy ? 'Processing…' : 'Place order'} <ArrowRight size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCheckoutOpen(false)}
                                            className="w-full text-xs font-semibold text-[#647568] transition-colors hover:text-[#1f7a42]"
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                ) : (
                                    <button
                                        onClick={openCheckout}
                                        disabled={!items.length || checkoutLoading}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f7a42] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#163b24] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {checkoutLoading ? 'Loading details…' : 'Proceed to Checkout'} <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </PortalLayout>
        </>
    );
}
