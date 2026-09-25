import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Clock,
  Globe,
  Lock,
  MoreVertical,
  Bell,
  BellRing,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Upload,
  Link2,
  RotateCcw,
  Film,
  Newspaper,
  BarChart3,
  HelpCircle,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  MapPin,
  Check,
  AlertTriangle,
  CheckCircle,
  UploadCloud,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AtSign,
  User,
  ShoppingCart,
  CreditCard,
  Tag,
  Truck
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { PageItem, EventItem, SubTab, QuotaTierName, UserProfile, ProductItem, CartItem, OrderItem } from '../types';
import { QUOTA_TIERS, getQuotaResetDate, isQuotaLimitExceeded } from '../data/quotaTiers';
import { readFileAsOptimizedDataUrl, optimizePayloadForFirestore } from '../utils/imageHelper';
import { handleFirestoreError, OperationType, isPermissionDeniedError, calculateDaysRemaining } from '../utils/firestoreHelper';
import { getVideoThumbnail } from '../utils/videoHelper';
import { logActivity } from '../utils/activityLogger';
import { HighlightText } from './HighlightText';
import ItemDetailModal from './ItemDetailModal';
import { TagInput } from './TagInput';
import { getTagStyle } from '../utils/tagHelper';


interface PagesEventsManagerProps {
  type: 'Pages' | 'Events' | 'Shopping' | 'Products';
  currentUser: FirebaseUser;
  currentUserProfile?: UserProfile | null;
  onActionNotice: (msg: string) => void;
  onSelectTier?: () => void;
  userPages?: PageItem[];
  userEvents?: EventItem[];
  onRefreshData?: () => void;
  quotaCounts?: {
    videos: number;
    news: number;
    photos: number;
    polls: number;
    quiz: number;
    pages: number;
    events: number;
  };
  activeTier?: QuotaTierName;
}
const DEFAULT_PRODUCT_PHOTO = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60';

export interface ViewShoppingModalProps {
  product: ProductItem;
  onClose: () => void;
  onAddToCart: (quantity: number) => void;
  onCheckout: (quantity: number) => void;
}

