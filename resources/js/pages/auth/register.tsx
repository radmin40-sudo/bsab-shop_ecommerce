import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                            className="rounded-xl border-white/80 bg-white/30 text-[#14321f] shadow-[inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-xl placeholder:text-[#5f856d] focus-visible:border-[#34a35f] focus-visible:bg-white/55 focus-visible:ring-[#34a35f]/20"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                            className="rounded-xl border-white/80 bg-white/30 text-[#14321f] shadow-[inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-xl placeholder:text-[#5f856d] focus-visible:border-[#34a35f] focus-visible:bg-white/55 focus-visible:ring-[#34a35f]/20"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                            className="rounded-xl border-white/80 bg-white/30 text-[#14321f] shadow-[inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-xl placeholder:text-[#5f856d] focus-visible:border-[#34a35f] focus-visible:bg-white/55 focus-visible:ring-[#34a35f]/20"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                            className="rounded-xl border-white/80 bg-white/30 text-[#14321f] shadow-[inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-xl placeholder:text-[#5f856d] focus-visible:border-[#34a35f] focus-visible:bg-white/55 focus-visible:ring-[#34a35f]/20"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-white">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={6} className="font-medium text-white hover:text-white/80">
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
