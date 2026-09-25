import { QuotaTierConfig, QuotaTierName } from '../types';

export const QUOTA_TIERS: Record<QuotaTierName, QuotaTierConfig> = {
  Free: {
    name: 'Free',
    tagline: 'Complimentary Starter Space',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    accentBg: 'bg-emerald-600',
    progressBarColor: 'bg-emerald-600',
    totalStorageBytes: 1 * 1024 * 1024 * 1024,
    totalStorageLabel: '50 Quota Items',
    totalItemsLimit: 50,
    limits: {
      videos: 10,
      news: 15,
      photos: 15,
      polls: 5,
      quiz: 5,
      shorts: 5,
      products: 10,
      shopping: 10,
      pages: 3,
      events: 3,
      tags: 10
    },
    priceWeekly: '₱0',
    priceMonthly: '₱0',
    priceAnnual: '₱0',
    priceYearly: '₱0',
    priceLifetime: '₱0',
    description: 'Complimentary sandbox allocation for personal experimentation and initial media tests.'
  },
  Bronze: {
    name: 'Bronze',
    tagline: 'Standard Starter Quota',
    badgeBg: 'bg-amber-900/10 dark:bg-amber-900/20',
    badgeText: 'text-amber-900 dark:text-amber-800',
    badgeBorder: 'border-amber-700/30',
    accentBg: 'bg-amber-700',
    progressBarColor: 'bg-amber-700',
    totalStorageBytes: 5 * 1024 * 1024 * 1024,
    totalStorageLabel: '150 Quota Items',
    totalItemsLimit: 150,
    limits: {
      videos: 25,
      news: 50,
      photos: 50,
      polls: 15,
      quiz: 10,
      shorts: 10,
      products: 25,
      shopping: 25,
      pages: 10,
      events: 10,
      tags: 15
    },
    priceWeekly: '₱79',
    priceMonthly: '₱249',
    priceAnnual: '₱199',
    priceYearly: '₱2,390',
    priceLifetime: '₱1,499',
    description: 'Essential allocation for lightweight personal media and initial content drafting.'
  },
  Silver: {
    name: 'Silver',
    tagline: 'Growth & Social Creator',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
    accentBg: 'bg-slate-600',
    progressBarColor: 'bg-slate-600',
    totalStorageBytes: 20 * 1024 * 1024 * 1024,
    totalStorageLabel: '400 Quota Items',
    totalItemsLimit: 400,
    limits: {
      videos: 60,
      news: 120,
      photos: 150,
      polls: 40,
      quiz: 30,
      shorts: 25,
      products: 50,
      shopping: 50,
      pages: 25,
      events: 25,
      tags: 20
    },
    priceWeekly: '₱149',
    priceMonthly: '₱499',
    priceAnnual: '₱399',
    priceYearly: '₱4,790',
    priceLifetime: '₱2,999',
    description: 'Expanded capacity for active community publishers and frequent social campaigns.'
  },
  Ruby: {
    name: 'Ruby',
    tagline: 'High-Impact Gemstone Studio',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
    accentBg: 'bg-rose-600',
    progressBarColor: 'bg-rose-600',
    totalStorageBytes: 50 * 1024 * 1024 * 1024,
    totalStorageLabel: '850 Quota Items',
    totalItemsLimit: 850,
    limits: {
      videos: 130,
      news: 260,
      photos: 320,
      polls: 80,
      quiz: 60,
      shorts: 50,
      products: 80,
      shopping: 80,
      pages: 50,
      events: 50,
      tags: 25
    },
    priceWeekly: '₱299',
    priceMonthly: '₱999',
    priceAnnual: '₱799',
    priceYearly: '₱9,590',
    priceLifetime: '₱5,999',
    description: 'Vibrant content suite with high-resolution photo galleries and regular news releases.'
  },
  Gold: {
    name: 'Gold',
    tagline: 'Professional Production Powerhouse',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-950',
    badgeBorder: 'border-amber-400',
    accentBg: 'bg-amber-500',
    progressBarColor: 'bg-amber-500',
    totalStorageBytes: 120 * 1024 * 1024 * 1024,
    totalStorageLabel: '1,800 Quota Items',
    totalItemsLimit: 1800,
    limits: {
      videos: 300,
      news: 550,
      photos: 700,
      polls: 150,
      quiz: 100,
      shorts: 100,
      products: 150,
      shopping: 150,
      pages: 120,
      events: 120,
      tags: 30
    },
    priceWeekly: '₱599',
    priceMonthly: '₱1,999',
    priceAnnual: '₱1,599',
    priceYearly: '₱19,190',
    priceLifetime: '₱11,999',
    description: 'The golden benchmark for digital agencies, video networks, and daily show updates.',
    isPopular: true
  },
  Diamond: {
    name: 'Diamond',
    tagline: 'Brilliant Enterprise Scale',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-900',
    badgeBorder: 'border-cyan-300',
    accentBg: 'bg-cyan-600',
    progressBarColor: 'bg-cyan-600',
    totalStorageBytes: 300 * 1024 * 1024 * 1024,
    totalStorageLabel: '3,500 Quota Items',
    totalItemsLimit: 3500,
    limits: {
      videos: 600,
      news: 1100,
      photos: 1350,
      polls: 270,
      quiz: 180,
      shorts: 200,
      products: 250,
      shopping: 250,
      pages: 250,
      events: 250,
      tags: 40
    },
    priceWeekly: '₱1,049',
    priceMonthly: '₱3,499',
    priceAnnual: '₱2,799',
    priceYearly: '₱33,590',
    priceLifetime: '₱19,999',
    description: 'Crystal-clear multi-channel distribution with rapid sync and enhanced cloud caching.'
  },
  Platinum: {
    name: 'Platinum',
    tagline: 'Prestige Media Syndicate',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-200',
    accentBg: 'bg-indigo-600',
    progressBarColor: 'bg-indigo-600',
    totalStorageBytes: 650 * 1024 * 1024 * 1024,
    totalStorageLabel: '7,000 Quota Items',
    totalItemsLimit: 7000,
    limits: {
      videos: 1200,
      news: 2200,
      photos: 2700,
      polls: 550,
      quiz: 350,
      shorts: 400,
      products: 400,
      shopping: 400,
      pages: 500,
      events: 500,
      tags: 50
    },
    priceWeekly: '₱1,499',
    priceMonthly: '₱4,999',
    priceAnnual: '₱3,999',
    priceYearly: '₱47,990',
    priceLifetime: '₱29,999',
    description: 'Heavyweight studio tier with dedicated throughput for nationwide entertainment brands.'
  },
  Sapphire: {
    name: 'Sapphire',
    tagline: 'Royal Broadcaster & High-Volume Archival',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-300',
    accentBg: 'bg-blue-600',
    progressBarColor: 'bg-blue-600',
    totalStorageBytes: 1200 * 1024 * 1024 * 1024,
    totalStorageLabel: '14,000 Quota Items',
    totalItemsLimit: 14000,
    limits: {
      videos: 2500,
      news: 4500,
      photos: 5500,
      polls: 1000,
      quiz: 500,
      shorts: 800,
      products: 600,
      shopping: 600,
      pages: 1000,
      events: 1000,
      tags: 60
    },
    priceWeekly: '₱2,199',
    priceMonthly: '₱7,499',
    priceAnnual: '₱5,999',
    priceYearly: '₱71,990',
    priceLifetime: '₱44,999',
    description: 'Massive terabyte-level capacity engineered for continuous multimedia syndication.'
  },
  Emerald: {
    name: 'Emerald',
    tagline: 'Verdant Creator Ecosystem',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-950',
    badgeBorder: 'border-emerald-400',
    accentBg: 'bg-emerald-600',
    progressBarColor: 'bg-emerald-600',
    totalStorageBytes: 1500 * 1024 * 1024 * 1024,
    totalStorageLabel: '18,000 Quota Items',
    totalItemsLimit: 18000,
    limits: {
      videos: 3200,
      news: 5800,
      photos: 7000,
      polls: 1300,
      quiz: 650,
      shorts: 1000,
      products: 750,
      shopping: 750,
      pages: 1250,
      events: 1250,
      tags: 75
    },
    priceWeekly: '₱2,699',
    priceMonthly: '₱8,999',
    priceAnnual: '₱6,999',
    priceYearly: '₱83,990',
    priceLifetime: '₱54,999',
    description: 'Lush publishing capacity for thriving digital networks and high-throughput content pipelines.'
  },
  Amethyst: {
    name: 'Amethyst',
    tagline: 'Mystical Media Sanctuary',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-950',
    badgeBorder: 'border-purple-400',
    accentBg: 'bg-purple-600',
    progressBarColor: 'bg-purple-600',
    totalStorageBytes: 2000 * 1024 * 1024 * 1024,
    totalStorageLabel: '22,000 Quota Items',
    totalItemsLimit: 22000,
    limits: {
      videos: 4000,
      news: 7200,
      photos: 8800,
      polls: 1700,
      quiz: 900,
      shorts: 1300,
      products: 1000,
      shopping: 1000,
      pages: 1800,
      events: 1800,
      tags: 90
    },
    priceWeekly: '₱2,999',
    priceMonthly: '₱9,999',
    priceAnnual: '₱7,999',
    priceYearly: '₱95,990',
    priceLifetime: '₱62,999',
    description: 'Deep archival storage and majestic multi-platform reach for visionary creators.'
  },
  Pearl: {
    name: 'Pearl',
    tagline: 'Lustrous Elite Syndicate',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-900',
    badgeBorder: 'border-slate-300',
    accentBg: 'bg-slate-700',
    progressBarColor: 'bg-slate-700',
    totalStorageBytes: 2500 * 1024 * 1024 * 1024,
    totalStorageLabel: '26,000 Quota Items',
    totalItemsLimit: 26000,
    limits: {
      videos: 4800,
      news: 8500,
      photos: 10000,
      polls: 2000,
      quiz: 1050,
      shorts: 1600,
      products: 1300,
      shopping: 1300,
      pages: 2200,
      events: 2200,
      tags: 110
    },
    priceWeekly: '₱3,499',
    priceMonthly: '₱11,499',
    priceAnnual: '₱8,999',
    priceYearly: '₱107,990',
    priceLifetime: '₱69,999',
    description: 'Pearly white-glove infrastructure built for premier broadcasting conglomerates.'
  },
  Obsidian: {
    name: 'Obsidian',
    tagline: 'Ultimate Absolute Domain',
    badgeBg: 'bg-zinc-950',
    badgeText: 'text-zinc-50',
    badgeBorder: 'border-zinc-800',
    accentBg: 'bg-zinc-900',
    progressBarColor: 'bg-zinc-900',
    totalStorageBytes: 5000 * 1024 * 1024 * 1024,
    totalStorageLabel: '50,000 Quota Items',
    totalItemsLimit: 50000,
    limits: {
      videos: 9000,
      news: 16000,
      photos: 20000,
      polls: 4000,
      quiz: 2000,
      shorts: 3000,
      products: 2500,
      shopping: 2500,
      pages: 4500,
      events: 4500,
      tags: 150
    },
    priceWeekly: '₱5,999',
    priceMonthly: '₱19,999',
    priceAnnual: '₱14,999',
    priceYearly: '₱179,990',
    priceLifetime: '₱119,999',
    description: 'Impenetrable, massive-scale sovereign infrastructure with limitless custom capabilities.'
  },
  Titanium: {
    name: 'Titanium',
    tagline: 'Maximum Sovereign Tier',
    badgeBg: 'bg-zinc-900',
    badgeText: 'text-zinc-100',
    badgeBorder: 'border-zinc-700',
    accentBg: 'bg-zinc-800',
    progressBarColor: 'bg-zinc-800',
    totalStorageBytes: 3000 * 1024 * 1024 * 1024,
    totalStorageLabel: '30,000 Quota Items',
    totalItemsLimit: 30000,
    limits: {
      videos: 5500,
      news: 9500,
      photos: 11500,
      polls: 2300,
      quiz: 1200,
      shorts: 1800,
      products: 1500,
      shopping: 1500,
      pages: 2500,
      events: 2500,
      tags: 200
    },
    priceWeekly: '₱3,699',
    priceMonthly: '₱12,499',
    priceAnnual: '₱9,999',
    priceYearly: '₱119,990',
    priceLifetime: '₱74,999',
    description: 'Ultra-resilient unconstrained architecture for global enterprise media networks.'
  }
};

