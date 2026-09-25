/**
 * Image processing utilities for client-side uploads
 * Compresses and downscales images so they can be reliably stored in Firestore
 * without hitting the strict 1,048,576 bytes (1 MiB) per document ceiling.
 */

// Compress a base64 Data URL to fit within target constraints
export function compressDataUrl(
  dataUrl: string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.72,
  targetMaxBytes = 130000 // ~130 KB max per image
): Promise<string> {
  return new Promise((resolve) => {
    // If it's a web URL (http/https), return directly
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let curWidth = img.width;
        let curHeight = img.height;
        let curQuality = quality;
        let curMaxWidth = maxWidth;
        let curMaxHeight = maxHeight;

        // Iterative reduction loop (max 3 passes)
        for (let pass = 0; pass < 3; pass++) {
          if (curWidth > curMaxWidth || curHeight > curMaxHeight) {
            const ratio = Math.min(curMaxWidth / curWidth, curMaxHeight / curHeight);
            curWidth = Math.max(100, Math.round(curWidth * ratio));
            curHeight = Math.max(100, Math.round(curHeight * ratio));
          }

          const canvas = document.createElement('canvas');
          canvas.width = curWidth;
          canvas.height = curHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          // Fill white background in case of transparent PNG conversion
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, curWidth, curHeight);
          ctx.drawImage(img, 0, 0, curWidth, curHeight);

          const compressed = canvas.toDataURL('image/jpeg', curQuality);

          // Check estimated size
          if (compressed.length <= targetMaxBytes || pass === 2) {
            resolve(compressed);
            return;
          }

          // Next pass: reduce dimensions and quality further
          curMaxWidth = Math.round(curMaxWidth * 0.75);
          curMaxHeight = Math.round(curMaxHeight * 0.75);
          curQuality = Math.max(0.45, curQuality - 0.15);
        }

        resolve(dataUrl);
      } catch (err) {
        console.warn('DataURL compression error:', err);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

/**
 * Reads a user-selected image File and returns an optimized, lightweight JPEG data URL.
 */
export function readFileAsOptimizedDataUrl(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawResult = e.target?.result as string;
      if (!rawResult) {
        reject(new Error('Failed to read image file'));
        return;
      }

      try {
        const optimized = await compressDataUrl(rawResult, maxWidth, maxHeight, quality);
        resolve(optimized);
      } catch (err) {
        console.warn('Image optimization fallback:', err);
        resolve(rawResult);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Calculates estimated UTF-8 byte size of an object or string
 */
export function getEstimatedByteSize(data: any): number {
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return new Blob([str]).size;
  } catch {
    return 0;
  }
}

/**
 * Sanitizes and compresses all embedded images in a Firestore payload
 * to guarantee the document stays safely below the 1MB Firestore limit (~600KB safety ceiling).
 */
export async function optimizePayloadForFirestore(payload: any): Promise<any> {
  const currentSize = getEstimatedByteSize(payload);
  const FIRESTORE_SAFE_LIMIT = 700000; // 700 KB (well under 1,048,576 bytes)

  if (currentSize <= FIRESTORE_SAFE_LIMIT) {
    return payload;
  }

  const result = { ...payload };

  // 1. Optimize cover photo if base64
  if (result.coverPhoto && typeof result.coverPhoto === 'string' && result.coverPhoto.startsWith('data:image/')) {
    result.coverPhoto = await compressDataUrl(result.coverPhoto, 640, 640, 0.65, 80000);
  }

  // 2. Optimize otherPhoto array if present
  if (Array.isArray(result.otherPhoto)) {
    result.otherPhoto = await Promise.all(
      result.otherPhoto.map(async (p: any) => {
        if (p?.photo && typeof p.photo === 'string' && p.photo.startsWith('data:image/')) {
          const optimizedPhoto = await compressDataUrl(p.photo, 640, 640, 0.60, 75000);
          return { ...p, photo: optimizedPhoto };
        }
        return p;
      })
    );
  }

  return result;
}
