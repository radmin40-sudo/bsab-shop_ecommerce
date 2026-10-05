import { informationalPageImage } from '@/lib/informational-page-image';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Check, Earth, Handshake, Leaf, Recycle, Sprout, Sun, TreePine, UsersRound, Waves, type LucideIcon } from 'lucide-react';

type FooterPageContent = {
    title: string;
    slug: string;
    content: string;
    hero_image_path?: string | null;
    footer_image_path?: string | null;
    content_sections?: { title: string; content: string }[];
};

const initiatives = [
    { icon: Leaf, title: 'Support Local Farmers', detail: 'Strengthening local agriculture and livelihoods.' },
    { icon: Recycle, title: 'Reduce Environmental Impact', detail: 'Promoting eco-friendly and responsible business practices.' },
    { icon: UsersRound, title: 'Build Strong Communities', detail: 'Creating opportunities and a better future for everyone.' },
    { icon: Earth, title: 'Ensure Long-Term Growth', detail: 'For people, communities, and the planet.' },
];

const greenPractices = [
    { icon: Recycle, title: 'Reduce Waste' },
    { icon: Leaf, title: 'Use Sustainable Packaging' },
    { icon: Sprout, title: 'Support Eco-Friendly Products' },
    { icon: Waves, title: 'Conserve Natural Resources' },
];

const impactItems = [
    { icon: Leaf, title: 'More Local Farmers Supported' },
    { icon: UsersRound, title: 'Stronger Communities' },
    { icon: Earth, title: 'Healthier Environment' },
    { icon: Sprout, title: 'A Sustainable Future' },
];

const greenInitiatives = [
    { icon: TreePine, title: 'Tree Planting Programs' },
    { icon: Recycle, title: 'Waste Reduction & Recycling' },
    { icon: Sun, title: 'Energy-Efficient Operations' },
    { icon: Handshake, title: 'Community Partnerships' },
];

const farmerBenefits = [
    'Fair opportunities for local farmers',
    'Access to more customers',
    'Support for rural economies',
    'Promotion of local, fresh, and quality products',
];

const productBenefits = [
    'Organic and natural products',
    'Efficient and durable tools',
    'Quality agricultural supplies',
    'Products that support sustainable farming',
];

const everydayActions = [
    'Buy local and support local farmers',
    'Choose eco-friendly products',
    'Reduce, reuse, and recycle',
    'Spread awareness about sustainable living',
];

function SectionTitle({ number, title, description }: { number: number; title: string; description: string }) {
    return (
        <div className="mb-4 flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#075e39] text-sm font-bold text-white shadow-sm">
                {number}
            </span>
            <div className="min-w-0 pt-0.5">
                <h2 className="text-base leading-5 font-bold text-[#064e3b] sm:text-lg">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-[#456b59]">{description}</p>
            </div>
        </div>
    );
}

function IconCards({ items }: { items: { icon: LucideIcon; title: string; detail?: string }[] }) {
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {items.map(({ icon: Icon, title, detail }) => (
                <div
                    key={title}
                    className="flex min-h-[118px] flex-col items-center rounded-xl border border-[#e2f1e8] bg-[#eff9f3] px-2 py-3 text-center sm:min-h-[142px] sm:px-3"
                >
                    <span className="mb-2 flex size-9 items-center justify-center rounded-full bg-white text-[#09633b] shadow-sm">
                        <Icon size={21} strokeWidth={2.4} />
                    </span>
                    <h3 className="text-xs leading-4 font-bold text-[#174b34]">{title}</h3>
                    {detail && <p className="mt-1.5 text-[10px] leading-4 text-[#557463]">{detail}</p>}
                </div>
            ))}
        </div>
    );
}

function Checklist({ items }: { items: string[] }) {
    return (
        <ul className="space-y-3">
            {items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs leading-5 text-[#406653]">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#08713e] text-white">
                        <Check size={11} strokeWidth={3.5} />
                    </span>
                    {item}
                </li>
            ))}
        </ul>
    );
}

