import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, CheckCircle2, Eye, EyeOff, ImagePlus, KeyRound, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

import InputError from '@/components/input-error';
import { PortalLayout } from '@/components/portal-layout';
import { optimizeImage } from '@/lib/image-upload';
import { type SharedData } from '@/types';

type AdminProfileData = SharedData & { avatarUrl?: string | null };

export default function AdminProfile() {
    const { auth, avatarUrl } = usePage<AdminProfileData>().props;
    const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl ?? null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [passwordMismatch, setPasswordMismatch] = useState('');
    const profileForm = useForm({
        _method: 'patch',
        name: auth.user.name ?? '',
        email: auth.user.email ?? '',
        phone: (auth.user.phone as string | undefined) ?? '',
        avatar: null as File | null,
    });
    const passwordForm = useForm({ password: '', password_confirmation: '' });

    useEffect(
        () => () => {
            if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
        },
        [avatarPreview],
    );

    function submitProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        profileForm.post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                const savedPreview = profileForm.data.avatar ? URL.createObjectURL(profileForm.data.avatar) : (avatarUrl ?? null);
                profileForm.setData('avatar', null);
                setAvatarPreview(savedPreview);
            },
        });
    }

    function submitPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPasswordMismatch('');
        if (passwordForm.data.password !== passwordForm.data.password_confirmation) {
            setPasswordMismatch('The password confirmation does not match.');
            return;
        }
        passwordForm.put(route('user-password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setShowPassword(false);
                setShowConfirmation(false);
                setPasswordMismatch('');
            },
        });
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

    const inputClass =
        'h-10 w-full rounded-lg border border-[#dce5df] bg-white px-3 text-xs font-normal text-[#344238] outline-none transition placeholder:text-[#9aa69e] focus:border-[#279054] focus:ring-2 focus:ring-[#e5f3e9]';

    return (
        <>
            <Head title="Profile" />
            <PortalLayout role="admin" title="Profile" eyebrow="Account settings">
                <div>
                    <p className="font-mono text-[10px] font-bold tracking-[0.17em] text-[#328152] uppercase">Profile</p>
                    <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173b27] sm:text-3xl">Administrator account</h1>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#288b50]">
                        <CheckCircle2 size={13} /> Your personal details
                    </div>
                    <p className="mt-1 text-xs text-[#6a7c70]">Keep your identity and contact details current across the marketplace workspace.</p>
                </div>

                <div className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.85fr)]">
                    <form
                        onSubmit={submitProfile}
                        className="min-w-0 rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_14px_rgba(31,70,48,0.045)] sm:p-5"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f5ec] text-[#28734c]">
                                <UserRound size={17} />
                            </span>
                            <div>
                                <h2 className="text-sm font-bold text-[#25372c]">Personal information</h2>
                                <p className="mt-0.5 text-[10px] text-[#7c8a81]">The details used to identify and contact you.</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <label className="block text-[10px] font-semibold text-[#37483d]">
                                Full name
                                <span className="relative mt-1.5 block">
                                    <UserRound size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#44725a]" />
                                    <input
                                        required
                                        autoComplete="name"
                                        value={profileForm.data.name}
                                        onChange={(event) => profileForm.setData('name', event.target.value)}
                                        className={`${inputClass} pl-9`}
                                    />
                                </span>
                                <InputError message={profileForm.errors.name} className="mt-1" />
                            </label>
                            <label className="block text-[10px] font-semibold text-[#37483d]">
                                Email address
                                <span className="relative mt-1.5 block">
                                    <Mail size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#44725a]" />
                                    <input
                                        required
                                        type="email"
                                        autoComplete="email"
                                        value={profileForm.data.email}
                                        onChange={(event) => profileForm.setData('email', event.target.value)}
                                        className={`${inputClass} pl-9`}
                                    />
                                </span>
                                <InputError message={profileForm.errors.email} className="mt-1" />
                            </label>
                            <label className="block text-[10px] font-semibold text-[#37483d]">
                                Phone number
                                <span className="relative mt-1.5 block">
                                    <Phone size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#44725a]" />
                                    <input
                                        type="tel"
                                        autoComplete="tel"
                                        value={profileForm.data.phone}
                                        onChange={(event) => profileForm.setData('phone', event.target.value)}
                                        placeholder="Add a phone number"
                                        className={`${inputClass} pl-9`}
                                    />
                                </span>
                                <InputError message={profileForm.errors.phone} className="mt-1" />
                            </label>
                        </div>

                        <div className="mt-5 border-t border-[#edf2ed] pt-4">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f5ec] text-[#28734c]">
                                    <ImagePlus size={15} />
                                </span>
                                <div>
                                    <h3 className="text-xs font-bold text-[#2a3b30]">Profile image</h3>
                                    <p className="mt-0.5 text-[9px] text-[#7c8a81]">Use a recognizable image for your workspace.</p>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row">
                                <span className="flex h-19 w-19 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf4ef] text-[#496c57]">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile image preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <UserRound size={28} />
                                    )}
                                </span>
                                <label
                                    htmlFor="admin-avatar-upload"
                                    className="flex min-h-18 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#b9d9c3] bg-[#f8fcf9] px-3 py-3 text-center transition hover:border-[#279054] hover:bg-[#f2faf4]"
                                >
                                    <ImagePlus size={18} className="text-[#24834d]" />
                                    <span className="mt-1 text-[10px] font-semibold text-[#267647]">Choose profile image</span>
                                    <span className="mt-0.5 text-[9px] text-[#839087]">JPG, PNG, or WebP up to 2 MB.</span>
                                    <input
                                        id="admin-avatar-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="sr-only"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>
                            <InputError message={profileForm.errors.avatar} className="mt-1" />
                        </div>

                        <div
                            role="note"
                            className="mt-4 flex items-center gap-2 rounded-lg bg-[#eff9f2] px-3 py-2.5 text-[10px] font-medium text-[#288b50]"
                        >
                            <ShieldCheck size={16} className="shrink-0" /> Administrator access is enabled for this account.
                        </div>
                        <div className="mt-4">
                            <button
                                type="submit"
                                disabled={profileForm.processing}
                                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#188747] px-4 text-xs font-semibold text-white transition hover:bg-[#126d39] focus-visible:ring-2 focus-visible:ring-[#75bd8d] focus-visible:ring-offset-2 disabled:opacity-50"
                            >
                                <Check size={14} /> {profileForm.processing ? 'Saving...' : 'Save personal information'}
                            </button>
                            {profileForm.recentlySuccessful && (
                                <p role="status" className="mt-2 text-center text-xs font-medium text-[#288b50]">
                                    Personal information updated successfully.
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
                                <LockKeyhole size={17} />
                            </span>
                            <div>
                                <h2 className="text-sm font-bold text-[#25372c]">Change password</h2>
                                <p className="mt-0.5 text-[10px] text-[#7c8a81]">Update the password used to access the admin workspace.</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <label className="block text-[10px] font-semibold text-[#37483d]">
                                New password
                                <span className="relative mt-1.5 block">
                                    <KeyRound size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#44725a]" />
                                    <input
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={passwordForm.data.password}
                                        onChange={(event) => {
                                            passwordForm.setData('password', event.target.value);
                                            setPasswordMismatch('');
                                        }}
                                        placeholder="Enter new password"
                                        className={`${inputClass} pr-10 pl-9`}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? 'Hide new password' : 'Show new password'}
                                        aria-pressed={showPassword}
                                        onClick={() => setShowPassword((value) => !value)}
                                        className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-[#718075] hover:bg-[#f1f6f2] focus-visible:ring-2 focus-visible:ring-[#75bd8d]"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </span>
                                <InputError message={passwordForm.errors.password} className="mt-1" />
                            </label>
                            <label className="block text-[10px] font-semibold text-[#37483d]">
                                Confirm new password
                                <span className="relative mt-1.5 block">
                                    <KeyRound size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#44725a]" />
                                    <input
                                        required
                                        type={showConfirmation ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(event) => {
                                            passwordForm.setData('password_confirmation', event.target.value);
                                            setPasswordMismatch('');
                                        }}
                                        placeholder="Confirm new password"
                                        className={`${inputClass} pr-10 pl-9`}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showConfirmation ? 'Hide password confirmation' : 'Show password confirmation'}
                                        aria-pressed={showConfirmation}
                                        onClick={() => setShowConfirmation((value) => !value)}
                                        className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-[#718075] hover:bg-[#f1f6f2] focus-visible:ring-2 focus-visible:ring-[#75bd8d]"
                                    >
                                        {showConfirmation ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </span>
                                <InputError message={passwordForm.errors.password_confirmation} className="mt-1" />
                            </label>
                            {passwordMismatch && (
                                <p role="alert" className="text-[10px] font-medium text-[#b54135]">
                                    {passwordMismatch}
                                </p>
                            )}
                        </div>
                        <div className="mt-4">
                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#188747] px-4 text-xs font-semibold text-white transition hover:bg-[#126d39] focus-visible:ring-2 focus-visible:ring-[#75bd8d] focus-visible:ring-offset-2 disabled:opacity-50"
                            >
                                <LockKeyhole size={14} /> {passwordForm.processing ? 'Updating...' : 'Update password'}
                            </button>
                            {passwordForm.recentlySuccessful && (
                                <p role="status" className="mt-2 text-center text-xs font-medium text-[#288b50]">
                                    Password updated successfully.
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </PortalLayout>
        </>
    );
}
