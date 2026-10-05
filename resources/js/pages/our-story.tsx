import { informationalPageImage } from '@/lib/informational-page-image';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Award,
    CheckCircle2,
    Eye,
    Handshake,
    Heart,
    Leaf,
    Monitor,
    Package,
    ShoppingBag,
    Sprout,
    Store,
    Target,
    UsersRound,
} from 'lucide-react';

type FooterPageContent = {
    title: string;
    slug: string;
    content: string;
    hero_image_path?: string | null;
    footer_image_path?: string | null;
    content_sections?: { title: string; content: string }[];
};

const values = [
    { icon: UsersRound, title: 'Community', detail: 'We support and uplift our local farmers, sellers, and customers.' },
    { icon: Handshake, title: 'Integrity', detail: 'We build trust through honest and transparent business practices.' },
    { icon: Leaf, title: 'Sustainability', detail: 'We promote responsible and sustainable agriculture.' },
    { icon: Heart, title: 'Collaboration', detail: 'We grow stronger together with our local partners and sellers.' },
    { icon: Award, title: 'Excellence', detail: 'We strive to provide the best service and shopping experience for our community.' },
];

const categories = [
    { icon: Sprout, title: 'Agricultural Products' },
    { icon: Package, title: 'Tools & Equipment' },
    { icon: ShoppingBag, title: 'Supplies' },
    { icon: Store, title: 'Local Sellers' },
];

const journey = [
    { icon: Sprout, title: 'The Beginning', detail: 'A simple idea to support local farmers and sellers.' },
    { icon: Monitor, title: 'Building the Platform', detail: 'Creating a reliable and user-friendly marketplace.' },
    { icon: UsersRound, title: 'Growing Together', detail: 'More sellers, more products, more customers.' },
    { icon: Leaf, title: 'A Stronger Community', detail: 'Supporting local businesses and sustainable agriculture.' },
];

function NumberedTitle({ number, title, description }: { number: number; title: string; description?: string }) {
    return (
        <div className="mb-3 flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#075e39] text-sm font-bold text-white shadow-sm">
                {number}
            </span>
            <div className="min-w-0 pt-0.5">
                <h2 className="text-base leading-5 font-bold text-[#064e3b] sm:text-lg">{title}</h2>
                {description && <p className="mt-1 text-xs leading-5 text-[#456b59]">{description}</p>}
            </div>
        </div>
    );
}

function Scenery({ vision = false }: { vision?: boolean }) {
    return (
        <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 900 260" preserveAspectRatio="xMidYMid slice" fill="none">
            <defs>
                <linearGradient id={vision ? 'storyVisionSky' : 'storyHeroSky'} x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#dff4ed" />
                    <stop offset="1" stopColor="#a7d9b7" />
                </linearGradient>
                <linearGradient id={vision ? 'storyVisionField' : 'storyHeroField'} x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#a8d17d" />
                    <stop offset="1" stopColor="#36894c" />
                </linearGradient>
            </defs>
            <path fill={vision ? 'url(#storyVisionSky)' : 'url(#storyHeroSky)'} d="M0 0h900v260H0z" />
            <circle cx="730" cy="40" r="23" fill="#fff1ba" opacity=".86" />
            <path d="m260 143 127-92 86 59 88-86 104 94 235-50v192H260z" fill="#b1d5a6" />
            <path d="m387 51 50 61 36-25 43 37 45-100 91 91-87-45-47 57-47-30-38 28-45-42-61 41z" fill="#e1f0d4" />
            <path d="m0 177 154-93 129 67 124-70 143 90 152-70 198 47v112H0z" fill="#79b87a" />
            <path d="M0 208c160-50 316-38 450 0 151 42 287 20 450-22v74H0z" fill={vision ? 'url(#storyVisionField)' : 'url(#storyHeroField)'} />
            <path
                d="M325 260c120-40 235-51 353-38 82 9 149-3 222-29M399 260c105-28 193-35 293-23 70 8 127-3 208-23M482 260c95-19 166-23 250-12 62 8 115-2 168-16"
                stroke="#d8edbd"
                strokeWidth="4"
                opacity=".8"
            />
            <path
                d="M94 221c-4-34 7-61 31-81m-26 62c-24-19-35-40-34-63m39 36c19-26 41-42 69-47"
                stroke="#397b46"
                strokeWidth="5"
                strokeLinecap="round"
            />
            <path
                d="M98 185c-19 4-32-4-40-20 20-4 33 2 40 20m10-4c5-20 18-31 38-34-2 21-14 31-38 34m-7-15c-19-9-27-23-24-44 19 7 28 20 24 44"
                fill="#4a9b58"
            />
            {!vision && (
                <g transform="translate(380 122)">
                    <path d="M0 34h118v54H0z" fill="#bf7837" />
                    <path d="M0 49h118M0 69h118" stroke="#e0a354" strokeWidth="5" />
                    <path d="M-7 34 10 12h98l17 22H-7Z" fill="#e5b565" />
                    <path
                        d="M65 11V-5m0 14C46 8 42-3 47-17c14 5 19 15 18 26m1-2c2-19 12-29 29-32 0 18-9 29-29 32"
                        stroke="#216f3d"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                    <path d="M65 3c-14 0-22-8-25-21 14-1 23 6 25 21m4-2c12-7 17-17 14-30-13 6-17 16-14 30" fill="#39904d" />
                </g>
            )}
        </svg>
    );
}