function FarmScenery({ globe = false }: { globe?: boolean }) {
    return (
        <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 900 260" preserveAspectRatio="xMidYMid slice" fill="none">
            <defs>
                <linearGradient id="sustainHeroSky" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#d9f0e6" />
                    <stop offset="1" stopColor="#9dd5b2" />
                </linearGradient>
                <linearGradient id="sustainHeroGround" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#a3d07c" />
                    <stop offset="1" stopColor="#26834a" />
                </linearGradient>
                <linearGradient id="sustainHeroGlobe" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#fff" />
                    <stop offset="1" stopColor="#a5dfbb" />
                </linearGradient>
            </defs>
            <path fill="url(#sustainHeroSky)" d="M0 0h900v260H0z" />
            <circle cx="753" cy="48" r="26" fill="#fff4c4" opacity=".8" />
            <path d="m290 150 123-97 85 61 93-92 107 96 202-46v188H290z" fill="#abd1a5" />
            <path d="m413 53 54 61 31-26 47 46 46-112 93 96-91-47-43 58-51-32-37 28-49-44-59 42z" fill="#e1efd2" />
            <path d="m0 177 155-94 126 67 125-71 143 90 153-73 198 47v117H0z" fill="#77b578" />
            <path d="M0 202c155-49 313-34 448 2 150 40 288 20 452-20v76H0z" fill="url(#sustainHeroGround)" />
            <path
                d="M263 260c121-44 244-55 365-41 92 10 178-3 272-35M334 260c124-34 235-39 343-28 78 8 148-5 223-26M420 260c107-23 196-25 287-15 68 8 129-4 193-17"
                stroke="#d8edbb"
                strokeWidth="4"
                opacity=".86"
            />
            <path
                d="M99 220c-4-32 5-58 29-78m-25 59c-24-18-34-39-34-61m39 34c19-26 40-41 68-46"
                stroke="#397b46"
                strokeWidth="5"
                strokeLinecap="round"
            />
            <path
                d="M103 186c-19 4-32-3-41-19 21-5 34 2 41 19m9-4c5-20 18-30 38-33-2 21-14 31-38 33m-7-14c-19-9-27-23-25-44 20 7 29 20 25 44"
                fill="#4a9b58"
            />
            <path
                d="M810 209c-5-30 5-55 27-76m-23 58c-24-18-35-38-34-59m38 34c19-24 39-38 65-42"
                stroke="#347b46"
                strokeWidth="5"
                strokeLinecap="round"
            />
            <path
                d="M814 178c-20 4-33-4-41-19 21-5 34 1 41 19m10-4c5-20 18-29 37-32-2 20-14 30-37 32m-8-14c-19-9-27-23-24-43 19 7 28 20 24 43"
                fill="#50a660"
            />
            {globe && (
                <g>
                    <circle cx="592" cy="117" r="72" fill="url(#sustainHeroGlobe)" stroke="#fff" strokeWidth="5" />
                    <path
                        d="M563 62c-15 17-23 35-20 53l20 10 13 22 19-6 6-24 25-13-11-23-25-1-27-18Zm77 51 19 13-7 25-17 4-12-21 3-17 14-4Z"
                        fill="#14804a"
                    />
                    <path
                        d="M578 48c25-6 53 2 70 20-13 1-23 10-31 22-9-10-21-18-40-16l-13-12 14-14Zm-49 27c-13 20-16 46-6 69l13 3 11-15-8-21 8-14-18-22Z"
                        fill="#087044"
                    />
                    <path
                        d="M539 169c-35-7-48-27-55-49m61 40c-29 0-46-12-61-31m116-58c23-27 49-31 73-24m-72 36c18-25 39-32 61-31"
                        stroke="#287743"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M486 120c-20-4-31-15-34-33 21 4 32 14 34 33m3 16c19-5 30-16 32-35-20 4-30 15-32 35m138-52c4-20 16-30 35-32-4 20-15 31-35 32m3 16c18-4 29-15 33-34-20 3-31 14-33 34"
                        fill="#4a9b58"
                    />
                </g>
            )}
        </svg>
    );
}

