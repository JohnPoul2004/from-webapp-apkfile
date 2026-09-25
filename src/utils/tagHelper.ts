export interface TagStyle {
  bg: string;
  text: string;
  border: string;
  darkBg: string;
  darkText: string;
  darkBorder: string;
}

const PRESET_TAG_COLORS: Record<string, TagStyle> = {
  trending: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    darkBg: 'dark:bg-rose-950/30',
    darkText: 'dark:text-rose-300',
    darkBorder: 'dark:border-rose-800'
  },
  exclusive: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    darkBg: 'dark:bg-purple-950/30',
    darkText: 'dark:text-purple-300',
    darkBorder: 'dark:border-purple-800'
  },
  highlight: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    darkBg: 'dark:bg-amber-950/30',
    darkText: 'dark:text-amber-300',
    darkBorder: 'dark:border-amber-800'
  },
  featured: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    darkBg: 'dark:bg-emerald-950/30',
    darkText: 'dark:text-emerald-300',
    darkBorder: 'dark:border-emerald-800'
  },
  breaking: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    darkBg: 'dark:bg-red-950/30',
    darkText: 'dark:text-red-300',
    darkBorder: 'dark:border-red-800'
  },
  behindthescenes: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    darkBg: 'dark:bg-sky-950/30',
    darkText: 'dark:text-sky-300',
    darkBorder: 'dark:border-sky-800'
  },
  official: {
    bg: 'bg-zinc-100',
    text: 'text-zinc-800',
    border: 'border-zinc-300',
    darkBg: 'dark:bg-zinc-800',
    darkText: 'dark:text-zinc-200',
    darkBorder: 'dark:border-zinc-700'
  },
  tutorial: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    darkBg: 'dark:bg-teal-950/30',
    darkText: 'dark:text-teal-300',
    darkBorder: 'dark:border-teal-800'
  },
  archived: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    darkBg: 'dark:bg-slate-800',
    darkText: 'dark:text-slate-300',
    darkBorder: 'dark:border-slate-700'
  }
};

const COLOR_PALETTE: TagStyle[] = [
  {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    darkBg: 'dark:bg-indigo-950/30',
    darkText: 'dark:text-indigo-300',
    darkBorder: 'dark:border-indigo-800'
  },
  {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    darkBg: 'dark:bg-cyan-950/30',
    darkText: 'dark:text-cyan-300',
    darkBorder: 'dark:border-cyan-800'
  },
  {
    bg: 'bg-fuchsia-50',
    text: 'text-fuchsia-700',
    border: 'border-fuchsia-200',
    darkBg: 'dark:bg-fuchsia-950/30',
    darkText: 'dark:text-fuchsia-300',
    darkBorder: 'dark:border-fuchsia-800'
  },
  {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    darkBg: 'dark:bg-violet-950/30',
    darkText: 'dark:text-violet-300',
    darkBorder: 'dark:border-violet-800'
  },
  {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    darkBg: 'dark:bg-orange-950/30',
    darkText: 'dark:text-orange-300',
    darkBorder: 'dark:border-orange-800'
  },
  {
    bg: 'bg-lime-50',
    text: 'text-lime-800',
    border: 'border-lime-200',
    darkBg: 'dark:bg-lime-950/30',
    darkText: 'dark:text-lime-300',
    darkBorder: 'dark:border-lime-800'
  }
];

export const SUGGESTED_TAG_PRESETS = [
  'Trending',
  'Exclusive',
  'Highlight',
  'Featured',
  'Breaking',
  'BehindTheScenes',
  'Interview',
  'Official',
  'Tutorial',
  'Archived',
  'Review',
  'Live'
];

/**
 * Assigns a reliable, readable color style for any tag name
 */
export const getTagStyle = (tag: string): TagStyle => {
  const normalized = (tag || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (PRESET_TAG_COLORS[normalized]) {
    return PRESET_TAG_COLORS[normalized];
  }

  // Hash-based palette selection
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

/**
 * Cleans up and standardizes a tag string
 */
export const cleanTagName = (tag: string): string => {
  let cleaned = (tag || '').trim();
  if (cleaned.startsWith('#')) {
    cleaned = cleaned.slice(1).trim();
  }
  return cleaned;
};
