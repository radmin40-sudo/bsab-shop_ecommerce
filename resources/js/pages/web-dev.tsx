import { informationalPageImage } from '@/lib/informational-page-image';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpenCheck, Code2, Handshake, Leaf, Lightbulb, Palette, Sprout, UserRound, UsersRound } from 'lucide-react';

type TeamMember = {
    name: string;
    role: string;
    description: string;
    photo?: string | null;
};

type FooterPageContent = {
    title?: string;
    slug?: string;
    content?: string;
    team_members?: TeamMember[];
    hero_image_path?: string | null;
    footer_image_path?: string | null;
};

const defaultMembers: TeamMember[] = [
    {
        name: 'John Ray Boquina',
        role: 'Adviser',
        description: 'Provides guidance, direction, and professional advice throughout the development of the BSAB-Shop system.',
    },
    {
        name: 'Kier Steve Narra',
        role: 'Co-Adviser',
        description: 'Supports the project through technical guidance, evaluation, and development recommendations.',
    },
    {
        name: 'Joshua Macahipay',
        role: 'Team Leader',
        description:
            'Leads the development team, coordinates project activities, manages implementation, and ensures the system meets its objectives.',
    },
    {
        name: 'Rene Mendoza',
        role: 'UI/UX Designer',
        description:
            'Designs the user interface and user experience, focusing on usability, accessibility, responsive layouts, and a consistent BSAB-Shop visual identity.',
    },
    {
        name: 'Maridel Celestial',
        role: 'Documentitor',
        description:
            'Manages project documentation, organizes system information, and ensures important development records are complete and properly maintained.',
    },
];

const contributions = [
    { title: 'Leadership', icon: UsersRound },
    { title: 'Guidance', icon: Lightbulb },
    { title: 'UI/UX Design', icon: Palette },
    { title: 'Documentation', icon: BookOpenCheck },
    { title: 'Collaboration', icon: Handshake },
];

function DeveloperIllustration() {
    return (
        <div aria-hidden="true" className="relative mx-auto w-full max-w-[440px]">
            <svg viewBox="0 0 440 285" fill="none" className="h-auto w-full">
                <path d="M34 239c48-47 95-63 148-48 53 15 95-30 143-12 32 12 56 32 81 60v22H34v-22Z" fill="#DDEFE1" />
                <path d="M42 243c50-30 92-38 132-23 52 20 88-21 143-9 34 7 57 25 89 45H42v-13Z" fill="#C4E1CC" />
                <rect x="95" y="52" width="235" height="151" rx="16" fill="#fff" stroke="#B9D8C2" strokeWidth="3" />
                <rect x="109" y="66" width="207" height="122" rx="8" fill="#F2F8F3" />
                <circle cx="123" cy="80" r="3" fill="#75AF84" />
                <circle cx="135" cy="80" r="3" fill="#75AF84" />
                <circle cx="147" cy="80" r="3" fill="#75AF84" />
                <path
                    d="m135 111-13 12 13 12m39-24 13 12-13 12m-9-29-11 34"
                    stroke="#2F8750"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M209 111h72M209 125h57M209 139h66" stroke="#B4D2BC" strokeWidth="5" strokeLinecap="round" />
                <path d="M78 204h270l27 22H51l27-22Z" fill="#6BA879" />
                <rect x="187" y="210" width="68" height="5" rx="2.5" fill="#D7EBDD" />
                <circle cx="347" cy="82" r="28" fill="#E7F3E9" />
                <path d="M347 96c11-12 13-24 3-34-13 1-20 10-17 21 2 6 7 10 14 13Z" fill="#67A975" />
                <path d="M347 94c-1-9-4-17-11-23" stroke="#3E8150" strokeWidth="2" strokeLinecap="round" />
                <path d="M66 155c11-12 13-24 3-34-13 1-20 10-17 21 2 6 7 10 14 13Z" fill="#8DBE94" />
                <path d="M66 153c-1-9-4-17-11-23" stroke="#4B8D5B" strokeWidth="2" strokeLinecap="round" />
                <path d="M374 184c11-12 13-24 3-34-13 1-20 10-17 21 2 6 7 10 14 13Z" fill="#8DBE94" />
                <path d="M374 182c-1-9-4-17-11-23" stroke="#4B8D5B" strokeWidth="2" strokeLinecap="round" />
                <path d="M63 250c9-20 22-23 31-7-8 18-18 22-31 7Z" fill="#65A875" />
                <path d="M66 250c9-7 17-10 25-10" stroke="#3F8051" strokeWidth="2" strokeLinecap="round" />
                <path d="M359 251c9-20 22-23 31-7-8 18-18 22-31 7Z" fill="#65A875" />
                <path d="M362 251c9-7 17-10 25-10" stroke="#3F8051" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="absolute top-8 right-9 rounded-full border border-[#cfe5d4] bg-white px-3 py-1.5 text-xs font-semibold text-[#39774a] shadow-sm">
                Growing together
            </span>
        </div>
    );
}

