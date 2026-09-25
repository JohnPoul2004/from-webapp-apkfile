import React, { useState, useEffect } from 'react';
import {
  Download,
  FileJson,
  CheckCircle2,
  Database,
  Film,
  Newspaper,
  Image as ImageIcon,
  Vote,
  HelpCircle,
  Layers,
  Calendar,
  Loader2,
  Copy,
  Check,
  Eye,
  X,
  FileText,
  ShoppingBag,
  Package
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getLocalItems } from '../utils/firestoreHelper';
import { logActivity } from '../utils/activityLogger';

interface ExportDataSectionProps {
  currentUser: any;
  onNotice?: (msg: string) => void;
}

interface ExportCategory {
  id: string;
  name: string;
  collection: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  count: number;
}

export const ExportDataSection: React.FC<ExportDataSectionProps> = ({
  currentUser,
  onNotice
}) => {
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({
    videos: true,
    shorts: true,
    showbizNews: true,
    photos: true,
    polls: true,
    quiz: true,
    pages: true,
    events: true,
    shopping: true,
    orders: true
  });

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
    videos: 0,
    shorts: 0,
    showbizNews: 0,
    photos: 0,
    polls: 0,
    quiz: 0,
    pages: 0,
    events: 0,
    shopping: 0,
    orders: 0
  });

  const [isCounting, setIsCounting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const categories: ExportCategory[] = [
    {
      id: 'videos',
      name: 'Videos',
      collection: 'videos',
      icon: Film,
      description: 'Uploaded video links, titles, custom thumbnails, and descriptions',
      count: categoryCounts.videos || 0
    },
    {
      id: 'shorts',
      name: 'Shorts',
      collection: 'shorts',
      icon: Film,
      description: 'Vertical short-form videos, links, titles, and thumbnails',
      count: categoryCounts.shorts || 0
    },
    {
      id: 'showbizNews',
      name: 'Showbiz News',
      collection: 'showbizNews',
      icon: Newspaper,
      description: 'News stories, cover photos, articles, and author details',
      count: categoryCounts.showbizNews || 0
    },
    {
      id: 'photos',
      name: 'Photos & Albums',
      collection: 'photos',
      icon: ImageIcon,
      description: 'Photo galleries, album collections, cover shots, and captions',
      count: categoryCounts.photos || 0
    },
    {
      id: 'polls',
      name: 'Interactive Polls',
      collection: 'polls',
      icon: Vote,
      description: 'Community polls, choices, voting options, and descriptions',
      count: categoryCounts.polls || 0
    },
    {
      id: 'quiz',
      name: 'Quizzes & Questions',
      collection: 'quiz',
      icon: HelpCircle,
      description: 'Multiple choice trivia questions, answer keys, and options',
      count: categoryCounts.quiz || 0
    },
    {
      id: 'pages',
      name: 'Custom Pages',
      collection: 'pages',
      icon: Layers,
      description: 'Custom pages, layouts, branding, and visibility settings',
      count: categoryCounts.pages || 0
    },
    {
      id: 'events',
      name: 'Scheduled Events',
      collection: 'events',
      icon: Calendar,
      description: 'Event dates, locations, start/end times, and reminders',
      count: categoryCounts.events || 0
    },
    {
      id: 'shopping',
      name: 'Shopping Products',
      collection: 'products',
      icon: ShoppingBag,
      description: 'Product catalog, pricing, photos, tags, visibility, and store merchandise',
      count: categoryCounts.shopping || 0
    },
    {
      id: 'orders',
      name: 'Shopping Orders & Receipts',
      collection: 'orders',
      icon: Package,
      description: 'Purchase orders, receipts, items ordered, payment statuses, and transaction details',
      count: categoryCounts.orders || 0
    }
  ];

  // Fetch count of items per collection for current user from Firestore and local cache
  useEffect(() => {
    if (!currentUser?.uid) return;

    let isMounted = true;
    const loadCounts = async () => {
      setIsCounting(true);
      const counts: Record<string, number> = {};

      for (const cat of categories) {
        try {
          const colRef = collection(db, 'users', currentUser.uid, cat.collection);
          const snap = await getDocs(colRef);
          const firestoreDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

          let localDocs: any[] = [];
          if (cat.id === 'orders') {
            try {
              const localOrdersA = JSON.parse(localStorage.getItem(`dmm_local_orders_${currentUser.uid}`) || '[]');
              const localOrdersB = JSON.parse(localStorage.getItem('dmm_user_orders') || '[]');
              localDocs = [...localOrdersA, ...localOrdersB];
            } catch {}
          } else {
            localDocs = getLocalItems(currentUser.uid, cat.collection);
            if (cat.id === 'shopping') {
              const altLocal = getLocalItems(currentUser.uid, 'product');
              localDocs = [...localDocs, ...altLocal];
            }
          }

          const map = new Map();
          localDocs.forEach((it) => it?.id && map.set(it.id, it));
          firestoreDocs.forEach((it) => it?.id && map.set(it.id, it));

          // Also check 'product' collection in Firestore if products was empty
          if (cat.id === 'shopping' && map.size === 0) {
            try {
              const altSnap = await getDocs(collection(db, 'users', currentUser.uid, 'product'));
              altSnap.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
            } catch {}
          }

          counts[cat.id] = map.size;
        } catch {
          // Fallback to local storage if firestore error
          if (cat.id === 'orders') {
            try {
              const localOrdersA = JSON.parse(localStorage.getItem(`dmm_local_orders_${currentUser.uid}`) || '[]');
              const localOrdersB = JSON.parse(localStorage.getItem('dmm_user_orders') || '[]');
              const map = new Map();
              [...localOrdersA, ...localOrdersB].forEach((it) => it?.id && map.set(it.id, it));
              counts[cat.id] = map.size;
            } catch {
              counts[cat.id] = 0;
            }
          } else {
            const localDocs = getLocalItems(currentUser.uid, cat.collection);
            counts[cat.id] = localDocs.length;
          }
        }
      }

      if (isMounted) {
        setCategoryCounts(counts);
        setIsCounting(false);
      }
    };

    loadCounts();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectAllCategories = () => {
    const next: Record<string, boolean> = {};
    categories.forEach((c) => (next[c.id] = true));
    setSelectedCategories(next);
  };

  const deselectAllCategories = () => {
    const next: Record<string, boolean> = {};
    categories.forEach((c) => (next[c.id] = false));
    setSelectedCategories(next);
  };

  const selectedCount = Object.values(selectedCategories).filter(Boolean).length;
  const totalItemsCount = Object.entries(selectedCategories)
    .filter(([_, isSelected]) => isSelected)
    .reduce((sum, [key]) => sum + (categoryCounts[key] || 0), 0);

  // Fetch and package all selected data
  const compileExportData = async () => {
    if (!currentUser?.uid) return null;

    const exportPayload: Record<string, any> = {
      exportInfo: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        platform: 'Dashboard Content Hub',
        user: {
          uid: currentUser.uid,
          email: currentUser.email || 'anonymous',
          displayName: currentUser.displayName || 'User'
        },
        selectedCategories: Object.keys(selectedCategories).filter((k) => selectedCategories[k]),
        totalRecords: 0
      },
      content: {}
    };

    let totalRecords = 0;

    for (const cat of categories) {
      if (!selectedCategories[cat.id]) continue;

      try {
        const colRef = collection(db, 'users', currentUser.uid, cat.collection);
        const snap = await getDocs(colRef);
        const firestoreDocs = snap.docs.map((d) => {
          const raw = d.data();
          // Clean up Firestore timestamps to standard ISO strings
          const cleaned: any = { id: d.id, ...raw };
          if (cleaned.createdAt?.toDate) {
            cleaned.createdAt = cleaned.createdAt.toDate().toISOString();
          }
          if (cleaned.updatedAt?.toDate) {
            cleaned.updatedAt = cleaned.updatedAt.toDate().toISOString();
          }
          return cleaned;
        });

        let localDocs: any[] = [];
        if (cat.id === 'orders') {
          try {
            const localOrdersA = JSON.parse(localStorage.getItem(`dmm_local_orders_${currentUser.uid}`) || '[]');
            const localOrdersB = JSON.parse(localStorage.getItem('dmm_user_orders') || '[]');
            localDocs = [...localOrdersA, ...localOrdersB];
          } catch {}
        } else {
          localDocs = getLocalItems(currentUser.uid, cat.collection);
          if (cat.id === 'shopping') {
            const altLocal = getLocalItems(currentUser.uid, 'product');
            localDocs = [...localDocs, ...altLocal];
          }
        }

        const map = new Map();
        localDocs.forEach((it) => it?.id && map.set(it.id, it));
        firestoreDocs.forEach((it) => it?.id && map.set(it.id, it));

        if (cat.id === 'shopping' && map.size === 0) {
          try {
            const altSnap = await getDocs(collection(db, 'users', currentUser.uid, 'product'));
            altSnap.docs.forEach((d) => {
              const raw = d.data();
              const cleaned: any = { id: d.id, ...raw };
              if (cleaned.createdAt?.toDate) cleaned.createdAt = cleaned.createdAt.toDate().toISOString();
              if (cleaned.updatedAt?.toDate) cleaned.updatedAt = cleaned.updatedAt.toDate().toISOString();
              map.set(d.id, cleaned);
            });
          } catch {}
        }

        const list = Array.from(map.values());
        exportPayload.content[cat.id] = list;
        totalRecords += list.length;
      } catch (err) {
        console.warn(`Export error for ${cat.id}:`, err);
        let fallbackDocs: any[] = [];
        if (cat.id === 'orders') {
          try {
            const localOrdersA = JSON.parse(localStorage.getItem(`dmm_local_orders_${currentUser.uid}`) || '[]');
            const localOrdersB = JSON.parse(localStorage.getItem('dmm_user_orders') || '[]');
            const map = new Map();
            [...localOrdersA, ...localOrdersB].forEach((it) => it?.id && map.set(it.id, it));
            fallbackDocs = Array.from(map.values());
          } catch {}
        } else {
          fallbackDocs = getLocalItems(currentUser.uid, cat.collection);
        }
        exportPayload.content[cat.id] = fallbackDocs;
        totalRecords += fallbackDocs.length;
      }
    }

    exportPayload.exportInfo.totalRecords = totalRecords;

    if (!includeMetadata) {
      delete exportPayload.exportInfo;
      return exportPayload.content;
    }

    return exportPayload;
  };

  const handleDownloadJSON = async () => {
    if (selectedCount === 0) {
      alert('Please select at least one content category to export.');
      return;
    }

    setIsExporting(true);
    setExportSuccess(null);

    try {
      const data = await compileExportData();
      if (!data) throw new Error('No data found to export');

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const username = (currentUser.displayName || currentUser.email?.split('@')[0] || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `dashboard-export-${username}-${dateStr}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const successMsg = `Successfully exported ${totalItemsCount} item${totalItemsCount === 1 ? '' : 's'} as ${filename}!`;
      setExportSuccess(successMsg);
      if (onNotice) onNotice(successMsg);

      // Log in Audit Trail
      logActivity({
        action: 'SETTINGS',
        category: 'Profile',
        title: `Exported user data to JSON file`,
        details: `${totalItemsCount} item(s) exported (${Object.keys(selectedCategories).filter((k) => selectedCategories[k]).join(', ')})`,
        section: 'Settings',
        userId: currentUser.uid,
        userEmail: currentUser.email || undefined,
        status: 'success',
        metadata: {
          filename,
          categories: Object.keys(selectedCategories).filter((k) => selectedCategories[k]),
          totalRecords: totalItemsCount
        }
      }).catch(() => {});

      setTimeout(() => setExportSuccess(null), 5000);
    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Failed to export data: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenPreview = async () => {
    setIsExporting(true);
    try {
      const data = await compileExportData();
      setPreviewData(data);
      setShowPreviewModal(true);
    } catch (err: any) {
      alert(`Failed to generate preview: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyJSON = () => {
    if (!previewData) return;
    navigator.clipboard.writeText(JSON.stringify(previewData, null, 2));
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Export & Data Portability
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Download an offline backup copy of your media, posts, polls, quizzes, pages, and events as structured JSON.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={selectAllCategories}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline cursor-pointer"
          >
            Select All
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
          <button
            type="button"
            onClick={deselectAllCategories}
            className="text-[11px] font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:underline cursor-pointer"
          >
            Deselect All
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">{exportSuccess}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = !!selectedCategories[cat.id];

          return (
            <div
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/80 shadow-2xs'
                  : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200/70 dark:border-zinc-800 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {cat.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">
                      {isCounting ? 'Counting...' : `${cat.count} record${cat.count === 1 ? '' : 's'}`}
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // Handled by parent container click
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer mt-0.5"
                />
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Options Row & Action Buttons */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeMetadata}
            onChange={(e) => setIncludeMetadata(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-600"
          />
          <span>Include metadata (export date, platform version, and account identity)</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenPreview}
            disabled={isExporting || selectedCount === 0}
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-1.5 min-h-[38px] disabled:opacity-40"
          >
            <Eye size={14} className="text-zinc-500" />
            <span>Preview JSON</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            disabled={isExporting || selectedCount === 0}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-40 text-white text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center justify-center gap-2 min-h-[38px]"
          >
            {isExporting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Exporting Data...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Export Data (.JSON)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview JSON Modal */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Export Data Preview
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {totalItemsCount} total records across {selectedCount} categories
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Code Viewer */}
            <div className="p-4 flex-1 overflow-auto bg-zinc-950 text-zinc-200 font-mono text-xs">
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyJSON}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                {copiedPreview ? (
                  <>
                    <Check size={14} className="text-emerald-500" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleDownloadJSON();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={14} />
                  <span>Download Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDataSection;
