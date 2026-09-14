import { PortalLayout } from '@/components/portal-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Bell } from 'lucide-react';

export default function CustomerNotificationsSettings() {
    return (
        <>
            <Head title="Notifications settings" />
            <PortalLayout role="customer" title="Notifications" eyebrow="Account preferences">
                <div className="mb-6">
                    <Link
                        href={route('customer.settings')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f7a42] hover:text-[#185f35]"
                    >
                        <ArrowLeft size={16} /> Back to settings
                    </Link>
                </div>

                <div className="rounded-3xl border border-[#def0e2] bg-white p-6 shadow-[0_12px_28px_rgba(22,59,36,0.04)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf7ee] text-[#1f7a42]">
                        <Bell size={24} />
                    </div>
                    <h1 className="font-display mt-5 text-3xl font-bold text-[#163b24]">Notifications</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#647568]">
                        Choose which updates you want to receive about orders, promotions, product restocks, and account alerts.
                    </p>

                    <div className="mt-6 space-y-4">
                        {[
                            'Order updates',
                            'Product alerts and restocks',
                            'Promotions and discounts',
                            'Delivery and shipping notices',
                            'Security alerts',
                        ].map((item) => (
                            <div key={item} className="flex items-center justify-between rounded-2xl border border-[#edf3ee] bg-[#f9fbfa] px-4 py-3">
                                <span className="text-sm font-medium text-[#1d3a2c]">{item}</span>
                                <button className="h-6 w-11 rounded-full bg-[#cfead9] p-1 transition hover:bg-[#bbdfc9]">
                                    <span className="block h-4 w-4 rounded-full bg-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </PortalLayout>
        </>
    );
}
