import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, Trash2, Loader2, Video } from 'lucide-react';
import { CreateShortModal } from './CreateShortModal';

interface Short {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
  tag: string;
  pageId?: string;
  eventId?: string;
  createdAt: any;
}

export const ShortsView: React.FC = () => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  const fetchShorts = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const q = query(collection(db, `users/${uid}/shorts`));
      const snapshot = await getDocs(q);
      const shortsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Short));
      setShorts(shortsData);
    } catch (error) {
      console.error('Error fetching shorts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid) {
      fetchShorts();
    } else {
      setLoading(false);
    }
  }, [uid]);

  const handleDelete = async (shortId: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, `users/${uid}/shorts`, shortId));
    fetchShorts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Shorts</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Create Short
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
      ) : !uid ? (
        <div className="text-center p-8 text-zinc-500">Please sign in to view your shorts.</div>
      ) : shorts.length === 0 ? (
        <div className="text-center p-8 text-zinc-500">No shorts created yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shorts.map(short => (
            <div key={short.id} className="border p-4 rounded-lg shadow-sm">
              <div className="aspect-video bg-zinc-100 mb-2 flex items-center justify-center">
                <Video className="text-zinc-400" />
              </div>
              <h3 className="font-bold">{short.title}</h3>
              <p className="text-sm text-zinc-600">{short.description}</p>
              <button
                onClick={() => handleDelete(short.id)}
                className="mt-2 text-red-500 flex items-center gap-1 text-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && uid && (
        <CreateShortModal uid={uid} onClose={() => { setIsModalOpen(false); fetchShorts(); }} />
      )}
    </div>
  );
};