export function ViewShoppingModal({
  product,
  onClose,
  onAddToCart,
  onCheckout
}: ViewShoppingModalProps) {
  const [quantity, setQuantity] = useState(1);

  const formattedPrice = useMemo(() => {
    const raw = String(product.pricing || '').trim();
    if (raw.startsWith('$') || raw.startsWith('₱') || raw.startsWith('€') || raw.startsWith('£')) {
      return raw;
    }
    const num = parseFloat(raw) || 0;
    return `₱${num.toFixed(2)}`;
  }, [product.pricing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
              Shopping Product
            </span>
            <span className="text-xs text-zinc-400 font-bold">• 1:1 Square</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* 1:1 PHOTO */}
          <div className="w-full max-w-[280px] mx-auto aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 shadow-md">
            <img
              src={product.photo || DEFAULT_PRODUCT_PHOTO}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_PHOTO;
              }}
            />
          </div>

          {/* TITLE & PRICING */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 leading-snug">
                {product.title}
              </h3>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                {formattedPrice}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {product.tag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  <Tag size={11} />
                  <span>#{product.tag}</span>
                </span>
              )}
              {product.visibility && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/50 dark:border-emerald-800/40">
                  <Globe size={11} />
                  <span>{product.visibility}</span>
                </span>
              )}
              {product.pageLocation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200/60 dark:border-purple-800/40">
                  <Layers size={11} />
                  <span>Page: {product.pageLocation}</span>
                </span>
              )}
              {product.eventLocation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200/60 dark:border-amber-800/40">
                  <Calendar size={11} />
                  <span>Event: {product.eventLocation}</span>
                </span>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Description
            </h5>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {product.description || 'No description provided.'}
            </div>
          </div>

          {/* QUANTITY SELECTOR */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Quantity
            </span>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* BUTTONS: "Add the Cart" + "Checkout" */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-2.5 bg-zinc-50/50 dark:bg-zinc-800/40 shrink-0">
          <button
            type="button"
            id="btn-add-the-cart"
            onClick={() => {
              onAddToCart(quantity);
              onClose();
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-xs font-black text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingCart size={15} />
            <span>Add the Cart</span>
          </button>

          <button
            type="button"
            id="btn-checkout"
            onClick={() => {
              onCheckout(quantity);
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <CreditCard size={15} />
            <span>Checkout (Require Credit Card)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export interface CheckoutModalProps {
  currentUser: FirebaseUser | null;
  currentUserProfile?: UserProfile | null;
  directProduct: ProductItem;
  directQuantity: number;
  onClose: () => void;
  onSuccess: (order: OrderItem) => void;
}

export function CheckoutModal({
  currentUser,
  currentUserProfile,
  directProduct,
  directQuantity,
  onClose,
  onSuccess
}: CheckoutModalProps) {
  const uid = currentUser?.uid;

  const [customerName, setCustomerName] = useState(
    currentUserProfile?.fullName || currentUser?.displayName || 'Valued Customer'
  );
  const [shippingAddress, setShippingAddress] = useState(
    currentUserProfile?.billingAddress
      ? `${currentUserProfile.billingAddress.street}, ${currentUserProfile.billingAddress.city}`
      : '123 Main Street, Suite 400, New York, NY 10001'
  );
  const [paymentMethod] = useState<'Credit Card' | 'Cash on Delivery' | 'Digital Wallet'>('Credit Card');
  const [submitting, setSubmitting] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleCardNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleExpiryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  const handleCvvInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(raw);
  };

  const unitPrice = parseFloat(String(directProduct.pricing).replace(/[^0-9.]/g, '')) || 0;
  const subtotal = unitPrice * directQuantity;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;

    const cleanCardNum = cardNumber.replace(/\s+/g, '');
    if (cleanCardNum.length < 15) {
      alert('Please enter a valid 15 or 16-digit Card Number');
      return;
    }
    if (expiry.length < 5) {
      alert('Please enter a valid Expiry Date (MM/YY)');
      return;
    }
    if (cvv.length < 3) {
      alert('Please enter a valid 3 or 4-digit CVV');
      return;
    }

    setSubmitting(true);

    try {
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const orderData: OrderItem = {
        id: orderId,
        items: [
          {
            productId: directProduct.id || 'prod',
            title: directProduct.title,
            photo: directProduct.photo || DEFAULT_PRODUCT_PHOTO,
            pricing: unitPrice,
            quantity: directQuantity
          }
        ],
        totalAmount: parseFloat(total.toFixed(2)),
        customerName: customerName.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod,
        status: 'Confirmed',
        createdAt: serverTimestamp()
      };

      const orderDocRef = doc(db, 'users', uid, 'orders', orderId);
      await setDoc(orderDocRef, orderData);

      logActivity({
        action: 'CREATE',
        category: 'Shopping',
        title: `Placed Order #${orderId.slice(-6)} for "${directProduct.title}"`,
        details: `Total: ₱${total.toFixed(2)} | Qty: ${directQuantity} | Payment: ${paymentMethod}`,
        section: 'Shopping',
        userId: uid,
        userEmail: currentUser?.email || undefined,
        status: 'success'
      }).catch(() => {});

      onSuccess(orderData);
    } catch (err) {
      console.warn('Firestore order placement failed, saved locally:', err);
      const orderData: OrderItem = {
        id: `ord_${Date.now()}`,
        items: [
          {
            productId: directProduct.id || 'prod',
            title: directProduct.title,
            photo: directProduct.photo || DEFAULT_PRODUCT_PHOTO,
            pricing: unitPrice,
            quantity: directQuantity
          }
        ],
        totalAmount: parseFloat(total.toFixed(2)),
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      };
      try {
        const raw = localStorage.getItem(`dmm_local_orders_${uid}`);
        const existing = raw ? JSON.parse(raw) : [];
        localStorage.setItem(`dmm_local_orders_${uid}`, JSON.stringify([orderData, ...existing]));
      } catch {}
      onSuccess(orderData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CreditCard size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                  Checkout
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 flex items-center gap-1">
                  <Lock size={10} /> Require Credit Card
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                A valid credit card is required to place this order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-center gap-3">
            <div className="w-14 h-14 aspect-square rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
              <img
                src={directProduct.photo || DEFAULT_PRODUCT_PHOTO}
                alt={directProduct.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {directProduct.title}
              </h4>
              <p className="text-xs text-zinc-500">
                ₱{unitPrice.toFixed(2)} × {directQuantity} unit{directQuantity > 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              ₱{subtotal.toFixed(2)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Customer Name
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
              <Truck size={13} className="text-zinc-500" />
              <span>Shipping Address</span>
            </label>
            <textarea
              required
              rows={2}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-2.5 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5 uppercase tracking-wide">
                <CreditCard size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span>Credit Card Details</span>
                <span className="text-rose-500 font-black">*</span>
              </label>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white uppercase tracking-wider">
                Required
              </span>
            </div>

            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">
              Payments are securely processed. Credit Card is required for checkout.
            </p>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">Card Number</span>
                <div className="flex gap-1 text-[8.5px] font-black text-zinc-400 dark:text-zinc-500">
                  <span>VISA</span> • <span>MC</span> • <span>AMEX</span> • <span>DISC</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={handleCardNumberInput}
                  placeholder="1234 5678 9012 3456"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono tracking-wider bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
                <CreditCard
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">Expiry Date</span>
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={handleExpiryInput}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-3 py-2 text-xs font-mono text-center bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">CVV</span>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={cvv}
                    onChange={handleCvvInput}
                    placeholder="123"
                    maxLength={4}
                    className="w-full pl-3 pr-8 py-2 text-xs font-mono text-center bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  />
                  <Lock
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Estimated Tax (8%)</span>
              <span>₱{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Shipping</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-1.5 flex justify-between font-black text-zinc-900 dark:text-zinc-100 text-sm">
              <span>Total</span>
              <span className="text-emerald-600 dark:text-emerald-400">₱{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Confirming Order...</span>
              </>
            ) : (
              <>
                <Check size={15} />
                <span>Confirm & Place Order (₱{total.toFixed(2)})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PagesEventsManager({
  type,
  currentUser,
  currentUserProfile,
  onActionNotice,
  onSelectTier,
  onRefreshData,
  quotaCounts,
  activeTier
}: PagesEventsManagerProps) {
  const isPages = type === 'Pages';
  const isEvents = type === 'Events';
  const isProducts = type === 'Products';
  const activeColName = isProducts ? 'products' : (isPages ? 'pages' : 'events');
  const deletedColName = isProducts ? 'deleted_product' : (isPages ? 'pages_deleted' : 'events_deleted');

  const [items, setItems] = useState<any[]>([]);
  const [deletedItems, setDeletedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [selectedViewItem, setSelectedViewItem] = useState<any | null>(null);
  const [visibilityModalItem, setVisibilityModalItem] = useState<any | null>(null);

  // Active dropdown menu ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    const catKey = isPages ? 'pages' : 'events';
    if (isQuotaLimitExceeded(quotaCounts, activeTier, catKey)) {
      const resetDate = getQuotaResetDate();
      const formattedDate = resetDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const formattedTime = resetDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      onActionNotice(`Quota Limit Exceeded. Please upgrade your plan or reset the quota on ${formattedDate} at ${formattedTime}.`);
      return;
    }
    setItemToEdit(null);
    setShowCreateModal(true);
  };

  // Load items from Firestore
  const fetchItems = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const colRef = collection(db, 'users', currentUser.uid, activeColName);
      const snap = await getDocs(colRef);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(list);
    } catch (err: any) {
      console.warn('Failed to load cloud items:', err);
      // Fallback to local storage if permission denied or offline
      try {
        const raw = localStorage.getItem(`dmm_local_${activeColName}_${currentUser.uid}`);
        if (raw) setItems(JSON.parse(raw));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedItems = async () => {
    if (!currentUser) return;
    try {
      const colRef = collection(db, 'users', currentUser.uid, deletedColName);
      const snap = await getDocs(colRef);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDeletedItems(list);
    } catch (err: any) {
      console.warn('Failed to load deleted cloud items:', err);
      try {
        const raw = localStorage.getItem(`dmm_local_${deletedColName}_${currentUser.uid}`);
        if (raw) setDeletedItems(JSON.parse(raw));
      } catch {}
    }
  };

  useEffect(() => {
    fetchItems();
    fetchDeletedItems();
  }, [type, currentUser?.uid]);

  // Click outside to dismiss more menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.card-more-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Delete / Trash Action
  const handleMoveToTrash = async (item: any) => {
    setActiveMenuId(null);
    if (!currentUser) return;
    const itemToTrash = {
      ...item,
      deletedAt: new Date().toISOString(),
      isDeleted: true
    };

    try {
      // 1. Write to deleted collection
      const delDocRef = doc(db, 'users', currentUser.uid, deletedColName, item.id);
      await setDoc(delDocRef, { ...itemToTrash, deletedAt: serverTimestamp() }, { merge: true });

      // 2. Delete from active collection
      await deleteDoc(doc(db, 'users', currentUser.uid, activeColName, item.id));
    } catch (err) {
      console.warn('Firestore error moving to trash:', err);
    }

    // Log Deletion
    logActivity({
      action: 'DELETE',
      category: isPages ? 'Pages' : 'Events',
      title: `Moved ${isPages ? 'Page' : 'Event'} "${item.title || 'Item'}" to Trash`,
      details: `Scheduled for permanent deletion in 100 days`,
      section: isPages ? 'Pages' : 'Events',
      userId: currentUser.uid,
      userEmail: currentUser.email || undefined,
      status: 'warning'
    }).catch(() => {});

    // Update local state
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setDeletedItems((prev) => [itemToTrash, ...prev.filter((i) => i.id !== item.id)]);

    try {
      const curList = items.filter((i) => i.id !== item.id);
      localStorage.setItem(`dmm_local_${activeColName}_${currentUser.uid}`, JSON.stringify(curList));
    } catch {}

    onActionNotice(`Deleted ${isPages ? 'Page' : 'Event'} "${item.title || 'Item'}".`);
    if (onRefreshData) onRefreshData();
  };

  // Restore from Trash
  const handleRestoreItem = async (item: any) => {
    if (!currentUser) return;
    const itemToRestore = {
      ...item,
      isDeleted: false,
      restoredAt: new Date().toISOString()
    };
    delete itemToRestore.deletedAt;

    try {
      const activeDocRef = doc(db, 'users', currentUser.uid, activeColName, item.id);
      await setDoc(activeDocRef, { ...itemToRestore, restoredAt: serverTimestamp() }, { merge: true });

      await deleteDoc(doc(db, 'users', currentUser.uid, deletedColName, item.id));
    } catch (err) {
      console.warn('Firestore error restoring item:', err);
    }

    setDeletedItems((prev) => prev.filter((i) => i.id !== item.id));
    setItems((prev) => [itemToRestore, ...prev.filter((i) => i.id !== item.id)]);

    onActionNotice(`${isPages ? 'Page' : 'Event'} "${item.title || 'Item'}" restored successfully!`);
    if (onRefreshData) onRefreshData();
  };

  // Permanent Delete
  const handlePermanentDelete = async (item: any) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, deletedColName, item.id));
    } catch (err) {
      console.warn('Firestore permanent delete error:', err);
    }

    setDeletedItems((prev) => prev.filter((i) => i.id !== item.id));
    onActionNotice(`${isPages ? 'Page' : 'Event'} permanently deleted.`);
  };

  // Toggle Remind Me for Event
  const handleToggleReminder = async (item: any) => {
    if (!currentUser) return;
    const nextState = !item.isReminded;
    const updated = { ...item, isReminded: nextState };

    try {
      const docRef = doc(db, 'users', currentUser.uid, 'events', item.id);
      await setDoc(docRef, { isReminded: nextState }, { merge: true });
    } catch (err) {
      console.warn('Failed to update reminder in Firestore:', err);
    }

    // Log Reminder Toggle
    logActivity({
      action: 'STATUS_CHANGE',
      category: 'Events',
      title: `${nextState ? 'Set' : 'Removed'} reminder for Event "${item.title}"`,
      details: `${item.startDate || ''} ${item.startTime || ''}`,
      section: 'Events',
      userId: currentUser.uid,
      userEmail: currentUser.email || undefined,
      status: 'info'
    }).catch(() => {});

    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    if (selectedViewItem?.id === item.id) {
      setSelectedViewItem(updated);
    }

    if (nextState) {
      onActionNotice(`Reminder set for "${item.title}" (${item.startDate} at ${item.startTime})!`);
    } else {
      onActionNotice(`Reminder canceled for "${item.title}".`);
    }
  };

  // Quick Visibility Update
  const handleSaveVisibility = async (itemId: string, newVisibility: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'users', currentUser.uid, activeColName, itemId);
      await setDoc(docRef, { visibility: newVisibility, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.warn('Failed to update visibility in Firestore:', err);
    }

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, visibility: newVisibility } : i))
    );
    if (selectedViewItem?.id === itemId) {
      setSelectedViewItem((prev: any) => ({ ...prev, visibility: newVisibility }));
    }
    setVisibilityModalItem(null);
    onActionNotice(`Visibility updated to "${newVisibility}" for ${isPages ? 'Page' : 'Event'}.`);
  };

  const filteredItems = items.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.title?.toLowerCase().includes(q) ||
      it.description?.toLowerCase().includes(q) ||
      it.visibility?.toLowerCase().includes(q) ||
      it.username?.toLowerCase().includes(q) ||
      it.pageUsername?.toLowerCase().includes(q) ||
      it.creatorUsername?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
      {/* Top Section Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200/90 dark:border-zinc-800 px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center font-bold shadow-2xs">
              {isPages ? <Layers size={17} /> : <Calendar size={17} />}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                {isPages ? 'Pages' : 'Events'}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {isPages
                  ? 'Manage your custom workspace pages, publication statuses, and linked media'
                  : 'Organize schedule timelines, public broadcasts, and live gatherings'}
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons & Search: Responsive for Mobile, Tablet, and Desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          {/* Search bar: Visible & responsive across all screen sizes */}
          <div className="relative w-full sm:w-48 md:w-56 shrink-0">
            <input
              type="text"
              placeholder={`Search ${isPages ? 'pages' : 'events'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 min-h-[44px] sm:min-h-0"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 cursor-pointer"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0">
            <button
              type="button"
              id={`btn-deleted-${type.toLowerCase()}`}
              onClick={() => {
                fetchDeletedItems();
                setShowDeletedModal(true);
              }}
              className="w-full sm:w-auto px-3.5 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs min-h-[44px] whitespace-nowrap"
            >
              <Trash2 size={14} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
              <span className="truncate">Deleted {isPages ? 'Pages' : 'Events'}</span>
              {deletedItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 shrink-0">
                  {deletedItems.length}
                </span>
              )}
            </button>

            <button
              type="button"
              id={`btn-create-${type.toLowerCase()}`}
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto px-4 py-2 text-xs font-black rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98 min-h-[44px] whitespace-nowrap"
            >
              <Plus size={15} className="shrink-0" />
              <span className="truncate">Create {isPages ? 'Page' : 'Event'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-zinc-400" />
            <p className="text-xs text-zinc-500 font-medium">Loading {type.toLowerCase()}...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Blank Page / Empty State */
          <div className="h-full min-h-[380px] flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl text-center max-w-2xl mx-auto shadow-2xs">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mb-4 shadow-inner">
              {isPages ? <Layers size={32} /> : (isEvents ? <Calendar size={32} /> : <ShoppingCart size={32} />)}
            </div>
            <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50">
              No {isPages ? 'Pages' : (isEvents ? 'Events' : 'Products')} Created Yet
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mt-1.5 leading-relaxed">
              {isPages
                ? 'Create a custom page to group your Videos, Shorts, Showbiz News, Photos, Polls, and Quizzes in one organized space.'
                : (isEvents ? 'Schedule a public or private event to keep your community updated with upcoming live sessions and announcements.' 
                            : 'Create a product listing to showcase items for sale to your community.')}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="mt-6 px-5 py-2.5 text-xs font-black rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-200 transition-all cursor-pointer flex items-center gap-2 shadow-xs active:scale-98"
            >
              <Plus size={16} />
              <span>Create Your First {isPages ? 'Page' : (isEvents ? 'Event' : 'Product')}</span>
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <motion.div
            key={`${type}-${searchQuery}`}
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.04,
                  delayChildren: 0.02
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
          >
            {filteredItems.map((item) => {
              const isEvent = !isPages;
              const isPublished = item.visibility === 'Published' || item.visibility === 'Public';

              return (
                <motion.div
                  key={item.id}
                  id={`card-${item.id}`}
                  variants={{
                    hidden: { opacity: 0, y: 14, scale: 0.98 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.28,
                        ease: [0.22, 1, 0.36, 1]
                      }
                    }
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col group relative"
                >
                  {/* Cover Photo Header */}
                  <div className="relative h-44 bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                    <img
                      src={
                        item.coverPhoto ||
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'
                      }
                      alt={item.title || 'Cover'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                    {/* Visibility Badge */}
                    <div className="absolute top-3 left-3">
                      <button
                        type="button"
                        onClick={() => setVisibilityModalItem(item)}
                        title="Click to change visibility"
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-2xs transition-transform hover:scale-105 cursor-pointer ${
                          isPublished
                            ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
                            : 'bg-zinc-800/90 text-zinc-200 border border-zinc-600/40'
                        }`}
                      >
                        {isPublished ? <Globe size={11} /> : <Lock size={11} />}
                        <span>{item.visibility || (isPages ? 'Published' : 'Public')}</span>
                      </button>
                    </div>

                    {/* More Menu Button */}
                    <div className="absolute top-3 right-3 card-more-menu-container">
                      <button
                        type="button"
                        id={`btn-menu-${item.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div className="absolute right-0 top-9 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setItemToEdit(item);
                              setShowCreateModal(true);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Edit size={14} className="text-zinc-500 dark:text-zinc-400" />
                            <span>Edit {isPages ? 'Page' : 'Event'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setVisibilityModalItem(item);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Globe size={14} className="text-zinc-500 dark:text-zinc-400" />
                            <span>Change Visibility</span>
                          </button>
                          <div className="my-1 border-t border-zinc-100 dark:border-zinc-700" />
                          <button
                            type="button"
                            onClick={() => handleMoveToTrash(item)}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                            <span>Delete {isPages ? 'Pages' : 'Events'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Event Timing Banner overlay */}
                    {isEvent && (
                      <div className="absolute bottom-2.5 left-3 right-3 text-white text-[11px] font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          <Calendar size={12} className="text-amber-400" />
                          {item.startDate || 'TBA'}
                        </span>
                        <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          <Clock size={12} className="text-amber-400" />
                          {item.startTime || 'TBA'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-1">
                        <HighlightText text={item.title || 'Untitled'} query={searchQuery} />
                      </h3>

                      {/* Username Handle Badge */}
                      <div className="flex items-center gap-1.5 text-xs mt-1 mb-1 flex-wrap">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                          <AtSign size={12} className="shrink-0" />
                          <span>
                            {item.username ||
                              item.pageUsername ||
                              (item.title
                                ? item.title.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 30)
                                : 'page')}
                          </span>
                        </span>
                        {item.creatorUsername && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate">
                            &bull; by @{item.creatorUsername.replace(/^@/, '')}
                          </span>
                        )}
                      </div>

                      {/* Tag Badges / Pricing for Shopping */}
                      {isProducts ? (
                        <div className="mt-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                             <Tag size={12} />
                             ₱{parseFloat(item.pricing || '0').toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </span>
                        </div>
                      ) : (
                        Array.isArray(item.tags) && item.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mt-1.5 mb-1">
                            {item.tags.slice(0, 3).map((tag: string) => {
                              const style = getTagStyle(tag);
                              return (
                                <span
                                  key={tag}
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-2xs ${style.bg} ${style.text} ${style.border}`}
                                >
                                  #{tag}
                                </span>
                              );
                            })}
                            {item.tags.length > 3 && (
                              <span className="text-[10px] font-bold text-zinc-400">
                                +{item.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )
                      )}


                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed min-h-[32px]">
                        {item.description || 'No description provided.'}
                      </p>

                      {/* Event Date Range detailed info */}
                      {isEvent && (
                        <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 text-[11px] space-y-1 text-zinc-600 dark:text-zinc-400">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-700 dark:text-zinc-300">Starts:</span>
                            <span>{item.startDate} at {item.startTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-700 dark:text-zinc-300">Ends:</span>
                            <span>{item.endDate} at {item.endTime}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: View & Remind Me */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                      <button
                        type="button"
                        id={`btn-view-${item.id}`}
                        onClick={() => setSelectedViewItem(item)}
                        className="flex-1 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
                      >
                        <Eye size={14} />
                        <span>View {isPages ? 'Page' : 'Event'}</span>
                      </button>

                      {isEvent && (
                        <button
                          type="button"
                          id={`btn-remind-${item.id}`}
                          onClick={() => handleToggleReminder(item)}
                          className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 active:scale-98 ${
                            item.isReminded
                              ? 'bg-amber-500 text-zinc-950 border-amber-600 font-extrabold shadow-2xs'
                              : 'bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-2xs'
                          }`}
                          title={item.isReminded ? 'Reminder set' : 'Remind me of this event'}
                        >
                          {item.isReminded ? (
                            <>
                              <BellRing size={14} className="text-zinc-950 animate-bounce" />
                              <span>Reminded</span>
                            </>
                          ) : (
                            <>
                              <Bell size={14} />
                              <span>Remind Me</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showCreateModal && (
        <CreateEditItemModal
          type={type}
          itemToEdit={itemToEdit}
          existingItems={items}
          currentUser={currentUser}
          currentUserProfile={currentUserProfile}
          quotaCounts={quotaCounts}
          activeTier={activeTier}
          onSelectTier={onSelectTier}
          onClose={() => {
            setShowCreateModal(false);
            setItemToEdit(null);
          }}
          onSuccess={(savedItem, isEdit) => {
            setShowCreateModal(false);
            setItemToEdit(null);
            if (isEdit) {
              setItems((prev) => prev.map((i) => (i.id === savedItem.id ? savedItem : i)));
              onActionNotice(`${isPages ? 'Page' : 'Event'} "${savedItem.title}" updated successfully!`);
            } else {
              setItems((prev) => [savedItem, ...prev]);
              onActionNotice(`${isPages ? 'Page' : 'Event'} "${savedItem.title}" created successfully in Firestore!`);
            }
            if (onRefreshData) onRefreshData();
          }}
        />
      )}

      {/* VISIBILITY CHANGE POPUP */}
      {visibilityModalItem && (
        <VisibilityChangeModal
          type={type}
          item={visibilityModalItem}
          onClose={() => setVisibilityModalItem(null)}
          onSave={(newVisibility) => handleSaveVisibility(visibilityModalItem.id, newVisibility)}
        />
      )}

      {/* VIEW PAGE / EVENT MODAL WITH CONTENT TABS */}
      {selectedViewItem && (
        <ViewItemDetailModal
          type={type}
          item={selectedViewItem}
          currentUser={currentUser}
          currentUserProfile={currentUserProfile}
          onClose={() => setSelectedViewItem(null)}
          onEdit={() => {
            const it = selectedViewItem;
            setSelectedViewItem(null);
            setItemToEdit(it);
            setShowCreateModal(true);
          }}
          onToggleReminder={() => handleToggleReminder(selectedViewItem)}
          onOpenVisibility={() => {
            const it = selectedViewItem;
            setVisibilityModalItem(it);
          }}
          onActionNotice={onActionNotice}
          onRefreshData={onRefreshData}
        />
      )}

      {/* DELETED PAGES / EVENTS MODAL */}
      {showDeletedModal && (
        <DeletedItemsModal
          type={type}
          items={deletedItems}
          onClose={() => setShowDeletedModal(false)}
          onRestore={handleRestoreItem}
          onPermanentDelete={handlePermanentDelete}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENT: CREATE / EDIT MODAL
// -------------------------------------------------------------
interface CreateEditItemModalProps {
  type: 'Pages' | 'Events' | 'Shopping' | 'Products';
  itemToEdit?: any;
  existingItems?: any[];
  currentUser: FirebaseUser;
  currentUserProfile?: UserProfile | null;
  quotaCounts?: {
    videos: number;
    news: number;
    photos: number;
    polls: number;
    quiz: number;
    pages: number;
    events: number;
    products?: number;
  };
  activeTier?: QuotaTierName;
  onClose: () => void;
  onSelectTier?: () => void;
  onSuccess: (savedItem: any, isEdit: boolean) => void;
}

function CreateEditItemModal({
  type,
  itemToEdit,
  existingItems = [],
  currentUser,
  currentUserProfile,
  quotaCounts,
  activeTier,
  onClose,
  onSelectTier,
  onSuccess
}: CreateEditItemModalProps) {
  const isPages = type === 'Pages';
  const isProducts = type === 'Products';
  const isEditing = Boolean(itemToEdit);
  const activeColName = isProducts ? 'products' : (isPages ? 'pages' : 'events');

  const [pricing, setPricing] = useState<string>(itemToEdit?.pricing ? String(itemToEdit.pricing) : '10.00');

  const effectiveCreatorUsername =
    currentUserProfile?.username ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'user');
  const creatorDisplayName =
    currentUserProfile?.fullName ||
    currentUser?.displayName ||
    effectiveCreatorUsername;

  const defaultCoverPlaceholder = isPages
    ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80';

  const [title, setTitle] = useState(itemToEdit?.title || '');
  const [pageUsername, setPageUsername] = useState<string>(() => {
    if (itemToEdit?.username) return itemToEdit.username.replace(/^@/, '');
    if (itemToEdit?.pageUsername) return itemToEdit.pageUsername.replace(/^@/, '');
    if (itemToEdit?.title) {
      return itemToEdit.title.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 30);
    }
    return '';
  });
  const [isUsernameCustomized, setIsUsernameCustomized] = useState<boolean>(
    Boolean(itemToEdit?.username || itemToEdit?.pageUsername)
  );

  // Duplicate checks against other items (excluding the one being edited)
  const otherItems = (existingItems || []).filter((it: any) => it.id !== itemToEdit?.id);

  const trimmedTitle = title.trim();
  const isTitleDuplicate = Boolean(
    trimmedTitle &&
    otherItems.some(
      (it: any) => (it.title || '').trim().toLowerCase() === trimmedTitle.toLowerCase()
    )
  );

  const cleanUsername = pageUsername.trim().toLowerCase().replace(/^@/, '');
  const isUsernameDuplicate = Boolean(
    cleanUsername &&
    otherItems.some((it: any) => {
      const existingHandle = (it.username || it.pageUsername || '').trim().toLowerCase().replace(/^@/, '');
      return existingHandle === cleanUsername;
    })
  );
  const [description, setDescription] = useState(itemToEdit?.description || '');
  const [coverPhoto, setCoverPhoto] = useState<string>(
    itemToEdit?.coverPhoto || defaultCoverPlaceholder
  );
  const [visibility, setVisibility] = useState<string>(
    itemToEdit?.visibility || (isPages ? 'Published' : 'Public')
  );
  const [tags, setTags] = useState<string[]>(Array.isArray(itemToEdit?.tags) ? itemToEdit.tags : []);

  // Events fields
  const [startDate, setStartDate] = useState(
    itemToEdit?.startDate || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(itemToEdit?.startTime || '09:00');
  const [endDate, setEndDate] = useState(
    itemToEdit?.endDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [endTime, setEndTime] = useState(itemToEdit?.endTime || '18:00');

  // Cover photo upload states
  const [coverUploadMode, setCoverUploadMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [coverFileName, setCoverFileName] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Curated presets for quick styling
  const coverPresets = isPages
    ? [
        { label: 'Creative Studio', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80' },
        { label: 'Tech & Code', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80' },
        { label: 'Abstract Wave', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80' },
        { label: 'Dark Modern', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80' }
      ]
    : [
        { label: 'Live Stage Gala', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80' },
        { label: 'Concert Festival', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80' },
        { label: 'Tech Summit', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80' },
        { label: 'Celebration', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&auto=format&fit=crop&q=80' }
      ];

  const processImageFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file);
      setCoverPhoto(dataUrl);
      setCoverFileName(file.name);
    } catch (err: any) {
      setError('Failed to process image file. Please try another image.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setCoverPhoto(urlInput.trim());
      setCoverFileName('External Image URL');
      setUrlInput('');
      setCoverUploadMode('upload');
    }
  };

  const handleSelectPreset = (presetUrl: string, label: string) => {
    setCoverPhoto(presetUrl);
    setCoverFileName(`Preset: ${label}`);
    setCoverUploadMode('upload');
  };

  const handleResetCover = () => {
    setCoverPhoto(defaultCoverPlaceholder);
    setCoverFileName('');
    setUrlInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedTitle) {
      setError(`Please provide a ${isPages ? 'Page Name' : 'Event Title'}.`);
      return;
    }

    if (!cleanUsername) {
      setError(`Please provide a ${isPages ? 'Page Username' : 'Handle'}.`);
      return;
    }

    if (isTitleDuplicate) {
      setError(`The ${isPages ? 'Page Name' : 'Event Title'} "${trimmedTitle}" already exists. Please choose a unique name.`);
      return;
    }

    if (isUsernameDuplicate) {
      setError(`The Username handle "@${cleanUsername}" already exists. Please choose a different username.`);
      return;
    }

    if (!isEditing) {
      const catKey = isPages ? 'pages' : 'events';
      if (isQuotaLimitExceeded(quotaCounts, activeTier, catKey)) {
        const resetDate = getQuotaResetDate();
        const formattedDate = resetDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const formattedTime = resetDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        setError(`Quota Limit Exceeded. Please upgrade your plan or reset the quota on ${formattedDate} at ${formattedTime}.`);
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      // Check latest Firestore documents for duplicate Page Name and Username
      try {
        const colRef = collection(db, 'users', currentUser.uid, activeColName);
        const snap = await getDocs(colRef);
        const cloudDocs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((d: any) => d.id !== itemToEdit?.id);

        const isCloudTitleDup = cloudDocs.some(
          (d: any) => (d.title || '').trim().toLowerCase() === trimmedTitle.toLowerCase()
        );
        if (isCloudTitleDup) {
          setSaving(false);
          setError(`The ${isPages ? 'Page Name' : 'Event Title'} "${trimmedTitle}" already exists. Please choose a unique name.`);
          return;
        }

        const isCloudUsernameDup = cloudDocs.some((d: any) => {
          const h = (d.username || d.pageUsername || '').trim().toLowerCase().replace(/^@/, '');
          return h === cleanUsername;
        });
        if (isCloudUsernameDup) {
          setSaving(false);
          setError(`The Username handle "@${cleanUsername}" already exists. Please choose a different username.`);
          return;
        }
      } catch (queryErr) {
        console.warn('Firestore uniqueness check query error:', queryErr);
      }

      const docId = itemToEdit?.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const resolvedPageUsername = (
        pageUsername.trim() ||
        title.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 30) ||
        'page'
      ).replace(/^@/, '');

      let payload: any = {};
      if (isProducts) {
        payload = {
          id: docId,
          title: title.trim(),
          description: description.trim(),
          photo: coverPhoto.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
          pricing: pricing.trim() || '10.00',
          tags: tags,
          visibility: visibility,
          createdAt: itemToEdit?.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        };
      } else {
        const resolvedPageUsername = (
          pageUsername.trim() ||
          title.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 30) ||
          'page'
        ).replace(/^@/, '');

        payload = {
          coverPhoto: coverPhoto.trim(),
          title: title.trim(),
          username: resolvedPageUsername,
          pageUsername: resolvedPageUsername,
          creatorUsername: effectiveCreatorUsername.replace(/^@/, ''),
          creatorDisplayName: creatorDisplayName,
          description: description.trim(),
          visibility: visibility,
          tags: tags,
          createdAt: itemToEdit?.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        if (!isPages) {
          payload = {
            ...payload,
            startDate: startDate || '',
            startTime: startTime || '',
            endDate: endDate || '',
            endTime: endTime || '',
            eventLocation: title.trim(),
            isReminded: itemToEdit?.isReminded || false
          };
        } else {
          payload.pageLocation = title.trim();
        }
      }

      const safePayload = await optimizePayloadForFirestore(payload);

      // Save to Firestore
      const docRef = doc(db, 'users', currentUser.uid, activeColName, docId);
      await setDoc(docRef, safePayload, { merge: true });

      // Log Create / Update
      logActivity({
        action: isEditing ? 'UPDATE' : 'CREATE',
        category: isPages ? 'Pages' : 'Events',
        title: `${isEditing ? 'Updated' : 'Created'} ${isPages ? 'Page' : 'Event'} "${title.trim()}"`,
        details: `Visibility: ${visibility}${!isPages && startDate ? ` | Starts: ${startDate} ${startTime}` : ''}`,
        section: isPages ? 'Pages' : 'Events',
        userId: currentUser.uid,
        userEmail: currentUser.email || undefined,
        status: 'success',
        metadata: {
          id: docId,
          type: isPages ? 'page' : 'event',
          visibility
        }
      }).catch(() => {});

      const finalItem = { id: docId, ...payload };
      onSuccess(finalItem, isEditing);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save to Firestore. Please check permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-zinc-200 overflow-hidden my-auto flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-start sm:items-center justify-between bg-zinc-50/60 shrink-0 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              {isPages ? <Layers size={18} /> : <Calendar size={18} />}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-zinc-900 leading-tight truncate">
                {isEditing ? `Edit ${isPages ? 'Page' : 'Event'}` : `Create ${isPages ? 'Page' : 'Event'}`}
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5 line-clamp-1">
                Save your {isPages ? 'page layout' : 'scheduled event'} details directly to Firestore
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-2 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1">
          {/* Creator & Account Identity Card */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUserProfile?.photoURL ? (
                <img
                  src={currentUserProfile.photoURL}
                  alt="Creator Avatar"
                  className="w-8 h-8 rounded-full object-cover border border-zinc-200 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {(creatorDisplayName || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900 truncate flex items-center gap-1.5">
                  <span className="truncate">{creatorDisplayName}</span>
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    Admin
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
                  <AtSign size={11} className="text-zinc-400 shrink-0" />
                  <span className="text-indigo-600 font-extrabold">
                    {effectiveCreatorUsername.replace(/^@/, '')}
                  </span>
                  <span className="text-zinc-300">&bull;</span>
                  <span className="text-zinc-500 text-[10px]">Creator Account</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider block">Mode</span>
              <span className="text-[11px] font-bold text-zinc-700">{isEditing ? 'Editing' : 'Creating'}</span>
            </div>
          </div>

          {/* Cover Photo Upload & Selection */}
          <div className="space-y-2.5 p-3 sm:p-3.5 bg-zinc-50/80 rounded-2xl border border-zinc-200/90">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-zinc-600" />
                  <span>Cover Photo</span>
                </label>
                <span className="text-[10px] font-semibold text-zinc-400">
                  {isPages ? '1200x480' : '1200x600'}
                </span>
              </div>

              {/* Mode switch pills */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-200 w-full sm:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setCoverUploadMode('upload')}
                  className={`flex-1 sm:flex-initial px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap min-h-[32px] ${
                    coverUploadMode === 'upload'
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <UploadCloud size={12} className="shrink-0" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCoverUploadMode('url')}
                  className={`flex-1 sm:flex-initial px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap min-h-[32px] ${
                    coverUploadMode === 'url'
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Link2 size={12} className="shrink-0" />
                  <span>URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCoverUploadMode('presets')}
                  className={`flex-1 sm:flex-initial px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap min-h-[32px] ${
                    coverUploadMode === 'presets'
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Sparkles size={12} className="shrink-0" />
                  <span>Presets</span>
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Mode 1: Drag-and-Drop / File Upload Mode */}
            {coverUploadMode === 'upload' && (
              <div className="space-y-2">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
                    isDragging
                      ? 'border-zinc-900 bg-zinc-100 ring-2 ring-zinc-900/20'
                      : 'border-zinc-300 bg-white hover:border-zinc-400'
                  }`}
                >
                  {uploading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                      <Loader2 size={24} className="animate-spin text-zinc-800 mb-2" />
                      <p className="text-xs font-bold text-zinc-800">Processing & Optimizing Image...</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Compressing file for fast cloud delivery</p>
                    </div>
                  ) : coverPhoto ? (
                    <div className="relative group">
                      <img
                        src={coverPhoto}
                        alt="Product Preview"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-between p-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-400" />
                            <span>Product Photo Ready</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/90 hover:bg-white text-zinc-900 shadow-md transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Upload size={12} />
                              <span>Replace</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleResetCover}
                              className="p-1 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-lg transition-colors cursor-pointer"
                              title="Reset photo"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="text-white text-[11px] font-medium truncate drop-shadow-sm">
                          {coverFileName || 'Product Image'} &bull; 1:1 Aspect Ratio
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-64 flex flex-col items-center justify-center text-center p-4 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-600 mb-2 border border-zinc-200">
                        <UploadCloud size={22} />
                      </div>
                      <p className="text-xs font-bold text-zinc-800">
                        Click to upload or drag & drop product photo
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Recommended 1:1 aspect ratio. PNG, JPG, WebP, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Direct Image URL */}
            {coverUploadMode === 'url' && (
              <div className="space-y-2 bg-white p-3 rounded-xl border border-zinc-200">
                <label className="block text-[11px] font-semibold text-zinc-700">
                  Image Direct URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3.5 py-2 text-xs font-bold bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 cursor-pointer shrink-0 shadow-2xs"
                  >
                    Apply URL
                  </button>
                </div>
                {coverPhoto && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Current Preview
                    </p>
                    <img
                      src={coverPhoto}
                      alt="Cover Preview"
                      className="w-full h-24 object-cover rounded-lg border border-zinc-200"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Mode 3: Curated Presets */}
            {coverUploadMode === 'presets' && (
              <div className="space-y-2 bg-white p-3 rounded-xl border border-zinc-200">
                <p className="text-[11px] font-semibold text-zinc-700">
                  Choose a high-resolution curated cover
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {coverPresets.map((preset) => {
                    const isSelected = coverPhoto === preset.url;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleSelectPreset(preset.url, preset.label)}
                        className={`relative rounded-xl overflow-hidden border text-left group transition-all cursor-pointer ${
                          isSelected
                            ? 'border-zinc-900 ring-2 ring-zinc-900/30 shadow-xs'
                            : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-16 object-cover"
                        />
                        <div className="p-1.5 bg-zinc-50 text-[10px] font-bold text-zinc-800 truncate">
                          {preset.label}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-zinc-900 text-white p-0.5 rounded-full shadow-xs">
                            <Check size={10} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-800">
                {isProducts ? 'Product Title' : (isPages ? 'Page Title / Name' : 'Event Title')} <span className="text-rose-500">*</span>
              </label>
              {isTitleDuplicate ? (
                <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-pulse">
                  <AlertCircle size={12} />
                  <span>Already Exists</span>
                </span>
              ) : trimmedTitle.length >= 2 ? (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Available</span>
                </span>
              ) : null}
            </div>
            <input
              type="text"
              required
              placeholder={isProducts ? 'e.g. Wireless Noise Cancelling Headphones' : (isPages ? 'e.g. Primetime Studios Official' : 'e.g. Annual Creator Gala 2026')}
              value={title}
              onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                if (!isUsernameCustomized && !isEditing) {
                  const autoSlug = val
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, '_')
                    .replace(/_+/g, '_')
                    .replace(/^_|_$/g, '')
                    .slice(0, 30);
                  setPageUsername(autoSlug);
                }
              }}
              className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl text-zinc-900 focus:outline-none focus:ring-2 font-medium transition-colors ${
                isTitleDuplicate
                  ? 'border-rose-500 focus:ring-rose-500/30 bg-rose-50/20'
                  : trimmedTitle.length >= 2
                  ? 'border-emerald-500 focus:ring-emerald-500/30'
                  : 'border-zinc-300 focus:ring-zinc-900'
              }`}
            />
            {isTitleDuplicate && (
              <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Name already exists:</span> Another item named &ldquo;{trimmedTitle}&rdquo; already exists in your workspace. Please choose a different name.
                </div>
              </div>
            )}
          </div>

          {/* Pricing for Shopping */}
          {isProducts && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-800">
                Pricing (PHP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">₱</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. 499.00"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                />
              </div>
            </div>
          )}

          {/* Page Username / Handle */}
          {!isProducts && (
            <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <AtSign size={13} className="text-indigo-600" />
                <span>{isPages ? 'Page Username / Handle' : 'Event Handle'}</span>
                <span className="text-rose-500">*</span>
              </label>
              {isUsernameDuplicate ? (
                <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-pulse">
                  <AlertCircle size={12} />
                  <span>Already Taken</span>
                </span>
              ) : cleanUsername.length >= 2 ? (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Available</span>
                </span>
              ) : (
                <span className="text-[10px] text-zinc-400 font-medium">Vanity link & mention handle</span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs select-none">
                @
              </span>
              <input
                type="text"
                required
                placeholder={isPages ? 'primetime_studios' : 'annual_gala_2026'}
                value={pageUsername}
                onChange={(e) => {
                  const cleaned = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, '')
                    .slice(0, 30);
                  setPageUsername(cleaned);
                  setIsUsernameCustomized(true);
                }}
                className={`w-full pl-8 pr-3.5 py-2.5 text-xs bg-white border rounded-xl text-zinc-900 focus:outline-none focus:ring-2 font-medium placeholder:text-zinc-400 transition-colors ${
                  isUsernameDuplicate
                    ? 'border-rose-500 focus:ring-rose-500/30 bg-rose-50/20'
                    : cleanUsername.length >= 2
                    ? 'border-emerald-500 focus:ring-emerald-500/30'
                    : 'border-zinc-300 focus:ring-zinc-900'
                }`}
              />
            </div>
            {isUsernameDuplicate ? (
              <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Username already taken:</span> Handle &ldquo;@{cleanUsername}&rdquo; is already in use by another {isPages ? 'page' : 'event'}. Please enter a unique username.
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
                <span>
                  Public handle: <strong className="text-indigo-600 font-bold">@{cleanUsername || 'username'}</strong>
                </span>
                <span className="text-[10px] text-zinc-400">
                  {cleanUsername.length}/30 characters
                </span>
              </div>
            )}
          </div>
          )}

          {/* Visibility Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-800">Visibility</label>
            {isPages ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('Published')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    visibility === 'Published'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <Globe size={14} />
                  <span>Publish Page</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('Unpublished')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    visibility === 'Unpublished'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <Lock size={14} />
                  <span>Unpublish Page</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('Public')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    visibility === 'Public'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <Globe size={14} />
                  <span>Public Event</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('Private')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    visibility === 'Private'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <Lock size={14} />
                  <span>Private Event</span>
                </button>
              </div>
            )}
          </div>

          {/* Event Timings (if Events) */}
          {!isPages && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
              <p className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <Calendar size={14} className="text-zinc-600 shrink-0" />
                <span>Event Schedule & Time Range</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-zinc-600">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 min-h-[38px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-zinc-600">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 min-h-[38px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-zinc-600">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 min-h-[38px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-zinc-600">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 min-h-[38px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-800">Description</label>
            <textarea
              rows={3}
              placeholder={
                isPages
                  ? 'Describe this page and its target community or show topic...'
                  : 'Describe this event, agenda, special guests, or schedule details...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
            />
          </div>

          {/* Tags / Labels */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
            <TagInput
              tags={tags}
              onChange={setTags}
              maxTags={QUOTA_TIERS[activeTier || 'Free']?.limits.tags ?? 20}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span className="leading-tight">{error}</span>
              </div>
              {(error.toLowerCase().includes('quota') || error.toLowerCase().includes('exceeded')) && onSelectTier && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectTier();
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs whitespace-nowrap flex items-center gap-1 active:scale-95"
                >
                  <Sparkles size={13} className="text-amber-300 shrink-0" />
                  <span>Upgrade Plan</span>
                </button>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3 shrink-0 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="w-full sm:w-auto sm:flex-1 py-2.5 px-4 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer min-h-[40px] flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || isTitleDuplicate || isUsernameDuplicate}
              className={`w-full sm:w-auto sm:flex-2 py-2.5 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs min-h-[40px] ${
                isTitleDuplicate || isUsernameDuplicate
                  ? 'bg-zinc-200 text-zinc-400 border border-zinc-300 cursor-not-allowed'
                  : 'text-white bg-zinc-900 hover:bg-zinc-800 active:bg-black cursor-pointer'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving to Firestore...</span>
                </>
              ) : isTitleDuplicate ? (
                <>
                  <AlertCircle size={15} className="text-rose-500" />
                  <span>{isPages ? 'Page Name' : 'Event Title'} Already Exists</span>
                </>
              ) : isUsernameDuplicate ? (
                <>
                  <AlertCircle size={15} className="text-rose-500" />
                  <span>Username Handle Already Taken</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Save {isPages ? 'Page' : 'Event'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENT: VISIBILITY CHANGE MODAL
// -------------------------------------------------------------
interface VisibilityChangeModalProps {
  type: 'Pages' | 'Events' | 'Shopping' | 'Products';
  item: any;
  onClose: () => void;
  onSave: (newVisibility: string) => void;
}

function VisibilityChangeModal({
  type,
  item,
  onClose,
  onSave
}: VisibilityChangeModalProps) {
  const isPages = type === 'Pages';
  const [selectedVisibility, setSelectedVisibility] = useState<string>(
    item.visibility || (isPages ? 'Published' : 'Public')
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-sm w-full shadow-2xl border border-zinc-200 overflow-hidden p-4 sm:p-6 space-y-4 my-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
              <Globe size={16} />
            </div>
            <h3 className="text-sm font-black text-zinc-900 truncate">
              Change {isPages ? 'Page' : 'Event'} Visibility
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-2 rounded-xl hover:bg-zinc-100 cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-zinc-500 font-medium">
          Select visibility status for <span className="font-bold text-zinc-800">"{item.title}"</span>:
        </p>

        {isPages ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectedVisibility('Published')}
              className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                selectedVisibility === 'Published'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe size={16} className="text-emerald-600" />
                <div className="text-left">
                  <div className="font-black">Publish Page</div>
                  <div className="text-[10px] text-zinc-500 font-normal">
                    Visible to everyone across the portal
                  </div>
                </div>
              </div>
              {selectedVisibility === 'Published' && <CheckCircle2 size={16} className="text-emerald-600" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedVisibility('Unpublished')}
              className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                selectedVisibility === 'Unpublished'
                  ? 'bg-zinc-900 text-white border-zinc-900 ring-2 ring-zinc-900/20'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Lock size={16} className={selectedVisibility === 'Unpublished' ? 'text-zinc-300' : 'text-zinc-500'} />
                <div className="text-left">
                  <div className="font-black">Unpublish Page</div>
                  <div className={`text-[10px] font-normal ${selectedVisibility === 'Unpublished' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Private draft state only you can see
                  </div>
                </div>
              </div>
              {selectedVisibility === 'Unpublished' && <CheckCircle2 size={16} className="text-white" />}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectedVisibility('Public')}
              className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                selectedVisibility === 'Public'
                  ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe size={16} className="text-blue-600" />
                <div className="text-left">
                  <div className="font-black">Public Event</div>
                  <div className="text-[10px] text-zinc-500 font-normal">
                    Discoverable on community feeds & search
                  </div>
                </div>
              </div>
              {selectedVisibility === 'Public' && <CheckCircle2 size={16} className="text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedVisibility('Private')}
              className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                selectedVisibility === 'Private'
                  ? 'bg-zinc-900 text-white border-zinc-900 ring-2 ring-zinc-900/20'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Lock size={16} className={selectedVisibility === 'Private' ? 'text-zinc-300' : 'text-zinc-500'} />
                <div className="text-left">
                  <div className="font-black">Private Event</div>
                  <div className={`text-[10px] font-normal ${selectedVisibility === 'Private' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Direct invitation and creator-only access
                  </div>
                </div>
              </div>
              {selectedVisibility === 'Private' && <CheckCircle2 size={16} className="text-white" />}
            </button>
          </div>
        )}

        <div className="pt-2 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(selectedVisibility)}
            className="flex-1 py-2 text-xs font-black text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENT: VIEW PAGE / VIEW EVENT DETAIL MODAL WITH TABS
// -------------------------------------------------------------
interface ViewItemDetailModalProps {
  type: 'Pages' | 'Events' | 'Shopping' | 'Products';
  item: any;
  currentUser: FirebaseUser;
  currentUserProfile?: UserProfile | null;
  onClose: () => void;
  onEdit: () => void;
  onToggleReminder: () => void;
  onOpenVisibility: () => void;
  onActionNotice?: (msg: string) => void;
  onRefreshData?: () => void;
}

const getDeleteLabel = (tab: SubTab): string => {
  switch (tab) {
    case 'Videos':
      return 'Delete Videos';
    case 'Shorts':
      return 'Delete Shorts';
    case 'Showbiz News':
      return 'Delete News';
    case 'Photos':
      return 'Delete Photos';
    case 'Polls':
      return 'Delete Polls';
    case 'Quizzes':
      return 'Delete Quiz';
    default:
      return 'Delete';
  }
};

function ViewItemDetailModal({
  type,
  item,
  currentUser,
  currentUserProfile,
  onClose,
  onEdit,
  onToggleReminder,
  onOpenVisibility,
  onActionNotice,
  onRefreshData
}: ViewItemDetailModalProps) {
  const isPages = type === 'Pages';
  const locationKey = isPages ? 'pageLocation' : 'eventLocation';
  const itemLocationValue = item[locationKey] || item.title;

  const [activeTab, setActiveTab] = useState<SubTab>('Videos');
  const [tabItems, setTabItems] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMediaMenuId, setActiveMediaMenuId] = useState<string | null>(null);
  const [selectedMediaDetail, setSelectedMediaDetail] = useState<any | null>(null);
  const [selectedShoppingItem, setSelectedShoppingItem] = useState<ProductItem | null>(null);
  const [checkoutShoppingProduct, setCheckoutShoppingProduct] = useState<{
    product: ProductItem;
    quantity: number;
  } | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Countdown timer tick effect for Events
  useEffect(() => {
    if (isPages) return;
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [isPages]);

  // Compute Days, Hours, Minutes, and Seconds countdown
  const countdownInfo = useMemo(() => {
    if (isPages || !item.startDate) return null;

    let startMs = 0;
    const startParts = (item.startDate || '').split('-');
    const startTimeParts = (item.startTime || '00:00').split(':');
    if (startParts.length === 3) {
      const year = parseInt(startParts[0], 10);
      const month = parseInt(startParts[1], 10) - 1;
      const day = parseInt(startParts[2], 10);
      const hours = parseInt(startTimeParts[0] || '0', 10);
      const minutes = parseInt(startTimeParts[1] || '0', 10);
      startMs = new Date(year, month, day, hours, minutes, 0).getTime();
    } else {
      startMs = new Date(`${item.startDate}T${item.startTime || '00:00'}`).getTime();
    }

    let endMs = 0;
    if (item.endDate) {
      const endParts = item.endDate.split('-');
      const endTimeParts = (item.endTime || '23:59').split(':');
      if (endParts.length === 3) {
        const year = parseInt(endParts[0], 10);
        const month = parseInt(endParts[1], 10) - 1;
        const day = parseInt(endParts[2], 10);
        const hours = parseInt(endTimeParts[0] || '23', 10);
        const minutes = parseInt(endTimeParts[1] || '59', 10);
        endMs = new Date(year, month, day, hours, minutes, 59).getTime();
      } else {
        endMs = new Date(`${item.endDate}T${item.endTime || '23:59'}`).getTime();
      }
    }

    if (isNaN(startMs)) return null;

    const now = currentTime;

    if (now < startMs) {
      const diff = Math.max(0, startMs - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        status: 'upcoming',
        days,
        hours,
        minutes,
        seconds,
        text: `Countdown Timer is ${days} Day${days !== 1 ? 's' : ''}, ${hours} Hour${hours !== 1 ? 's' : ''}, ${minutes} Minute${minutes !== 1 ? 's' : ''} and ${seconds} Second${seconds !== 1 ? 's' : ''}`
      };
    } else if (endMs && now < endMs) {
      const diff = Math.max(0, endMs - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        status: 'live',
        days,
        hours,
        minutes,
        seconds,
        text: `Countdown Timer is ${days} Day${days !== 1 ? 's' : ''}, ${hours} Hour${hours !== 1 ? 's' : ''}, ${minutes} Minute${minutes !== 1 ? 's' : ''} and ${seconds} Second${seconds !== 1 ? 's' : ''}`
      };
    } else {
      return {
        status: 'ended',
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        text: 'Countdown Timer is 0 Days, 0 Hours, 0 Minutes and 0 Seconds'
      };
    }
  }, [isPages, item.startDate, item.startTime, item.endDate, item.endTime, currentTime]);

  const handleAddToCart = (product: ProductItem, quantity: number) => {
    try {
      const pid = product.id || String(Date.now());
      const raw = localStorage.getItem('dmm_user_cart');
      const currentCart: CartItem[] = raw ? JSON.parse(raw) : [];
      const existingIdx = currentCart.findIndex((c) => c.productId === pid);
      if (existingIdx > -1) {
        currentCart[existingIdx].quantity += quantity;
      } else {
        currentCart.push({
          id: pid,
          productId: pid,
          title: product.title,
          photo: product.photo || '',
          pricing: product.pricing,
          quantity: quantity
        });
      }
      localStorage.setItem('dmm_user_cart', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('dmm-cart-updated'));
      onActionNotice?.(`Added "${product.title}" (${quantity}x) to your cart!`);
    } catch (err) {
      console.warn('Failed to add to cart:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.card-more-menu-container')) {
        setActiveMediaMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter tabItems based on title as the user types
  const filteredTabItems = tabItems.filter((mediaItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const title = (mediaItem.title || '').toLowerCase();
    return title.includes(q);
  });

  // Fetch content matching this page or event location
  useEffect(() => {
    const fetchLinkedContent = async () => {
      if (!currentUser) return;
      setTabLoading(true);
      let col = 'videos';
      if (activeTab === 'Shorts') col = 'shorts';
      if (activeTab === 'Showbiz News') col = 'showbizNews';
      if (activeTab === 'Photos') col = 'photos';
      if (activeTab === 'Polls') col = 'polls';
      if (activeTab === 'Quizzes') col = 'quiz';
      if (activeTab === 'Shopping') col = 'products';

      try {
        const colRef = collection(db, 'users', currentUser.uid, col);
        const snap = await getDocs(colRef);
        const allItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Match either by pageLocation/eventLocation matching item.title or matching item id
        const matched = allItems.filter((i: any) => {
          if (activeTab === 'Shopping') {
            if (isPages) {
              return (
                i.pageLocation === itemLocationValue ||
                i.pageLocation === item.title ||
                i.pageLocation === item.id ||
                (i.tags && Array.isArray(i.tags) && i.tags.includes(item.title))
              );
            } else {
              return (
                i.eventLocation === itemLocationValue ||
                i.eventLocation === item.title ||
                i.eventLocation === item.id ||
                (i.tags && Array.isArray(i.tags) && i.tags.includes(item.title))
              );
            }
          }
          if (isPages) {
            return (
              i.pageLocation === itemLocationValue ||
              i.pageLocation === item.title ||
              i.pageLocation === item.id
            );
          } else {
            return (
              i.eventLocation === itemLocationValue ||
              i.eventLocation === item.title ||
              i.eventLocation === item.id
            );
          }
        });
        setTabItems(matched);
      } catch (err) {
        console.warn('Failed to load linked media:', err);
        setTabItems([]);
      } finally {
        setTabLoading(false);
      }
    };

    fetchLinkedContent();
  }, [activeTab, itemLocationValue, item.title, item.id, currentUser?.uid, isPages]);

  const handleDeleteLinkedMedia = async (media: any) => {
    if (!currentUser || !media) return;
    setIsDeletingMedia(true);
    let col = 'videos';
    if (activeTab === 'Shorts') col = 'shorts';
    if (activeTab === 'Showbiz News') col = 'showbizNews';
    if (activeTab === 'Photos') col = 'photos';
    if (activeTab === 'Polls') col = 'polls';
    if (activeTab === 'Quizzes') col = 'quiz';
    if (activeTab === 'Shopping') col = 'products';
    const delCol = activeTab === 'Shopping' ? 'deleted_product' : `${col}_deleted`;
    const itemToTrash = {
      ...media,
      deletedAt: new Date().toISOString(),
      scheduledDays: 100,
      isDeleted: true
    };

    try {
      // 1. Move to deleted collection in Firestore
      const delDocRef = doc(db, 'users', currentUser.uid, delCol, media.id);
      await setDoc(delDocRef, { ...itemToTrash, deletedAt: serverTimestamp() }, { merge: true });

      // 2. Remove from active collection
      await deleteDoc(doc(db, 'users', currentUser.uid, col, media.id));
    } catch (err) {
      console.warn('Failed to delete media item:', err);
    }

    setTabItems((prev) => prev.filter((it) => it.id !== media.id));

    try {
      const cached = localStorage.getItem(`dmm_local_${col}_${currentUser.uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const filtered = parsed.filter((it: any) => it.id !== media.id);
        localStorage.setItem(`dmm_local_${col}_${currentUser.uid}`, JSON.stringify(filtered));
      }
    } catch {}

    const deleteLabel = getDeleteLabel(activeTab);
    if (onActionNotice) {
      onActionNotice(`Deleted ${activeTab === 'Quizzes' ? 'Quiz' : activeTab === 'Showbiz News' ? 'News' : activeTab} "${media.title || 'Item'}" from ${isPages ? 'Page' : 'Event'}.`);
    }
    if (onRefreshData) {
      onRefreshData();
    }
    setItemToDelete(null);
    setIsDeletingMedia(false);
  };

  const isPublished = item.visibility === 'Published' || item.visibility === 'Public';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh] my-auto">
        {/* Modal Header Cover */}
        <div className="relative h-44 sm:h-56 md:h-64 bg-zinc-900 shrink-0">
          <img
            src={
              item.coverPhoto ||
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'
            }
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center z-10"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Cover Overlay Info */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-6 sm:right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3">
            <div className="space-y-1 sm:space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={onOpenVisibility}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-2xs ${
                    isPublished ? 'bg-emerald-600/90 text-white' : 'bg-zinc-800/90 text-zinc-200'
                  }`}
                >
                  {isPublished ? <Globe size={11} /> : <Lock size={11} />}
                  <span>{item.visibility || (isPages ? 'Published' : 'Public')}</span>
                </button>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-black/60 text-indigo-300 border border-indigo-400/40 backdrop-blur-md flex items-center gap-1 shadow-2xs">
                  <AtSign size={10} />
                  <span>
                    {item.username ||
                      item.pageUsername ||
                      (item.title
                        ? item.title.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 30)
                        : 'page')}
                  </span>
                </span>

                {item.creatorUsername && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/50 text-zinc-300 backdrop-blur-md">
                    by @{item.creatorUsername.replace(/^@/, '')}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-2xl font-black leading-snug drop-shadow-sm line-clamp-2">
                {item.title}
              </h2>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={onEdit}
                className="px-3 py-1.5 rounded-xl bg-white text-zinc-900 text-xs font-bold shadow-md hover:bg-zinc-100 flex items-center gap-1.5 cursor-pointer min-h-[34px]"
              >
                <Edit size={13} />
                <span>Edit</span>
              </button>

              {!isPages && (
                <button
                  type="button"
                  onClick={onToggleReminder}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer min-h-[34px] ${
                    item.isReminded
                      ? 'bg-amber-500 text-zinc-950 font-black'
                      : 'bg-black/60 text-white hover:bg-black/80 backdrop-blur-md'
                  }`}
                >
                  {item.isReminded ? <BellRing size={13} /> : <Bell size={13} />}
                  <span>{item.isReminded ? 'Reminded' : 'Remind Me'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Description & Schedule Details */}
        <div className="p-3.5 sm:p-6 border-b border-zinc-200/80 bg-zinc-50/50 shrink-0">
          {(() => {
            const descriptionText = item.description || 'No description provided.';
            const isLongDescription = descriptionText.length > 120;

            return (
              <div className="space-y-1.5">
                <p
                  id="view-modal-description-text"
                  className="text-xs sm:text-sm text-zinc-600 leading-relaxed whitespace-pre-line line-clamp-2 sm:line-clamp-3"
                >
                  {descriptionText}
                </p>
                {isLongDescription && (
                  <button
                    type="button"
                    id="toggle-show-more-description-btn"
                    onClick={() => setShowFullDescription(true)}
                    className="inline-flex items-center text-xs font-bold text-zinc-900 hover:text-zinc-700 transition-colors cursor-pointer pt-0.5 min-h-[28px] focus:outline-none"
                  >
                    <span>Show More</span>
                  </button>
                )}

                {/* Full Description Popup Modal */}
                {showFullDescription && (
                  <div className="fixed inset-0 z-70 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200/80 space-y-4 my-auto flex flex-col max-h-[85vh]">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">
                          Full Description
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowFullDescription(false)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                          aria-label="Close description"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="overflow-y-auto pr-1 flex-1">
                        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed whitespace-pre-line text-left">
                          {descriptionText}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-zinc-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowFullDescription(false)}
                          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-2xs active:scale-98 transition-all"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {!isPages && (
            <div className="mt-3 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs font-semibold text-zinc-700">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-2xs">
                  <Calendar size={14} className="text-amber-600 shrink-0" />
                  <span>Starts: {item.startDate} ({item.startTime})</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-2xs">
                  <Clock size={14} className="text-rose-600 shrink-0" />
                  <span>Ends: {item.endDate} ({item.endTime})</span>
                </div>
              </div>

              {/* Live Countdown Timer (Days, Hours, Minutes and Seconds) */}
              {countdownInfo && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Clock size={16} className="animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                        {countdownInfo.status === 'upcoming'
                          ? 'Event Starts In'
                          : countdownInfo.status === 'live'
                          ? 'Event Live Now • Remaining Time'
                          : 'Event Status'}
                      </span>
                      <p className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                        {countdownInfo.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                    <div className="px-2 py-1 bg-white dark:bg-zinc-800 rounded-xl border border-amber-200/80 dark:border-zinc-700 text-center min-w-[44px] shadow-2xs">
                      <span className="block text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">{countdownInfo.days}</span>
                      <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-tight">Days</span>
                    </div>
                    <span className="font-bold text-amber-500 text-xs">:</span>
                    <div className="px-2 py-1 bg-white dark:bg-zinc-800 rounded-xl border border-amber-200/80 dark:border-zinc-700 text-center min-w-[44px] shadow-2xs">
                      <span className="block text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">{String(countdownInfo.hours).padStart(2, '0')}</span>
                      <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-tight">Hours</span>
                    </div>
                    <span className="font-bold text-amber-500 text-xs">:</span>
                    <div className="px-2 py-1 bg-white dark:bg-zinc-800 rounded-xl border border-amber-200/80 dark:border-zinc-700 text-center min-w-[44px] shadow-2xs">
                      <span className="block text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">{String(countdownInfo.minutes).padStart(2, '0')}</span>
                      <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-tight">Mins</span>
                    </div>
                    <span className="font-bold text-amber-500 text-xs">:</span>
                    <div className="px-2 py-1 bg-white dark:bg-zinc-800 rounded-xl border border-amber-200/80 dark:border-zinc-700 text-center min-w-[44px] shadow-2xs">
                      <span className="block text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">{String(countdownInfo.seconds).padStart(2, '0')}</span>
                      <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-tight">Secs</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Tabs: Videos, Shorts, Showbiz News, Photos, Polls, Quiz, Shopping + Search Input in Header */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-zinc-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {(['Videos', 'Shorts', 'Showbiz News', 'Photos', 'Polls', 'Quizzes', 'Shopping'] as SubTab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                  }}
                  className={`px-3 py-1.5 sm:py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 min-h-[36px] ${
                    isActive
                      ? 'border-zinc-900 text-zinc-900 font-extrabold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <span>{tab === 'Quizzes' ? 'Quiz' : tab}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search input field to filter tabItems */}
            <div className="relative w-full sm:w-52 md:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab === 'Quizzes' ? 'quiz' : activeTab.toLowerCase()} by title...`}
                className="w-full pl-8 pr-7 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400 min-h-[38px] sm:min-h-0"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="text-[11px] text-zinc-400 font-medium hidden lg:block shrink-0">
              {isPages ? (
                <span>Linked to page: <span className="font-bold text-zinc-700">{item.title}</span></span>
              ) : (
                <span>Filtered by: <span className="font-bold text-zinc-700">{itemLocationValue}</span></span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Items Container */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 min-h-[220px]">
          {tabLoading ? (
            <div className="h-40 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin text-zinc-400" />
              <span className="text-xs text-zinc-500">Loading {activeTab}...</span>
            </div>
          ) : tabItems.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <p className="text-xs font-bold text-zinc-700">
                {isPages
                  ? `No ${activeTab} linked to this page yet`
                  : `No ${activeTab} matched with Event Location "${itemLocationValue}"`}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-sm">
                {isPages
                  ? `When creating new ${activeTab}, select "${item.title}" in the Page dropdown to link them here.`
                  : `When creating new ${activeTab}, select "${itemLocationValue}" in the Event Location dropdown to link them here.`}
              </p>
            </div>
          ) : filteredTabItems.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <Search size={22} className="text-zinc-400 mb-1.5" />
              <p className="text-xs font-bold text-zinc-700">
                No {activeTab === 'Quizzes' ? 'quizzes' : activeTab.toLowerCase()} found matching "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-zinc-900 font-bold underline hover:text-zinc-700 cursor-pointer"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            <motion.div
              key={`${activeTab}-${searchQuery}`}
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.04,
                    delayChildren: 0.02
                  }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {filteredTabItems.map((media) => {
                const isMediaPublished = media.visibility === 'Published' || media.visibility === 'Public' || !media.visibility;
                
                // Determine cover image URL for each media type
                let coverImgUrl = media.coverPhoto;
                if (activeTab === 'Shopping') {
                  coverImgUrl = media.photo || media.coverPhoto || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60';
                } else if (activeTab === 'Videos' || activeTab === 'Shorts') {
                  coverImgUrl = getVideoThumbnail(media.videoUrl, media.coverPhoto) || media.coverPhoto || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60';
                } else if (activeTab === 'Photos') {
                  coverImgUrl = media.coverPhoto || media.photoUrl || (Array.isArray(media.photos) && media.photos[0]) || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60';
                } else if (activeTab === 'Showbiz News') {
                  coverImgUrl = media.coverPhoto || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60';
                } else if (activeTab === 'Polls') {
                  coverImgUrl = media.coverPhoto || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60';
                } else if (activeTab === 'Quizzes') {
                  coverImgUrl = media.coverPhoto || 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=60';
                }

                const itemSingularLabel = activeTab === 'Quizzes' ? 'Quiz' : activeTab === 'Showbiz News' ? 'News' : activeTab === 'Shopping' ? 'Shopping' : activeTab === 'Shorts' ? 'Shorts' : activeTab.slice(0, -1);
                const mediaDescription = media.description || media.document || media.summary || media.question || media.videoUrl || 'No description provided.';

                return (
                  <motion.div
                    key={media.id}
                    variants={{
                      hidden: { opacity: 0, y: 14, scale: 0.98 },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1]
                        }
                      }
                    }}
                    whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
                    className="bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-200 group"
                  >
                    {/* Cover Photo Banner */}
                    <div className={`relative ${activeTab === 'Shopping' ? 'aspect-square sm:h-52' : 'h-36 sm:h-40'} bg-zinc-100 overflow-hidden shrink-0`}>
                      <img
                        src={coverImgUrl}
                        alt={media.title || 'Cover'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                      {/* Visibility Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-2xs ${
                            isMediaPublished
                              ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
                              : 'bg-zinc-800/90 text-zinc-200 border border-zinc-600/40'
                          }`}
                        >
                          {isMediaPublished ? <Globe size={11} /> : <Lock size={11} />}
                          <span>{media.visibility || 'Public'}</span>
                        </span>
                      </div>

                      {/* Price Badge for Shopping */}
                      {activeTab === 'Shopping' && media.pricing && (
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-600/95 text-white font-extrabold text-xs shadow-md backdrop-blur-xs flex items-center gap-1 border border-emerald-400/30">
                            {String(media.pricing).startsWith('₱') || String(media.pricing).startsWith('$') || String(media.pricing).startsWith('€') || String(media.pricing).startsWith('£')
                              ? media.pricing
                              : `₱${parseFloat(media.pricing).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                          </span>
                        </div>
                      )}

                      {/* More Icon & Dropdown Menu */}
                      <div className="absolute top-3 right-3 card-more-menu-container">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMediaMenuId(activeMediaMenuId === media.id ? null : media.id);
                          }}
                          className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                          title="More options"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMediaMenuId === media.id && (
                          <div className="absolute right-0 top-9 w-44 bg-white border border-zinc-200 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMediaMenuId(null);
                                if (activeTab === 'Shopping') {
                                  setSelectedShoppingItem(media as ProductItem);
                                } else {
                                  setSelectedMediaDetail(media);
                                }
                              }}
                              className="w-full px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Eye size={14} className="text-zinc-500" />
                              <span>View {activeTab === 'Shopping' ? 'Shopping' : 'Details'}</span>
                            </button>
                            <div className="my-1 border-t border-zinc-100" />
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMediaMenuId(null);
                                setItemToDelete(media);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                              <span>Delete {itemSingularLabel}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {activeTab === 'Shopping' && media.tags && Array.isArray(media.tags) && media.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {media.tags.map((t: string) => {
                              const style = getTagStyle(t);
                              return (
                                <span key={t} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}>
                                  #{t}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <h4 className="text-sm font-extrabold text-zinc-900 leading-snug line-clamp-1">
                          <HighlightText text={media.title || 'Untitled'} query={searchQuery} />
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed min-h-[32px]">
                          {mediaDescription}
                        </p>
                      </div>

                      {/* View Button Footer */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeTab === 'Shopping') {
                              setSelectedShoppingItem(media as ProductItem);
                            } else {
                              setSelectedMediaDetail(media);
                            }
                          }}
                          className="w-full py-2 text-xs font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
                        >
                          <Eye size={14} />
                          <span>View {itemSingularLabel}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Media Item Detail Preview Modal */}
        {selectedMediaDetail && (
          <ItemDetailModal
            item={selectedMediaDetail}
            subTab={activeTab}
            onClose={() => setSelectedMediaDetail(null)}
            onDelete={() => {
              setItemToDelete(selectedMediaDetail);
              setSelectedMediaDetail(null);
            }}
          />
        )}

        {/* Shopping Item Detail Preview Modal */}
        {selectedShoppingItem && (
          <ViewShoppingModal
            product={selectedShoppingItem}
            onClose={() => setSelectedShoppingItem(null)}
            onAddToCart={(qty) => handleAddToCart(selectedShoppingItem, qty)}
            onCheckout={(qty) => {
              setCheckoutShoppingProduct({ product: selectedShoppingItem, quantity: qty });
              setSelectedShoppingItem(null);
            }}
          />
        )}

        {/* Direct Checkout Modal for Shopping */}
        {checkoutShoppingProduct && (
          <CheckoutModal
            currentUser={currentUser}
            currentUserProfile={currentUserProfile}
            directProduct={checkoutShoppingProduct.product}
            directQuantity={checkoutShoppingProduct.quantity}
            onClose={() => setCheckoutShoppingProduct(null)}
            onSuccess={(order) => {
              setCheckoutShoppingProduct(null);
              onActionNotice?.(`Order placed successfully! Order ID: #${order.id.slice(-6)}`);
              window.dispatchEvent(new Event('dmm-order-placed'));
            }}
          />
        )}

        {/* Confirmation Modal for Deleting linked media item */}
        {itemToDelete && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4 my-auto">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-zinc-900 leading-tight">
                    {getDeleteLabel(activeTab)} from {isPages ? 'Page' : 'Event'}?
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Are you sure you want to delete <span className="font-bold text-zinc-800">"{itemToDelete.title || 'this item'}"</span>? It will be moved to trash and scheduled for deletion in 100 days.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeletingMedia}
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingMedia}
                  onClick={() => handleDeleteLinkedMedia(itemToDelete)}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-rose-200"
                >
                  {isDeletingMedia ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      <span>{getDeleteLabel(activeTab)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENT: DELETED ITEMS MODAL (SCHEDULED DELETION IN 100 DAYS)
// -------------------------------------------------------------
interface DeletedItemsModalProps {
  type: 'Pages' | 'Events' | 'Shopping' | 'Products';
  items: any[];
  onClose: () => void;
  onRestore: (item: any) => Promise<void> | void;
  onPermanentDelete: (item: any) => Promise<void> | void;
}

function DeletedItemsModal({
  type,
  items,
  onClose,
  onRestore,
  onPermanentDelete
}: DeletedItemsModalProps) {
  const isPages = type === 'Pages';
  const [itemToDeleteConfirm, setItemToDeleteConfirm] = useState<any | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeletingFromFirestore, setIsDeletingFromFirestore] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRestoreClick = async (item: any) => {
    setProcessingId(item.id);
    try {
      await onRestore(item);
      setStatusMessage(`"${item.title || (isPages ? 'Page' : 'Event')}" restored successfully!`);
    } finally {
      setProcessingId(null);
    }
  };

  const executeDeletePermanent = async (item: any) => {
    if (!item) return;
    setIsDeletingFromFirestore(true);
    try {
      await onPermanentDelete(item);
      setStatusMessage(`"${item.title || (isPages ? 'Page' : 'Event')}" permanently deleted from Firestore.`);
      setItemToDeleteConfirm(null);
    } finally {
      setIsDeletingFromFirestore(false);
    }
  };

  const handleRestoreAll = async () => {
    if (items.length === 0) return;
    setIsDeletingFromFirestore(true);
    try {
      for (const item of items) {
        await onRestore(item);
      }
      setStatusMessage(`All ${items.length} ${isPages ? 'pages' : 'events'} restored successfully!`);
    } finally {
      setIsDeletingFromFirestore(false);
    }
  };

  const executeBulkDeletePermanent = async () => {
    if (items.length === 0) return;
    setIsDeletingFromFirestore(true);
    try {
      for (const item of items) {
        await onPermanentDelete(item);
      }
      setStatusMessage(`All ${items.length} ${isPages ? 'pages' : 'events'} permanently deleted from Firestore.`);
      setShowBulkDeleteConfirm(false);
    } finally {
      setIsDeletingFromFirestore(false);
    }
  };

  return (
    <div
      id="deleted-pages-events-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="deleted-pages-events-modal-card"
        className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 relative my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-zinc-200 shrink-0 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 flex items-center gap-1">
                <Trash2 size={11} />
                <span>{isPages ? 'Pages' : 'Events'} &bull; Trash</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 flex items-center gap-1 border border-amber-200/60">
                <Clock size={11} />
                <span>Scheduled Deletion: 100 Days</span>
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-zinc-900 leading-tight">
              Deleted {isPages ? 'Pages' : 'Events'}
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5">
              Manage deleted {isPages ? 'pages' : 'events'} scheduled for permanent deletion in 100 days
            </p>
          </div>
          <button
            type="button"
            id="close-deleted-modal-btn"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Schedule Policy Notice Banner */}
        <div className="my-3.5 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-3 text-amber-950 shrink-0 shadow-2xs">
          <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-black text-amber-950">
              Schedule deletion in 100 days click Restore or Delete Permanently
            </p>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              {isPages ? 'Pages' : 'Events'} moved to trash will be automatically purged after 100 days. Click{' '}
              <span className="font-bold text-zinc-900 underline">Restore</span> to recover an
              item to your active dashboard, or{' '}
              <span className="font-bold text-rose-700 underline">Delete Permanently</span> to
              remove it right now from Cloud Firestore.
            </p>
          </div>
        </div>

        {/* Status Feedback */}
        {statusMessage && (
          <div className="mb-3 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage('')}
              className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Bulk Action Controls */}
        {items.length > 0 && (
          <div className="mb-2 pb-2.5 border-b border-zinc-100 flex items-center justify-between gap-2 shrink-0">
            <span className="text-xs font-bold text-zinc-600">
              {items.length} deleted {isPages ? (items.length === 1 ? 'page' : 'pages') : (items.length === 1 ? 'event' : 'events')} in trash
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreAll}
                disabled={isDeletingFromFirestore}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} className="text-emerald-600" />
                <span>Restore All</span>
              </button>
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={isDeletingFromFirestore}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Empty Trash</span>
              </button>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 min-h-[160px]">
          {items.length === 0 ? (
            <div className="py-14 px-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3 border border-zinc-200">
                <Trash2 size={22} />
              </div>
              <h4 className="text-sm font-bold text-zinc-800">Trash is empty</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
                No deleted {isPages ? 'pages' : 'events'} in trash. When you delete {isPages ? 'pages' : 'events'} from
                your dashboard, they will appear here with a 100-day schedule.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const daysRemaining = calculateDaysRemaining(item.deletedAt, 100);
              const isProcessing = processingId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-4 bg-zinc-50/80 border border-zinc-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:border-zinc-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={
                        item.coverPhoto ||
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'
                      }
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover border border-zinc-200 shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                        {item.title || 'Untitled'}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">
                        {item.description || (isPages ? 'Custom Page' : 'Scheduled Event')}
                      </p>

                      {/* 100-Day Countdown Badge & Metadata */}
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200/80">
                          <Clock size={11} className="text-amber-700" />
                          <span>{daysRemaining} days remaining</span>
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          &bull; Deleted: {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : 'Recently'}
                        </span>
                        {!isPages && item.startDate && (
                          <span className="text-[10px] text-zinc-500 font-medium">
                            &bull; Event: {item.startDate} ({item.startTime})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleRestoreClick(item)}
                      disabled={isProcessing || isDeletingFromFirestore}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-98 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 size={13} className="animate-spin text-zinc-600" />
                      ) : (
                        <RotateCcw size={13} className="text-emerald-600" />
                      )}
                      <span>Restore</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDeleteConfirm(item)}
                      disabled={isProcessing || isDeletingFromFirestore}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      <span>Delete Permanently</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/60 flex items-center justify-between shrink-0 rounded-b-3xl">
          <div className="text-[11px] text-zinc-500 font-medium">
            Permanent deletes are irreversible
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-700 bg-zinc-200 hover:bg-zinc-300 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Single Item Permanent Delete Confirmation Modal */}
        {itemToDeleteConfirm && (
          <div
            id="single-delete-confirm-popup"
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 relative flex flex-col gap-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} className="text-rose-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                    Permanent Deletion
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug mt-1">
                    Delete {isPages ? 'Page' : 'Event'} Permanently from Firestore?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => !isDeletingFromFirestore && setItemToDeleteConfirm(null)}
                  disabled={isDeletingFromFirestore}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl text-xs text-rose-900 space-y-1">
                <p className="font-bold text-rose-900">
                  "{itemToDeleteConfirm.title || (isPages ? 'Page' : 'Event')}"
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  This {isPages ? 'page' : 'event'} will be permanently erased from Cloud Firestore and cannot be recovered or restored.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToDeleteConfirm(null)}
                  disabled={isDeletingFromFirestore}
                  className="px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeDeletePermanent(itemToDeleteConfirm)}
                  disabled={isDeletingFromFirestore}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeletingFromFirestore ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Deleting from Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Delete from Firestore</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete All Confirmation Modal */}
        {showBulkDeleteConfirm && (
          <div
            id="bulk-delete-confirm-popup"
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 relative flex flex-col gap-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} className="text-rose-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                    Empty Trash
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug mt-1">
                    Delete all {items.length} {isPages ? 'pages' : 'events'} from Firestore?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => !isDeletingFromFirestore && setShowBulkDeleteConfirm(false)}
                  disabled={isDeletingFromFirestore}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl text-xs text-rose-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertCircle size={14} className="shrink-0 text-rose-600" />
                  <span>Permanent bulk deletion</span>
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  All {items.length} {isPages ? 'pages' : 'events'} will be permanently erased from Cloud Firestore and cannot be recovered.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  disabled={isDeletingFromFirestore}
                  className="px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeBulkDeletePermanent}
                  disabled={isDeletingFromFirestore}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeletingFromFirestore ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Deleting from Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Empty Trash from Firestore</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
