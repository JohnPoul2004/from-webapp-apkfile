import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Play,
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  Pencil,
  Eye,
  Calendar,
  Tag,
  CheckCircle,
  BarChart3,
  Sparkles,
  ExternalLink,
  ShoppingCart,
  Award,
  Clock,
  Film,
  MoreVertical,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SubTab, DashboardSection } from '../types';
import { HighlightText } from './HighlightText';
import { getTagStyle } from '../utils/tagHelper';
import { getVideoThumbnail } from '../utils/videoHelper';
import { getRelativeTime } from '../utils/dateHelper';

export interface ItemCardProps {
  item: any;
  activeTab?: SubTab;
  activeSubTab?: SubTab;
  activeSection?: DashboardSection;
  currentUser?: any;
  searchQuery?: string;
  searchTerm?: string;
  selectedTagFilter?: string | null;
  activeMenuId?: string | null;
  setActiveMenuId?: (id: string | null) => void;
  onDelete?: (item: any) => void;
  onEdit?: (item: any) => void;
  onLike?: (itemId: string, currentLikes: number) => void;
  onSelect?: (item: any) => void;
  onSelectTag?: (tag: string) => void;
  onAddToCart?: (item: any) => void;
  getDeleteLabel?: (tab: SubTab) => string;
}

export default function ItemCard({
  item,
  activeTab,
  activeSubTab,
  activeSection,
  currentUser,
  searchQuery = '',
  searchTerm = '',
  selectedTagFilter = null,
  activeMenuId,
  setActiveMenuId,
  onDelete,
  onEdit,
  onLike,
  onSelect,
  onSelectTag,
  onAddToCart,
  getDeleteLabel
}: ItemCardProps) {
  const currentTab = activeSubTab || activeTab || 'Videos';
  const query = searchQuery || searchTerm;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item?.likes || 0);
  const [isHovered, setIsHovered] = useState(false);
  const [localMenuOpen, setLocalMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isMenuOpen = activeMenuId !== undefined && activeMenuId !== null
    ? activeMenuId === item?.id
    : localMenuOpen;

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setActiveMenuId) {
      setActiveMenuId(isMenuOpen ? null : item?.id || null);
    } else {
      setLocalMenuOpen(!localMenuOpen);
    }
  };

  const closeMenu = () => {
    if (setActiveMenuId) {
      setActiveMenuId(null);
    }
    setLocalMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const copyText = item?.url || item?.videoUrl || item?.mediaLink || window.location.href;
    navigator.clipboard?.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Robust thumbnail / cover photo resolution
  const resolvedThumbnail = useMemo(() => {
    // 1. Direct photo / cover photo fields
    if (item?.coverPhoto && typeof item.coverPhoto === 'string' && item.coverPhoto.trim().length > 0) {
      return item.coverPhoto.trim();
    }
    if (item?.photo && typeof item.photo === 'string' && item.photo.trim().length > 0) {
      return item.photo.trim();
    }
    if (item?.photoUrl && typeof item.photoUrl === 'string' && item.photoUrl.trim().length > 0) {
      return item.photoUrl.trim();
    }
    if (item?.thumbnail && typeof item.thumbnail === 'string' && item.thumbnail.trim().length > 0) {
      return item.thumbnail.trim();
    }
    if (item?.thumbnailUrl && typeof item.thumbnailUrl === 'string' && item.thumbnailUrl.trim().length > 0) {
      return item.thumbnailUrl.trim();
    }
    if (item?.mediaUrl && typeof item.mediaUrl === 'string' && item.mediaUrl.trim().length > 0) {
      return item.mediaUrl.trim();
    }
    if (item?.image && typeof item.image === 'string' && item.image.trim().length > 0) {
      return item.image.trim();
    }
    if (item?.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim().length > 0) {
      return item.imageUrl.trim();
    }
    if (Array.isArray(item?.photos) && item.photos.length > 0 && typeof item.photos[0] === 'string') {
      return item.photos[0];
    }

    // 2. Video thumbnail detection from videoUrl, url, or mediaLink
    const vidUrl = item?.videoUrl || item?.url || item?.mediaLink || item?.embedUrl;
    const detected = getVideoThumbnail(vidUrl, item?.coverPhoto);
    if (detected) return detected;

    // 3. Default category fallback cover photos
    switch (currentTab) {
      case 'Videos':
      case 'Shorts':
        return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60';
      case 'Showbiz News':
        return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60';
      case 'Photos':
        return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60';
      case 'Products':
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60';
      case 'Polls':
        return 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60';
      case 'Quizzes':
        return 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=60';
      default:
        return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60';
    }
  }, [item, currentTab]);

  const [imgSrc, setImgSrc] = useState<string>(resolvedThumbnail);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgSrc(resolvedThumbnail);
    setImgError(false);
  }, [resolvedThumbnail]);

  const isOwner = currentUser && item?.userId === currentUser.uid;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCount = isLiked ? likeCount - 1 : likeCount + 1;
    setIsLiked(!isLiked);
    setLikeCount(Math.max(0, newCount));
    if (onLike && item?.id) {
      onLike(item.id, item.likes || 0);
    }
  };

  const getTabBadgeColor = () => {
    switch (currentTab) {
      case 'Videos': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Showbiz News': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Photos': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Polls': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Quizzes': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Shorts': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'Products': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.012 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect && onSelect(item)}
      className="group relative bg-zinc-900/90 dark:bg-zinc-900/95 border border-zinc-800/80 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Media / Thumbnail Container with Zoom Animation */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <motion.img
          src={imgSrc}
          alt={item?.title || `${currentTab} thumbnail`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          animate={{ scale: isHovered ? 1.06 : 1 }}
          transition={{ duration: 0.4 }}
          onError={() => {
            if (!imgError) {
              setImgError(true);
              // Fallback to high-reliability category photo
              const fallback =
                currentTab === 'Videos' || currentTab === 'Shorts'
                  ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60'
                  : currentTab === 'Showbiz News'
                  ? 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60'
                  : currentTab === 'Photos'
                  ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60'
                  : currentTab === 'Products'
                  ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60'
                  : currentTab === 'Polls'
                  ? 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60'
                  : 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=60';
              setImgSrc(fallback);
            }
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Category Badge & Duration / Price pill with pulse */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md shadow-md ${getTabBadgeColor()}`}
          >
            {currentTab}
          </motion.span>

          <div className="flex items-center gap-1.5">
            {currentTab === 'Products' && (item?.price || item?.pricing) && (
              <motion.span
                animate={{ scale: isHovered ? 1.08 : 1 }}
                className="px-3 py-1 rounded-full bg-emerald-500/90 text-zinc-950 font-black text-xs shadow-lg backdrop-blur-md"
              >
                ₱{Number(item.price || item.pricing).toLocaleString()}
              </motion.span>
            )}

            {(currentTab === 'Videos' || currentTab === 'Shorts') && (
              <span className="px-2 py-0.5 rounded-md bg-black/80 text-zinc-300 font-mono text-[10px] font-bold border border-zinc-800/80">
                {item?.duration || '02:45'}
              </span>
            )}
          </div>
        </div>

        {/* Play Button Overlay for Videos and Shorts */}
        {(currentTab === 'Videos' || currentTab === 'Shorts') && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <motion.div
              animate={{ scale: isHovered ? 1.15 : 1, opacity: isHovered ? 1 : 0.85 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-12 h-12 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center shadow-2xl backdrop-blur-xs pl-0.5"
            >
              <Play size={20} className="fill-current" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            <HighlightText text={item?.title || 'Untitled Content'} query={query} />
          </h3>

          {/* Description */}
          {item?.description && (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
              <HighlightText text={item.description} query={query} />
            </p>
          )}

          {/* Poll Options Animated Preview */}
          {currentTab === 'Polls' && item?.options && Array.isArray(item.options) && (
            <div className="space-y-2 pt-2">
              {item.options.slice(0, 3).map((opt: any, idx: number) => {
                const optText = typeof opt === 'string' ? opt : opt.text || `Option ${idx + 1}`;
                const optVotes = typeof opt === 'object' ? opt.votes || 0 : 0;
                const totalVotes = item.options.reduce((sum: number, o: any) => sum + (typeof o === 'object' ? o.votes || 0 : 0), 0) || 1;
                const percentage = Math.round((optVotes / totalVotes) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400 font-medium">
                      <span className="truncate">{optText}</span>
                      <span className="font-mono text-amber-400 font-bold">{percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quiz Question Preview */}
          {currentTab === 'Quizzes' && item?.questions && Array.isArray(item.questions) && (
            <div className="pt-2 text-xs text-zinc-400 flex items-center gap-2">
              <Award size={14} className="text-purple-400" />
              <span>{item.questions.length} Questions Quiz Challenge</span>
            </div>
          )}

          {/* Tags Pills */}
          {item?.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {item.tags.map((tag: string, idx: number) => {
                const isSelected = selectedTagFilter === tag;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectTag) onSelectTag(tag);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60'
                    }`}
                  >
                    #{tag}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Meta Bar */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            {/* View Count */}
            <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
              <Eye size={13} className="text-zinc-500" />
              <span>{(item?.views || 0).toLocaleString()}</span>
            </span>

            {/* Like / Reaction Animated Button */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                isLiked ? 'text-rose-400' : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              <Heart size={14} className={isLiked ? 'fill-current text-rose-500' : ''} />
              <span>{likeCount}</span>
            </motion.button>
          </div>

          {/* Action buttons (Cart / Edit / Delete / More) */}
          <div className="flex items-center gap-1.5 relative">
            {currentTab === 'Products' && onAddToCart && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item);
                }}
                className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-md"
              >
                <ShoppingCart size={12} />
                <span>Add</span>
              </motion.button>
            )}

            {isOwner && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="Edit Item"
              >
                <Pencil size={13} />
              </button>
            )}

            {isOwner && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className="p-1.5 rounded-lg hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Delete Item"
              >
                <Trash2 size={13} />
              </button>
            )}

            {/* More Actions Icon Button */}
            <button
              type="button"
              onClick={toggleMenu}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isMenuOpen
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="More options"
              aria-label="More options"
            >
              <MoreVertical size={14} />
            </button>

            {/* Dropdown Menu Popup */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.92, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 6 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 bottom-full mb-2 w-56 sm:w-60 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-1.5 shadow-2xl z-50 text-xs flex flex-col gap-0.5"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeMenu();
                      if (onSelect) onSelect(item);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Eye size={13} className="text-zinc-400" />
                    <span>View Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} className="text-zinc-400" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  {currentTab === 'Products' && onAddToCart && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMenu();
                        onAddToCart(item);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-indigo-300 hover:text-indigo-200 hover:bg-indigo-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShoppingCart size={13} className="text-indigo-400" />
                      <span>Add to Cart</span>
                    </button>
                  )}

                  {isOwner && onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMenu();
                        onEdit(item);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Pencil size={13} className="text-amber-400" />
                      <span>Edit {currentTab === 'Products' ? 'Product' : 'Item'}</span>
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMenu();
                        onDelete(item);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} className="text-rose-400 shrink-0" />
                      <span className="truncate">
                        Move to Deleted ({currentTab === 'Showbiz News' ? 'News' : currentTab === 'Quizzes' ? 'Quiz' : currentTab})
                      </span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
