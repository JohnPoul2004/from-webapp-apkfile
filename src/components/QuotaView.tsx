import React from 'react';
import {
  BarChart3,
  Video,
  Newspaper,
  Film,
  Award,
  Crown,
  Sparkles,
  Shield,
  Layers,
  HardDrive,
  Gift,
  ChevronRight,
  Gem,
  CheckCircle2,
  Calendar,
  Clock,
  Timer,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { QuotaTierConfig, QuotaTierName } from '../types';
import { QUOTA_TIERS, getQuotaResetDate } from '../data/quotaTiers';

interface QuotaViewProps {
  quotaCounts: {
    videos: number;
    shorts?: number;
    news: number;
    photos: number;
    polls: number;
    quiz: number;
    pages: number;
    events: number;
    shopping?: number;
  };
  quotaSizes: {
    videos: number;
    shorts?: number;
    news: number;
    photos: number;
    polls: number;
    quiz: number;
    pages: number;
    events: number;
    shopping?: number;
  };
  activeTier: QuotaTierName;
  onSelectTier?: (tier: QuotaTierName) => void;
  onNavigateToUpgrade?: () => void;
}

const QUOTA_RESET_STORAGE_KEY = 'dmm_quota_reset_timestamp';

const getInitialResetDate = (): Date => {
  return getQuotaResetDate();
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const QuotaView: React.FC<QuotaViewProps> = ({
  quotaCounts,
  quotaSizes,
  activeTier,
  onNavigateToUpgrade
}) => {
  const currentConfig: QuotaTierConfig = QUOTA_TIERS[activeTier] || QUOTA_TIERS.Free;

  const [resetDate] = React.useState<Date>(getInitialResetDate);
  const [now, setNow] = React.useState<Date>(() => new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeDiff = Math.max(0, resetDate.getTime() - now.getTime());
  const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const secondsLeft = Math.floor((timeDiff % (1000 * 60)) / 1000);

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

  const totalItemsUsed =
    quotaCounts.videos +
    (quotaCounts.shorts || 0) +
    quotaCounts.news +
    quotaCounts.photos +
    quotaCounts.polls +
    quotaCounts.quiz +
    quotaCounts.pages +
    quotaCounts.events +
    (quotaCounts.shopping !== undefined ? quotaCounts.shopping : (quotaCounts as any).products || 0);

  const totalStorageBytesUsed =
    quotaSizes.videos +
    (quotaSizes.shorts || 0) +
    quotaSizes.news +
    quotaSizes.photos +
    quotaSizes.polls +
    quotaSizes.quiz +
    quotaSizes.pages +
    quotaSizes.events +
    (quotaSizes.shopping !== undefined ? quotaSizes.shopping : (quotaSizes as any).products || 0);

  const storagePercent = Math.min(
    100,
    Math.max(
      totalStorageBytesUsed > 0 ? 1 : 0,
      Math.round((totalStorageBytesUsed / currentConfig.totalStorageBytes) * 100)
    )
  );

  const totalItemsPercent = Math.min(
    100,
    Math.round((totalItemsUsed / currentConfig.totalItemsLimit) * 100)
  );

  const categories = [
    {
      id: 'videos',
      label: 'Videos',
      sublabel: 'Embedded & Hosted Video Feeds',
      used: quotaCounts.videos,
      limit: currentConfig.limits.videos,
      bytes: quotaSizes.videos,
      icon: Video,
      accentColor: 'bg-zinc-900',
      badgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-200'
    },
    {
      id: 'shorts',
      label: 'Shorts',
      sublabel: 'Vertical Short-form Videos',
      used: quotaCounts.shorts || 0,
      limit: currentConfig.limits.shorts ?? currentConfig.limits.videos,
      bytes: quotaSizes.shorts || 0,
      icon: Video,
      accentColor: 'bg-rose-600',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'news',
      label: 'Showbiz News',
      sublabel: 'Articles, Headlines & Documentaries',
      used: quotaCounts.news,
      limit: currentConfig.limits.news,
      bytes: quotaSizes.news,
      icon: Newspaper,
      accentColor: 'bg-blue-600',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'photos',
      label: 'Photos & Albums',
      sublabel: 'Embedded Galleries & Covers',
      used: quotaCounts.photos,
      limit: currentConfig.limits.photos,
      bytes: quotaSizes.photos,
      icon: Film,
      accentColor: 'bg-amber-600',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'polls',
      label: 'Polls & Surveys',
      sublabel: 'Audience Voting Modules',
      used: quotaCounts.polls,
      limit: currentConfig.limits.polls,
      bytes: quotaSizes.polls,
      icon: BarChart3,
      accentColor: 'bg-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'quiz',
      label: 'Interactive Quizzes',
      sublabel: 'Trivia & Leaderboard Assessments',
      used: quotaCounts.quiz,
      limit: currentConfig.limits.quiz,
      bytes: quotaSizes.quiz,
      icon: Award,
      accentColor: 'bg-purple-600',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'pages',
      label: 'Pages & Hubs',
      sublabel: 'Location Pages & Media Aggregations',
      used: quotaCounts.pages,
      limit: currentConfig.limits.pages ?? 10,
      bytes: quotaSizes.pages,
      icon: Layers,
      accentColor: 'bg-teal-600',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      id: 'events',
      label: 'Events & Coverage',
      sublabel: 'Scheduled Dates & Live Timelines',
      used: quotaCounts.events,
      limit: currentConfig.limits.events ?? 10,
      bytes: quotaSizes.events,
      icon: Calendar,
      accentColor: 'bg-indigo-600',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'shopping',
      label: 'Shopping & Merch',
      sublabel: 'E-commerce Products & Store Items',
      used: quotaCounts.shopping !== undefined ? quotaCounts.shopping : (quotaCounts as any).products || 0,
      limit: currentConfig.limits.shopping ?? currentConfig.limits.products ?? 10,
      bytes: quotaSizes.shopping !== undefined ? quotaSizes.shopping : (quotaSizes as any).products || 0,
      icon: ShoppingBag,
      accentColor: 'bg-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  ];

  const getTierIcon = (name: QuotaTierName) => {
    switch (name) {
      case 'Free':
        return <Gift className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Bronze':
        return <Shield className="w-3.5 h-3.5 text-amber-800" />;
      case 'Silver':
        return <Shield className="w-3.5 h-3.5 text-slate-500" />;
      case 'Ruby':
        return <Gem className="w-3.5 h-3.5 text-rose-600" />;
      case 'Gold':
        return <Crown className="w-3.5 h-3.5 text-amber-500" />;
      case 'Diamond':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Platinum':
        return <Award className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Sapphire':
        return <Gem className="w-3.5 h-3.5 text-blue-600" />;
      case 'Emerald':
        return <Gem className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Amethyst':
        return <Gem className="w-3.5 h-3.5 text-purple-600" />;
      case 'Pearl':
        return <Award className="w-3.5 h-3.5 text-slate-700" />;
      case 'Obsidian':
        return <Crown className="w-3.5 h-3.5 text-zinc-900" />;
      case 'Titanium':
        return <HardDrive className="w-3.5 h-3.5 text-zinc-300" />;
      default:
        return <Shield className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div id="quota-dashboard-container" className="max-w-4xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Main Quota Dashboard Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        {/* Header with Active Plan and direct Upgrade Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
              <BarChart3 size={22} className="text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                  Resource & Storage Quota
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentConfig.badgeBg} ${currentConfig.badgeText} ${currentConfig.badgeBorder}`}
                >
                  {getTierIcon(currentConfig.name)}
                  <span>{currentConfig.name} Tier</span>
                  <span className="text-[10px] uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold ml-1">
                    Active Plan
                  </span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Real-time capacity tracking for Videos, Showbiz News, Photos, Polls, Quizzes, Pages, Events, and Shopping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>{currentConfig.name} Active</span>
            </span>
            {onNavigateToUpgrade && (
              <button
                type="button"
                id="btn-quota-upgrade-link"
                onClick={onNavigateToUpgrade}
                className="px-3.5 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Upgrade Plan</span>
                <ChevronRight size={13} className="text-zinc-400" />
              </button>
            )}
          </div>
        </div>

        {totalItemsUsed >= currentConfig.totalItemsLimit && (
          <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-rose-900">Quota Limit Exceeded</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  You have reached your tier total item capacity ({currentConfig.totalItemsLimit} items). Upgrade your plan to increase limits or wait for automatic monthly reset on {formattedDate}.
                </p>
              </div>
            </div>
            {onNavigateToUpgrade && (
              <button
                type="button"
                onClick={onNavigateToUpgrade}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
              >
                <Sparkles size={14} className="text-amber-300" />
                <span>Upgrade Plan Now</span>
              </button>
            )}
          </div>
        )}

        {/* Overall Quota Capacity & 1-Month Reset Schedule Meter */}
        <div
          id="quota-capacity-and-schedule-card"
          className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-zinc-50/90 to-white border border-zinc-200/90 shadow-2xs space-y-5"
        >
          {/* Upper Allocation Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">
                  {currentConfig.name} Quota Allocation
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {currentConfig.totalItemsLimit.toLocaleString()} Items Max
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">{currentConfig.tagline}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-sm font-extrabold text-zinc-900 block">
                {totalItemsUsed.toLocaleString()} / {currentConfig.totalItemsLimit.toLocaleString()} Items Used
              </span>
              <span
                className={`text-[11px] font-semibold block mt-0.5 ${
                  totalItemsUsed >= currentConfig.totalItemsLimit ? 'text-rose-600 font-bold' : 'text-emerald-700'
                }`}
              >
                {totalItemsUsed >= currentConfig.totalItemsLimit
                  ? 'Quota Limit Exceeded'
                  : `${Math.max(0, currentConfig.totalItemsLimit - totalItemsUsed).toLocaleString()} remaining items available`}
              </span>
            </div>
          </div>

          {/* Unified Total Items Quota Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-semibold text-zinc-600">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    totalItemsUsed >= currentConfig.totalItemsLimit ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                <span>Overall Quota Utilization</span>
              </span>
              <span className="font-mono font-bold text-zinc-900">{totalItemsPercent}% used</span>
            </div>
            <div className="w-full h-3 bg-zinc-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalItemsUsed >= currentConfig.totalItemsLimit ? 'bg-rose-600' : currentConfig.accentBg
                }`}
                style={{ width: `${totalItemsPercent}%` }}
              />
            </div>
          </div>

          {/* Monthly Quota Reset Date & Time Section */}
          <div className="pt-4 border-t border-zinc-200/70 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-zinc-900">1-Month Quota Reset Schedule</h4>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.2 rounded-md">
                      Recurring 30-Day Cycle
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Category balances replenish automatically back to full capacity every 1 month
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/80 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                <Clock size={13} className="text-blue-600" />
                <span>Auto-Replenish Active</span>
              </div>
            </div>

            {/* 3 Metric Cards for Date, Time, and Live Countdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Reset Date */}
              <div className="p-3.5 rounded-xl bg-white border border-zinc-200/90 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Reset Date</span>
                  <Calendar size={14} className="text-blue-600" />
                </div>
                <p className="text-sm font-extrabold text-zinc-900 tracking-tight">{formattedDate}</p>
                <p className="text-[10px] text-zinc-400">1 month quota cycle</p>
              </div>

              {/* Reset Time */}
              <div className="p-3.5 rounded-xl bg-white border border-zinc-200/90 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Reset Time</span>
                  <Clock size={14} className="text-amber-600" />
                </div>
                <p className="text-sm font-extrabold text-zinc-900 tracking-tight">{formattedTime}</p>
                <p className="text-[10px] text-zinc-400">Scheduled replenishment</p>
              </div>

              {/* Live Countdown */}
              <div className="p-3.5 rounded-xl bg-white border border-zinc-200/90 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Time Remaining</span>
                  <Timer size={14} className="text-emerald-600 animate-pulse" />
                </div>
                <p className="text-sm font-mono font-extrabold text-zinc-900 tracking-tight">
                  {daysLeft}d {hoursLeft}h {minutesLeft}m {secondsLeft}s
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">Automatic reset active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section - Detailed Quota for Videos, News, Photos, Polls, Quiz */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Content Category Limits & Usage ({currentConfig.name} Tier)
            </h3>
            <span className="text-[11px] text-zinc-500">Live Firestore Counts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const percent = Math.min(100, Math.round((cat.used / cat.limit) * 100));
              const remaining = Math.max(0, cat.limit - cat.used);
              const isExceeded = cat.used >= cat.limit;
              const isNearLimit = percent >= 85 || isExceeded;

              return (
                <div
                  key={cat.id}
                  id={`quota-card-${cat.id}`}
                  className={`bg-white border rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-3 transition-colors ${
                    isExceeded
                      ? 'border-rose-300 bg-rose-50/20'
                      : 'border-zinc-200/90 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.badgeClass}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 leading-snug">{cat.label}</h4>
                        <p className="text-[10px] text-zinc-400 leading-tight">{cat.sublabel}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 ${
                        isExceeded
                          ? 'bg-rose-600 text-white font-black'
                          : isNearLimit
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {isExceeded && <AlertCircle size={11} className="shrink-0" />}
                      <span>{isExceeded ? 'Quota Exceeded' : `${percent}%`}</span>
                    </span>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-extrabold text-zinc-900">
                        {cat.used}{' '}
                        <span className="font-normal text-zinc-400">/ {cat.limit.toLocaleString()}</span>
                      </span>
                      <span className={`text-[11px] ${isExceeded ? 'text-rose-600 font-bold' : 'text-zinc-500'}`}>
                        {remaining.toLocaleString()} left
                      </span>
                    </div>

                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isExceeded ? 'bg-rose-600' : cat.accentColor
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-100">
                    <span>Availability:</span>
                    <span
                      className={`font-semibold inline-flex items-center gap-1.5 ${
                        isExceeded
                          ? 'text-rose-600 font-bold'
                          : isNearLimit
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {isExceeded && <AlertCircle size={12} className="shrink-0 text-rose-600" />}
                      <span>{isExceeded ? 'Quota Limit Exceeded' : isNearLimit ? 'Nearing Limit' : `${remaining.toLocaleString()} Available`}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sync Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Active Workspace Plan</p>
              <Shield size={15} className="text-zinc-400" />
            </div>
            <p className="text-lg font-extrabold text-zinc-900 mt-0.5">{currentConfig.name} Tier</p>
            <p className="text-[10px] text-zinc-400">{currentConfig.totalStorageLabel}</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Total Items Limit</p>
              <Layers size={15} className="text-zinc-400" />
            </div>
            <p className="text-lg font-extrabold text-zinc-900 mt-0.5">
              {currentConfig.totalItemsLimit.toLocaleString()} Items
            </p>
            <p className="text-[10px] text-zinc-400">Videos, News, Photos, Polls, Quizzes, Pages, Events, and Shopping</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Live Pipeline</p>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-lg font-extrabold text-emerald-600 mt-0.5 flex items-center gap-1.5">
              <span>Firestore Synced</span>
            </p>
            <p className="text-[10px] text-zinc-400">Real-time persistent state active</p>
          </div>
        </div>
      </div>
    </div>
  );
};
