import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, Search } from 'lucide-react';
import { useState } from 'react';

type Product = {
    id: number;
    name: string;
    base_price: string;
    sale_price?: string;
    category?: { name: string; slug: string };
    shop?: { name: string };
    images?: { path: string }[];
};

function imageUrl(path?: string) {
    return path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null;
}

export default function SearchPage({ query = '', products = [] }: { query?: string; products?: Product[] }) {
    const [search, setSearch] = useState(query);

    function submitSearch(event: React.FormEvent) {
        event.preventDefault();
        router.get(route('search'), { q: search.trim() }, { preserveState: true });
    }

    return (
        <>
            <Head title={query ? `Search results for ${query}` : 'Search products'} />
            <div className="min-h-screen bg-[#f5fcf7] text-[#17281d]">
                <header className="border-b border-[#def0e2] bg-white">
                    <div className="mx-auto flex max-w-4xl items-center gap-4 px-5 py-4 sm:px-8">
                        <Link href={route('home')} className="flex shrink-0 items-center gap-2" aria-label="BSABShop home">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b4332] text-[#52b788]">S</span>
                            <span className="font-display text-xl font-bold text-[#1b4332]">BSABShop</span>
                        </Link>
                        <form
                            onSubmit={submitSearch}
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-[#def0e2] bg-[#f5fcf7] px-4 py-2.5 focus-within:border-[#2c9350] focus-within:ring-4 focus-within:ring-[#e6f7eb]"
                        >
                            <Search size={16} className="shrink-0 text-[#647568]" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search for products..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-[#9fb6a6]"
                            />
                        </form>
                    </div>
                </header>
                <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
                    {query ? (
                        <div className="mb-6">
                            <p className="text-xs font-bold tracking-[0.18em] text-[#2c9350] uppercase">Search results</p>
                            <h1 className="font-display mt-2 text-3xl font-bold text-[#163b24]">Results for &ldquo;{query}&rdquo;</h1>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <h1 className="font-display text-3xl font-bold text-[#163b24]">Search products</h1>
                        </div>
                    )}
                    {products.length ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {products.map((product) => {
                                const image = imageUrl(product.images?.[0]?.path);
                                const price = product.sale_price ?? product.base_price;
                                return (
                                    <Link
                                        key={product.id}
                                        href={route('products.show', product.id)}
                                        className="group overflow-hidden rounded-2xl border border-[#def0e2] bg-white shadow-[0_6px_20px_rgba(22,59,36,0.06)] transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex aspect-square items-center justify-center bg-[#e6f7eb]">
                                            {image ? (
                                                <img src={image} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon size={48} className="text-[#2c9350]" />
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <p className="text-[10px] font-bold tracking-[0.06em] text-[#2c9350] uppercase">
                                                {product.category?.name ?? 'Marketplace'}
                                            </p>
                                            <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-[#163b24]">{product.name}</h2>
                                            <p className="mt-1 truncate text-xs text-[#647568]">{product.shop?.name ?? 'BSABShop seller'}</p>
                                            <p className="font-display mt-3 text-lg font-bold text-[#163b24]">₱{Number(price).toLocaleString()}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="border border-dashed border-[#b8d9c0] bg-white px-5 py-16 text-center">
                            <Search className="mx-auto text-[#2c9350]" />
                            <h2 className="font-display mt-4 text-xl font-bold text-[#163b24]">No products found</h2>
                            {query && <p className="mt-2 text-sm text-[#647568]">Try searching with a different product name.</p>}
                            <Link href={route('home')} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1f7a42]">
                                <ArrowLeft size={15} /> Back to marketplace
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
