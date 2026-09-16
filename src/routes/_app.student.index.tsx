import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, Clock, FilePlus2, Loader2, MapPin } from "lucide-react";

import { ComplaintTable } from "@/components/complaint-table";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { RoleGate } from "@/routes/_app";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_app/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — HostelCare ERP" },
      {
        name: "description",
        content: "Track your hostel room complaints, status counts and room details in one place.",
      },
      { property: "og:title", content: "Student Dashboard — HostelCare ERP" },
      {
        property: "og:description",
        content: "Your hostel complaint stats, room information and recent reports.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="student">
      <StudentDashboard />
    </RoleGate>
  ),
});

function StudentDashboard() {
  const { complaints, currentUser } = useStore();
  const mine = complaints.filter((c) => c.studentId === currentUser.id);
  const count = (s: string) => mine.filter((c) => c.status === s).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Welcome back, ${currentUser.name.split(" ")[0]}`}
        description="Here is a snapshot of your hostel maintenance requests."
        actions={
          <Button asChild>
            <Link to="/student/report">
              <FilePlus2 className="h-4 w-4" />
              Report a Problem
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Complaints" value={mine.length} icon={ClipboardList} />
        <StatCard label="Pending" value={count("Pending")} icon={Clock} tone="amber" />
        <StatCard
          label="In Progress"
          value={count("In Progress") + count("Assigned")}
          icon={Loader2}
          tone="indigo"
          hint={`${count("Assigned")} assigned`}
        />
        <StatCard label="Completed" value={count("Completed")} icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Room & Hostel Info</h2>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Student Name", currentUser.name],
              ["Student ID", currentUser.studentId],
              ["Course", currentUser.course],
              ["Hostel", currentUser.hostel],
              ["Block", currentUser.block],
              ["Room Number", currentUser.room],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b pb-2 last:border-0">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent complaints
            </h2>
            <Link to="/student/complaints" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <ComplaintTable
            complaints={mine.slice(0, 5)}
            emptyMessage="You haven't reported any problems yet."
          />
        </div>
      </div>
    </div>
  );
}