export const QUOTA_TIER_NAMES: QuotaTierName[] = [
  'Free',
  'Bronze',
  'Silver',
  'Ruby',
  'Gold',
  'Diamond',
  'Platinum',
  'Sapphire',
  'Emerald',
  'Amethyst',
  'Pearl',
  'Obsidian',
  'Titanium'
];

export const QUOTA_RESET_STORAGE_KEY = 'dmm_quota_reset_timestamp';

export const getQuotaResetDate = (): Date => {
  try {
    const saved = localStorage.getItem(QUOTA_RESET_STORAGE_KEY);
    if (saved) {
      const timestamp = parseInt(saved, 10);
      if (!isNaN(timestamp) && timestamp > Date.now()) {
        return new Date(timestamp);
      }
    }
  } catch (e) {
    console.error(e);
  }

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  try {
    localStorage.setItem(QUOTA_RESET_STORAGE_KEY, nextMonth.getTime().toString());
  } catch (e) {
    console.error(e);
  }
  return nextMonth;
};

export const isQuotaLimitExceeded = (
  quotaCounts: Partial<{ videos: number; news: number; photos: number; polls: number; quiz: number; shorts: number; products: number; shopping?: number; pages: number; events: number }> | undefined,
  activeTier: QuotaTierName | undefined,
  categoryKey?: 'videos' | 'news' | 'photos' | 'polls' | 'quiz' | 'shorts' | 'products' | 'shopping' | 'pages' | 'events'
): boolean => {
  const tierName = activeTier || 'Free';
  const currentConfig = QUOTA_TIERS[tierName] || QUOTA_TIERS.Free;
  const counts = quotaCounts || { videos: 0, news: 0, photos: 0, polls: 0, quiz: 0, shorts: 0, products: 0, shopping: 0, pages: 0, events: 0 };

  const shoppingCount = counts.shopping !== undefined ? counts.shopping : (counts.products || 0);

  const totalItemsUsed =
    (counts.videos || 0) +
    (counts.news || 0) +
    (counts.photos || 0) +
    (counts.polls || 0) +
    (counts.quiz || 0) +
    (counts.shorts || 0) +
    shoppingCount +
    (counts.pages || 0) +
    (counts.events || 0);

  if (totalItemsUsed >= currentConfig.totalItemsLimit) {
    return true;
  }

  if (categoryKey) {
    if (categoryKey === 'shopping' || categoryKey === 'products') {
      const shoppingLimit = currentConfig.limits?.shopping ?? currentConfig.limits?.products;
      if (shoppingLimit !== undefined && shoppingCount >= shoppingLimit) {
        return true;
      }
    } else if (currentConfig.limits && currentConfig.limits[categoryKey] !== undefined) {
      const categoryUsed = counts[categoryKey] || 0;
      if (categoryUsed >= currentConfig.limits[categoryKey]) {
        return true;
      }
    }
  }

  return false;
};
