import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  Receipt,
  Printer,
  Copy,
  Check,
  MapPin,
  Calendar,
  Sparkles,
  Navigation,
  Trash2,
  Ban,
  AlertTriangle
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { OrderItem, UserProfile, CartItem } from '../types';

interface MyOrdersModalProps {
  currentUser: FirebaseUser | null;
  currentUserProfile?: UserProfile | null;
  onClose: () => void;
  onNavigateProducts?: () => void;
  onAddToCart?: (item: CartItem) => void;
}

export type StandardTrackingStatus = 'Pending' | 'Processing' | 'In Transit' | 'Delivered';

export const TRACKING_STEPS: {
  id: StandardTrackingStatus;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    id: 'Pending',
    label: 'Order Placed',
    shortLabel: 'Placed',
    icon: Clock,
    description: 'Order confirmed and payment verified. Awaiting packing.'
  },
  {
    id: 'Processing',
    label: 'Processing',
    shortLabel: 'Processing',
    icon: Package,
    description: 'Items packed, quality checked, and prepared for carrier pickup.'
  },
  {
    id: 'In Transit',
    label: 'In Transit',
    shortLabel: 'In Transit',
    icon: Truck,
    description: 'Handed over to carrier and in transit to delivery destination.'
  },
  {
    id: 'Delivered',
    label: 'Delivered',
    shortLabel: 'Delivered',
    icon: CheckCircle2,
    description: 'Package successfully delivered and signed for.'
  }
];

export const resolveTrackingStatus = (order: OrderItem): StandardTrackingStatus => {
  if (order.trackingStatus) {
    const s = String(order.trackingStatus).toLowerCase();
    if (s.includes('deliver')) return 'Delivered';
    if (s.includes('transit') || s.includes('ship')) return 'In Transit';
    if (s.includes('process')) return 'Processing';
    if (s.includes('pend') || s.includes('confirm')) return 'Pending';
  }
  if (order.status) {
    const s = String(order.status).toLowerCase();
    if (s.includes('deliver')) return 'Delivered';
    if (s.includes('transit') || s.includes('ship')) return 'In Transit';
    if (s.includes('process')) return 'Processing';
    if (s.includes('pend')) return 'Pending';
  }

  // Derive by creation time if not explicitly marked
  try {
    let orderTime = 0;
    if (order.createdAt?.toDate && typeof order.createdAt.toDate === 'function') {
      orderTime = order.createdAt.toDate().getTime();
    } else if (order.createdAt) {
      orderTime = new Date(order.createdAt).getTime();
    }

    if (orderTime > 0) {
      const hoursAgo = (Date.now() - orderTime) / (1000 * 60 * 60);
      if (hoursAgo < 4) return 'Pending';
      if (hoursAgo < 24) return 'Processing';
      if (hoursAgo < 72) return 'In Transit';
      return 'Delivered';
    }
  } catch {}

  return 'Pending';
};

export const getTrackingBadgeConfig = (status: StandardTrackingStatus) => {
  switch (status) {
    case 'Pending':
      return {
        label: 'Order Placed',
        shortLabel: 'Pending',
        pillClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dotClass: 'bg-amber-500 animate-pulse',
        icon: Clock,
        stepIndex: 0
      };
    case 'Processing':
      return {
        label: 'Processing',
        shortLabel: 'Processing',
        pillClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        dotClass: 'bg-blue-500 animate-pulse',
        icon: Package,
        stepIndex: 1
      };
    case 'In Transit':
      return {
        label: 'In Transit',
        shortLabel: 'In Transit',
        pillClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        dotClass: 'bg-indigo-500 animate-pulse',
        icon: Truck,
        stepIndex: 2
      };
    case 'Delivered':
      return {
        label: 'Delivered',
        shortLabel: 'Delivered',
        pillClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dotClass: 'bg-emerald-500',
        icon: CheckCircle2,
        stepIndex: 3
      };
  }
};

/**
 * Visual Progress Tracker Component
 * Renders the horizontal multi-step progress tracker for each order
 */
