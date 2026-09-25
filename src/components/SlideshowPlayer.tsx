import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Film, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getLocalItems } from '../utils/firestoreHelper';

export interface PhotoItem {
  id: string;
  photo: string;
  title?: string;
  description?: string;
}

export interface OtherPhotosSlideshowPlayerProps {
  photos: PhotoItem[];
  isEmbedded?: boolean;
  albumTitle?: string;
}

export function OtherPhotosSlideshowPlayer({
  photos,
  isEmbedded = false,
  albumTitle
}: OtherPhotosSlideshowPlayerProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);

  // Normalize photos list
  const normalizedPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return [];
    return photos.map((p, idx) => {
      if (typeof p === 'object' && p !== null) {
        return {
          id: p.id || `photo-${idx}`,
          photo: p.photo || '',
          title: p.title || '',
          description: p.description || ''
        };
      }
      return {
        id: `photo-${idx}`,
        photo: String(p || ''),
        title: '',
        description: ''
      };
    }).filter(p => !!p.photo);
  }, [photos]);

  // Keep index in bounds if photos length changes
  useEffect(() => {
    if (slideIndex >= normalizedPhotos.length && normalizedPhotos.length > 0) {
      setSlideIndex(0);
    }
  }, [normalizedPhotos.length, slideIndex]);

  // Autoplay timer
  useEffect(() => {
    if (!autoplay || normalizedPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % normalizedPhotos.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [autoplay, normalizedPhotos.length]);

  if (normalizedPhotos.length === 0) {
    return (
      <div className="p-4 bg-zinc-100 rounded-2xl text-xs text-zinc-500 italic border border-zinc-200 text-center">
        No other photos uploaded in the Other Photos field for this slideshow.
      </div>
    );
  }

  const currentPhoto = normalizedPhotos[slideIndex] || normalizedPhotos[0];

  return (
    <div className={`space-y-3 ${isEmbedded ? 'my-2' : ''}`}>
      {/* Slideshow Player Frame */}
      <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-md group">
        <div className="aspect-video w-full flex items-center justify-center bg-zinc-900/60 relative">
          <img
            key={slideIndex}
            src={currentPhoto?.photo}
            alt={currentPhoto?.title || `Photo ${slideIndex + 1} of ${normalizedPhotos.length}`}
            className="max-h-full max-w-full object-contain select-none transition-all duration-300"
          />

          {/* Top badges: Total count (e.g. 1 of 3, 2 of 3, 3 of 3) */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-zinc-900/90 text-white backdrop-blur-xs border border-white/10 shadow-xs flex items-center gap-1.5">
              <span>{slideIndex + 1} of {normalizedPhotos.length}</span>
            </span>
            {albumTitle && (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-900/80 text-zinc-300 backdrop-blur-xs border border-white/10 truncate max-w-[200px]">
                {albumTitle}
              </span>
            )}
          </div>

          {/* Left Navigation Arrow */}
          {normalizedPhotos.length > 1 && (
            <button
              type="button"
              onClick={() => setSlideIndex((prev) => (prev - 1 + normalizedPhotos.length) % normalizedPhotos.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer opacity-90 hover:opacity-100 hover:scale-105 z-10 shadow-lg"
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {normalizedPhotos.length > 1 && (
            <button
              type="button"
              onClick={() => setSlideIndex((prev) => (prev + 1) % normalizedPhotos.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer opacity-90 hover:opacity-100 hover:scale-105 z-10 shadow-lg"
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* Slideshow Bottom Bar / Info: Title + Description */}
        <div className="p-3.5 bg-zinc-900/95 text-white border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h5 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
              {currentPhoto?.title || `Photo ${slideIndex + 1} of ${normalizedPhotos.length}`}
            </h5>
            {currentPhoto?.description && (
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed whitespace-pre-wrap">
                {currentPhoto?.description}
              </p>
            )}
          </div>

          {/* Autoplay toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {normalizedPhotos.length > 1 && (
              <button
                type="button"
                onClick={() => setAutoplay((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  autoplay
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }`}
              >
                {autoplay ? <Pause size={13} /> : <Play size={13} className="fill-current" />}
                <span>{autoplay ? 'Playing' : 'Auto Play'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface EmbeddedFirestoreAlbumSlideshowProps {
  albumId?: string | null;
  albumTitle?: string | null;
  fallbackPhotos?: PhotoItem[] | any[];
  isEmbedded?: boolean;
}

export function EmbeddedFirestoreAlbumSlideshow({
  albumId,
  albumTitle,
  fallbackPhotos = [],
  isEmbedded = true
}: EmbeddedFirestoreAlbumSlideshowProps) {
  const [albumPhotos, setAlbumPhotos] = useState<PhotoItem[]>([]);
  const [resolvedTitle, setResolvedTitle] = useState<string>(albumTitle || '');
  const [loading, setLoading] = useState<boolean>(!!albumId);

  // Normalize fallbackPhotos
  const normalizedFallback: PhotoItem[] = useMemo(() => {
    if (!Array.isArray(fallbackPhotos)) return [];
    return fallbackPhotos.map((p, idx) => {
      const isObj = typeof p === 'object' && p !== null;
      return {
        id: isObj && p.id ? p.id : `fallback-${idx}`,
        photo: isObj ? p.photo : p,
        title: isObj ? p.title : `Photo ${idx + 1}`,
        description: isObj ? p.description : ''
      };
    }).filter(p => !!p.photo);
  }, [fallbackPhotos]);

  useEffect(() => {
    if (!albumId) {
      setAlbumPhotos(normalizedFallback);
      setLoading(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setAlbumPhotos(normalizedFallback);
      setLoading(false);
      return;
    }

    // Check local storage cache first
    const localPhotos = getLocalItems(user.uid, 'photos');
    const matched = localPhotos.find((p: any) => p.id === albumId);
    if (matched) {
      const list: PhotoItem[] = [];
      if (Array.isArray(matched.otherPhoto)) {
        matched.otherPhoto.forEach((p: any, idx: number) => {
          const isObj = typeof p === 'object' && p !== null;
          const photoUrl = isObj ? p.photo : p;
          if (photoUrl) {
            list.push({
              id: isObj && p.id ? p.id : `other-${idx}`,
              photo: photoUrl,
              title: isObj ? p.title : `Photo ${idx + 1}`,
              description: isObj ? p.description : ''
            });
          }
        });
      }
      setAlbumPhotos(list);
      if (matched.title) setResolvedTitle(matched.title);
      setLoading(false);
    }

    // Fetch from Firestore doc
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'photos', albumId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const list: PhotoItem[] = [];
          if (Array.isArray(data.otherPhoto)) {
            data.otherPhoto.forEach((p: any, idx: number) => {
              const isObj = typeof p === 'object' && p !== null;
              const photoUrl = isObj ? p.photo : p;
              if (photoUrl) {
                list.push({
                  id: isObj && p.id ? p.id : `other-${idx}`,
                  photo: photoUrl,
                  title: isObj ? p.title : `Photo ${idx + 1}`,
                  description: isObj ? p.description : ''
                });
              }
            });
          }
          setAlbumPhotos(list);
          if (data.title) setResolvedTitle(data.title);
        }
      } catch (err) {
        console.warn('Failed to fetch album doc for slideshow:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [albumId, normalizedFallback]);

  if (loading) {
    return (
      <div className="p-6 bg-zinc-900 text-white rounded-2xl flex items-center justify-center gap-2 my-3">
        <Loader2 size={18} className="animate-spin text-amber-400" />
        <span className="text-xs font-semibold">Loading slideshow from Firestore...</span>
      </div>
    );
  }

  const effectivePhotos = albumId ? albumPhotos : normalizedFallback;

  return (
    <div className={`my-3 ${isEmbedded ? '' : ''}`}>
      {effectivePhotos.length > 0 ? (
        <OtherPhotosSlideshowPlayer
          photos={effectivePhotos}
          isEmbedded
          albumTitle={resolvedTitle}
        />
      ) : (
        <div className="p-4 bg-white rounded-xl text-xs text-zinc-500 italic border border-zinc-200 text-center">
          No other photos found in this album's Other Photos field.
        </div>
      )}
    </div>
  );
}
