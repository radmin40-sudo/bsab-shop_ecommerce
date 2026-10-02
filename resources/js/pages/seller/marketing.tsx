import { PortalLayout } from '@/components/portal-layout';
import { Head } from '@inertiajs/react';
import { ArrowUpRight, Megaphone, TicketPercent, TrendingUp } from 'lucide-react';

type SellerMarketingProps = {
    stats?: Array<{ label: string; value: string | number; detail: string }>;
    campaigns?: Array<{ name: string; status: string; views: string; orders: string; revenue: string; conversion: string }>;
};

const defaultCampaigns = [
    { name: 'Spring Harvest Boost', status: 'Active', views: '18.4K', orders: '482', revenue: '₱58,300', conversion: '3.9%' },
    { name: 'Fresh Starter Promo', status: 'Scheduled', views: '9.2K', orders: '231', revenue: '₱28,700', conversion: '2.9%' },
    { name: 'Weekend Combo Deal', status: 'Active', views: '12.1K', orders: '346', revenue: '₱33,500', conversion: '3.4%' },
];

export default function SellerMarketing({ stats = defaultStats, campaigns = defaultCampaigns }: SellerMarketingProps) {
    return (
        <>
            <Head title="Seller marketing" />
            <PortalLayout role="seller" title="Marketing" eyebrow="Promotions & campaigns">
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        {stats.map((stat) => (
                            <StatCard
                                key={stat.label}
                                icon={stat.label === 'Campaigns' ? Megaphone : stat.label === 'Promotions' ? TicketPercent : TrendingUp}
                                label={stat.label}
                                value={typeof stat.value === 'number' ? String(stat.value) : stat.value}
                                detail={stat.detail}
                            />
                        ))}
                    </div>

                    <section className="rounded-3xl border border-[#def0e2] bg-white p-5 shadow-[0_6px_20px_rgba(22,59,36,0.04)]">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.16em] text-[#2f9d5b] uppercase">Campaigns</p>
                                <h2 className="mt-2 text-2xl font-bold text-[#163b24]">Active promotions</h2>
                            </div>
                            <div className="flex gap-2">
                                <button className="rounded-xl border border-[#d7e8dc] bg-[#eefaf3] px-3 py-2 text-xs font-semibold text-[#1f7a42]">
                                    Create Campaign
                                </button>
                                <button className="rounded-xl bg-[#1f7a42] px-3 py-2 text-xs font-semibold text-white">Create Voucher</button>
                            </div>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-3">
                            {campaigns.map((campaign) => (
                                <div key={campaign.name} className="rounded-[22px] border border-[#e9f0eb] bg-[#fbfdfb] p-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-[#163b24]">{campaign.name}</h3>
                                        <span className="rounded-full bg-[#eafaf3] px-2 py-1 text-[10px] font-bold text-[#1f7a42]">
                                            {campaign.status}
                                        </span>
                                    </div>
                                    <div className="space-y-3 text-sm text-[#51675d]">
                                        <MetricRow label="Views" value={campaign.views} />
                                        <MetricRow label="Orders" value={campaign.orders} />
                                        <MetricRow label="Revenue" value={campaign.revenue} />
                                        <MetricRow label="Conversion" value={campaign.conversion} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </PortalLayout>
        </>
    );
}

const defaultStats = [
    { label: 'Campaigns', value: 12, detail: '3 active' },
    { label: 'Promotions', value: 8, detail: '2 expiring' },
    { label: 'Conversion', value: '3.8%', detail: '+0.6%' },
];

function StatCard({ icon: Icon, label, value, detail }: { icon: typeof Megaphone; label: string; value: string; detail: string }) {
    return (
        <div className="rounded-[22px] border border-[#def0e2] bg-white p-4 shadow-[0_6px_20px_rgba(22,59,36,0.04)]">
            <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ecf9f0] text-[#1f7a42]">
                    <Icon size={18} />
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1f7a42]">
                    <ArrowUpRight size={12} /> {detail}
                </span>
            </div>
            <p className="mt-4 text-[10px] font-bold tracking-[0.14em] text-[#7a8c82] uppercase">{label}</p>
            <h3 className="mt-2 text-3xl font-bold text-[#163b24]">{value}</h3>
        </div>
    );
}

function MetricRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-[#edf3ee] bg-white px-3 py-2">
            <span className="text-[#51675d]">{label}</span>
            <strong className="text-[#163b24]">{value}</strong>
        </div>
    );
}
