import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  Quote,
  Underline as UnderlineIcon,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Link as LinkIcon,
  Video,
  Eye,
  Edit3,
  X,
  Check,
  Film,
  Images,
  Cloud,
  Layers,
  Search,
  Loader2,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  UploadCloud
} from 'lucide-react';
import { EmbedPlatform } from '../types';
import { auth, db } from '../firebase';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { getLocalItems } from '../utils/firestoreHelper';
import { readFileAsOptimizedDataUrl } from '../utils/imageHelper';
import { EmbeddedFirestoreAlbumSlideshow } from './SlideshowPlayer';

interface DocumentEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  currentOtherPhotos?: any[];
  title?: string;
  activeSubTab?: string;
}

interface FirestorePhotoAlbum {
  id: string;
  title?: string;
  description?: string;
  coverPhoto?: string;
  otherPhoto?: any[];
  section?: string;
  createdAt?: any;
}

export default function DocumentEditor({
  value,
  onChange,
  placeholder,
  currentOtherPhotos,
  title = '',
  activeSubTab = ''
}: DocumentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<'write' | 'preview'>('write');

  // AI Generation State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
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

  // Link Modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Embed Modal
  const [embedModalPlatform, setEmbedModalPlatform] = useState<EmbedPlatform | null>(null);
  const [embedUrl, setEmbedUrl] = useState('');
  const [showEmbedDropdown, setShowEmbedDropdown] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // My Photos from Firestore state
  const [firestoreAlbums, setFirestoreAlbums] = useState<FirestorePhotoAlbum[]>([]);
  const [loadingFirestoreAlbums, setLoadingFirestoreAlbums] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [albumSearchQuery, setAlbumSearchQuery] = useState('');

  // Fetch My Photos from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setFirestoreAlbums([]);
      return;
    }

    setLoadingFirestoreAlbums(true);
    const colRef = collection(db, 'users', user.uid, 'photos');

    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const firestoreDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestorePhotoAlbum));
        const localDocs = getLocalItems(user.uid, 'photos') as FirestorePhotoAlbum[];
        const map = new Map<string, FirestorePhotoAlbum>();
        localDocs.forEach((it) => map.set(it.id, it));
        firestoreDocs.forEach((it) => map.set(it.id, it));
        const list = Array.from(map.values());
        setFirestoreAlbums(list);
        if (list.length > 0 && !selectedAlbumId) {
          setSelectedAlbumId(list[0].id);
        }
        setLoadingFirestoreAlbums(false);
      },
      (err) => {
        console.warn('Firestore snapshot error on photos:', err);
        const localDocs = getLocalItems(user.uid, 'photos') as FirestorePhotoAlbum[];
        setFirestoreAlbums(localDocs);
        if (localDocs.length > 0 && !selectedAlbumId) {
          setSelectedAlbumId(localDocs[0].id);
        }
        setLoadingFirestoreAlbums(false);
      }
    );

    return () => unsub();
  }, []);

  // Filtered albums by search query
  const filteredAlbums = useMemo(() => {
    if (!albumSearchQuery.trim()) return firestoreAlbums;
    const q = albumSearchQuery.toLowerCase().trim();
    return firestoreAlbums.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.section && a.section.toLowerCase().includes(q))
    );
  }, [firestoreAlbums, albumSearchQuery]);

  // Selected album object
  const selectedAlbum = useMemo(() => {
    return firestoreAlbums.find((a) => a.id === selectedAlbumId) || null;
  }, [firestoreAlbums, selectedAlbumId]);

  const handleGenerateAI = async () => {
    if (!aiPromptInput.trim()) return;
    setIsGeneratingAI(true);
    setAiError('');
    try {
      const response = await fetch('/api/gemini/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || '',
          contentType: activeSubTab || 'post',
          contextText: value || '',
          aiPromptInput: aiPromptInput.trim(),
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate description from AI.');
      }

      const data = await response.json();
      if (data && data.text) {
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const before = value.substring(0, start);
          const after = value.substring(end);
          const spacing = before && !before.endsWith('\n') ? '\n\n' : '';
          const newContent = `${before}${spacing}${data.text}${after}`;
          onChange(newContent);
          setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + spacing.length + data.text.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 10);
        } else {
          const spacing = value && !value.endsWith('\n') ? '\n\n' : '';
          onChange(value + spacing + data.text);
        }
        // Successfully generated and inserted! Clear and close the modal popup.
        setShowAIModal(false);
        setAiPromptInput('');
      }
    } catch (err: any) {
      console.error('AI Generation Error:', err);
      setAiError(err.message || 'Error generating AI description');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Helper to wrap or insert text in the textarea
  const insertFormatting = (prefix: string, suffix = '', placeholderText = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + prefix + placeholderText + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholderText;

    const before = value.substring(0, start);
    const after = value.substring(end);

    const newContent = `${before}${prefix}${selectedText}${suffix}${after}`;
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  const handleOpenLinkModal = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const selected = value.substring(textarea.selectionStart, textarea.selectionEnd);
      setLinkTitle(selected || '');
    } else {
      setLinkTitle('');
    }
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const handleSaveLink = () => {
    if (!linkUrl.trim()) return;
    const title = linkTitle.trim() || linkUrl.trim();
    const linkMarkdown = `[${title}](${linkUrl.trim()})`;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = value.substring(0, start);
      const after = value.substring(end);
      onChange(`${before}${linkMarkdown}${after}`);
    } else {
      onChange(value + ' ' + linkMarkdown);
    }

    setShowLinkModal(false);
    setLinkTitle('');
    setLinkUrl('');
  };

  const handleInsertSlideshowEmbed = (albumId?: string, albumTitle?: string) => {
    let embedTag = `\n[embed:slideshow-photos]\n`;
    if (albumId) {
      embedTag = `\n[embed:slideshow-photos id="${albumId}" title="${(albumTitle || 'Photos Album').replace(/"/g, "'")}"]\n`;
    }
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = value.substring(0, start);
      const after = value.substring(end);
      onChange(`${before}${embedTag}${after}`);
    } else {
      onChange(value + embedTag);
    }
    setEmbedModalPlatform(null);
    setShowEmbedDropdown(false);
  };

  const handleSaveEmbed = () => {
    if (embedModalPlatform === 'Slideshow Photos') {
      if (selectedAlbum) {
        handleInsertSlideshowEmbed(selectedAlbum.id, selectedAlbum.title);
      }
      return;
    }

    if (!embedUrl.trim() || !embedModalPlatform) return;
    const url = embedUrl.trim();
    let embedTag = '';

    if (embedModalPlatform === 'YouTube') {
      let videoId = '';
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) videoId = match[1];
      const embedSrc = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      embedTag = `\n<div class="embed-youtube my-3 aspect-video w-full max-w-xl rounded-xl overflow-hidden border border-zinc-200"><iframe src="${embedSrc}" class="w-full h-full" allowfullscreen></iframe></div>\n`;
    } else if (embedModalPlatform === 'Dailymotion') {
      let videoId = '';
      const match = url.match(/dai\.ly\/([a-zA-Z0-9]+)|dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
      if (match) videoId = match[1] || match[2];
      const embedSrc = videoId ? `https://www.dailymotion.com/embed/video/${videoId}` : url;
      embedTag = `\n<div class="embed-dailymotion my-3 aspect-video w-full max-w-xl rounded-xl overflow-hidden border border-zinc-200"><iframe src="${embedSrc}" class="w-full h-full" allowfullscreen></iframe></div>\n`;
    } else if (embedModalPlatform === 'Image') {
      embedTag = `\n![Image](${url})\n`;
    } else {
      // Facebook, Instagram, Threads
      embedTag = `\n<div class="embed-${embedModalPlatform.toLowerCase()} my-3 p-4 rounded-xl bg-zinc-100 border border-zinc-200"><p class="text-xs font-semibold text-zinc-700 mb-1">${embedModalPlatform} Post</p><a href="${url}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 underline break-all">${url}</a></div>\n`;
    }

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = value.substring(0, start);
      const after = value.substring(end);
      onChange(`${before}${embedTag}${after}`);
    } else {
      onChange(value + embedTag);
    }

    setEmbedModalPlatform(null);
    setEmbedUrl('');
  };

  return (
    <div className="border border-zinc-300 rounded-xl overflow-hidden bg-white focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900/10">
      {aiError && (
        <div className="bg-rose-50 border-b border-rose-100 px-3 py-1.5 flex items-center justify-between gap-2 text-rose-800 text-[11px] font-semibold">
          <span>{aiError}</span>
          <button
            type="button"
            onClick={() => setAiError('')}
            className="text-rose-500 hover:text-rose-700 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* DOCUMENT BUTTONS TOOLBAR */}
      <div className="bg-zinc-50 border-b border-zinc-200 p-2 flex flex-wrap items-center justify-between gap-1.5 text-xs select-none">
        {/* Formatting Group */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Heading 1 */}
          <button
            type="button"
            title="Heading 1"
            onClick={() => insertFormatting('# ', '\n', 'Heading 1')}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Heading1 size={15} />
            <span className="hidden sm:inline text-[11px]">H1</span>
          </button>

          {/* Heading 2 */}
          <button
            type="button"
            title="Heading 2"
            onClick={() => insertFormatting('## ', '\n', 'Heading 2')}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Heading2 size={15} />
            <span className="hidden sm:inline text-[11px]">H2</span>
          </button>

          {/* Heading 3 */}
          <button
            type="button"
            title="Heading 3"
            onClick={() => insertFormatting('### ', '\n', 'Heading 3')}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Heading3 size={15} />
            <span className="hidden sm:inline text-[11px]">H3</span>
          </button>

          {/* Text */}
          <button
            type="button"
            title="Text (Paragraph)"
            onClick={() => insertFormatting('\n', '\n', 'Regular text')}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Type size={15} />
            <span className="hidden sm:inline text-[11px]">Text</span>
          </button>

          <span className="h-4 w-px bg-zinc-300 mx-0.5" />

          {/* List */}
          <button
            type="button"
            title="List"
            onClick={() => insertFormatting('- ', '\n', 'List item')}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
          >
            <List size={15} />
            <span className="hidden md:inline text-[11px]">List</span>
          </button>

          {/* Quote */}
          <button
            type="button"
            title="Quote"
            onClick={() => insertFormatting('> ', '\n', 'Quote text')}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Quote size={15} />
            <span className="hidden md:inline text-[11px]">Quote</span>
          </button>

          <span className="h-4 w-px bg-zinc-300 mx-0.5" />

          {/* Underline */}
          <button
            type="button"
            title="Underline"
            onClick={() => insertFormatting('<u>', '</u>', 'underlined')}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
          >
            <UnderlineIcon size={15} />
            <span className="hidden md:inline text-[11px]">Underline</span>
          </button>

          {/* Bold */}
          <button
            type="button"
            title="Bold"
            onClick={() => insertFormatting('**', '**', 'bold text')}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <BoldIcon size={15} />
            <span className="hidden md:inline text-[11px]">Bold</span>
          </button>

          {/* Italic */}
          <button
            type="button"
            title="Italic"
            onClick={() => insertFormatting('*', '*', 'italic text')}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 italic transition-colors cursor-pointer flex items-center gap-1"
          >
            <ItalicIcon size={15} />
            <span className="hidden md:inline text-[11px]">Italic</span>
          </button>

          {/* SemiBold */}
          <button
            type="button"
            title="SemiBold"
            onClick={() => insertFormatting('<span class="font-semibold">', '</span>', 'semibold text')}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-800 font-semibold transition-colors cursor-pointer"
          >
            <span className="text-[11px]">SemiBold</span>
          </button>

          <span className="h-4 w-px bg-zinc-300 mx-0.5" />

          {/* Link Button */}
          <button
            type="button"
            title="Link (Title with Text Value + Link -> Save)"
            onClick={handleOpenLinkModal}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer flex items-center gap-1 bg-zinc-100 border border-zinc-200"
          >
            <LinkIcon size={14} className="text-blue-600" />
            <span className="font-semibold text-[11px]">Link</span>
          </button>

          <span className="h-4 w-px bg-zinc-300 mx-0.5" />

          {/* Generate AI Button */}
          <button
            type="button"
            title="Generate description/content using AI"
            onClick={() => {
              setAiPromptInput('');
              setAiError('');
              setShowAIModal(true);
            }}
            className="p-1.5 rounded hover:bg-zinc-200 transition-colors cursor-pointer flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 font-extrabold"
          >
            <Sparkles size={14} className="text-amber-600 fill-amber-500 animate-pulse" />
            <span className="text-[11px]">Generate AI</span>
          </button>

          {/* Embed Dropdown / Options */}
          <div className="relative">
            <button
              type="button"
              title="Embed: YouTube, Facebook, Instagram, Threads, Dailymotion, Slideshow Photos"
              onClick={() => setShowEmbedDropdown(!showEmbedDropdown)}
              className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer flex items-center gap-1 bg-zinc-100 border border-zinc-200"
            >
              <Video size={14} className="text-purple-600" />
              <span className="font-semibold text-[11px]">Embed</span>
            </button>

            {showEmbedDropdown && (
              <div className="absolute left-0 mt-1 w-52 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 py-1.5">
                <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Social & Video
                </div>
                {(['YouTube', 'Facebook', 'Instagram', 'Threads', 'Dailymotion', 'Image'] as EmbedPlatform[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setEmbedModalPlatform(p);
                      setShowEmbedDropdown(false);
                      setEmbedUrl('');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {p === 'Image' ? <ImageIcon size={13} className="text-emerald-600" /> : null}
                      <span>{p}</span>
                    </div>
                  </button>
                ))}

                <div className="h-px bg-zinc-100 my-1" />

                <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Photos
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmbedModalPlatform('Slideshow Photos');
                    setShowEmbedDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50/60 hover:bg-amber-100/80 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Film size={14} className="text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="block font-bold">Slideshow Photos</span>
                    <span className="block text-[10px] text-amber-800/70 font-normal">Other Photos field only</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-zinc-200/80 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('write')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              viewMode === 'write' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Edit3 size={12} />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              viewMode === 'preview' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Eye size={12} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {viewMode === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Write your document content here... Use the toolbar above for headings, text, links, and embeds.'}
          rows={7}
          className="w-full p-3.5 text-xs sm:text-sm font-mono text-zinc-800 focus:outline-none resize-y min-h-[140px] leading-relaxed"
        />
      ) : (
        <div className="p-4 min-h-[140px] text-xs sm:text-sm leading-relaxed text-zinc-800 overflow-y-auto max-h-[300px] bg-zinc-50/40">
          {value.trim() ? (
            <div className="space-y-3">
              {value.split(/(\[embed:slideshow-photos(?:\s+id="[^"]*")?(?:\s+title="[^"]*")?\]|\[embed:slideshow-photos:[^\]]+\]|\[slideshow-photos\])/gi).map((part, pIdx) => {
                const isSlideshow =
                  part.startsWith('[embed:slideshow-photos') ||
                  part.startsWith('[slideshow-photos]');

                if (isSlideshow) {
                  // Extract album id and title if present
                  const idMatch = part.match(/id="([^"]+)"/) || part.match(/\[embed:slideshow-photos:([^\]]+)\]/);
                  const titleMatch = part.match(/title="([^"]+)"/);
                  const albumId = idMatch ? idMatch[1] : null;
                  const albumTitle = titleMatch ? titleMatch[1] : null;

                  const targetAlbum = albumId ? firestoreAlbums.find((a) => a.id === albumId) : null;
                  const displayTitle = albumTitle || targetAlbum?.title || (albumId ? 'Firestore Photo Album' : 'Current Document Photos');

                  return (
                    <EmbeddedFirestoreAlbumSlideshow
                      key={pIdx}
                      albumId={albumId}
                      albumTitle={displayTitle}
                      fallbackPhotos={currentOtherPhotos || []}
                    />
                  );
                }

                return (
                  <div
                    key={pIdx}
                    className="prose prose-sm max-w-none space-y-2 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: part
                        .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-zinc-900 mt-2 mb-1">$1</h1>')
                        .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-zinc-900 mt-2 mb-1">$1</h2>')
                        .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-zinc-900 mt-1.5 mb-1">$1</h3>')
                        .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-zinc-400 pl-3 italic text-zinc-600 my-1">$1</blockquote>')
                        .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-zinc-900">$1</strong>')
                        .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
                        .replace(/!\[(.*?)\]\((.*?)\)/gim, '<div class="my-3 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100"><img src="$2" alt="$1" class="w-full h-auto max-h-[400px] object-contain" /></div>')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline font-medium">$1</a>')
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-zinc-400 italic">Document is empty. Switch to "Write" to add content.</p>
          )}
        </div>
      )}

      {/* Link Modal Popup: Title with Text Value + Link -> Save */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-zinc-900">Insert Link</h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">
                  Title with Text Value
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="e.g. Read full announcement"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">
                  Link (URL)
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLink}
                  disabled={!linkUrl.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embed Modal Popup: YouTube, Facebook, Instagram, Threads, Dailymotion, or Slideshow Photos */}
      {embedModalPlatform && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className={`w-full ${embedModalPlatform === 'Slideshow Photos' ? 'max-w-xl' : 'max-w-sm'} bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-zinc-200 max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                {embedModalPlatform === 'Slideshow Photos' ? (
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Film size={18} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    <Video size={18} />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">
                    {embedModalPlatform === 'Slideshow Photos' ? 'Embed Slideshow Photos' : `Embed ${embedModalPlatform}`}
                  </h4>
                  {embedModalPlatform === 'Slideshow Photos' && (
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Select photo albums from Firestore or current document
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmbedModalPlatform(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {embedModalPlatform === 'Slideshow Photos' ? (
              <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                <div className="space-y-3">
                  {/* Search bar */}
                  {firestoreAlbums.length > 3 && (
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={albumSearchQuery}
                        onChange={(e) => setAlbumSearchQuery(e.target.value)}
                        placeholder="Search photo albums from Firestore..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 focus:bg-white"
                      />
                    </div>
                  )}

                  {loadingFirestoreAlbums ? (
                    <div className="py-10 flex flex-col items-center justify-center text-zinc-500 gap-2">
                      <Loader2 size={24} className="animate-spin text-zinc-800" />
                      <span className="text-xs font-semibold">Loading your photos from Firestore...</span>
                    </div>
                  ) : filteredAlbums.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-2">
                      <Images size={28} className="mx-auto text-zinc-400" />
                      <h5 className="text-xs font-bold text-zinc-800">
                        {firestoreAlbums.length === 0
                          ? 'No Photo Albums Found in Firestore'
                          : 'No matching photo albums found'}
                      </h5>
                      <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                        {firestoreAlbums.length === 0
                          ? 'Create a Photo item in the Photos subtab to embed photo albums into your document.'
                          : 'Try adjusting your search terms.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {filteredAlbums.map((album) => {
                        const isSelected = selectedAlbumId === album.id;
                        const otherList = Array.isArray(album.otherPhoto) ? album.otherPhoto : [];
                        const photoCount = otherList.length;

                        return (
                          <div
                            key={album.id}
                            onClick={() => setSelectedAlbumId(album.id)}
                            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2.5 ${
                              isSelected
                                ? 'border-zinc-900 bg-zinc-900/5 shadow-xs'
                                : 'border-zinc-200 hover:border-zinc-300 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                                  {album.coverPhoto ? (
                                    <img
                                      src={album.coverPhoto}
                                      alt={album.title || 'Cover'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Images size={20} className="text-zinc-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <h5 className="text-xs font-bold text-zinc-900 truncate">
                                      {album.title || 'Untitled Photo Album'}
                                    </h5>
                                    {album.section && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-100 text-zinc-600">
                                        {album.section}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-zinc-500 line-clamp-1">
                                    {album.description || 'No description provided'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                                  {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
                                </span>
                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? 'bg-zinc-900 border-zinc-900 text-white'
                                      : 'border-zinc-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <Check size={12} strokeWidth={3} />}
                                </div>
                              </div>
                            </div>

                            {/* Mini preview strip of album other photos */}
                            {photoCount > 0 && (
                              <div className="flex items-center gap-1.5 pt-1 overflow-x-hidden">
                                {otherList.slice(0, 4).map((p: any, idx: number) => {
                                  const src = typeof p === 'object' && p !== null ? p.photo : p;
                                  return (
                                    <div
                                      key={idx}
                                      className="w-10 h-8 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0"
                                    >
                                      <img src={src} alt="thumbnail" className="w-full h-full object-cover" />
                                    </div>
                                  );
                                })}
                                {photoCount > 4 && (
                                  <span className="text-[10px] font-bold text-zinc-400 pl-1">
                                    +{photoCount - 4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 shrink-0">
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {selectedAlbum
                      ? `Selected: "${selectedAlbum.title || 'Album'}"`
                      : 'Select a photo album to embed'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEmbedModalPlatform(null)}
                      className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEmbed}
                      disabled={!selectedAlbum}
                      className="px-4 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <Check size={14} strokeWidth={2.5} />
                      <span>Insert Slideshow Embed</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : embedModalPlatform === 'Image' ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Upload Image or Paste URL
                  </label>
                  
                  {/* Upload Area */}
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer group ${
                    embedUrl.startsWith('data:image/') 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-zinc-300 hover:border-zinc-500 bg-zinc-50 hover:bg-zinc-100'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setImageUploadLoading(true);
                          const dataUrl = await readFileAsOptimizedDataUrl(file);
                          setEmbedUrl(dataUrl);
                        } catch (err: any) {
                          setAiError(err.message || 'Failed to process image');
                        } finally {
                          setImageUploadLoading(false);
                        }
                      }}
                    />
                    {imageUploadLoading ? (
                      <Loader2 size={32} className="animate-spin text-zinc-400 mb-2" />
                    ) : embedUrl.startsWith('data:image/') ? (
                      <div className="relative w-full aspect-video max-h-[120px] rounded-lg overflow-hidden border border-emerald-200 mb-2">
                        <img src={embedUrl} alt="Upload preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                          <Check size={24} className="text-emerald-600 bg-white rounded-full p-1 shadow-sm" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 mb-2 transition-colors">
                        <UploadCloud size={24} />
                      </div>
                    )}
                    <p className="text-xs font-bold text-zinc-800">
                      {embedUrl.startsWith('data:image/') ? 'Image Ready' : 'Choose an image to upload'}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1">PNG, JPG or WebP (max 1MB)</p>
                  </label>

                  <div className="flex items-center gap-3">
                    <div className="h-px bg-zinc-200 flex-1" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">OR</span>
                    <div className="h-px bg-zinc-200 flex-1" />
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1.5 uppercase">
                      Image URL
                    </label>
                    <div className="relative">
                      <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="url"
                        value={embedUrl.startsWith('data:image/') ? '' : embedUrl}
                        onChange={(e) => setEmbedUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmbedModalPlatform(null);
                      setEmbedUrl('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEmbed}
                    disabled={!embedUrl.trim() || imageUploadLoading}
                    className="px-5 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <Check size={14} />
                    <span>Insert Image</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">
                    {embedModalPlatform} URL
                  </label>
                  <input
                    type="url"
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    placeholder={`https://${embedModalPlatform.toLowerCase()}.com/...`}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEmbedModalPlatform(null)}
                    className="px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEmbed}
                    disabled={!embedUrl.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Insert Embed</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Prompt Modal Popup */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                  <Sparkles size={16} className="fill-amber-500" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900">Generate AI Description</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAIModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer"
                disabled={isGeneratingAI}
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  Select Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10"
                  disabled={isGeneratingAI}
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  Description / Prompt Instructions
                </label>
                <textarea
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  placeholder="Describe what the AI should write about (e.g. 'Write a detailed summary of local music events' or 'An introduction to movie news')"
                  rows={4}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 placeholder:text-zinc-400"
                  autoFocus
                  disabled={isGeneratingAI}
                />
              </div>

              {aiError && (
                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-rose-800 text-[11px] font-semibold flex items-center justify-between gap-2">
                  <span>{aiError}</span>
                  <button
                    type="button"
                    onClick={() => setAiError('')}
                    className="text-rose-500 hover:text-rose-700 font-bold shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer"
                  disabled={isGeneratingAI}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={!aiPromptInput.trim() || isGeneratingAI}
                  className="px-4 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-amber-800" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      <span>Insert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
