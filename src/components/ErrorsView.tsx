import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  Server,
  User,
  Users,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  ArrowLeft,
  Terminal,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Code,
  Globe,
  SlidersHorizontal,
  Bookmark,
  ArrowUpRight
} from 'lucide-react';
import { HTTP_ERROR_CODES, HttpErrorInfo } from '../data/errorCodes';
import { SoloParentIcon, ParentsIcon } from './ErrorIcons';

interface ErrorsViewProps {
  onNavigateHome?: () => void;
  onActionNotice?: (msg: string) => void;
}

export const ErrorsView: React.FC<ErrorsViewProps> = ({ onNavigateHome, onActionNotice }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | '4xx' | '5xx'>('all');
  const [selectedErrorCode, setSelectedErrorCode] = useState<HttpErrorInfo | null>(null);
  const [previewErrorMockup, setPreviewErrorMockup] = useState<HttpErrorInfo | null>(null);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  // Filtered error codes list
  const filteredList = useMemo(() => {
    return HTTP_ERROR_CODES.filter((err) => {
      // Filter by category
      if (selectedFilter === '4xx' && err.category !== '4xx Client Error') return false;
      if (selectedFilter === '5xx' && err.category !== '5xx Server Error') return false;

      // Filter by search query
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        err.code.toString().includes(query) ||
        err.name.toLowerCase().includes(query) ||
        err.summary.toLowerCase().includes(query) ||
        err.description.toLowerCase().includes(query) ||
        err.technicalDetails.toLowerCase().includes(query)
      );
    });
  }, [selectedFilter, searchQuery]);

  const count4xx = HTTP_ERROR_CODES.filter((e) => e.category === '4xx Client Error').length;
  const count5xx = HTTP_ERROR_CODES.filter((e) => e.category === '5xx Server Error').length;

  const handleCopyCode = (err: HttpErrorInfo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(`HTTP ${err.code} ${err.name}`);
    setCopiedCode(err.code);
    if (onActionNotice) {
      onActionNotice(`Copied "HTTP ${err.code} ${err.name}" to clipboard!`);
    }
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // If user is currently previewing a full error page simulation
  if (previewErrorMockup) {
    const is4xx = previewErrorMockup.category === '4xx Client Error';

    return (
      <div className="min-h-[85vh] bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden transition-all">
        {/* Top return toolbar */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 z-10">
          <button
            type="button"
            onClick={() => setPreviewErrorMockup(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <ArrowLeft size={16} />
            <span>Back to Errors Directory</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                is4xx
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  : 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
              }`}
            >
              {is4xx ? (
                <>
                  <SoloParentIcon size={14} className="text-amber-600 dark:text-amber-400" />
                  <span>4xx Client Error • Solo Parent</span>
                </>
              ) : (
                <>
                  <ParentsIcon size={14} className="text-rose-600 dark:text-rose-400" />
                  <span>5xx Server Error • Parents</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Hero Error Mockup Body */}
        <div className="max-w-2xl mx-auto my-auto py-10 text-center flex flex-col items-center z-10">
          {/* Big Icon Container */}
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center mb-6 shadow-xl transition-transform hover:scale-105 ${
              is4xx
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 ring-8 ring-amber-500/10'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 ring-8 ring-rose-500/10'
            }`}
          >
            {is4xx ? <SoloParentIcon size={56} /> : <ParentsIcon size={56} />}
          </div>

          {/* Status Code Number */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-black tracking-widest uppercase mb-3 shadow-xs">
            <span>HTTP Status Code {previewErrorMockup.code}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">
            {previewErrorMockup.name}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-lg mb-8 leading-relaxed">
            {previewErrorMockup.description}
          </p>

          {/* Troubleshooting card */}
          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 text-left mb-8 shadow-xs">
            <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Info size={14} className={is4xx ? 'text-amber-500' : 'text-rose-500'} />
              <span>Recommended Solutions & Checks</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 list-disc list-inside">
              {previewErrorMockup.suggestedSolutions.map((sol, idx) => (
                <li key={idx} className="leading-normal">
                  {sol}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleCopyCode(previewErrorMockup)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
            >
              {copiedCode === previewErrorMockup.code ? (
                <>
                  <Check size={14} className="text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy HTTP {previewErrorMockup.code}</span>
                </>
              )}
            </button>

            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 text-xs font-black hover:bg-zinc-800 dark:hover:bg-white transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <span>Return to Dashboard</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Footer Technical Metadata */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500 flex flex-wrap items-center justify-between gap-3 z-10">
          <span>{previewErrorMockup.technicalDetails}</span>
          <span>DMM Network Error Handling Framework</span>
        </div>
      </div>
    );
  }

  return (
    <div id="errors-page-container" className="space-y-6 max-w-7xl mx-auto py-2 sm:py-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-700">
              <ShieldAlert size={14} className="text-amber-500" />
              <span>HTTP Status Code Reference & Error Pages</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              Errors Page Directory
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Complete catalog of standard HTTP status error pages. 
              Client-side <strong>4xx errors</strong> are badged with the <strong>Solo Parent Icon</strong>, 
              and server-side <strong>5xx errors</strong> are badged with the <strong>Parents Icon</strong>.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* 4xx Badge with Solo Parent Icon */}
            <div className="flex-1 sm:flex-none p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/80 flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <SoloParentIcon size={22} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  4xx Client Errors
                </span>
                <p className="text-lg font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                  {count4xx} Errors
                </p>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                  Solo Parent Icon
                </span>
              </div>
            </div>

            {/* 5xx Badge with Parents Icon */}
            <div className="flex-1 sm:flex-none p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/90 dark:border-rose-800/80 flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                <ParentsIcon size={22} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                  5xx Server Errors
                </span>
                <p className="text-lg font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                  {count5xx} Errors
                </p>
                <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">
                  Parents Icon
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code (e.g. 404, 500) or name..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs (All, 4xx Solo Parent, 5xx Parents) */}
        <div className="inline-flex p-1 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-2xl text-xs font-bold shadow-2xs">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs font-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All Errors ({HTTP_ERROR_CODES.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('4xx')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedFilter === '4xx'
                ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs font-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <SoloParentIcon size={14} />
            <span>4xx Client ({count4xx})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('5xx')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedFilter === '5xx'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs font-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400'
            }`}
          >
            <ParentsIcon size={14} />
            <span>5xx Server ({count5xx})</span>
          </button>
        </div>
      </div>

      {/* Error Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <Search size={32} className="text-zinc-400 mb-2" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No error pages found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
            No HTTP error codes matching "{searchQuery}". Try searching for standard codes like 404, 403, 500, or 502.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-all cursor-pointer"
          >
            Reset Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredList.map((err) => {
            const is4xx = err.category === '4xx Client Error';

            return (
              <div
                key={err.code}
                id={`error-card-${err.code}`}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 relative group"
              >
                <div>
                  {/* Top row with Status Code, Category Badge, and Solo Parent / Parents Icon */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xl font-black tracking-tight ${
                          is4xx ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {err.code}
                      </span>
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                        {err.name}
                      </span>
                    </div>

                    {/* Icon Badge */}
                    <div
                      title={is4xx ? '4xx Client Error • Solo Parent Icon' : '5xx Server Error • Parents Icon'}
                      className={`p-2 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                        is4xx
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80'
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/80'
                      }`}
                    >
                      {is4xx ? <SoloParentIcon size={18} /> : <ParentsIcon size={18} />}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3 line-clamp-2">
                    {err.summary}
                  </p>

                  {/* RFC technical spec */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mb-4 w-full truncate">
                    <Code size={11} className="shrink-0 text-zinc-400" />
                    <span className="truncate">{err.technicalDetails}</span>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(err, e)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Copy Status Code"
                    >
                      {copiedCode === err.code ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedErrorCode(err)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Info size={14} />
                    </button>
                  </div>

                  {/* Live Simulation Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewErrorMockup(err)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
                  >
                    <span>View Error Page</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Technical Details Diagnostics Modal */}
      {selectedErrorCode && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4"
          onClick={() => setSelectedErrorCode(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                    selectedErrorCode.category === '4xx Client Error'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {selectedErrorCode.category === '4xx Client Error' ? (
                    <SoloParentIcon size={26} />
                  ) : (
                    <ParentsIcon size={26} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                      HTTP {selectedErrorCode.code}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                      {selectedErrorCode.name}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {selectedErrorCode.category} • {selectedErrorCode.category === '4xx Client Error' ? 'Solo Parent Icon' : 'Parents Icon'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedErrorCode(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
              {/* Description */}
              <div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
                  Specification Description
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {selectedErrorCode.description}
                </p>
              </div>

              {/* Possible Causes */}
              <div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">
                  Common Triggers & Causes
                </h4>
                <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300 list-disc list-inside">
                  {selectedErrorCode.possibleCauses.map((cause, idx) => (
                    <li key={idx}>{cause}</li>
                  ))}
                </ul>
              </div>

              {/* Suggested Solutions */}
              <div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">
                  Recommended Resolutions
                </h4>
                <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300 list-disc list-inside">
                  {selectedErrorCode.suggestedSolutions.map((sol, idx) => (
                    <li key={idx}>{sol}</li>
                  ))}
                </ul>
              </div>

              {/* Technical Spec Reference */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  RFC Standard Specification:
                </span>
                <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  {selectedErrorCode.technicalDetails}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/40">
              <button
                type="button"
                onClick={() => handleCopyCode(selectedErrorCode)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-xs"
              >
                {copiedCode === selectedErrorCode.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>Copy Code Info</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviewErrorMockup(selectedErrorCode);
                  setSelectedErrorCode(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white transition-all cursor-pointer shadow-xs"
              >
                <span>Preview Error Page</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
