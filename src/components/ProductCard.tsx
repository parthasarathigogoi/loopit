import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Sparkles } from 'lucide-react';
import type { Product } from '../types/app';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const [liked, setLiked] = useState(false);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block overflow-hidden rounded-[1.75rem] border border-emerald-100/70 bg-white shadow-sm shadow-emerald-950/5 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-950/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.image || '/item-placeholder.svg'}
          alt={product.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          onError={(event) => {
            (event.target as HTMLImageElement).src = '/item-placeholder.svg';
          }}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-emerald-300">
            {product.condition || 'Good'}
          </span>
          {product.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white shadow-lg shadow-emerald-500/25">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            setLiked((value) => !value);
          }}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2.5 text-slate-600 shadow-sm backdrop-blur transition hover:scale-110 hover:text-rose-500 dark:bg-slate-950/80 dark:text-slate-200"
          aria-label="Save item"
        >
          <Heart className={`h-5 w-5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
        {product.sold && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55">
            <span className="rounded-full bg-white px-5 py-2 text-sm font-black text-slate-950">Sold</span>
          </div>
        )}
      </div>

      <div className={compact ? 'p-4' : 'p-5'}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-950 transition group-hover:text-emerald-600 dark:text-white">
              {product.title}
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">By {product.seller?.name || 'Student seller'}</p>
          </div>
          <p className="shrink-0 text-lg font-black text-emerald-600">₹{product.price}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
          <span className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="truncate">{product.location}</span>
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            {product.category}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
