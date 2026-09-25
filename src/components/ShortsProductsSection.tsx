import React, { useState } from 'react';
import { ShortsView } from './ShortsView';
import { ProductsView } from './ProductsView';

export const ShortsProductsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shorts' | 'products'>('shorts');

  return (
    <div className="p-4">
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-4">
        <button
          onClick={() => setActiveTab('shorts')}
          className={`py-2 px-4 ${activeTab === 'shorts' ? 'border-b-2 border-zinc-900 dark:border-zinc-100 font-semibold' : 'text-zinc-500'}`}
        >
          Shorts
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-zinc-900 dark:border-zinc-100 font-semibold' : 'text-zinc-500'}`}
        >
          Products
        </button>
      </div>

      {activeTab === 'shorts' ? <ShortsView /> : <ProductsView />}
    </div>
  );
};
