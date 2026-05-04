import { getAdminDb } from './firebase-admin';
import { ActivityType } from './activity';
import { ShowroomLocation } from './userRoles';

export async function logActivityServer(
  type: ActivityType,
  userId: string,
  userName: string,
  userEmail: string,
  description: string,
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
  }
): Promise<void> {
  try {
    await getAdminDb().collection('activities').add({
      type, userId, userName, userEmail, description,
      metadata: metadata || {},
      timestamp: new Date(),
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error logging activity (server):', error);
  }
}
