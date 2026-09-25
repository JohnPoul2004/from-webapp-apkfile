/**
 * Helper utility for extracting video IDs, embed URLs, and thumbnails
 * from YouTube, Vimeo, and direct video sources.
 */

export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export function extractVimeoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/);
  return match ? match[1] : null;
}

export function getVideoThumbnail(videoUrl?: string, coverPhoto?: string): string | null {
  if (coverPhoto && coverPhoto.trim().length > 0) {
    return coverPhoto.trim();
  }

  const ytId = extractYouTubeId(videoUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
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
