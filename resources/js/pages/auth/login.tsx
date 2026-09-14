import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Log in" description="Enter your details to continue">
            <Head title="Log in" />

            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-4">
                    <label htmlFor="email" className="sr-only">
                        Email address
                    </label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#3d7055]" />
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Email address"
                            disabled={processing}
                            className="h-auto rounded-xl border-white/80 bg-white/30 py-3.25 pr-4 pl-12 text-sm text-[#14321f] shadow-[inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-xl placeholder:text-[#5f856d] focus-visible:border-[#34a35f] focus-visible:bg-white/55 focus-visible:ring-[#34a35f]/20"
                        />
                    </div>
                    <InputError message={errors.email} />

                    <label htmlFor="password" className="sr-only">
                        Password
                    </label>
                    <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#3d7055]" />
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            disabled={processing}
                            className="h-auto rounded-xl border-white/80 bg-white/30 py-3.25 pr-4 pl-12 text-sm text-[#14321f] shadow-[inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-xl placeholder:text-[#5f856d] focus-visible:border-[#34a35f] focus-visible:bg-white/55 focus-visible:ring-[#34a35f]/20"
                        />
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center justify-between gap-3 text-[13px] text-white">
                    <label htmlFor="remember" className="flex cursor-pointer items-center gap-2">
                        <Checkbox
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            className="size-3.75 rounded-lg border-[#b8dcc5] data-[state=checked]:border-[#2f9c5c] data-[state=checked]:bg-[#2f9c5c]"
                        />
                        <span>Remember me</span>
                    </label>
                    {canResetPassword && (
                        <TextLink href={route('password.request')} className="text-white hover:text-white/80" tabIndex={5}>
                            Forgot password?
                        </TextLink>
                    )}
                </div>

                <Button
                    type="submit"
                    className="h-auto w-full rounded-[10px] bg-[#2f9c5c] py-3.25 text-[15px] font-semibold text-white shadow-none hover:bg-[#257f4a]"
                    tabIndex={4}
                    disabled={processing}
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Log in{' '}
                    <span aria-hidden="true" className="text-lg leading-none transition-transform group-hover:translate-x-1">
                        →
                    </span>
                </Button>
            </form>

            {status && <p className="mt-4 text-center text-sm font-medium text-white">{status}</p>}
            <div className="my-6 flex items-center gap-3 text-xs text-white/80">
                <span className="h-px flex-1 bg-white/50" />
                <span>or</span>
                <span className="h-px flex-1 bg-white/50" />
            </div>
            <a
                href={route('google.redirect')}
                className="flex h-auto w-full items-center justify-center gap-3 rounded-xl border border-white/85 bg-white/30 py-3.25 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.8)] backdrop-blur-xl transition-colors hover:bg-white/55"
            >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
                    <path
                        fill="#4285F4"
                        d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.7 2.92-4.2 2.92-7.19Z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.75 9.75 0 0 0 12 21.5Z"
                    />
                    <path fill="#FBBC05" d="M6.54 13.61a5.86 5.86 0 0 1 0-3.73v-2.5H3.3a9.75 9.75 0 0 0 0 8.73l3.24-2.5Z" />
                    <path
                        fill="#EA4335"
                        d="M12 5.85c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 2.94 14.63 2 12 2a9.75 9.75 0 0 0-8.7 5.38l3.24 2.5C7.31 7.57 9.46 5.85 12 5.85Z"
                    />
                </svg>
                Continue with Google
            </a>
            <p className="mt-7 text-center text-sm text-white">
                Don&apos;t have an account?{' '}
                <TextLink href={route('register')} tabIndex={6} className="font-medium text-white underline hover:text-white/80">
                    Sign up
                </TextLink>
            </p>
        </AuthLayout>
    );
}
