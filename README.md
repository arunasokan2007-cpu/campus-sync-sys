# Hostel Helper

Build the "Smart Hostel Room Maintenance & Complaint Management System" web application.

Key requirements:
1. Roles & Authentication:
   - Three distinct roles: Student, Maintenance Staff, Admin, with quick demo role-switcher and role-based route access.
   - Realistic seeded accounts and demo data for immediate testing.

2. Student Experience:
   - Dashboard with stats (total, pending, in-progress, completed complaints), room/hostel info (Student Name, ID, Hostel, Block, Room).
   - "Report a Problem" form: Title, Category (Electrical, Plumbing, Fan, Light, Furniture, Water, Cleaning, Internet/Wi-Fi, Other), Room Number, Description, Priority (Low, Medium, High), photo upload preview.
   - Duplicate complaint detection alert: warns if an open complaint exists for the same room & category.
   - Unique Complaint ID generation (e.g. CMP-2026-001).
   - "My Complaints" list with search, status filters, and click-through to Complaint Details.
   - Interactive complaint status timeline (Pending → Assigned → In Progress → Completed).

3. Maintenance Staff Experience:
   - Staff Dashboard with assigned workload metrics.
   - Assigned Complaints view with status updates (Assigned, In Progress, Completed) and ability to add maintenance notes (e.g. "Capacitor replaced").

4. Admin Experience:
   - Comprehensive dashboard with key metrics, high-priority alerts, and visual charts (Complaints by Category, Complaints by Status, Complaints by Hostel/Block, Monthly Trends).
   - All Complaints management: assign maintenance staff, update status, filter by date/priority/category/status, and search.
   - Student & Staff management views.
   - Staff performance tracker (complaints resolved per staff).

5. Shared & System Features:
   - In-app notification center with read/unread states and trigger events.
   - Detailed Complaint view with timeline history, student details, photos, and maintenance log.
   - Polished, professional college ERP / enterprise blue-and-white theme with clear status badges, icons, sidebar navigation, top bar, and responsive layout.
   - Pre-populated with rich sample complaints across rooms A-204, B-105, C-301, etc.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e1345c2e-8cc1-4668-b926-76ec6cb8c4ac).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
