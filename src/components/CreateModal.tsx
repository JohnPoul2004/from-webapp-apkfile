import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  CheckCircle,
  AlertCircle,
  Loader2,
  UploadCloud,
  Upload,
  Link2,
  Film,
  Play,
  ChevronUp,
  ChevronDown,
  Globe,
  Lock,
  Layers,
  Calendar,
  MapPin,
  Sparkles
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { DashboardSection, SubTab, PageItem, EventItem, QuotaTierName } from '../types';
import { QUOTA_TIERS, getQuotaResetDate, isQuotaLimitExceeded } from '../data/quotaTiers';
import DocumentEditor from './DocumentEditor';
import { User as FirebaseUser } from 'firebase/auth';
import { readFileAsOptimizedDataUrl, optimizePayloadForFirestore, compressDataUrl } from '../utils/imageHelper';
import {
  handleFirestoreError,
  OperationType,
  isPermissionDeniedError,
  saveLocalItem
} from '../utils/firestoreHelper';
import { getVideoThumbnail, getVideoDomain } from '../utils/videoHelper';
import { logActivity } from '../utils/activityLogger';
import { TagInput } from './TagInput';

interface OtherPhotoDraft {
  id: string;
  photo: string;
  title: string;
  description: string;
  uploading?: boolean;
}

interface CreateModalProps {
  currentUser: FirebaseUser;
  activeSection: DashboardSection;
  activeSubTab: SubTab;
  itemToEdit?: any;
  quotaCounts?: {
    videos: number;
    news: number;
    photos: number;
    polls: number;
    quiz: number;
    pages: number;
    events: number;
  };
  activeTier?: QuotaTierName;
  onClose: () => void;
  onSelectTier?: () => void;
  onSuccess: (message: string) => void;
}

