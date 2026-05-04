import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export type TaskStatus = 'de_facut' | 'in_lucru' | 'finalizata' | 'expirata';
export type TaskPriority = 'scazuta' | 'medie' | 'ridicata' | 'urgenta';

export interface Task {
  id?: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  assignedToEmail: string;
  assignedBy: string;
  assignedByName: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Timestamp;
  estimatedHours?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export async function createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = Timestamp.now();
  const ref = await addDoc(collection(db, 'tasks'), { ...data, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function getAllTasks(): Promise<Task[]> {
  const snap = await getDocs(query(collection(db, 'tasks'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
}

export async function getMyTasks(userId: string): Promise<Task[]> {
  const snap = await getDocs(query(collection(db, 'tasks'), where('assignedTo', '==', userId)));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Task))
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
}

export async function updateTask(taskId: string, updates: Partial<Omit<Task, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'tasks', taskId), { ...updates, updatedAt: Timestamp.now() });
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', taskId));
}