export default function Sustainability({ footerPage }: { footerPage: FooterPageContent }) {
    const section = (index: number, title: string, description: string) => ({
        title: footerPage.content_sections?.[index]?.title ?? title,
        description: footerPage.content_sections?.[index]?.content ?? description,
    });

    return (
        <>
            <Head title={footerPage?.title ?? 'Sustainability'} />
            <main className="min-h-screen bg-white px-3 py-3 text-[#173c2b] sm:px-5 sm:py-4">
                <div className="mx-auto max-w-[1500px]">
                    <Link
                        href="/"
                        className="mb-3 inline-flex items-center gap-2 px-1 text-xs font-semibold text-[#17633d] transition hover:text-[#0d4329]"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Back
                    </Link>

                    <section className="relative isolate mb-3 min-h-[170px] overflow-hidden rounded-xl border border-[#dcefe4] bg-[#edf8f2] px-5 py-5 sm:px-7 sm:py-6">
                        <FarmScenery globe />
                        {footerPage.hero_image_path && (
                            <img
                                src={informationalPageImage(footerPage.hero_image_path) ?? ''}
                                alt=""
                                className="absolute inset-y-0 right-0 h-full w-1/2 object-cover object-center"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#edf8f2] via-[#edf8f2]/95 to-[#edf8f2]/10" />
                        <div className="relative z-10 flex max-w-[610px] items-start gap-4 sm:gap-5">
                            <span className="mt-1 flex size-16 shrink-0 items-center justify-center rounded-xl bg-[#075e39] text-white shadow-sm sm:size-[76px]">
                                <Leaf size={42} fill="currentColor" strokeWidth={1.7} />
                            </span>
                            <div>
                                <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-[#064e3b] sm:text-4xl lg:text-[42px]">
                                    {footerPage.title ?? 'Sustainability'}
                                </h1>
                                <p className="mt-2 max-w-[400px] text-xs leading-5 text-[#456b59] sm:text-sm sm:leading-6">{footerPage.content}</p>
                            </div>
                        </div>
                        <p className="font-display absolute right-3 bottom-3 z-10 hidden max-w-[160px] -rotate-3 text-right text-sm leading-5 font-bold text-[#145c38] italic sm:block md:right-5 md:max-w-[185px] md:text-base">
                            Sustainable Choices
                            <br />
                            for a Greener Tomorrow
                            <Sprout className="ml-1 inline-block text-[#3d8b4a]" size={19} />
                        </p>
                    </section>

                    <div className="grid gap-2.5 md:grid-cols-2">
                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <SectionTitle
                                number={1}
                                {...section(
                                    0,
                                    'Our Commitment',
                                    'We are committed to sustainable practices that support local farmers, protect the environment, and create long-term value for our community.',
                                )}
                            />
                            <IconCards items={initiatives} />
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <SectionTitle
                                number={2}
                                {...section(
                                    1,
                                    'Supporting Local Agriculture',
                                    'We provide a platform for local farmers and sellers to reach more customers, grow their businesses, and keep local agriculture strong and sustainable.',
                                )}
                            />
                            <div className="grid gap-3 rounded-xl bg-[#eff9f3] p-2.5 sm:grid-cols-[minmax(130px,0.8fr)_1.2fr] sm:items-center">
                                <img
                                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=720&q=85"
                                    alt="A young seedling growing in rich soil"
                                    className="h-32 w-full rounded-lg object-cover sm:h-[154px]"
                                    loading="lazy"
                                />
                                <Checklist items={farmerBenefits} />
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <SectionTitle
                                number={3}
                                {...section(
                                    2,
                                    'Environmentally Friendly Practices',
                                    'We encourage responsible and eco-friendly practices across our operations and product offerings.',
                                )}
                            />
                            <IconCards items={greenPractices} />
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <SectionTitle
                                number={4}
                                {...section(
                                    3,
                                    'Sustainable Product Choices',
                                    'We offer a variety of agricultural products, supplies, and tools that help farmers and communities grow responsibly.',
                                )}
                            />
                            <div className="grid gap-3 rounded-xl bg-[#eff9f3] p-2.5 sm:grid-cols-[1.25fr_minmax(130px,0.85fr)] sm:items-center">
                                <Checklist items={productBenefits} />
                                <img
                                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=720&q=85"
                                    alt="Fresh vegetables picked from a farm"
                                    className="h-32 w-full rounded-lg object-cover sm:h-[154px]"
                                    loading="lazy"
                                />
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <SectionTitle
                                number={5}
                                {...section(4, 'Our Impact', 'Together, we create positive change for farmers, communities, and the environment.')}
                            />
                            <IconCards items={impactItems} />
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <SectionTitle
                                number={6}
                                {...section(
                                    5,
                                    'What You Can Do',
                                    'Every purchase and action makes a difference. You can help support sustainability by:',
                                )}
                            />
                            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                                <div className="rounded-xl bg-[#eff9f3] p-3">
                                    <Checklist items={everydayActions} />
                                </div>
                                <p className="font-display -rotate-3 text-center text-lg leading-6 font-bold text-[#17633d] italic sm:max-w-[110px] sm:text-xl">
                                    Small Choices
                                    <br />
                                    Make a Big Impact
                                    <Sprout className="mx-auto mt-1 text-[#398d4f]" size={22} />
                                </p>
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <SectionTitle
                                number={7}
                                {...section(
                                    6,
                                    'Our Green Initiatives',
                                    'We continuously work on programs and initiatives that reduce environmental impact and promote sustainability.',
                                )}
                            />
                            <IconCards items={greenInitiatives} />
                        </section>

                        <section className="rounded-xl border border-[#d8ebef] bg-white p-4">
                            <SectionTitle
                                number={8}
                                {...section(
                                    7,
                                    'Our Promise',
                                    'We are dedicated to making BSAB-Shop a force for good — supporting local agriculture, protecting the environment, and building a sustainable future for our community.',
                                )}
                            />
                            <div className="relative overflow-hidden rounded-xl bg-[#e9f7ee] px-4 py-4 text-center">
                                <Leaf className="mx-auto mb-1 text-[#087044]" size={25} fill="currentColor" />
                                <p className="text-sm leading-5 font-bold text-[#145c38]">
                                    Sustainable farming today.
                                    <br />A healthier tomorrow.
                                </p>
                                <Leaf className="absolute -bottom-3 -left-1 size-12 rotate-[-35deg] text-[#bfe4c8]" fill="currentColor" />
                                <Leaf className="absolute -right-1 -bottom-3 size-12 rotate-[35deg] text-[#bfe4c8]" fill="currentColor" />
                            </div>
                        </section>
                    </div>

                    <footer className="relative isolate mt-3 grid min-h-[150px] overflow-hidden rounded-xl border border-[#dcefe4] bg-[#eff8f3] sm:grid-cols-2">
                        <div className="relative min-h-[150px] overflow-hidden sm:min-h-[174px]">
                            <img
                                src={
                                    informationalPageImage(footerPage.footer_image_path) ??
                                    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=90'
                                }
                                alt="A young seedling growing from rich soil in a farmer’s hands"
                                className="absolute inset-0 size-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#eff8f3]/80 sm:to-[#eff8f3]" />
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#eff8f3]/30 to-transparent" />
                        </div>
                        <div className="relative flex min-h-[150px] flex-col justify-center px-5 py-5 sm:min-h-[174px] sm:pl-8">
                            <div className="flex items-center gap-3">
                                <span className="flex size-12 items-center justify-center rounded-xl bg-[#075e39] text-white">
                                    <Sprout size={30} />
                                </span>
                                <div>
                                    <h2 className="font-display text-2xl leading-7 font-bold text-[#064e3b]">BSAB-Shop</h2>
                                    <p className="mt-1 text-[10px] font-medium text-[#456b59] sm:text-xs">
                                        Local Products • Local Sellers • A Stronger Hinoba-an
                                    </p>
                                </div>
                            </div>
                            <div className="my-3 h-px w-full max-w-[280px] bg-[#9bc9aa]" />
                            <p className="font-display text-sm leading-5 font-bold text-[#17633d] italic sm:text-base">
                                Good for Farmers. Good for Communities. Good for the Planet.
                            </p>
                            <Leaf className="absolute top-2 right-2 hidden size-24 rotate-[-32deg] text-[#76b86e]/70 sm:block" fill="currentColor" />
                            <Leaf className="absolute top-10 right-8 hidden size-16 rotate-[30deg] text-[#76b86e]/60 sm:block" fill="currentColor" />
                            <span className="sr-only">Our promise supports local farmers and a healthier planet.</span>
                        </div>
                    </footer>
                </div>
            </main>
        </>
    );
}
