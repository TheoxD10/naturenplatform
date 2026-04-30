import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type UserRole = 'admin' | 'superior' | 'management' | 'showroom';
export type ShowroomLocation = 'Sibiu' | 'Iasi' | 'Constanta' | 'Oradea' | 'Bucuresti' | 'Timisoara1' | 'Timisoara2' | 'Cluj';

export const SHOWROOM_LOCATIONS: ShowroomLocation[] = [
  'Sibiu', 'Iasi', 'Constanta', 'Oradea', 'Bucuresti', 'Timisoara1', 'Timisoara2', 'Cluj',
];

export interface UserData {
  email: string;
  role: UserRole;
  name?: string;
  showroomLocation?: ShowroomLocation;
  createdAt: Date;
  createdBy?: string;
  firstLogin: boolean;
}

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) return userDoc.data() as UserData;
    return null;
  } catch { return null; }
}

export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) return (userDoc.data().role as UserRole) || 'showroom';
    return 'showroom';
  } catch { return 'showroom'; }
}

export async function setUserRole(
  userId: string,
  email: string,
  role: UserRole,
  createdBy?: string,
  showroomLocation?: ShowroomLocation
): Promise<void> {
  const userData: any = { email, role, createdAt: new Date(), createdBy: createdBy || null, firstLogin: true };
  if (role === 'showroom' && showroomLocation) userData.showroomLocation = showroomLocation;
  await setDoc(doc(db, 'users', userId), userData);
}

export async function updateUserProfile(userId: string, name: string): Promise<void> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    await setDoc(doc(db, 'users', userId), { ...userDoc.data(), name, firstLogin: false });
  }
}

export async function setupAdminRole(userId: string, email: string): Promise<void> {
  await setDoc(doc(db, 'users', userId), { email, role: 'admin', createdAt: new Date(), firstLogin: false });
}
