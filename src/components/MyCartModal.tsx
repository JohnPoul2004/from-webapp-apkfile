import React, { useState } from 'react';
import {
  ShoppingCart,
  X,
  Trash2,
  ArrowRight,
  CreditCard,
  Truck,
  Check,
  Loader2,
  Plus,
  Minus,
  Lock
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { CartItem, OrderItem, UserProfile } from '../types';
import { logActivity } from '../utils/activityLogger';

interface MyCartModalProps {
  currentUser: FirebaseUser | null;
  currentUserProfile?: UserProfile | null;
  cartItems: CartItem[];
  onUpdateCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onClose: () => void;
  onNavigateShopping?: () => void;
  onOrderPlaced: (order: OrderItem) => void;
}

export default function MyCartModal({
  currentUser,
  currentUserProfile,
  cartItems,
  onUpdateCart,
  onClose,
  onNavigateShopping,
  onOrderPlaced
}: MyCartModalProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
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

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = parseFloat(String(item.pricing).replace(/[^0-9.]/g, '')) || 0;
    return acc + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleUpdateQuantity = (productId: string, delta: number) => {
    onUpdateCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    onUpdateCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleClearCart = () => {
    onUpdateCart([]);
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || cartItems.length === 0) return;

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
        items: cartItems.map((c) => ({
          productId: c.productId,
          title: c.title,
          photo: c.photo,
          pricing: parseFloat(String(c.pricing).replace(/[^0-9.]/g, '')) || 0,
          quantity: c.quantity
        })),
        totalAmount: parseFloat(total.toFixed(2)),
        customerName: customerName.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod,
        status: 'Confirmed',
        trackingStatus: 'Pending',
        trackingNumber: `PH-${Math.floor(100000000 + Math.random() * 900000000)}`,
        carrier: 'Standard Express',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        createdAt: serverTimestamp()
      };

      // Save to Firestore users/{uid}/orders/{orderId}
      const orderDocRef = doc(db, 'users', currentUser.uid, 'orders', orderId);
      await setDoc(orderDocRef, orderData);

      // Audit Log
      logActivity({
        action: 'CREATE',
        category: 'Shopping',
        title: `Placed Order #${orderId.slice(-6)} (${cartItems.length} items)`,
        details: `Total: ₱${total.toFixed(2)} | Customer: ${customerName}`,
        section: 'Shopping',
        userId: currentUser.uid,
        userEmail: currentUser.email || undefined,
        status: 'success'
      }).catch(() => {});

      // Clear Cart
      onUpdateCart([]);
      onOrderPlaced(orderData);
      onClose();
    } catch (err) {
      console.warn('Firestore order write error, saved locally:', err);
      const fallbackOrder: OrderItem = {
        id: `ord_${Date.now()}`,
        items: cartItems.map((c) => ({
          productId: c.productId,
          title: c.title,
          photo: c.photo,
          pricing: parseFloat(String(c.pricing).replace(/[^0-9.]/g, '')) || 0,
          quantity: c.quantity
        })),
        totalAmount: parseFloat(total.toFixed(2)),
        status: 'Confirmed',
        trackingStatus: 'Pending',
        trackingNumber: `PH-${Math.floor(100000000 + Math.random() * 900000000)}`,
        carrier: 'Standard Express',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        createdAt: new Date().toISOString()
      };
      try {
        const raw = localStorage.getItem(`dmm_local_orders_${currentUser.uid}`);
        const existing = raw ? JSON.parse(raw) : [];
        localStorage.setItem(`dmm_local_orders_${currentUser.uid}`, JSON.stringify([fallbackOrder, ...existing]));
      } catch {}
      onUpdateCart([]);
      onOrderPlaced(fallbackOrder);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShoppingCart size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                  {isCheckingOut ? 'Cart Checkout' : 'My Shopping Cart'}
                </h3>
                {isCheckingOut && (
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 flex items-center gap-1">
                    <Lock size={10} /> Require Credit Card
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {isCheckingOut
                  ? 'Valid credit card details are strictly required to place order'
                  : `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} in your cart`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCheckingOut && cartItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
              >
                Clear Cart
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {cartItems.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-3 my-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <ShoppingCart size={28} />
            </div>
            <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              Your cart is empty
            </h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Add products to your cart to begin shopping.
            </p>
          </div>
        ) : isCheckingOut ? (
          /* Checkout Step */
          <form onSubmit={handleCompleteOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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

              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 font-medium">
                Payments are securely processed. A valid credit card is required to complete this order.
              </p>

              {/* Card Number */}
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

              {/* Expiry and CVV */}
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

            {/* Price Breakdown */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal ({cartItems.length} items)</span>
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

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="w-1/3 py-2.5 px-3 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 py-2.5 px-4 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Place Order (₱{total.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Cart Items List */
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {cartItems.map((item) => {
                const price = parseFloat(String(item.pricing).replace(/[^0-9.]/g, '')) || 0;
                return (
                  <div
                    key={item.productId}
                    className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-center gap-3.5"
                  >
                    {/* 1:1 Photo */}
                    <div className="w-16 h-16 aspect-square rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-200/80">
                      <img
                        src={item.photo}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ₱{price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Adjuster */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.productId, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.productId, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary & Proceed to Checkout */}
            <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-3 shrink-0">
              <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  ₱{subtotal.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                id="btn-cart-proceed-checkout"
                onClick={() => setIsCheckingOut(true)}
                className="w-full py-3 px-4 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CreditCard size={15} />
                <span>Checkout (Require Credit Card)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