function PhoneIllustration() {
    return (
        <svg aria-label="Illustration of BSAB-Shop on a phone surrounded by farm leaves" role="img" viewBox="0 0 300 220" className="h-full w-full">
            <defs>
                <linearGradient id="phoneBackdrop" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#f3fbf6" />
                    <stop offset="1" stopColor="#d9efdf" />
                </linearGradient>
            </defs>
            <rect width="300" height="220" rx="18" fill="url(#phoneBackdrop)" />
            <path
                d="M25 184c-2-43 9-77 34-102m-29 81c-17-19-23-41-19-63m25 39c19-19 38-28 62-28"
                stroke="#357e49"
                strokeWidth="6"
                strokeLinecap="round"
            />
            <path
                d="M31 139c-18 2-29-6-34-22 19-3 30 4 34 22m8-15c2-19 13-30 32-32-1 20-11 30-32 32m-6-17c-15-9-20-23-16-41 17 8 23 21 16 41"
                fill="#59a667"
            />
            <path
                d="M263 184c0-40-10-71-34-95m29 75c18-17 26-37 23-59m-24 34c-19-18-39-27-62-25"
                stroke="#357e49"
                strokeWidth="6"
                strokeLinecap="round"
            />
            <path
                d="M257 140c18 1 29-7 34-23-19-2-30 5-34 23m-8-16c-2-18-13-29-32-30 1 19 11 29 32 30m7-17c15-9 21-22 17-40-17 7-23 20-17 40"
                fill="#59a667"
            />
            <rect x="101" y="21" width="99" height="179" rx="18" fill="#104d35" />
            <rect x="108" y="32" width="85" height="157" rx="11" fill="#fff" />
            <rect x="137" y="25" width="26" height="3" rx="2" fill="#d8eee0" />
            <rect x="116" y="42" width="69" height="19" rx="5" fill="#eaf7ee" />
            <path d="M122 55c0-5 4-9 9-9h14v13h-14a9 9 0 0 1-9-4Z" fill="#1a6b41" />
            <path d="M128 53h9m-9 4h20" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <rect x="117" y="68" width="66" height="48" rx="7" fill="#d8efd9" />
            <path d="m117 101 20-21 14 14 11-10 21 19v13h-66z" fill="#89bf75" />
            <circle cx="166" cy="81" r="6" fill="#ffe599" />
            <rect x="117" y="122" width="30" height="42" rx="5" fill="#eff8f1" />
            <rect x="153" y="122" width="30" height="42" rx="5" fill="#eff8f1" />
            <circle cx="132" cy="137" r="9" fill="#8fc978" />
            <path d="M128 143c3-7 7-7 9 0" stroke="#207547" strokeWidth="2" />
            <circle cx="168" cy="137" r="9" fill="#f0ba5b" />
            <path d="M163 142c5-9 10-9 11 0" stroke="#28814b" strokeWidth="2" />
            <rect x="121" y="151" width="21" height="3" rx="2" fill="#84ae91" />
            <rect x="157" y="151" width="21" height="3" rx="2" fill="#84ae91" />
            <circle cx="178" cy="105" r="13" fill="#12613d" />
            <path d="M172 103h12l-1.4 7h-9.2l-1.4-7Zm2-3 2 3m5-3-2 3" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 197h220" stroke="#b9dcc3" strokeWidth="2" />
        </svg>
    );
}

function ValueCards() {
    return (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {values.map(({ icon: Icon, title, detail }) => (
                <div
                    key={title}
                    className="flex min-h-33 flex-col items-center rounded-xl border border-[#e2f1e8] bg-[#eff9f3] px-3 py-3 text-center"
                >
                    <span className="mb-2 flex size-9 items-center justify-center rounded-full bg-[#075e39] text-white">
                        <Icon size={20} fill={title === 'Sustainability' ? 'currentColor' : 'none'} />
                    </span>
                    <h3 className="text-xs font-bold text-[#174b34]">{title}</h3>
                    <p className="mt-1.5 text-[11px] leading-4 text-[#456b59]">{detail}</p>
                </div>
            ))}
        </div>
    );
}

