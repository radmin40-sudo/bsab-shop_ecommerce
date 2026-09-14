import { PortalLayout } from '@/components/portal-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, KeyRound } from 'lucide-react';

export default function CustomerPasswordSettings() {
    return (
        <>
            <Head title="Password settings" />
            <PortalLayout role="customer" title="Password" eyebrow="Account preferences">
                <div className="mb-6">
                    <Link
                        href={route('customer.settings')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f7a42] hover:text-[#185f35]"
                    >
                        <ArrowLeft size={16} /> Back to settings
                    </Link>
                </div>

                <div className="rounded-3xl border border-[#def0e2] bg-white p-6 shadow-[0_12px_28px_rgba(22,59,36,0.04)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4ecff] text-[#6b42c1]">
                        <KeyRound size={24} />
                    </div>
                    <h1 className="font-display mt-5 text-3xl font-bold text-[#163b24]">Password</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#647568]">
                        Update your password and keep your account access protected with a strong, up-to-date security credential.
                    </p>

                    <form className="mt-6 space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#1d3a2c]">Current password</label>
                            <input
                                type="password"
                                className="w-full rounded-2xl border border-[#dfeae3] bg-[#f9fbfa] px-4 py-3 text-sm text-[#163b24] ring-0 outline-none focus:border-[#9cc6a6]"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#1d3a2c]">New password</label>
                            <input
                                type="password"
                                className="w-full rounded-2xl border border-[#dfeae3] bg-[#f9fbfa] px-4 py-3 text-sm text-[#163b24] ring-0 outline-none focus:border-[#9cc6a6]"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#1d3a2c]">Confirm new password</label>
                            <input
                                type="password"
                                className="w-full rounded-2xl border border-[#dfeae3] bg-[#f9fbfa] px-4 py-3 text-sm text-[#163b24] ring-0 outline-none focus:border-[#9cc6a6]"
                            />
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center rounded-full bg-[#1f7a42] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(31,122,66,0.18)] transition hover:bg-[#185f35]"
                        >
                            Update password
                        </button>
                    </form>
                </div>
            </PortalLayout>
        </>
    );
}
