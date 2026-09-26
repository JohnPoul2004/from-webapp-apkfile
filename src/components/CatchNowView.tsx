import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  BookOpen,
  Heart,
  Trash2,
  Pencil,
  Sparkles,
  AlertCircle,
  CheckCircle,
  X,
  Flame,
  Radio,
  Check,
  Copy,
  Layers,
  ListOrdered,
  RotateCcw,
  Send,
  Save,
  Bell,
  BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { CatchNowItem, CatchNowOption, UserProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface CatchNowViewProps {
  currentUser: FirebaseUser | null;
  currentUserProfile: UserProfile | null;
}

const CATEGORIES = [
  'All',
  'Exclusive Story',
  'Live Catch',
  'Breaking Story',
  'Behind The Scenes',
  'Community Spotlight',
  'Trending Now'
];

const PRESET_COVERS = [
  { label: 'Studio Live', url: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop&q=80' },
  { label: 'Broadcast', url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80' },
  { label: 'Podcast & News', url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=80' },
  { label: 'Filming & Cinema', url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80' },
  { label: 'Concert & Stage', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80' }
];

const DEFAULT_ITEMS: CatchNowItem[] = [
  {
    id: 'sample-catch-1',
    title: 'Grand Premiere: Behind the Stage with the All-Star Cast',
    story: `Tonight marks an unforgettable chapter in Philippine entertainment! We went exclusively backstage at the live studio rehearsal to catch up with the director, the lead artists, and the entire production crew. 

From elaborate wardrobe changes to spontaneous acoustic jams in the dressing room, the atmosphere was electrifying. Catch all the unedited clips, candid reactions, and exclusive interviews before the televised nationwide premiere tomorrow night!`,
    date: new Date().toISOString().split('T')[0],
    time: '08:00 PM',
    category: 'Exclusive Story',
    coverPhoto: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop&q=80',
    options: [
      {
        id: 'opt-1-1',
        optionNumber: 1,
        title: 'Exclusive Backstage Footage',
        description: 'Unfiltered rehearsal recordings and dressing room live interactions with the cast.'
      },
      {
        id: 'opt-1-2',
        optionNumber: 2,
        title: 'Director Cut Interview',
        description: 'Deep dive into the cinematic vision and unseen audition tapes.'
      }
    ],
    likes: 42,
    authorName: 'DMM Editorial Team'
  },
  {
    id: 'sample-catch-2',
    title: 'Live Countdown: Metro Acoustic Music Festival 2026',
    story: `The much-awaited weekend music festival is officially kicking off! Join over 20 top indie and OPM breakthrough artists for an all-day acoustic celebration. We have prepared an interactive soundstage where viewers can vote on encore songs in real time.`,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '06:30 PM',
    category: 'Live Catch',
    coverPhoto: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    options: [
      {
        id: 'opt-2-1',
        optionNumber: 1,
        title: 'Main Stage Acoustic Pass',
        description: 'Live streaming on Stage A with real-time sound mixer access.'
      },
      {
        id: 'opt-2-2',
        optionNumber: 2,
        title: 'Artist Lounge Q&A Access',
        description: 'Direct interactive chat during break periods and backstage greenroom talks.'
      }
    ],
    likes: 28,
    authorName: 'Live Stage Crew'
  }
];

const GONGMAN_KEYWORDS_REGEX = /\b(ina|nanay|mother|mom|mama)\b/i;

export const checkGongManKeywords = (text: string): boolean => {
  if (!text) return false;
  return GONGMAN_KEYWORDS_REGEX.test(text);
};

export function CatchNowView({ currentUser, currentUserProfile }: CatchNowViewProps) {
  const [items, setItems] = useState<CatchNowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Active viewing/editing states
  const [editingItem, setEditingItem] = useState<CatchNowItem | null>(null);
  const [viewingStoryItem, setViewingStoryItem] = useState<CatchNowItem | null>(null);

  // Form main fields (now directly in the section)
  const [formTitle, setFormTitle] = useState('');
  const [formStory, setFormStory] = useState('');
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [formTime] = useState('19:00');
  const [formCategory, setFormCategory] = useState('Exclusive Story');
  const [formCoverPhoto] = useState(PRESET_COVERS[0].url);
  
  // Options state (List of Option Number + Title + Description)
  const [formOptions, setFormOptions] = useState<CatchNowOption[]>([]);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const composerRef = useRef<HTMLDivElement>(null);

  // Today's minimum date in YYYY-MM-DD format (no past dates allowed)
  const todayDateStr = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const localKey = currentUser ? `dmm_catch_now_${currentUser.uid}` : 'dmm_catch_now_guest';
  const draftKey = currentUser ? `dmm_catch_now_fields_${currentUser.uid}` : 'dmm_catch_now_fields_guest';

  // Helper to normalize options from existing items (handling legacy single-option format)
  const normalizeOptions = (item: CatchNowItem): CatchNowOption[] => {
    if (Array.isArray(item.options) && item.options.length > 0) {
      return item.options.map((opt) => ({
        ...opt,
        gongManEnabled:
          opt.gongManEnabled !== undefined
            ? opt.gongManEnabled
            : checkGongManKeywords(opt.description || '')
      }));
    }
    if (item.optionTitle || item.optionDescription) {
      const title = item.optionTitle || 'Option 1';
      const description = item.optionDescription || '';
      return [
        {
          id: `opt-${item.id || Date.now()}-1`,
          optionNumber: item.optionNumber ?? 1,
          title,
          description,
          gongManEnabled: checkGongManKeywords(description)
        }
      ];
    }
    return [];
  };

  // Load saved draft fields from localStorage
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formTitle) setFormTitle(parsed.formTitle);
        if (parsed.formStory) setFormStory(parsed.formStory);
        if (parsed.formDate && parsed.formDate >= todayDateStr) setFormDate(parsed.formDate);
        if (Array.isArray(parsed.formOptions) && parsed.formOptions.length > 0) setFormOptions(parsed.formOptions);
      }
    } catch (e) {
      console.warn('Error reading saved Catch Now fields from localStorage:', e);
    }
  }, [draftKey, todayDateStr]);

  // Save fields helper
  const saveFieldsToStorage = (title: string, story: string, date: string, options: CatchNowOption[]) => {
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          formTitle: title,
          formStory: story,
          formDate: date,
          formOptions: options
        })
      );
    } catch (e) {
      console.warn('Error saving fields to localStorage:', e);
    }
  };

  // Load items from Firestore with LocalStorage fallback
  useEffect(() => {
    if (!currentUser) {
      const local = localStorage.getItem(localKey);
      if (local) {
        try {
          const parsed: CatchNowItem[] = JSON.parse(local);
          setItems(parsed.map((it) => ({ ...it, options: normalizeOptions(it) })));
        } catch {
          setItems(DEFAULT_ITEMS);
        }
      } else {
        setItems(DEFAULT_ITEMS);
      }
      setLoading(false);
      return;
    }

    const colRef = collection(db, 'users', currentUser.uid, 'catch_now');
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        if (!snap.empty) {
          const docs: CatchNowItem[] = snap.docs.map((d) => {
            const data = d.data() as CatchNowItem;
            return { id: d.id, ...data, options: normalizeOptions(data) };
          });
          setItems(docs.filter((it) => !it.isDeleted));
        } else {
          const local = localStorage.getItem(localKey);
          if (local) {
            try {
              const parsed: CatchNowItem[] = JSON.parse(local);
              setItems(parsed.map((it) => ({ ...it, options: normalizeOptions(it) })));
            } catch {
              setItems(DEFAULT_ITEMS);
            }
          } else {
            setItems(DEFAULT_ITEMS);
          }
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Catch Now Firestore sync notice, using local cache:', err);
        const local = localStorage.getItem(localKey);
        if (local) {
          try {
            const parsed: CatchNowItem[] = JSON.parse(local);
            setItems(parsed.map((it) => ({ ...it, options: normalizeOptions(it) })));
          } catch {
            setItems(DEFAULT_ITEMS);
          }
        } else {
          setItems(DEFAULT_ITEMS);
        }
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser, localKey]);

  const saveLocally = (newItems: CatchNowItem[]) => {
    localStorage.setItem(localKey, JSON.stringify(newItems));
    setItems(newItems);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormStory('');
    setFormDate(todayDateStr);
    setFormCategory('Exclusive Story');
    setFormOptions([]);
    setFormError(null);
    try {
      localStorage.removeItem(draftKey);
    } catch (e) {
      console.warn('Error clearing localStorage draft:', e);
    }
  };

  const startEditStory = (item: CatchNowItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormStory(item.story);
    setFormDate(item.date < todayDateStr ? todayDateStr : item.date);
    setFormCategory(item.category || 'Exclusive Story');
    setFormOptions(normalizeOptions(item));
    setFormError(null);

    // Scroll smoothly to composer
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Option addition and update handlers
  const handleAddOption = () => {
    const nextNumber = formOptions.length + 1;
    const newOption: CatchNowOption = {
      id: `opt-${Date.now()}-${nextNumber}`,
      optionNumber: nextNumber,
      title: '',
      description: '',
      gongManEnabled: false
    };
    setFormOptions([...formOptions, newOption]);
  };

  const handleUpdateOption = (index: number, field: keyof CatchNowOption, value: any) => {
    const updated = [...formOptions];
    const currentOpt = { ...updated[index], [field]: value };

    // Automatically enable or disable GongMan based on keywords in Description (ina, nanay, mother, mom, mama)
    if (field === 'description') {
      const hasKeywords = checkGongManKeywords(value);
      currentOpt.gongManEnabled = hasKeywords;
    }

    updated[index] = currentOpt;
    setFormOptions(updated);
  };

  const handleToggleGongMan = (index: number) => {
    const updated = [...formOptions];
    updated[index] = {
      ...updated[index],
      gongManEnabled: !updated[index].gongManEnabled
    };
    setFormOptions(updated);
  };

  const handleRemoveOption = (index: number) => {
    const filtered = formOptions.filter((_, i) => i !== index);
    const reindexed = filtered.map((opt, i) => ({
      ...opt,
      optionNumber: i + 1
    }));
    setFormOptions(reindexed);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val < todayDateStr) {
      setFormError(`Past dates are not allowed. Please choose today (${todayDateStr}) or a future date.`);
      setFormDate(todayDateStr);
    } else {
      setFormError(null);
      setFormDate(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation 1: Title
    if (!formTitle.trim()) {
      setFormError('Please enter a Story Title.');
      return;
    }

    // Validation 2: Story Alternate
    if (!formStory.trim()) {
      setFormError('Please enter the Story Alternate.');
      return;
    }

    // Validation 3: Date (Strictly No Past Dates)
    if (!formDate || formDate < todayDateStr) {
      setFormError(`Date cannot be in the past. Please select today (${todayDateStr}) or any future date.`);
      return;
    }

    // Validation 4: Validate Option entries if any exist
    for (let i = 0; i < formOptions.length; i++) {
      const opt = formOptions[i];
      if (!opt.title.trim()) {
        setFormError(`Please enter a Title for Option #${opt.optionNumber || i + 1}.`);
        return;
      }
      if (!opt.description.trim()) {
        setFormError(`Please enter a Description for Option #${opt.optionNumber || i + 1}.`);
        return;
      }
    }

    const cleanOptions: CatchNowOption[] = formOptions.map((opt, idx) => ({
      id: opt.id || `opt-${Date.now()}-${idx + 1}`,
      optionNumber: opt.optionNumber || idx + 1,
      title: opt.title.trim(),
      description: opt.description.trim(),
      gongManEnabled: Boolean(opt.gongManEnabled)
    }));

    const newItem: CatchNowItem = {
      id: editingItem?.id || `catch-${Date.now()}`,
      userId: currentUser?.uid,
      authorName: currentUserProfile?.fullName || currentUser?.displayName || 'Creator',
      authorEmail: currentUser?.email || undefined,
      title: formTitle.trim(),
      story: formStory.trim(),
      date: formDate,
      time: formTime,
      category: formCategory,
      coverPhoto: editingItem?.coverPhoto || formCoverPhoto,
      options: cleanOptions,
      likes: editingItem?.likes || 0,
      updatedAt: new Date().toISOString()
    };

    try {
      // Save fields to local storage
      saveFieldsToStorage(newItem.title, newItem.story, newItem.date, cleanOptions);

      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid, 'catch_now', newItem.id!);
        await setDoc(docRef, {
          ...newItem,
          createdAt: editingItem?.createdAt || serverTimestamp()
        }, { merge: true });
      }

      const updated = editingItem
        ? items.map((it) => (it.id === newItem.id ? newItem : it))
        : [newItem, ...items];
      saveLocally(updated);

      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error saving Catch Now item:', err);
      saveFieldsToStorage(newItem.title, newItem.story, newItem.date, cleanOptions);
      const updated = editingItem
        ? items.map((it) => (it.id === newItem.id ? newItem : it))
        : [newItem, ...items];
      saveLocally(updated);
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
      }, 1500);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this Catch Now story?')) return;

    try {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid, 'catch_now', id);
        await deleteDoc(docRef);
      }
    } catch (err) {
      console.warn('Firestore deletion error, removing locally:', err);
    }

    const filtered = items.filter((it) => it.id !== id);
    saveLocally(filtered);
    if (viewingStoryItem?.id === id) {
      setViewingStoryItem(null);
    }
    if (editingItem?.id === id) {
      resetForm();
    }
  };

  const handleLike = (id?: string) => {
    if (!id) return;
    const updated = items.map((it) => {
      if (it.id === id) {
        return { ...it, likes: (it.likes || 0) + 1 };
      }
      return it;
    });
    saveLocally(updated);
    if (viewingStoryItem?.id === id) {
      setViewingStoryItem({ ...viewingStoryItem, likes: (viewingStoryItem.likes || 0) + 1 });
    }
  };

  const handleCopyLink = (item: CatchNowItem) => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopiedId(item.id || 'current');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchesSearch =
        it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (it.authorName && it.authorName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || it.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const isToday = dateStr === todayDateStr;
      const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return isToday ? `Today • ${formatted}` : formatted;
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="catch-now-container" className="w-full h-full max-w-7xl mx-auto space-y-8 py-2 px-1">
      {/* Inline Catch Now Section Composer (Moved from Popup) */}
      <div
        ref={composerRef}
        id="catch-now-composer-section"
        className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-md"
      >
        <div className="flex items-center justify-between pb-5 border-b border-zinc-100 dark:border-zinc-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              <Radio size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50">
                {editingItem ? 'Edit Catch Now Story' : 'Compose Catch Now Story'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Create your narrative story, schedule date, and add customizable options.
              </p>
            </div>
          </div>

          {editingItem && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <RotateCcw size={13} />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        {/* Composer Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle size={16} className="shrink-0" />
              <span>Story and fields saved to local storage successfully!</span>
            </div>
          )}

          {/* 1. Story Title Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <span>Story Title</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-zinc-400">{formTitle.length}/100</span>
            </div>
            <input
              type="text"
              required
              maxLength={100}
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Grand Premiere: Behind the Stage with the All-Star Cast"
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          {/* 2. Story Alternate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <span>Story Alternate</span>
                <span className="text-rose-500">*</span>
              </label>
            </div>
            <input
              type="text"
              required
              value={formStory}
              onChange={(e) => setFormStory(e.target.value)}
              placeholder="e.g. Exclusive Behind the Scenes Coverage & Preview"
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          {/* 3. Date Selection (Strictly No Past Dates) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Calendar size={13} className="text-amber-500" />
                <span>Date (No Past Dates)</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Min: Today ({todayDateStr})</span>
            </div>
            <input
              type="date"
              required
              min={todayDateStr}
              value={formDate}
              onChange={handleDateChange}
              className="w-full px-4 py-2.5 text-xs rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-medium"
            />
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
              Enforced schedule: Must be today ({todayDateStr}) or any future date.
            </p>
          </div>

          {/* 4. Story Options ({formOptions.length}) */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Story Options ({formOptions.length})</span>
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Add structured story options with sequential Option Number, Title, and Description.
                </p>
              </div>

              <button
                type="button"
                id="btn-add-another-option"
                onClick={handleAddOption}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black shadow-amber-500/20 shadow-xs active:scale-98 cursor-pointer shrink-0 transition-all"
              >
                <Plus size={14} />
                <span>{formOptions.length === 0 ? 'Add Option' : 'Add Another Option'}</span>
              </button>
            </div>

            {/* Render Option Cards */}
            {formOptions.length > 0 && (
              <div className="space-y-3">
                {formOptions.map((opt, idx) => (
                  <motion.div
                    key={opt.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-amber-50/40 dark:bg-zinc-800/50 border border-amber-200/70 dark:border-zinc-700/70 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-black text-xs font-mono">
                          Option {opt.optionNumber || idx + 1}{opt.gongManEnabled ? ' (GongMan)' : ''}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                          Option Details
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove this option"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Option Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={opt.title}
                        onChange={(e) => handleUpdateOption(idx, 'title', e.target.value)}
                        placeholder="e.g. VIP Soundstage Access"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Option Description <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={opt.description}
                        onChange={(e) => handleUpdateOption(idx, 'description', e.target.value)}
                        placeholder="Write a clear description for this option..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                      />
                    </div>

                    {/* GongMan Enable / Disable Toggle */}
                    <div className="pt-2.5 border-t border-amber-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            opt.gongManEnabled
                              ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                          }`}
                        >
                          <BellRing size={14} className={opt.gongManEnabled ? 'animate-pulse' : ''} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                              GongMan
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                opt.gongManEnabled
                                  ? 'bg-amber-500 text-zinc-950 font-bold'
                                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                              }`}
                            >
                              {opt.gongManEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                            {opt.gongManEnabled
                              ? 'Keywords detected in description: (ina, nanay, mother, mom, mama)'
                              : 'Auto-activates on description keywords: (ina, nanay, mother, mom, mama)'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(opt.gongManEnabled)}
                        onClick={() => handleToggleGongMan(idx)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                          opt.gongManEnabled ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                        title={opt.gongManEnabled ? 'GongMan Enabled' : 'GongMan Disabled'}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            opt.gongManEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="submit"
              id="btn-save-catch-now"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Save size={14} />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>

      {/* Story Detail Reader Modal (for clicking Read Story) */}
      <AnimatePresence>
        {viewingStoryItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                <img
                  src={viewingStoryItem.coverPhoto || PRESET_COVERS[0].url}
                  alt={viewingStoryItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                <button
                  type="button"
                  onClick={() => setViewingStoryItem(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-4 left-4 right-4 space-y-1 text-white">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider">
                    {viewingStoryItem.category || 'Catch Now'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black">{viewingStoryItem.title}</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      By {viewingStoryItem.authorName || 'Creator'}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-amber-500" />
                      <span>{formatDateDisplay(viewingStoryItem.date)}</span>
                    </span>
                  </div>
                  {viewingStoryItem.time && (
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock size={13} />
                      <span>{viewingStoryItem.time}</span>
                    </span>
                  )}
                </div>

                {/* Full Story Paragraphs */}
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line space-y-4">
                  {viewingStoryItem.story}
                </div>

                {/* Options Section inside Story Reader */}
                {normalizeOptions(viewingStoryItem).length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      <ListOrdered size={15} />
                      <span>Options ({normalizeOptions(viewingStoryItem).length})</span>
                    </div>

                    <div className="space-y-2.5">
                      {normalizeOptions(viewingStoryItem).map((opt) => (
                        <div
                          key={opt.id || `${opt.optionNumber}-${opt.title}`}
                          className="p-4 rounded-2xl bg-amber-50/60 dark:bg-zinc-800/70 border border-amber-200/70 dark:border-zinc-700/70 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-black text-xs font-mono shadow-xs">
                                Option {opt.optionNumber}{opt.gongManEnabled ? ' (GongMan)' : ''}
                              </span>
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                {opt.title}
                              </h4>
                            </div>
                            {opt.gongManEnabled && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-black text-[10px] tracking-wide shadow-2xs">
                                <BellRing size={11} />
                                <span>GongMan</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-1">
                            {opt.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleLike(viewingStoryItem.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-colors text-xs font-bold cursor-pointer"
                  >
                    <Heart size={15} className={(viewingStoryItem.likes || 0) > 0 ? 'fill-rose-500 text-rose-500' : ''} />
                    <span>{viewingStoryItem.likes || 0} Likes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingStoryItem(null)}
                    className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Close Story
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
