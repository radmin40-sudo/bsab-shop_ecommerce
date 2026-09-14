import { PortalLayout } from '@/components/portal-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function CustomerSavedPreferencesSettings() {
    return (
        <>
            <Head title="Saved preferences" />
            <PortalLayout role="customer" title="Saved preferences" eyebrow="Account preferences">
                <div className="mb-6">
                    <Link
                        href={route('customer.settings')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f7a42] hover:text-[#185f35]"
                    >
                        <ArrowLeft size={16} /> Back to settings
                    </Link>
                </div>

                <div className="rounded-3xl border border-[#def0e2] bg-white p-6 shadow-[0_12px_28px_rgba(22,59,36,0.04)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5f7eb] text-[#27a957]">
                        <Sparkles size={24} />
                    </div>
                    <h1 className="font-display mt-5 text-3xl font-bold text-[#163b24]">Saved preferences</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#647568]">
                        Keep track of the categories, recommendations, and alerts that matter most to the way you shop.
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {['Electronics', 'Home & Living', 'Fashion deals', 'Local sellers', 'Weekly budget alerts', 'Recommended for you'].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="rounded-2xl border border-[#edf3ee] bg-[#f9fbfa] px-4 py-3 text-sm font-medium text-[#1d3a2c]"
                                >
                                    {item}
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </PortalLayout>
        </>
    );
}
