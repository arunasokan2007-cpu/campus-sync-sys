import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/routes/_app";

export const Route = createFileRoute("/_app/admin/performance")({
  head: () => ({
    meta: [
      { title: "Staff Performance — HostelCare ERP" },
      {
        name: "description",
        content:
          "Track complaints resolved per maintenance staff member, resolution rate and average turnaround.",
      },
      { property: "og:title", content: "Staff Performance — HostelCare ERP" },
      {
        property: "og:description",
        content: "Resolution rates and turnaround times for every maintenance technician.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="admin">
      <PerformancePage />
    </RoleGate>
  ),
});

function PerformancePage() {
  const { users, complaints } = useStore();
  const staff = users.filter((u) => u.role === "staff");

  const rows = staff
    .map((s) => {
      const assigned = complaints.filter((c) => c.assignedTo === s.id);
      const resolved = assigned.filter((c) => c.status === "Completed");
      const days =
        resolved.length === 0
          ? 0
          : resolved.reduce(
              (acc, c) =>
                acc +
                (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / 86400000,
              0,
            ) / resolved.length;
      return {
        id: s.id,
        name: s.name,
        specialty: s.specialty ?? "",
        assigned: assigned.length,
        resolved: resolved.length,
        open: assigned.length - resolved.length,
        rate: assigned.length ? Math.round((resolved.length / assigned.length) * 100) : 0,
        avgDays: Math.max(0, Math.round(days * 10) / 10),
      };
    })
    .sort((a, b) => b.resolved - a.resolved);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Staff Performance"
        description="Complaints resolved per maintenance staff member."
      />

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Complaints resolved
        </h2>
        <div className="mt-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="resolved" fill="#2563eb" radius={[4, 4, 0, 0]} name="Resolved" />
              <Bar dataKey="open" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Open" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.specialty}</p>
              </div>
              <p className="text-2xl font-semibold text-primary">{r.rate}%</p>
            </div>
            <Progress value={r.rate} className="mt-3" />
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
              <Metric label="Assigned" value={r.assigned} />
              <Metric label="Resolved" value={r.resolved} />
              <Metric label="Open" value={r.open} />
              <Metric label="Avg days" value={r.avgDays} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <p className="text-base font-semibold text-foreground">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
