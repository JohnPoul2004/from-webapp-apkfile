import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Mail,
  Lock,
  User,
  AtSign,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  LogOut,
  Home,
  Film,
  RotateCcw,
  Code,
  Newspaper,
  ShieldCheck,
  Bell,
  Send,
  Menu,
  Plus,
  Trash2,
  Play,
  MoreVertical,
  Pencil,
  BarChart3,
  Share2,
  MessageSquare,
  TrendingUp,
  Zap,
  Settings,
  MapPin,
  FileText,
  Vote,
  Shield,
  Music,
  Clapperboard,
  Tv,
  Building2,
  Utensils,
  Gamepad2,
  Laptop,
  Video,
  Flame,
  Heart,
  UserCheck,
  Sparkles,
  Trophy,
  Radio,
  HeartHandshake,
  Award,
  Smile,
  SmilePlus,
  Users,
  Layers,
  Calendar,
  Search,
  HelpCircle,
  Camera,
  Loader2,
  Sun,
  Moon,
  Compass,
  History,
  UserX,
  Tag,
  CreditCard,
  Clock,
  ShoppingCart,
  Package,
  MousePointerClick,
  CloudSun,
  PlayCircle,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  deleteField
} from 'firebase/firestore';
import { DashboardSection, SubTab, QuotaTierName, UserProfile, CartItem, OrderItem } from './types';
import { QUOTA_TIERS, getQuotaResetDate, isQuotaLimitExceeded } from './data/quotaTiers';
import CreateModal from './components/CreateModal';
import DeletedModal from './components/DeletedModal';
import ItemDetailModal from './components/ItemDetailModal';
import MyCartModal from './components/MyCartModal';
import MyOrdersModal from './components/MyOrdersModal';
import FirestoreRulesModal from './components/FirestoreRulesModal';
import { QuotaView } from './components/QuotaView';
import { UpgradeView } from './components/UpgradeView';
import { HelpView } from './components/HelpView';
import { ActivityLogView } from './components/ActivityLogView';
import { HighlightText } from './components/HighlightText';
import { ExportDataSection } from './components/ExportDataSection';
import { TagFilterBar } from './components/TagFilterBar';
import { TagManagerModal } from './components/TagManagerModal';
import { ProfilePictureHistoryModal, ProfilePictureHistoryItem } from './components/ProfilePictureHistoryModal';
import ItemCard from './components/ItemCard';
import { getTagStyle } from './utils/tagHelper';
import GetStartedTour from './components/GetStartedTour';
import PagesEventsManager from './components/PagesEventsManager';
import DeletionScheduled from './components/DeletionScheduled';
import DeactivatedView from './components/DeactivatedView';
import CommunityStandardsView from './components/CommunityStandardsView';
import TVScheduleView from './components/TVScheduleView';
import { WeatherSection } from './components/WeatherSection';
import { CatchNowView } from './components/CatchNowView';
import {
  handleFirestoreError,
  OperationType,
  getLocalItems,
  getDeletedLocalItems,
  deleteLocalItem,
  saveDeletedLocalItem,
  isPermissionDeniedError
} from './utils/firestoreHelper';
import { logActivity } from './utils/activityLogger';
import { getVideoThumbnail, getVideoDomain } from './utils/videoHelper';
import { getRelativeTime } from './utils/dateHelper';
import { optimizePayloadForFirestore, getEstimatedByteSize, readFileAsOptimizedDataUrl } from './utils/imageHelper';
import {
  verifyBeforeUpdateEmail,
  updateEmail,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { Key } from 'lucide-react';

const formatBytes = (bytes: number, decimals = 2): string => {
  if (!bytes || bytes <= 0) return '0 KB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i === 0) return `${bytes} B`;
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

function getCardBrand(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'unknown' {
  const digits = cardNumber.replace(/\D/g, '');
  if (!digits) return 'unknown';
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^(6011|65|64[4-9]|622)/.test(digits)) return 'discover';
  if (/^35/.test(digits)) return 'jcb';
  return 'unknown';
}

function isValidLuhnCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

const SUB_TABS: SubTab[] = ['Videos', 'Showbiz News', 'Photos', 'Polls', 'Quizzes', 'Shorts', 'Products'];

export const COMMUNITY_STANDARDS_SECTIONS = [
  'Copyright',
  'Community Standards',
  'Nudity or Sexual',
  'Spam and Scams',
  'Hate Speech',
  'Trademark',
  'Counterfeit',
  'Legal Complaint',
  'Privacy Standards',
  'Impersonation',
  'Harassment',
  'Violent or Graphic Content',
  'Guns, Drugs and Regulated Goods',
  'Harmful and Dangerous Policy',
  'Child Policy',
  'Defamation',
  'Circumvention of Technological Measures',
  'Content Removal and Account Termination'
];

// Helper to map tab names to requested button labels (Video, Showbiz News, Photos, Polls, Quiz)
const getItemLabel = (tab: SubTab): string => {
  switch (tab) {
    case 'Videos':
      return 'Video';
    case 'Showbiz News':
      return 'Showbiz News';
    case 'Photos':
      return 'Photos';
    case 'Polls':
      return 'Polls';
    case 'Quizzes':
      return 'Quiz';
    case 'Shorts':
      return 'Shorts';
    case 'Products':
      return 'Products';
    default:
      return tab;
  }
};

const getDeleteLabel = (tab: SubTab): string => {
  switch (tab) {
    case 'Videos':
      return 'Delete Videos';
    case 'Showbiz News':
      return 'Delete News';
    case 'Photos':
      return 'Delete Photos';
    case 'Polls':
      return 'Delete Polls';
    case 'Quizzes':
      return 'Delete Quiz';
    case 'Shorts':
      return 'Delete Shorts';
    case 'Products':
      return 'Delete Products';
    default:
      return 'Delete';
  }
};

export default function App() {
  const [showCommunityStandardsModal, setShowCommunityStandardsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active dashboard view
  const [activeSection, setActiveSection] = useState<DashboardSection>('Home');

  // Sub-tab for Entertainment, Replay, Coding, News (Home section has no tabs)
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Videos');

  // Mobile sidebar drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  // Header Options Dropdown state
  const [isHeaderOptionsOpen, setIsHeaderOptionsOpen] = useState(false);
  const headerOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerOptionsRef.current && !headerOptionsRef.current.contains(event.target as Node)) {
        setIsHeaderOptionsOpen(false);
      }
    };
    if (isHeaderOptionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHeaderOptionsOpen]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Create, Edit & Deleted modal states
  const [activeModal, setActiveModal] = useState<{
    type: 'create' | 'deleted' | 'edit';
    item: string;
    itemToEdit?: any;
  } | null>(null);

  // Get Started Overlay Tour state
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Check if new user should be guided with Get Started Tour
  useEffect(() => {
    if (currentUser && !authLoading) {
      try {
        const tourSeen = localStorage.getItem('dmm_get_started_tour_completed');
        if (!tourSeen) {
          const timer = setTimeout(() => {
            setIsTourOpen(true);
          }, 700);
          return () => clearTimeout(timer);
        }
      } catch {
        // ignore localStorage access error
      }
    }
  }, [currentUser, authLoading]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState('');
  const [tabItems, setTabItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [showTagManagerModal, setShowTagManagerModal] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Shopping Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('dmm_user_cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showCartModal, setShowCartModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [localProductClicks, setLocalProductClicks] = useState<number>(() => {
    try {
      const val = localStorage.getItem('dmm_product_clicks_count');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  const handleRecordProductClick = (_productId?: string) => {
    try {
      const next = (localProductClicks || 0) + 1;
      setLocalProductClicks(next);
      localStorage.setItem('dmm_product_clicks_count', String(next));
      window.dispatchEvent(new Event('dmm-product-click'));
    } catch (e) {
      console.warn('Failed to persist product click:', e);
    }
  };

  useEffect(() => {
    const handleSyncClick = () => {
      try {
        const val = localStorage.getItem('dmm_product_clicks_count');
        if (val) setLocalProductClicks(parseInt(val, 10));
      } catch {
        // ignore
      }
    };
    window.addEventListener('dmm-product-click', handleSyncClick);
    return () => window.removeEventListener('dmm-product-click', handleSyncClick);
  }, []);

  // Sync cart items with localStorage and window custom events
  useEffect(() => {
    const syncCart = () => {
      try {
        const raw = localStorage.getItem('dmm_user_cart');
        setCartItems(raw ? JSON.parse(raw) : []);
      } catch {
        setCartItems([]);
      }
    };
    const handleOpenCart = () => {
      syncCart();
      setShowCartModal(true);
    };
    window.addEventListener('dmm-cart-updated', syncCart);
    window.addEventListener('dmm-open-cart', handleOpenCart);
    window.addEventListener('storage', syncCart);
    return () => {
      window.removeEventListener('dmm-cart-updated', syncCart);
      window.removeEventListener('dmm-open-cart', handleOpenCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  // Sync orders count with Firestore and localStorage
  useEffect(() => {
    let unsubscribe = () => {};

    const syncLocalOrdersCount = () => {
      try {
        let count = 0;
        if (currentUser?.uid) {
          const userOrdersRaw = localStorage.getItem(`dmm_local_orders_${currentUser.uid}`);
          if (userOrdersRaw) {
            count += (JSON.parse(userOrdersRaw) || []).length;
          }
        }
        const genericRaw = localStorage.getItem('dmm_user_orders');
        if (genericRaw) {
          const genericList = JSON.parse(genericRaw) || [];
          count = Math.max(count, genericList.length);
        }
        setOrdersCount(count);
      } catch {
        // ignore
      }
    };

    if (currentUser?.uid) {
      try {
        const ordersRef = collection(db, 'users', currentUser.uid, 'orders');
        unsubscribe = onSnapshot(
          ordersRef,
          (snapshot) => {
            setOrdersCount(snapshot.size);
          },
          () => {
            syncLocalOrdersCount();
          }
        );
      } catch {
        syncLocalOrdersCount();
      }
    } else {
      syncLocalOrdersCount();
    }

    const handleOrdersSync = () => {
      syncLocalOrdersCount();
    };
    const handleOpenOrders = () => {
      syncLocalOrdersCount();
      setShowOrdersModal(true);
    };

    window.addEventListener('dmm-order-placed', handleOrdersSync);
    window.addEventListener('dmm-open-orders', handleOpenOrders);
    window.addEventListener('storage', handleOrdersSync);

    return () => {
      unsubscribe();
      window.removeEventListener('dmm-order-placed', handleOrdersSync);
      window.removeEventListener('dmm-open-orders', handleOpenOrders);
      window.removeEventListener('storage', handleOrdersSync);
    };
  }, [currentUser?.uid]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }, [cartItems]);

  const handleUpdateCart: React.Dispatch<React.SetStateAction<CartItem[]>> = (updater) => {
    setCartItems((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('dmm_user_cart', JSON.stringify(next));
        window.dispatchEvent(new Event('dmm-cart-updated'));
      } catch (e) {
        console.warn('Failed to save cart:', e);
      }
      return next;
    });
  };

  // Compute unique available tags with counts for the active tabItems
  const availableTags = useMemo(() => {
    const map = new Map<string, number>();
    tabItems.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          const cleaned = typeof tag === 'string' ? tag.trim().replace(/^#/, '') : '';
          if (cleaned) {
            map.set(cleaned, (map.get(cleaned) || 0) + 1);
          }
        });
      }
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [tabItems]);

  // Filter tabItems based on tag filter, search query (title or tag match)
  const filteredTabItems = useMemo(() => {
    return tabItems.filter((item) => {
      // 1. Tag filter matching
      if (selectedTagFilter) {
        const itemTags: string[] = Array.isArray(item.tags)
          ? item.tags.map((t: string) => (typeof t === 'string' ? t.trim().replace(/^#/, '').toLowerCase() : ''))
          : [];
        const matchesTag = itemTags.includes(selectedTagFilter.toLowerCase());
        if (!matchesTag) return false;
      }

      // 2. Search query matching (matches title or any assigned tag)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const tagMatch = Array.isArray(item.tags) && item.tags.some((t: string) =>
        (typeof t === 'string' ? t.toLowerCase() : '').includes(q)
      );
      return titleMatch || tagMatch;
    });
  }, [tabItems, selectedTagFilter, searchQuery]);
  const [selectedItemDetail, setSelectedItemDetail] = useState<any | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [hasFirestorePermissionError, setHasFirestorePermissionError] = useState(false);

  // Settings profile states
  const [settingsDisplayName, setSettingsDisplayName] = useState('');
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsPhotoURL, setSettingsPhotoURL] = useState('');
  const [settingsBillingStreet, setSettingsBillingStreet] = useState('');
  const [settingsBillingCity, setSettingsBillingCity] = useState('');
  const [settingsBillingState, setSettingsBillingState] = useState('');
  const [settingsBillingPostalCode, setSettingsBillingPostalCode] = useState('');
  const [settingsBillingCountry, setSettingsBillingCountry] = useState('');
  const [settingsCardholderName, setSettingsCardholderName] = useState('');
  const [settingsCardNumber, setSettingsCardNumber] = useState('');
  const [settingsExpiry, setSettingsExpiry] = useState('');
  const [settingsCvv, setSettingsCvv] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [paymentTouched, setPaymentTouched] = useState({
    cardNumber: false,
    expiry: false,
    cvv: false
  });

  // Profile Picture History state & handlers
  const [showPhotoHistoryModal, setShowPhotoHistoryModal] = useState(false);
  const [photoHistory, setPhotoHistory] = useState<ProfilePictureHistoryItem[]>([]);
  const [lastPhotoUpdateAt, setLastPhotoUpdateAt] = useState<string | null>(() => {
    try {
      const u = auth.currentUser?.uid;
      if (u) return localStorage.getItem(`dmm_last_photo_update_${u}`) || null;
    } catch (_) {}
    return null;
  });

  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  const lastPhotoUpdateMs = lastPhotoUpdateAt ? new Date(lastPhotoUpdateAt).getTime() : 0;
  const photoTimeDiff = lastPhotoUpdateAt ? Date.now() - lastPhotoUpdateMs : ONE_YEAR_MS + 1000;
  const isPhotoLocked = lastPhotoUpdateAt ? photoTimeDiff < ONE_YEAR_MS : false;
  const nextAllowedPhotoDate = lastPhotoUpdateAt ? new Date(lastPhotoUpdateMs + ONE_YEAR_MS) : null;
  const nextAllowedPhotoDateFormatted = nextAllowedPhotoDate
    ? nextAllowedPhotoDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const daysUntilNextPhotoEdit = nextAllowedPhotoDate
    ? Math.max(1, Math.ceil((nextAllowedPhotoDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  const handleSimulateYearPassed = () => {
    setLastPhotoUpdateAt(null);
    if (currentUser) {
      localStorage.removeItem(`dmm_last_photo_update_${currentUser.uid}`);
      setDoc(doc(db, 'users', currentUser.uid), { lastPhotoUpdateAt: null }, { merge: true }).catch(() => {});
    }
    setActionNotice('Profile picture edit limit unlocked! You can now update your picture.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  // Full Name and Username 100-Day Edit Policy state & handlers
  const [lastProfileNameUpdateAt, setLastProfileNameUpdateAt] = useState<string | null>(() => {
    try {
      const u = auth.currentUser?.uid;
      if (u) return localStorage.getItem(`dmm_last_name_update_${u}`) || null;
    } catch (_) {}
    return null;
  });

  const ONE_HUNDRED_DAYS_MS = 100 * 24 * 60 * 60 * 1000;
  const lastProfileNameUpdateMs = lastProfileNameUpdateAt ? new Date(lastProfileNameUpdateAt).getTime() : 0;
  const profileNameTimeDiff = lastProfileNameUpdateAt ? Date.now() - lastProfileNameUpdateMs : ONE_HUNDRED_DAYS_MS + 1000;
  const isProfileNameLocked = lastProfileNameUpdateAt ? profileNameTimeDiff < ONE_HUNDRED_DAYS_MS : false;
  const nextAllowedProfileNameDate = lastProfileNameUpdateAt ? new Date(lastProfileNameUpdateMs + ONE_HUNDRED_DAYS_MS) : null;
  const nextAllowedProfileNameDateFormatted = nextAllowedProfileNameDate
    ? nextAllowedProfileNameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const daysUntilNextProfileNameEdit = nextAllowedProfileNameDate
    ? Math.max(1, Math.ceil((nextAllowedProfileNameDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  const handleSimulate100DaysPassed = () => {
    setLastProfileNameUpdateAt(null);
    if (currentUser) {
      localStorage.removeItem(`dmm_last_name_update_${currentUser.uid}`);
      setDoc(doc(db, 'users', currentUser.uid), { lastProfileNameUpdateAt: null }, { merge: true }).catch(() => {});
    }
    setActionNotice('Name & Username edit limit unlocked! You can now change your Full Name and Username.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  useEffect(() => {
    if (currentUser) {
      try {
        const localSaved = localStorage.getItem(`dmm_avatar_history_${currentUser.uid}`);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed)) {
            setPhotoHistory(parsed);
          }
        }
      } catch (_) {}
    }
  }, [currentUser]);

  const addToPhotoHistory = (newPhotoURL: string) => {
    if (!newPhotoURL || !currentUser) return;

    setPhotoHistory((prev) => {
      const exists = prev.some((item) => item.url === newPhotoURL);
      if (exists) return prev;

      const newItem: ProfilePictureHistoryItem = {
        id: Date.now().toString(),
        url: newPhotoURL,
        uploadedAt: new Date().toISOString()
      };
      const updated = [newItem, ...prev];

      try {
        localStorage.setItem(`dmm_avatar_history_${currentUser.uid}`, JSON.stringify(updated));
      } catch (_) {}

      setDoc(doc(db, 'users', currentUser.uid), { avatarHistory: updated }, { merge: true }).catch(() => {});

      return updated;
    });
  };

  const handleDeletePhotoFromHistory = (id: string) => {
    if (!currentUser) return;
    setPhotoHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(`dmm_avatar_history_${currentUser.uid}`, JSON.stringify(updated));
      } catch (_) {}
      setDoc(doc(db, 'users', currentUser.uid), { avatarHistory: updated }, { merge: true }).catch(() => {});
      return updated;
    });
  };

  const handleClearPhotoHistory = () => {
    if (!currentUser) return;
    setPhotoHistory([]);
    try {
      localStorage.removeItem(`dmm_avatar_history_${currentUser.uid}`);
    } catch (_) {}
    setDoc(doc(db, 'users', currentUser.uid), { avatarHistory: [] }, { merge: true }).catch(() => {});
  };

  const paymentValidation = useMemo(() => {
    const brand = getCardBrand(settingsCardNumber);
    const rawCard = settingsCardNumber.replace(/\D/g, '');
    const rawCvv = settingsCvv.replace(/\D/g, '');

    let cardError: string | null = null;
    let cardValid = false;
    if (rawCard.length > 0) {
      const requiredDigits = brand === 'amex' ? 15 : 16;
      if (rawCard.length < 13) {
        cardError = `Card number must be ${brand === 'amex' ? '15 digits' : '16 digits'}`;
      } else if (rawCard.length < requiredDigits && rawCard.length < 16) {
        cardError = `Incomplete card number (${rawCard.length}/${requiredDigits} digits)`;
      } else if (!isValidLuhnCard(rawCard)) {
        cardError = 'Invalid card number checksum';
      } else {
        cardValid = true;
      }
    }

    let expiryError: string | null = null;
    let expiryValid = false;
    if (settingsExpiry.trim().length > 0) {
      if (settingsExpiry.trim().length < 5 || !settingsExpiry.includes('/')) {
        expiryError = 'Format must be MM/YY';
      } else {
        const [mmStr, yyStr] = settingsExpiry.trim().split('/');
        const mm = parseInt(mmStr, 10);
        const yy = parseInt(yyStr, 10);
        if (isNaN(mm) || mm < 1 || mm > 12) {
          expiryError = 'Month must be 01-12';
        } else if (isNaN(yy) || yyStr.length !== 2) {
          expiryError = 'Year must be 2 digits (YY)';
        } else {
          const now = new Date();
          const currentYear = now.getFullYear() % 100;
          const currentMonth = now.getMonth() + 1;
          if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
            expiryError = 'Card has expired';
          } else if (yy > currentYear + 30) {
            expiryError = 'Invalid expiration year';
          } else {
            expiryValid = true;
          }
        }
      }
    }

    let cvvError: string | null = null;
    let cvvValid = false;
    if (rawCvv.length > 0) {
      const expectedLen = brand === 'amex' ? 4 : 3;
      if (rawCvv.length < expectedLen) {
        cvvError = `CVV must be ${expectedLen} digits${brand === 'amex' ? ' for Amex' : ''}`;
      } else if (rawCvv.length > expectedLen && brand !== 'amex') {
        cvvError = 'CVV must be 3 digits';
      } else {
        cvvValid = true;
      }
    }

    return {
      brand,
      cardError,
      cardValid,
      expiryError,
      expiryValid,
      cvvError,
      cvvValid,
      hasAnyError: !!(cardError || expiryError || cvvError)
    };
  }, [settingsCardNumber, settingsExpiry, settingsCvv]);

  // Synchronize settings states when currentUser or currentUserProfile loaded
  useEffect(() => {
    if (currentUser) {
      setSettingsDisplayName(currentUserProfile?.fullName || currentUser.displayName || '');
      setSettingsUsername(currentUserProfile?.username || '');
      setSettingsPhotoURL(currentUserProfile?.photoURL || '');
      setSettingsBillingStreet(currentUserProfile?.billingAddress?.street || '');
      setSettingsBillingCity(currentUserProfile?.billingAddress?.city || '');
      setSettingsBillingState(currentUserProfile?.billingAddress?.state || '');
      setSettingsBillingPostalCode(currentUserProfile?.billingAddress?.postalCode || '');
      setSettingsBillingCountry(currentUserProfile?.billingAddress?.country || '');
      setSettingsCardholderName(currentUserProfile?.paymentMethod?.cardholderName || '');
      setSettingsCardNumber(currentUserProfile?.paymentMethod?.cardNumber || '');
      setSettingsExpiry(currentUserProfile?.paymentMethod?.expiry || '');
      setSettingsCvv(currentUserProfile?.paymentMethod?.cvv || '');
    }
  }, [currentUser, currentUserProfile]);
  const [quotaCounts, setQuotaCounts] = useState({
    videos: 0,
    news: 0,
    photos: 0,
    polls: 0,
    quiz: 0,
    shorts: 0,
    products: 0,
    shopping: 0,
    pages: 0,
    events: 0
  });
  const [quotaSizes, setQuotaSizes] = useState({
    videos: 0,
    news: 0,
    photos: 0,
    polls: 0,
    quiz: 0,
    shorts: 0,
    products: 0,
    shopping: 0,
    pages: 0,
    events: 0
  });

  const [allCategoriesItems, setAllCategoriesItems] = useState<Record<string, any[]>>({
    videos: [],
    showbizNews: [],
    photos: [],
    polls: [],
    quiz: [],
    shorts: [],
    products: [],
    pages: [],
    events: []
  });

  const [trafficPoints, setTrafficPoints] = useState<number[]>([150, 280, 190, 390, 320, 480, 610]);

  const [firestoreOverallMetrics, setFirestoreOverallMetrics] = useState<any>(null);

  const [activeQuotaTier, setActiveQuotaTier] = useState<QuotaTierName>(() => {
    try {
      const saved = localStorage.getItem('dmm_active_quota_tier');
      if (
        saved &&
        ['Free', 'Bronze', 'Silver', 'Ruby', 'Gold', 'Diamond', 'Platinum', 'Sapphire', 'Emerald', 'Amethyst', 'Pearl', 'Obsidian', 'Titanium'].includes(saved)
      ) {
        return saved as QuotaTierName;
      }
    } catch {}
    return 'Free';
  });

  const handleSelectTier = (tier: QuotaTierName) => {
    setActiveQuotaTier(tier);
    try {
      localStorage.setItem('dmm_active_quota_tier', tier);
    } catch {}
    setActionNotice(`Quota tier successfully updated to ${tier}! Storage and item limits updated.`);
  };

  const getCategoryKeyForSubTab = (subTab: string): 'videos' | 'news' | 'photos' | 'polls' | 'quiz' | 'shorts' | 'products' => {
    if (subTab === 'Videos') return 'videos';
    if (subTab === 'Showbiz News' || subTab === 'News') return 'news';
    if (subTab === 'Photos') return 'photos';
    if (subTab === 'Polls') return 'polls';
    if (subTab === 'Quiz') return 'quiz';
    if (subTab === 'Shorts') return 'shorts';
    if (subTab === 'Products') return 'products';
    return 'videos';
  };

  const handleCreateClick = () => {
    const catKey = getCategoryKeyForSubTab(activeSubTab);
    if (isQuotaLimitExceeded(quotaCounts, activeQuotaTier, catKey)) {
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
      setActionNotice(`Quota Limit Exceeded. Please upgrade your plan or reset the quota on ${formattedDate} at ${formattedTime}.`);
      return;
    }
    setActiveModal({ type: 'create', item: getItemLabel(activeSubTab) });
  };

  // Change Email State
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // Change Password State
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [resetEmailSending, setResetEmailSending] = useState(false);

  // Deactivate/Delete Account State
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [deactivateMsg, setDeactivateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deletionScheduledData, setDeletionScheduledData] = useState<{
    scheduledAt: any;
    deletionDate: any;
    reason?: string;
  } | null>(null);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [showDeactivateSection, setShowDeactivateSection] = useState(false);
  const [deactivateReasonInput, setDeactivateReasonInput] = useState('');

  const handleDeactivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeactivateMsg(null);
    const user = auth.currentUser;
    if (!user || !user.email) {
      setDeactivateMsg({ type: 'error', text: 'User session not found.' });
      return;
    }
    if (!deactivatePassword.trim()) {
      setDeactivateMsg({ type: 'error', text: 'Please enter your password to confirm.' });
      return;
    }
    if (!deactivateReasonInput.trim()) {
      setDeactivateMsg({ type: 'error', text: 'Please provide a reason for deactivating your account.' });
      return;
    }

    setDeactivateLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, deactivatePassword.trim());
      await reauthenticateWithCredential(user, credential);
      
      await setDoc(doc(db, 'users', user.uid), {
        isDeactivated: true,
        deactivationReason: deactivateReasonInput.trim(),
        deactivatedAt: serverTimestamp()
      }, { merge: true });

      setActionNotice('Your account has been deactivated. You can reactivate it by logging in again.');
      setTimeout(() => setActionNotice(''), 4000);
    } catch (err: any) {
      console.warn('Deactivate account notice:', err?.code || err?.message);
      const code = err?.code || '';
      let msg = 'Failed to deactivate account.';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        msg = 'Incorrect password.';
      } else if (err?.message) {
        msg = err.message;
      }
      setDeactivateMsg({ type: 'error', text: msg });
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeactivateMsg(null);
    const user = auth.currentUser;
    if (!user || !user.email) {
      setDeactivateMsg({ type: 'error', text: 'User session not found.' });
      return;
    }
    if (!deactivatePassword.trim()) {
      setDeactivateMsg({ type: 'error', text: 'Please enter your password to confirm.' });
      return;
    }
    if (!deletionReason.trim()) {
      setDeactivateMsg({ type: 'error', text: 'Please provide a reason for deleting your account.' });
      return;
    }

    setDeactivateLoading(true);
    try {
      // Step 1: Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, deactivatePassword.trim());
      await reauthenticateWithCredential(user, credential);
      
      // Step 2: Schedule deletion in Firestore (100 days from now)
      const now = new Date();
      const deletionDate = new Date();
      deletionDate.setDate(now.getDate() + 100);

      await setDoc(doc(db, 'users', user.uid), {
        deletionScheduledAt: serverTimestamp(),
        deletionDate: deletionDate,
        deletionReason: deletionReason.trim()
      }, { merge: true });

      // Step 3: Log out and show notice
      await signOut(auth);
      setLoginSuccessNotice('Account deletion scheduled successfully. You will be redirected.');
      setActiveTab('login');
      setActionNotice('Account deletion scheduled in 100 days.');
    } catch (err: any) {
      console.warn('Delete account notice:', err?.code || err?.message);
      const code = err?.code || '';
      let msg = 'Failed to schedule account deletion.';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        msg = 'Incorrect password.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please try again later.';
      } else if (err?.message) {
        msg = err.message;
      }
      setDeactivateMsg({ type: 'error', text: msg });
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleRestoreAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    setDeactivateLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        deletionScheduledAt: deleteField(),
        deletionDate: deleteField(),
        deletionReason: deleteField()
      });
      setDeletionScheduledData(null);
      setActionNotice('Account restored successfully!');
    } catch (err: any) {
      console.error('Failed to restore account:', err);
      alert('Failed to restore account. Please try again or contact support.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    const targetEmail = auth.currentUser?.email || currentUser?.email;
    if (!targetEmail) {
      setPasswordMsg({ type: 'error', text: 'No user email found to send reset link.' });
      return;
    }
    setResetEmailSending(true);
    setPasswordMsg(null);
    try {
      await sendPasswordResetEmail(auth, targetEmail.trim());
      setPasswordMsg({
        type: 'success',
        text: `Password reset link sent to ${targetEmail}! Check your inbox to create a new password.`
      });
    } catch (err: any) {
      console.warn('Password reset email notice:', err?.code || err?.message);
      const code = err?.code || '';
      let msg = 'Failed to send password reset email. Please try again.';
      if (code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a few moments and try again.';
      }
      setPasswordMsg({ type: 'error', text: msg });
    } finally {
      setResetEmailSending(false);
    }
  };

  const [currentEmailVerificationSending, setCurrentEmailVerificationSending] = useState(false);

  const handleSendCurrentEmailVerification = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      setEmailMsg({ type: 'error', text: 'No user session found.' });
      return;
    }
    setCurrentEmailVerificationSending(true);
    try {
      await sendEmailVerification(user);
      setEmailMsg({
        type: 'success',
        text: `Verification link sent to ${user.email}! Please check your inbox (and spam folder) to verify.`
      });
    } catch (err: any) {
      console.warn('Current email verification notice:', err?.code || err?.message);
      let msg = 'Failed to send verification email.';
      if (err?.code === 'auth/too-many-requests') {
        msg = 'Too many requests. Please wait a few moments before trying again.';
      }
      setEmailMsg({ type: 'error', text: msg });
    } finally {
      setCurrentEmailVerificationSending(false);
    }
  };

  const handleSettingsCardNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const brand = getCardBrand(raw);
    const maxDigits = brand === 'amex' ? 15 : 16;
    const truncated = raw.slice(0, maxDigits);

    let formatted = '';
    if (brand === 'amex') {
      if (truncated.length > 10) {
        formatted = `${truncated.slice(0, 4)} ${truncated.slice(4, 10)} ${truncated.slice(10)}`;
      } else if (truncated.length > 4) {
        formatted = `${truncated.slice(0, 4)} ${truncated.slice(4)}`;
      } else {
        formatted = truncated;
      }
    } else {
      const chunks = truncated.match(/.{1,4}/g);
      formatted = chunks ? chunks.join(' ') : truncated;
    }

    setSettingsCardNumber(formatted);
    setPaymentTouched(prev => ({ ...prev, cardNumber: true }));
  };

  const handleSettingsExpiryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const rawDigits = val.replace(/\D/g, '').slice(0, 4);

    if (rawDigits.length === 0) {
      setSettingsExpiry('');
      setPaymentTouched(prev => ({ ...prev, expiry: true }));
      return;
    }

    let formatted = rawDigits;
    if (rawDigits.length === 1) {
      const firstDigit = parseInt(rawDigits, 10);
      if (firstDigit >= 2 && firstDigit <= 9) {
        formatted = `0${firstDigit}/`;
      }
    } else if (rawDigits.length >= 2) {
      let month = parseInt(rawDigits.slice(0, 2), 10);
      if (month < 1) month = 1;
      if (month > 12) month = 12;
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const yearStr = rawDigits.slice(2);
      formatted = yearStr ? `${monthStr}/${yearStr}` : `${monthStr}/`;
    }

    setSettingsExpiry(formatted);
    setPaymentTouched(prev => ({ ...prev, expiry: true }));
  };

  const handleSettingsCvvInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const brand = getCardBrand(settingsCardNumber);
    const maxLen = brand === 'amex' ? 4 : 4;
    setSettingsCvv(raw.slice(0, maxLen));
    setPaymentTouched(prev => ({ ...prev, cvv: true }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const dName = settingsDisplayName.trim();
    const uName = settingsUsername.trim();
    if (!dName) {
      setActionNotice('Display Name cannot be empty.');
      return;
    }

    const nameOrUsernameChanged =
      dName !== (currentUserProfile?.fullName || '') ||
      uName !== (currentUserProfile?.username || '');

    if (nameOrUsernameChanged && isProfileNameLocked) {
      setActionNotice(`Full Name and Username can only be updated once every 100 days. Next edit available: ${nextAllowedProfileNameDateFormatted} (${daysUntilNextProfileNameEdit} days remaining).`);
      return;
    }

    // Check payment validation if any card field is provided
    const hasCardNumber = settingsCardNumber.trim().length > 0;
    const hasExpiry = settingsExpiry.trim().length > 0;
    const hasCvv = settingsCvv.trim().length > 0;

    if (hasCardNumber || hasExpiry || hasCvv) {
      setPaymentTouched({ cardNumber: true, expiry: true, cvv: true });
      if (paymentValidation.hasAnyError) {
        setActionNotice('Please fix payment method validation errors before saving.');
        return;
      }
      if (!hasCardNumber || !hasExpiry || !hasCvv) {
        setActionNotice('Please complete all payment fields (Card Number, Expiration, CVV).');
        return;
      }
    }

    setIsSavingSettings(true);
    try {
      // Update Firebase Auth Profile (Display Name only to avoid Photo URL length limit errors)
      await updateProfile(currentUser, {
        displayName: dName
      });

      const billingAddressObj = {
        street: settingsBillingStreet.trim(),
        city: settingsBillingCity.trim(),
        state: settingsBillingState.trim(),
        postalCode: settingsBillingPostalCode.trim(),
        country: settingsBillingCountry.trim()
      };

      const paymentMethodObj = {
        cardholderName: settingsCardholderName.trim(),
        cardNumber: settingsCardNumber.trim(),
        expiry: settingsExpiry.trim(),
        cvv: settingsCvv.trim()
      };

      const photoChanged = settingsPhotoURL !== (currentUserProfile?.photoURL || '');
      const nowIso = new Date().toISOString();

      if (settingsPhotoURL) {
        addToPhotoHistory(settingsPhotoURL);
      }

      if (photoChanged && settingsPhotoURL) {
        setLastPhotoUpdateAt(nowIso);
        try {
          localStorage.setItem(`dmm_last_photo_update_${currentUser.uid}`, nowIso);
        } catch (_) {}
      }

      if (nameOrUsernameChanged) {
        setLastProfileNameUpdateAt(nowIso);
        try {
          localStorage.setItem(`dmm_last_name_update_${currentUser.uid}`, nowIso);
        } catch (_) {}
      }

      // Synchronize in Firestore Database users/{uid} (Where base64 Photo URLs can be safely stored with no limits)
      await setDoc(doc(db, 'users', currentUser.uid), {
        fullName: dName,
        username: uName || null,
        photoURL: settingsPhotoURL || null,
        ...(photoChanged && settingsPhotoURL ? { lastPhotoUpdateAt: nowIso } : {}),
        ...(nameOrUsernameChanged ? { lastProfileNameUpdateAt: nowIso } : {}),
        billingAddress: billingAddressObj,
        paymentMethod: paymentMethodObj
      }, { merge: true });

      // Update local profile state
      setCurrentUserProfile({
        fullName: dName,
        username: uName,
        photoURL: settingsPhotoURL || '',
        billingAddress: billingAddressObj,
        paymentMethod: paymentMethodObj
      });

      // Clone currentUser object in React state to force re-render/update across the App
      setCurrentUser({
        ...currentUser,
        displayName: dName
      } as FirebaseUser);

      // Log Settings Update in Activity Log
      logActivity({
        action: 'SETTINGS',
        category: 'Profile',
        title: `Updated profile details (${dName})`,
        details: `Display Name: "${dName}"${uName ? ` | Username: "@${uName}"` : ''}${settingsPhotoURL ? ' | Updated avatar' : ''}`,
        section: 'Settings',
        userId: currentUser.uid,
        userEmail: currentUser.email || undefined,
        status: 'success'
      }).catch(() => {});

      setActionNotice('Account settings updated successfully!');
      setTimeout(() => setActionNotice(''), 4000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setActionNotice(`Failed to save settings: ${err.message || err}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);
    const user = auth.currentUser;
    const currentEmail = user?.email || currentUser?.email;

    if (!user || !currentEmail) {
      setEmailMsg({ type: 'error', text: 'User session not found. Please log in again.' });
      return;
    }
    if (!newEmailInput.trim()) {
      setEmailMsg({ type: 'error', text: 'Please enter a valid new email address.' });
      return;
    }
    if (currentEmail.toLowerCase() === newEmailInput.trim().toLowerCase()) {
      setEmailMsg({ type: 'error', text: 'New email must be different from current email.' });
      return;
    }
    if (!emailCurrentPassword.trim()) {
      setEmailMsg({ type: 'error', text: 'Please enter your current password to verify identity.' });
      return;
    }

    setEmailLoading(true);
    try {
      // Step 1: Re-authenticate current user before initiating email change
      const credential = EmailAuthProvider.credential(currentEmail, emailCurrentPassword.trim());
      await reauthenticateWithCredential(user, credential);

      // Step 2: Send verification Email link before Change Email takes effect
      try {
        await verifyBeforeUpdateEmail(user, newEmailInput.trim());
        setEmailMsg({
          type: 'success',
          text: `Verification email link sent to ${newEmailInput.trim()}! Please open the link in your inbox to verify and complete the email change.`
        });
        setNewEmailInput('');
        setEmailCurrentPassword('');
      } catch (verifyErr: any) {
        if (verifyErr?.code === 'auth/operation-not-allowed') {
          // If verifyBeforeUpdateEmail is not configured, fall back to updateEmail and dispatch verification email
          await updateEmail(user, newEmailInput.trim());
          try {
            await sendEmailVerification(user);
          } catch (_) {}
          setEmailMsg({
            type: 'success',
            text: `Email updated to ${newEmailInput.trim()}! A verification link was also sent to your new email.`
          });
          setNewEmailInput('');
          setEmailCurrentPassword('');
        } else {
          throw verifyErr;
        }
      }
    } catch (err: any) {
      console.warn('Change email notice:', err?.code || err?.message);
      let errMsg = 'Failed to send verification link / update email.';
      const code = err?.code || '';
      if (
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials'
      ) {
        errMsg = 'Incorrect current password.';
      } else if (code === 'auth/requires-recent-login') {
        errMsg = 'Please re-enter your current password to confirm email change.';
      } else if (code === 'auth/email-already-in-use') {
        errMsg = 'This email address is already in use by another account.';
      } else if (code === 'auth/invalid-email') {
        errMsg = 'Invalid email address format.';
      } else if (code === 'auth/too-many-requests') {
        errMsg = 'Too many requests. Please wait a few moments before trying again.';
      } else if (err?.message) {
        errMsg = err.message;
      }
      setEmailMsg({ type: 'error', text: errMsg });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    const user = auth.currentUser;
    const userEmail = user?.email || currentUser?.email;

    if (!user || !userEmail) {
      setPasswordMsg({ type: 'error', text: 'User session not found. Please log in again.' });
      return;
    }
    if (!passwordCurrentPassword.trim()) {
      setPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (!newPasswordInput) {
      setPasswordMsg({ type: 'error', text: 'Please enter a new password.' });
      return;
    }
    if (newPasswordInput.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordCurrentPassword.trim() === newPasswordInput) {
      setPasswordMsg({ type: 'error', text: 'New password must be different from current password.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(userEmail.trim(), passwordCurrentPassword.trim());
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPasswordInput);

      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setPasswordCurrentPassword('');
    } catch (err: any) {
      // Use console.warn instead of console.error so user credential mistakes do not trigger runtime error alerts
      console.warn('Password change authentication notice:', err?.code || err?.message);
      const code = err?.code || '';
      let errMsg = 'Failed to update password.';
      if (
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials'
      ) {
        errMsg = 'Incorrect current password. If you forgot your password, use the reset option below.';
      } else if (code === 'auth/requires-recent-login') {
        errMsg = 'Session expired. Please re-enter your current password.';
      } else if (code === 'auth/weak-password') {
        errMsg = 'New password is too weak. Please use at least 6 characters.';
      } else if (code === 'auth/too-many-requests') {
        errMsg = 'Too many attempts. Please try again later or use the password reset link.';
      } else if (err?.message) {
        errMsg = err.message;
      }
      setPasswordMsg({ type: 'error', text: errMsg });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Helper to calculate item count and total bytes per collection
  const calcCollectionStats = (userId: string, colName: string, firestoreDocs: any[] = []) => {
    const localActive = getLocalItems(userId, colName);
    const activeMap = new Map();
    localActive.forEach((it) => activeMap.set(it.id, it));
    firestoreDocs.forEach((it) => activeMap.set(it.id, it));
    const activeList = Array.from(activeMap.values());

    const localDeleted = getDeletedLocalItems(userId, colName);
    const deletedMap = new Map();
    localDeleted.forEach((it) => deletedMap.set(it.id, it));
    const deletedList = Array.from(deletedMap.values());

    const activeBytes = activeList.reduce((acc, item) => acc + getEstimatedByteSize(item), 0);
    const deletedBytes = deletedList.reduce((acc, item) => acc + getEstimatedByteSize(item), 0);

    return {
      count: activeList.length,
      bytes: activeBytes + deletedBytes
    };
  };

  // Listen to all subtab collections for Quota & limits
  useEffect(() => {
    if (!currentUser) return;
    const collections = ['videos', 'shorts', 'products', 'showbizNews', 'photos', 'polls', 'quiz', 'pages', 'events'] as const;
    const unsubs: (() => void)[] = [];

    const updateCategoryStats = (colName: typeof collections[number], firestoreDocs: any[] = []) => {
      const stats = calcCollectionStats(currentUser.uid, colName, firestoreDocs);
      const key = colName === 'showbizNews' ? 'news' : colName === 'quiz' ? 'quiz' : colName;
      setQuotaCounts((prev) => ({
        ...prev,
        [key]: stats.count,
        ...(key === 'products' ? { shopping: stats.count } : {})
      }));
      setQuotaSizes((prev) => ({
        ...prev,
        [key]: stats.bytes,
        ...(key === 'products' ? { shopping: stats.bytes } : {})
      }));

      // Resolve actual active list to compute analytics metrics
      const localActive = getLocalItems(currentUser.uid, colName);
      const activeMap = new Map();
      localActive.forEach((it) => activeMap.set(it.id, it));
      firestoreDocs.forEach((it) => activeMap.set(it.id, it));
      const activeList = Array.from(activeMap.values());
      setAllCategoriesItems((prev) => ({ ...prev, [colName]: activeList }));
    };

    collections.forEach((colName) => {
      const colRef = collection(db, 'users', currentUser.uid, colName);
      const unsub = onSnapshot(
        colRef,
        (snap) => {
          const firestoreDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          updateCategoryStats(colName, firestoreDocs);
        },
        () => {
          updateCategoryStats(colName, []);
        }
      );
      unsubs.push(unsub);
    });

    const onLocalUpdated = (e: any) => {
      const colName = e.detail?.colName;
      if (colName && collections.includes(colName as any)) {
        updateCategoryStats(colName as any, []);
      } else {
        collections.forEach((c) => updateCategoryStats(c, []));
      }
    };
    window.addEventListener('local_items_updated', onLocalUpdated);

    return () => {
      unsubs.forEach((u) => u());
      window.removeEventListener('local_items_updated', onLocalUpdated);
    };
  }, [currentUser]);

  // Synchronize overall channel traffic history with Firestore
  useEffect(() => {
    if (!currentUser) return;
    const trafficDocRef = doc(db, 'users', currentUser.uid, 'analytics', 'traffic');
    const unsub = onSnapshot(
      trafficDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.points) && data.points.length === 7) {
            setTrafficPoints(data.points);
          }
        } else {
          // Seed initial default traffic metrics to Firestore
          const defaultPoints = [150, 280, 190, 390, 320, 480, 610];
          setDoc(trafficDocRef, { points: defaultPoints }).catch(() => {});
          setTrafficPoints(defaultPoints);
        }
      },
      () => {
        setTrafficPoints([150, 280, 190, 390, 320, 480, 610]);
      }
    );
    return unsub;
  }, [currentUser]);

  // Helper to trigger live Firestore visits traffic spikes
  const incrementTrafficForToday = async (amount: number = 15) => {
    if (!currentUser) return;
    const trafficDocRef = doc(db, 'users', currentUser.uid, 'analytics', 'traffic');
    const todayIndex = new Date().getDay();
    const targetIdx = todayIndex === 0 ? 6 : todayIndex - 1;

    const newPoints = [...trafficPoints];
    newPoints[targetIdx] = (newPoints[targetIdx] || 0) + amount;

    try {
      await setDoc(trafficDocRef, { points: newPoints }, { merge: true });
    } catch (err) {
      console.error('Failed to update live traffic on Firestore:', err);
    }
  };

  // Real-time Analytics metrics calculation
  const analyticsData = React.useMemo(() => {
    let totalLikes = 0;
    let totalReacts = 0;
    let totalShares = 0;
    let totalComments = 0;
    let totalVotes = 0;
    let totalAnswers = 0;
    let totalProductClicks = localProductClicks;
    let totalOrders = ordersCount;
    if (!totalOrders) {
      try {
        const gen = localStorage.getItem('dmm_user_orders');
        if (gen) totalOrders = JSON.parse(gen).length || 0;
      } catch {
        // ignore
      }
    }

    const categoryBreakdown = {
      Videos: { count: 0, likes: 0, reacts: 0, shares: 0, comments: 0 },
      'Showbiz News': { count: 0, likes: 0, reacts: 0, shares: 0, comments: 0 },
      Photos: { count: 0, likes: 0, reacts: 0, shares: 0, comments: 0 },
      Polls: { count: 0, likes: 0, reacts: 0, shares: 0, comments: 0 },
      Quizzes: { count: 0, likes: 0, reacts: 0, shares: 0, comments: 0 },
      Pages: { count: 0, likes: 0, reacts: 0, shares: 0, comments: 0 },
      Events: { count: 0, likes: 0, reacts: 0, shares: 0, comments: 0 },
      Shopping: { count: 0, likes: 0, reacts: 0, shares: 0, comments: 0 },
    };

    Object.entries(allCategoriesItems).forEach(([colName, list]) => {
      let displayName: keyof typeof categoryBreakdown = 'Videos';
      if (colName === 'videos') displayName = 'Videos';
      else if (colName === 'showbizNews') displayName = 'Showbiz News';
      else if (colName === 'photos') displayName = 'Photos';
      else if (colName === 'polls') displayName = 'Polls';
      else if (colName === 'quiz') displayName = 'Quizzes';
      else if (colName === 'pages') displayName = 'Pages';
      else if (colName === 'events') displayName = 'Events';
      else if (colName === 'products' || colName === 'shopping') displayName = 'Shopping';

      list.forEach((item: any) => {
        // Compute likes count
        const itemLikes = typeof item.likesCount === 'number'
          ? item.likesCount
          : (item.likedUsers ? Object.keys(item.likedUsers).filter(k => item.likedUsers[k]).length : 0);

        // Compute reacts count
        const itemReacts = item.reactions ? Object.keys(item.reactions).length : 0;

        // Compute shares count (simulated baseline + interaction multiplier)
        const itemShares = typeof item.sharesCount === 'number'
          ? item.sharesCount
          : (item.shares || (itemLikes ? Math.floor(itemLikes * 0.45) + 1 : 0));

        // Compute comments count (simulated baseline + interaction multiplier)
        const itemComments = typeof item.commentsCount === 'number'
          ? item.commentsCount
          : (itemLikes ? Math.floor(itemLikes * 0.3) + 1 : 0);

        totalLikes += itemLikes;
        totalReacts += itemReacts;
        totalShares += itemShares;
        totalComments += itemComments;

        // Accumulate Poll votes if applicable
        if (colName === 'polls' && item.poll?.options) {
          item.poll.options.forEach((opt: any) => {
            totalVotes += typeof opt.votes === 'number' ? opt.votes : 0;
          });
        }

        // Accumulate Quiz answersCount if applicable
        if (colName === 'quiz') {
          totalAnswers += typeof item.answersCount === 'number' ? item.answersCount : 0;
        }

        // Accumulate Product clicks if shopping / products
        if (colName === 'products' || colName === 'shopping' || item.pricing) {
          const itemClicks = typeof item.clicks === 'number'
            ? item.clicks
            : typeof item.clicksCount === 'number'
              ? item.clicksCount
              : typeof item.views === 'number'
                ? item.views
                : (itemLikes ? itemLikes * 4 + 16 : 24);
          totalProductClicks += itemClicks;
        }

        if (categoryBreakdown[displayName]) {
          categoryBreakdown[displayName].count++;
          categoryBreakdown[displayName].likes += itemLikes;
          categoryBreakdown[displayName].reacts += itemReacts;
          categoryBreakdown[displayName].shares += itemShares;
          categoryBreakdown[displayName].comments += itemComments;
        }
      });
    });

    return {
      totalLikes,
      totalReacts,
      totalShares,
      totalComments,
      totalVotes,
      totalAnswers,
      totalProductClicks,
      totalOrders,
      categoryBreakdown,
    };
  }, [allCategoriesItems, localProductClicks, ordersCount]);

  // Synchronize overall analytics metrics with Firestore in real-time
  useEffect(() => {
    if (!currentUser) return;
    const overallDocRef = doc(db, 'users', currentUser.uid, 'analytics', 'overall');
    const unsub = onSnapshot(
      overallDocRef,
      (snap) => {
        if (snap.exists()) {
          setFirestoreOverallMetrics(snap.data());
        }
      },
      () => {
        setFirestoreOverallMetrics(null);
      }
    );
    return unsub;
  }, [currentUser]);

  // Automatically write recalculated client-side metrics into Firestore overall document
  useEffect(() => {
    if (!currentUser) return;
    const overallDocRef = doc(db, 'users', currentUser.uid, 'analytics', 'overall');
    const timer = setTimeout(async () => {
      try {
        await setDoc(overallDocRef, {
          totalLikes: analyticsData.totalLikes,
          totalReacts: analyticsData.totalReacts,
          totalShares: analyticsData.totalShares,
          totalComments: analyticsData.totalComments,
          totalVotes: analyticsData.totalVotes,
          totalAnswers: analyticsData.totalAnswers,
          totalProductClicks: analyticsData.totalProductClicks,
          totalOrders: analyticsData.totalOrders,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error('Failed to sync computed analytics with Firestore:', err);
      }
    }, 1000); // 1-second debounce to batch updates efficiently

    return () => clearTimeout(timer);
  }, [
    currentUser,
    analyticsData.totalLikes,
    analyticsData.totalReacts,
    analyticsData.totalShares,
    analyticsData.totalComments,
    analyticsData.totalVotes,
    analyticsData.totalAnswers,
    analyticsData.totalProductClicks,
    analyticsData.totalOrders
  ]);

  // Helper for Firestore collection mapping per subtab
  const getSubTabCollectionName = (tab: SubTab) => {
    switch (tab) {
      case 'Videos':
        return 'videos';
      case 'Shorts':
        return 'shorts';
      case 'Products':
        return 'products';
      case 'Showbiz News':
        return 'showbizNews';
      case 'Photos':
        return 'photos';
      case 'Polls':
        return 'polls';
      case 'Quizzes':
        return 'quiz';
      default:
        return 'videos';
    }
  };

  const handleEditItem = (item: any) => {
    setActiveMenuId(null);
    setActiveModal({
      type: 'edit',
      item: getItemLabel(activeSubTab),
      itemToEdit: item
    });
  };

  const handleDeleteItem = async (item: any) => {
    setActiveMenuId(null);
    if (!currentUser) return;
    const colName = getSubTabCollectionName(activeSubTab);
    const delColName = `${colName}_deleted`;
    const label = getItemLabel(activeSubTab);
    const deletedTimestamp = new Date().toISOString();

    const itemToTrash = await optimizePayloadForFirestore({
      ...item,
      deletedAt: deletedTimestamp,
      scheduledDays: 100,
      section: activeSection,
      subTab: activeSubTab
    });

    // 1. Move to deleted collection in Firestore
    try {
      const delDocRef = doc(db, 'users', currentUser.uid, delColName, item.id);
      await setDoc(delDocRef, {
        ...itemToTrash,
        deletedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/${delColName}/${item.id}`);
    }

    // 2. Remove from active collection in Firestore
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, colName, item.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/${colName}/${item.id}`);
    }

    // 3. Update local caches
    saveDeletedLocalItem(currentUser.uid, colName, itemToTrash);
    deleteLocalItem(currentUser.uid, colName, item.id);

    setTabItems((prev) => prev.filter((it) => it.id !== item.id));
    if (selectedItemDetail?.id === item.id) {
      setSelectedItemDetail(null);
    }

    // Log deletion in Activity Log
    logActivity({
      action: 'DELETE',
      category:
        activeSubTab === 'Videos'
          ? 'Videos'
          : activeSubTab === 'Showbiz News'
          ? 'News'
          : activeSubTab === 'Photos'
          ? 'Photos'
          : activeSubTab === 'Polls'
          ? 'Polls'
          : 'Quizzes',
      title: `Moved ${label} "${item.title || 'Item'}" to Trash`,
      details: `Section: ${activeSection} | Scheduled for permanent deletion in 100 days`,
      section: activeSection,
      userId: currentUser.uid,
      userEmail: currentUser.email || undefined,
      status: 'warning',
      metadata: {
        id: item.id,
        subTab: activeSubTab,
        section: activeSection
      }
    }).catch(() => {});

    setActionNotice(`${label} "${item.title || 'Item'}" moved to trash. Scheduled for deletion in 100 days.`);
  };

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState('');

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupErrors, setSignupErrors] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [signupSubmitting, setSignupSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  // Shake animation trigger state per field
  const [shakeFields, setShakeFields] = useState<Record<string, number>>({});

  const triggerShake = (fieldKeys: string[]) => {
    setShakeFields((prev) => {
      const next = { ...prev };
      fieldKeys.forEach((key) => {
        next[key] = (next[key] || 0) + 1;
      });
      return next;
    });
  };

  useEffect(() => {
    let userUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        // Real-time listener for Firestore user profile (to fetch and sync display name, base64 photo URL, etc.)
        const userRef = doc(db, 'users', user.uid);
        userUnsub = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setCurrentUserProfile({
              fullName: data.fullName || user.displayName || '',
              username: data.username || '',
              photoURL: data.photoURL || ''
            });

            if (data.deletionScheduledAt) {
              setDeletionScheduledData({
                scheduledAt: data.deletionScheduledAt,
                deletionDate: data.deletionDate,
                reason: data.deletionReason
              });
            } else {
              setDeletionScheduledData(null);
            }

            if (data.isDeactivated) {
              setIsDeactivated(true);
            } else {
              setIsDeactivated(false);
            }

            if (Array.isArray(data.avatarHistory) && data.avatarHistory.length > 0) {
              setPhotoHistory(data.avatarHistory);
              try {
                localStorage.setItem(`dmm_avatar_history_${user.uid}`, JSON.stringify(data.avatarHistory));
              } catch (_) {}
            }

            if (data.lastPhotoUpdateAt) {
              setLastPhotoUpdateAt(data.lastPhotoUpdateAt);
              try {
                localStorage.setItem(`dmm_last_photo_update_${user.uid}`, data.lastPhotoUpdateAt);
              } catch (_) {}
            }

            if (data.lastProfileNameUpdateAt) {
              setLastProfileNameUpdateAt(data.lastProfileNameUpdateAt);
              try {
                localStorage.setItem(`dmm_last_name_update_${user.uid}`, data.lastProfileNameUpdateAt);
              } catch (_) {}
            }
          } else {
            setCurrentUserProfile({
              fullName: user.displayName || '',
              username: '',
              photoURL: ''
            });
          }
        }, (err) => {
          console.warn('User profile snapshot error:', err);
        });

        // Ensure user profile exists in Firestore users/{uid}
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              fullName: user.displayName || user.email?.split('@')[0] || 'User',
              username: user.email?.split('@')[0] || 'user',
              email: user.email || '',
              quota: 100,
              createdAt: serverTimestamp()
            });
          }
        } catch (syncErr) {
          handleFirestoreError(syncErr, OperationType.WRITE, `users/${user.uid}`);
          if (isPermissionDeniedError(syncErr)) {
            setHasFirestorePermissionError(true);
          }
        }
      } else {
        setCurrentUserProfile(null);
        if (userUnsub) {
          userUnsub();
          userUnsub = null;
        }
      }
    });

    return () => {
      unsubscribe();
      if (userUnsub) userUnsub();
    };
  }, []);

  // Listen for items in current sub-tab from Firestore users/{uid}/{collection}
  useEffect(() => {
    setSelectedTagFilter(null);
    if (!currentUser || activeSection === 'Home') {
      setTabItems([]);
      return;
    }

    setItemsLoading(true);
    const colName = getSubTabCollectionName(activeSubTab);
    const colRef = collection(db, 'users', currentUser.uid, colName);

    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const firestoreDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const localDocs = getLocalItems(currentUser.uid, colName);
        const map = new Map();
        localDocs.forEach((it) => map.set(it.id, it));
        firestoreDocs.forEach((it) => map.set(it.id, it));
        const merged = Array.from(map.values());
        const filtered = merged.filter((item: any) => !item.section || item.section === activeSection);
        setTabItems(filtered);
        setItemsLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${currentUser.uid}/${colName}`);
        if (isPermissionDeniedError(err)) {
          setHasFirestorePermissionError(true);
        }
        const localDocs = getLocalItems(currentUser.uid, colName);
        const filtered = localDocs.filter((item: any) => !item.section || item.section === activeSection);
        setTabItems(filtered);
        setItemsLoading(false);
      }
    );

    const onLocalUpdated = (e: any) => {
      const customCol = e.detail?.colName;
      if (!customCol || customCol === colName) {
        const localDocs = getLocalItems(currentUser.uid, colName);
        setTabItems((prev) => {
          const map = new Map();
          prev.forEach((it) => map.set(it.id, it));
          localDocs.forEach((it) => map.set(it.id, it));
          return Array.from(map.values()).filter((item: any) => !item.section || item.section === activeSection);
        });
      }
    };
    window.addEventListener('local_items_updated', onLocalUpdated);

    return () => {
      unsub();
      window.removeEventListener('local_items_updated', onLocalUpdated);
    };
  }, [currentUser, activeSection, activeSubTab]);

  // Close card dropdown menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-dropdown-container]')) {
        setActiveMenuId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Close mobile sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Validation Patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fullNameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
  // 1 number, 1 Uppercase, 1 lowercase, 1 special character and 8 characters without spaces
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])\S{8,}$/;

  // Handle Login Submission (Auth Only - No Firestore)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSuccessNotice('');
    const errors: { email?: string; password?: string; general?: string } = {};
    const toShake: string[] = [];

    // Required fields for Login
    if (!loginEmail.trim()) {
      errors.email = 'Email is Required';
      toShake.push('login-email');
    } else if (!emailRegex.test(loginEmail.trim())) {
      errors.email = 'Invalid Email format';
      toShake.push('login-email');
    }

    if (!loginPassword) {
      errors.password = 'Password is Required';
      toShake.push('login-password');
    }

    setLoginErrors(errors);
    if (toShake.length > 0) {
      triggerShake(toShake);
      return;
    }

    setLoginSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      setLoginErrors({});
    } catch (err: any) {
      const code = err?.code || '';
      let generalMsg = '';
      if (code === 'auth/user-not-found') {
        generalMsg = "Email doesn't Exists, Please Create your Account";
        setLoginErrors({ general: generalMsg, email: "Email doesn't Exists, Please Create your Account" });
        triggerShake(['login-email']);
      } else if (
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials'
      ) {
        generalMsg = 'Incorrect Password, Please Try Again';
        setLoginErrors({ general: generalMsg, password: 'Incorrect Password, Please Try Again' });
        triggerShake(['login-password']);
      } else if (code === 'auth/invalid-email') {
        generalMsg = 'Invalid Email format';
        setLoginErrors({ general: generalMsg, email: 'Invalid Email format' });
        triggerShake(['login-email']);
      } else {
        generalMsg = 'Incorrect Password, Please Try Again';
        setLoginErrors({ general: generalMsg });
        triggerShake(['login-password']);
      }
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Handle Signup Submission (Auth Only - No Firestore)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSuccessNotice('');
    const errors: {
      fullName?: string;
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};
    const toShake: string[] = [];

    // Required Fields for Signup
    if (!fullName.trim()) {
      errors.fullName = 'Full Name is Required';
      toShake.push('signup-fullname');
    } else if (!fullNameRegex.test(fullName.trim())) {
      errors.fullName = 'Invalid Full Name format (letters and spaces only)';
      toShake.push('signup-fullname');
    }

    if (!username.trim()) {
      errors.username = 'Username is Required';
      toShake.push('signup-username');
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      errors.username = 'Username must be 3-20 characters (letters, numbers, _ only)';
      toShake.push('signup-username');
    }

    if (!signupEmail.trim()) {
      errors.email = 'Email is Required';
      toShake.push('signup-email');
    } else if (!emailRegex.test(signupEmail.trim())) {
      errors.email = 'Invalid Email format';
      toShake.push('signup-email');
    }

    if (!signupPassword) {
      errors.password = 'Password is Required';
      toShake.push('signup-password');
    } else if (!passwordRegex.test(signupPassword)) {
      errors.password =
        'Password must have 1 number, 1 uppercase, 1 lowercase, 1 special character and 8 characters without spaces';
      toShake.push('signup-password');
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Re-Enter Password is Required';
      toShake.push('signup-confirm-password');
    } else if (signupPassword !== confirmPassword) {
      errors.confirmPassword = "Password doesn't Match";
      toShake.push('signup-confirm-password');
    }

    setSignupErrors(errors);
    if (toShake.length > 0) {
      triggerShake(toShake);
      return;
    }

    setSignupSubmitting(true);
    const cleanUsername = username.trim().toLowerCase();

    // Check local client-side username cache (Auth Only - no Firestore)
    try {
      const takenList: string[] = JSON.parse(localStorage.getItem('auth_usernames') || '[]');
      if (takenList.includes(cleanUsername)) {
        setSignupErrors({ username: 'Username Already Taken' });
        triggerShake(['signup-username']);
        setSignupSubmitting(false);
        return;
      }
    } catch {
      // Ignore localStorage parse errors
    }

    try {
      // Create Firebase Auth user only
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail.trim(), signupPassword);
      const user = userCredential.user;

      // Send Email Verification Link before Create Account completes
      try {
        await sendEmailVerification(user);
      } catch (verificationErr) {
        console.warn('Email verification send notice:', verificationErr);
      }

      // Update Auth display name only (no database/firestore)
      try {
        updateProfile(user, { displayName: fullName.trim() });
      } catch (profileErr) {
        console.warn('Auth profile update:', profileErr);
      }

      // Save user profile to Firestore users/{uid}
      try {
        await setDoc(doc(db, 'users', user.uid), {
          fullName: fullName.trim(),
          username: cleanUsername,
          email: signupEmail.trim(),
          quota: 100,
          createdAt: serverTimestamp()
        });
      } catch (dbErr) {
        console.warn('Firestore user profile creation notice:', dbErr);
      }

      // Store username locally to guard duplicate usernames without database
      try {
        const takenList: string[] = JSON.parse(localStorage.getItem('auth_usernames') || '[]');
        if (!takenList.includes(cleanUsername)) {
          takenList.push(cleanUsername);
          localStorage.setItem('auth_usernames', JSON.stringify(takenList));
        }
      } catch {
        // Ignore storage errors
      }

      // Sign out temporary session so user is redirected to Login
      await signOut(auth);

      // Reset signup form
      setFullName('');
      setUsername('');
      setSignupEmail('');
      setSignupPassword('');
      setConfirmPassword('');
      setSignupErrors({});

      // On Successful for Signup redirect to Login
      setLoginEmail(signupEmail.trim());
      setLoginPassword('');
      setLoginSuccessNotice(
        'Account created successfully! An email verification link has been sent. Please log in.'
      );
      setActiveTab('login');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setSignupErrors({
          email: 'Email Already exists, please Login',
          general: 'Email Already exists, please Login'
        });
        triggerShake(['signup-email']);
      } else if (code === 'auth/invalid-email') {
        setSignupErrors({ email: 'Invalid Email format' });
        triggerShake(['signup-email']);
      } else if (code === 'auth/weak-password') {
        setSignupErrors({
          password:
            'Password must have 1 number, 1 uppercase, 1 lowercase, 1 special character and 8 characters without spaces'
        });
        triggerShake(['signup-password']);
      } else {
        setSignupErrors({ general: err.message || 'Signup failed. Please check your credentials.' });
      }
    } finally {
      setSignupSubmitting(false);
    }
  };

  // Handle Forgot Password Submission (Auth Only)
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim()) {
      setForgotError('Email is Required');
      triggerShake(['forgot-email']);
      return;
    }

    if (!emailRegex.test(forgotEmail.trim())) {
      setForgotError('Invalid Email format');
      triggerShake(['forgot-email']);
      return;
    }

    setForgotSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setForgotSuccess('Password reset link sent! Please check your inbox.');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        setForgotError("Email doesn't Exists, Please Create your Account");
        triggerShake(['forgot-email']);
      } else if (code === 'auth/invalid-email') {
        setForgotError('Invalid Email format');
        triggerShake(['forgot-email']);
      } else {
        setForgotError("Email doesn't Exists, Please Create your Account");
        triggerShake(['forgot-email']);
      }
    } finally {
      setForgotSubmitting(false);
    }
  };

  const navItems: { id: DashboardSection; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Pages', label: 'Pages', icon: Layers },
    { id: 'Events', label: 'Events', icon: Calendar },
    { id: 'Entertainment', label: 'Entertainment', icon: Film },
    { id: 'Replay', label: 'Replay', icon: RotateCcw },
    { id: 'Coding', label: 'Coding', icon: Code },
    { id: 'News', label: 'News', icon: Newspaper },
    { id: 'Music', label: 'Music', icon: Music },
    { id: 'Movies', label: 'Movies', icon: Clapperboard },
    { id: 'Idents', label: 'Idents', icon: Tv },
    { id: 'Public Affairs', label: 'Public Affairs', icon: Building2 },
    { id: 'Mukbang', label: 'Mukbang', icon: Utensils },
    { id: 'Gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'Tech', label: 'Tech', icon: Laptop },
    { id: 'Vlog', label: 'Vlog', icon: Video },
    { id: 'Smash', label: 'Smash', icon: Flame },
    { id: 'Mothers', label: 'Mothers', icon: Heart },
    { id: 'Fathers', label: 'Fathers', icon: UserCheck },
    { id: 'Specials', label: 'Specials', icon: Sparkles },
    { id: 'Sports', label: 'Sports', icon: Trophy },
    { id: 'Radio 1st', label: 'Radio 1st', icon: Radio },
    { id: 'Radio 2nd', label: 'Radio 2nd', icon: Radio },
    { id: 'Grandmothers', label: 'Grandmothers', icon: HeartHandshake },
    { id: 'Grandfathers', label: 'Grandfathers', icon: Award },
    { id: 'Granddaughters', label: 'Granddaughters', icon: Smile },
    { id: 'Grandsons', label: 'Grandsons', icon: SmilePlus },
    { id: 'Daughters', label: 'Daughters', icon: User },
    { id: 'Sons', label: 'Sons', icon: User },
    { id: 'Sisters', label: 'Sisters', icon: Users },
    { id: 'Brothers', label: 'Brothers', icon: Users },
    { id: 'Boyfriend', label: 'Boyfriend', icon: Heart },
    { id: 'Girlfriend', label: 'Girlfriend', icon: Heart },
    { id: 'Wife', label: 'Wife', icon: Heart },
    { id: 'Husband', label: 'Husband', icon: Heart },
    { id: 'Auntie', label: 'Auntie', icon: User },
    { id: 'Uncle', label: 'Uncle', icon: User },
    { id: 'Cousin', label: 'Cousin', icon: Users },
    { id: 'Nephew', label: 'Nephew', icon: User },
    { id: 'Niece', label: 'Niece', icon: User },
    { id: 'Quota', label: 'Quota', icon: BarChart3 },
    { id: 'Upgrade', label: 'Upgrade', icon: Zap },
    { id: 'Settings', label: 'Settings', icon: Settings },
    { id: 'Activity Log', label: 'Activity Log', icon: History },
    { id: 'Help', label: 'Help', icon: HelpCircle },
    { id: 'Community Standards', label: 'Community Standards', icon: ShieldCheck },
    { id: 'TV Schedule', label: 'TV Schedule', icon: Tv },
    { id: 'Weather', label: 'Weather', icon: CloudSun },
    { id: 'Catch Now', label: 'Catch Now', icon: PlayCircle },
    { id: 'Terms of Service', label: 'Terms of Service', icon: FileText },
    { id: 'Privacy Policy', label: 'Privacy Policy', icon: Shield },
  ];

  // Sidebar content component
  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full min-h-0">
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 min-h-0">
        {/* Brand / Logo */}
        <div id="sidebar-brand-header" className="flex items-center justify-between px-1 sm:px-2">
          <div className="flex items-center gap-3">
            <img
              src="/src/logo-list/logo.png"
              alt="Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain bg-zinc-950 border border-zinc-800 p-1 shrink-0 shadow-xs"
              onError={(e) => {
                // Fallback if image path differs
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate">Dashboard</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-[11px] text-zinc-500 font-medium truncate">{activeSection} View</p>
              </div>
            </div>
          </div>
          {isMobile && (
            <button
              type="button"
              id="mobile-sidebar-close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  if (isMobile) setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white shrink-0' : 'text-zinc-400 shrink-0'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="border-t border-zinc-200/80 pt-3 space-y-2.5 shrink-0">
        <div className="px-2 flex items-center gap-2.5">
          {currentUserProfile?.photoURL ? (
            <img
              src={currentUserProfile.photoURL}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border border-zinc-200 shadow-2xs shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {(currentUserProfile?.fullName || currentUser?.displayName || currentUser?.email || 'U').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
              {currentUserProfile?.fullName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate -mt-0.5">
              {currentUserProfile?.username ? `@${currentUserProfile.username}` : currentUser?.email}
            </p>
          </div>
        </div>
        <button
          id="logout-btn"
          type="button"
          onClick={() => {
            if (isMobile) setIsMobileMenuOpen(false);
            signOut(auth);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all cursor-pointer min-h-[44px]"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-zinc-900 dark:text-zinc-100" size={32} />
      </div>
    );
  }

  // If user is authenticated, render responsive Dashboard with Sidebar, Section Header, Tabs, Action Buttons, and Blank Page
  if (currentUser) {
    if (isDeactivated) {
      return (
        <DeactivatedView
          userId={currentUser.uid}
          onReactivate={() => setIsDeactivated(false)}
          onLogout={() => {
            setCurrentUser(null);
            setIsDeactivated(false);
          }}
        />
      );
    }
    if (deletionScheduledData) {
      return (
        <DeletionScheduled
          scheduledAt={deletionScheduledData.scheduledAt}
          deletionDate={deletionScheduledData.deletionDate}
          reason={deletionScheduledData.reason}
          onLogout={() => {
            setCurrentUser(null);
            setDeletionScheduledData(null);
          }}
          onRestore={handleRestoreAccount}
          isRestoring={deactivateLoading}
        />
      );
    }

    // Show tabs and buttons ONLY in Entertainment, Replay, Coding, News and other media categories
    const showSubTabsAndButtons = !['Home', 'Pages', 'Events', 'Quota', 'Upgrade', 'Settings', 'Activity Log', 'Help', 'Terms of Service', 'Privacy Policy', 'Community Standards', 'TV Schedule', 'Weather', 'Catch Now'].includes(activeSection);
    const currentItemLabel = getItemLabel(activeSubTab);

    return (
      <div id="home-layout" className="flex h-screen w-full bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans overflow-hidden relative">
        {/* Community Standards Modal Overlay */}
        {showCommunityStandardsModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-2 sm:p-4 shadow-2xl relative">
              <div className="sticky top-0 z-20 flex justify-end p-2 bg-gradient-to-b from-zinc-100 dark:from-zinc-950 via-zinc-100/90 dark:via-zinc-950/90 to-transparent">
                <button
                  type="button"
                  onClick={() => setShowCommunityStandardsModal(false)}
                  className="px-3.5 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl shadow-lg hover:opacity-90 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Close Standards</span>
                  <span>✕</span>
                </button>
              </div>
              <CommunityStandardsView onBackToDashboard={() => setShowCommunityStandardsModal(false)} />
            </div>
          </div>
        )}
        {/* Desktop / Tablet Landscape Sidebar (lg and above) */}
        <aside
          id="desktop-sidebar"
          className="hidden lg:flex w-64 xl:w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200/90 dark:border-zinc-800 flex-col p-5 xl:p-6 shadow-sm shrink-0"
        >
          {/* Quick Community Standards Banner in Sidebar */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowCommunityStandardsModal(true)}
              className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-900 dark:to-black border border-emerald-500/40 text-white shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>Platform Policy</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold border border-emerald-500/30">18 Standards</span>
              </div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                <span>Community Standards</span>
              </p>
              <p className="text-[10px] text-zinc-300 mt-0.5 line-clamp-1">Copyright, Nudity, Spam, Harassment & Termination</p>
            </button>
          </div>

          {renderSidebarContent(false)}
        </aside>

        {/* Mobile & Tablet Drawer Modal (below lg) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-xs"
              />
              {/* Slide-over Drawer */}
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                id="mobile-sidebar"
                className="relative z-10 w-72 max-w-[80vw] h-full bg-white dark:bg-zinc-900 p-5 shadow-2xl flex flex-col justify-between"
              >
                {renderSidebarContent(true)}
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden min-w-0">
          {/* Header */}
          <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Hamburger button for mobile and tablet */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                aria-label="Open sidebar menu"
              >
                <Menu size={20} />
              </button>
              <h1 id="current-section-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 truncate">
                {activeSection}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Header Options Dropdown Menu */}
              <div className="relative" ref={headerOptionsRef}>
                <button
                  type="button"
                  id="btn-header-options-dropdown"
                  onClick={() => setIsHeaderOptionsOpen((prev) => !prev)}
                  className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs active:scale-98 min-h-[38px] ${
                    isHeaderOptionsOpen
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm'
                      : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700'
                  }`}
                  title="Open Options Menu"
                  aria-label="Options Menu"
                >
                  <SlidersHorizontal size={14} className="shrink-0" />
                  <span>Options</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isHeaderOptionsOpen ? 'rotate-180' : ''}`}
                  />

                  {/* Notification / Alert / Cart Badge indicator on Options button */}
                  {(totalCartCount > 0 || ordersCount > 0 || hasFirestorePermissionError) && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[9px] font-black items-center justify-center">
                        {totalCartCount > 0 ? (totalCartCount > 9 ? '9+' : totalCartCount) : '!'}
                      </span>
                    </span>
                  )}
                </button>

                {/* Options Dropdown Panel */}
                <AnimatePresence>
                  {isHeaderOptionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 sm:w-72 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 p-2 shadow-2xl z-50 text-xs flex flex-col gap-1 backdrop-blur-md"
                    >
                      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80 mb-1 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Header Options
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ready
                        </span>
                      </div>

                      {/* 1. My Cart */}
                      <button
                        type="button"
                        id="opt-my-cart"
                        onClick={() => {
                          setIsHeaderOptionsOpen(false);
                          setShowCartModal(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <ShoppingCart size={15} />
                          </div>
                          <span className="font-semibold text-xs group-hover:text-zinc-950 dark:group-hover:text-white">
                            My Cart
                          </span>
                        </div>
                        {totalCartCount > 0 ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                            {totalCartCount > 99 ? '99+' : totalCartCount} items
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400">Empty</span>
                        )}
                      </button>

                      {/* 2. My Orders */}
                      <button
                        type="button"
                        id="opt-my-orders"
                        onClick={() => {
                          setIsHeaderOptionsOpen(false);
                          setShowOrdersModal(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Package size={15} />
                          </div>
                          <span className="font-semibold text-xs group-hover:text-zinc-950 dark:group-hover:text-white">
                            My Orders
                          </span>
                        </div>
                        {ordersCount > 0 ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-full">
                            {ordersCount} {ordersCount === 1 ? 'order' : 'orders'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400">0 orders</span>
                        )}
                      </button>

                      {/* 3. Tour */}
                      <button
                        type="button"
                        id="opt-get-started-tour"
                        onClick={() => {
                          setIsHeaderOptionsOpen(false);
                          setIsTourOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Compass size={15} />
                          </div>
                          <span className="font-semibold text-xs group-hover:text-zinc-950 dark:group-hover:text-white">
                            Get Started Tour
                          </span>
                        </div>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Interactive</span>
                      </button>

                      {/* 4. Dark Mode */}
                      <button
                        type="button"
                        id="opt-toggle-theme"
                        onClick={() => {
                          setIsDarkMode((prev) => !prev);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                            {isDarkMode ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-zinc-700 dark:text-zinc-300" />}
                          </div>
                          <span className="font-semibold text-xs group-hover:text-zinc-950 dark:group-hover:text-white">
                            Dark Mode
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-400">
                            {isDarkMode ? 'Enabled' : 'Disabled'}
                          </span>
                          <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
                          </div>
                        </div>
                      </button>

                      {/* 5. Notifications */}
                      <button
                        type="button"
                        id="opt-notifications"
                        onClick={() => {
                          setIsHeaderOptionsOpen(false);
                          setShowRulesModal(true);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                          hasFirestorePermissionError
                            ? 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            hasFirestorePermissionError
                              ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}>
                            <Bell size={15} className={hasFirestorePermissionError ? 'text-amber-600' : ''} />
                          </div>
                          <span className="font-semibold text-xs group-hover:text-zinc-950 dark:group-hover:text-white">
                            Notifications & Rules
                          </span>
                        </div>
                        {hasFirestorePermissionError ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                            Action Req.
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400">All Good</span>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Firestore Notice Banner if permission is denied */}
          {hasFirestorePermissionError && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                <span>
                  <strong>Firestore Notice:</strong> Cloud Firestore in project <code className="font-bold">dmm-network-acaf1</code> has default locked rules. Items are safely saved in local storage.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shrink-0 cursor-pointer"
              >
                View 1-Minute Fix
              </button>
            </div>
          )}

          {/* Sub-tabs & Action Buttons Bar: In Entertainment, Replay, Coding, and News (NOT Home) */}
          {showSubTabsAndButtons && (
            <div
              id="section-subtabs-toolbar"
              className="w-full bg-zinc-50 dark:bg-zinc-900/55 border-b border-zinc-200/80 dark:border-zinc-800 shrink-0 px-3 sm:px-6 lg:px-8 py-2.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3"
            >
              {/* Sub-tabs bar without icons */}
              <div
                id="section-subtabs-bar"
                className="overflow-x-auto scroll-smooth py-0.5 no-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div
                  role="tablist"
                  aria-label={`${activeSection} tabs`}
                  className="flex items-center gap-1 sm:gap-1.5 p-1 bg-zinc-200/70 dark:bg-zinc-800 rounded-xl sm:rounded-2xl w-max min-w-full sm:min-w-0 sm:w-auto"
                >
                  {SUB_TABS.map((tab) => {
                    const isTabActive = activeSubTab === tab;
                    const tabSlug = tab.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <button
                        key={tab}
                        id={`tab-${tabSlug}`}
                        role="tab"
                        aria-selected={isTabActive}
                        onClick={() => {
                          setActiveSubTab(tab);
                          setSearchQuery('');
                        }}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-150 whitespace-nowrap cursor-pointer min-h-[44px] flex items-center justify-center text-center touch-manipulation select-none ${
                          isTabActive
                            ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-300/40 dark:hover:bg-zinc-700/50 active:bg-zinc-300/60 dark:active:bg-zinc-700/80'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Videos, News, Photos, Polls and Quiz Progress Bar */}
              <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 bg-white rounded-xl border border-zinc-200 shadow-2xs shrink-0">
                <div className="text-left">
                  <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    <span>Videos, News, Photos, Polls, Quiz, Shorts & Products</span>
                    <span className="text-zinc-900 font-extrabold">{SUB_TABS.indexOf(activeSubTab) + 1} / 7</span>
                  </div>
                  <div className="w-28 bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200">
                    <div 
                      className="bg-zinc-900 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${((SUB_TABS.indexOf(activeSubTab) + 1) / 7) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons & Search Input: Responsive for Mobile, Tablet, and Desktop */}
              <div
                id="section-action-buttons"
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 shrink-0 w-full lg:w-auto"
              >
                {/* Search Input for filtering current tabItems */}
                <div className="relative w-full sm:w-44 md:w-52 lg:w-56 shrink-0">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${currentItemLabel.toLowerCase()}...`}
                    className="w-full pl-8 pr-7 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400 shadow-2xs min-h-[44px] sm:min-h-0"
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

                {/* Buttons: 2-column grid on mobile (<640px), flex row on tablet & desktop */}
                <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0">
                  {/* Create Button */}
                  <button
                    id={`btn-create-${currentItemLabel.toLowerCase().replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={handleCreateClick}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] shadow-xs active:scale-[0.98] whitespace-nowrap"
                  >
                    <Plus size={16} className="shrink-0" />
                    <span className="truncate">Create {currentItemLabel}</span>
                  </button>

                  {/* Deleted Button */}
                  <button
                    id={`btn-deleted-${currentItemLabel.toLowerCase().replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => {
                      setActiveModal({ type: 'deleted', item: currentItemLabel });
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 bg-zinc-200/90 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] active:scale-[0.98] whitespace-nowrap"
                  >
                    <Trash2 size={15} className="text-zinc-600 shrink-0" />
                    <span className="truncate">Deleted {currentItemLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Success Alert Notification */}
          {actionNotice && (
            <div
              className={`mx-4 sm:mx-6 lg:mx-8 mt-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between border gap-2 ${
                actionNotice.toLowerCase().includes('quota') || actionNotice.toLowerCase().includes('exceeded')
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap min-w-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {actionNotice.toLowerCase().includes('quota') || actionNotice.toLowerCase().includes('exceeded') ? (
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  ) : (
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                  )}
                  <span className="leading-tight">{actionNotice}</span>
                </div>
                {(actionNotice.toLowerCase().includes('quota') || actionNotice.toLowerCase().includes('exceeded')) && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('Upgrade');
                      setActionNotice('');
                    }}
                    className="ml-auto sm:ml-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap flex items-center gap-1 active:scale-95 shrink-0"
                  >
                    <Sparkles size={13} className="text-amber-300 shrink-0" />
                    <span>Upgrade Plan</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActionNotice('')}
                className={`p-1 cursor-pointer shrink-0 ${
                  actionNotice.toLowerCase().includes('quota') || actionNotice.toLowerCase().includes('exceeded')
                    ? 'text-rose-600 hover:text-rose-900'
                    : 'text-emerald-600 hover:text-emerald-900'
                }`}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Main Page Area */}
          <div className="flex-1 p-3.5 sm:p-6 lg:p-8 flex items-center justify-center overflow-auto min-h-0">
            {!showSubTabsAndButtons ? (
              <div className="w-full h-full overflow-y-auto p-2 sm:p-4">
                {activeSection === 'Home' && (
                  <div className="w-full h-full max-w-6xl mx-auto space-y-6 sm:space-y-8 py-2">
                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-zinc-50 to-zinc-100/50 dark:from-zinc-900 dark:to-zinc-900/30 p-5 sm:p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                          Welcome Back, {currentUserProfile?.fullName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Creator'}!
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                          Here is the real-time engagement and interaction metrics for your workspace.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-200 shadow-2xs">
                          <TrendingUp size={13} className="text-emerald-400 animate-pulse" />
                          Live Channels
                        </span>
                      </div>
                    </div>

                    {/* Analytics KPI Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
                      {/* Likes Card */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs min-h-[110px] sm:min-h-[120px] transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Likes</span>
                          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                            <Heart size={16} fill="currentColor" className="text-rose-500" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50 leading-none">
                            {(firestoreOverallMetrics?.totalLikes ?? analyticsData.totalLikes).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold flex items-center gap-1">
                            <TrendingUp size={10} className="text-emerald-500" />
                            <span>Direct user actions</span>
                          </p>
                        </div>
                      </div>

                      {/* Reacts Card */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs min-h-[110px] sm:min-h-[120px] transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Reactions</span>
                          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                            <Smile size={16} className="text-amber-500" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50 leading-none">
                            {(firestoreOverallMetrics?.totalReacts ?? analyticsData.totalReacts).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">
                            <span>👍 ❤️ 😂 😮</span>
                          </div>
                        </div>
                      </div>

                      {/* Shares Card */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs min-h-[110px] sm:min-h-[120px] transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Shares</span>
                          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center">
                            <Share2 size={16} className="text-sky-500" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50 leading-none">
                            {(firestoreOverallMetrics?.totalShares ?? analyticsData.totalShares).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold">
                            Simulated distribution
                          </p>
                        </div>
                      </div>

                      {/* Comments Card */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs min-h-[110px] sm:min-h-[120px] transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Comments</span>
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                            <MessageSquare size={16} className="text-emerald-500" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50 leading-none">
                            {(firestoreOverallMetrics?.totalComments ?? analyticsData.totalComments).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold">
                            Community discussion
                          </p>
                        </div>
                      </div>

                      {/* Poll Votes Card */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs min-h-[110px] sm:min-h-[120px] transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Votes</span>
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
                            <Vote size={16} className="text-indigo-500" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50 leading-none">
                            {(firestoreOverallMetrics?.totalVotes ?? analyticsData.totalVotes).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold">
                            Active poll selections
                          </p>
                        </div>
                      </div>

                      {/* Quiz Answers Card */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs min-h-[110px] sm:min-h-[120px] transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Answers</span>
                          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-500 flex items-center justify-center">
                            <HelpCircle size={16} className="text-violet-500" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50 leading-none">
                            {(firestoreOverallMetrics?.totalAnswers ?? analyticsData.totalAnswers).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold">
                            Quiz submissions completed
                          </p>
                        </div>
                      </div>

                      {/* Product Clicks Card */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs min-h-[110px] sm:min-h-[120px] transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Product Clicks</span>
                          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                            <MousePointerClick size={16} className="text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50 leading-none">
                            {(firestoreOverallMetrics?.totalProductClicks ?? analyticsData.totalProductClicks).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold flex items-center gap-1">
                            <TrendingUp size={10} className="text-teal-500" />
                            <span>Catalog interest</span>
                          </p>
                        </div>
                      </div>

                      {/* Orders Card */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs min-h-[110px] sm:min-h-[120px] transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Orders</span>
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Package size={16} className="text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50 leading-none">
                            {(firestoreOverallMetrics?.totalOrders ?? (ordersCount || analyticsData.totalOrders)).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold flex items-center gap-1">
                            <TrendingUp size={10} className="text-emerald-500" />
                            <span>Placed & recorded</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chart and Category split */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                      {/* SVG Line Chart for Weekly trends */}
                      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
                        {(() => {
                          const maxVal = Math.max(...trafficPoints, 100);
                          const p0 = 140 - ((trafficPoints[0] || 0) / maxVal) * 110;
                          const p1 = 140 - ((trafficPoints[1] || 0) / maxVal) * 110;
                          const p2 = 140 - ((trafficPoints[2] || 0) / maxVal) * 110;
                          const p3 = 140 - ((trafficPoints[3] || 0) / maxVal) * 110;
                          const p4 = 140 - ((trafficPoints[4] || 0) / maxVal) * 110;
                          const p5 = 140 - ((trafficPoints[5] || 0) / maxVal) * 110;
                          const p6 = 140 - ((trafficPoints[6] || 0) / maxVal) * 110;

                          const pathD = `M 0,${p0} 
                            C 41,${p0} 41,${p1} 83,${p1} 
                            C 125,${p1} 125,${p2} 166,${p2} 
                            C 208,${p2} 208,${p3} 250,${p3} 
                            C 291,${p3} 291,${p4} 333,${p4} 
                            C 375,${p4} 375,${p5} 416,${p5} 
                            C 458,${p5} 458,${p6} 500,${p6}`;

                          const fillD = `${pathD} L 500,160 L 0,160 Z`;

                          return (
                            <div>
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-50">Overall Channel Traffic</h3>
                                  <p className="text-xs text-zinc-400 mt-0.5">Interaction distribution over current cycle (Live Firestore)</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg">
                                    +12.4%
                                  </span>
                                </div>
                              </div>

                              {/* Custom SVG Spline Chart */}
                              <div className="h-48 w-full mt-6 relative select-none">
                                <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                                    </linearGradient>
                                  </defs>
                                  {/* Grid lines */}
                                  <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" className="dark:stroke-zinc-800/50" strokeWidth="1" />
                                  <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" className="dark:stroke-zinc-800/50" strokeWidth="1" />
                                  <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" className="dark:stroke-zinc-800/50" strokeWidth="1" />
                                  
                                  {/* Interpolated spline curve path based on engagement count */}
                                  <path
                                    d={pathD}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                  />

                                  {/* Fill area beneath curve */}
                                  <path
                                    d={fillD}
                                    fill="url(#chart-grad)"
                                  />

                                  {/* Interactive dots along the spline */}
                                  <circle cx="0" cy={p0} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5">
                                    <title>{`Mon: ${trafficPoints[0] || 0} visits`}</title>
                                  </circle>
                                  <circle cx="83" cy={p1} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5">
                                    <title>{`Tue: ${trafficPoints[1] || 0} visits`}</title>
                                  </circle>
                                  <circle cx="166" cy={p2} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5">
                                    <title>{`Wed: ${trafficPoints[2] || 0} visits`}</title>
                                  </circle>
                                  <circle cx="250" cy={p3} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5">
                                    <title>{`Thu: ${trafficPoints[3] || 0} visits`}</title>
                                  </circle>
                                  <circle cx="333" cy={p4} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5">
                                    <title>{`Fri: ${trafficPoints[4] || 0} visits`}</title>
                                  </circle>
                                  <circle cx="416" cy={p5} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5">
                                    <title>{`Sat: ${trafficPoints[5] || 0} visits`}</title>
                                  </circle>
                                  <circle cx="500" cy={p6} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2">
                                    <title>{`Sun: ${trafficPoints[6] || 0} visits`}</title>
                                  </circle>
                                </svg>
                              </div>
                            </div>
                          );
                        })()}

                        {/* X Axis Labels */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-2.5 px-1 uppercase tracking-wider">
                          <span>Mon ({trafficPoints[0] || 0})</span>
                          <span>Tue ({trafficPoints[1] || 0})</span>
                          <span>Wed ({trafficPoints[2] || 0})</span>
                          <span>Thu ({trafficPoints[3] || 0})</span>
                          <span>Fri ({trafficPoints[4] || 0})</span>
                          <span>Sat ({trafficPoints[5] || 0})</span>
                          <span>Sun ({trafficPoints[6] || 0})</span>
                        </div>
                      </div>

                      {/* Category Breakdown Progress Bars */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-50">Content Contribution</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">Media inventory & popularity</p>
                          
                          <div className="space-y-3.5 mt-5">
                            {Object.entries(analyticsData.categoryBreakdown).map(([catName, stats]) => {
                              // Calculate percentage contribution based on item count
                              const totalDocsCount = Object.values(analyticsData.categoryBreakdown).reduce((acc, c) => acc + c.count, 0) || 1;
                              const contributionPercent = Math.min(100, Math.round((stats.count / totalDocsCount) * 100));

                              return (
                                <div key={catName} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{catName}</span>
                                    <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500">
                                      {stats.count}
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        catName === 'Videos' ? 'bg-indigo-500' :
                                        catName === 'Showbiz News' ? 'bg-pink-500' :
                                        catName === 'Photos' ? 'bg-sky-500' :
                                        catName === 'Polls' ? 'bg-amber-500' :
                                        catName === 'Quizzes' ? 'bg-rose-500' :
                                        catName === 'Pages' ? 'bg-purple-500' :
                                        catName === 'Events' ? 'bg-teal-500' :
                                        catName === 'Shopping' ? 'bg-emerald-500' :
                                        'bg-teal-500'
                                      }`}
                                      style={{ width: `${contributionPercent}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive prompt */}
                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                          Total published items: <strong className="text-zinc-700 dark:text-zinc-300 font-extrabold">
                            {Object.values(analyticsData.categoryBreakdown).reduce((acc, c) => acc + c.count, 0)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === 'Pages' && (
                  <PagesEventsManager
                    type="Pages"
                    currentUser={currentUser}
                    currentUserProfile={currentUserProfile}
                    quotaCounts={quotaCounts}
                    activeTier={activeQuotaTier}
                    onActionNotice={setActionNotice}
                    onSelectTier={() => setActiveSection('Upgrade')}
                  />
                )}
                {activeSection === 'Events' && (
                  <PagesEventsManager
                    type="Events"
                    currentUser={currentUser}
                    currentUserProfile={currentUserProfile}
                    quotaCounts={quotaCounts}
                    activeTier={activeQuotaTier}
                    onActionNotice={setActionNotice}
                    onSelectTier={() => setActiveSection('Upgrade')}
                  />
                )}
                {activeSection === 'Quota' && (
                  <QuotaView
                    quotaCounts={{
                      ...quotaCounts,
                      shopping: quotaCounts.shopping !== undefined ? quotaCounts.shopping : quotaCounts.products
                    }}
                    quotaSizes={{
                      ...quotaSizes,
                      shopping: quotaSizes.shopping !== undefined ? quotaSizes.shopping : quotaSizes.products
                    }}
                    activeTier={activeQuotaTier}
                    onSelectTier={handleSelectTier}
                    onNavigateToUpgrade={() => setActiveSection('Upgrade')}
                  />
                )}
                {activeSection === 'Upgrade' && (
                  <UpgradeView
                    activeTier={activeQuotaTier}
                    currentUserProfile={currentUserProfile}
                    onSelectTier={handleSelectTier}
                  />
                )}

                {activeSection === 'Settings' && (
                  <div className="max-w-4xl mx-auto space-y-6 py-6">
                    <form onSubmit={handleSaveSettings} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-5">
                      <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                          Account Settings
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage your profile details and preferences</p>
                      </div>

                      {/* Profile Picture Policy Card */}
                      <div className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                        isPhotoLocked
                          ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                          : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-bold">
                            <Clock size={16} className={isPhotoLocked ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'} />
                            <span>1-Year Profile Picture Edit Policy</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isPhotoLocked
                                ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            }`}>
                              {isPhotoLocked ? `Locked (${daysUntilNextPhotoEdit}d left)` : 'Editable Now'}
                            </span>
                          </div>

                          {isPhotoLocked && (
                            <button
                              type="button"
                              onClick={handleSimulateYearPassed}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                            >
                              Bypass 1-Year Lock (Dev/Test Mode)
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {isPhotoLocked ? (
                            <span>
                              Your profile picture was last updated on <strong>{new Date(lastPhotoUpdateMs).toLocaleDateString()}</strong>.
                              Under the community policy, you can edit your profile picture once every 1 year (365 days).
                              Next edit date available: <strong>{nextAllowedPhotoDateFormatted}</strong> ({daysUntilNextPhotoEdit} days remaining).
                            </span>
                          ) : (
                            <span>
                              You can update your profile picture now. Note: Profile pictures can only be changed once every 1 year (365 days) to preserve verified identity across discussions.
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Profile Picture Upload Section */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                        <div className="relative group shrink-0">
                          {settingsPhotoURL ? (
                            <img
                              src={settingsPhotoURL}
                              alt="Avatar Preview"
                              className="w-20 h-20 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700 shadow-xs"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-200 font-black text-2xl flex items-center justify-center shadow-xs">
                              {(settingsDisplayName || currentUser?.email || 'U').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <label className={`absolute bottom-0 right-0 p-1.5 rounded-full text-white border border-white dark:border-zinc-800 shadow-sm transition-colors ${
                            isPhotoLocked ? 'bg-zinc-500 cursor-not-allowed' : 'bg-zinc-900 cursor-pointer hover:bg-zinc-800'
                          }`}>
                            <Camera size={14} />
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isPhotoLocked}
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (isPhotoLocked) {
                                  alert(`Profile pictures can only be changed once every 1 year (365 days).\n\nLast updated: ${new Date(lastPhotoUpdateMs).toLocaleDateString()}\nNext allowed edit date: ${nextAllowedPhotoDateFormatted} (${daysUntilNextPhotoEdit} days remaining).`);
                                  return;
                                }
                                try {
                                  const optimized = await readFileAsOptimizedDataUrl(file, 400, 400, 0.7);
                                  setSettingsPhotoURL(optimized);
                                  addToPhotoHistory(optimized);
                                } catch (err: any) {
                                  alert(err.message || 'Failed to process image');
                                }
                              }}
                            />
                          </label>
                        </div>
                        <div className="text-center sm:text-left space-y-1">
                          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Profile Picture</h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Upload a photo or custom graphic to represent your profile
                          </p>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                            <label className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors shadow-2xs flex items-center gap-1.5 min-h-[32px] ${
                              isPhotoLocked
                                ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer'
                            }`}>
                              <Camera size={13} className="text-zinc-500 dark:text-zinc-400" />
                              <span>{isPhotoLocked ? 'Edit Locked' : 'Choose Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={isPhotoLocked}
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (isPhotoLocked) {
                                    alert(`Profile pictures can only be changed once every 1 year (365 days).\n\nLast updated: ${new Date(lastPhotoUpdateMs).toLocaleDateString()}\nNext allowed edit date: ${nextAllowedPhotoDateFormatted} (${daysUntilNextPhotoEdit} days remaining).`);
                                    return;
                                  }
                                  try {
                                    const optimized = await readFileAsOptimizedDataUrl(file, 400, 400, 0.7);
                                    setSettingsPhotoURL(optimized);
                                    addToPhotoHistory(optimized);
                                  } catch (err: any) {
                                    alert(err.message || 'Failed to process image');
                                  }
                                }}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => setShowPhotoHistoryModal(true)}
                              className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5 min-h-[32px]"
                            >
                              <History size={13} className="text-indigo-600 dark:text-indigo-400" />
                              <span>Profile Picture History</span>
                              {photoHistory.length > 0 && (
                                <span className="px-1.5 py-0.2 bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-full text-[10px] font-extrabold">
                                  {photoHistory.length}
                                </span>
                              )}
                            </button>

                            {settingsPhotoURL && (
                              <button
                                type="button"
                                disabled={isPhotoLocked}
                                onClick={() => {
                                  if (isPhotoLocked) {
                                    alert(`Profile pictures cannot be removed while locked under the 1-Year Edit Policy.\nNext allowed edit date: ${nextAllowedPhotoDateFormatted} (${daysUntilNextPhotoEdit} days remaining).`);
                                    return;
                                  }
                                  setSettingsPhotoURL('');
                                }}
                                title={isPhotoLocked ? `Locked under 1-Year Policy (${daysUntilNextPhotoEdit} days left)` : 'Remove profile picture'}
                                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors min-h-[32px] ${
                                  isPhotoLocked
                                    ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                                    : 'border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 cursor-pointer'
                                }`}
                              >
                                {isPhotoLocked ? 'Remove Picture (Locked)' : 'Remove Picture'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 100-Day Name & Username Edit Policy Card */}
                      <div className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                        isProfileNameLocked
                          ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                          : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-bold">
                            <Clock size={16} className={isProfileNameLocked ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'} />
                            <span>100-Day Name & Username Edit Policy</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isProfileNameLocked
                                ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            }`}>
                              {isProfileNameLocked ? `Locked (${daysUntilNextProfileNameEdit}d left)` : 'Editable Now'}
                            </span>
                          </div>

                          {isProfileNameLocked && (
                            <button
                              type="button"
                              onClick={handleSimulate100DaysPassed}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                            >
                              Bypass 100-Day Lock (Dev/Test Mode)
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {isProfileNameLocked ? (
                            <span>
                              Your Full Name and Username were last updated on <strong>{new Date(lastProfileNameUpdateMs).toLocaleDateString()}</strong>.
                              Under the community trust policy, name changes can only be made once every 100 days.
                              Next edit date available: <strong>{nextAllowedProfileNameDateFormatted}</strong> ({daysUntilNextProfileNameEdit} days remaining).
                            </span>
                          ) : (
                            <span>
                              You can update your Full Name and Username now. Note: Once changed, your name and username will be locked for 100 days to preserve identity consistency across discussions.
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Display Name / Full Name</label>
                            {isProfileNameLocked && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                🔒 Locked for {daysUntilNextProfileNameEdit} days
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            required
                            disabled={isProfileNameLocked}
                            value={settingsDisplayName}
                            onChange={(e) => setSettingsDisplayName(e.target.value)}
                            className={`w-full px-3 py-2 text-xs rounded-xl border transition-all font-medium ${
                              isProfileNameLocked
                                ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                            }`}
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Username</label>
                            {isProfileNameLocked && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                🔒 Locked for {daysUntilNextProfileNameEdit} days
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-xs font-bold">@</span>
                            <input
                              type="text"
                              disabled={isProfileNameLocked}
                              value={settingsUsername}
                              onChange={(e) => setSettingsUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                              className={`w-full pl-7 pr-3 py-2 text-xs rounded-xl border transition-all font-medium ${
                                isProfileNameLocked
                                  ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                                  : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                              }`}
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Current Email Address</label>
                            {currentUser?.email && (
                              currentUser.emailVerified ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/30">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  Email Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/30">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  Unverified
                                </span>
                              )
                            )}
                          </div>
                          <input type="email" disabled defaultValue={currentUser?.email || ''} className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-500 dark:text-zinc-400 cursor-not-allowed" />
                        </div>
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                              <MapPin size={13} className="text-zinc-500" />
                              <span>Billing & Shipping Address</span>
                            </h4>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Used for shipping orders, merchandise delivery, invoices, subscriptions, and receipts.</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Street Address</label>
                            <input
                              type="text"
                              value={settingsBillingStreet}
                              onChange={(e) => setSettingsBillingStreet(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 font-medium"
                              placeholder="123 Main St, Apt 4B"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">City</label>
                              <input
                                type="text"
                                value={settingsBillingCity}
                                onChange={(e) => setSettingsBillingCity(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 font-medium"
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">State / Province</label>
                              <input
                                type="text"
                                value={settingsBillingState}
                                onChange={(e) => setSettingsBillingState(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 font-medium"
                                placeholder="State"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Postal Code</label>
                              <input
                                type="text"
                                value={settingsBillingPostalCode}
                                onChange={(e) => setSettingsBillingPostalCode(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 font-medium"
                                placeholder="ZIP / Postal"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Country</label>
                            <input
                              type="text"
                              value={settingsBillingCountry}
                              onChange={(e) => setSettingsBillingCountry(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 font-medium"
                              placeholder="Country"
                            />
                          </div>
                        </div>

                        {/* Payment Methods Section */}
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                              <CreditCard size={13} className="text-zinc-500" />
                              <span>Payment Methods</span>
                            </h4>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Save or update your credit card information securely for subscriptions and purchases.</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Cardholder Name</label>
                            <input
                              type="text"
                              value={settingsCardholderName}
                              onChange={(e) => setSettingsCardholderName(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 font-medium"
                              placeholder="Juan Dela Cruz"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Card Number</label>
                              <div className="flex items-center gap-1">
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border transition-colors ${paymentValidation.brand === 'visa' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>Visa</span>
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border transition-colors ${paymentValidation.brand === 'mastercard' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>MC</span>
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border transition-colors ${paymentValidation.brand === 'amex' ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>Amex</span>
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border transition-colors ${paymentValidation.brand === 'discover' ? 'bg-orange-600 text-white border-orange-600 shadow-xs' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>Disc</span>
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border transition-colors ${paymentValidation.brand === 'jcb' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>JCB</span>
                              </div>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={settingsCardNumber}
                                onChange={handleSettingsCardNumberInput}
                                onBlur={() => setPaymentTouched(prev => ({ ...prev, cardNumber: true }))}
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                className={`w-full pl-9 pr-8 py-2 text-xs font-mono tracking-wider bg-zinc-50 dark:bg-zinc-800 border rounded-xl focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 font-medium ${
                                  paymentTouched.cardNumber && paymentValidation.cardError
                                    ? 'border-rose-400 dark:border-rose-500/70 focus:ring-rose-500'
                                    : paymentTouched.cardNumber && paymentValidation.cardValid
                                    ? 'border-emerald-500 dark:border-emerald-500/70 focus:ring-emerald-500'
                                    : 'border-zinc-200 dark:border-zinc-700 focus:ring-zinc-900 dark:focus:ring-zinc-100'
                                }`}
                              />
                              <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                              {paymentTouched.cardNumber && settingsCardNumber.length > 0 && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                  {paymentValidation.cardValid ? (
                                    <CheckCircle size={15} className="text-emerald-500" />
                                  ) : paymentValidation.cardError ? (
                                    <AlertCircle size={15} className="text-rose-500" />
                                  ) : null}
                                </div>
                              )}
                            </div>
                            {paymentTouched.cardNumber && paymentValidation.cardError && (
                              <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                                <AlertCircle size={12} />
                                <span>{paymentValidation.cardError}</span>
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Expiration</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={settingsExpiry}
                                  onChange={handleSettingsExpiryInput}
                                  onBlur={() => setPaymentTouched(prev => ({ ...prev, expiry: true }))}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  className={`w-full px-3 pr-7 py-2 text-xs font-mono text-center bg-zinc-50 dark:bg-zinc-800 border rounded-xl focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 font-medium ${
                                    paymentTouched.expiry && paymentValidation.expiryError
                                      ? 'border-rose-400 dark:border-rose-500/70 focus:ring-rose-500'
                                      : paymentTouched.expiry && paymentValidation.expiryValid
                                      ? 'border-emerald-500 dark:border-emerald-500/70 focus:ring-emerald-500'
                                      : 'border-zinc-200 dark:border-zinc-700 focus:ring-zinc-900 dark:focus:ring-zinc-100'
                                  }`}
                                />
                                {paymentTouched.expiry && settingsExpiry.length > 0 && (
                                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                    {paymentValidation.expiryValid ? (
                                      <CheckCircle size={14} className="text-emerald-500" />
                                    ) : paymentValidation.expiryError ? (
                                      <AlertCircle size={14} className="text-rose-500" />
                                    ) : null}
                                  </div>
                                )}
                              </div>
                              {paymentTouched.expiry && paymentValidation.expiryError && (
                                <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                                  <AlertCircle size={11} />
                                  <span>{paymentValidation.expiryError}</span>
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                CVV <span className="text-[10px] text-zinc-400 font-normal">({paymentValidation.brand === 'amex' ? '4 digits' : '3 digits'})</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="password"
                                  value={settingsCvv}
                                  onChange={handleSettingsCvvInput}
                                  onBlur={() => setPaymentTouched(prev => ({ ...prev, cvv: true }))}
                                  placeholder={paymentValidation.brand === 'amex' ? '1234' : '123'}
                                  maxLength={4}
                                  className={`w-full pl-3 pr-8 py-2 text-xs font-mono text-center bg-zinc-50 dark:bg-zinc-800 border rounded-xl focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 font-medium ${
                                    paymentTouched.cvv && paymentValidation.cvvError
                                      ? 'border-rose-400 dark:border-rose-500/70 focus:ring-rose-500'
                                      : paymentTouched.cvv && paymentValidation.cvvValid
                                      ? 'border-emerald-500 dark:border-emerald-500/70 focus:ring-emerald-500'
                                      : 'border-zinc-200 dark:border-zinc-700 focus:ring-zinc-900 dark:focus:ring-zinc-100'
                                  }`}
                                />
                                <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                {paymentTouched.cvv && settingsCvv.length > 0 && (
                                  <div className="absolute right-7 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                    {paymentValidation.cvvValid ? (
                                      <CheckCircle size={13} className="text-emerald-500" />
                                    ) : paymentValidation.cvvError ? (
                                      <AlertCircle size={13} className="text-rose-500" />
                                    ) : null}
                                  </div>
                                )}
                              </div>
                              {paymentTouched.cvv && paymentValidation.cvvError && (
                                <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                                  <AlertCircle size={11} />
                                  <span>{paymentValidation.cvvError}</span>
                                </p>
                              )}
                            </div>
                          </div>
                         </div>

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Email Notifications</p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Receive weekly updates and alerts</p>
                          </div>
                          <input type="checkbox" defaultChecked className="w-4 h-4 accent-zinc-900 dark:accent-zinc-100 cursor-pointer" />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingSettings}
                          className="px-4 py-2 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-white dark:text-zinc-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 min-h-[38px]"
                        >
                          {isSavingSettings ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save Changes</span>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Data Portability & Export Data Section */}
                    <ExportDataSection
                      currentUser={currentUser}
                      onNotice={(msg) => {
                        setActionNotice(msg);
                        setTimeout(() => setActionNotice(''), 4000);
                      }}
                    />

                    {/* Tag Management System Section */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-indigo-500" />
                            Tag & Label Management
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Create, rename, organize, and manage custom taxonomy labels across all media
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowTagManagerModal(true)}
                          className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <Tag size={13} />
                          <span>Open Tag Manager</span>
                        </button>
                      </div>

                      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                            Categorize Content Across Channels
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Assign custom tags like <span className="font-semibold text-indigo-600 dark:text-indigo-400">#Trending</span>, <span className="font-semibold text-rose-600 dark:text-rose-400">#Exclusive</span>, or custom campaign labels to filter and search instantly.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Security & Credentials Section: Change Email & Change Password */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
                      <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-500" />
                          Account Credentials & Security
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Update your email address or password</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Change Email Form */}
                        <form onSubmit={handleChangeEmail} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-amber-600" />
                                Change Email Address
                              </h4>
                              {currentUser?.email && (
                                currentUser.emailVerified ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                      <AlertCircle className="w-3 h-3 text-amber-600" /> Unverified
                                    </span>
                                    <button
                                      type="button"
                                      onClick={handleSendCurrentEmailVerification}
                                      disabled={currentEmailVerificationSending}
                                      className="text-[10px] font-medium text-amber-600 hover:text-amber-700 underline cursor-pointer disabled:opacity-50"
                                      title="Send verification link to current email"
                                    >
                                      {currentEmailVerificationSending ? 'Sending...' : 'Verify'}
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-1">
                              Current Email: <span className="font-medium text-zinc-800 dark:text-zinc-200">{currentUser?.email || 'N/A'}</span>
                            </p>
                          </div>


                          {emailMsg && (
                            <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${emailMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30'}`}>
                              <span>{emailMsg.text}</span>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Email Address</label>
                              <input
                                type="email"
                                value={newEmailInput}
                                onChange={(e) => setNewEmailInput(e.target.value)}
                                placeholder="Enter new email address"
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">Current Password (required to verify identity)</label>
                              <input
                                type="password"
                                value={emailCurrentPassword}
                                onChange={(e) => setEmailCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                required
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={emailLoading}
                            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {emailLoading ? 'Sending Verification Link...' : 'Send Verification Link & Change Email'}
                          </button>
                        </form>

                        {/* Change Password Form */}
                        <form onSubmit={handleChangePassword} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <Key className="w-4 h-4 text-amber-600" />
                              Change Password
                            </h4>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              Update your account password securely
                            </p>
                          </div>

                          {passwordMsg && (
                            <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${passwordMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30'}`}>
                              <span>{passwordMsg.text}</span>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Current Password</label>
                                <button
                                  type="button"
                                  onClick={handleSendResetEmail}
                                  disabled={resetEmailSending}
                                  className="text-[11px] font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  {resetEmailSending ? 'Sending reset link...' : 'Forgot password?'}
                                </button>
                              </div>
                              <input
                                type="password"
                                value={passwordCurrentPassword}
                                onChange={(e) => setPasswordCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Password</label>
                              <input
                                type="password"
                                value={newPasswordInput}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                                placeholder="Minimum 6 characters"
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">Confirm New Password</label>
                              <input
                                type="password"
                                value={confirmPasswordInput}
                                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                placeholder="Re-enter new password"
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                required
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={passwordLoading}
                            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            {passwordLoading ? 'Updating Password...' : 'Update Password'}
                          </button>
                        </form>
                      </div>

                      {/* Deactivate Account Section */}
                      <div className="p-4 sm:p-5 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-center sm:text-left">
                            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center justify-center sm:justify-start gap-2">
                              <UserX className="w-4 h-4" />
                              Deactivate Account
                            </h4>
                            <p className="text-[11px] text-amber-700/70 dark:text-amber-400/60 mt-0.5">
                              Temporarily disable your account. Your data will be preserved.
                            </p>
                          </div>
                          {!showDeactivateSection && (
                            <button
                              type="button"
                              onClick={() => setShowDeactivateSection(true)}
                              className="w-full sm:w-auto px-4 py-2 sm:py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Deactivate Account...
                            </button>
                          )}
                        </div>

                        {showDeactivateSection && (
                          <motion.form
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleDeactivateAccount}
                            className="space-y-4 pt-4 border-t border-amber-200/50 dark:border-amber-900/30"
                          >
                            <div className="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-900/20 space-y-2">
                              <p className="font-bold">Account Deactivation Info:</p>
                              <p>Your content will be hidden but NOT deleted:</p>
                              <ul className="list-disc list-inside ml-2 opacity-80">
                                <li>Videos, News, Photos, Polls, Quizzes</li>
                                <li>Custom Pages & Events</li>
                              </ul>
                              <p className="text-[10px] opacity-70 mt-1">Reactivate anytime by logging in again.</p>
                            </div>

                            {deactivateMsg && (
                              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${deactivateMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30'}`}>
                                <span>{deactivateMsg.text}</span>
                              </div>
                            )}

                            <div className="space-y-3">
                              <div>
                                <label className="block text-[11px] font-medium text-amber-900 dark:text-amber-300 mb-1">Reason for Deactivation</label>
                                <textarea
                                  value={deactivateReasonInput}
                                  onChange={(e) => setDeactivateReasonInput(e.target.value)}
                                  placeholder="Why are you taking a break?"
                                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-zinc-800 rounded-lg border border-amber-200 dark:border-amber-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 min-h-[80px] resize-none"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-amber-900 dark:text-amber-300 mb-1">Verify Password</label>
                                <input
                                  type="password"
                                  value={deactivatePassword}
                                  onChange={(e) => setDeactivatePassword(e.target.value)}
                                  placeholder="Enter your password to confirm deactivation"
                                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-zinc-800 rounded-lg border border-amber-200 dark:border-amber-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                  required
                                />
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <button
                                type="submit"
                                disabled={deactivateLoading}
                                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer order-1 sm:order-1"
                              >
                                {deactivateLoading ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Deactivating...</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX size={14} />
                                    <span>Deactivate Account</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowDeactivateSection(false);
                                  setDeactivatePassword('');
                                  setDeactivateReasonInput('');
                                  setDeactivateMsg(null);
                                }}
                                className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg transition-colors cursor-pointer order-2 sm:order-2"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.form>
                        )}
                      </div>

                      {/* Delete Account Section */}
                      <div className="p-4 sm:p-5 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-950/10 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-center sm:text-left">
                            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center justify-center sm:justify-start gap-2">
                              <Trash2 className="w-4 h-4" />
                              Delete Account
                            </h4>
                            <p className="text-[11px] text-rose-700/70 dark:text-rose-400/60 mt-0.5">
                              Scheduled account deletion in 100 days. All data will be lost.
                            </p>
                          </div>
                          {!showDeactivateConfirm && (
                            <button
                              type="button"
                              onClick={() => setShowDeactivateConfirm(true)}
                              className="w-full sm:w-auto px-4 py-2 sm:py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Delete Account...
                            </button>
                          )}
                        </div>

                        {showDeactivateConfirm && (
                          <motion.form
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleDeleteAccount}
                            className="space-y-4 pt-4 border-t border-rose-200/50 dark:border-rose-900/30"
                          >
                            <div className="text-[11px] font-medium text-rose-800 dark:text-rose-300 bg-rose-100/50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-200/50 dark:border-rose-900/20 space-y-2">
                              <p className="font-bold">Warning: Permanent deletion in 100 days.</p>
                              <p>The following will be permanently deleted:</p>
                              <ul className="list-disc list-inside ml-2 opacity-80">
                                <li>All your Uploaded Videos</li>
                                <li>Showbiz News Articles</li>
                                <li>Personal Photos & Albums</li>
                                <li>Interactive Polls & Results</li>
                                <li>Quizzes & User Answers</li>
                                <li>Custom Pages & Branding</li>
                                <li>Scheduled Events & Attendees</li>
                              </ul>
                            </div>

                            {deactivateMsg && (
                              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${deactivateMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30'}`}>
                                <span>{deactivateMsg.text}</span>
                              </div>
                            )}

                            <div className="space-y-3">
                              <div>
                                <label className="block text-[11px] font-medium text-rose-900 dark:text-rose-300 mb-1">Reason for Deletion</label>
                                <textarea
                                  value={deletionReason}
                                  onChange={(e) => setDeletionReason(e.target.value)}
                                  placeholder="Why are you leaving us?"
                                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-zinc-800 rounded-lg border border-rose-200 dark:border-rose-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-h-[80px] resize-none"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-rose-900 dark:text-rose-300 mb-1">Verify Password</label>
                                <input
                                  type="password"
                                  value={deactivatePassword}
                                  onChange={(e) => setDeactivatePassword(e.target.value)}
                                  placeholder="Enter your password to confirm deletion"
                                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-zinc-800 rounded-lg border border-rose-200 dark:border-rose-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                  required
                                />
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <button
                                type="submit"
                                disabled={deactivateLoading}
                                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer order-1 sm:order-1"
                              >
                                {deactivateLoading ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Scheduling Deletion...</span>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 size={14} />
                                    <span>Schedule Account Deletion</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowDeactivateConfirm(false);
                                  setDeactivatePassword('');
                                  setDeletionReason('');
                                  setDeactivateMsg(null);
                                }}
                                className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg transition-colors cursor-pointer order-2 sm:order-2"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.form>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === 'Activity Log' && (
                  <ActivityLogView
                    userId={currentUser?.uid}
                    userEmail={currentUser?.email || undefined}
                    onNavigateToSection={(sec) => setActiveSection(sec as any)}
                  />
                )}
                {activeSection === 'Help' && (
                  <HelpView onStartTour={() => setIsTourOpen(true)} />
                )}
                {activeSection === 'Community Standards' && (
                  <CommunityStandardsView onBackToDashboard={() => setActiveSection('Home')} />
                )}
                {activeSection === 'TV Schedule' && (
                  <TVScheduleView />
                )}
                {activeSection === 'Weather' && (
                  <WeatherSection />
                )}
                {activeSection === 'Catch Now' && (
                  <CatchNowView
                    currentUser={currentUser}
                    currentUserProfile={currentUserProfile}
                  />
                )}
                {activeSection === 'Terms of Service' && (
                  <div className="max-w-3xl mx-auto space-y-6 py-6">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
                      <h3 className="text-base font-bold text-zinc-900">Terms of Service</h3>
                      <p className="text-xs text-zinc-500">Last updated: September 2026</p>
                      <div className="text-xs text-zinc-700 space-y-3 leading-relaxed pt-2">
                        <p>1. Acceptance of Terms: By accessing and using this application, you agree to be bound by these Terms of Service.</p>
                        <p>2. Use of Service: You agree to use the dashboard responsibly and comply with all applicable local and international regulations.</p>
                        <p>3. User Data & Security: You retain all rights to your uploaded media, documents, and data. We ensure robust encryption and secure cloud storage.</p>
                        <p>4. Termination: We reserve the right to suspend or terminate access for violations of these terms.</p>
                        <p>5. Account Deletion: You may request the deletion of your account at any time through the application settings. Account deletion is scheduled for 100 days after the request. During this period, you can restore your account by logging in. After 100 days, all your data (videos, showbiz news, photos, polls, quizzes, pages, and events) will be permanently and irreversibly deleted.</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === 'Privacy Policy' && (
                  <div className="max-w-3xl mx-auto space-y-6 py-6">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
                      <h3 className="text-base font-bold text-zinc-900">Privacy Policy</h3>
                      <p className="text-xs text-zinc-500">Last updated: September 2026</p>
                      <div className="text-xs text-zinc-700 space-y-3 leading-relaxed pt-2">
                        <p>1. Information We Collect: We collect account profile details and user-generated media content required for application functionality.</p>
                        <p>2. How We Use Information: Data is used strictly to provide, maintain, and secure your dashboard experience.</p>
                        <p>3. Data Security: All network traffic and database documents are encrypted in transit and at rest using industry standards.</p>
                        <p>4. Data Retention & Deletion: We retain your information for as long as your account is active. If you schedule your account for deletion, your data will be permanently removed from our production systems after 100 days. During the 100-day scheduled period, you can cancel the deletion by restoring your account via the application interface.</p>
                        <p>5. Contact Us: For any privacy inquiries, reach out to support@dmm-network.app.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : itemsLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                <div className="w-7 h-7 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mb-2" />
                <p className="text-xs font-medium text-zinc-500">Loading {activeSubTab}...</p>
              </div>
            ) : tabItems.length === 0 ? (
              <div
                key={`${activeSection}-${activeSubTab}`}
                id={`blank-page-${activeSection.toLowerCase()}-${activeSubTab.toLowerCase().replace(/\s+/g, '-')}`}
                className="w-full h-full min-h-[280px] sm:min-h-[380px] bg-white rounded-2xl border border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 p-4 sm:p-8 shadow-xs text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500 mb-3">
                  <Plus size={24} />
                </div>
                <h3 className="text-sm font-bold text-zinc-800">No {currentItemLabel} items yet</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mb-4">
                  Click the button below to create your first {currentItemLabel.toLowerCase()} in {activeSection}.
                </p>
                <button
                  type="button"
                  onClick={handleCreateClick}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Create {currentItemLabel}</span>
                </button>
              </div>
            ) : (
              <div className="w-full h-full overflow-y-auto pr-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-600">
                    {activeSection} &bull; {activeSubTab} ({filteredTabItems.length}{searchQuery ? ` of ${tabItems.length}` : ''})
                  </h3>
                  <div className="flex items-center gap-2">
                    {tabItems.some((i) => i.isLocalOnly) ? (
                      <button
                        type="button"
                        onClick={() => setShowRulesModal(true)}
                        className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full hover:bg-amber-100 cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Local Storage (Rules Pending)</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Firestore Synced</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Tag Filter Bar */}
                {availableTags.length > 0 && (
                  <div className="mb-3.5 pb-2.5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <TagFilterBar
                      tags={availableTags}
                      selectedTag={selectedTagFilter}
                      onSelectTag={setSelectedTagFilter}
                      totalItemsCount={tabItems.length}
                      className="flex-1 min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTagManagerModal(true)}
                      className="self-start sm:self-center px-2.5 py-1 text-[11px] font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
                      title="Manage Tags & Labels"
                    >
                      <Tag size={12} className="text-zinc-500" />
                      <span>Manage Tags</span>
                    </button>
                  </div>
                )}

                {filteredTabItems.length === 0 ? (
                  <div className="w-full bg-white rounded-2xl border border-dashed border-zinc-300 p-8 flex flex-col items-center justify-center text-center shadow-xs">
                    <Search size={24} className="text-zinc-400 mb-2" />
                    <p className="text-xs font-bold text-zinc-800">
                      {selectedTagFilter && searchQuery
                        ? `No items found tagged #${selectedTagFilter} matching "${searchQuery}"`
                        : selectedTagFilter
                        ? `No ${currentItemLabel.toLowerCase()} items found with tag #${selectedTagFilter}`
                        : `No ${currentItemLabel.toLowerCase()} items found matching "${searchQuery}"`}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="px-3 py-1.5 text-xs font-bold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                        >
                          Clear search filter
                        </button>
                      )}
                      {selectedTagFilter && (
                        <button
                          type="button"
                          onClick={() => setSelectedTagFilter(null)}
                          className="px-3 py-1.5 text-xs font-bold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                        >
                          Clear tag filter
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    key={`${activeSection}-${activeSubTab}-${searchQuery}-${selectedTagFilter || 'all'}`}
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
                    className={
                      activeSubTab === 'Products' 
                        ? "flex flex-col gap-3" 
                        : activeSubTab === 'Shorts'
                        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                        : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                    }
                  >
                    {filteredTabItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        activeSection={activeSection}
                        activeSubTab={activeSubTab}
                        searchQuery={searchQuery}
                        selectedTagFilter={selectedTagFilter}
                        activeMenuId={activeMenuId}
                        setActiveMenuId={setActiveMenuId}
                        onSelect={(it) => {
                          if (it?.pricing || activeSubTab === 'Products') {
                            handleRecordProductClick(it?.id);
                          }
                          setSelectedItemDetail(it);
                        }}
                        onEdit={(it) => handleEditItem(it)}
                        onDelete={(it) => handleDeleteItem(it)}
                        onSelectTag={(tag) => setSelectedTagFilter(tag)}
                        getDeleteLabel={getDeleteLabel}
                      />
                    ))}
                </motion.div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Modal for Create / Edit (Video, Showbiz News, Photos, Polls, Quiz) */}
        {(activeModal?.type === 'create' || activeModal?.type === 'edit') && (
          <CreateModal
            currentUser={currentUser}
            activeSection={activeSection}
            activeSubTab={activeSubTab}
            itemToEdit={activeModal.itemToEdit}
            quotaCounts={quotaCounts}
            activeTier={activeQuotaTier}
            onClose={() => setActiveModal(null)}
            onSelectTier={() => setActiveSection('Upgrade')}
            onSuccess={(msg) => {
              setActionNotice(msg);
              setActiveModal(null);
            }}
          />
        )}

        {/* Modal for Deleted (Video, Showbiz News, Photos, Polls, Quiz) */}
        {activeModal?.type === 'deleted' && (
          <DeletedModal
            currentUser={currentUser}
            activeSection={activeSection}
            activeSubTab={activeSubTab}
            onClose={() => setActiveModal(null)}
            onActionNotice={(msg) => setActionNotice(msg)}
          />
        )}

        {/* Modal for viewing item details, document formatting, video, poll, or quiz */}
        {selectedItemDetail && (
          <ItemDetailModal
            item={selectedItemDetail}
            subTab={activeSubTab}
            onClose={() => setSelectedItemDetail(null)}
            onEdit={(item) => handleEditItem(item)}
            onDelete={() => handleDeleteItem(selectedItemDetail)}
          />
        )}

        {/* My Cart Modal */}
        {showCartModal && (
          <MyCartModal
            currentUser={currentUser}
            currentUserProfile={currentUserProfile}
            cartItems={cartItems}
            onUpdateCart={handleUpdateCart}
            onClose={() => setShowCartModal(false)}
            onNavigateShopping={() => {
              setShowCartModal(false);
              setActiveSection('Home');
              setActiveSubTab('Products');
            }}
            onOrderPlaced={(order) => {
              setActionNotice(`Order #${order.id.slice(-6)} placed successfully!`);
              setTimeout(() => setActionNotice(''), 4000);
              window.dispatchEvent(new Event('dmm-order-placed'));
            }}
          />
        )}

        {/* My Orders Modal */}
        {showOrdersModal && (
          <MyOrdersModal
            currentUser={currentUser}
            currentUserProfile={currentUserProfile}
            onClose={() => setShowOrdersModal(false)}
            onNavigateProducts={() => {
              setShowOrdersModal(false);
              setActiveSection('Home');
              setActiveSubTab('Products');
            }}
          />
        )}

        {/* Firestore Rules & Database Setup Modal */}
        {showRulesModal && (
          <FirestoreRulesModal onClose={() => setShowRulesModal(false)} />
        )}

        {/* Tag & Label Management System Modal */}
        {showTagManagerModal && (
          <TagManagerModal
            currentUser={currentUser}
            isOpen={showTagManagerModal}
            onClose={() => setShowTagManagerModal(false)}
            onSelectTagToFilter={(tag) => setSelectedTagFilter(tag)}
          />
        )}

        {/* Profile Picture History Modal */}
        {showPhotoHistoryModal && (
          <ProfilePictureHistoryModal
            isOpen={showPhotoHistoryModal}
            onClose={() => setShowPhotoHistoryModal(false)}
            currentPhotoURL={settingsPhotoURL}
            history={photoHistory}
            isPhotoLocked={isPhotoLocked}
            nextEditDateFormatted={nextAllowedPhotoDateFormatted}
            daysRemaining={daysUntilNextPhotoEdit}
            onSimulateYearPassed={handleSimulateYearPassed}
            onSelectPhoto={(url) => {
              setSettingsPhotoURL(url);
              setActionNotice('Selected profile picture from history!');
              setTimeout(() => setActionNotice(''), 3000);
            }}
            onDeletePhoto={(id) => handleDeletePhotoFromHistory(id)}
            onClearHistory={() => handleClearPhotoHistory()}
            onUploadNewPhoto={(url) => {
              setSettingsPhotoURL(url);
              addToPhotoHistory(url);
              setActionNotice('New profile picture uploaded and saved to history!');
              setTimeout(() => setActionNotice(''), 3000);
            }}
          />
        )}

        {/* Get Started Tour Overlay with Motion Components */}
        <GetStartedTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          onSelectSection={(sec) => setActiveSection(sec)}
          onTriggerCreate={handleCreateClick}
          isDarkMode={isDarkMode}
        />
      </div>
    );
  }

  // Auth Screen (Login / Signup) - Fully responsive across Mobile, Tablet, and Desktop
  return (
    <div
      id="app-container"
      className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center px-4 py-8 sm:px-6 md:px-8 lg:py-12 text-zinc-900 dark:text-white relative"
    >
      {/* Theme Toggle Button for Auth Screen */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs shadow-2xs"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={17} className="text-amber-500" /> : <Moon size={17} />}
        </button>
      </div>

      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl sm:rounded-3xl shadow-xl shadow-zinc-950/5 p-5 sm:p-7 md:p-9 transition-all">
        {/* Navigation Tabs */}
        <div id="tabs" role="tablist" className="grid grid-cols-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl sm:rounded-2xl mb-5 sm:mb-6">
          <button
            id="tab-login"
            role="tab"
            aria-selected={activeTab === 'login'}
            onClick={() => {
              setActiveTab('login');
              setLoginErrors({});
              setSignupErrors({});
            }}
            className={`py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] flex items-center justify-center ${
              activeTab === 'login'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
            }`}
          >
            Login
          </button>
          <button
            id="tab-signup"
            role="tab"
            aria-selected={activeTab === 'signup'}
            onClick={() => {
              setActiveTab('signup');
              setLoginErrors({});
              setSignupErrors({});
              setLoginSuccessNotice('');
            }}
            className={`py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] flex items-center justify-center ${
              activeTab === 'signup'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
            }`}
          >
            Signup
          </button>
        </div>

        {/* Dynamic Heading */}
        <div className="text-center mb-5 sm:mb-6">
          <h1 id="page-heading" className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {activeTab === 'login' ? 'Login' : 'Signup'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1.5 px-2">
            {activeTab === 'login'
              ? 'Enter your credentials to access your account'
              : 'Create an account to get started with your journey'}
          </p>
        </div>

        {/* Success / Info Notice after Signup Redirect */}
        {loginSuccessNotice && activeTab === 'login' && (
          <div className="mb-5 p-3 sm:p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-start gap-2.5">
            <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>{loginSuccessNotice}</span>
          </div>
        )}

        {/* General Error Alert */}
        {activeTab === 'login' && loginErrors.general && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{loginErrors.general}</span>
          </div>
        )}

        {activeTab === 'signup' && signupErrors.general && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{signupErrors.general}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.form
              key="login"
              id="login-form"
              onSubmit={handleLogin}
              noValidate
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 sm:space-y-4.5"
            >
              {/* Email Field */}
              <motion.div
                id="email-group"
                animate={
                  shakeFields['login-email']
                    ? { x: [-10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.4 } }
                    : { x: 0 }
                }
              >
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail
                    size={18}
                    className={`absolute left-3.5 pointer-events-none transition-colors ${
                      loginErrors.email ? 'text-rose-500' : 'text-zinc-400'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginErrors.email) setLoginErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
                    }}
                    placeholder="name@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 min-h-[44px] bg-zinc-50/75 hover:bg-zinc-50 focus:bg-white text-zinc-900 border rounded-xl focus:outline-none text-xs sm:text-sm transition-all placeholder:text-zinc-400 font-medium ${
                      loginErrors.email
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'
                    }`}
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{loginErrors.email}</span>
                  </p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                id="password-group"
                animate={
                  shakeFields['login-password']
                    ? { x: [-10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.4 } }
                    : { x: 0 }
                }
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-600"
                  >
                    Password
                  </label>
                  <div id="forgot-password-group">
                    <a
                      id="forgot-password-link"
                      href="#forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        setForgotEmail(loginEmail);
                        setForgotError('');
                        setForgotSuccess('');
                        setShowForgotPasswordModal(true);
                      }}
                      className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer py-1"
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>
                <div className="relative flex items-center">
                  <Lock
                    size={18}
                    className={`absolute left-3.5 pointer-events-none transition-colors ${
                      loginErrors.password ? 'text-rose-500' : 'text-zinc-400'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
                    }}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-11 py-2.5 sm:py-3 min-h-[44px] bg-zinc-50/75 hover:bg-zinc-50 focus:bg-white text-zinc-900 border rounded-xl focus:outline-none text-xs sm:text-sm transition-all placeholder:text-zinc-400 font-medium ${
                      loginErrors.password
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2 text-zinc-400 hover:text-zinc-700 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{loginErrors.password}</span>
                  </p>
                )}
              </motion.div>

              {/* Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loginSubmitting}
                className="w-full mt-2 py-3 sm:py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white text-xs sm:text-sm font-bold tracking-wide rounded-xl sm:rounded-2xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900/20 active:scale-[0.99] cursor-pointer disabled:opacity-60 min-h-[44px] flex items-center justify-center"
              >
                {loginSubmitting ? 'Verifying...' : 'Login Now'}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              id="signup-form"
              onSubmit={handleSignup}
              noValidate
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3 sm:space-y-3.5"
            >
              {/* Full Name Field */}
              <motion.div
                id="signup-fullname-group"
                animate={
                  shakeFields['signup-fullname']
                    ? { x: [-10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.4 } }
                    : { x: 0 }
                }
              >
                <label
                  htmlFor="signup-fullname"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User
                    size={18}
                    className={`absolute left-3.5 pointer-events-none transition-colors ${
                      signupErrors.fullName ? 'text-rose-500' : 'text-zinc-400'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="signup-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (signupErrors.fullName) setSignupErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    placeholder="Jane Doe"
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 min-h-[44px] bg-zinc-50/75 hover:bg-zinc-50 focus:bg-white text-zinc-900 border rounded-xl focus:outline-none text-xs sm:text-sm transition-all placeholder:text-zinc-400 font-medium ${
                      signupErrors.fullName
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'
                    }`}
                  />
                </div>
                {signupErrors.fullName && (
                  <p className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{signupErrors.fullName}</span>
                  </p>
                )}
              </motion.div>

              {/* Username Field */}
              <motion.div
                id="signup-username-group"
                animate={
                  shakeFields['signup-username']
                    ? { x: [-10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.4 } }
                    : { x: 0 }
                }
              >
                <label
                  htmlFor="signup-username"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                >
                  Username
                </label>
                <div className="relative flex items-center">
                  <AtSign
                    size={18}
                    className={`absolute left-3.5 pointer-events-none transition-colors ${
                      signupErrors.username ? 'text-rose-500' : 'text-zinc-400'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="signup-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (signupErrors.username) setSignupErrors((prev) => ({ ...prev, username: undefined }));
                    }}
                    placeholder="janedoe"
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 min-h-[44px] bg-zinc-50/75 hover:bg-zinc-50 focus:bg-white text-zinc-900 border rounded-xl focus:outline-none text-xs sm:text-sm transition-all placeholder:text-zinc-400 font-medium ${
                      signupErrors.username
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'
                    }`}
                  />
                </div>
                {signupErrors.username && (
                  <p className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{signupErrors.username}</span>
                  </p>
                )}
              </motion.div>

              {/* Email Field */}
              <motion.div
                id="signup-email-group"
                animate={
                  shakeFields['signup-email']
                    ? { x: [-10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.4 } }
                    : { x: 0 }
                }
              >
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                >
                  Email
                </label>
                <div className="relative flex items-center">
                  <Mail
                    size={18}
                    className={`absolute left-3.5 pointer-events-none transition-colors ${
                      signupErrors.email ? 'text-rose-500' : 'text-zinc-400'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      if (signupErrors.email) setSignupErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
                    }}
                    placeholder="name@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 min-h-[44px] bg-zinc-50/75 hover:bg-zinc-50 focus:bg-white text-zinc-900 border rounded-xl focus:outline-none text-xs sm:text-sm transition-all placeholder:text-zinc-400 font-medium ${
                      signupErrors.email
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'
                    }`}
                  />
                </div>
                {signupErrors.email && (
                  <p className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{signupErrors.email}</span>
                  </p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                id="signup-password-group"
                animate={
                  shakeFields['signup-password']
                    ? { x: [-10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.4 } }
                    : { x: 0 }
                }
              >
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock
                    size={18}
                    className={`absolute left-3.5 pointer-events-none transition-colors ${
                      signupErrors.password ? 'text-rose-500' : 'text-zinc-400'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="signup-password"
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      if (signupErrors.password) setSignupErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Create password"
                    className={`w-full pl-10 pr-11 py-2.5 sm:py-3 min-h-[44px] bg-zinc-50/75 hover:bg-zinc-50 focus:bg-white text-zinc-900 border rounded-xl focus:outline-none text-xs sm:text-sm transition-all placeholder:text-zinc-400 font-medium ${
                      signupErrors.password
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-2 text-zinc-400 hover:text-zinc-700 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignupPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {signupErrors.password && (
                  <p className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{signupErrors.password}</span>
                  </p>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                id="signup-confirm-password-group"
                animate={
                  shakeFields['signup-confirm-password']
                    ? { x: [-10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.4 } }
                    : { x: 0 }
                }
              >
                <label
                  htmlFor="signup-confirm-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                >
                  Re-Enter Password
                </label>
                <div className="relative flex items-center">
                  <CheckCircle
                    size={18}
                    className={`absolute left-3.5 pointer-events-none transition-colors ${
                      signupErrors.confirmPassword ? 'text-rose-500' : 'text-zinc-400'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (signupErrors.confirmPassword) setSignupErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    placeholder="Confirm your password"
                    className={`w-full pl-10 pr-11 py-2.5 sm:py-3 min-h-[44px] bg-zinc-50/75 hover:bg-zinc-50 focus:bg-white text-zinc-900 border rounded-xl focus:outline-none text-xs sm:text-sm transition-all placeholder:text-zinc-400 font-medium ${
                      signupErrors.confirmPassword
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 text-zinc-400 hover:text-zinc-700 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {signupErrors.confirmPassword && (
                  <p className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{signupErrors.confirmPassword}</span>
                  </p>
                )}
              </motion.div>

              {/* Submit Button */}
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={signupSubmitting}
                className="w-full mt-2 py-3 sm:py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white text-xs sm:text-sm font-bold tracking-wide rounded-xl sm:rounded-2xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900/20 active:scale-[0.99] cursor-pointer disabled:opacity-60 min-h-[44px] flex items-center justify-center"
              >
                {signupSubmitting ? 'Creating Account...' : 'Signup Now'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Forgot Password Modal Popup - Fully responsive */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <div
            id="forgot-password-modal-backdrop"
            className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 md:p-6"
          >
            <motion.div
              id="forgot-password-modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm sm:max-w-md bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 relative"
            >
              <button
                type="button"
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-2 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="text-left mb-5 pr-8">
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">Forgot Password</h3>
                <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
                  Enter your registered email address to receive a secure password reset link.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                    <span>{forgotSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordModal(false);
                      setForgotSuccess('');
                    }}
                    className="w-full py-2.5 sm:py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} noValidate className="space-y-4">
                  <motion.div
                    animate={
                      shakeFields['forgot-email']
                        ? { x: [-10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.4 } }
                        : { x: 0 }
                    }
                  >
                    <label
                      htmlFor="forgot-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                    >
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail
                        size={18}
                        className={`absolute left-3.5 pointer-events-none transition-colors ${
                          forgotError ? 'text-rose-500' : 'text-zinc-400'
                        }`}
                        aria-hidden="true"
                      />
                      <input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          if (forgotError) setForgotError('');
                        }}
                        placeholder="name@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-3 min-h-[44px] bg-zinc-50/75 hover:bg-zinc-50 focus:bg-white text-zinc-900 border rounded-xl focus:outline-none text-xs sm:text-sm transition-all placeholder:text-zinc-400 font-medium ${
                          forgotError
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                            : 'border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'
                        }`}
                      />
                    </div>
                    {forgotError && (
                      <p className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1.5">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{forgotError}</span>
                      </p>
                    )}
                  </motion.div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(false)}
                      className="w-1/2 py-2.5 sm:py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotSubmitting}
                      className="w-1/2 py-2.5 sm:py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 min-h-[44px]"
                    >
                      <Send size={14} />
                      <span>{forgotSubmitting ? 'Sending...' : 'Send Reset Link'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
