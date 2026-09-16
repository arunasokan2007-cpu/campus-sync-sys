import * as React from "react";

import { seedComplaints, seedNotifications, seedUsers } from "@/data/seed";
import type {
  AppNotification,
  Category,
  Complaint,
  Priority,
  Role,
  Status,
  User,
} from "@/data/types";

const STORAGE_KEY = "hostel-maintenance-state-v1";

interface State {
  currentUserId: string;
  users: User[];
  complaints: Complaint[];
  notifications: AppNotification[];
}

const initialState: State = {
  currentUserId: "stu-1",
  users: seedUsers,
  complaints: seedComplaints,
  notifications: seedNotifications,
};

export interface NewComplaintInput {
  title: string;
  category: Category;
  room: string;
  description: string;
  priority: Priority;
  photos: string[];
}

interface StoreValue extends State {
  hydrated: boolean;
  currentUser: User;
  userById: (id?: string) => User | undefined;
  switchRole: (role: Role) => void;
  setCurrentUser: (id: string) => void;
  createComplaint: (input: NewComplaintInput) => Complaint;
  nextComplaintId: () => string;
  changeStatus: (complaintId: string, status: Status, note?: string) => void;
  assignStaff: (complaintId: string, staffId: string) => void;
  addNote: (complaintId: string, text: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  resetDemoData: () => void;
}

const StoreContext = React.createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(initialState);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as State) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const value = React.useMemo<StoreValue>(() => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? state.users[0]!;
    const userById = (id?: string) => (id ? state.users.find((u) => u.id === id) : undefined);
    const now = () => new Date().toISOString();

    const notify = (
      list: AppNotification[],
      userId: string,
      title: string,
      body: string,
      complaintId?: string,
    ): AppNotification[] => [
      {
        id: `ntf-${Math.random().toString(36).slice(2, 10)}`,
        userId,
        title,
        body,
        at: now(),
        read: false,
        ...(complaintId ? { complaintId } : {}),
      },
      ...list,
    ];

    const nextComplaintId = () => {
      const max = state.complaints.reduce((acc, c) => {
        const n = Number(c.id.split("-")[2]);
        return Number.isFinite(n) && n > acc ? n : acc;
      }, 0);
      return `CMP-2026-${String(max + 1).padStart(3, "0")}`;
    };

    return {
      ...state,
      hydrated,
      currentUser,
      userById,
      switchRole: (role) => {
        const target = state.users.find((u) => u.role === role);
        if (target) setState((s) => ({ ...s, currentUserId: target.id }));
      },
      setCurrentUser: (id) => setState((s) => ({ ...s, currentUserId: id })),
      nextComplaintId,
      createComplaint: (input) => {
        const id = nextComplaintId();
        const at = now();
        const complaint: Complaint = {
          id,
          title: input.title,
          category: input.category,
          description: input.description,
          priority: input.priority,
          status: "Pending",
          hostel: currentUser.hostel ?? "Aryabhatta Hostel",
          block: currentUser.block ?? input.room.charAt(0),
          room: input.room,
          studentId: currentUser.id,
          createdAt: at,
          updatedAt: at,
          photos: input.photos,
          timeline: [{ status: "Pending", at, by: currentUser.name, note: "Complaint submitted" }],
          notes: [],
        };
        setState((s) => ({
          ...s,
          complaints: [complaint, ...s.complaints],
          notifications: notify(
            notify(
              s.notifications,
              "adm-1",
              "New complaint received",
              `${id} — ${input.title} (${input.room})`,
              id,
            ),
            currentUser.id,
            "Complaint submitted",
            `Your complaint ${id} has been registered.`,
            id,
          ),
        }));
        return complaint;
      },
      changeStatus: (complaintId, status, note) => {
        setState((s) => {
          let student = "";
          const complaints = s.complaints.map((c) => {
            if (c.id !== complaintId) return c;
            student = c.studentId;
            const at = now();
            return {
              ...c,
              status,
              updatedAt: at,
              timeline: [
                ...c.timeline,
                { status, at, by: currentUser.name, ...(note ? { note } : {}) },
              ],
              notes: note ? [...c.notes, { at, by: currentUser.name, text: note }] : c.notes,
            };
          });
          return {
            ...s,
            complaints,
            notifications: student
              ? notify(
                  s.notifications,
                  student,
                  `Complaint ${status.toLowerCase()}`,
                  `${complaintId} is now marked as ${status}.`,
                  complaintId,
                )
              : s.notifications,
          };
        });
      },
      assignStaff: (complaintId, staffId) => {
        const assignee = state.users.find((u) => u.id === staffId);
        setState((s) => {
          let student = "";
          const complaints = s.complaints.map((c) => {
            if (c.id !== complaintId) return c;
            student = c.studentId;
            const at = now();
            return {
              ...c,
              assignedTo: staffId,
              status: c.status === "Pending" ? ("Assigned" as Status) : c.status,
              updatedAt: at,
              timeline: [
                ...c.timeline,
                {
                  status: "Assigned" as Status,
                  at,
                  by: currentUser.name,
                  note: `Assigned to ${assignee?.name ?? "maintenance staff"}`,
                },
              ],
            };
          });
          let notifications = notify(
            s.notifications,
            staffId,
            "New assignment",
            `Complaint ${complaintId} has been assigned to you.`,
            complaintId,
          );
          if (student) {
            notifications = notify(
              notifications,
              student,
              "Complaint assigned",
              `${complaintId} was assigned to ${assignee?.name ?? "maintenance staff"}.`,
              complaintId,
            );
          }
          return { ...s, complaints, notifications };
        });
      },
      addNote: (complaintId, text) => {
        setState((s) => ({
          ...s,
          complaints: s.complaints.map((c) =>
            c.id === complaintId
              ? {
                  ...c,
                  updatedAt: now(),
                  notes: [...c.notes, { at: now(), by: currentUser.name, text }],
                }
              : c,
          ),
        }));
      },
      markRead: (id) =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllRead: () =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) =>
            n.userId === s.currentUserId ? { ...n, read: true } : n,
          ),
        })),
      resetDemoData: () => setState(initialState),
    };
  }, [state, hydrated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useMyNotifications() {
  const { notifications, currentUserId } = useStore();
  return notifications.filter((n) => n.userId === currentUserId);
}
