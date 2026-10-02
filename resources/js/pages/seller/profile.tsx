import { Head, useForm, usePage } from '@inertiajs/react';
import { Camera, Check, CheckCircle2, CloudUpload, ImagePlus, KeyRound, LockKeyhole, Mail, Phone, Save, UserRound } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { PortalLayout } from '@/components/portal-layout';
import { optimizeImage } from '@/lib/image-upload';
import { type SharedData } from '@/types';

type SellerProfileData = SharedData & { avatarUrl?: string | null };

export default function SellerProfile() {
    const { auth, avatarUrl } = usePage<SellerProfileData>().props;
    const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl ?? null);
    const profileForm = useForm({
        _method: 'patch',
        name: auth.user.name ?? '',
        email: auth.user.email ?? '',
        phone: (auth.user.phone as string | undefined) ?? '',
        avatar: null as File | null,
    });
    const passwordForm = useForm({ password: '', password_confirmation: '' });
    const password = passwordForm.data.password;
    const passwordRequirements = [
        { label: 'At least 8 characters', satisfied: password.length >= 8 },
        { label: 'One uppercase letter', satisfied: /[A-Z]/.test(password) },
        { label: 'One lowercase letter', satisfied: /[a-z]/.test(password) },
        { label: 'One number', satisfied: /\d/.test(password) },
        { label: 'One special character', satisfied: /[^A-Za-z0-9]/.test(password) },
    ];

    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    function submitProfile(event: FormEvent) {
        event.preventDefault();
        profileForm.post(route('profile.update'), { forceFormData: true, preserveScroll: true });
    }

    function submitPassword(event: FormEvent) {
        event.preventDefault();
        passwordForm.put(route('user-password.update'), { preserveScroll: true, onSuccess: () => passwordForm.reset() });
    }

    async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            profileForm.setError('avatar', 'Choose a JPG, PNG, or WebP image.');
            event.target.value = '';
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            profileForm.setError('avatar', 'The profile image must be 2 MB or smaller.');
            event.target.value = '';
            return;
        }

        profileForm.clearErrors('avatar');
        const optimized = await optimizeImage(file, { maxWidth: 800, maxHeight: 800, maxBytes: 2 * 1024 * 1024 });
        profileForm.setData('avatar', optimized);
        setAvatarPreview(URL.createObjectURL(optimized));
    }

    return (
        <>
            <Head title="Edit Profile" />
            <PortalLayout role="seller" title="Seller profile" eyebrow="Account settings">
                <div className="space-y-5">
                    <div>
                        <h1 className="mt-2 text-2xl font-bold text-[#1c2b23]">Edit Profile</h1>
                        <p className="mt-1 text-sm text-[#718076]">Manage your personal information and account settings.</p>
                    </div>

                    <div className="grid items-start gap-4 xl:grid-cols-[1.15fr_0.95fr]">
                        <form
                            onSubmit={submitProfile}
                            className="min-w-0 rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_14px_rgba(31,70,48,0.045)] sm:p-5"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f5ec] text-[#28734c]">
                                    <UserRound size={18} />
                                </span>
                                <div>
                                    <h2 className="text-sm font-bold text-[#25372c]">Personal Information</h2>
                                    <p className="mt-0.5 text-[10px] text-[#7c8a81]">The details used to identify and contact you.</p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
                                <label className="block text-[11px] font-semibold text-[#37483d] sm:col-span-2">
                                    Full name <span className="text-[#db4b4b]">*</span>
                                    <span className="mt-1.5 flex h-10 items-center gap-2 rounded-lg border border-[#dce5df] bg-white px-3 focus-within:border-[#279054] focus-within:ring-2 focus-within:ring-[#e5f3e9]">
                                        <UserRound size={15} className="shrink-0 text-[#44725a]" />
                                        <input
                                            required
                                            value={profileForm.data.name}
                                            onChange={(event) => profileForm.setData('name', event.target.value)}
                                            placeholder="Enter your full name"
                                            className="min-w-0 flex-1 bg-transparent text-xs font-normal text-[#344238] outline-none placeholder:text-[#9aa69e]"
                                        />
                                    </span>
                                    <InputError message={profileForm.errors.name} className="mt-1" />
                                </label>
                                <label className="block text-[11px] font-semibold text-[#37483d]">
                                    Email address <span className="text-[#db4b4b">*</span>
                                    <span className="mt-1.5 flex h-10 items-center gap-2 rounded-lg border border-[#dce5df] bg-white px-3 focus-within:border-[#279054] focus-within:ring-2 focus-within:ring-[#e5f3e9]">
                                        <Mail size={15} className="shrink-0 text-[#44725a]" />
                                        <input
                                            required
                                            type="email"
                                            value={profileForm.data.email}
                                            onChange={(event) => profileForm.setData('email', event.target.value)}
                                            placeholder="name@example.com"
                                            className="min-w-0 flex-1 bg-transparent text-xs font-normal text-[#344238] outline-none placeholder:text-[#9aa69e]"
                                        />
                                    </span>
                                    <InputError message={profileForm.errors.email} className="mt-1" />
                                </label>
                                <label className="block text-[11px] font-semibold text-[#37483d]">
                                    Phone number <span className="text-[#db4b4b">*</span>
                                    <span className="mt-1.5 flex h-10 items-center gap-2 rounded-lg border border-[#dce5df] bg-white px-3 focus-within:border-[#279054] focus-within:ring-2 focus-within:ring-[#e5f3e9]">
                                        <Phone size={15} className="shrink-0 text-[#44725a]" />
                                        <input
                                            required
                                            type="tel"
                                            value={profileForm.data.phone}
                                            onChange={(event) => profileForm.setData('phone', event.target.value)}
                                            placeholder="+63 912 345 6789"
                                            className="min-w-0 flex-1 bg-transparent text-xs font-normal text-[#344238] outline-none placeholder:text-[#9aa69e]"
                                        />
                                    </span>
                                    <InputError message={profileForm.errors.phone} className="mt-1" />
                                </label>
                            </div>

                            <div className="my-5 border-t border-[#e9eeeb]" />

                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f5ec] text-[#28734c]">
                                    <ImagePlus size={16} />
                                </span>
                                <div>
                                    <h2 className="text-xs font-bold text-[#2a3b30]">Seller Profile Image</h2>
                                    <p className="mt-0.5 text-[10px] text-[#7c8a81]">Use a recognizable image for your shop workspace.</p>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
                                <div className="relative h-22 w-22 shrink-0">
                                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#eef3ef] text-[#496c57]">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Seller profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <UserRound size={36} />
                                        )}
                                    </span>
                                    <label
                                        htmlFor="seller-avatar-upload"
                                        className="absolute right-0 bottom-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#178b4b] text-white"
                                        aria-label="Change profile image"
                                    >
                                        <Camera size={13} />
                                    </label>
                                </div>
                                <label
                                    htmlFor="seller-avatar-upload"
                                    className="flex min-h-22 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#b9d9c3] bg-[#f8fcf9] px-3 py-3 text-center transition hover:border-[#279054] hover:bg-[#f2faf4]"
                                >
                                    <CloudUpload size={21} className="text-[#24834d]" />
                                    <span className="mt-1 text-[11px] font-semibold text-[#267647]">Choose profile image</span>
                                    <span className="mt-0.5 text-[9px] text-[#839087]">JPG, PNG, or WebP up to 2 MB.</span>
                                    <input
                                        id="seller-avatar-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="sr-only"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>
                            <InputError message={profileForm.errors.avatar} className="mt-1.5" />

                            <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-[#288b50]">
                                <CheckCircle2 size={14} className="shrink-0" /> Seller access is enabled for this account.
                            </div>

                            <div className="mt-4">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#188747] px-4 text-xs font-semibold text-white transition hover:bg-[#126d39] disabled:opacity-50"
                                >
                                    <Save size={14} /> {profileForm.processing ? 'Saving...' : 'Save personal information'}
                                </button>
                                {profileForm.recentlySuccessful && (
                                    <p role="status" className="mt-2 text-center text-xs font-medium text-[#288b50]">
                                        Personal information saved.
                                    </p>
                                )}
                            </div>
                        </form>

                        <form
                            onSubmit={submitPassword}
                            className="min-w-0 rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_14px_rgba(31,70,48,0.045)] sm:p-5"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f5ec] text-[#28734c]">
                                    <KeyRound size={18} />
                                </span>
                                <div>
                                    <h2 className="text-sm font-bold text-[#25372c]">Change Password</h2>
                                    <p className="mt-0.5 text-[10px] text-[#7c8a81]">Update the password used to access your seller workspace.</p>
                                </div>
                            </div>

                            <label className="mt-5 block text-[11px] font-semibold text-[#37483d]">
                                New password <span className="text-[#db4b4b">*</span>
                                <span className="mt-1.5 flex h-10 items-center gap-2 rounded-lg border border-[#dce5df] bg-white px-3 focus-within:border-[#279054] focus-within:ring-2 focus-within:ring-[#e5f3e9]">
                                    <LockKeyhole size={14} className="shrink-0 text-[#44725a]" />
                                    <input
                                        required
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(event) => passwordForm.setData('password', event.target.value)}
                                        placeholder="Enter new password"
                                        className="min-w-0 flex-1 bg-transparent text-xs font-normal text-[#344238] outline-none placeholder:text-[#9aa69e]"
                                    />
                                </span>
                            </label>

                            <ul className="mt-2 space-y-1 pl-1">
                                {passwordRequirements.map((requirement) => (
                                    <li
                                        key={requirement.label}
                                        className={`flex items-center gap-1.5 text-[10px] ${requirement.satisfied ? 'text-[#32915a]' : 'text-[#87938b]'}`}
                                    >
                                        <span
                                            className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${requirement.satisfied ? 'bg-[#e5f4e9]' : 'bg-[#f0f3f1]'}`}
                                        >
                                            <Check size={9} strokeWidth={3} />
                                        </span>
                                        {requirement.label}
                                    </li>
                                ))}
                            </ul>
                            <InputError message={passwordForm.errors.password} className="mt-1.5" />

                            <label className="mt-5 block text-[11px] font-semibold text-[#37483d]">
                                Confirm new password <span className="text-[#db4b4b">*</span>
                                <span className="mt-1.5 flex h-10 items-center gap-2 rounded-lg border border-[#dce5df] bg-white px-3 focus-within:border-[#279054] focus-within:ring-2 focus-within:ring-[#e5f3e9]">
                                    <LockKeyhole size={14} className="shrink-0 text-[#44725a]" />
                                    <input
                                        required
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(event) => passwordForm.setData('password_confirmation', event.target.value)}
                                        placeholder="Confirm new password"
                                        className="min-w-0 flex-1 bg-transparent text-xs font-normal text-[#344238] outline-none placeholder:text-[#9aa69e]"
                                    />
                                </span>
                                {passwordForm.errors.password_confirmation && (
                                    <InputError message={passwordForm.errors.password_confirmation} className="mt-1" />
                                )}
                                {passwordForm.data.password_confirmation &&
                                    passwordForm.data.password !== passwordForm.data.password_confirmation && (
                                        <span className="mt-1 block text-xs font-normal text-[#b54747]">Passwords do not match.</span>
                                    )}
                            </label>

                            <div className="mt-5">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#188747] px-4 text-xs font-semibold text-white transition hover:bg-[#126d39] disabled:opacity-50"
                                >
                                    <LockKeyhole size={14} /> {passwordForm.processing ? 'Updating password...' : 'Update password'}
                                </button>
                                {passwordForm.recentlySuccessful && (
                                    <p role="status" className="mt-2 text-center text-xs font-medium text-[#288b50]">
                                        Password updated successfully.
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </PortalLayout>
        </>
    );
}
