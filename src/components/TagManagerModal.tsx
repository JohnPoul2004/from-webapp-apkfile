import React, { useState, useEffect } from 'react';
import {
  Tag,
  X,
  Edit2,
  Trash2,
  Check,
  Search,
  Layers,
  Film,
  Newspaper,
  Image as ImageIcon,
  Vote,
  HelpCircle,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getTagStyle, cleanTagName } from '../utils/tagHelper';
import { getLocalItems, saveLocalItem } from '../utils/firestoreHelper';
import { logActivity } from '../utils/activityLogger';

interface TagManagerModalProps {
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
  onSelectTagToFilter?: (tagName: string) => void;
  onTagsUpdated?: () => void;
}

interface TagStat {
  name: string;
  totalCount: number;
  breakdown: Record<string, number>;
  items: Array<{ id: string; colName: string; title: string; tags: string[] }>;
}

const COLLECTIONS = [
  { id: 'videos', name: 'Videos', icon: Film },
  { id: 'shorts', name: 'Shorts', icon: Film },
  { id: 'showbizNews', name: 'Showbiz News', icon: Newspaper },
  { id: 'photos', name: 'Photos', icon: ImageIcon },
  { id: 'polls', name: 'Polls', icon: Vote },
  { id: 'quiz', name: 'Quizzes', icon: HelpCircle },
  { id: 'pages', name: 'Pages', icon: Layers }
];

