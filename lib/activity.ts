import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import { ShowroomLocation } from './userRoles';

export type ActivityType =
  | 'report_created' | 'report_updated' | 'report_deleted'
  | 'email_sent' | 'user_created' | 'user_updated' | 'user_deleted'
  | 'target_set' | 'target_updated' | 'login' | 'logout';

export interface Activity {
  id?: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userEmail: string;
  description: string;
  metadata?: {
    reportId?: string;
    showroomLocation?: ShowroomLocation;
    emailTo?: string;
    targetUserId?: string;
    targetUserEmail?: string;
    amount?: number;
    field?: string;
    oldValue?: string;
    newValue?: string;
    recipientCount?: number;
    isTest?: boolean;
    [key: string]: any;
  };
  timestamp: Timestamp;
  createdAt: Timestamp;
}

export async function logActivity(
  type: ActivityType,
  userId: string,
  userName: string,
  userEmail: string,
  description: string,
  metadata?: Activity['metadata']
): Promise<void> {
  try {
    await addDoc(collection(db, 'activities'), {
      type, userId, userName, userEmail, description,
      metadata: metadata || {},
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch { /* non-blocking */ }
}

export async function getRecentActivities(limitCount = 50): Promise<Activity[]> {
  try {
    const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Activity[];
  } catch { return []; }
}

export function getActivityIcon(type: ActivityType): string {
  switch (type) {
    case 'report_created': return '📄';
    case 'report_updated': return '✏️';
    case 'report_deleted': return '🗑️';
    case 'email_sent': return '📧';
    case 'user_created': return '👤';
    case 'user_updated': return '✏️';
    case 'user_deleted': return '🗑️';
    case 'target_set':
    case 'target_updated': return '🎯';
    case 'login': return '🔑';
    case 'logout': return '🚪';
    default: return '📌';
  }
}

export function getActivityColor(type: ActivityType): string {
  switch (type) {
    case 'report_created':
    case 'report_updated':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'report_deleted':
    case 'user_deleted':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'email_sent':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'user_created':
    case 'user_updated':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'target_set':
    case 'target_updated':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  }
}
