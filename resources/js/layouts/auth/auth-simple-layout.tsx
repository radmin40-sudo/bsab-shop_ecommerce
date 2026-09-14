import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Leaf, ShieldCheck, Sprout, Truck } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const { siteSettings } = usePage<SharedData>().props;
    const brandName = siteSettings?.brand_name || 'BSABShop';
    const imageUrl = (path?: string | null) => (path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null);
    const logoUrl = imageUrl(siteSettings?.logo_path);
    const loginBackgroundUrl = imageUrl(siteSettings?.login_background_path);

    return (
        <div
            className="auth-page font-body min-h-svh bg-transparent bg-cover bg-center text-[#14321f]"
            style={{
                backgroundImage: `url('${loginBackgroundUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=85'}')`,
            }}
        >
            <main className="flex min-h-svh w-full">
                <section className="auth-panel relative hidden min-h-svh overflow-hidden bg-transparent lg:flex lg:flex-[0_0_65%]">
                    <div className="absolute -top-10 -left-16 text-[#2f8f45]/35">
                        <Leaf size={180} strokeWidth={1.1} />
                    </div>
                    <div className="absolute -right-20 -bottom-16 rotate-[-22deg] text-[#b5e68f]/70">
                        <Leaf size={260} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
                        <Link href={route('home')} className="inline-flex items-center gap-3 text-[#123f29]">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-[#198447] shadow-sm backdrop-blur-sm">
                                {logoUrl ? (
                                    <img src={logoUrl} alt={brandName} className="h-9 w-9 object-contain" />
                                ) : (
                                    <Sprout size={32} strokeWidth={1.8} />
                                )}
                            </span>
                            <span>
                                <span className="font-display block text-3xl font-bold tracking-[-0.04em]">{brandName}</span>
                                <span className="text-sm font-medium text-[#4f8464]">Fresh · Local · Better Living</span>
                            </span>
                        </Link>

                        <div className="max-w-md text-white drop-shadow-[0_2px_10px_rgba(0,40,20,.3)]">
                            <h1 className="font-display text-6xl leading-[0.9] font-bold tracking-tighter xl:text-7xl">
                                Welcome
                                <br />
                                <span className="text-[#8ee56b]">back</span>
                            </h1>
                            <p className="mt-6 max-w-sm text-lg leading-7 text-white/90">
                                Good food brings people together.
                                <br />
                                Let&apos;s get you back to fresh choices!
                            </p>
                            <div className="mt-12 flex items-center gap-5 text-sm font-semibold text-white">
                                <span className="flex items-center gap-2.5">
                                    <Leaf size={28} /> Fresh
                                    <br />
                                    Products
                                </span>
                                <span className="h-10 w-px bg-white/60" />
                                <span className="flex items-center gap-2.5">
                                    <Truck size={28} /> Fast
                                    <br />
                                    Delivery
                                </span>
                                <span className="h-10 w-px bg-white/60" />
                                <span className="flex items-center gap-2.5">
                                    <ShieldCheck size={28} /> Secure
                                    <br />
                                    Shopping
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-transparent px-5 py-8 sm:px-6 lg:flex-[0_0_35%] lg:px-6">
                    <div className="pointer-events-none absolute -top-24 -right-24 text-[#b7dfad]/45">
                        <Leaf size={260} strokeWidth={1} />
                    </div>
                    <div className="pointer-events-none absolute -right-20 -bottom-20 rotate-[-35deg] text-[#c8e9bb]/60">
                        <Leaf size={240} strokeWidth={1} />
                    </div>
                    <div className="relative w-full max-w-full rounded-[30px] border border-white/75 bg-white/25 px-4 py-7 shadow-[0_24px_80px_rgba(28,83,47,.2),inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-3xl sm:px-6 sm:py-9 lg:px-4 lg:py-8">
                        <div className="mb-6 text-center lg:hidden">
                            <Link
                                href={route('home')}
                                className="font-display inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-[#14532d]"
                            >
                                {logoUrl ? (
                                    <img src={logoUrl} alt={brandName} className="h-8 w-8 object-contain" />
                                ) : (
                                    <Sprout size={28} className="text-[#159447]" />
                                )}{' '}
                                {brandName}
                            </Link>
                        </div>
                        <div className="mb-7 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center text-[#159447]">
                                {logoUrl ? (
                                    <img src={logoUrl} alt={brandName} className="h-12 w-12 object-contain" />
                                ) : (
                                    <Sprout size={46} strokeWidth={1.6} />
                                )}
                            </div>
                            <h2 className="font-display text-[32px] leading-none font-bold tracking-[-0.04em] text-white">{title}</h2>
                            <p className="mt-3 text-[15px] text-white/85">{description}</p>
                        </div>
                        <div className="auth-content">{children}</div>
                    </div>
                </section>
            </main>
        </div>
    );
}
