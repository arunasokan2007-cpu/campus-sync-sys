import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, GraduationCap, ShieldCheck, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Role } from "@/data/types";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HostelCare ERP — Hostel Maintenance & Complaint Management" },
      {
        name: "description",
        content:
          "Report, track and resolve hostel room maintenance complaints with role based dashboards for students, maintenance staff and administrators.",
      },
      { property: "og:title", content: "HostelCare ERP — Hostel Complaint Management" },
      {
        property: "og:description",
        content:
          "Role based hostel maintenance desk with complaint tracking, staff assignment and analytics.",
      },
    ],
  }),
  component: Landing,
});

const roles: {
  role: Role;
  title: string;
  person: string;
  icon: typeof GraduationCap;
  points: string[];
  to: "/student" | "/staff" | "/admin";
}[] = [
  {
    role: "student",
    title: "Student",
    person: "Arun Asokan · A-204",
    icon: GraduationCap,
    points: ["Report room problems", "Track complaint status", "Photo uploads & timeline"],
    to: "/student",
  },
  {
    role: "staff",
    title: "Maintenance Staff",
    person: "Ramesh Kumar · Electrical",
    icon: Wrench,
    points: ["See assigned jobs", "Update work status", "Add maintenance notes"],
    to: "/staff",
  },
  {
    role: "admin",
    title: "Administrator",
    person: "Dr. Kavitha Menon · Warden",
    icon: ShieldCheck,
    points: ["Assign staff & set priority", "Hostel-wide analytics", "Staff performance tracker"],
    to: "/admin",
  },
];

function Landing() {
  const { switchRole, complaints } = useStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-white to-white">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-semibold">HostelCare ERP</p>
            <p className="text-xs text-muted-foreground">
              Smart Hostel Room Maintenance &amp; Complaint Management
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground">
          One desk for every hostel maintenance complaint
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Students raise issues in seconds, maintenance staff work through a clear queue, and the
          warden sees everything — with {complaints.length} sample complaints already loaded for a
          demo run.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {roles.map((r) => (
            <div
              key={r.role}
              className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <r.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{r.title}</h2>
              <p className="text-sm text-muted-foreground">{r.person}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                {r.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6"
                onClick={() => {
                  switchRole(r.role);
                  void navigate({ to: r.to });
                }}
              >
                Continue as {r.title}
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
