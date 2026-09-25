import React from 'react';
import { UserX, LogIn, Power } from 'lucide-react';
import { motion } from 'motion/react';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface DeactivatedViewProps {
  userId: string;
  onReactivate: () => void;
  onLogout: () => void;
}

export default function DeactivatedView({ userId, onReactivate, onLogout }: DeactivatedViewProps) {
  const [loading, setLoading] = React.useState(false);

  const handleReactivate = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isDeactivated: deleteField(),
        deactivationReason: deleteField(),
        deactivatedAt: deleteField()
      });
      onReactivate();
    } catch (err) {
      console.error('Failed to reactivate account:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
          <UserX size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Account Deactivated</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            This account is currently deactivated. You can reactivate it at any time to regain access to your content.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleReactivate}
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-600/10"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Power size={18} />
              </motion.div>
            ) : (
              <LogIn size={18} />
            )}
            Reactivate Account
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Logout
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">
          All your videos, news, photos, polls, and events are safe and will be visible again once you reactivate.
        </p>
      </motion.div>
    </div>
  );
}
