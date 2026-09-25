import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ShieldAlert, ExternalLink, Terminal, Bell, Sparkles, Database, Info, MailOpen, AlertCircle, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

interface FirestoreRulesModalProps {
  onClose: () => void;
}

const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Default deny all
    match /{document=**} {
      allow read, write: if false;
    }

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // User profile and user-created subcollections
    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /{subcollection}/{docId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}`;

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'system' | 'diagnostic' | 'analytics';
  time: string;
  unread: boolean;
  hasAction?: boolean;
}

export default function FirestoreRulesModal({ onClose }: FirestoreRulesModalProps) {
  const [copied, setCopied] = useState(false);
  const [showRulesSnippet, setShowRulesSnippet] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  // Sync notifications from Firestore in real-time
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    const notifColRef = collection(db, 'users', uid, 'notifications');
    const unsub = onSnapshot(notifColRef, (snap) => {
      if (snap.empty) {
        // Seed initial default high-fidelity notification items on Firestore
        const defaultNotifications: NotificationItem[] = [
          {
            id: 'notif-1',
            title: 'Real-time Analytics Synchronized',
            description: 'Your likes, reactions, comments, shares, votes, and quiz answers are now fully synchronized with Google Firestore cloud servers.',
            type: 'analytics',
            time: 'Just now',
            unread: true,
          },
          {
            id: 'notif-2',
            title: 'Firestore Security Rules Configuration Required',
            description: 'Your cloud database has default locked rules. Configure your secure schema rules now to support safe multi-user interactions.',
            type: 'diagnostic',
            time: '2 minutes ago',
            unread: true,
            hasAction: true,
          },
          {
            id: 'notif-3',
            title: 'Workspace Traffic Engine Activated',
            description: 'Daily visitor spline chart is fully configured, rendering real-time coordinator markers on the Home tab.',
            type: 'system',
            time: '15 minutes ago',
            unread: false,
          },
          {
            id: 'notif-4',
            title: 'Welcome to DMM Creator Workspace',
            description: 'You can now create, view, edit, moderate, and delete across Videos, Showbiz News, Photos, Polls, and Quizzes categories with absolute fluid layout controls.',
            type: 'system',
            time: '1 hour ago',
            unread: false,
          }
        ];

        // Seeding each notification
        defaultNotifications.forEach((n) => {
          setDoc(doc(db, 'users', uid, 'notifications', n.id), n).catch(() => {});
        });
      } else {
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NotificationItem[];
        // Sort consistently to keep clean UI layout flow
        list.sort((a, b) => a.id.localeCompare(b.id));
        setNotifications(list);
      }
      setLoading(false);
    }, (err) => {
      console.error("Failed to load notifications from Firestore:", err);
      setLoading(false);
    });

    return unsub;
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FIRESTORE_RULES_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const promises = notifications
        .filter((n) => n.unread)
        .map((n) =>
          setDoc(doc(db, 'users', uid, 'notifications', n.id), { unread: false }, { merge: true })
        );
      await Promise.all(promises);
    } catch (err) {
      console.error("Failed to mark notifications read in Firestore:", err);
    }
  };

  const toggleReadStatus = async (id: string, currentUnread: boolean) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await setDoc(
        doc(db, 'users', uid, 'notifications', id),
        { unread: !currentUnread },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to toggle read status in Firestore:", err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return n.unread;
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-5 sm:p-6 my-auto max-h-[92vh] flex flex-col transition-all">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40 text-violet-600 dark:text-violet-400">
              <Bell size={22} className={unreadCount > 0 ? "animate-bounce" : ""} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50">
                  My Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-violet-500 text-white animate-pulse">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Real-time creator updates and database telemetry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Close notifications panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0 gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeFilter === 'unread'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              )}
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs font-extrabold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <MailOpen size={13} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 size={32} className="text-violet-500 animate-spin mb-3" />
              <p className="text-xs font-black text-zinc-700 dark:text-zinc-300">Synchronizing notifications with Firestore...</p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Please wait a moment</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MailOpen size={36} className="text-zinc-300 dark:text-zinc-600 mb-2.5" />
              <p className="text-xs font-black text-zinc-800 dark:text-zinc-200">No notifications found</p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">You are all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => toggleReadStatus(n.id, n.unread)}
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed transition-all cursor-pointer relative group flex items-start gap-3 ${
                  n.unread
                    ? 'bg-violet-50/40 dark:bg-violet-950/10 border-violet-100 dark:border-violet-900/30 hover:bg-violet-50/60'
                    : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-150 dark:border-zinc-800/60 hover:bg-zinc-100/40 dark:hover:bg-zinc-900/50'
                }`}
              >
                {/* Visual Accent Badge */}
                {n.unread && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                )}

                {/* Left icon mapping */}
                <div className="shrink-0 mt-0.5">
                  {n.type === 'analytics' && (
                    <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                      <Sparkles size={14} />
                    </div>
                  )}
                  {n.type === 'diagnostic' && (
                    <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                      <ShieldAlert size={14} />
                    </div>
                  )}
                  {n.type === 'system' && (
                    <div className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-750">
                      <Info size={14} />
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className={`font-black text-zinc-900 dark:text-zinc-50 ${n.unread ? 'text-violet-950 dark:text-violet-200' : ''}`}>
                      {n.title}
                    </h4>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                    {n.description}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-1.5">
                    {n.time}
                  </p>

                  {/* Diagnostic Rules Snippet Action Option */}
                  {n.hasAction && (
                    <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setShowRulesSnippet((prev) => !prev)}
                        className="px-3 py-1.5 rounded-lg font-black text-[10px] bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-3xs cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <Terminal size={11} />
                        <span>{showRulesSnippet ? 'Hide Security Code' : 'View Rules Snippet'}</span>
                      </button>

                      {showRulesSnippet && (
                        <div className="mt-3 space-y-2.5 animate-fadeIn">
                          <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                                <Terminal size={11} className="text-zinc-500" />
                                <span>firestore.rules</span>
                              </span>
                              <button
                                type="button"
                                onClick={handleCopy}
                                className="px-2 py-1 text-[9px] font-black rounded-md border border-zinc-700 transition-colors cursor-pointer bg-zinc-800 text-zinc-200 hover:bg-zinc-700 flex items-center gap-1"
                              >
                                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                              </button>
                            </div>
                            <pre className="text-zinc-100 font-mono text-[10px] overflow-x-auto leading-relaxed max-h-40 select-all p-1 bg-zinc-950 rounded-lg">
                              {FIRESTORE_RULES_SNIPPET}
                            </pre>
                          </div>
                          <div className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
                            💡 Copy the snippet, visit{' '}
                            <a
                              href="https://console.firebase.google.com/project/dmm-network-acaf1/firestore/rules"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-600 hover:underline inline-flex items-center gap-0.5"
                            >
                              Firebase Console Rules Editor <ExternalLink size={9} />
                            </a>
                            , and click publish!
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold italic">
            * Syncs dynamically with active workspace categories.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-black text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
