import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const CreateShortModal: React.FC<{ uid: string, onClose: () => void }> = ({ uid, onClose }) => {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [pageId, setPageId] = useState('');
  const [eventId, setEventId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, `users/${uid}/shorts`), {
      title,
      videoUrl,
      tag,
      description,
      pageId,
      eventId,
      createdAt: serverTimestamp(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Create Short</h2>
        <input className="w-full border p-2 mb-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input className="w-full border p-2 mb-2" placeholder="Video URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required />
        <input className="w-full border p-2 mb-2" placeholder="Tag" value={tag} onChange={e => setTag(e.target.value)} />
        <textarea className="w-full border p-2 mb-2" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input className="w-full border p-2 mb-2" placeholder="Page ID" value={pageId} onChange={e => setPageId(e.target.value)} />
        <input className="w-full border p-2 mb-2" placeholder="Event ID" value={eventId} onChange={e => setEventId(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-zinc-500">Cancel</button>
          <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded">Create</button>
        </div>
      </form>
    </div>
  );
};
