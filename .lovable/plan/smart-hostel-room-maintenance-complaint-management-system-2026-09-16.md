# Smart Hostel Room Maintenance & Complaint Management System

A full demo web app with three roles (Student, Maintenance Staff, Admin), rich seeded data, and an enterprise blue-and-white college ERP look.

## Approach

Build it as a self-contained demo app: all accounts, complaints, notifications and photos live in the browser (seeded on first load, saved locally so changes persist between visits). No sign-up or server needed — a role switcher in the top bar instantly moves between a student, a staff member and the admin. If you later want real logins and a shared database across devices, that can be added as a second step.

## Pages

**Shared shell**
- Sidebar navigation (role-aware), top bar with search, role switcher, notification bell with unread count and read/unread list.
- Status badges: Pending, Assigned, In Progress, Completed; priority chips Low/Medium/High.

**Student**
- Dashboard: total / pending / in-progress / completed counts, plus a room card (Name, ID, Hostel, Block, Room).
- Report a Problem: Title, Category (Electrical, Plumbing, Fan, Light, Furniture, Water, Cleaning, Internet/Wi-Fi, Other), Room Number, Description, Priority, photo upload with preview.
  - Warns inline if an open complaint already exists for the same room and category.
  - Generates an ID like CMP-2026-001 on submit.
- My Complaints: search + status filters, click through to details.
- Complaint Details: interactive timeline Pending → Assigned → In Progress → Completed, photos, maintenance log.

**Maintenance Staff**
- Dashboard: assigned, in-progress, completed-today, average resolution workload metrics.
- Assigned Complaints: change status (Assigned / In Progress / Completed) and add maintenance notes such as "Capacitor replaced".

**Admin**
- Dashboard: key metrics, high-priority alert panel, charts for Complaints by Category, by Status, by Hostel/Block, and Monthly Trends.
- All Complaints: assign staff, change status, filter by date / priority / category / status, search.
- Students and Staff directory views.
- Staff performance tracker: complaints resolved per staff member.

## Seed data

3 hostels with blocks, ~12 students, 5 maintenance staff, 1 admin, and ~40 complaints spread across rooms A-204, B-105, C-301 and others, over recent months, in every status and priority so charts and trends look real.

## Technical notes

- TanStack Start routes: `/` (role-aware landing/redirect), `/student`, `/student/report`, `/student/complaints`, `/staff`, `/staff/complaints`, `/admin`, `/admin/complaints`, `/admin/students`, `/admin/staff`, `/admin/performance`, `/complaints/$id`.
- A React context store over `localStorage` holds users, complaints, timeline events and notifications; seeded from a `src/data/seed.ts`.
- Charts via Recharts; UI via existing shadcn components; blue/white theme tokens added to `src/styles.css`.
- Photos stored as data URLs from the file input preview.
- Each route gets its own page title and description.
