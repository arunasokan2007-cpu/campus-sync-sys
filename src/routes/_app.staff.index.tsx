import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, Loader2, UserCheck } from "lucide-react";

import { ComplaintTable } from "@/components/complaint-table";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/routes/_app";

export const Route = createFileRoute("/_app/staff/")({
  head: () => ({
    meta: [
      { title: "Staff Dashboard — HostelCare ERP" },
      {
        name: "description",
        content: "Maintenance workload overview: assigned jobs, work in progress and completions.",
      },
      { property: "og:title", content: "Staff Dashboard — HostelCare ERP" },
      {
        property: "og:description",
        content: "Your assigned hostel maintenance workload at a glance.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="staff">
      <StaffDashboard />
    </RoleGate>
  ),
});

function StaffDashboard() {
  const { complaints, currentUser } = useStore();
  const mine = complaints.filter((c) => c.assignedTo === currentUser.id);
  const count = (s: string) => mine.filter((c) => c.status === s).length;
  const highPriorityOpen = mine.filter(
    (c) => c.priority === "High" && c.status !== "Completed",
  ).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`${currentUser.name} · ${currentUser.specialty}`}
        description={`Shift: ${currentUser.shift}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Assigned" value={mine.length} icon={ClipboardList} />
        <StatCard label="Awaiting Start" value={count("Assigned")} icon={UserCheck} tone="amber" />
        <StatCard
          label="In Progress"
          value={count("In Progress")}
          icon={Loader2}
          tone="indigo"
          hint={`${highPriorityOpen} high priority open`}
        />
        <StatCard
          label="Completed"
          value={count("Completed")}
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Open jobs
          </h2>
          <Link to="/staff/complaints" className="text-sm text-primary hover:underline">
            Manage all assignments
          </Link>
        </div>
        <ComplaintTable
          complaints={mine.filter((c) => c.status !== "Completed")}
          showStudent
          showAssignee={false}
          emptyMessage="No open jobs. Great work!"
        />
      </div>
    </div>
  );
}
