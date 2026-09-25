import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Check, Trash2, History, User, Sparkles, AlertCircle, Plus } from 'lucide-react';
import { readFileAsOptimizedDataUrl } from '../utils/imageHelper';

export interface ProfilePictureHistoryItem {
  id: string;
  url: string;
  uploadedAt: string | number;
  label?: string;
}

interface ProfilePictureHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoURL: string;
  history: ProfilePictureHistoryItem[];
  onSelectPhoto: (photoURL: string) => void;
  onDeletePhoto: (id: string) => void;
  onClearHistory: () => void;
  onUploadNewPhoto: (photoURL: string) => void;
  isPhotoLocked?: boolean;
  nextEditDateFormatted?: string;
  daysRemaining?: number;
  onSimulateYearPassed?: () => void;
}

export const ProfilePictureHistoryModal: React.FC<ProfilePictureHistoryModalProps> = ({
  isOpen,
  onClose,
  currentPhotoURL,
  history,
  onSelectPhoto,
  onDeletePhoto,
  onClearHistory,
  onUploadNewPhoto,
  isPhotoLocked = false,
  nextEditDateFormatted,
  daysRemaining = 365,
  onSimulateYearPassed
}) => {
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isPhotoLocked) {
      setErrorMsg(`Profile pictures can only be edited once every 1 year. Next allowed update: ${nextEditDateFormatted || 'in 365 days'} (${daysRemaining} days remaining).`);
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const optimized = await readFileAsOptimizedDataUrl(file, 400, 400, 0.7);
      onUploadNewPhoto(optimized);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyPhoto = (url: string) => {
    if (isPhotoLocked) {
      setErrorMsg(`Profile picture changes are locked under the 1-Year Edit Policy until ${nextEditDateFormatted || 'next year'} (${daysRemaining} days left).`);
      return;
    }
    setErrorMsg(null);
    onSelectPhoto(url);
  };

  const formatDate = (timestamp: string | number) => {
    if (!timestamp) return 'Previously used';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Previously used';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200/50 dark:border-indigo-900/50">
                <History size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Profile Picture History</span>
                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-xs font-semibold">
                    {history.length} saved
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Switch back to previously uploaded avatars or upload a new picture
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1-Year Lock Policy Banner */}
            {isPhotoLocked && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between gap-2 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 rounded-lg">🔒</span>
                    <span>1-Year Edit Lock Active</span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-200/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 rounded-full text-[10px] font-extrabold">
                    {daysRemaining} days left
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  Profile pictures can only be changed once every 365 days. Next allowed edit date: <strong>{nextEditDateFormatted || 'next year'}</strong>.
                </p>
                {onSimulateYearPassed && (
                  <button
                    type="button"
                    onClick={() => {
                      onSimulateYearPassed();
                      setErrorMsg(null);
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    Bypass 1-Year Lock (Dev Test Mode)
                  </button>
                )}
              </div>
            )}

            {/* Top Toolbar: Upload New Picture Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-900 dark:text-indigo-300">
                <Sparkles size={16} className="text-indigo-500 shrink-0" />
                <span>Upload a new image to automatically save it to your picture history</span>
              </div>

              <label className={`px-3.5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 min-h-[36px] ${
                isPhotoLocked
                  ? 'bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed opacity-80'
                  : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
              }`}>
                <Plus size={14} />
                <span>{isUploading ? 'Uploading...' : 'Upload New Picture'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading || isPhotoLocked}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* History Grid */}
            {history.length === 0 ? (
              <div className="p-10 text-center space-y-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="w-14 h-14 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <User size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No profile picture history yet</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                    When you upload profile pictures, your previous photos will appear here so you can easily switch between them anytime.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {history.map((item) => {
                  const isActive = currentPhotoURL === item.url;
                  return (
                    <div
                      key={item.id}
                      className={`relative group rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col bg-zinc-50 dark:bg-zinc-800/50 ${
                        isActive
                          ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-600/30 dark:ring-indigo-500/30 shadow-md'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs hover:shadow-md'
                      }`}
                    >
                      {/* Image Thumbnail Container */}
                      <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
                        <img
                          src={item.url}
                          alt="Profile history item"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onClick={() => setSelectedPreview(item.url)}
                        />

                        {/* Active Badge */}
                        {isActive && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                            <Check size={11} />
                            <span>Active</span>
                          </div>
                        )}

                        {/* Hover Overlay with Action Buttons */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2 backdrop-blur-[2px]">
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => handleApplyPhoto(item.url)}
                              className={`px-2.5 py-1.5 text-white rounded-xl text-[11px] font-bold shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 ${
                                isPhotoLocked
                                  ? 'bg-zinc-600 hover:bg-zinc-700'
                                  : 'bg-indigo-600 hover:bg-indigo-700'
                              }`}
                              title="Use as current profile picture"
                            >
                              <Check size={12} />
                              <span>Apply</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onDeletePhoto(item.id)}
                            className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
                            title="Delete this photo from history"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Item Footer info */}
                      <div className="p-2.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                        <span className="truncate">{formatDate(item.uploadedAt)}</span>
                        {isActive && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">Active</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center justify-between gap-3">
            {history.length > 0 ? (
              <button
                type="button"
                onClick={onClearHistory}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Clear All History</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs min-h-[36px]"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>

      {/* Image Lightbox Preview Popup */}
      {selectedPreview && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPreview(null)}
        >
          <div className="relative max-w-lg max-h-[80vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
            <img src={selectedPreview} alt="Full preview" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => setSelectedPreview(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfilePictureHistoryModal;
