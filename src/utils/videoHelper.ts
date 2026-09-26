/**
 * Helper utility for extracting video IDs, embed URLs, and thumbnails
 * from YouTube, Vimeo, and direct video sources.
 */

export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export function extractVimeoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/);
  return match ? match[1] : null;
}

export function extractDailymotionId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:dailymotion\.com\/(?:video|hub)\/|dai\.ly\/)([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export function getVideoThumbnail(videoUrl?: string, coverPhoto?: string): string | null {
  if (coverPhoto && typeof coverPhoto === 'string' && coverPhoto.trim().length > 0) {
    return coverPhoto.trim();
  }

  if (!videoUrl || typeof videoUrl !== 'string') return null;

  const trimmed = videoUrl.trim();

  // If the videoUrl itself is an image URL
  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(trimmed) || trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId) {
    return `https://vumbnail.com/${vimeoId}.jpg`;
  }

  const dmId = extractDailymotionId(trimmed);
  if (dmId) {
    return `https://www.dailymotion.com/thumbnail/video/${dmId}`;
  }

  return null;
}

export function getEmbedUrl(url?: string): string | null {
  if (!url) return null;

  const ytId = extractYouTubeId(url);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}`;
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}`;
  }

  return null;
}

export function getVideoDomain(url?: string): string {
  if (!url) return 'Video';
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return host;
  } catch {
    return 'Video Link';
  }
}
