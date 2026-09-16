export type Role = "student" | "staff" | "admin";

export type Status = "Pending" | "Assigned" | "In Progress" | "Completed";

export const STATUSES: Status[] = ["Pending", "Assigned", "In Progress", "Completed"];

export type Priority = "Low" | "Medium" | "High";

export const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

export const CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Fan",
  "Light",
  "Furniture",
  "Water",
  "Cleaning",
  "Internet/Wi-Fi",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  /** student only */
  studentId?: string | undefined;
  hostel?: string | undefined;
  block?: string | undefined;
  room?: string | undefined;
  course?: string | undefined;
  /** staff only */
  specialty?: Category | undefined;
  shift?: string | undefined;
}

export interface TimelineEvent {
  status: Status;
  at: string;
  by: string;
  note?: string | undefined;
}

export interface MaintenanceNote {
  at: string;
  by: string;
  text: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: Category;
  description: string;
  priority: Priority;
  status: Status;
  hostel: string;
  block: string;
  room: string;
  studentId: string;
  assignedTo?: string | undefined;
  createdAt: string;
  updatedAt: string;
  photos: string[];
  timeline: TimelineEvent[];
  notes: MaintenanceNote[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  complaintId?: string | undefined;
}
