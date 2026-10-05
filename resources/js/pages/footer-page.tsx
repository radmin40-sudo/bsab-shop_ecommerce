import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Store } from 'lucide-react';

type FooterPageContent = {
    title: string;
    slug: string;
    content: string;
};

export default function FooterPage({ footerPage }: { footerPage: FooterPageContent }) {
    return (
        <>
            <Head title={footerPage.title} />
            <main className="min-h-screen bg-[#f5fcf7] px-4 py-10 text-[#17281d] sm:px-6">
                <article className="mx-auto max-w-3xl rounded-2xl border border-[#dcebe0] bg-white p-6 shadow-sm sm:p-10">
                    <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#1f7a42] hover:text-[#145c3d]">
                        <ArrowLeft size={16} /> Back to BSABShop
                    </Link>
                    <div className="mb-5 flex items-center gap-2 text-sm font-bold text-[#145c3d]">
                        <Store size={18} aria-hidden="true" /> BSABShop
                    </div>
                    <h1 className="font-display text-3xl font-bold text-[#173b27]">{footerPage.title}</h1>
                    <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-[#526157]">{footerPage.content}</div>
                </article>
            </main>
        </>
    );
}
