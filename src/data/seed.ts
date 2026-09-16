import type {
  AppNotification,
  Category,
  Complaint,
  Priority,
  Status,
  TimelineEvent,
  User,
} from "./types";

/** Deterministic pseudo-random so server and client render the same seed data. */
function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export const HOSTELS = [
  { name: "Aryabhatta Hostel", blocks: ["A", "B"] },
  { name: "Bhaskara Hostel", blocks: ["B", "C"] },
  { name: "Chanakya Hostel", blocks: ["C", "D"] },
];

const studentRows: Array<[string, string, string, string, string, string]> = [
  ["Arun Asokan", "22CSE1041", "Aryabhatta Hostel", "A", "A-204", "B.Tech CSE"],
  ["Meera Nair", "22ECE1123", "Aryabhatta Hostel", "A", "A-207", "B.Tech ECE"],
  ["Rahul Verma", "21MEC0932", "Aryabhatta Hostel", "B", "B-105", "B.Tech Mech"],
  ["Sneha Iyer", "23CSE2210", "Bhaskara Hostel", "B", "B-112", "B.Tech CSE"],
  ["Kiran Das", "22CIV1187", "Bhaskara Hostel", "C", "C-301", "B.Tech Civil"],
  ["Divya Menon", "21BBA0442", "Bhaskara Hostel", "C", "C-308", "BBA"],
  ["Farhan Ali", "23EEE2054", "Chanakya Hostel", "C", "C-214", "B.Tech EEE"],
  ["Ananya Rao", "22CSE1098", "Chanakya Hostel", "D", "D-102", "B.Tech CSE"],
  ["Vikram Singh", "21MBA0311", "Chanakya Hostel", "D", "D-118", "MBA"],
  ["Priya Sharma", "23BSC2431", "Aryabhatta Hostel", "A", "A-119", "B.Sc Physics"],
  ["Joel Thomas", "22ECE1201", "Bhaskara Hostel", "B", "B-120", "B.Tech ECE"],
  ["Nisha Gupta", "21CSE0876", "Chanakya Hostel", "C", "C-226", "B.Tech CSE"],
];

export const students: User[] = studentRows.map(([name, studentId, hostel, block, room, course], i) => ({
  id: `stu-${i + 1}`,
  name,
  role: "student" as const,
  email: `${studentId.toLowerCase()}@college.edu`,
  phone: `+91 98${(40000000 + i * 137171).toString().slice(0, 8)}`,
  studentId,
  hostel,
  block,
  room,
  course,
}));

const staffRows: Array<[string, Category, string]> = [
  ["Ramesh Kumar", "Electrical", "Morning (8am - 4pm)"],
  ["Suresh Pillai", "Plumbing", "Morning (8am - 4pm)"],
  ["Lakshmi Devi", "Cleaning", "Evening (12pm - 8pm)"],
  ["Anil Joshi", "Internet/Wi-Fi", "Morning (8am - 4pm)"],
  ["Mohan Rathore", "Furniture", "Evening (12pm - 8pm)"],
];

export const staff: User[] = staffRows.map(([name, specialty, shift], i) => ({
  id: `stf-${i + 1}`,
  name,
  role: "staff" as const,
  email: `${name.split(" ")[0]!.toLowerCase()}.maint@college.edu`,
  phone: `+91 97${(31000000 + i * 219371).toString().slice(0, 8)}`,
  specialty,
  shift,
}));

export const admins: User[] = [
  {
    id: "adm-1",
    name: "Dr. Kavitha Menon",
    role: "admin",
    email: "warden.admin@college.edu",
    phone: "+91 9600112233",
  },
];

export const seedUsers: User[] = [...students, ...staff, ...admins];

const titles: Record<Category, string[]> = {
  Electrical: ["Power socket not working", "Frequent short circuit in room", "Switchboard sparking"],
  Plumbing: ["Washbasin pipe leaking", "Toilet flush not working", "Bathroom drain blocked"],
  Fan: ["Ceiling fan making noise", "Fan not rotating", "Fan regulator faulty"],
  Light: ["Tube light flickering", "Study lamp not working", "Corridor light fused"],
  Furniture: ["Study table drawer broken", "Bed frame loose", "Chair leg cracked"],
  Water: ["No water supply since morning", "Hot water not available", "Water cooler not cooling"],
  Cleaning: ["Room not cleaned for a week", "Garbage not collected", "Washroom needs deep cleaning"],
  "Internet/Wi-Fi": ["Wi-Fi keeps disconnecting", "Very slow internet speed", "LAN port dead"],
  Other: ["Window latch broken", "Door lock jammed", "Cupboard key lost"],
};

const descriptions = [
  "The issue started two days back and is getting worse. Requesting an early visit.",
  "Tried basic troubleshooting but it did not help. Please send someone to check.",
  "This is affecting daily routine and studies. Kindly resolve at the earliest.",
  "Reported verbally to the caretaker earlier, but no action was taken yet.",
];

