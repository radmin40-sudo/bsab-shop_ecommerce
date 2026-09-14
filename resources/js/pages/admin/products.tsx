import { PortalLayout, StatCard } from '@/components/portal-layout';
import { Head, router } from '@inertiajs/react';
import { Check, CheckCheck, Clock3, Image as ImageIcon, X } from 'lucide-react';

type Product = {
    id: number;
    name: string;
    sku: string;
    status: string;
    images?: { path: string; is_primary: boolean }[];
    shop?: { name: string } | null;
    category?: { name: string } | null;
};
export default function AdminProducts({ products }: { products: Product[] }) {
    const update = (product: Product, status: 'published' | 'rejected') =>
        router.patch(route('admin.products.update', product.id), { status }, { preserveScroll: true });
    const pending = products.filter((product) => product.status !== 'published');
    return (
        <>
            <Head title="Product moderation" />
            <PortalLayout role="admin" title="Product moderation" eyebrow="Catalog operations">
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Published"
                        value={String(products.filter((item) => item.status === 'published').length)}
                        detail="Live in the storefront"
                        tone="green"
                    />
                    <StatCard label="Awaiting approval" value={String(pending.length)} detail="Not published yet" tone="warm" />
                    <StatCard
                        label="Drafts"
                        value={String(products.filter((item) => item.status === 'draft').length)}
                        detail="Seller work in progress"
                    />
                </div>
                <section className="mt-8 overflow-x-auto border border-[#dfe3dc] bg-white">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#dfe3dc] p-5 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="font-serif text-2xl">Moderation queue</h2>
                            <p className="mt-1 text-sm text-[#657066]">Approve products before customers can buy them.</p>
                        </div>
                        <button
                            type="button"
                            disabled={!pending.length}
                            onClick={() => {
                                if (window.confirm(`Approve all ${pending.length} unpublished products?`)) {
                                    router.patch(route('admin.products.approve-all'), {}, { preserveScroll: true });
                                }
                            }}
                            className="flex items-center justify-center gap-2 bg-[#1f7a42] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163b24] disabled:cursor-not-allowed disabled:bg-[#dfe8df] disabled:text-[#8b998d]"
                        >
                            <CheckCheck size={17} /> Approve all products
                        </button>
                    </div>
                    <table className="w-full min-w-190 text-left text-sm">
                        <thead className="bg-[#eef0e9] text-xs text-[#657066] uppercase">
                            <tr>
                                <th className="px-5 py-3">Image</th>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3">Shop</th>
                                <th className="px-5 py-3">Category</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Decision</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edf0eb]">
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-5 py-4">
                                        {(() => {
                                            const image = product.images?.find((item) => item.is_primary) ?? product.images?.[0];
                                            return image ? (
                                                <img
                                                    src={`/storage/${image.path}`}
                                                    alt={product.name}
                                                    className="h-14 w-14 rounded-[10px] object-cover"
                                                />
                                            ) : (
                                                <span className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-[#e6f7eb] text-[#1f7a42]">
                                                    <ImageIcon size={20} />
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-semibold">{product.name}</p>
                                        <p className="text-xs text-[#657066]">{product.sku}</p>
                                    </td>
                                    <td className="px-5 py-4">{product.shop?.name ?? 'Unknown shop'}</td>
                                    <td className="px-5 py-4 text-[#657066]">{product.category?.name ?? 'Uncategorized'}</td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex rounded-full bg-[#eef0e9] px-2.5 py-1 text-xs font-semibold">
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            {product.status !== 'published' && (
                                                <button
                                                    onClick={() => update(product, 'published')}
                                                    className="flex items-center gap-1 border border-[#b9d0ad] px-2.5 py-1.5 text-xs font-semibold text-[#2c7a3b]"
                                                >
                                                    <Check size={13} /> Approve
                                                </button>
                                            )}
                                            {product.status !== 'rejected' && (
                                                <button
                                                    onClick={() => update(product, 'rejected')}
                                                    className="flex items-center gap-1 border border-[#eccac3] px-2.5 py-1.5 text-xs font-semibold text-[#a23b2d]"
                                                >
                                                    <X size={13} /> Reject
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-[#657066]">
                                        <Clock3 className="mx-auto mb-2" size={20} />
                                        No products submitted yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </PortalLayout>
        </>
    );
}