function initials(name: string) {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

export default function WebDev({ footerPage }: { footerPage?: FooterPageContent }) {
    const members = footerPage?.team_members?.length ? footerPage.team_members : defaultMembers;

    return (
        <>
            <Head title={footerPage?.title ?? 'Team Developers'} />
            <main className="min-h-screen bg-white px-4 py-5 text-[#244637] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/"
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#267443] transition hover:bg-[#f0f7f1]"
                    >
                        <ArrowLeft size={18} strokeWidth={2.2} />
                        Back
                    </Link>

                    <section className="relative mt-4 overflow-hidden rounded-3xl border border-[#d8eade] bg-gradient-to-r from-[#f7fbf7] via-[#f0f8f1] to-[#e8f4e9] px-6 py-8 sm:px-9 sm:py-10 lg:min-h-[300px] lg:px-12">
                        {footerPage?.hero_image_path && (
                            <img
                                src={informationalPageImage(footerPage.hero_image_path) ?? ''}
                                alt=""
                                className="absolute inset-y-0 right-0 h-full w-1/2 object-cover object-center"
                            />
                        )}
                        <div className="relative z-10 grid items-center gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                            <div className="flex items-start gap-4 sm:gap-5">
                                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#176b3b] text-white shadow-sm sm:size-[68px]">
                                    <UsersRound size={32} strokeWidth={1.8} />
                                </div>
                                <div className="pt-0.5">
                                    <p className="mb-1 text-xs font-bold tracking-[0.18em] text-[#4b8b5c] uppercase">BSAB-Shop</p>
                                    <h1 className="font-display text-3xl leading-tight font-bold text-[#173b27] sm:text-4xl lg:text-5xl">
                                        {footerPage?.title ?? 'Team Developers'}
                                    </h1>
                                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#506c5c] sm:text-base sm:leading-7">
                                        {footerPage?.content ??
                                            'Meet the team behind BSAB-Shop — a dedicated group working together to build a reliable, user-friendly, and community-focused agricultural marketplace.'}
                                    </p>
                                </div>
                            </div>
                            <DeveloperIllustration />
                        </div>
                    </section>

                    <section className="mt-10 sm:mt-12">
                        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold tracking-[0.16em] text-[#4b8b5c] uppercase">The people behind the platform</p>
                                <h2 className="font-display mt-1 text-2xl font-bold text-[#173b27] sm:text-3xl">Meet our team</h2>
                            </div>
                            <p className="max-w-md text-sm leading-6 text-[#64786a]">
                                Guidance and creativity come together to support local farmers, sellers, and communities.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                            {members.map((member, index) => {
                                const featured = member.role.toLowerCase() === 'team leader';
                                const guidance = index < 2 && !featured;

                                return (
                                    <article
                                        key={`${member.name}-${index}`}
                                        className={`flex min-h-full flex-col items-center rounded-2xl border p-5 text-center shadow-[0_4px_18px_rgba(25,78,46,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(25,78,46,0.1)] sm:p-6 ${
                                            featured
                                                ? 'border-[#91c79d] bg-[#f4faf5] ring-1 ring-[#d8ebdc] sm:col-span-2 xl:col-span-2'
                                                : guidance
                                                  ? 'border-[#d8eade] bg-white sm:col-span-1 xl:col-span-3'
                                                  : 'border-[#d8eade] bg-white sm:col-span-1 xl:col-span-2'
                                        }`}
                                    >
                                        <div
                                            className={`relative grid size-[92px] place-items-center overflow-hidden rounded-full border-4 border-white text-2xl font-bold text-[#287447] shadow-sm ${featured ? 'bg-[#dcefe0]' : 'bg-[#eaf4ec]'}`}
                                        >
                                            {member.photo ? (
                                                <img
                                                    src={informationalPageImage(member.photo) ?? ''}
                                                    alt={`${member.name} profile`}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <span>{initials(member.name)}</span>
                                            )}
                                            <span className="absolute right-0 bottom-0 grid size-8 place-items-center rounded-full border-2 border-white bg-[#2f8750] text-white">
                                                {featured ? <Code2 size={15} /> : <UserRound size={15} />}
                                            </span>
                                        </div>
                                        <p className="mt-4 text-xs font-bold tracking-[0.13em] text-[#61926b] uppercase">
                                            {guidance ? 'Project guidance' : featured ? 'Development lead' : 'Core development'}
                                        </p>
                                        <h3 className="font-display mt-1 text-xl font-bold text-[#173b27]">{member.name}</h3>
                                        <p className="mt-1 inline-flex rounded-full bg-[#eaf4ec] px-3 py-1 text-xs font-semibold text-[#267443]">
                                            {member.role}
                                        </p>
                                        <p className="mt-4 max-w-md text-sm leading-6 text-[#5d7164]">{member.description}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className="mt-10 rounded-2xl border border-[#d8eade] bg-[#f7fbf7] px-5 py-7 sm:mt-12 sm:px-8 sm:py-9">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e4f1e6] text-[#2b7a47]">
                                <Sprout size={25} />
                            </div>
                            <h2 className="font-display mt-3 text-2xl font-bold text-[#173b27]">Our Team</h2>
                            <p className="mt-2 text-sm leading-6 text-[#5d7164] sm:text-base sm:leading-7">
                                Together, we combine leadership, guidance, design, documentation, and technical development to create a better digital
                                marketplace for local farmers, sellers, and communities.
                            </p>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            {contributions.map(({ title, icon: Icon }) => (
                                <div
                                    key={title}
                                    className="flex min-h-20 items-center justify-center gap-2 rounded-xl border border-[#e0ece2] bg-white px-3 py-4 text-center text-sm font-semibold text-[#315947]"
                                >
                                    <Icon size={19} className="shrink-0 text-[#3c8952]" />
                                    {title}
                                </div>
                            ))}
                        </div>
                    </section>

                    <footer className="relative mt-8 mb-5 overflow-hidden rounded-2xl border border-[#cfe3d3] bg-[#edf6ee] px-6 py-7 sm:px-9 sm:py-8">
                        <Leaf
                            aria-hidden="true"
                            className="absolute -right-3 -bottom-8 size-36 rotate-[-28deg] text-[#9fc9a6]/45 sm:size-48"
                            strokeWidth={1.1}
                        />
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="grid size-12 place-items-center rounded-xl bg-[#176b3b] text-white">
                                    <Sprout size={25} />
                                </div>
                                <div>
                                    <p className="font-display text-xl font-bold text-[#173b27]">BSAB-Shop</p>
                                    <p className="mt-0.5 text-xs font-medium text-[#52705d] sm:text-sm">
                                        Local Products • Local Sellers • A Stronger Hinoba-an
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 text-sm font-medium text-[#39734a] sm:max-w-sm sm:text-right">
                                <Leaf size={17} className="mt-0.5 shrink-0" />
                                <span>Good for Farmers. Good for Communities. Good for the Planet.</span>
                            </div>
                        </div>
                    </footer>
                </div>
            </main>
        </>
    );
}
