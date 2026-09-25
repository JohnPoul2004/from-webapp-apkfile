import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Download,
  RefreshCw,
  PlusCircle,
  Pencil,
  RotateCcw,
  Settings,
  ShieldCheck,
  LogIn,
  Eye,
  Video,
  Newspaper,
  Image as ImageIcon,
  Vote,
  HelpCircle,
  Layers,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  FileJson,
  FileSpreadsheet,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  ActivityLogEntry,
  ActivityAction,
  ActivityCategory,
  fetchActivityLogs,
  clearAllActivityLogs,
  exportActivityLogsFile
} from '../utils/activityLogger';
import { getRelativeTime } from '../utils/dateHelper';

interface ActivityLogViewProps {
  userId?: string;
  userEmail?: string;
  onNavigateToSection?: (section: string) => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  userId,
  userEmail,
  onNavigateToSection
}) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [selectedLogDetail, setSelectedLogDetail] = useState<ActivityLogEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const loadLogs = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchActivityLogs(userId);
      setLogs(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [userId]);

  // Listen for realtime activity log events dispatched across the app
  useEffect(() => {
    const handleActivityLogged = () => {
      if (userId) {
        fetchActivityLogs(userId).then((data) => setLogs(data));
      }
    };
    window.addEventListener('dmm:activity-logged', handleActivityLogged);
    return () => window.removeEventListener('dmm:activity-logged', handleActivityLogged);
  }, [userId]);

  const handleClearAll = async () => {
    if (!userId) return;
    try {
      await clearAllActivityLogs(userId);
      setLogs([]);
      setShowClearConfirm(false);
      setNoticeMessage('Activity logs cleared successfully.');
      setTimeout(() => setNoticeMessage(null), 3000);
    } catch {
      setNoticeMessage('Failed to clear logs.');
      setTimeout(() => setNoticeMessage(null), 3000);
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (filteredLogs.length === 0) {
      setNoticeMessage('No logs matching current filters to export.');
      setTimeout(() => setNoticeMessage(null), 3000);
      return;
    }
    exportActivityLogsFile(filteredLogs, format);
    setNoticeMessage(`Exported ${filteredLogs.length} audit logs as ${format.toUpperCase()}.`);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Filter logs based on search, action, category, and date
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (log.title || '').toLowerCase().includes(q);
        const matchDetails = (log.details || '').toLowerCase().includes(q);
        const matchSection = (log.section || '').toLowerCase().includes(q);
        const matchCategory = (log.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDetails && !matchSection && !matchCategory) {
          return false;
        }
      }

      // Action Filter
      if (selectedAction !== 'ALL' && log.action !== selectedAction) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) {
        return false;
      }

      // Time Filter
      if (timeFilter !== 'ALL') {
        const logTime = new Date(log.timestamp).getTime();
        const now = Date.now();
        if (timeFilter === 'TODAY') {
          const oneDay = 24 * 60 * 60 * 1000;
          if (now - logTime > oneDay) return false;
        } else if (timeFilter === 'WEEK') {
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (now - logTime > sevenDays) return false;
        } else if (timeFilter === 'MONTH') {
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          if (now - logTime > thirtyDays) return false;
        }
      }

      return true;
    });
  }, [logs, searchQuery, selectedAction, selectedCategory, timeFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = logs.length;
    const creates = logs.filter((l) => l.action === 'CREATE').length;
    const updates = logs.filter((l) => l.action === 'UPDATE' || l.action === 'STATUS_CHANGE').length;
    const deletes = logs.filter((l) => l.action === 'DELETE').length;
    const settings = logs.filter((l) => l.action === 'SETTINGS' || l.action === 'SECURITY' || l.action === 'AUTH').length;
    return { total, creates, updates, deletes, settings };
  }, [logs]);

  const getActionBadge = (action: ActivityAction) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <PlusCircle size={11} />
            CREATE
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Pencil size={11} />
            UPDATE
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <Trash2 size={11} />
            DELETE
          </span>
        );
      case 'RESTORE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <RotateCcw size={11} />
            RESTORE
          </span>
        );
      case 'SETTINGS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Settings size={11} />
            SETTINGS
          </span>
        );
      case 'SECURITY':
      case 'AUTH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck size={11} />
            {action}
          </span>
        );
      case 'STATUS_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Eye size={11} />
            STATUS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            {action}
          </span>
        );
    }
  };

  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'Videos':
        return <Video size={13} className="text-red-500" />;
      case 'News':
        return <Newspaper size={13} className="text-amber-500" />;
      case 'Photos':
        return <ImageIcon size={13} className="text-emerald-500" />;
      case 'Polls':
        return <Vote size={13} className="text-purple-500" />;
      case 'Quizzes':
        return <HelpCircle size={13} className="text-blue-500" />;
      case 'Pages':
        return <Layers size={13} className="text-indigo-500" />;
      case 'Events':
        return <Calendar size={13} className="text-orange-500" />;
      case 'Profile':
      case 'Auth':
        return <User size={13} className="text-cyan-500" />;
      case 'Security':
        return <ShieldCheck size={13} className="text-violet-500" />;
      default:
        return <Info size={13} className="text-zinc-500" />;
    }
  };

  const formatExactDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-850 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <History size={13} />
              <span>Audit Trail & Activity Log</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Activity & Audit History
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              Track real-time actions, item modifications, creations, deletions, and security changes across all channels to maintain full auditability and confidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              id="refresh-activity-btn"
              onClick={loadLogs}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 active:scale-98 transition-all border border-white/15 text-white cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh logs"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <div className="relative inline-block">
              <button
                type="button"
                id="export-json-btn"
                onClick={() => handleExport('json')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:scale-98 transition-all text-white cursor-pointer shadow-xs mr-2"
                title="Export as JSON"
              >
                <FileJson size={13} />
                <span>JSON</span>
              </button>
              <button
                type="button"
                id="export-csv-btn"
                onClick={() => handleExport('csv')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 active:scale-98 transition-all text-white cursor-pointer shadow-xs border border-zinc-700"
                title="Export as CSV"
              >
                <FileSpreadsheet size={13} />
                <span>CSV</span>
              </button>
            </div>

            {logs.length > 0 && (
              <button
                type="button"
                id="clear-logs-btn"
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 active:scale-98 transition-all cursor-pointer shadow-xs"
                title="Clear all activity history"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <p className="text-[11px] font-semibold text-zinc-400">Total Events</p>
            <p className="text-xl font-bold text-white mt-0.5">{stats.total}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <p className="text-[11px] font-semibold text-emerald-400">Creations</p>
            <p className="text-xl font-bold text-white mt-0.5">{stats.creates}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <p className="text-[11px] font-semibold text-blue-400">Updates</p>
            <p className="text-xl font-bold text-white mt-0.5">{stats.updates}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <p className="text-[11px] font-semibold text-rose-400">Deletions</p>
            <p className="text-xl font-bold text-white mt-0.5">{stats.deletes}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5 col-span-2 sm:col-span-1">
            <p className="text-[11px] font-semibold text-purple-400">Settings / Auth</p>
            <p className="text-xl font-bold text-white mt-0.5">{stats.settings}</p>
          </div>
        </div>
      </div>

      {/* Notice Message Toast */}
      {noticeMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setNoticeMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-100 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Controls: Search & Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              id="activity-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activity by title, section, or action..."
              className="w-full pl-9 pr-8 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0 overflow-x-auto">
            {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  timeFilter === tf
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {tf === 'ALL' ? 'All Time' : tf === 'TODAY' ? 'Today' : tf === 'WEEK' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Action & Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
            <Filter size={12} />
            <span>Action:</span>
          </div>

          {[
            { id: 'ALL', label: 'All Actions' },
            { id: 'CREATE', label: 'Create' },
            { id: 'UPDATE', label: 'Update' },
            { id: 'DELETE', label: 'Delete' },
            { id: 'SETTINGS', label: 'Settings' },
            { id: 'SECURITY', label: 'Security' },
            { id: 'STATUS_CHANGE', label: 'Status' }
          ].map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => setSelectedAction(act.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedAction === act.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {act.label}
            </button>
          ))}

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1 hidden sm:block" />

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Videos">Videos</option>
            <option value="News">News</option>
            <option value="Photos">Photos</option>
            <option value="Polls">Polls</option>
            <option value="Quizzes">Quizzes</option>
            <option value="Pages">Pages</option>
            <option value="Events">Events</option>
            <option value="Profile">Profile</option>
            <option value="Security">Security</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-xs">
            <RefreshCw size={24} className="animate-spin text-zinc-400 mx-auto mb-3" />
            <p className="text-xs font-semibold text-zinc-500">Loading audit history...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-xs">
            <History size={36} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No activity records found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
              {searchQuery || selectedAction !== 'ALL' || selectedCategory !== 'ALL' || timeFilter !== 'ALL'
                ? 'No activities match the selected filter criteria. Try clearing filters or resetting the search query.'
                : 'Your recent actions such as creating content, updating settings, and deleting items will appear here in real-time.'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800/60 shadow-xs overflow-hidden">
            {filteredLogs.map((log) => {
              const relTime = getRelativeTime(log.timestamp);
              const exactTime = formatExactDate(log.timestamp);

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Category Icon Badge */}
                    <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 shrink-0 mt-0.5">
                      {getCategoryIcon(log.category)}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Top Badges Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {getActionBadge(log.action)}

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {log.category}
                        </span>

                        {log.section && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-200/70 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                            {log.section}
                          </span>
                        )}

                        <span
                          className="text-[11px] text-zinc-400 font-medium ml-auto shrink-0"
                          title={exactTime}
                        >
                          {relTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                        {log.title}
                      </h4>

                      {/* Details Snippet */}
                      {log.details && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                          {log.details}
                        </p>
                      )}

                      {/* User Attribution */}
                      <div className="flex items-center gap-3 pt-1 text-[10px] text-zinc-400">
                        <span>User: {log.userEmail || userEmail || 'Current User'}</span>
                        <span>&bull;</span>
                        <span className="font-mono">ID: {log.id.slice(0, 16)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action: Inspect Detail */}
                  <button
                    type="button"
                    onClick={() => setSelectedLogDetail(log)}
                    className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer shrink-0 mt-1"
                    title="View full audit metadata"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit Detail Modal */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <History size={18} className="text-indigo-600" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Audit Event Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl space-y-2 border border-zinc-200/80 dark:border-zinc-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Action:</span>
                  {getActionBadge(selectedLogDetail.action)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Category:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedLogDetail.category}</span>
                </div>
                {selectedLogDetail.section && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-medium">Dashboard Section:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedLogDetail.section}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Timestamp:</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {formatExactDate(selectedLogDetail.timestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Event ID:</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">{selectedLogDetail.id}</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Event Summary:</p>
                <p className="text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                  {selectedLogDetail.title}
                </p>
              </div>

              {selectedLogDetail.details && (
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Additional Details:</p>
                  <p className="text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 whitespace-pre-wrap">
                    {selectedLogDetail.details}
                  </p>
                </div>
              )}

              {selectedLogDetail.metadata && (
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Raw Payload Metadata:</p>
                  <pre className="bg-zinc-950 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLogDetail.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Clear Activity History?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                This will permanently delete all logged audit events from your dashboard history. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-clear-logs-btn"
                onClick={handleClearAll}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogView;
