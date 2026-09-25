import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export type ActivityAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RESTORE'
  | 'SETTINGS'
  | 'SECURITY'
  | 'AUTH'
  | 'STATUS_CHANGE'
  | 'SHARE'
  | 'CLEAR';

export type ActivityCategory =
  | 'Videos'
  | 'News'
  | 'Photos'
  | 'Polls'
  | 'Quizzes'
  | 'Shorts'
  | 'Products'
  | 'Shopping'
  | 'Pages'
  | 'Events'
  | 'Profile'
  | 'Security'
  | 'Auth'
  | 'System';

export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO 8601 string
  action: ActivityAction;
  category: ActivityCategory;
  title: string;
  details?: string;
  section?: string;
  userId: string;
  userEmail?: string;
  status: 'success' | 'warning' | 'info' | 'error';
  metadata?: Record<string, any>;
}

const STORAGE_PREFIX = 'dmm_activity_logs_';

/**
 * Gets local activity logs from localStorage for immediate resilience
 */
export function getLocalActivityLogs(userId: string): ActivityLogEntry[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read local activity logs:', err);
    return [];
  }
}

/**
 * Saves local activity logs to localStorage
 */
export function saveLocalActivityLogs(userId: string, logs: ActivityLogEntry[]): void {
  if (!userId) return;
  try {
    // Keep last 150 entries in local storage
    const trimmed = logs.slice(0, 150);
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Failed to save local activity logs:', err);
  }
}

/**
 * Logs a new user action to both Firestore (audit collection) and localStorage fallback.
 */
export async function logActivity(
  entry: Omit<ActivityLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): Promise<ActivityLogEntry> {
  const user = auth.currentUser;
  const uid = entry.userId || user?.uid || 'anonymous';
  const email = entry.userEmail || user?.email || undefined;
  const entryId = entry.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = entry.timestamp || new Date().toISOString();

  const fullEntry: ActivityLogEntry = {
    id: entryId,
    timestamp,
    action: entry.action,
    category: entry.category,
    title: entry.title,
    details: entry.details,
    section: entry.section,
    userId: uid,
    userEmail: email,
    status: entry.status || 'success',
    metadata: entry.metadata
  };

  // 1. Immediately store in LocalStorage for instant UI reflection & offline safety
  const currentLogs = getLocalActivityLogs(uid);
  const updatedLogs = [fullEntry, ...currentLogs.filter((l) => l.id !== fullEntry.id)];
  saveLocalActivityLogs(uid, updatedLogs);

  // Dispatch custom window event so UI can react in realtime across components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dmm:activity-logged', { detail: fullEntry }));
  }

  // 2. Persist to Firestore under users/{uid}/activity_logs/{entryId}
  if (uid && uid !== 'anonymous') {
    try {
      const docRef = doc(db, 'users', uid, 'activity_logs', entryId);
      await setDoc(
        docRef,
        {
          ...fullEntry,
          serverCreatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch {
      // Gracefully ignore Firestore permissions/offline errors since it's already in local fallback
    }
  }

  return fullEntry;
}

/**
 * Retrieves all activity logs merged from Firestore and LocalStorage, ordered latest first.
 */
export async function fetchActivityLogs(userId: string): Promise<ActivityLogEntry[]> {
  if (!userId) return [];
  const localLogs = getLocalActivityLogs(userId);

  try {
    const colRef = collection(db, 'users', userId, 'activity_logs');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);

    const cloudLogs: ActivityLogEntry[] = [];
    snap.forEach((d) => {
      const data = d.data();
      cloudLogs.push({
        id: d.id,
        timestamp: data.timestamp || new Date().toISOString(),
        action: data.action || 'UPDATE',
        category: data.category || 'System',
        title: data.title || 'Activity',
        details: data.details,
        section: data.section,
        userId: data.userId || userId,
        userEmail: data.userEmail,
        status: data.status || 'success',
        metadata: data.metadata
      });
    });

    // Merge cloud logs and local logs deduplicating by ID
    const map = new Map<string, ActivityLogEntry>();
    cloudLogs.forEach((item) => map.set(item.id, item));
    localLogs.forEach((item) => {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    });

    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    saveLocalActivityLogs(userId, combined);
    return combined;
  } catch {
    return localLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

/**
 * Clears all activity logs for the current user
 */
export async function clearAllActivityLogs(userId: string): Promise<void> {
  if (!userId) return;
  saveLocalActivityLogs(userId, []);

  try {
    const colRef = collection(db, 'users', userId, 'activity_logs');
    const snap = await getDocs(colRef);
    const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch {
    // Local cleared regardless
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dmm:activity-logged', { detail: { action: 'CLEAR' } }));
  }
}

/**
 * Exports activity logs to a downloadable JSON or CSV file
 */
export function exportActivityLogsFile(logs: ActivityLogEntry[], format: 'json' | 'csv' = 'json'): void {
  const dateStr = new Date().toISOString().split('T')[0];
  let content = '';
  let mimeType = '';
  let filename = '';

  if (format === 'json') {
    content = JSON.stringify(logs, null, 2);
    mimeType = 'application/json';
    filename = `activity_logs_${dateStr}.json`;
  } else {
    // CSV format
    const headers = ['ID', 'Timestamp', 'Action', 'Category', 'Section', 'Title', 'Details', 'Status'];
    const rows = logs.map((log) => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.action}"`,
      `"${log.category}"`,
      `"${log.section || ''}"`,
      `"${(log.title || '').replace(/"/g, '""')}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
      `"${log.status}"`
    ]);
    content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    mimeType = 'text/csv';
    filename = `activity_logs_${dateStr}.csv`;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
