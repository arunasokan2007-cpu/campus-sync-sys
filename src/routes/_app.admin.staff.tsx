import { createFileRoute } from "@tanstack/react-router";
import { Wrench } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/routes/_app";

export const Route = createFileRoute("/_app/admin/staff")({
  head: () => ({
    meta: [
      { title: "Maintenance Staff — HostelCare ERP" },
      {
        name: "description",
        content: "Maintenance team directory with specialities, shifts and live workload.",
      },
      { property: "og:title", content: "Maintenance Staff — HostelCare ERP" },
      {
        property: "og:description",
        content: "Directory of hostel maintenance staff and their current workload.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="admin">
      <StaffPage />
    </RoleGate>
  ),
});

function StaffPage() {
  const { users, complaints } = useStore();
  const staff = users.filter((u) => u.role === "staff");

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Maintenance Staff"
        description={`${staff.length} technicians on the hostel maintenance team.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {staff.map((s) => {
          const assigned = complaints.filter((c) => c.assignedTo === s.id);
          const open = assigned.filter((c) => c.status !== "Completed").length;
          const done = assigned.filter((c) => c.status === "Completed").length;
          return (
            <div key={s.id} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wrench className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.specialty} specialist</p>
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Shift" value={s.shift ?? "—"} />
                <Row label="Email" value={s.email} />
                <Row label="Phone" value={s.phone} />
                <Row label="Open jobs" value={String(open)} />
                <Row label="Completed" value={String(done)} />
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