const staffNotes: Record<string, string[]> = {
  Electrical: ["Socket rewired and tested.", "Loose neutral wire tightened."],
  Fan: ["Capacitor replaced.", "Bearing greased and blades balanced."],
  Plumbing: ["Pipe joint resealed.", "Flush valve replaced."],
  Light: ["Tube light and starter replaced.", "Choke replaced."],
  Furniture: ["Drawer rail replaced.", "Frame joints re-bolted."],
  Water: ["Motor reset, supply restored.", "Cooler gas refilled."],
  Cleaning: ["Deep cleaning completed.", "Daily cleaning schedule restored."],
  "Internet/Wi-Fi": ["Access point rebooted and re-configured.", "LAN port patched at switch."],
  Other: ["Latch replaced.", "Lock cylinder changed."],
};

const categories = Object.keys(titles) as Category[];
const priorities: Priority[] = ["Low", "Medium", "High"];

/** Fixed "today" reference keeps the seeded history stable. */
const NOW = new Date("2026-09-16T09:00:00.000Z").getTime();
const DAY = 86400000;

function iso(daysAgo: number, hourOffset = 0) {
  return new Date(NOW - daysAgo * DAY + hourOffset * 3600000).toISOString();
}

function buildComplaints(): Complaint[] {
  const rand = makeRandom(20260916);
  const list: Complaint[] = [];
  const total = 42;

  for (let i = 0; i < total; i++) {
    const student = students[Math.floor(rand() * students.length)]!;
    const category = categories[Math.floor(rand() * categories.length)]!;
    const title = titles[category][Math.floor(rand() * titles[category].length)]!;
    const priority = priorities[Math.floor(rand() * priorities.length)]!;
    const daysAgo = Math.floor(rand() * 150);

    // Older complaints skew towards completed, newer towards pending.
    let status: Status;
    const r = rand();
    if (daysAgo > 30) status = r > 0.12 ? "Completed" : "In Progress";
    else if (daysAgo > 10) status = r > 0.6 ? "Completed" : r > 0.3 ? "In Progress" : "Assigned";
    else status = r > 0.7 ? "In Progress" : r > 0.35 ? "Assigned" : "Pending";

    const assignee =
      status === "Pending" ? undefined : staff[Math.floor(rand() * staff.length)]!;

    const createdAt = iso(daysAgo);
    const timeline: TimelineEvent[] = [
      { status: "Pending", at: createdAt, by: student.name, note: "Complaint submitted" },
    ];
    if (assignee) {
      timeline.push({
        status: "Assigned",
        at: iso(daysAgo, 5),
        by: "Dr. Kavitha Menon",
        note: `Assigned to ${assignee.name}`,
      });
    }
    if (status === "In Progress" || status === "Completed") {
      timeline.push({
        status: "In Progress",
        at: iso(daysAgo - 1, 3),
        by: assignee?.name ?? "Maintenance",
        note: "Work started",
      });
    }
    const notes = [];
    if (status === "Completed") {
      const note = staffNotes[category]![Math.floor(rand() * staffNotes[category]!.length)]!;
      timeline.push({
        status: "Completed",
        at: iso(daysAgo - 2, 6),
        by: assignee?.name ?? "Maintenance",
        note,
      });
      notes.push({ at: iso(daysAgo - 2, 6), by: assignee?.name ?? "Maintenance", text: note });
    } else if (status === "In Progress") {
      notes.push({
        at: iso(daysAgo - 1, 3),
        by: assignee?.name ?? "Maintenance",
        text: "Inspected the issue, spare part ordered.",
      });
    }

    list.push({
      id: `CMP-2026-${String(i + 1).padStart(3, "0")}`,
      title,
      category,
      description: descriptions[Math.floor(rand() * descriptions.length)]!,
      priority,
      status,
      hostel: student.hostel!,
      block: student.block!,
      room: student.room!,
      studentId: student.id,
      assignedTo: assignee?.id,
      createdAt,
      updatedAt: timeline[timeline.length - 1]!.at,
      photos: [],
      timeline,
      notes,
    });
  }

  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export const seedComplaints: Complaint[] = buildComplaints();

export const seedNotifications: AppNotification[] = [
  {
    id: "ntf-1",
    userId: "stu-1",
    title: "Complaint in progress",
    body: "Ramesh Kumar has started work on your complaint.",
    at: iso(1),
    read: false,
    complaintId: seedComplaints.find((c) => c.studentId === "stu-1")?.id,
  },
  {
    id: "ntf-2",
    userId: "stu-1",
    title: "Complaint assigned",
    body: "Your complaint has been assigned to maintenance staff.",
    at: iso(2),
    read: true,
  },
  {
    id: "ntf-3",
    userId: "stf-1",
    title: "New assignment",
    body: "An electrical complaint in A-204 has been assigned to you.",
    at: iso(1, 2),
    read: false,
  },
  {
    id: "ntf-4",
    userId: "adm-1",
    title: "High priority complaint",
    body: "A high priority complaint is pending for more than 24 hours.",
    at: iso(0, -3),
    read: false,
  },
];
