import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  RotateCcw,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { DashboardSection, SubTab } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  handleFirestoreError,
  OperationType,
  getDeletedLocalItems,
  removeDeletedLocalItem,
  saveLocalItem,
  saveDeletedLocalItem,
  calculateDaysRemaining
} from '../utils/firestoreHelper';
import { getVideoThumbnail } from '../utils/videoHelper';
import { optimizePayloadForFirestore } from '../utils/imageHelper';

interface DeletedModalProps {
  currentUser: FirebaseUser;
  activeSection: DashboardSection;
  activeSubTab: SubTab;
  onClose: () => void;
  onActionNotice?: (msg: string) => void;
}

export default function DeletedModal({
  currentUser,
  activeSection,
  activeSubTab,
  onClose,
  onActionNotice
}: DeletedModalProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'restore' | 'delete' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [itemToDeleteConfirm, setItemToDeleteConfirm] = useState<any | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeletingFromFirestore, setIsDeletingFromFirestore] = useState(false);

  const getSubTabSingularLabel = (tab: SubTab): string => {
    switch (tab) {
      case 'Videos':
        return 'Video';
      case 'Shorts':
        return 'Short';
      case 'Products':
        return 'Product';
      case 'Showbiz News':
        return 'News';
      case 'Photos':
        return 'Photo Album';
      case 'Polls':
        return 'Poll';
      case 'Quizzes':
        return 'Quiz';
      default:
        return 'Item';
    }
  };

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

  const getSubTabDeletedCollectionName = (tab: SubTab) => {
    return `${getSubTabCollectionName(tab)}_deleted`;
  };

  const loadItems = async () => {
    setLoading(true);
    const delColName = getSubTabDeletedCollectionName(activeSubTab);
    const colName = getSubTabCollectionName(activeSubTab);
    let firestoreDocs: any[] = [];

    try {
      const colRef = collection(db, 'users', currentUser.uid, delColName);
      const snap = await getDocs(colRef);
      firestoreDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `users/${currentUser.uid}/${delColName}`);
    }

    const localDocs = getDeletedLocalItems(currentUser.uid, colName);
    const mergedMap = new Map<string, any>();
    localDocs.forEach((d) => mergedMap.set(d.id, d));
    firestoreDocs.forEach((d) => mergedMap.set(d.id, d));
    const all = Array.from(mergedMap.values());
    setItems(all);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, [activeSubTab, currentUser.uid]);

  // Restore item back to active collection
  const handleRestore = async (item: any) => {
    setProcessingId(item.id);
    setProcessingAction('restore');
    const colName = getSubTabCollectionName(activeSubTab);
    const delColName = getSubTabDeletedCollectionName(activeSubTab);

    const { deletedAt, scheduledDays, ...cleanItem } = item;
    const restoredItem = await optimizePayloadForFirestore({
      ...cleanItem,
      restoredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 1. Add back to active Firestore collection
    try {
      const activeDocRef = doc(db, 'users', currentUser.uid, colName, item.id);
      await setDoc(activeDocRef, {
        ...restoredItem,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/${colName}/${item.id}`);
    }

    // 2. Remove from deleted Firestore collection
    try {
      const delDocRef = doc(db, 'users', currentUser.uid, delColName, item.id);
      await deleteDoc(delDocRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/${delColName}/${item.id}`);
    }

    // 3. Update local caches
    saveLocalItem(currentUser.uid, colName, restoredItem);
    removeDeletedLocalItem(currentUser.uid, colName, item.id);

    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setProcessingId(null);
    setProcessingAction(null);

    const notice = `"${item.title || 'Item'}" restored to dashboard successfully!`;
    setStatusMessage(notice);
    if (onActionNotice) onActionNotice(notice);
  };

  // Trigger single item permanent delete popup
  const handleDeletePermanent = (item: any) => {
    setItemToDeleteConfirm(item);
  };

  // Execute permanent delete from Firestore
  const executeDeletePermanent = async (item: any) => {
    if (!item) return;
    setIsDeletingFromFirestore(true);
    setProcessingId(item.id);
    setProcessingAction('delete');
    const colName = getSubTabCollectionName(activeSubTab);
    const delColName = getSubTabDeletedCollectionName(activeSubTab);

    try {
      const delDocRef = doc(db, 'users', currentUser.uid, delColName, item.id);
      await deleteDoc(delDocRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/${delColName}/${item.id}`);
    }

    removeDeletedLocalItem(currentUser.uid, colName, item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setProcessingId(null);
    setProcessingAction(null);
    setIsDeletingFromFirestore(false);
    setItemToDeleteConfirm(null);

    const typeLabel = getSubTabSingularLabel(activeSubTab);
    const notice = `${typeLabel} "${item.title || 'Item'}" deleted permanently from Firestore.`;
    setStatusMessage(notice);
    if (onActionNotice) onActionNotice(notice);
  };

  // Bulk Restore All
  const handleRestoreAll = async () => {
    if (items.length === 0) return;
    for (const item of items) {
      await handleRestore(item);
    }
  };

  // Trigger Bulk Delete All Permanently Popup
  const handleDeleteAllPermanent = () => {
    if (items.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  // Execute Bulk Delete All Permanently from Firestore
  const executeDeleteAllPermanent = async () => {
    if (items.length === 0) return;
    setIsDeletingFromFirestore(true);
    const colName = getSubTabCollectionName(activeSubTab);
    const delColName = getSubTabDeletedCollectionName(activeSubTab);

    for (const item of items) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, delColName, item.id));
      } catch (e) {
        // continue
      }
      removeDeletedLocalItem(currentUser.uid, colName, item.id);
    }
    setItems([]);
    setIsDeletingFromFirestore(false);
    setShowBulkDeleteConfirm(false);
    const notice = `All ${activeSubTab.toLowerCase()} deleted permanently from Firestore.`;
    setStatusMessage(notice);
    if (onActionNotice) onActionNotice(notice);
  };

  const getModalTitle = () => {
    switch (activeSubTab) {
      case 'Videos':
        return 'Deleted Videos';
      case 'Shorts':
        return 'Deleted Shorts';
      case 'Products':
        return 'Deleted Products';
      case 'Showbiz News':
        return 'Deleted Showbiz News';
      case 'Photos':
        return 'Deleted Photos';
      case 'Polls':
        return 'Deleted Polls';
      case 'Quizzes':
        return 'Deleted Quizzes';
      default:
        return 'Deleted Items';
    }
  };

  return (
    <div
      id="deleted-modal-overlay"
      className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
    >
      <div
        id="deleted-modal-card"
        className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 relative my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 shrink-0 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                {activeSection} &bull; Trash
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                {activeSubTab}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 leading-tight">
              {getModalTitle()}
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Manage deleted items for {activeSection} &bull; {activeSubTab}
            </p>
          </div>
          <button
            type="button"
            id="close-deleted-modal-btn"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Schedule Policy Notice Banner */}
        <div className="my-3.5 p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-start gap-3 text-amber-900 shrink-0">
          <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-950">
              Schedule deletion in 100 days click Restore or Delete Permanently
            </p>
            <p className="text-amber-800 leading-relaxed">
              Items moved to trash will be automatically purged after 100 days. Click{' '}
              <span className="font-semibold text-zinc-900 underline">Restore</span> to recover an
              item to your active dashboard, or{' '}
              <span className="font-semibold text-rose-700 underline">Delete Permanently</span> to
              remove it right now.
            </p>
          </div>
        </div>

        {/* Status Feedback */}
        {statusMessage && (
          <div className="mb-3 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shrink-0">
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

        {/* Items List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 min-h-[160px]">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 size={24} className="animate-spin mb-2.5 text-zinc-700" />
              <p className="text-xs font-medium">Loading deleted items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-14 px-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3 border border-zinc-200">
                <Trash2 size={22} />
              </div>
              <h4 className="text-sm font-bold text-zinc-800">Trash is empty</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No deleted items in {activeSection} &bull; {activeSubTab}. When you delete items from
                your dashboard, they will appear here with a 100-day schedule.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const daysLeft = calculateDaysRemaining(item.deletedAt, 100);
              const thumb =
                getVideoThumbnail(item.videoUrl, item.coverPhoto) || item.coverPhoto;
              const isItemBusy = processingId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 bg-white border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:border-zinc-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {thumb ? (
                      <div className="w-14 h-12 rounded-lg bg-zinc-900 overflow-hidden shrink-0 border border-zinc-200">
                        <img
                          src={thumb}
                          alt={item.title || 'Item thumbnail'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                        <Clock size={18} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-zinc-900 truncate">
                        {item.title || 'Untitled item'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                          <Clock size={11} />
                          <span>Schedule deletion in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>
                        </span>
                        {item.deletedAt && (
                          <span className="text-[10px] text-zinc-400">
                            Deleted:{' '}
                            {new Date(
                              typeof item.deletedAt === 'string'
                                ? item.deletedAt
                                : item.deletedAt?.toDate
                                ? item.deletedAt.toDate()
                                : Date.now()
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Restore or Delete Permanently */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                    <button
                      type="button"
                      id={`restore-item-btn-${item.id}`}
                      onClick={() => handleRestore(item)}
                      disabled={isItemBusy}
                      className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                    >
                      {isItemBusy && processingAction === 'restore' ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <RotateCcw size={13} className="text-zinc-600" />
                      )}
                      <span>Restore</span>
                    </button>

                    <button
                      type="button"
                      id={`delete-permanent-btn-${item.id}`}
                      onClick={() => handleDeletePermanent(item)}
                      disabled={isItemBusy}
                      aria-label={`Delete ${item.title || 'item'} permanently`}
                      className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100/90 active:bg-rose-200 border border-rose-200/90 hover:border-rose-300 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer min-h-[38px] shadow-2xs hover:shadow-xs active:scale-[0.98] group/delbtn"
                    >
                      {isItemBusy && processingAction === 'delete' ? (
                        <Loader2 size={13.5} className="animate-spin text-rose-600" />
                      ) : (
                        <Trash2 size={13.5} className="text-rose-600 group-hover/delbtn:scale-110 transition-transform" />
                      )}
                      <span>Delete Permanently</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Bulk Controls and Close */}
        <div className="pt-4 border-t border-zinc-200 flex items-center justify-between gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handleRestoreAll}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  Restore All ({items.length})
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllPermanent}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  Empty Trash
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

        {/* Single Item Permanent Delete Confirmation Popup */}
        {itemToDeleteConfirm && (
          <div
            id="delete-permanent-confirm-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-popup-title"
            className="fixed inset-0 z-60 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div
              id="delete-permanent-popup-card"
              className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-7 relative flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle size={24} className="text-rose-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                      Permanent Delete
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-zinc-600 bg-zinc-100">
                      {activeSection} &bull; {getSubTabSingularLabel(activeSubTab)}
                    </span>
                  </div>
                  <h3 id="delete-popup-title" className="text-base sm:text-lg font-bold text-zinc-900 leading-snug">
                    Delete {getSubTabSingularLabel(activeSubTab)} from Firestore?
                  </h3>
                </div>
                <button
                  type="button"
                  id="close-delete-popup-btn"
                  onClick={() => !isDeletingFromFirestore && setItemToDeleteConfirm(null)}
                  disabled={isDeletingFromFirestore}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Item Details Box */}
              <div className="bg-zinc-50 border border-zinc-200/90 rounded-xl p-3.5 flex items-center gap-3">
                {itemToDeleteConfirm.coverPhoto || itemToDeleteConfirm.videoUrl ? (
                  <div className="w-14 h-12 rounded-lg bg-zinc-900 overflow-hidden shrink-0 border border-zinc-200">
                    <img
                      src={itemToDeleteConfirm.coverPhoto || getVideoThumbnail(itemToDeleteConfirm.videoUrl, itemToDeleteConfirm.coverPhoto)}
                      alt={itemToDeleteConfirm.title || 'Item thumbnail'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-zinc-200/80 flex items-center justify-center text-zinc-500 shrink-0">
                    <Trash2 size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 truncate">
                    {itemToDeleteConfirm.title || 'Untitled item'}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                    ID: <span className="font-mono text-[10px]">{itemToDeleteConfirm.id}</span>
                  </p>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-rose-800">
                  <AlertCircle size={14} className="shrink-0 text-rose-600" />
                  <span>This operation is irreversible</span>
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  This document will be permanently removed from Cloud Firestore path{' '}
                  <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px] text-rose-900 border border-rose-200">
                    users/{currentUser.uid}/{getSubTabDeletedCollectionName(activeSubTab)}
                  </code>{' '}
                  and cleared from local offline storage.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  id="cancel-delete-permanent-popup-btn"
                  onClick={() => setItemToDeleteConfirm(null)}
                  disabled={isDeletingFromFirestore}
                  className="px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-delete-permanent-popup-btn"
                  onClick={() => executeDeletePermanent(itemToDeleteConfirm)}
                  disabled={isDeletingFromFirestore}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 min-h-[40px]"
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

        {/* Bulk Delete All Confirmation Popup */}
        {showBulkDeleteConfirm && (
          <div
            id="bulk-delete-confirm-popup"
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-60 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div
              id="bulk-delete-popup-card"
              className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-7 relative flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle size={24} className="text-rose-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                    Empty Trash
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug mt-1">
                    Delete all {items.length} {activeSubTab} from Firestore?
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

              <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-rose-800">
                  <AlertCircle size={14} className="shrink-0 text-rose-600" />
                  <span>Permanent bulk deletion</span>
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  All {items.length} {activeSubTab.toLowerCase()} items will be permanently erased from Cloud Firestore and cannot be recovered.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  disabled={isDeletingFromFirestore}
                  className="px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteAllPermanent}
                  disabled={isDeletingFromFirestore}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 min-h-[40px]"
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