export default function OurStory({ footerPage }: { footerPage: FooterPageContent }) {
    const section = (index: number, title: string, content?: string) => ({
        title: footerPage.content_sections?.[index]?.title ?? title,
        content: footerPage.content_sections?.[index]?.content ?? content,
    });

    return (
        <>
            <Head title={footerPage?.title ?? 'Our Story'} />
            <main className="min-h-screen bg-white px-3 py-3 text-[#173c2b] sm:px-5 sm:py-4">
                <div className="mx-auto max-w-375">
                    <Link
                        href="/"
                        className="mb-3 inline-flex items-center gap-2 px-1 text-xs font-semibold text-[#17633d] transition hover:text-[#0d4329]"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Back
                    </Link>

                    <section className="relative isolate mb-3 min-h-41 overflow-hidden rounded-xl border border-[#dcefe4] bg-[#edf8f2] px-5 py-5 sm:px-7 sm:py-6">
                        <Scenery />
                        {footerPage.hero_image_path && (
                            <img
                                src={informationalPageImage(footerPage.hero_image_path) ?? ''}
                                alt=""
                                className="absolute inset-y-0 right-0 h-full w-1/2 object-cover object-center"
                            />
                        )}
                        <div className="absolute inset-0 bg-linear-to-r from-[#edf8f2] via-[#edf8f2]/95 to-transparent" />
                        <div className="relative z-10 flex max-w-150 items-start gap-4 sm:gap-5">
                            <span className="mt-1 flex size-16 shrink-0 items-center justify-center rounded-xl bg-[#075e39] text-white shadow-sm sm:size-19">
                                <Sprout size={43} strokeWidth={2.5} />
                            </span>
                            <div>
                                <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-[#064e3b] sm:text-4xl lg:text-[42px]">
                                    {footerPage.title ?? 'Our Story'}
                                </h1>
                                <p className="mt-2 max-w-102.5 text-xs leading-5 text-[#456b59] sm:text-sm sm:leading-6">{footerPage.content}</p>
                            </div>
                        </div>
                        <p className="font-display absolute right-4 bottom-3 z-10 hidden max-w-47.5 -rotate-3 text-right text-sm leading-5 font-bold text-[#145c38] italic sm:block md:right-6 md:text-base">
                            Local Products
                            <br />
                            Local Sellers
                            <br />
                            Stronger Community
                            <Sprout className="ml-1 inline-block text-[#3d8b4a]" size={20} />
                        </p>
                    </section>

                    <div className="grid gap-2.5 md:grid-cols-2">
                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <NumberedTitle number={1} title={section(0, 'How It Started').title} />
                            <div className="grid gap-3 sm:grid-cols-[1fr_1.1fr]">
                                <p className="text-xs leading-5 text-[#456b59]">{section(0, 'How It Started').content}</p>
                                <img
                                    src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=85"
                                    alt="Farm workers carrying boxes of freshly harvested produce"
                                    className="h-36 w-full rounded-lg object-cover sm:h-full sm:min-h-45"
                                    loading="lazy"
                                />
                            </div>
                            <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#eaf7ef] px-3 py-2.5 text-sm font-semibold text-[#145c38]">
                                <Leaf size={24} fill="currentColor" />
                                <span className="font-display text-xs italic">“From our local farms to your home.”</span>
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <NumberedTitle number={2} title={section(1, 'What We Do').title} description={section(1, 'What We Do').content} />
                            <div className="h-38.75 overflow-hidden rounded-xl sm:h-42.5">
                                <PhoneIllustration />
                            </div>
                            <div className="mt-2 grid grid-cols-2 divide-x divide-[#cce5d4] rounded-xl bg-[#eff9f3] p-2 sm:grid-cols-4">
                                {categories.map(({ icon: Icon, title }) => (
                                    <div
                                        key={title}
                                        className="flex min-h-15.5 flex-col items-center justify-center gap-1 px-2 py-1 text-center text-[#145c38]"
                                    >
                                        <Icon size={20} strokeWidth={2.5} />
                                        <span className="text-[10px] leading-4 font-medium">{title}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <NumberedTitle number={3} title={section(2, 'Our Mission').title} />
                            <div className="grid min-h-42.5 items-center gap-3 sm:grid-cols-[minmax(130px,0.65fr)_1.2fr]">
                                <div className="flex items-center gap-3 sm:flex-col sm:justify-center">
                                    <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#edf8f1] text-[#075e39] sm:size-20">
                                        <Target size={47} strokeWidth={2} />
                                    </span>
                                    <p className="text-xs leading-5 text-[#315e45] sm:text-center">
                                        Empowering local agriculture through trusted connection.
                                    </p>
                                </div>
                                <div className="relative min-h-36.25 overflow-hidden rounded-xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=850&q=85"
                                        alt="Hands nurturing a young seedling in rich soil"
                                        className="absolute inset-0 size-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-r from-[#eef8e7]/70 via-transparent to-transparent" />
                                </div>
                                <p className="text-sm leading-6 text-[#315e45] sm:col-span-2">{section(2, 'Our Mission').content}</p>
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <NumberedTitle number={4} title={section(3, 'Our Vision').title} />
                            <div className="grid min-h-42.5 items-center gap-3 sm:grid-cols-[minmax(130px,0.65fr)_1.2fr]">
                                <div className="flex items-center gap-3 sm:flex-col sm:justify-center">
                                    <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#edf8f1] text-[#075e39] sm:size-20">
                                        <Eye size={47} strokeWidth={2} />
                                    </span>
                                    <p className="text-xs leading-5 text-[#315e45] sm:text-center">A thriving and self-reliant local community.</p>
                                </div>
                                <div className="relative min-h-36.25 overflow-hidden rounded-xl">
                                    <Scenery vision />
                                    <p className="font-display absolute top-3 right-3 -rotate-3 text-right text-sm leading-5 font-bold text-[#145c38] italic sm:text-base">
                                        Supporting
                                        <br />
                                        Local Growth <Sprout className="inline-block" size={19} />
                                    </p>
                                </div>
                                <p className="text-sm leading-6 text-[#315e45] sm:col-span-2">{section(3, 'Our Vision').content}</p>
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4 md:col-span-2">
                            <NumberedTitle number={5} title={section(4, 'Our Values').title} description={section(4, 'Our Values').content} />
                            <ValueCards />
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4 md:col-span-2">
                            <NumberedTitle number={6} title={section(5, 'Our Journey').title} description={section(5, 'Our Journey').content} />
                            <div className="grid items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
                                {journey.map(({ icon: Icon, title, detail }, index) => (
                                    <div key={title} className="contents">
                                        <div className="flex min-h-29.5 flex-col items-center justify-center rounded-xl border border-[#e2f1e8] bg-[#eff9f3] px-3 py-3 text-center">
                                            <span className="mb-2 flex size-9 items-center justify-center rounded-full bg-[#075e39] text-white">
                                                <Icon size={20} />
                                            </span>
                                            <h3 className="text-xs font-bold text-[#174b34]">{title}</h3>
                                            <p className="mt-1 text-[11px] leading-4 text-[#456b59]">{detail}</p>
                                        </div>
                                        {index < journey.length - 1 && (
                                            <ArrowRight className="hidden self-center text-[#17633d] lg:block" size={18} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <footer className="relative isolate mt-3 grid min-h-37.5 overflow-hidden rounded-xl border border-[#dcefe4] bg-[#edf8f2] md:grid-cols-[1fr_1.1fr_1fr] md:items-center">
                        <div className="relative min-h-33.75 overflow-hidden md:absolute md:inset-0">
                            <img
                                src={
                                    informationalPageImage(footerPage.footer_image_path) ??
                                    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=90'
                                }
                                alt="Hands holding rich soil and a growing seedling"
                                className="absolute inset-0 size-full object-cover object-center"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#edf8f2]/55 to-[#edf8f2]" />
                        </div>
                        <div className="relative z-10 px-5 py-3 text-center md:col-start-2">
                            <p className="font-display text-2xl leading-7 font-bold text-[#17633d] italic sm:text-3xl">Together, we grow</p>
                            <p className="mt-2 text-xs text-[#456b59] sm:text-sm">Local farmers. Local sellers. Local community.</p>
                        </div>
                        <div className="relative z-10 flex items-center justify-center gap-3 border-t border-[#d4eadc] bg-[#edf8f2]/80 px-5 py-4 md:col-start-3 md:border-0 md:bg-transparent">
                            <span className="flex size-11 items-center justify-center rounded-xl bg-[#075e39] text-white">
                                <Sprout size={28} />
                            </span>
                            <div>
                                <h2 className="font-display text-xl leading-6 font-bold text-[#064e3b] sm:text-2xl">BSAB-Shop</h2>
                                <p className="mt-1 text-[9px] text-[#456b59] sm:text-[10px]">Local Products • Local Sellers • A Stronger Hinoba-an</p>
                            </div>
                        </div>
                        <CheckCircle2 className="absolute right-3 bottom-2 z-10 hidden size-20 text-[#7ab977]/60 md:block" />
                    </footer>
                </div>
            </main>
        </>
    );
}
