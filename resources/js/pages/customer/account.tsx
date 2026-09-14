import { PortalLayout, StatCard } from '@/components/portal-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Heart, Package, ShoppingCart } from 'lucide-react';

export default function CustomerAccount() {
    return (
        <>
            <Head title="Your account" />
            <PortalLayout role="customer" title="Welcome back" eyebrow="Your account">
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard marketto label="Orders placed" value="12" detail="Since joining" />
                    <StatCard marketto label="Favorites" value="8" detail="Waiting in your favorites" tone="warm" />
                    <StatCard marketto label="Saved addresses" value="2" detail="Home and studio" tone="green" />
                </div>
                <section className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Link
                        href="/customer/orders"
                        className="flex items-center gap-4 rounded-2xl border border-[#eeebe4] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        <Package className="text-[#3fa34d]" />
                        <span>
                            <strong className="font-display block text-xl">Track an order</strong>
                            <small className="mt-1 block text-[#8b8a96]">See your latest delivery status</small>
                        </span>
                        <ArrowRight className="ml-auto" size={18} />
                    </Link>
                    <Link
                        href="/customer/cart"
                        className="flex items-center gap-4 rounded-2xl border border-[#eeebe4] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        <ShoppingCart className="text-[#3fa34d]" />
                        <span>
                            <strong className="font-display block text-xl">Your cart</strong>
                            <small className="mt-1 block text-[#8b8a96]">2 items waiting for you</small>
                        </span>
                        <ArrowRight className="ml-auto" size={18} />
                    </Link>
                </section>
                <section className="mt-8 rounded-2xl border border-[#1b1a20] bg-[#1b1a20] p-6 text-white">
                    <div className="flex items-center gap-4">
                        <Heart className="text-[#9ee0a3]" />
                        <div>
                            <h2 className="font-display text-2xl font-bold">Your saved edit</h2>
                            <p className="mt-1 text-sm text-[#c4c2cc]">Keep the pieces that feel like you close by.</p>
                        </div>
                    </div>
                </section>
            </PortalLayout>
        </>
    );
}
