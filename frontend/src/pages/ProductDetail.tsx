import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/product.api';
import { Product } from '../types';
import { formatPrice } from '../components/ProductCard';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ShoppingBag,
  ChevronLeft,
  Tag,
  CheckCircle2,
  ShieldAlert,
  Phone,
  Share2,
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError('');
      const res = await productApi.getProductById(productId);
      setProduct(res.product);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Mahsulot topilmadi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-500">{t('common.loading', 'Yuklanmoqda...')}</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mahsulot topilmadi</h3>
        <p className="text-sm text-gray-500">{error || 'Mahsulot mavjud emas.'}</p>
        <button
          onClick={() => navigate('/market')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm"
        >
          Marketga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 text-xs font-bold transition shadow-sm active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Orqaga</span>
        </button>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: product.name, url: window.location.href });
            }
          }}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:text-indigo-600 transition shadow-sm"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Product Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm space-y-6">
        {/* Large Image Container */}
        <div className="relative w-full h-64 sm:h-96 bg-gray-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag className="w-16 h-16 opacity-40 mb-2" />
              <span className="text-sm font-semibold">Rasm mavjud emas</span>
            </div>
          )}

          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-900/90 text-indigo-700 dark:text-indigo-300 backdrop-blur-md shadow-sm">
              <Tag className="w-3.5 h-3.5" />
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Details Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('market.inStock', 'Sotuvda mavjud')} ({product.stock} dona)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {product.name}
            </h1>

            <div className="pt-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {formatPrice(product.price)} <span className="text-base font-bold">{t('market.currency', 'so\'m')}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Mahsulot haqida ma'lumot
            </h3>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-slate-300 whitespace-pre-line bg-gray-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
              {product.description}
            </p>
          </div>

          {/* Contact / Order Action */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
            <a
              href="tel:+998901234567"
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-98 transition"
            >
              <Phone className="w-5 h-5" />
              <span>{t('market.buyNow', 'Sotib olish uchun bog\'lanish')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
