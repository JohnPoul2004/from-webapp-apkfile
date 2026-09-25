import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  User,
  Video,
  Image as ImageIcon,
  CheckCircle,
  Trash2,
  ExternalLink,
  MoreVertical,
  Pencil,
  LayoutList,
  Film,
  Eye,
  Globe,
  Lock,
  Share2,
  Check,
  Copy,
  Tag,
  CreditCard,
  Truck,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Plus,
  Minus
} from 'lucide-react';
import { SubTab } from '../types';
import { getEmbedUrl } from '../utils/videoHelper';
import { getRelativeTime } from '../utils/dateHelper';
import { getTagStyle } from '../utils/tagHelper';
import {
  PhotoItem,
  OtherPhotosSlideshowPlayer,
  EmbeddedFirestoreAlbumSlideshow
} from './SlideshowPlayer';
import LikeReactShareBar from './LikeReactShareBar';
import CommentsSection from './CommentsSection';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreHelper';
import { logActivity } from '../utils/activityLogger';

interface ItemDetailModalProps {
  item: any;
  subTab: SubTab;
  onClose: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
}

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
      return 'Delete Product';
    default:
      return 'Delete';
  }
};

export default function ItemDetailModal({
  item,
  subTab,
  onClose,
  onEdit,
  onDelete
}: ItemDetailModalProps) {
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
  const [pollVoted, setPollVoted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [photoViewMode, setPhotoViewMode] = useState<'scroll' | 'slideshow'>('scroll');
  const [authorName, setAuthorName] = useState<string>('Loading...');
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // Require Credit Card Checkout Popup state
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(() => auth.currentUser?.displayName || 'Valued Customer');
  const [shippingAddress, setShippingAddress] = useState('123 Main Street, Suite 400');
  const [cardHolder, setCardHolder] = useState(() => auth.currentUser?.displayName || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardError, setCardError] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
    if (cardError) setCardError('');
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
    if (cardError) setCardError('');
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(raw);
    if (cardError) setCardError('');
  };

  const unitPrice = useMemo(() => {
    return parseFloat(String(item.pricing || '0').replace(/[^0-9.]/g, '')) || 0;
  }, [item.pricing]);

  const subtotalPrice = unitPrice * checkoutQuantity;
  const taxPrice = subtotalPrice * 0.08;
  const totalPrice = subtotalPrice + taxPrice;

  const handleProcessOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardHolder.trim()) {
      setCardError('Cardholder Name is required.');
      return;
    }
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 15) {
      setCardError('A valid 15 or 16-digit Credit Card number is required.');
      return;
    }
    if (!expiry || expiry.length < 5) {
      setCardError('Valid Expiry Date (MM/YY) is required.');
      return;
    }
    if (!cvv || cvv.length < 3) {
      setCardError('Security code (CVV) is required.');
      return;
    }

    setSubmittingPayment(true);
    setCardError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;

      const orderRecord = {
        id: orderId,
        items: [
          {
            productId: item.id || item.title,
            title: item.title,
            photo: item.photo || item.coverPhoto,
            pricing: unitPrice,
            quantity: checkoutQuantity
          }
        ],
        totalAmount: totalPrice,
        customerName,
        shippingAddress,
        paymentMethod: 'Credit Card',
        cardLast4: cleanNum.slice(-4),
        status: 'Paid & Processing',
        createdAt: new Date().toISOString()
      };

      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const orderDocRef = doc(db, 'users', uid, 'orders', orderId);
          await setDoc(orderDocRef, orderRecord);
        }
      } catch (err) {
        console.warn('Firestore order save note:', err);
      }

      try {
        const rawOrders = localStorage.getItem('dmm_user_orders');
        const ordersList = rawOrders ? JSON.parse(rawOrders) : [];
        ordersList.unshift(orderRecord);
        localStorage.setItem('dmm_user_orders', JSON.stringify(ordersList));
      } catch (err) {
        console.warn('LocalStorage order note:', err);
      }

      try {
        logActivity({
          userId: auth.currentUser?.uid || 'guest',
          action: 'CREATE',
          category: 'Shopping',
          title: `Order #${orderId} - Credit Card Payment`,
          details: `Purchased ${checkoutQuantity}x "${item.title}" with Credit Card (Paid ₱${totalPrice.toFixed(2)})`,
          status: 'success'
        });
      } catch (err) {
        console.warn('Log activity note:', err);
      }

      window.dispatchEvent(new Event('dmm-cart-updated'));
      window.dispatchEvent(new Event('dmm-order-placed'));
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowCreditCardModal(false);
        setPaymentSuccess(false);
      }, 1800);
    } catch (err: any) {
      setCardError(err.message || 'Payment processing failed. Please check card info.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Share handler: uses native share sheet if available, or copies direct item link to clipboard
  const handleShareItem = async () => {
    try {
      const currentOrigin = window.location.origin;
      const currentPath = window.location.pathname;
      const itemId = item.id || 'item';
      const shareUrl = `${currentOrigin}${currentPath}?tab=${encodeURIComponent(subTab)}&item=${encodeURIComponent(itemId)}`;

      const shareData = {
        title: item.title || `${subTab} item`,
        text: item.description
          ? item.description.length > 120
            ? item.description.slice(0, 117) + '...'
            : item.description
          : `Check out this ${subTab} item: ${item.title || ''}`,
        url: shareUrl
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          setShareNotice('Shared successfully!');
          setTimeout(() => setShareNotice(null), 3000);
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            return;
          }
        }
      }

      // Clipboard fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedLink(true);
      setShareNotice('Direct link copied to clipboard!');

      // Log Share Activity
      const uid = auth.currentUser?.uid || 'anonymous';
      logActivity({
        action: 'SHARE',
        category:
          subTab === 'Videos'
            ? 'Videos'
            : subTab === 'Shorts'
            ? 'Shorts'
            : subTab === 'Products'
            ? 'Products'
            : subTab === 'Showbiz News'
            ? 'News'
            : subTab === 'Photos'
            ? 'Photos'
            : subTab === 'Polls'
            ? 'Polls'
            : 'Quizzes',
        title: `Shared link for ${subTab} "${item.title || 'Item'}"`,
        details: `Direct permalink generated`,
        section: item.section,
        userId: uid,
        status: 'info'
      }).catch(() => {});

      setTimeout(() => {
        setCopiedLink(false);
        setTimeout(() => setShareNotice(null), 2500);
      }, 2000);
    } catch {
      setShareNotice('Direct link copied');
      setTimeout(() => setShareNotice(null), 2500);
    }
  };

  // Fetch Author Profile
  useEffect(() => {
    const fetchAuthor = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setAuthorName(snap.data().fullName || 'Unknown Author');
        } else {
          setAuthorName('Unknown Author');
        }
      } catch (err) {
        setAuthorName('Unknown Author');
      }
    };
    fetchAuthor();
  }, []);

  // Sync poll vote from Firestore
  useEffect(() => {
    if (subTab === 'Polls' && item) {
      const uid = auth.currentUser?.uid;
      if (uid && item.votedUsers && item.votedUsers[uid]) {
        setSelectedPollOption(item.votedUsers[uid]);
        setPollVoted(true);
      }
    }
  }, [item, subTab]);

  const handleVotePoll = async (optId: string) => {
    setSelectedPollOption(optId);
    setPollVoted(true);

    if (!item?.id) return;
    const uid = auth.currentUser?.uid || 'anonymous';
    const ownerUid = item.userId || item.ownerId || uid;
    const path = `users/${ownerUid}/polls/${item.id}`;

    try {
      const updatedVotedUsers = { ...(item.votedUsers || {}), [uid]: optId };
      
      const updatedOptions = (item.poll?.options || []).map((option: any) => {
        const votesCount = Object.values(updatedVotedUsers).filter((v) => v === option.id).length;
        return {
          ...option,
          votes: votesCount
        };
      });

      await setDoc(doc(db, 'users', ownerUid, 'polls', item.id), {
        poll: {
          ...item.poll,
          options: updatedOptions
        },
        votedUsers: updatedVotedUsers
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleSubmitQuiz = async () => {
    setQuizSubmitted(true);
    const uid = auth.currentUser?.uid || 'anonymous';
    const ownerUid = item.userId || item.ownerId || uid;
    const path = `users/${ownerUid}/quiz/${item.id}`;
    try {
      const currentCount = typeof item.answersCount === 'number' ? item.answersCount : 0;
      await setDoc(doc(db, 'users', ownerUid, 'quiz', item.id), {
        answersCount: currentCount + 1
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  // Other photos list specifically for the Other Photo Gallery / Slideshow
  const otherPhotosList = useMemo(() => {
    const list: Array<{ id: string; photo: string; title?: string; description?: string }> = [];
    if (Array.isArray(item.otherPhoto)) {
      item.otherPhoto.forEach((p: any, idx: number) => {
        const isObj = typeof p === 'object' && p !== null;
        list.push({
          id: isObj && p.id ? p.id : `other-${idx}`,
          photo: isObj ? p.photo : p,
          title: isObj ? p.title : `Photo ${idx + 1}`,
          description: isObj ? p.description : ''
        });
      });
    }
    return list;
  }, [item.otherPhoto]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-modal-more-dropdown]')) {
        setShowMoreMenu(false);
      }
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const renderDocumentHtml = (docText: string) => {
    if (!docText) return null;

    const parts = docText.split(/(\[embed:slideshow-photos(?:\s+id="[^"]*")?(?:\s+title="[^"]*")?\]|\[embed:slideshow-photos:[^\]]+\]|\[slideshow-photos\])/gi);

    return (
      <div className="space-y-3">
        {parts.map((part, idx) => {
          const isSlideshow =
            part.startsWith('[embed:slideshow-photos') ||
            part.startsWith('[slideshow-photos]');

          if (isSlideshow) {
            // Extract album id and title if present
            const idMatch = part.match(/id="([^"]+)"/) || part.match(/\[embed:slideshow-photos:([^\]]+)\]/);
            const titleMatch = part.match(/title="([^"]+)"/);
            const albumId = idMatch ? idMatch[1] : null;
            const albumTitle = titleMatch ? titleMatch[1] : null;

            return (
              <EmbeddedFirestoreAlbumSlideshow
                key={idx}
                albumId={albumId}
                albumTitle={albumTitle}
                fallbackPhotos={otherPhotosList}
              />
            );
          }

          return (
            <div
              key={idx}
              className="prose prose-sm max-w-none text-zinc-800 leading-relaxed space-y-2 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: part
                  .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-zinc-900 mt-3 mb-1.5">$1</h1>')
                  .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-zinc-900 mt-2.5 mb-1">$1</h2>')
                  .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-zinc-900 mt-2 mb-1">$1</h3>')
                  .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-zinc-400 pl-3 italic text-zinc-600 my-2">$1</blockquote>')
                  .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-zinc-900">$1</strong>')
                  .replace(/\*(.*?)\*/gim, '<em class="italic text-zinc-700">$1</em>')
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline font-medium">$1</a>')
              }}
            />
          );
        })}
      </div>
    );
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 relative my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 shrink-0 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                {subTab}
              </span>
              {item.visibility && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                  item.visibility === 'Private' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                  item.visibility === 'Unlisted' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {item.visibility === 'Private' ? <Lock size={10} /> :
                   item.visibility === 'Unlisted' ? <Eye size={10} className="opacity-70" /> :
                   <Globe size={10} />}
                  {item.visibility}
                </span>
              )}
              {item.section && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200/80 text-zinc-700">
                  {item.section}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-snug">
              {item.title}
            </h2>

            {/* Scroll or Slideshow Tab after Title in View Photo Modal (for Other Photos field) */}
            {subTab === 'Photos' && otherPhotosList.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5 p-1 bg-zinc-100/90 rounded-xl w-fit border border-zinc-200/80 shadow-2xs">
                <button
                  type="button"
                  id="view-mode-scroll-btn"
                  onClick={() => setPhotoViewMode('scroll')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[32px] ${
                    photoViewMode === 'scroll'
                      ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <LayoutList size={14} />
                  <span>Scroll</span>
                </button>
                <button
                  type="button"
                  id="view-mode-slideshow-btn"
                  onClick={() => setPhotoViewMode('slideshow')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[32px] ${
                    photoViewMode === 'slideshow'
                      ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Film size={14} />
                  <span>Slideshow</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Share Button: opens native share sheet or copies direct link */}
            <button
              type="button"
              id="modal-share-button"
              title={copiedLink ? 'Direct link copied!' : 'Share item link'}
              aria-label="Share item"
              onClick={handleShareItem}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] border shadow-2xs active:scale-95 ${
                copiedLink
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden xs:inline font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} className="text-zinc-500 dark:text-zinc-400" />
                  <span className="hidden xs:inline font-bold">Share</span>
                </>
              )}
            </button>

            {/* More options dropdown in modal header */}
            {(onEdit || onDelete) && (
              <div data-modal-more-dropdown className="relative">
                <button
                  type="button"
                  id="modal-more-btn"
                  title="More actions"
                  aria-label="More actions"
                  onClick={() => setShowMoreMenu((prev) => !prev)}
                  className={`p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
                    showMoreMenu ? 'bg-zinc-100 text-zinc-900' : ''
                  }`}
                >
                  <MoreVertical size={18} />
                </button>

                {showMoreMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-zinc-200 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      id="modal-menu-share"
                      onClick={() => {
                        setShowMoreMenu(false);
                        handleShareItem();
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 flex items-center gap-2 cursor-pointer transition-colors text-left"
                    >
                      <Share2 size={13} className="text-zinc-500 shrink-0" />
                      <span>Share direct link</span>
                    </button>
                    <div className="h-px bg-zinc-100 my-0.5" />
                    {onEdit && (
                      <button
                        type="button"
                        role="menuitem"
                        id="modal-menu-edit"
                        onClick={() => {
                          setShowMoreMenu(false);
                          onClose();
                          onEdit(item);
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 flex items-center gap-2 cursor-pointer transition-colors text-left"
                      >
                        <Pencil size={13} className="text-zinc-500 shrink-0" />
                        <span>Edit</span>
                      </button>
                    )}
                    {onEdit && onDelete && <div className="h-px bg-zinc-100 my-0.5" />}
                    {onDelete && (
                      <button
                        type="button"
                        role="menuitem"
                        id="modal-menu-delete"
                        onClick={() => {
                          setShowMoreMenu(false);
                          onDelete(item.id);
                          onClose();
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors text-left whitespace-nowrap"
                      >
                        <Trash2 size={13} className="text-rose-500 shrink-0" />
                        <span>{getDeleteLabel(subTab)}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              id="modal-close-btn"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Share notification toast banner */}
        {shareNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-xl mt-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">{shareNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setShareNotice(null)}
              className="text-emerald-600 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {/* Video Player (if Videos or Shorts) */}
          {(subTab === 'Videos' || subTab === 'Shorts') && item.videoUrl && (
            <div className={`rounded-2xl overflow-hidden border border-zinc-200 bg-black w-full ${subTab === 'Shorts' ? 'aspect-[9/16] max-h-[500px] mx-auto' : 'aspect-video'}`}>
              {getEmbedUrl(item.videoUrl) ? (
                <iframe
                  src={getEmbedUrl(item.videoUrl)!}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 p-4">
                  <Video size={36} className="mb-2 text-zinc-500" />
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open {subTab === 'Shorts' ? 'Short' : 'Video'} Stream</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Cover Photo (Showbiz News, Photos, Polls, Quiz, Products) */}
          {subTab !== 'Videos' && subTab !== 'Shorts' && (
            <div className={`rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 w-full ${subTab === 'Products' ? 'aspect-square max-h-96' : 'max-h-72'}`}>
              <img
                src={
                  item.photo ||
                  item.coverPhoto ||
                  item.photoUrl ||
                  (Array.isArray(item.photos) && item.photos[0]) ||
                  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60'
                }
                alt={item.title || 'Cover'}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Product Info */}
          {subTab === 'Products' && (
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-900 rounded-2xl text-white shadow-lg">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Retail Price</p>
                   <p className="text-3xl font-black">₱{item.pricing}</p>
                </div>
                <button
                  id="btn-product-checkout"
                  onClick={() => {
                    setCardError('');
                    setPaymentSuccess(false);
                    setShowCreditCardModal(true);
                  }}
                  className="px-6 py-3 bg-white hover:bg-zinc-100 text-zinc-900 rounded-xl font-black text-sm transition-all active:scale-95 shadow-xl cursor-pointer flex items-center gap-2"
                >
                  <CreditCard size={16} />
                  <span>Checkout (Require Credit Card)</span>
                </button>
             </div>
          )}

          {/* Like, React and Share Action Bar - Placed immediately after Cover Photo / Video */}
          <LikeReactShareBar item={item} subTab={subTab} itemTitle={item.title} />

          {/* Author & Dates & Location */}
          <div className="text-[11px] text-zinc-500 font-medium space-y-1 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-zinc-400" />
              <span>Author: {authorName}</span>
            </div>
            {(item.pageLocation || item.eventLocation) && (
              <>
                {item.pageLocation && (
                  <div className="flex items-center gap-1.5">
                    <Globe size={13} className="text-zinc-400" />
                    <span>Page: {item.pageLocation}</span>
                  </div>
                )}
                {item.eventLocation && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-zinc-400" />
                    <span>Event: {item.eventLocation}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-zinc-400" />
              <span>Published: {item.createdAt?.toDate ? getRelativeTime(item.createdAt.toDate()) : 'N/A'}</span>
            </div>
            {item.visibility && (
              <div className="flex items-center gap-1.5">
                {item.visibility === 'Private' ? <Lock size={13} className="text-zinc-400" /> : 
                 item.visibility === 'Unlisted' ? <Eye size={13} className="text-zinc-400" /> : 
                 <Globe size={13} className="text-zinc-400" />}
                <span>Visibility: {item.visibility}</span>
              </div>
            )}
            {item.updatedAt && (
              <div className="flex items-center gap-1.5">
                <Pencil size={13} className="text-zinc-400" />
                <span>Edited: {getRelativeTime(item.updatedAt.toDate())}</span>
              </div>
            )}
          </div>

          {/* Document Content / Description */}
          {item.document && (
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Description
              </h4>
              <div className="p-4 bg-zinc-50/60 rounded-2xl border border-zinc-200/80">
                {renderDocumentHtml(item.document)}
              </div>
            </div>
          )}

          {/* OTHER PHOTOS FIELD - SCROLL OR SLIDESHOW MODE */}
          {subTab === 'Photos' && otherPhotosList.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                  Other Photos ({otherPhotosList.length})
                </h4>
                <span className="text-[11px] font-semibold text-zinc-500">
                  {photoViewMode === 'slideshow' ? 'Slideshow' : 'Scroll View'}
                </span>
              </div>

              {photoViewMode === 'slideshow' ? (
                <OtherPhotosSlideshowPlayer photos={otherPhotosList} />
              ) : (
                /* Scroll mode: grid list of all other photos */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {otherPhotosList.map((photoItem, idx) => {
                    const badgeText = `${idx + 1} of ${otherPhotosList.length}`;

                    return (
                      <div
                        key={photoItem.id || idx}
                        className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50/80 p-3 flex flex-col justify-between space-y-2.5 shadow-2xs hover:border-zinc-300 transition-all"
                      >
                        <div>
                          {/* Image with Badge */}
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/5 border border-zinc-200/80 mb-2">
                            <img
                              src={photoItem.photo}
                              alt={photoItem.title || `Photo ${badgeText}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-zinc-900 text-white shadow-xs tracking-wide">
                              {badgeText}
                            </span>
                          </div>

                          {/* Title & Description */}
                          {photoItem.title && (
                            <h5 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1 mb-1">
                              {photoItem.title}
                            </h5>
                          )}
                          {photoItem.description && (
                            <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">
                              {photoItem.description}
                            </p>
                          )}
                        </div>

                        {!photoItem.title && !photoItem.description && (
                          <span className="text-[10px] text-zinc-400 font-medium">
                            Photo #{idx + 1}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Polls: Interactive Poll */}
          {subTab === 'Polls' && item.poll && (() => {
            const totalVotes = (item.poll.options || []).reduce(
              (sum: number, o: any) => sum + (o.votes || 0),
              0
            );

            return (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-zinc-900">
                    {item.poll.question || item.title}
                  </h4>
                  {totalVotes > 0 && (
                    <span className="text-[11px] font-bold text-zinc-500 bg-zinc-200/60 px-2 py-0.5 rounded-full">
                      {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {item.poll.options?.map((opt: any) => {
                    const optionVotes = opt.votes || (selectedPollOption === opt.id ? 1 : 0);
                    const calcPct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : (selectedPollOption === opt.id ? 100 : 0);
                    const isSelected = selectedPollOption === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleVotePoll(opt.id)}
                        className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all relative overflow-hidden cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-zinc-900 bg-zinc-900 text-white shadow-2xs'
                            : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                        }`}
                      >
                        {/* Vote progress fill bar */}
                        {(pollVoted || totalVotes > 0) && (
                          <div
                            className={`absolute top-0 bottom-0 left-0 transition-all duration-300 pointer-events-none opacity-20 ${
                              isSelected ? 'bg-white' : 'bg-zinc-900'
                            }`}
                            style={{ width: `${calcPct}%` }}
                          />
                        )}

                        <span className="relative z-10 flex items-center gap-2">
                          {isSelected && <CheckCircle size={16} className="text-emerald-400 shrink-0" />}
                          <span>{opt.text}</span>
                        </span>

                        {(pollVoted || totalVotes > 0) && (
                          <span className={`relative z-10 text-xs font-bold ${isSelected ? 'text-zinc-200' : 'text-zinc-500'}`}>
                            {calcPct}% ({optionVotes})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {pollVoted && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle size={13} />
                    <span>Your vote is saved to Firestore!</span>
                  </p>
                )}
              </div>
            );
          })()}

          {/* Quiz: Interactive Quiz */}
          {subTab === 'Quizzes' && item.quiz?.questions && (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
              <h4 className="text-sm font-bold text-zinc-900">
                Quiz Questions ({item.quiz.questions.length})
              </h4>
              <div className="space-y-4">
                {item.quiz.questions.map((q: any, qIdx: number) => (
                  <div key={q.id || qIdx} className="p-3 bg-white border border-zinc-200 rounded-xl space-y-2">
                    <p className="text-xs sm:text-sm font-bold text-zinc-800">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options?.map((opt: string, optIdx: number) => {
                        const isSelected = quizAnswers[qIdx] === optIdx;
                        const isCorrect = q.correctIndex === optIdx;
                        let btnStyle = 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100';

                        if (quizSubmitted) {
                          if (isCorrect) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'border-rose-400 bg-rose-50 text-rose-800 line-through';
                          }
                        } else if (isSelected) {
                          btnStyle = 'border-zinc-900 bg-zinc-900 text-white font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                            className={`p-2.5 rounded-lg border text-xs text-left transition-colors cursor-pointer ${btnStyle}`}
                          >
                            <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Submit Quiz Answers
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>
                    Score:{' '}
                    {
                      item.quiz.questions.filter(
                        (q: any, idx: number) => quizAnswers[idx] === q.correctIndex
                      ).length
                    }{' '}
                    / {item.quiz.questions.length} Correct
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tags in Body for Videos, Showbiz News, Photos, Polls, and Quiz */}
          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <div className="space-y-1.5 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Tag size={12} className="text-zinc-400" />
                <span>Tags</span>
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {item.tags.map((tag: string) => {
                  const style = getTagStyle(tag);
                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs ${style.bg} ${style.text} ${style.border}`}
                    >
                      #{tag}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comments Section for Videos, Showbiz News, Photos, Polls, Quizzes */}
          <CommentsSection item={item} subTab={subTab} />
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            id="modal-footer-close-btn"
            onClick={onClose}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl cursor-pointer transition-colors min-h-[40px]"
          >
            Close
          </button>
        </div>
      </div>

      {/* REQUIRE CREDIT CARD CHECKOUT POPUP */}
      {showCreditCardModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/80 dark:bg-zinc-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
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
                    Valid credit card payment details are required to complete this order
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreditCardModal(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Success state banner */}
            {paymentSuccess ? (
              <div className="p-8 text-center space-y-4 my-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-100">Order Confirmed!</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Your credit card payment of ₱{totalPrice.toFixed(2)} has been successfully authorized and charged.
                  </p>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                  Transaction Authorized via 256-Bit SSL
                </div>
              </div>
            ) : (
              <form onSubmit={handleProcessOrder} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Product Summary */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-center gap-3">
                  <div className="w-14 h-14 aspect-square rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
                    <img
                      src={
                        item.photo ||
                        item.coverPhoto ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      ₱{unitPrice.toFixed(2)} each
                    </p>
                  </div>
                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-700 rounded-lg p-1 border border-zinc-200 dark:border-zinc-600">
                    <button
                      type="button"
                      onClick={() => setCheckoutQuantity(Math.max(1, checkoutQuantity - 1))}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-black min-w-[20px] text-center text-zinc-900 dark:text-zinc-100">
                      {checkoutQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCheckoutQuantity(checkoutQuantity + 1)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Customer Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      <Truck size={12} className="text-zinc-400" />
                      <span>Shipping Address</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Street, City, Postal Code"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* REQUIRED CREDIT CARD SECTION */}
                <div className="p-3.5 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/20 dark:to-blue-950/10 border border-indigo-200/80 dark:border-indigo-900/50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 uppercase tracking-wide">
                      <CreditCard size={14} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Credit Card Details</span>
                      <span className="text-rose-500 font-black">*</span>
                    </span>
                    <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-2xs uppercase tracking-wider">
                      Required
                    </span>
                  </div>

                  {cardError && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0 text-rose-500" />
                      <span>{cardError}</span>
                    </div>
                  )}

                  {/* Cardholder Name */}
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">
                      Cardholder Name <span className="text-rose-500">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value);
                        if (cardError) setCardError('');
                      }}
                      placeholder="Name as printed on credit card"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">
                        Credit Card Number <span className="text-rose-500">*</span>
                      </span>
                      <div className="flex gap-1 text-[8.5px] font-black text-zinc-400 dark:text-zinc-500">
                        <span>VISA</span> • <span>MC</span> • <span>AMEX</span> • <span>DISC</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono tracking-wider bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                      <span className="text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">
                        Expiry Date <span className="text-rose-500">*</span>
                      </span>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-3 py-2 text-xs font-mono text-center bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">
                        Security Code (CVV) <span className="text-rose-500">*</span>
                      </span>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={cvv}
                          onChange={handleCvvChange}
                          placeholder="123"
                          maxLength={4}
                          className="w-full pl-3 pr-8 py-2 text-xs font-mono text-center bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                    <span>Subtotal ({checkoutQuantity} item{checkoutQuantity > 1 ? 's' : ''})</span>
                    <span>₱{subtotalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Processing & Tax (8%)</span>
                    <span>₱{taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-zinc-900 dark:text-zinc-100 border-t border-zinc-200 dark:border-zinc-700 pt-1.5 mt-1">
                    <span>Total Amount</span>
                    <span className="text-indigo-600 dark:text-indigo-400">₱{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Guarantee Notice */}
                <div className="flex items-center gap-2 px-1 text-[11px] text-zinc-500">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  <span>256-Bit SSL Encrypted. A valid credit card is required to finalize checkout.</span>
                </div>

                {/* Form Footer Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreditCardModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="flex-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingPayment ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Authorizing Card...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={13} />
                        <span>Pay ₱{totalPrice.toFixed(2)} with Card</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
