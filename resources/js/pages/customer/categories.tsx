import { PortalLayout } from '@/components/portal-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, Image as ImageIcon, LayoutGrid } from 'lucide-react';

type ChildCategory = { id: number; parent_id: number; name: string; slug: string; image?: string | null };
type Product = {
    id: number;
    name: string;
    base_price: string;
    sale_price?: string | null;
    shop?: { name: string } | null;
    images?: { path: string }[];
};
type Category = {
    id: number;
    name: string;
    slug: string;
    image?: string | null;
    products_count: number;
    children?: ChildCategory[];
    products?: Product[];
};

const accents = ['#e6f7eb', '#fff3d6', '#e8f0ff', '#fbeaea', '#f1e8dc', '#e5f3ee'];

function imageUrl(path?: string | null) {
    return path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null;
}

export default function CustomerCategories({ categories = [] }: { categories?: Category[] }) {
    const productTotal = categories.reduce((total, category) => total + category.products_count, 0);

    return (
        <>
            <Head title="Categories" />
            <PortalLayout role="customer" title="Browse categories" eyebrow="Categories">
                <section className="mt-3 grid gap-6 border-b border-[#dce8de] pb-9 lg:grid-cols-[1fr_310px] lg:items-end">
                    <div>
                        <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-[#2c9350] uppercase">
                            <LayoutGrid size={14} /> Explore the shop
                        </p>
                        <h1 className="font-display mt-3 max-w-2xl text-4xl leading-[1.05] font-bold tracking-tight text-[#163b24] sm:text-5xl">
                            What are you <span className="text-[#2c9350]">looking for?</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-[#647568]">
                            Start with a collection and discover products selected from across the BSABShop marketplace.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                        <div className="bg-[#163b24] p-4 text-white">
                            <p className="text-[10px] font-bold tracking-[0.14em] text-[#a7e0b5] uppercase">Live marketplace</p>
                            <p className="font-display mt-1 text-3xl font-bold">{productTotal.toLocaleString()}</p>
                            <p className="mt-1 text-xs text-[#d2e8d5]">products across {categories.length} collections</p>
                        </div>
                        <Link
                            href={route('marketplace')}
                            className="group flex items-end justify-between border border-[#cdebcf] bg-[#e6f7eb] p-4 text-sm font-bold text-[#1f7a42]"
                        >
                            <span>Shop everything</span>
                            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </div>
                </section>

                <div className="mt-9 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-bold tracking-[0.16em] text-[#9fb6a6] uppercase">The directory</p>
                        <h2 className="font-display mt-1 text-2xl font-bold text-[#163b24]">Browse collections</h2>
                    </div>
                    <span className="text-xs font-semibold text-[#647568]">{categories.length} available</span>
                </div>

                {categories.length ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category, index) => {
                            const image = imageUrl(category.image);
                            return (
                                <article
                                    key={category.id}
                                    className="group overflow-hidden border border-[#dce8de] bg-white shadow-[0_4px_16px_rgba(22,59,36,0.04)] transition hover:-translate-y-1 hover:border-[#9ed6a8] hover:shadow-[0_14px_30px_rgba(22,59,36,0.11)]"
                                >
                                    <Link href={`${route('marketplace')}?category=${category.slug}`} className="block">
                                        <div
                                            className="relative flex aspect-[1.55/1] items-center justify-center overflow-hidden"
                                            style={{ backgroundColor: accents[index % accents.length] }}
                                        >
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={category.name}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <ImageIcon size={52} strokeWidth={1.2} className="text-[#2c9350]" />
                                            )}
                                            <span className="absolute top-3 left-3 font-mono text-[10px] font-bold tracking-wider text-[#1f7a42]/70">
                                                0{index + 1}
                                            </span>
                                            <span className="absolute right-3 bottom-3 bg-[#163b24] px-2.5 py-1 text-[11px] font-bold text-white">
                                                {category.products_count} items
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 p-5">
                                            <div className="min-w-0">
                                                <h3 className="font-display truncate text-2xl font-bold text-[#163b24]">{category.name}</h3>
                                                <p className="mt-1 text-xs text-[#647568]">
                                                    {category.children?.length ? `${category.children.length} subcategories` : 'Browse collection'}
                                                </p>
                                            </div>
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#cdebcf] bg-[#f5fcf7] text-[#1f7a42] transition group-hover:bg-[#1f7a42] group-hover:text-white">
                                                <ArrowRight size={18} />
                                            </span>
                                        </div>
                                    </Link>
                                    <div className="border-t border-[#edf5ee] px-5 py-4">
                                        <Link
                                            href={route('customer.categories.show', category.slug)}
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f7a42] px-4 py-2 text-xs font-bold text-white shadow-[0_10px_25px_rgba(31,122,66,0.18)] transition hover:bg-[#185f35]"
                                        >
                                            Show all products
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                    {!!category.children?.length && (
                                        <div className="flex flex-wrap gap-2 border-t border-[#edf5ee] px-5 pt-3 pb-5">
                                            {category.children.slice(0, 4).map((child) => (
                                                <Link
                                                    key={child.id}
                                                    href={route('customer.categories.show', child.slug)}
                                                    className="bg-[#f5fcf7] px-2.5 py-1 text-xs font-medium text-[#647568] hover:text-[#1f7a42]"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-5 border border-dashed border-[#b8d9c0] bg-white py-16 text-center text-sm text-[#647568]">
                        No categories match your search.
                    </div>
                )}

                <Link
                    href={route('marketplace')}
                    className="mt-6 flex items-center justify-center gap-2 border border-[#def0e2] bg-white p-4 text-sm font-bold text-[#1f7a42] sm:hidden"
                >
                    View all products <ArrowUpRight size={15} />
                </Link>
            </PortalLayout>
        </>
    );
}
