import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, Trash2, Loader2, ShoppingCart } from 'lucide-react';
import { CreateProductModal } from './CreateProductModal';

interface Product {
  id: string;
  photoUrl: string;
  title: string;
  description: string;
  pricing: string;
  tag: string;
  pageId?: string;
  eventId?: string;
  createdAt: any;
}

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const q = query(collection(db, `users/${uid}/products`));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [uid]);

  const handleDelete = async (productId: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, `users/${uid}/products`, productId));
    fetchProducts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Products</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Create Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
      ) : !uid ? (
        <div className="text-center p-8 text-zinc-500">Please sign in to view your products.</div>
      ) : products.length === 0 ? (
        <div className="text-center p-8 text-zinc-500">No products created yet.</div>
      ) : (
        <div className="space-y-2">
          {products.map(product => (
            <div key={product.id} className="border p-4 rounded-lg shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-zinc-100 rounded" />
                <div>
                  <h3 className="font-bold">{product.title}</h3>
                  <p className="text-sm text-zinc-600">{product.pricing} PHP</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-zinc-500 flex items-center gap-1 text-sm border px-2 py-1 rounded">
                  <ShoppingCart size={14} /> Add to Cart
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-500 flex items-center gap-1 text-sm border border-red-200 px-2 py-1 rounded"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && uid && (
        <CreateProductModal uid={uid} onClose={() => { setIsModalOpen(false); fetchProducts(); }} />
      )}
    </div>
  );
};