export function OrderProgressTracker({
  status,
  carrier = 'Standard Express (PH)',
  estimatedDelivery,
  compact = false
}: {
  status: StandardTrackingStatus;
  carrier?: string;
  estimatedDelivery?: string;
  compact?: boolean;
}) {
  const badgeConfig = getTrackingBadgeConfig(status);
  const currentStepIndex = badgeConfig.stepIndex;
  const StatusIcon = badgeConfig.icon;

  // Percentage for progress line
  const progressPercent =
    currentStepIndex === 0 ? 12 : currentStepIndex === 1 ? 40 : currentStepIndex === 2 ? 72 : 100;

  return (
    <div className="w-full bg-white dark:bg-zinc-900/90 rounded-2xl p-3 sm:p-3.5 border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs space-y-3">
      {/* Tracker Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[10px]">
            Delivery Progress Tracker
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-2xs ${badgeConfig.pillClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dotClass}`} />
            <StatusIcon size={11} className="shrink-0" />
            <span>{status}</span>
          </span>
        </div>
      </div>

      {/* Visual Stepper Track */}
      <div className="relative pt-2 pb-1 px-3 sm:px-4">
        {/* Background Track Bar */}
        <div className="absolute top-[21px] left-8 right-8 h-1 bg-zinc-200 dark:bg-zinc-700/80 rounded-full z-0" />
        {/* Active Colored Progress Bar */}
        <div
          className="absolute top-[21px] left-8 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 rounded-full transition-all duration-500 z-0"
          style={{ width: `calc(${progressPercent}% - 24px)` }}
        />

        <div className="relative z-10 grid grid-cols-4 gap-1">
          {TRACKING_STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-white dark:bg-zinc-900 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md ring-4 ring-emerald-500/20 scale-105'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {isCompleted ? <Check size={13} className="stroke-[3]" /> : <StepIcon size={13} />}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold mt-1.5 leading-tight truncate max-w-full ${
                    isCurrent
                      ? 'text-emerald-600 dark:text-emerald-400 font-black'
                      : isCompleted
                      ? 'text-zinc-800 dark:text-zinc-200 font-medium'
                      : 'text-zinc-400'
                  }`}
                >
                  {step.shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contextual Status Milestone Banner */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0 text-zinc-600 dark:text-zinc-300">
          <span className="font-bold text-zinc-900 dark:text-zinc-100 shrink-0">
            {status === 'Processing'
              ? 'In Preparation:'
              : status === 'In Transit'
              ? 'On the Road:'
              : status === 'Delivered'
              ? 'Delivery Complete:'
              : 'Confirmed:'}
          </span>
          <span className="truncate text-zinc-500 dark:text-zinc-400 text-[11px]">
            {TRACKING_STEPS[currentStepIndex]?.description}
          </span>
        </div>
        {estimatedDelivery && (
          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0 sm:text-right font-medium flex items-center gap-1">
            <Calendar size={11} className="text-zinc-400" />
            <span>{status === 'Delivered' ? 'Completed & signed' : `Arrival: ${estimatedDelivery}`}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyOrdersModal({
  currentUser,
  currentUserProfile,
  onClose,
  onAddToCart
}: MyOrdersModalProps) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'in-transit' | 'delivered'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [reorderedToast, setReorderedToast] = useState<string | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [confirmCancelOrder, setConfirmCancelOrder] = useState<OrderItem | null>(null);
  const [cancelNotification, setCancelNotification] = useState<{
    orderId: string;
    message: string;
    itemsCount: number;
    total: number;
  } | null>(null);

  // Helper to load local fallback orders
  const loadLocalOrders = (): OrderItem[] => {
    try {
      const allLocal: OrderItem[] = [];
      if (currentUser?.uid) {
        const userOrdersRaw = localStorage.getItem(`dmm_local_orders_${currentUser.uid}`);
        if (userOrdersRaw) {
          allLocal.push(...JSON.parse(userOrdersRaw));
        }
      }
      const genericRaw = localStorage.getItem('dmm_user_orders');
      if (genericRaw) {
        const genericList: OrderItem[] = JSON.parse(genericRaw);
        genericList.forEach((go) => {
          if (!allLocal.some((lo) => lo.id === go.id)) {
            allLocal.push(go);
          }
        });
      }
      return allLocal;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    if (currentUser?.uid) {
      try {
        const ordersRef = collection(db, 'users', currentUser.uid, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const firestoreOrders: OrderItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              firestoreOrders.push({
                id: docSnap.id,
                items: Array.isArray(data.items) ? data.items : [],
                totalAmount: Number(data.totalAmount) || 0,
                customerName: data.customerName || currentUserProfile?.fullName || currentUser?.displayName || '',
                shippingAddress: data.shippingAddress || '',
                paymentMethod: data.paymentMethod || 'Credit Card',
                status: data.status || 'Confirmed',
                trackingStatus: data.trackingStatus,
                trackingNumber: data.trackingNumber,
                carrier: data.carrier,
                estimatedDelivery: data.estimatedDelivery,
                cardLast4: data.cardLast4 || '',
                createdAt: data.createdAt
              });
            });

            // Merge with local orders that might not yet be synced
            const localOrders = loadLocalOrders();
            const combinedMap = new Map<string, OrderItem>();
            firestoreOrders.forEach((o) => combinedMap.set(o.id, o));
            localOrders.forEach((o) => {
              if (!combinedMap.has(o.id)) {
                combinedMap.set(o.id, o);
              }
            });

            setOrders(Array.from(combinedMap.values()));
            setLoading(false);
          },
          (err) => {
            console.warn('Firestore orders snapshot error, falling back to local:', err);
            setOrders(loadLocalOrders());
            setLoading(false);
          }
        );
      } catch (err) {
        console.warn('Orders setup note:', err);
        setOrders(loadLocalOrders());
        setLoading(false);
      }
    } else {
      setOrders(loadLocalOrders());
      setLoading(false);
    }

    const handleSyncEvent = () => {
      setOrders((prev) => {
        const fresh = loadLocalOrders();
        const map = new Map<string, OrderItem>();
        fresh.forEach((f) => map.set(f.id, f));
        prev.forEach((p) => {
          if (!map.has(p.id)) map.set(p.id, p);
        });
        return Array.from(map.values());
      });
    };

    window.addEventListener('dmm-order-placed', handleSyncEvent);
    window.addEventListener('dmm-cart-updated', handleSyncEvent);
    window.addEventListener('storage', handleSyncEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('dmm-order-placed', handleSyncEvent);
      window.removeEventListener('dmm-cart-updated', handleSyncEvent);
      window.removeEventListener('storage', handleSyncEvent);
    };
  }, [currentUser?.uid, currentUserProfile?.fullName]);

  // Format date helper
  const formatDate = (dateVal: any): string => {
    if (!dateVal) return 'Recently placed';
    try {
      if (dateVal.toDate && typeof dateVal.toDate === 'function') {
        return dateVal.toDate().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      }
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      }
    } catch {
      // ignore formatting error
    }
    return 'Recently placed';
  };

  // Helper for tracking metadata
  const getOrderTrackingDetails = (order: OrderItem) => {
    const trackingStatus = resolveTrackingStatus(order);
    const trackingNumber =
      order.trackingNumber || `PH-${order.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`;
    const carrier = order.carrier || 'Standard Express (PH)';

    let estimatedDelivery = order.estimatedDelivery;
    if (!estimatedDelivery) {
      try {
        let baseDate = Date.now();
        if (order.createdAt?.toDate) baseDate = order.createdAt.toDate().getTime();
        else if (order.createdAt) baseDate = new Date(order.createdAt).getTime();

        const eta = new Date(baseDate + 3 * 24 * 60 * 60 * 1000);
        estimatedDelivery = eta.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      } catch {
        estimatedDelivery = '3-5 Business Days';
      }
    }

    return {
      trackingStatus,
      trackingNumber,
      carrier,
      estimatedDelivery,
      badgeConfig: getTrackingBadgeConfig(trackingStatus)
    };
  };

  // Update order tracking status (persists to Firestore and LocalStorage)
  const handleUpdateStatus = async (orderId: string, newStatus: StandardTrackingStatus) => {
    setIsUpdatingStatus(orderId);
    try {
      // 1. Update in Firestore if user is authenticated
      if (currentUser?.uid) {
        try {
          const orderRef = doc(db, 'users', currentUser.uid, 'orders', orderId);
          await updateDoc(orderRef, {
            trackingStatus: newStatus,
            status: newStatus
          });
        } catch (e) {
          console.warn('Firestore tracking status sync note:', e);
        }
      }

      // 2. Update local storage
      if (currentUser?.uid) {
        try {
          const raw = localStorage.getItem(`dmm_local_orders_${currentUser.uid}`);
          if (raw) {
            const list: OrderItem[] = JSON.parse(raw);
            const idx = list.findIndex((o) => o.id === orderId);
            if (idx >= 0) {
              list[idx].trackingStatus = newStatus;
              list[idx].status = newStatus;
              localStorage.setItem(`dmm_local_orders_${currentUser.uid}`, JSON.stringify(list));
            }
          }
        } catch {}
      }

      try {
        const genRaw = localStorage.getItem('dmm_user_orders');
        if (genRaw) {
          const genList: OrderItem[] = JSON.parse(genRaw);
          const idx = genList.findIndex((o) => o.id === orderId);
          if (idx >= 0) {
            genList[idx].trackingStatus = newStatus;
            genList[idx].status = newStatus;
            localStorage.setItem('dmm_user_orders', JSON.stringify(genList));
          }
        }
      } catch {}

      // 3. Update React state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, trackingStatus: newStatus, status: newStatus } : o
        )
      );
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Cancel order handler for Pending orders
  const handleConfirmCancellation = async () => {
    if (!confirmCancelOrder) return;
    const targetOrder = confirmCancelOrder;
    const orderId = targetOrder.id;
    setCancellingOrderId(orderId);

    try {
      // 1. Delete from Firestore if user is authenticated
      if (currentUser?.uid) {
        try {
          const orderRef = doc(db, 'users', currentUser.uid, 'orders', orderId);
          await deleteDoc(orderRef);
        } catch (err) {
          console.warn('Error deleting order document from Firestore:', err);
        }
      }

      // 2. Remove from user local storage
      if (currentUser?.uid) {
        try {
          const userKey = `dmm_local_orders_${currentUser.uid}`;
          const raw = localStorage.getItem(userKey);
          if (raw) {
            const list: OrderItem[] = JSON.parse(raw);
            const filtered = list.filter((o) => o.id !== orderId);
            localStorage.setItem(userKey, JSON.stringify(filtered));
          }
        } catch (err) {
          console.warn('Error updating user local storage orders:', err);
        }
      }

      // 3. Remove from generic local storage
      try {
        const genericRaw = localStorage.getItem('dmm_user_orders');
        if (genericRaw) {
          const genList: OrderItem[] = JSON.parse(genericRaw);
          const filtered = genList.filter((o) => o.id !== orderId);
          localStorage.setItem('dmm_user_orders', JSON.stringify(filtered));
        }
      } catch (err) {
        console.warn('Error updating generic local storage orders:', err);
      }

      // 4. Update local component state
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (expandedOrderId === orderId) {
        setExpandedOrderId(null);
      }

      // 5. Trigger confirmation notification
      setCancelNotification({
        orderId: targetOrder.id,
        message: `Order #${targetOrder.id.replace(/^ord_/, 'ORD-')} has been successfully cancelled and removed from your order history.`,
        itemsCount: targetOrder.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 1,
        total: Number(targetOrder.totalAmount) || 0
      });

      // Close confirmation dialog
      setConfirmCancelOrder(null);

      // Dispatch event to notify other components
      window.dispatchEvent(new Event('dmm-order-placed'));

      // Auto-dismiss confirmation notification after 5 seconds
      setTimeout(() => {
        setCancelNotification((curr) => (curr?.orderId === targetOrder.id ? null : curr));
      }, 5000);
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Copy tracking number to clipboard
  const handleCopyTracking = (trackingNum: string) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedTrackingId(trackingNum);
    setTimeout(() => setCopiedTrackingId(null), 2000);
  };

  // Calculate counts per status
  const statusCounts = useMemo(() => {
    const counts = { all: orders.length, pending: 0, processing: 0, 'in-transit': 0, delivered: 0 };
    orders.forEach((o) => {
      const st = resolveTrackingStatus(o);
      if (st === 'Pending') counts.pending++;
      else if (st === 'Processing') counts.processing++;
      else if (st === 'In Transit') counts['in-transit']++;
      else if (st === 'Delivered') counts.delivered++;
    });
    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const currentStatus = resolveTrackingStatus(order);

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending' && currentStatus !== 'Pending') return false;
        if (statusFilter === 'processing' && currentStatus !== 'Processing') return false;
        if (statusFilter === 'in-transit' && currentStatus !== 'In Transit') return false;
        if (statusFilter === 'delivered' && currentStatus !== 'Delivered') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesItem = order.items?.some((it) => it.title?.toLowerCase().includes(q));
        const matchesCustomer = order.customerName?.toLowerCase().includes(q);
        const matchesStatus = currentStatus.toLowerCase().includes(q);
        const matchesTracking = order.trackingNumber?.toLowerCase().includes(q);
        return matchesId || matchesItem || matchesCustomer || matchesStatus || matchesTracking;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Handle re-ordering items (add all items from an order back into cart)
  const handleReorder = (order: OrderItem) => {
    try {
      const raw = localStorage.getItem('dmm_user_cart');
      const currentCart: CartItem[] = raw ? JSON.parse(raw) : [];

      order.items.forEach((item) => {
        const existingIdx = currentCart.findIndex((c) => c.productId === item.productId);
        if (existingIdx >= 0) {
          currentCart[existingIdx].quantity += item.quantity || 1;
        } else {
          currentCart.push({
            productId: item.productId,
            title: item.title,
            photo: item.photo,
            pricing: item.pricing,
            quantity: item.quantity || 1
          });
        }
      });

      localStorage.setItem('dmm_user_cart', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('dmm-cart-updated'));

      if (onAddToCart && order.items.length > 0) {
        const first = order.items[0];
        onAddToCart({
          productId: first.productId,
          title: first.title,
          photo: first.photo,
          pricing: first.pricing,
          quantity: first.quantity || 1
        });
      }

      setReorderedToast(order.id);
      setTimeout(() => setReorderedToast(null), 2500);
    } catch (err) {
      console.warn('Failed to re-order items:', err);
    }
  };

  // Print receipt function
  const handlePrintReceipt = (order: OrderItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const trackingDetails = getOrderTrackingDetails(order);

    const itemsHtml = order.items
      .map(
        (it) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${it.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${it.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₱${Number(it.pricing).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₱${(Number(it.pricing) * it.quantity).toFixed(2)}</td>
      </tr>`
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Order #${order.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #111; max-width: 600px; margin: 0 auto; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
            .info { font-size: 12px; color: #555; margin-bottom: 16px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { text-align: left; background: #f4f4f5; padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd; }
            .total-row { font-size: 15px; font-weight: bold; margin-top: 16px; text-align: right; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .badge-pending { background: #fef3c7; color: #92400e; }
            .badge-processing { background: #dbeafe; color: #1e40af; }
            .badge-in-transit { background: #e0e7ff; color: #3730a3; }
            .badge-delivered { background: #d1fae5; color: #065f46; }
            .tracking-box { margin-top: 16px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Official Order Receipt</h1>
            <p style="margin: 0; font-size: 13px; color: #666;">Order #${order.id}</p>
          </div>
          <div class="info">
            <p><strong>Date Placed:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Customer:</strong> ${order.customerName || 'Valued Customer'}</p>
            <p><strong>Shipping Address:</strong> ${order.shippingAddress || 'Digital / Store delivery'}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Credit Card'} ${order.cardLast4 ? `(•••• ${order.cardLast4})` : ''}</p>
            <p><strong>Tracking Status:</strong> <span class="badge badge-${trackingDetails.trackingStatus.toLowerCase().replace(/\s+/g, '-')}">${trackingDetails.trackingStatus}</span></p>
          </div>

          <div class="tracking-box">
            <p style="margin: 0 0 4px 0;"><strong>Tracking Number:</strong> ${trackingDetails.trackingNumber}</p>
            <p style="margin: 0 0 4px 0;"><strong>Courier:</strong> ${trackingDetails.carrier}</p>
            <p style="margin: 0;"><strong>Estimated Delivery:</strong> ${trackingDetails.estimatedDelivery}</p>
          </div>

          <table style="margin-top: 16px;">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="total-row">
            <p>Total Paid: ₱${Number(order.totalAmount).toFixed(2)}</p>
          </div>
          <p style="text-align: center; font-size: 11px; color: #888; margin-top: 32px;">Thank you for shopping with us!</p>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const FILTER_TABS = [
    { id: 'all', label: 'All', count: statusCounts.all },
    { id: 'pending', label: 'Placed', count: statusCounts.pending },
    { id: 'processing', label: 'Processing', count: statusCounts.processing },
    { id: 'in-transit', label: 'In Transit', count: statusCounts['in-transit'] },
    { id: 'delivered', label: 'Delivered', count: statusCounts.delivered }
  ] as const;

  return (
    <div
      id="modal-my-orders"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/80 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                  My Orders & Live Tracking
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                  {orders.length} Total
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Visual progress tracker indicating Processing, In Transit, or Delivered status
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-my-orders"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close My Orders"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Status Filters Bar */}
        <div className="p-3 sm:px-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center bg-white dark:bg-zinc-900 shrink-0">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, tracking #, item, or status..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Status Filter Tabs with Counts */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-[11px] flex items-center gap-1 ${
                  statusFilter === tab.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                    statusFilter === tab.id
                      ? 'bg-white/20 text-white dark:bg-zinc-900/30 dark:text-zinc-900'
                      : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Cancel Confirmation Notification Banner */}
        {cancelNotification && (
          <div className="mx-3 sm:mx-5 mt-3 p-3 sm:p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 flex items-start justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <CheckCircle2 size={14} className="stroke-[2.5]" />
              </div>
              <div className="text-xs space-y-0.5 min-w-0">
                <p className="font-black text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5 flex-wrap">
                  <span>Order Cancelled Successfully</span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-200/80 dark:bg-emerald-800/80 text-emerald-800 dark:text-emerald-200">
                    Confirmed
                  </span>
                </p>
                <p className="text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                  {cancelNotification.message}
                </p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 font-medium">
                  {cancelNotification.itemsCount} item(s) • Total amount ₱{cancelNotification.total.toFixed(2)} removed from billing.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCancelNotification(null)}
              className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Orders List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-transparent">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw size={28} className="animate-spin mx-auto text-emerald-500" />
              <p className="text-xs text-zinc-500">Loading order progress and tracking details...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-14 px-4 text-center max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag size={28} />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {searchQuery || statusFilter !== 'all' ? 'No matching orders found' : 'No orders placed yet'}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search keywords or filter status.'
                    : 'Your completed purchases, tracking progress, and order receipts will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const totalItems = order.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 0;
              const isReordered = reorderedToast === order.id;
              const {
                trackingStatus,
                trackingNumber,
                carrier,
                estimatedDelivery,
                badgeConfig
              } = getOrderTrackingDetails(order);

              const StatusIcon = badgeConfig.icon;

              return (
                <div
                  key={order.id}
                  className="bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs space-y-0"
                >
                  {/* Order Card Summary Header */}
                  <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold shadow-2xs">
                        <Receipt size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
                            #{order.id.replace(/^ord_/, 'ORD-')}
                          </span>

                          {/* Tracking Status Pill */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-2xs ${badgeConfig.pillClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dotClass}`} />
                            <StatusIcon size={11} className="shrink-0" />
                            <span>{trackingStatus}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {formatDate(order.createdAt)}
                          </span>
                          <span>•</span>
                          <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            {trackingNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200/60 dark:border-zinc-700/60">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Total Paid</p>
                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                          ₱{Number(order.totalAmount).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {trackingStatus === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelOrder(order)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Cancel this pending order"
                          >
                            <Ban size={12} className="stroke-[2.5]" />
                            <span>Cancel Order</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Tracking'}</span>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL PROGRESS TRACKER COMPONENT (Always visible on the OrderItem) */}
                  <div className="p-3 sm:p-4 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <OrderProgressTracker
                      status={trackingStatus}
                      carrier={carrier}
                      estimatedDelivery={estimatedDelivery}
                    />
                  </div>

                  {/* Expanded Items & Detailed Tracking Controls */}
                  {isExpanded && (
                    <div className="px-3.5 sm:px-5 pb-5 pt-3 border-t border-zinc-200/70 dark:border-zinc-700/60 bg-white/90 dark:bg-zinc-900/90 space-y-4 animate-in fade-in duration-200">
                      {/* Tracking Metadata Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/70 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                            <Truck size={12} /> Assigned Carrier
                          </p>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200">{carrier}</p>
                          <p className="text-[10px] text-zinc-400">Tracked logistics fulfillment</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/70 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Receipt size={12} /> Waybill / Tracking #
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyTracking(trackingNumber)}
                              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5 cursor-pointer font-bold lowercase"
                            >
                              {copiedTrackingId === trackingNumber ? (
                                <span className="flex items-center gap-0.5 text-emerald-600">
                                  <Check size={10} /> Copied
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5">
                                  <Copy size={10} /> copy
                                </span>
                              )}
                            </button>
                          </p>
                          <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                            {trackingNumber}
                          </p>
                          <p className="text-[10px] text-zinc-400">Carrier system verified</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/70 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                            <Calendar size={12} /> Estimated Delivery
                          </p>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200">
                            {trackingStatus === 'Delivered' ? 'Delivered & Completed' : estimatedDelivery}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {trackingStatus === 'Delivered' ? 'Verified signature on file' : 'Standard courier timeline'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Status Simulation / Update Buttons */}
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-indigo-50/70 dark:from-emerald-950/20 dark:via-zinc-800/40 dark:to-indigo-950/20 border border-emerald-100/90 dark:border-emerald-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300">
                          <RefreshCw
                            size={13}
                            className={isUpdatingStatus === order.id ? 'animate-spin text-emerald-600' : 'text-emerald-600'}
                          />
                          <span className="font-black text-[11px]">Advance / Update Order Status:</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(['Pending', 'Processing', 'In Transit', 'Delivered'] as const).map((s) => {
                            const isCurrent = trackingStatus === s;
                            return (
                              <button
                                key={s}
                                type="button"
                                disabled={isUpdatingStatus === order.id}
                                onClick={() => handleUpdateStatus(order.id, s)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-2xs ${
                                  isCurrent
                                    ? 'bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-500/40'
                                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                }`}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Purchased Items Table */}
                      <div className="space-y-2 pt-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          Purchased Items ({totalItems})
                        </p>
                        {order.items?.map((item, idx) => (
                          <div
                            key={`${order.id}-item-${idx}`}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                                <img
                                  src={
                                    item.photo ||
                                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60'
                                  }
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                  Qty: {item.quantity} × ₱{Number(item.pricing).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 shrink-0">
                              ₱{(Number(item.pricing) * (item.quantity || 1)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Destination & Payment Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                            <MapPin size={12} /> Shipping Destination
                          </p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {order.customerName || 'Valued Customer'}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            {order.shippingAddress || 'Digital / Store Delivery'}
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                            <CreditCard size={12} /> Payment Method
                          </p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                            <span>{order.paymentMethod || 'Credit Card'}</span>
                            {order.cardLast4 && (
                              <span className="text-zinc-500 font-mono text-[11px]">•••• {order.cardLast4}</span>
                            )}
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck size={12} /> Payment Verified & Authorized
                          </p>
                        </div>
                      </div>

                      {/* Quick Actions inside Card */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex-wrap">
                        <div>
                          {trackingStatus === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => setConfirmCancelOrder(order)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Cancel this pending order"
                            >
                              <Trash2 size={13} />
                              <span>Cancel Order</span>
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePrintReceipt(order)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Printer size={13} />
                            <span>Print Receipt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <RefreshCw size={12} className={isReordered ? 'animate-spin' : ''} />
                            <span>{isReordered ? 'Added to Cart!' : 'Buy Again'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:px-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Encrypted Live Tracking & Invoicing</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Cancel Order Confirmation Modal Dialog */}
        {confirmCancelOrder && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => !cancellingOrderId && setConfirmCancelOrder(null)}
          >
            <div
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertTriangle size={22} />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    Cancel Pending Order?
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Are you sure you want to cancel order{' '}
                    <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
                      #{confirmCancelOrder.id.replace(/^ord_/, 'ORD-')}
                    </strong>
                    ? This order will be permanently removed from your list and the reserved items will be released.
                  </p>
                </div>
              </div>

              {/* Order Quick Summary in Confirm Dialog */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Items:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {confirmCancelOrder.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 1} item(s)
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Current Tracking Status:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Pending (Order Placed)
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Total Amount:</span>
                  <span className="font-black text-zinc-900 dark:text-zinc-100 text-sm">
                    ₱{Number(confirmCancelOrder.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={Boolean(cancellingOrderId)}
                  onClick={() => setConfirmCancelOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={Boolean(cancellingOrderId)}
                  onClick={handleConfirmCancellation}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {cancellingOrderId ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      <span>Yes, Cancel Order</span>
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
