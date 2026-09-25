import React from 'react';
import { ShieldAlert, LogOut, Clock, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { getRelativeTime } from '../utils/dateHelper';

interface DeletionScheduledProps {
  scheduledAt: any; // Firestore Timestamp
  deletionDate: any; // Firestore Timestamp
  reason?: string;
  onLogout?: () => void;
  onRestore?: () => void;
  isRestoring?: boolean;
}

export default function DeletionScheduled({ 
  scheduledAt, 
  deletionDate, 
  reason, 
  onLogout,
  onRestore,
  isRestoring = false
}: DeletionScheduledProps) {
  const handleLogout = async () => {
    await signOut(auth);
    if (onLogout) onLogout();
  };

  const scheduledDateObj = scheduledAt?.toDate ? scheduledAt.toDate() : new Date();
  const finalDateObj = deletionDate?.toDate ? deletionDate.toDate() : new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Account Deletion Scheduled</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your request to delete this account is being processed. Access to this account is restricted during the waiting period.
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 text-left space-y-3">
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-zinc-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Scheduled On</p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {scheduledDateObj.toLocaleDateString()} ({getRelativeTime(scheduledDateObj)})
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar size={16} className="text-zinc-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Permanent Deletion On</p>
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {finalDateObj.toLocaleDateString()} (100 days from request)
              </p>
            </div>
          </div>
          {reason && (
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reason Provided</p>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 italic">"{reason}"</p>
            </div>
          )}
        </div>

        <div className="pt-2 space-y-3">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            You can restore your account immediately or log out to return later. This account will be permanently gone after 100 days.
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={onRestore}
              disabled={isRestoring}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-600/20"
            >
              {isRestoring ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Restoring Account...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Restore Account Now</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={16} />
              Logout and Exit
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