export const TagManagerModal: React.FC<TagManagerModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSelectTagToFilter,
  onTagsUpdated
}) => {
  const [loading, setLoading] = useState(true);
  const [tagStats, setTagStats] = useState<TagStat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editNameInput, setEditNameInput] = useState('');
  const [processingTag, setProcessingTag] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  const fetchAllTags = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);

    try {
      const statsMap = new Map<string, TagStat>();

      for (const col of COLLECTIONS) {
        let items: any[] = [];
        try {
          const colRef = collection(db, 'users', currentUser.uid, col.id);
          const snap = await getDocs(colRef);
          items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch {
          items = getLocalItems(currentUser.uid, col.id);
        }

        // Also merge local items in case offline
        const local = getLocalItems(currentUser.uid, col.id);
        const map = new Map();
        local.forEach((it) => map.set(it.id, it));
        items.forEach((it) => map.set(it.id, it));
        const mergedItems = Array.from(map.values());

        mergedItems.forEach((item: any) => {
          if (Array.isArray(item.tags)) {
            item.tags.forEach((rawTag: string) => {
              const tag = cleanTagName(rawTag);
              if (!tag) return;

              if (!statsMap.has(tag)) {
                statsMap.set(tag, {
                  name: tag,
                  totalCount: 0,
                  breakdown: {},
                  items: []
                });
              }

              const stat = statsMap.get(tag)!;
              stat.totalCount += 1;
              stat.breakdown[col.id] = (stat.breakdown[col.id] || 0) + 1;
              stat.items.push({
                id: item.id,
                colName: col.id,
                title: item.title || 'Untitled',
                tags: item.tags
              });
            });
          }
        });
      }

      const list = Array.from(statsMap.values()).sort((a, b) => b.totalCount - a.totalCount);
      setTagStats(list);
    } catch (err) {
      console.error('Failed to load tag stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllTags();
    }
  }, [isOpen, currentUser?.uid]);

  const handleRenameTag = async (oldName: string) => {
    const newName = cleanTagName(editNameInput);
    if (!newName || newName.toLowerCase() === oldName.toLowerCase()) {
      setEditingTag(null);
      return;
    }

    setProcessingTag(oldName);
    const targetStat = tagStats.find((s) => s.name === oldName);
    if (!targetStat) {
      setProcessingTag(null);
      setEditingTag(null);
      return;
    }

    try {
      // Update each item in Firestore and local storage
      for (const itemRef of targetStat.items) {
        const updatedTags = itemRef.tags.map((t) =>
          cleanTagName(t).toLowerCase() === oldName.toLowerCase() ? newName : cleanTagName(t)
        );

        try {
          const docRef = doc(db, 'users', currentUser.uid, itemRef.colName, itemRef.id);
          await setDoc(docRef, { tags: updatedTags }, { merge: true });
        } catch {}

        try {
          const localList = getLocalItems(currentUser.uid, itemRef.colName);
          const target = localList.find((it) => it.id === itemRef.id);
          if (target) {
            saveLocalItem(currentUser.uid, itemRef.colName, { ...target, tags: updatedTags });
          }
        } catch {}
      }

      // Log in Audit Trail
      logActivity({
        action: 'UPDATE',
        category: 'System',
        title: `Renamed tag #${oldName} to #${newName}`,
        details: `Updated ${targetStat.items.length} item(s)`,
        section: 'Settings',
        userId: currentUser.uid,
        userEmail: currentUser.email || undefined,
        status: 'success'
      }).catch(() => {});

      setActionSuccess(`Renamed #${oldName} to #${newName} across ${targetStat.items.length} item(s)!`);
      setEditingTag(null);
      await fetchAllTags();
      if (onTagsUpdated) onTagsUpdated();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Failed to rename tag: ${err.message || err}`);
    } finally {
      setProcessingTag(null);
    }
  };

  const handleDeleteTag = async (tagToDeleteName: string) => {
    setProcessingTag(tagToDeleteName);
    const targetStat = tagStats.find((s) => s.name === tagToDeleteName);
    if (!targetStat) {
      setProcessingTag(null);
      setTagToDelete(null);
      return;
    }

    try {
      for (const itemRef of targetStat.items) {
        const updatedTags = itemRef.tags.filter(
          (t) => cleanTagName(t).toLowerCase() !== tagToDeleteName.toLowerCase()
        );

        try {
          const docRef = doc(db, 'users', currentUser.uid, itemRef.colName, itemRef.id);
          await setDoc(docRef, { tags: updatedTags }, { merge: true });
        } catch {}

        try {
          const localList = getLocalItems(currentUser.uid, itemRef.colName);
          const target = localList.find((it) => it.id === itemRef.id);
          if (target) {
            saveLocalItem(currentUser.uid, itemRef.colName, { ...target, tags: updatedTags });
          }
        } catch {}
      }

      // Log in Audit Trail
      logActivity({
        action: 'DELETE',
        category: 'System',
        title: `Removed tag #${tagToDeleteName}`,
        details: `Removed from ${targetStat.items.length} item(s)`,
        section: 'Settings',
        userId: currentUser.uid,
        userEmail: currentUser.email || undefined,
        status: 'warning'
      }).catch(() => {});

      setActionSuccess(`Removed #${tagToDeleteName} from all ${targetStat.items.length} item(s)!`);
      setTagToDelete(null);
      await fetchAllTags();
      if (onTagsUpdated) onTagsUpdated();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Failed to remove tag: ${err.message || err}`);
    } finally {
      setProcessingTag(null);
    }
  };

  if (!isOpen) return null;

  const filteredStats = tagStats.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[88vh] shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Tag & Label Manager
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Organize, rename, and manage custom labels across all your content
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Notice */}
        {actionSuccess && (
          <div className="mx-5 sm:mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
        )}

        {/* Search Bar & Tag Stats Overview */}
        <div className="p-5 sm:p-6 pb-3 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold shrink-0">
              <span>{tagStats.length} Unique Tags</span>
              <span>&bull;</span>
              <span>
                {tagStats.reduce((sum, t) => sum + t.totalCount, 0)} Total Assignments
              </span>
            </div>
          </div>
        </div>

        {/* Tags List */}
        <div className="px-5 sm:px-6 pb-6 flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2">
              <Loader2 size={24} className="animate-spin text-zinc-400" />
              <p className="text-xs text-zinc-500">Scanning content tags...</p>
            </div>
          ) : filteredStats.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <Tag size={28} className="text-zinc-400 mb-2 opacity-60" />
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {searchQuery ? `No tags found matching "${searchQuery}"` : 'No tags created yet'}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-sm">
                Add tags while creating or editing videos, news, photos, polls, and quizzes to see them here!
              </p>
            </div>
          ) : (
            filteredStats.map((stat) => {
              const isEditing = editingTag === stat.name;
              const isProcessing = processingTag === stat.name;
              const style = getTagStyle(stat.name);

              return (
                <div
                  key={stat.name}
                  className="p-3.5 bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  {/* Left: Tag Badge & Edit Field */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                        <span className="text-zinc-400 text-xs font-bold">#</span>
                        <input
                          type="text"
                          value={editNameInput}
                          onChange={(e) => setEditNameInput(e.target.value)}
                          className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg font-bold text-zinc-900 dark:text-zinc-100 flex-1 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                          placeholder="New tag name"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameTag(stat.name);
                            if (e.key === 'Escape') setEditingTag(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameTag(stat.name)}
                          disabled={isProcessing}
                          className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          title="Save Rename"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTag(null)}
                          className="p-1 rounded-md bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                          title="Cancel"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs ${style.bg} ${style.text} ${style.border} ${style.darkBg} ${style.darkText} ${style.darkBorder}`}
                        >
                          #{stat.name}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-semibold">
                          {stat.totalCount} item{stat.totalCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    )}

                    {/* Breakdown per media type */}
                    {!isEditing && (
                      <div className="hidden md:flex items-center gap-2 text-[10px] text-zinc-400">
                        {Object.entries(stat.breakdown).map(([colId, count]) => {
                          const col = COLLECTIONS.find((c) => c.id === colId);
                          return (
                            <span key={colId} className="bg-zinc-100 dark:bg-zinc-700/60 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 font-medium">
                              {col?.name}: {count}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    {onSelectTagToFilter && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTagToFilter(stat.name);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 text-xs font-bold cursor-pointer transition-colors"
                      >
                        Filter Grid
                      </button>
                    )}

                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTag(stat.name);
                          setEditNameInput(stat.name);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                        title="Rename Tag"
                      >
                        <Edit2 size={13} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setTagToDelete(stat.name)}
                      disabled={isProcessing}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                      title="Delete Tag from all items"
                    >
                      {isProcessing ? (
                        <Loader2 size={13} className="animate-spin text-zinc-400" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {tagToDelete && (
          <div className="p-4 border-t border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>
                Remove <span className="font-bold">#{tagToDelete}</span> from all assigned items? (The media items themselves will NOT be deleted).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setTagToDelete(null)}
                className="px-3 py-1 text-xs font-bold rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTag(tagToDelete)}
                disabled={Boolean(processingTag)}
                className="px-3.5 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {processingTag ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                <span>Confirm Remove</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagManagerModal;
