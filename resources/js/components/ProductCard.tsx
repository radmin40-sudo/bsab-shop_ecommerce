import { Heart } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description?: string | null;
    base_price: string;
    sale_price?: string | null;
    stock_quantity: number;
    category?: { name: string; slug: string } | null;
    shop?: { name: string } | null;
    images?: { path: string }[];
}

interface ProductCardProps {
    product: Product;
    liked: boolean;
    onToggleFavorite: () => void;
    onOpenProduct: () => void;
}

const imageUrl = (path?: string | null) => (path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null);

const money = (value: string | number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value));

export default function ProductCard({ product, liked, onToggleFavorite, onOpenProduct }: ProductCardProps) {
    const image = imageUrl(product.images?.[0]?.path);
    const price = product.sale_price ?? product.base_price;
    const isSale = !!product.sale_price && Number(product.sale_price) < Number(product.base_price);
    const isSold = product.stock_quantity < 1;
    const discountPct = isSale ? Math.round((1 - Number(product.sale_price) / Number(product.base_price)) * 100) : 0;

    // initials placeholder
    const initials = product.shop?.name
        ? product.shop.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
        : product.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

    return (
        <article
            className={`card${isSold ? 'sold' : ''}`}
            onClick={onOpenProduct}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenProduct();
                }
            }}
            role="link"
            tabIndex={0}
        >
            {/* Image area */}
            <div className="card-media">
                {image ? <img src={image} alt={product.name} className="h-full w-full object-cover" /> : <div className="ph">{initials}</div>}

                {isSale && <span className="discount-tag">-{discountPct}%</span>}

                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleFavorite();
                    }}
                    aria-label={liked ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
                    className={`fav-chip${liked ? 'active' : ''}`}
                >
                    <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
                </button>
            </div>

            {/* Body */}
            <div className="card-body">
                <p className="card-shop">{product.shop?.name ?? ''}</p>
                <h3 className="card-name">{product.name}</h3>

                <div className="price-row">
                    <div className="price-group">
                        <span className="price">{money(price)}</span>
                        {isSale && <span className="price-old">{money(product.base_price)}</span>}
                    </div>

                    {isSold && <span className="sold-label">Sold out</span>}
                </div>

                <p className="stock-note">{isSold ? 'Restocking soon' : `${product.stock_quantity} left`}</p>
            </div>
        </article>
    );
}
