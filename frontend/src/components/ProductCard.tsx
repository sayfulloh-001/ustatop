import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingBag, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('uz-UZ').format(price);

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/market/${product.id}`)}
      className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Image area */}
      <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800/60 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300 dark:text-slate-600">
            <ShoppingBag className="w-10 h-10" />
          </div>
        )}

        {/* Category badge */}
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-white/95 dark:bg-slate-900/90 text-indigo-600 dark:text-indigo-300 shadow-sm backdrop-blur-sm border border-indigo-50 dark:border-slate-700">
          <Tag className="w-2.5 h-2.5" />
          {product.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1 gap-1.5">
        <h4 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
          {product.name}
        </h4>

        {product.description && (
          <p className="text-[11px] text-gray-400 dark:text-slate-500 line-clamp-2 leading-relaxed flex-1">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-1 flex items-end justify-between">
          <div>
            <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs font-semibold text-gray-400 ml-1">so'm</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center group-hover:bg-indigo-500 transition-colors duration-200">
            <ShoppingBag className="w-4 h-4 text-indigo-500 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};
