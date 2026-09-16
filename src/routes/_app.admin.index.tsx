import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ClipboardList, Clock, Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { PriorityBadge, StatusBadge } from "@/components/status";
import { StatCard } from "@/components/stat-card";
import { CATEGORIES, STATUSES } from "@/data/types";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/routes/_app";

export const Route = createFileRoute("/_app/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — HostelCare ERP" },
      {
        name: "description",
        content:
          "Hostel-wide complaint analytics: category, status and block breakdowns plus monthly trends.",
      },
      { property: "og:title", content: "Admin Dashboard — HostelCare ERP" },
      {
        property: "og:description",
        content: "Warden view of hostel maintenance metrics, alerts and trends.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="admin">
      <AdminDashboard />
    </RoleGate>
  ),
});

const STATUS_COLORS = ["#f59e0b", "#0ea5e9", "#6366f1", "#10b981"];

function AdminDashboard() {
  const { complaints, userById } = useStore();
  const count = (s: string) => complaints.filter((c) => c.status === s).length;

  const byCategory = CATEGORIES.map((c) => ({
    name: c,
    count: complaints.filter((x) => x.category === c).length,
  }));

  const byStatus = STATUSES.map((s) => ({
    name: s,
    value: complaints.filter((c) => c.status === s).length,
  }));

  const blockKeys = Array.from(new Set(complaints.map((c) => `${c.hostel} · ${c.block}`))).sort();
  const byBlock = blockKeys.map((key) => ({
    name: key.replace(" Hostel", ""),
    open: complaints.filter((c) => `${c.hostel} · ${c.block}` === key && c.status !== "Completed")
      .length,
    completed: complaints.filter(
      (c) => `${c.hostel} · ${c.block}` === key && c.status === "Completed",
    ).length,
  }));

  const months: { name: string; raised: number; resolved: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(2026, 8 - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    months.push({
      name: d.toLocaleDateString("en-IN", { month: "short" }),
      raised: complaints.filter((c) => {
        const x = new Date(c.createdAt);
        return `${x.getFullYear()}-${x.getMonth()}` === key;
      }).length,
      resolved: complaints.filter((c) => {
        if (c.status !== "Completed") return false;
        const x = new Date(c.updatedAt);
        return `${x.getFullYear()}-${x.getMonth()}` === key;
      }).length,
    });
  }

  const highPriority = complaints
    .filter((c) => c.priority === "High" && c.status !== "Completed")
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Administration Dashboard"
        description="Hostel-wide maintenance performance and complaint analytics."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Complaints" value={complaints.length} icon={ClipboardList} />
        <StatCard label="Pending" value={count("Pending")} icon={Clock} tone="amber" />
        <StatCard
          label="In Progress"
          value={count("In Progress") + count("Assigned")}
          icon={Loader2}
          tone="indigo"
        />
        <StatCard
          label="Completed"
          value={count("Completed")}
          icon={CheckCircle2}
          tone="emerald"
          hint={`${Math.round((count("Completed") / Math.max(complaints.length, 1)) * 100)}% resolution rate`}
        />
      </div>

      <section className="mt-6 rounded-xl border border-red-200 bg-red-50/60 p-5">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">High priority alerts</h2>
        </div>
        {highPriority.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No open high priority complaints.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {highPriority.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-3 text-sm shadow-sm"
              >
                <Link
                  to="/complaints/$id"
                  params={{ id: c.id }}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {c.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {c.id} · Room {c.room} · {formatDate(c.createdAt)} ·{" "}
                  {userById(c.assignedTo)?.name ?? "Unassigned"}
                </span>
                <span className="ml-auto flex items-center gap-2">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Complaints by Category">
          <BarChart data={byCategory} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} height={60} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Complaints by Status">
          <PieChart>
            <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
              {byStatus.map((_, i) => (
                <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]!} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Complaints by Hostel / Block">
          <BarChart data={byBlock} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="open" stackId="a" fill="#f59e0b" name="Open" />
            <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Monthly Trends">
          <LineChart data={months} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="raised" stroke="#2563eb" strokeWidth={2} name="Raised" />
            <Line
              type="monotone"
              dataKey="resolved"
              stroke="#10b981"
              strokeWidth={2}
              name="Resolved"
            />
          </LineChart>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
