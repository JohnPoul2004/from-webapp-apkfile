import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, User, Loader2, Sparkles } from 'lucide-react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreHelper';

interface CommentItem {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhotoUrl?: string;
  createdAt?: any;
}

interface CommentsSectionProps {
  item: any;
  subTab?: string;
  className?: string;
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

const formatCommentTime = (createdAt: any) => {
  if (!createdAt) return 'Just now';
  let date: Date;

  if (createdAt?.toDate && typeof createdAt.toDate === 'function') {
    date = createdAt.toDate();
  } else if (createdAt instanceof Date) {
    date = createdAt;
  } else if (typeof createdAt === 'number' || typeof createdAt === 'string') {
    date = new Date(createdAt);
  } else {
    return 'Just now';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 30) return 'Just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
};

export default function CommentsSection({
  item,
  subTab,
  className = ''
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  const currentUser = auth.currentUser;
  const currentUid = currentUser?.uid || 'anonymous';
  const currentUserName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Guest User';

  const ownerUid = item?.userId || item?.ownerId || currentUid;
  const colName = getCollectionNameFromTab(item?.subTab || subTab);
  const itemId = item?.id;

  // Firestore real-time comments listener
  useEffect(() => {
    if (!itemId) {
      setIsLoadingComments(false);
      return;
    }

    const path = `users/${ownerUid}/${colName}/${itemId}/comments`;
    const commentsRef = collection(db, 'users', ownerUid, colName, itemId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    setIsLoadingComments(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: CommentItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CommentItem, 'id'>)
        }));
        setComments(loaded);
        setIsLoadingComments(false);
      },
      (err) => {
        // Fallback gracefully if indexing or query fails
        handleFirestoreError(err, OperationType.GET, path);
        setIsLoadingComments(false);
      }
    );

    return () => unsubscribe();
  }, [itemId, ownerUid, colName]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCommentText.trim();
    if (!trimmed || !itemId || isSubmitting) return;

    setIsSubmitting(true);
    const path = `users/${ownerUid}/${colName}/${itemId}/comments`;

    try {
      const commentsRef = collection(db, 'users', ownerUid, colName, itemId, 'comments');
      await addDoc(commentsRef, {
        text: trimmed,
        userId: currentUid,
        userName: currentUserName,
        userEmail: currentUser?.email || '',
        userPhotoUrl: currentUser?.photoURL || '',
        createdAt: serverTimestamp()
      });

      setNewCommentText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!itemId || !commentId) return;

    const path = `users/${ownerUid}/${colName}/${itemId}/comments/${commentId}`;
    try {
      await deleteDoc(doc(db, 'users', ownerUid, colName, itemId, 'comments', commentId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`mt-6 pt-5 border-t border-zinc-200 space-y-4 ${className}`}>
      {/* Comments Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-zinc-700" />
          <h4 className="text-sm font-extrabold text-zinc-900 tracking-tight">
            Comments
          </h4>
          <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        </div>
      </div>

      {/* New Comment Input Box */}
      <form onSubmit={handleAddComment} className="flex gap-2 items-start">
        {currentUser?.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={currentUserName}
            className="w-8 h-8 rounded-full object-cover shrink-0 shadow-2xs border border-zinc-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
            {getUserInitials(currentUserName)}
          </div>
        )}
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-900 placeholder:text-zinc-400"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim() || isSubmitting}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-2xs active:scale-98"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Send size={13} />
                <span className="hidden sm:inline">Post</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {isLoadingComments ? (
        <div className="py-6 flex items-center justify-center text-zinc-400 text-xs gap-2">
          <Loader2 size={16} className="animate-spin" />
          <span>Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200/80 p-4">
          <MessageSquare size={24} className="mx-auto text-zinc-300 mb-1.5" />
          <p className="text-xs font-semibold text-zinc-600">No comments yet</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Be the first to share your thoughts on this!
          </p>
        </div>
      ) : (
        <div className="space-y-3 pt-1 max-h-72 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const canDelete =
              comment.userId === currentUid || ownerUid === currentUid;

            return (
              <div
                key={comment.id}
                className="p-3 bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200/80 rounded-2xl transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {comment.userPhotoUrl ? (
                    <img
                      src={comment.userPhotoUrl}
                      alt={comment.userName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-zinc-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {getUserInitials(comment.userName)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-zinc-900 truncate">
                        {comment.userName}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {formatCommentTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                    title="Delete comment"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
