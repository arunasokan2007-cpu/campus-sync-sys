import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { PriorityBadge, StatusBadge } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Status } from "@/data/types";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/routes/_app";

export const Route = createFileRoute("/_app/staff/complaints")({
  head: () => ({
    meta: [
      { title: "Assigned Complaints — HostelCare ERP" },
      {
        name: "description",
        content:
          "Update the status of assigned hostel maintenance jobs and record maintenance notes.",
      },
      { property: "og:title", content: "Assigned Complaints — HostelCare ERP" },
      {
        property: "og:description",
        content: "Work through your assigned hostel maintenance queue.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="staff">
      <AssignedComplaints />
    </RoleGate>
  ),
});

function AssignedComplaints() {
  const { complaints, currentUser, userById, changeStatus, addNote } = useStore();
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"Open" | "Completed">("Open");
  const [noteDrafts, setNoteDrafts] = React.useState<Record<string, string>>({});

  const mine = complaints
    .filter((c) => c.assignedTo === currentUser.id)
    .filter((c) => (tab === "Open" ? c.status !== "Completed" : c.status === "Completed"))
    .filter((c) => {
      const q = query.trim().toLowerCase();
      return !q || [c.id, c.title, c.room, c.category].some((v) => v.toLowerCase().includes(q));
    });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Assigned Complaints"
        description="Update job status and log what was done during the visit."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assigned jobs"
          />
        </div>
        {(["Open", "Completed"] as const).map((t) => (
          <Button
            key={t}
            size="sm"
            className="rounded-full"
            variant={tab === t ? "default" : "outline"}
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {mine.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
            Nothing here right now.
          </div>
        ) : null}

        {mine.map((c) => {
          const student = userById(c.studentId);
          return (
            <div key={c.id} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    to="/complaints/$id"
                    params={{ id: c.id }}
                    className="text-base font-semibold hover:text-primary hover:underline"
                  >
                    {c.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {c.id} · {c.category} · Room {c.room}, {c.hostel} · Reported{" "}
                    {formatDate(c.createdAt)}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{c.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Student: {student?.name} ({student?.studentId}) · {student?.phone}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4">
                <span className="text-sm text-muted-foreground">Update status</span>
                <Select
                  value={c.status}
                  onValueChange={(v) => {
                    changeStatus(c.id, v as Status);
                    toast.success(`${c.id} marked as ${v}`);
                  }}
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 space-y-2">
                {c.notes.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {c.notes.map((n, i) => (
                      <li key={i} className="rounded-md bg-slate-50 px-3 py-2">
                        <span className="font-medium">{n.by}:</span> {n.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Textarea
                  rows={2}
                  placeholder="Add a maintenance note, e.g. Capacitor replaced"
                  value={noteDrafts[c.id] ?? ""}
                  onChange={(e) => setNoteDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const text = (noteDrafts[c.id] ?? "").trim();
                      if (!text) return;
                      addNote(c.id, text);
                      setNoteDrafts((d) => ({ ...d, [c.id]: "" }));
                      toast.success("Maintenance note added");
                    }}
                  >
                    Add note
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
