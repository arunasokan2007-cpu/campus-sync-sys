import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { PriorityBadge, StatusBadge } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/data/types";
import type { Status } from "@/data/types";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/routes/_app";

export const Route = createFileRoute("/_app/admin/complaints")({
  head: () => ({
    meta: [
      { title: "All Complaints — HostelCare ERP" },
      {
        name: "description",
        content:
          "Assign maintenance staff, change status and filter every hostel complaint by date, priority, category and status.",
      },
      { property: "og:title", content: "All Complaints — HostelCare ERP" },
      {
        property: "og:description",
        content: "Manage and assign every hostel maintenance complaint.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="admin">
      <AllComplaints />
    </RoleGate>
  ),
});

function AllComplaints() {
  const { complaints, users, userById, assignStaff, changeStatus } = useStore();
  const staffList = users.filter((u) => u.role === "staff");

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All");
  const [category, setCategory] = React.useState("All");
  const [priority, setPriority] = React.useState("All");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const filtered = complaints.filter((c) => {
    const q = query.trim().toLowerCase();
    const student = userById(c.studentId);
    const matchesQuery =
      !q ||
      [c.id, c.title, c.room, c.hostel, c.category, student?.name ?? ""].some((v) =>
        v.toLowerCase().includes(q),
      );
    const created = c.createdAt.slice(0, 10);
    return (
      matchesQuery &&
      (status === "All" || c.status === status) &&
      (category === "All" || c.category === category) &&
      (priority === "All" || c.priority === priority) &&
      (!from || created >= from) &&
      (!to || created <= to)
    );
  });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="All Complaints"
        description={`${filtered.length} of ${complaints.length} complaints shown.`}
      />

      <div className="mb-5 grid gap-3 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-3 xl:grid-cols-6">
        <div className="md:col-span-3 xl:col-span-2">
          <Label className="text-xs text-muted-foreground">Search</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ID, title, student, room"
            />
          </div>
        </div>
        <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUSES} />
        <FilterSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={[...CATEGORIES]}
        />
        <FilterSelect
          label="Priority"
          value={priority}
          onChange={setPriority}
          options={PRIORITIES}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              className="mt-1"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input type="date" className="mt-1" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Complaint</th>
                <th className="px-4 py-3 font-medium">Student / Room</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Reported</th>
                <th className="px-4 py-3 font-medium">Assign staff</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <Link
                      to="/complaints/$id"
                      params={{ id: c.id }}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {c.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{c.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{userById(c.studentId)?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.room} · {c.hostel}
                    </p>
                  </td>
                  <td className="px-4 py-3">{c.category}</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={c.assignedTo ?? ""}
                      onValueChange={(v) => {
                        assignStaff(c.id, v);
                        toast.success(`${c.id} assigned`);
                      }}
                    >
                      <SelectTrigger className="w-[170px]">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffList.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={c.status}
                      onValueChange={(v) => {
                        changeStatus(c.id, v as Status);
                        toast.success(`${c.id} → ${v}`);
                      }}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No complaints match these filters.
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        Legend:
        {STATUSES.map((s) => (
          <StatusBadge key={s} status={s} />
        ))}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setQuery("");
            setStatus("All");
            setCategory("All");
            setPriority("All");
            setFrom("");
            setTo("");
          }}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
