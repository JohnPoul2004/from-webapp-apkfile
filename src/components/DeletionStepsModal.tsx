import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Lock,
  Database,
  FileArchive,
  Key,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeletionStepsModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const DELETION_STEPS = [
  { step: 1, title: 'Verifying Security Credentials', desc: 'Validating admin permissions and user password session', icon: Key },
  { step: 2, title: 'Backing up Account Metadata', desc: 'Exporting user profile, quotas, and subscription state', icon: Database },
  { step: 3, title: 'Archiving Media & Stories', desc: 'Securing videos, showbiz news, photos, polls, and quizzes', icon: FileArchive },
  { step: 4, title: 'Revoking Active API Tokens', desc: 'Terminating active sessions, OAuth grants, and webhooks', icon: Lock },
  { step: 5, title: 'Enforcing 100-Day Grace Period', desc: 'Activating recovery protection window according to policy', icon: Clock },
  { step: 6, title: 'Locking Database Records', desc: 'Applying read-only freeze to prevent further write transactions', icon: ShieldAlert },
  { step: 7, title: 'Deletion Successfully Scheduled', desc: '100-day countdown timer initialized. Finalizing action...', icon: CheckCircle }
];

export function DeletionStepsModal({ isOpen, onComplete, onCancel }: DeletionStepsModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsFinished(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < DELETION_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsFinished(true);
          setTimeout(() => {
            onComplete();
          }, 900);
          return prev;
        }
      });
    }, 600); // 600ms per step = ~4.2 seconds total animation

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl w-full max-w-lg overflow-hidden p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-xs">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">Scheduling Account Deletion</h3>
              <p className="text-xs text-zinc-400">Executing 7-step security & data archival protocol</p>
            </div>
          </div>
          {!isFinished && (
            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Step {currentStepIndex + 1} of {DELETION_STEPS.length}</span>
            <span className="text-rose-400 font-bold">{Math.round(((currentStepIndex + 1) / DELETION_STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-500 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / DELETION_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 7 Steps List */}
        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
          {DELETION_STEPS.map((s, idx) => {
            const isCompleted = idx < currentStepIndex || isFinished;
            const isCurrent = idx === currentStepIndex && !isFinished;
            const isPending = idx > currentStepIndex;
            const IconComponent = s.icon;

            return (
              <div
                key={s.step}
                className={`flex items-start gap-3.5 p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-rose-500/10 border-rose-500/40 text-white shadow-lg'
                    : isCompleted
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-600 opacity-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isCurrent
                      ? 'bg-rose-500/30 text-rose-400 border border-rose-500/50 animate-pulse'
                      : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <IconComponent size={15} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${isCurrent ? 'text-rose-300' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'}`}>
                      {s.step}. {s.title}
                    </h4>
                    {isCompleted && <span className="text-[10px] text-emerald-400 font-mono font-bold">DONE</span>}
                    {isCurrent && <span className="text-[10px] text-rose-400 font-mono font-bold animate-pulse">PROCESSING</span>}
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default DeletionStepsModal;