export default function CreateModal({
  currentUser,
  activeSection,
  activeSubTab,
  itemToEdit,
  quotaCounts,
  activeTier,
  onClose,
  onSelectTier,
  onSuccess
}: CreateModalProps) {
  const currentConfig = QUOTA_TIERS[activeTier || 'Free'] || QUOTA_TIERS.Free;
  const isEditing = Boolean(itemToEdit);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');

  const MODELS = [
    { name: 'Gemini 3.8 Flash', id: 'gemini-3.8-flash' },
    { name: 'Gemini 3.7 Flash', id: 'gemini-3.7-flash' },
    { name: 'Gemini 3.6 Flash', id: 'gemini-3.6-flash' },
    { name: 'Gemini 3.5 Flash', id: 'gemini-3.5-flash' },
    { name: 'Gemini 3.5 Flash Lite', id: 'gemini-3.5-flash-lite' },
    { name: 'Gemini 3.1 Flash Lite', id: 'gemini-3.1-flash-lite' },
    { name: 'Gemini 3 Flash Preview', id: 'gemini-3-flash-preview' },
    { name: 'Gemini Flash Latest', id: 'gemini-flash-latest' },
    { name: 'Gemini Flash-Lite Latest', id: 'gemini-flash-lite-latest' },
  ];

  // Shared fields
  const [title, setTitle] = useState(itemToEdit?.title || '');
  const [documentContent, setDocumentContent] = useState(itemToEdit?.document || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Visibility, Page Location, Event Location
  const [visibility, setVisibility] = useState<string>(itemToEdit?.visibility || 'Public');
  const [pageLocation, setPageLocation] = useState<string>(itemToEdit?.pageLocation || 'None / General');
  const [eventLocation, setEventLocation] = useState<string>(itemToEdit?.eventLocation || 'None / General');
  const [tags, setTags] = useState<string[]>(Array.isArray(itemToEdit?.tags) ? itemToEdit.tags : []);
  const [existingUserTags, setExistingUserTags] = useState<string[]>([]);
  const [userPagesList, setUserPagesList] = useState<PageItem[]>([]);
  const [userEventsList, setUserEventsList] = useState<EventItem[]>([]);

  // Load existing pages, events & user tags for dropdown selection and autocomplete
  useEffect(() => {
    if (!currentUser) return;
    const fetchLocations = async () => {
      try {
        const pagesSnap = await getDocs(collection(db, 'users', currentUser.uid, 'pages'));
        setUserPagesList(pagesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PageItem)));
      } catch (err) {
        try {
          const raw = localStorage.getItem(`dmm_local_pages_${currentUser.uid}`);
          if (raw) setUserPagesList(JSON.parse(raw));
        } catch {}
      }

      try {
        const eventsSnap = await getDocs(collection(db, 'users', currentUser.uid, 'events'));
        setUserEventsList(eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem)));
      } catch (err) {
        try {
          const raw = localStorage.getItem(`dmm_local_events_${currentUser.uid}`);
          if (raw) setUserEventsList(JSON.parse(raw));
        } catch {}
      }

      // Collect previously used tags across media collections for smart suggestions
      try {
        const collected = new Set<string>();
        const collectionsToCheck = ['videos', 'showbizNews', 'photos', 'polls', 'quiz'];
        for (const col of collectionsToCheck) {
          const raw = localStorage.getItem(`dmm_local_${col}_${currentUser.uid}`);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              list.forEach((it) => {
                if (Array.isArray(it.tags)) it.tags.forEach((t: string) => collected.add(t));
              });
            }
          }
        }
        setExistingUserTags(Array.from(collected));
      } catch {}
    };
    fetchLocations();
  }, [currentUser?.uid]);

  // Video/Short specific
  const [videoUrl, setVideoUrl] = useState(itemToEdit?.videoUrl || '');
  const [pricing, setPricing] = useState(itemToEdit?.pricing || '');

  // News, Photos, Polls, Quiz, Product specific (Cover Photo)
  const [coverPhoto, setCoverPhoto] = useState(itemToEdit?.coverPhoto || itemToEdit?.photo || '');
  const [coverPhotoLoading, setCoverPhotoLoading] = useState(false);
  const [coverPhotoUrlInput, setCoverPhotoUrlInput] = useState('');
  const [showCoverUrlInput, setShowCoverUrlInput] = useState(false);

  // Photos specific (otherPhoto): default to 3 items so user immediately sees 1 of 3, 2 of 3, 3 of 3
  const [otherPhotos, setOtherPhotos] = useState<OtherPhotoDraft[]>(
    itemToEdit?.otherPhoto?.length
      ? itemToEdit.otherPhoto.map((p: any, idx: number) => ({
          id: `p-${idx + 1}-${Date.now()}`,
          photo: p.photo || '',
          title: p.title || '',
          description: p.description || ''
        }))
      : [
          { id: 'p1', photo: '', title: '', description: '' },
          { id: 'p2', photo: '', title: '', description: '' },
          { id: 'p3', photo: '', title: '', description: '' }
        ]
  );

  // Polls specific (poll)
  const [pollQuestion, setPollQuestion] = useState(itemToEdit?.poll?.question || '');
  const [pollOptions, setPollOptions] = useState<string[]>(
    itemToEdit?.poll?.options?.length
      ? itemToEdit.poll.options.map((o: any) => (typeof o === 'string' ? o : o.text || ''))
      : ['Option 1', 'Option 2']
  );

  // AI loading state for photo descriptions
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState<number | null>(null);
  const [photoAiError, setPhotoAiError] = useState<number | null>(null);

  // Helper for generating photo AI description
  const handleGeneratePhotoDescription = async (index: number) => {
    const item = otherPhotos[index];
    if (!item.title) {
      setError(`Please provide a title for photo ${index + 1} first.`);
      return;
    }

    setIsGeneratingPhoto(index);
    setPhotoAiError(null);
    setError('');

    try {
      const response = await fetch('/api/gemini/generate-short-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, model: selectedModel }),
      });
      if (!response.ok) throw new Error('Failed to generate description');
      const data = await response.json();
      
      const updated = [...otherPhotos];
      updated[index] = { ...updated[index], description: data.text };
      setOtherPhotos(updated);
    } catch (err: any) {
      setPhotoAiError(index);
      setError(err.message || 'Error generating description');
    } finally {
      setIsGeneratingPhoto(null);
    }
  };

  // Quiz specific (quiz)
  const [quizQuestions, setQuizQuestions] = useState<
    { question: string; options: string[]; correctIndex: number }[]
  >(
    itemToEdit?.quiz?.questions?.length
      ? itemToEdit.quiz.questions.map((q: any) => ({
          question: q.question || '',
          options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: q.correctIndex ?? 0
        }))
      : [
          {
            question: '',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0
          }
        ]
  );

  const getItemLabel = (tab: SubTab): string => {
    switch (activeSubTab) {
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

  const currentItemLabel = getItemLabel(activeSubTab);

  // Helper to reorder photos in the photo gallery
  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= otherPhotos.length) return;
    const updated = [...otherPhotos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setOtherPhotos(updated);
  };

  // Ensure user document exists in users/{uid}
  const ensureUserProfile = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          fullName: currentUser.displayName || 'User',
          username: currentUser.email?.split('@')[0] || 'user',
          email: currentUser.email || '',
          quota: 100,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.warn('User profile sync error:', e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (activeSubTab === 'Videos' && !videoUrl.trim()) {
      setError('Video URL is required');
      return;
    }

    if (!isEditing) {
      const getCategoryKey = (subTab: string): 'videos' | 'news' | 'photos' | 'polls' | 'quiz' | 'shorts' | 'products' => {
        if (subTab === 'Videos') return 'videos';
        if (subTab === 'Showbiz News' || subTab === 'News') return 'news';
        if (subTab === 'Photos') return 'photos';
        if (subTab === 'Polls') return 'polls';
        if (subTab === 'Quiz') return 'quiz';
        if (subTab === 'Shorts') return 'shorts';
        if (subTab === 'Products') return 'products';
        return 'videos';
      };
      const catKey = getCategoryKey(activeSubTab);
      if (isQuotaLimitExceeded(quotaCounts, activeTier, catKey)) {
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
        setError(`Quota Limit Exceeded. Please upgrade your plan or reset the quota on ${formattedDate} at ${formattedTime}.`);
        return;
      }
    }

    setSaving(true);
    try {
      // 1. Ensure users/{uid} is created
      await ensureUserProfile();

      // 2. Prepare payload & collection name
      let colName = 'videos';
      let payload: any = {};

      if (activeSubTab === 'Videos') {
        colName = 'videos';
        const detectedThumbnail = getVideoThumbnail(videoUrl.trim(), coverPhoto.trim());
        payload = {
          videoUrl: videoUrl.trim(),
          coverPhoto: detectedThumbnail || coverPhoto.trim() || '',
          title: title.trim(),
          document: documentContent,
          section: activeSection,
          createdAt: serverTimestamp()
        };
      } else if (activeSubTab === 'Shorts') {
        colName = 'shorts';
        payload = {
          videoUrl: videoUrl.trim(),
          title: title.trim(),
          description: documentContent,
          section: activeSection,
          createdAt: serverTimestamp()
        };
      } else if (activeSubTab === 'Products') {
        colName = 'products';
        payload = {
          photo: coverPhoto.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
          title: title.trim(),
          description: documentContent,
          pricing: pricing.trim(),
          section: activeSection,
          createdAt: serverTimestamp()
        };
      } else if (activeSubTab === 'Showbiz News') {
        colName = 'showbizNews';
        payload = {
          coverPhoto: coverPhoto.trim() || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60',
          title: title.trim(),
          document: documentContent,
          section: activeSection,
          createdAt: serverTimestamp()
        };
      } else if (activeSubTab === 'Photos') {
        colName = 'photos';
        const validOther = otherPhotos
          .filter((p) => p.photo.trim() || p.title.trim() || p.description.trim())
          .map((p) => ({
            photo: p.photo.trim(),
            title: p.title.trim(),
            description: p.description.trim()
          }));
        const finalCover =
          coverPhoto.trim() ||
          validOther.find((p) => p.photo)?.photo ||
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60';

        payload = {
          coverPhoto: finalCover,
          title: title.trim(),
          document: documentContent,
          otherPhoto: validOther.length > 0 ? validOther : [{ photo: finalCover, title: title.trim(), description: '' }],
          section: activeSection,
          createdAt: serverTimestamp()
        };
      } else if (activeSubTab === 'Polls') {
        colName = 'polls';
        const validOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
        payload = {
          coverPhoto: coverPhoto.trim() || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60',
          title: title.trim(),
          document: documentContent,
          poll: {
            question: pollQuestion.trim() || title.trim(),
            options: (validOptions.length > 0 ? validOptions : ['Yes', 'No']).map((text, idx) => ({
              id: `opt-${idx + 1}`,
              text,
              votes: 0
            }))
          },
          section: activeSection,
          createdAt: serverTimestamp()
        };
      } else if (activeSubTab === 'Quizzes') {
        colName = 'quiz';
        payload = {
          coverPhoto: coverPhoto.trim() || 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=60',
          title: title.trim(),
          document: documentContent,
          quiz: {
            title: title.trim(),
            questions: quizQuestions.map((q, idx) => ({
              id: `q-${idx + 1}`,
              question: q.question.trim() || `Question ${idx + 1}`,
              options: q.options.map((o) => o.trim() || 'Option'),
              correctIndex: q.correctIndex
            }))
          },
          section: activeSection,
          createdAt: serverTimestamp()
        };
      }

      // Attach Visibility, Page Location, Event Location, and Tags
      payload.visibility = visibility;
      payload.pageLocation = pageLocation === 'None / General' ? '' : pageLocation;
      payload.eventLocation = eventLocation === 'None / General' ? '' : eventLocation;
      payload.tags = tags;

      // Pre-optimize payload to ensure all images and data fit safely within Firestore 1MB document limit
      let safePayload = await optimizePayloadForFirestore(payload);

      let savedCloud = false;
      const targetPath = isEditing
        ? `users/${currentUser.uid}/${colName}/${itemToEdit.id}`
        : `users/${currentUser.uid}/${colName}`;

      try {
        if (isEditing) {
          const docRef = doc(db, 'users', currentUser.uid, colName, itemToEdit.id);
          await setDoc(docRef, { ...safePayload, updatedAt: serverTimestamp() }, { merge: true });
          savedCloud = true;
          saveLocalItem(currentUser.uid, colName, {
            ...itemToEdit,
            ...safePayload,
            updatedAt: new Date().toISOString()
          });
        } else {
          const colRef = collection(db, 'users', currentUser.uid, colName);
          await addDoc(colRef, safePayload);
          savedCloud = true;
        }
      } catch (cloudErr: any) {
        // If error is size limit, attempt emergency ultra-compression
        const isSizeError =
          cloudErr?.message?.includes('exceeds the maximum allowed size') ||
          cloudErr?.message?.includes('size') ||
          cloudErr?.code === 'invalid-argument';

        if (isSizeError) {
          try {
            // Aggressive compression on all images
            if (safePayload.coverPhoto && safePayload.coverPhoto.startsWith('data:image/')) {
              safePayload.coverPhoto = await compressDataUrl(safePayload.coverPhoto, 480, 480, 0.50, 45000);
            }
            if (Array.isArray(safePayload.otherPhoto)) {
              safePayload.otherPhoto = await Promise.all(
                safePayload.otherPhoto.map(async (p: any) => {
                  if (p?.photo && p.photo.startsWith('data:image/')) {
                    const compressed = await compressDataUrl(p.photo, 480, 480, 0.45, 40000);
                    return { ...p, photo: compressed };
                  }
                  return p;
                })
              );
            }

            if (isEditing) {
              const docRef = doc(db, 'users', currentUser.uid, colName, itemToEdit.id);
              await setDoc(docRef, { ...safePayload, updatedAt: serverTimestamp() }, { merge: true });
              savedCloud = true;
              saveLocalItem(currentUser.uid, colName, {
                ...itemToEdit,
                ...safePayload,
                updatedAt: new Date().toISOString()
              });
            } else {
              const colRef = collection(db, 'users', currentUser.uid, colName);
              await addDoc(colRef, safePayload);
              savedCloud = true;
            }
          } catch (retryErr: any) {
            handleFirestoreError(
              retryErr,
              isEditing ? OperationType.UPDATE : OperationType.CREATE,
              targetPath
            );
            // Save locally as fallback so user never loses their data
            const localItem = isEditing
              ? {
                  ...itemToEdit,
                  ...safePayload,
                  updatedAt: new Date().toISOString()
                }
              : {
                  id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                  ...safePayload,
                  createdAt: { toDate: () => new Date() },
                  isLocalOnly: true
                };
            saveLocalItem(currentUser.uid, colName, localItem);
          }
        } else {
          handleFirestoreError(
            cloudErr,
            isEditing ? OperationType.UPDATE : OperationType.CREATE,
            targetPath
          );
          if (isPermissionDeniedError(cloudErr)) {
            // Gracefully persist to local fallback storage so user never loses their data
            const localItem = isEditing
              ? {
                  ...itemToEdit,
                  ...safePayload,
                  updatedAt: new Date().toISOString()
                }
              : {
                  id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                  ...safePayload,
                  createdAt: { toDate: () => new Date() },
                  isLocalOnly: true
                };
            saveLocalItem(currentUser.uid, colName, localItem);
          } else {
            throw cloudErr;
          }
        }
      }

      // Record action in Audit / Activity Log
      const locationInfo =
        pageLocation && pageLocation !== 'None / General'
          ? ` | Page: ${pageLocation}`
          : eventLocation && eventLocation !== 'None / General'
          ? ` | Event: ${eventLocation}`
          : '';

      logActivity({
        action: isEditing ? 'UPDATE' : 'CREATE',
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
        title: `${isEditing ? 'Updated' : 'Created'} ${currentItemLabel} "${title.trim()}"`,
        details: `Section: ${activeSection}${visibility ? ` | Visibility: ${visibility}` : ''}${locationInfo}`,
        section: activeSection,
        userId: currentUser.uid,
        userEmail: currentUser.email || undefined,
        status: 'success',
        metadata: {
          subTab: activeSubTab,
          section: activeSection,
          visibility,
          isEditing
        }
      }).catch(() => {});

      if (savedCloud) {
        onSuccess(
          isEditing
            ? `${currentItemLabel} "${title.trim()}" updated in Firestore successfully!`
            : `${currentItemLabel} "${title.trim()}" saved to Firestore successfully!`
        );
      } else {
        onSuccess(
          isEditing
            ? `${currentItemLabel} "${title.trim()}" updated locally.`
            : `${currentItemLabel} "${title.trim()}" saved! (Note: Saved locally. Your Firebase project rules currently deny writes - see Firestore Rules Guide in dashboard).`
        );
      }

      onClose();
    } catch (err: any) {
      console.error('Firestore save error:', err);
      setError(err.message || 'Failed to save item. Please check permissions or network.');
    } finally {
      setSaving(false);
    }
  };

  const getModalTitle = () => {
    const actionPrefix = isEditing ? 'Edit' : 'Create';
    switch (activeSubTab) {
      case 'Videos':
        return `${actionPrefix} Video`;
      case 'Showbiz News':
        return `${actionPrefix} Showbiz News`;
      case 'Photos':
        return `${actionPrefix} Photos`;
      case 'Polls':
        return `${actionPrefix} Polls`;
      case 'Quizzes':
        return `${actionPrefix} Quiz`;
      case 'Shorts':
        return `${actionPrefix} Short`;
      case 'Products':
        return `${actionPrefix} Product`;
      default:
        return actionPrefix;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 relative my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                {activeSection}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900">{getModalTitle()}</h3>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              {isEditing
                ? `Update the details below for this ${activeSubTab.toLowerCase()} entry.`
                : `Fill in the details below to save this ${activeSubTab.toLowerCase()} entry to Firestore.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSave} className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span className="leading-tight">{error}</span>
              </div>
              {(error.toLowerCase().includes('quota') || error.toLowerCase().includes('exceeded')) && onSelectTier && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectTier();
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs whitespace-nowrap flex items-center gap-1 active:scale-95"
                >
                  <Sparkles size={13} className="text-amber-300 shrink-0" />
                  <span>Upgrade Plan</span>
                </button>
              )}
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${activeSubTab.toLowerCase()} title...`}
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 text-xs sm:text-sm font-medium"
              required
            />
          </div>

          {/* Visibility, Page Location & Event Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
            {/* Visibility Selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Globe size={13} className="text-zinc-500" />
                <span>Visibility</span>
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium cursor-pointer"
              >
                <option value="Public">Public</option>
                <option value="Published">Published</option>
                <option value="Private">Private</option>
                <option value="Unlisted">Unlisted</option>
              </select>
            </div>

            {/* Page Location */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Layers size={13} className="text-zinc-500" />
                <span>Page Location</span>
              </label>
              <select
                value={pageLocation}
                onChange={(e) => setPageLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium cursor-pointer"
              >
                <option value="None / General">None / General</option>
                {userPagesList.map((p) => {
                  const handle = p.username || p.pageUsername;
                  return (
                    <option key={p.id} value={p.title}>
                      {p.title}{handle ? ` (@${handle.replace(/^@/, '')})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Event Location */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-zinc-500" />
                <span>Event Location</span>
              </label>
              <select
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium cursor-pointer"
              >
                <option value="None / General">None / General</option>
                {userEventsList.map((ev) => (
                  <option key={ev.id} value={ev.title}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags & Custom Labels */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
            <TagInput
              tags={tags}
              onChange={setTags}
              availableSuggestions={existingUserTags}
              maxTags={currentConfig.limits.tags ?? 20}
            />
          </div>

          {/* Video URL (for Create Video/Short Popup) */}
          {(activeSubTab === 'Videos' || activeSubTab === 'Shorts') && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                {activeSubTab === 'Shorts' ? 'Short URL' : 'Video URL'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Video size={17} className="absolute left-3.5 text-zinc-400 pointer-events-none" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder={activeSubTab === 'Shorts' ? "https://www.youtube.com/shorts/..." : "https://www.youtube.com/watch?v=... or Vimeo / MP4 URL"}
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              {/* Detected Video Thumbnail Preview */}
              {videoUrl.trim() && (
                <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-3">
                  <div className="w-24 h-14 bg-zinc-950 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
                    {getVideoThumbnail(videoUrl, coverPhoto) ? (
                      <img
                        src={getVideoThumbnail(videoUrl, coverPhoto)!}
                        alt="Detected Video Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Film size={20} className="text-zinc-500" />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                      <div className="w-6 h-6 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-xs">
                        <Play size={10} className="ml-0.5 fill-current text-zinc-900" />
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-800 truncate">
                      {getVideoThumbnail(videoUrl, coverPhoto)
                        ? 'Thumbnail Detected'
                        : 'Video Stream Source'}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {getVideoDomain(videoUrl)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Field for Products */}
          {activeSubTab === 'Products' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                Pricing (PHP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-400 font-bold text-xs pointer-events-none">₱</span>
                <input
                  type="text"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 text-xs sm:text-sm font-medium"
                  required
                />
              </div>
            </div>
          )}

          {/* Cover Photo (Upload without URL + URL fallback) */}
          {activeSubTab !== 'Videos' && activeSubTab !== 'Shorts' && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Cover Photo {activeSubTab === 'Photos' ? '(Album Cover)' : ''}
                </label>
                <button
                  type="button"
                  onClick={() => setShowCoverUrlInput(!showCoverUrlInput)}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <Link2 size={13} />
                  <span>{showCoverUrlInput ? 'Hide URL input' : 'Or paste image URL'}</span>
                </button>
              </div>

              {!coverPhoto ? (
                <div className="space-y-2.5">
                  {/* Direct file upload dropzone: Upload Cover Photo without URL */}
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 hover:border-zinc-500 bg-white hover:bg-zinc-100/60 rounded-xl p-4 transition-all cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setCoverPhotoLoading(true);
                          const dataUrl = await readFileAsOptimizedDataUrl(file);
                          setCoverPhoto(dataUrl);
                        } catch (err: any) {
                          setError(err.message || 'Failed to read image file');
                        } finally {
                          setCoverPhotoLoading(false);
                        }
                      }}
                    />
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-white shadow-xs border border-zinc-200/80 flex items-center justify-center text-zinc-600 group-hover:text-zinc-900 mb-2 transition-all">
                      {coverPhotoLoading ? (
                        <Loader2 size={20} className="animate-spin text-zinc-900" />
                      ) : (
                        <UploadCloud size={20} />
                      )}
                    </div>
                    <p className="text-xs font-bold text-zinc-800 text-center">
                      Upload Cover Photo <span className="text-zinc-500 font-semibold">(without URL)</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 text-center">
                      Click to choose an image from your device or drag &amp; drop
                    </p>
                  </label>

                  {/* Optional URL input toggle */}
                  {showCoverUrlInput && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="url"
                          value={coverPhotoUrlInput}
                          onChange={(e) => setCoverPhotoUrlInput(e.target.value)}
                          placeholder="https://images.unsplash.com/... or image link"
                          className="w-full pl-9 pr-3 py-2 min-h-[40px] bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:outline-none focus:border-zinc-900"
                        />
                      </div>
                      {coverPhotoUrlInput.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            setCoverPhoto(coverPhotoUrlInput.trim());
                            setCoverPhotoUrlInput('');
                          }}
                          className="px-3.5 py-2 min-h-[40px] bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Use URL
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Cover Photo Preview */
                <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 flex flex-col sm:flex-row items-center justify-between p-3 gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-32 aspect-video rounded-lg overflow-hidden bg-black/5 shrink-0 border border-zinc-200">
                      <img src={coverPhoto} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white">
                          Cover Photo Ready
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 font-medium">Image attached without external URL requirement</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <label className="px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const dataUrl = await readFileAsOptimizedDataUrl(file);
                            setCoverPhoto(dataUrl);
                          } catch (err: any) {
                            setError(err.message || 'Failed to read image file');
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setCoverPhoto('')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Document Rich Text Editor with Buttons (Heading 1-3, Text, List, Quote, Underline, Bold, Italic, SemiBold, Link, Embed) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
              Document Content
            </label>
            <DocumentEditor
              value={documentContent}
              onChange={setDocumentContent}
              placeholder={`Compose your ${activeSubTab.toLowerCase()} document... Use the formatting buttons, insert links, or embed media.`}
              currentOtherPhotos={otherPhotos}
              title={title}
              activeSubTab={activeSubTab}
            />
          </div>

          {/* Photos Specific: Other Photo Field with Number of Total Badge, Upload without URL, Title & Description */}
          {activeSubTab === 'Photos' && (
            <div className="space-y-3.5 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                      Other Photo Field
                    </label>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-900 text-white">
                      {otherPhotos.length} {otherPhotos.length === 1 ? 'Photo' : 'Photos'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Upload photos without URL, assign Titles and Descriptions to each item. Reorder anytime with arrows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOtherPhotos([
                      ...otherPhotos,
                      {
                        id: `p-${Date.now()}-${otherPhotos.length + 1}`,
                        photo: '',
                        title: '',
                        description: ''
                      }
                    ])
                  }
                  className="w-full sm:w-auto text-xs font-bold text-zinc-900 hover:text-black flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer min-h-[40px]"
                >
                  <Plus size={14} />
                  <span>Add Photo</span>
                </button>
              </div>

              <div className="space-y-4">
                {otherPhotos.map((item, index) => {
                  const badgeNumber = index + 1;
                  const totalCount = otherPhotos.length;
                  const badgeText = `${badgeNumber} of ${totalCount}`;

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-white border border-zinc-200 rounded-2xl space-y-3.5 shadow-xs relative"
                    >
                      {/* Card Header with Number of Total Badge & Reordering Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2.5 border-b border-zinc-100 gap-2">
                        <div className="flex items-center gap-2.5">
                          {/* Number of Total Badge e.g. 1 of 3, 2 of 3 and 3 of 3 */}
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-extrabold bg-zinc-900 text-white shadow-xs tracking-wide">
                            {badgeText}
                          </span>
                          <span className="text-xs font-bold text-zinc-700">
                            Photo #{badgeNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
                          {/* Reorder Up */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => movePhoto(index, index - 1)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer"
                            title="Move photo up in gallery"
                          >
                            <ChevronUp size={15} />
                          </button>
                          {/* Reorder Down */}
                          <button
                            type="button"
                            disabled={index === otherPhotos.length - 1}
                            onClick={() => movePhoto(index, index + 1)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer"
                            title="Move photo down in gallery"
                          >
                            <ChevronDown size={15} />
                          </button>

                          {otherPhotos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setOtherPhotos(otherPhotos.filter((_, i) => i !== index));
                              }}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium ml-1"
                              title={`Remove photo (${badgeText})`}
                            >
                              <Trash2 size={15} />
                              <span className="text-xs">Remove</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Photo Upload without URL & Preview */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                          Photo <span className="text-zinc-400 font-normal">({badgeText} &bull; Upload without URL)</span>
                        </label>

                        {!item.photo ? (
                          <div className="space-y-2">
                            {/* Drag and drop / click file upload */}
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 hover:border-zinc-500 bg-zinc-50 hover:bg-zinc-100/70 rounded-xl p-3.5 transition-all cursor-pointer group">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    const dataUrl = await readFileAsOptimizedDataUrl(file);
                                    const updated = [...otherPhotos];
                                    updated[index] = { ...updated[index], photo: dataUrl };
                                    setOtherPhotos(updated);
                                  } catch (err: any) {
                                    setError(err.message || 'Failed to process image file');
                                  }
                                }}
                              />
                              <div className="w-8 h-8 rounded-lg bg-white shadow-2xs border border-zinc-200 flex items-center justify-center text-zinc-600 group-hover:text-zinc-900 mb-1.5">
                                <UploadCloud size={16} />
                              </div>
                              <p className="text-xs font-bold text-zinc-800">
                                Upload Photo for <span className="underline decoration-zinc-400">{badgeText}</span>
                              </p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">
                                Click or drag &amp; drop image directly without URL
                              </p>
                            </label>

                            {/* Optional paste image URL input */}
                            <div className="relative">
                              <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                              <input
                                type="url"
                                placeholder={`Or paste photo URL for ${badgeText}...`}
                                value={item.photo}
                                onChange={(e) => {
                                  const updated = [...otherPhotos];
                                  updated[index] = { ...updated[index], photo: e.target.value };
                                  setOtherPhotos(updated);
                                }}
                                className="w-full pl-8 pr-3 py-1.5 min-h-[36px] bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:border-zinc-900"
                              />
                            </div>
                          </div>
                        ) : (
                          /* Uploaded preview */
                          <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/10 shrink-0 border border-zinc-200">
                                <img
                                  src={item.photo}
                                  alt={`Preview ${badgeText}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white mb-0.5">
                                  {badgeText}
                                </span>
                                <p className="text-xs font-medium text-zinc-700 truncate">Image attached</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                              <label className="flex-1 sm:flex-none text-center px-2.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors min-h-[36px] flex items-center justify-center">
                                Change
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const dataUrl = await readFileAsOptimizedDataUrl(file);
                                      const updated = [...otherPhotos];
                                      updated[index] = { ...updated[index], photo: dataUrl };
                                      setOtherPhotos(updated);
                                    } catch (err: any) {
                                      setError(err.message || 'Failed to process image');
                                    }
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...otherPhotos];
                                  updated[index] = { ...updated[index], photo: '' };
                                  setOtherPhotos(updated);
                                }}
                                className="flex-1 sm:flex-none px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors min-h-[36px]"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Title Field in Other Photo Field */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Title <span className="text-zinc-400 font-normal">({badgeText})</span>
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...otherPhotos];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setOtherPhotos(updated);
                          }}
                          placeholder={`Enter title for photo ${badgeText}...`}
                          className="w-full px-3.5 py-2 min-h-[38px] bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-zinc-900"
                        />
                      </div>

                      {/* Description Field in Other Photo Field */}
                      <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1.5">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                            Description <span className="text-zinc-400 font-normal">({badgeText})</span>
                          </label>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                              value={selectedModel}
                              onChange={(e) => setSelectedModel(e.target.value)}
                              className="flex-1 sm:flex-none text-[10px] font-bold text-zinc-800 bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200 cursor-pointer min-h-[28px]"
                            >
                              {MODELS.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleGeneratePhotoDescription(index)}
                              disabled={isGeneratingPhoto === index || !item.title}
                              className="flex-1 sm:flex-none text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 min-h-[28px]"
                            >
                              {isGeneratingPhoto === index ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <Sparkles size={10} />
                              )}
                              <span>Generate AI</span>
                            </button>
                          </div>
                        </div>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...otherPhotos];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setOtherPhotos(updated);
                          }}
                          placeholder={`Enter description for photo ${badgeText}...`}
                          className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-zinc-900 resize-none"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Button to Add More Photos */}
                <button
                  type="button"
                  onClick={() =>
                    setOtherPhotos([
                      ...otherPhotos,
                      {
                        id: `p-${Date.now()}-${otherPhotos.length + 1}`,
                        photo: '',
                        title: '',
                        description: ''
                      }
                    ])
                  }
                  className="w-full py-3 border-2 border-dashed border-zinc-300 hover:border-zinc-500 hover:bg-zinc-50 rounded-2xl text-xs font-bold text-zinc-700 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
                >
                  <Plus size={15} />
                  <span>
                    Add Photo (will become {otherPhotos.length + 1} of {otherPhotos.length + 1})
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Polls Specific: Question & Options */}
          {activeSubTab === 'Polls' && (
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Poll Question
                </label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="What is your question?"
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                    Poll Options
                  </label>
                  {pollOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`])}
                      className="text-xs font-semibold text-zinc-900 hover:text-black flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {pollOptions.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-[11px] font-bold text-zinc-400 text-center">{idx + 1}</span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const next = [...pollOptions];
                          next[idx] = e.target.value;
                          setPollOptions(next);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:border-zinc-900"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quiz Specific: Question, Choices & Correct Answer */}
          {activeSubTab === 'Quizzes' && (
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Quiz Questions ({quizQuestions.length})
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setQuizQuestions([
                      ...quizQuestions,
                      {
                        question: '',
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correctIndex: 0
                      }
                    ])
                  }
                  className="text-xs font-semibold text-zinc-900 hover:text-black flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Question</span>
                </button>
              </div>

              {quizQuestions.map((q, qIdx) => (
                <div key={qIdx} className="p-3 bg-white border border-zinc-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800">Question {qIdx + 1}</span>
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIdx))}
                        className="text-rose-500 hover:bg-rose-50 p-1 rounded cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => {
                      const next = [...quizQuestions];
                      next[qIdx].question = e.target.value;
                      setQuizQuestions(next);
                    }}
                    placeholder={`e.g. What is the capital of France?`}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:border-zinc-900"
                  />

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-zinc-500">
                      Options &amp; Correct Answer (radio selection):
                    </span>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctIndex === optIdx}
                          onChange={() => {
                            const next = [...quizQuestions];
                            next[qIdx].correctIndex = optIdx;
                            setQuizQuestions(next);
                          }}
                          className="cursor-pointer"
                          title="Mark as correct answer"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const next = [...quizQuestions];
                            next[qIdx].options[optIdx] = e.target.value;
                            setQuizQuestions(next);
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          className="flex-1 px-2.5 py-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:border-zinc-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Footer actions */}
        <div className="pt-4 border-t border-zinc-200/80 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl cursor-pointer transition-colors min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 rounded-xl cursor-pointer transition-colors min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{isEditing ? 'Updating...' : 'Saving to Firestore...'}</span>
              </>
            ) : (
              <span>{isEditing ? `Update ${currentItemLabel}` : 'Save to Firestore'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
