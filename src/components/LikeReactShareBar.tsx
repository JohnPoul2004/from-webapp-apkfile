import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Smile,
  Share2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreHelper';

interface LikeReactShareBarProps {
  item?: any;
  subTab?: string;
  itemTitle?: string;
  className?: string;
  compact?: boolean;
}

const getCollectionNameFromTab = (subTab?: string): string => {
  if (!subTab) return 'videos';
  const lower = subTab.toLowerCase();
  if (lower.includes('video')) return 'videos';
  if (lower.includes('news') || lower.includes('showbiz')) return 'showbizNews';
  if (lower.includes('photo')) return 'photos';
  if (lower.includes('poll')) return 'polls';
  if (lower.includes('quiz')) return 'quiz';
  return 'videos';
};

export default function LikeReactShareBar({
  item,
  subTab,
  itemTitle,
  className = '',
  compact = false
}: LikeReactShareBarProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(() => {
    if (typeof item?.likesCount === 'number') return item.likesCount;
    if (typeof item?.likes === 'number') return item.likes;
    return 0;
  });
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const reactionsList = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Haha' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '🎉', label: 'Celebrate' }
  ];

  // Sync state when item or currentUser updates
  useEffect(() => {
    if (!item) return;
    const uid = auth.currentUser?.uid;
    if (uid && item.likedUsers && typeof item.likedUsers === 'object') {
      setIsLiked(Boolean(item.likedUsers[uid]));
    }
    if (typeof item.likesCount === 'number') {
      setLikesCount(item.likesCount);
    }
    if (uid && item.reactions && typeof item.reactions === 'object') {
      setSelectedReaction(item.reactions[uid] || null);
    }
  }, [item]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowReactionPicker(false);
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIsLiked = !isLiked;
    const nextCount = nextIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    
    setIsLiked(nextIsLiked);
    setLikesCount(nextCount);

    if (!item?.id) return;

    const uid = auth.currentUser?.uid || 'anonymous';
    const ownerUid = item.userId || item.ownerId || uid;
    const colName = getCollectionNameFromTab(item.subTab || subTab);
    const path = `users/${ownerUid}/${colName}/${item.id}`;

    try {
      const updatedLikedUsers = { ...(item.likedUsers || {}), [uid]: nextIsLiked };
      await setDoc(doc(db, 'users', ownerUid, colName, item.id), {
        likesCount: nextCount,
        likedUsers: updatedLikedUsers
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleSelectReaction = async (e: React.MouseEvent, emoji: string) => {
    e.stopPropagation();
    const nextReaction = selectedReaction === emoji ? null : emoji;
    
    setSelectedReaction(nextReaction);
    setShowReactionPicker(false);

    if (!item?.id) return;

    const uid = auth.currentUser?.uid || 'anonymous';
    const ownerUid = item.userId || item.ownerId || uid;
    const colName = getCollectionNameFromTab(item.subTab || subTab);
    const path = `users/${ownerUid}/${colName}/${item.id}`;

    try {
      const updatedReactions = { ...(item.reactions || {}) };
      if (nextReaction) {
        updatedReactions[uid] = nextReaction;
      } else {
        delete updatedReactions[uid];
      }

      const updatedCounts: Record<string, number> = {};
      Object.values(updatedReactions).forEach((eVal: any) => {
        if (typeof eVal === 'string') {
          updatedCounts[eVal] = (updatedCounts[eVal] || 0) + 1;
        }
      });

      await setDoc(doc(db, 'users', ownerUid, colName, item.id), {
        reactions: updatedReactions,
        reactionCounts: updatedCounts
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    });
  };

  const handleSocialShare = (e: React.MouseEvent, platform: 'facebook' | 'twitter' | 'whatsapp') => {
    e.stopPropagation();
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(itemTitle || item?.title || 'Check out this post!');
    let shareUrl = '';

    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    setShowShareMenu(false);
  };

  const handleNativeShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: itemTitle || item?.title || 'Share',
        url: window.location.href
      }).catch(() => {});
      setShowShareMenu(false);
    } else {
      handleCopyLink(e);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative pt-2.5 pb-2 border-y border-zinc-100 flex items-center justify-between gap-2 flex-wrap ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left Group: Like & React Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap relative">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleToggleLike}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px] ${
            isLiked
              ? 'bg-rose-50 border border-rose-200 text-rose-600 shadow-2xs'
              : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-zinc-700'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart
            size={compact ? 14 : 15}
            className={`transition-transform duration-200 ${
              isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-zinc-500'
            }`}
          />
          <span>{isLiked ? 'Liked' : 'Like'}</span>
          <span
            className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
              isLiked ? 'bg-rose-100 text-rose-700' : 'bg-zinc-200/70 text-zinc-600'
            }`}
          >
            {likesCount}
          </span>
        </button>

        {/* React Button & Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowReactionPicker((prev) => !prev);
              setShowShareMenu(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px] ${
              selectedReaction
                ? 'bg-amber-50 border border-amber-200 text-amber-800 shadow-2xs'
                : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-zinc-700'
            }`}
            title="React with emoji"
          >
            {selectedReaction ? (
              <span className="text-base leading-none">{selectedReaction}</span>
            ) : (
              <Smile size={compact ? 14 : 15} className="text-zinc-500" />
            )}
            <span>{selectedReaction ? 'Reacted' : 'React'}</span>
          </button>

          {/* Reaction Emoji Picker Popover */}
          {showReactionPicker && (
            <div className="absolute left-0 bottom-full mb-2 p-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl flex items-center gap-1 z-40 animate-in fade-in zoom-in-95 duration-100">
              {reactionsList.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={(e) => handleSelectReaction(e, r.emoji)}
                  className={`p-1.5 text-lg hover:scale-125 transition-transform rounded-xl hover:bg-zinc-100 cursor-pointer ${
                    selectedReaction === r.emoji ? 'bg-amber-100/80 ring-2 ring-amber-400' : ''
                  }`}
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Group: Share Button & Menu Popover */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowShareMenu((prev) => !prev);
            setShowReactionPicker(false);
          }}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px] shadow-2xs active:scale-98"
          title="Share item"
        >
          <Share2 size={14} />
          <span>Share</span>
        </button>

        {/* Share Options Popover Menu */}
        {showShareMenu && (
          <div className="absolute right-0 top-full sm:bottom-full sm:top-auto mt-1.5 sm:mb-2 w-52 bg-white border border-zinc-200 rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full px-3 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl flex items-center gap-2 cursor-pointer transition-colors text-left"
            >
              {copiedToast ? (
                <>
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span className="text-emerald-700 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-zinc-500 shrink-0" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => handleSocialShare(e, 'facebook')}
              className="w-full px-3 py-2 text-xs font-semibold text-zinc-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors text-left"
            >
              <ExternalLink size={14} className="text-blue-500 shrink-0" />
              <span>Facebook</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleSocialShare(e, 'twitter')}
              className="w-full px-3 py-2 text-xs font-semibold text-zinc-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors text-left"
            >
              <ExternalLink size={14} className="text-sky-500 shrink-0" />
              <span>Twitter / X</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleSocialShare(e, 'whatsapp')}
              className="w-full px-3 py-2 text-xs font-semibold text-zinc-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors text-left"
            >
              <ExternalLink size={14} className="text-emerald-500 shrink-0" />
              <span>WhatsApp</span>
            </button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 rounded-xl flex items-center gap-2 cursor-pointer transition-colors text-left border-t border-zinc-100 mt-1"
              >
                <Share2 size={14} className="text-zinc-700 shrink-0" />
                <span>More Share Options</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
