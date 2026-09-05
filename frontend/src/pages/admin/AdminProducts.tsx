import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { uploadApi } from '../../api/upload.api';
import { Product } from '../../types';
import { PRODUCT_CATEGORIES } from '../Market';
import { formatPrice } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';
import {
  Plus,
  Edit2,
  Trash2,
  ShoppingBag,
  Camera,
  RefreshCw,
  X,
  Check,
  Tag,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number | string>('');
  const [category, setCategory] = useState<string>('Asbob-uskunalar');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [stock, setStock] = useState<number | string>(100);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [uploading, setUploading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getProducts();
      setProducts(res.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Asbob-uskunalar');
    setImageUrl('');
    setStock(100);
    setIsActive(true);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setCategory(p.category);
    setImageUrl(p.imageUrl || '');
    setStock(p.stock);
    setIsActive(p.isActive);
    setError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const res = await uploadApi.uploadImage(file, 'products');
      if (res.success && res.url) {
        setImageUrl(res.url);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Rasm yuklashda xatolik yuz berdi.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price) {
      setError('Iltimos, barcha majburiy maydonlarni to\'ldiring.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        name,
        description,
        price: Number(price),
        category,
        imageUrl: imageUrl || null,
        stock: Number(stock),
        isActive,
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload);
      } else {
        await adminApi.createProduct(payload);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Saqlashda xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Market Mahsulotlari
          </h2>
          <p className="text-xs text-gray-500">
            Platformada sotuvga qo'yilgan barcha mahsulotlar ({products.length} ta)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Mahsulot qo'shish</span>
        </button>
      </div>

      {/* Product List Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              {/* Image & Status Tag */}
              <div className="relative w-full h-44 bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingBag className="w-10 h-10 text-gray-400 opacity-40" />
                )}

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 text-indigo-700 dark:text-indigo-300 backdrop-blur-md">
                    {product.category}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      product.isActive
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {product.isActive ? 'Faol' : 'Nofaol'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {product.description}
                </p>
                <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(product.price)} so'm
                  </span>
                  <span className="text-[11px] text-gray-400 font-semibold">
                    {product.stock} dona
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 transition shadow-sm"
                  title="Tahrirlash"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {deleteConfirmId === product.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                    >
                      Ha, o'chirish
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1.5 rounded-xl bg-gray-200 dark:bg-slate-600 text-xs font-bold"
                    >
                      Yo'q
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(product.id)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 transition shadow-sm"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <EmptyState
            icon={ShoppingBag}
            title="Mahsulotlar mavjud emas"
            description="Marketga birinchi mahsulotni qo'shish uchun yuqoridagi tugmani bosing."
            actionText="Mahsulot qo'shish"
            onAction={openCreateModal}
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
            </h3>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Image */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center group">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Product" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-center p-2 text-gray-400">
                      <Camera className="w-8 h-8 mx-auto mb-1 opacity-60" />
                      <span className="text-xs block font-semibold">Mahsulot rasmini yuklash</span>
                    </div>
                  )}

                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">Rasm tanlash</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                {uploading && (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rasm yuklanmoqda...</span>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Mahsulot nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Drel Bosch Professional 750W"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Narxi (so'mda) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    placeholder="450000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Kategoriya *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PRODUCT_CATEGORIES.filter((c) => c !== 'Barchasi').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock & Active */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Ombordagi soni
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer">
                    Sotuvda ko'rinsin (Faol)
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Tavsifi *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Mahsulotning texnik xususiyatlari va kafolati..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-98 transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Saqlash</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
