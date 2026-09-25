import { auth, db } from '../firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function isUnavailableOrOfflineError(err: unknown): boolean {
  if (!err) return false;
  const str = err instanceof Error ? err.message : String(err);
  return (
    str.includes('unavailable') ||
    str.includes('offline') ||
    str.includes('Could not reach Cloud Firestore backend') ||
    str.includes('backend connection failed')
  );
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuthUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuthUser?.uid,
      email: currentAuthUser?.email,
      emailVerified: currentAuthUser?.emailVerified,
      isAnonymous: currentAuthUser?.isAnonymous,
      tenantId: currentAuthUser?.tenantId,
      providerInfo: currentAuthUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || []
    },
    operationType,
    path
  };
  if (isUnavailableOrOfflineError(error)) {
    console.warn('Firestore notice (client operating in offline/retry mode):', errInfo.error);
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
  return errInfo;
}

export function isPermissionDeniedError(err: unknown): boolean {
  if (!err) return false;
  const str = err instanceof Error ? err.message : String(err);
  return (
    str.includes('permission-denied') ||
    str.includes('Missing or insufficient permissions') ||
    str.includes('insufficient permissions')
  );
}

// Local Storage Fallback Cache to ensure zero data loss when Firestore rules are locked
export function getLocalItems(userId: string, colName: string): any[] {
  try {
    const raw = localStorage.getItem(`local_items_${userId}_${colName}`);
    if (raw) return JSON.parse(raw);
    const rawAlt = localStorage.getItem(`dmm_local_${colName}_${userId}`);
    if (rawAlt) return JSON.parse(rawAlt);
    return [];
  } catch (e) {
    console.warn('Failed to parse local items:', e);
    return [];
  }
}

export function saveLocalItem(userId: string, colName: string, item: any) {
  try {
    const existing = getLocalItems(userId, colName);
    const updated = [item, ...existing.filter((i) => i.id !== item.id)];
    localStorage.setItem(`local_items_${userId}_${colName}`, JSON.stringify(updated));
    // Dispatch custom event so App.tsx can reactively update
    window.dispatchEvent(new CustomEvent('local_items_updated', { detail: { colName } }));
  } catch (e) {
    console.warn('Failed to save local item:', e);
  }
}

export function deleteLocalItem(userId: string, colName: string, itemId: string) {
  try {
    const existing = getLocalItems(userId, colName);
    const updated = existing.filter((i) => i.id !== itemId);
    localStorage.setItem(`local_items_${userId}_${colName}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('local_items_updated', { detail: { colName } }));
  } catch (e) {
    console.warn('Failed to delete local item:', e);
  }
}

export function getDeletedLocalItems(userId: string, colName: string): any[] {
  try {
    const raw = localStorage.getItem(`local_deleted_items_${userId}_${colName}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to parse deleted local items:', e);
    return [];
  }
}

export function saveDeletedLocalItem(userId: string, colName: string, item: any) {
  try {
    const existing = getDeletedLocalItems(userId, colName);
    const updated = [item, ...existing.filter((i) => i.id !== item.id)];
    localStorage.setItem(`local_deleted_items_${userId}_${colName}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('local_items_updated', { detail: { colName } }));
  } catch (e) {
    console.warn('Failed to save deleted local item:', e);
  }
}

export function removeDeletedLocalItem(userId: string, colName: string, itemId: string) {
  try {
    const existing = getDeletedLocalItems(userId, colName);
    const updated = existing.filter((i) => i.id !== itemId);
    localStorage.setItem(`local_deleted_items_${userId}_${colName}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('local_items_updated', { detail: { colName } }));
  } catch (e) {
    console.warn('Failed to remove deleted local item:', e);
  }
}

export function calculateDaysRemaining(deletedAtRaw?: any, totalScheduledDays: number = 100): number {
  if (!deletedAtRaw) return totalScheduledDays;
  let timeMs = Date.now();
  if (typeof deletedAtRaw === 'string' || typeof deletedAtRaw === 'number') {
    timeMs = new Date(deletedAtRaw).getTime();
  } else if (deletedAtRaw?.toDate && typeof deletedAtRaw.toDate === 'function') {
    timeMs = deletedAtRaw.toDate().getTime();
  } else if (deletedAtRaw?.seconds) {
    timeMs = deletedAtRaw.seconds * 1000;
  }
  const diffDays = Math.floor((Date.now() - timeMs) / (1000 * 60 * 60 * 24));
  const remaining = totalScheduledDays - diffDays;
  return remaining > 0 ? remaining : 1;
}

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration: client is offline.');
    }
  }
}
