import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, ImagePlus, KeyRound, Mail, Phone, ShieldCheck, Store, UserRound } from 'lucide-react';
import { FormEvent } from 'react';

import InputError from '@/components/input-error';
import { PortalLayout } from '@/components/portal-layout';
import { optimizeImage } from '@/lib/image-upload';
import { type SharedData } from '@/types';

type SellerProfileData = SharedData & { avatarUrl?: string | null };

export default function SellerProfile() {
    const { auth, avatarUrl } = usePage<SellerProfileData>().props;
    const profileForm = useForm({
        _method: 'patch',
        name: auth.user.name ?? '',
        email: auth.user.email ?? '',
        phone: (auth.user.phone as string | undefined) ?? '',
        avatar: null as File | null,
    });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });

    function submitProfile(event: FormEvent) {
        event.preventDefault();
        profileForm.post(route('profile.update'), { forceFormData: true });
    }

    function submitPassword(event: FormEvent) {
        event.preventDefault();
        passwordForm.put(route('user-password.update'), { onSuccess: () => passwordForm.reset() });
    }

    return (
        <>
            <Head title="Seller profile" />
            <PortalLayout role="seller" title="Seller profile" eyebrow="Account settings">
                <div className="overflow-hidden rounded-[22px] border border-[#def0e2] bg-white shadow-[0_12px_35px_rgba(22,59,36,0.08)]">
                    <div className="relative overflow-hidden bg-[#163b24] px-6 py-8 text-white sm:px-10 sm:py-10">
                        <div className="absolute -right-10 -bottom-24 h-64 w-64 rounded-full border-28 border-[#2c9350]/30" />
                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border-4 border-white/20 bg-[#e6f7eb] text-[#2c7a3b] shadow-xl">
                                {profileForm.data.avatar ? (
                                    <img
                                        src={URL.createObjectURL(profileForm.data.avatar)}
                                        alt="Profile preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <UserRound size={36} />
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold tracking-[0.18em] text-[#9ee0a3] uppercase">Seller account</p>
                                <h2 className="font-display mt-2 text-3xl font-bold">Your seller identity.</h2>
                                <p className="mt-2 max-w-xl text-sm text-[#cce8d1]">
                                    Keep your contact details current so buyers and the marketplace team can reach you.
                                </p>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={submitProfile} className="p-6 sm:p-10">
                        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
                            <div>
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f6ea] text-[#2c7a3b]">
                                        <UserRound size={19} />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-xl font-bold">Personal information</h3>
                                        <p className="text-sm text-[#8b8a96]">The details used to identify and contact you.</p>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <label className="block text-sm font-semibold">
                                        Full name
                                        <input
                                            required
                                            value={profileForm.data.name}
                                            onChange={(event) => profileForm.setData('name', event.target.value)}
                                            className="mt-2 w-full rounded-xl border border-[#dfe9e1] bg-[#fbfefb] px-4 py-3 text-sm outline-none focus:border-[#3fa34d] focus:ring-4 focus:ring-[#e3f3e4]"
                                        />
                                        <InputError message={profileForm.errors.name} className="mt-2" />
                                    </label>
                                    <label className="block text-sm font-semibold">
                                        <span className="flex items-center gap-2">
                                            <Mail size={15} className="text-[#3fa34d]" /> Email address
                                        </span>
                                        <input
                                            required
                                            type="email"
                                            value={profileForm.data.email}
                                            onChange={(event) => profileForm.setData('email', event.target.value)}
                                            className="mt-2 w-full rounded-xl border border-[#dfe9e1] bg-[#fbfefb] px-4 py-3 text-sm outline-none focus:border-[#3fa34d] focus:ring-4 focus:ring-[#e3f3e4]"
                                        />
                                        <InputError message={profileForm.errors.email} className="mt-2" />
                                    </label>
                                    <label className="block text-sm font-semibold">
                                        <span className="flex items-center gap-2">
                                            <Phone size={15} className="text-[#3fa34d]" /> Phone number
                                        </span>
                                        <input
                                            value={profileForm.data.phone}
                                            onChange={(event) => profileForm.setData('phone', event.target.value)}
                                            placeholder="e.g. 0917 123 4567"
                                            className="mt-2 w-full rounded-xl border border-[#dfe9e1] bg-[#fbfefb] px-4 py-3 text-sm outline-none focus:border-[#3fa34d] focus:ring-4 focus:ring-[#e3f3e4]"
                                        />
                                        <InputError message={profileForm.errors.phone} className="mt-2" />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3d6] text-[#946a0c]">
                                        <Store size={19} />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-xl font-bold">Seller profile image</h3>
                                        <p className="text-sm text-[#8b8a96]">Use a recognizable image for your shop workspace.</p>
                                    </div>
                                </div>
                                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#cdebcf] bg-[#f5fcf7] p-7 text-center transition hover:border-[#3fa34d]">
                                    <ImagePlus size={25} className="text-[#2c9350]" />
                                    <span className="text-sm font-semibold text-[#2c7a3b]">Choose profile image</span>
                                    <span className="text-xs text-[#647568]">JPG, PNG, or WebP up to 2 MB.</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={async (event) => {
                                            const file = event.target.files?.[0];
                                            profileForm.setData('avatar', file ? await optimizeImage(file, { maxWidth: 800, maxHeight: 800 }) : null);
                                        }}
                                    />
                                </label>
                                <InputError message={profileForm.errors.avatar} className="mt-2" />
                                <div className="mt-6 flex items-start gap-3 border-t border-[#edf2ed] pt-5 text-sm text-[#647568]">
                                    <ShieldCheck size={18} className="shrink-0 text-[#2c9350]" />
                                    Seller access is enabled for this account.
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 flex flex-col gap-4 border-t border-[#edf2ed] pt-6 sm:flex-row sm:items-center">
                            <button
                                disabled={profileForm.processing}
                                className="rounded-[14px] bg-[#1b1a20] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2c7a3b] disabled:opacity-50"
                            >
                                {profileForm.processing ? 'Saving...' : 'Save personal information'}
                            </button>
                            {profileForm.recentlySuccessful && (
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-[#2c7a3b]">
                                    <Check size={16} /> Saved successfully
                                </span>
                            )}
                        </div>
                    </form>
                </div>

                <div className="mt-6 overflow-hidden rounded-[22px] border border-[#def0e2] bg-white shadow-[0_12px_35px_rgba(22,59,36,0.08)]">
                    <div className="border-b border-[#edf2ed] px-6 py-6 sm:px-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4ecff] text-[#6b42c1]">
                                <KeyRound size={19} />
                            </div>
                            <div>
                                <h3 className="font-display text-xl font-bold">Change password</h3>
                                <p className="text-sm text-[#8b8a96]">Update the password used to access your seller workspace.</p>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={submitPassword} className="grid gap-5 p-6 sm:grid-cols-3 sm:p-10">
                        {(
                            [
                                ['current_password', 'Current password'],
                                ['password', 'New password'],
                                ['password_confirmation', 'Confirm new password'],
                            ] as const
                        ).map(([field, label]) => (
                            <label key={field} className="block text-sm font-semibold">
                                {label}
                                <input
                                    required
                                    type="password"
                                    value={passwordForm.data[field]}
                                    onChange={(event) => passwordForm.setData(field, event.target.value)}
                                    className="mt-2 w-full rounded-xl border border-[#dfe9e1] bg-[#fbfefb] px-4 py-3 text-sm outline-none focus:border-[#3fa34d] focus:ring-4 focus:ring-[#e3f3e4]"
                                />
                                <InputError message={passwordForm.errors[field]} className="mt-2" />
                            </label>
                        ))}
                        <div className="sm:col-span-3">
                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="rounded-[14px] bg-[#1b1a20] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2c7a3b] disabled:opacity-50"
                            >
                                {passwordForm.processing ? 'Updating...' : 'Update password'}
                            </button>
                        </div>
                    </form>
                </div>
            </PortalLayout>
        </>
    );
}
