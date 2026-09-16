import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PriorityBadge, StatusBadge, statusIcons } from "@/components/status";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { STATUSES } from "@/data/types";
import type { Status } from "@/data/types";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/complaints/$id")({
  head: () => ({
    meta: [
      { title: "Complaint Details — HostelCare ERP" },
      {
        name: "description",
        content:
          "Full complaint history: status timeline, student details, photos and the maintenance log.",
      },
      { property: "og:title", content: "Complaint Details — HostelCare ERP" },
      {
        property: "og:description",
        content: "Status timeline, student details and maintenance log for a hostel complaint.",
      },
    ],
  }),
  component: ComplaintDetails,
});

function ComplaintDetails() {
  const { id } = useParams({ from: "/_app/complaints/$id" });
  const { complaints, users, userById, currentUser, changeStatus, assignStaff, addNote } =
    useStore();
  const [note, setNote] = React.useState("");

  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold">Complaint not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The complaint {id} does not exist in this workspace.
        </p>
      </div>
    );
  }

  const student = userById(complaint.studentId);
  const assignee = userById(complaint.assignedTo);
  const staffList = users.filter((u) => u.role === "staff");
  const canManage = currentUser.role === "admin" || complaint.assignedTo === currentUser.id;
  const reachedIndex = STATUSES.indexOf(complaint.status);

  const backTo =
    currentUser.role === "admin"
      ? "/admin/complaints"
      : currentUser.role === "staff"
        ? "/staff/complaints"
        : "/student/complaints";

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to={backTo}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to complaints
      </Link>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {complaint.id}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{complaint.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {complaint.category} · Room {complaint.room}, Block {complaint.block},{" "}
              {complaint.hostel}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-foreground">{complaint.description}</p>

        {complaint.photos.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {complaint.photos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Complaint photo ${i + 1}`}
                className="h-32 w-44 rounded-lg border object-cover"
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Status timeline
            </h2>
            <ol className="mt-5 space-y-6">
              {STATUSES.map((s, i) => {
                const event = [...complaint.timeline].reverse().find((t) => t.status === s);
                const done = i <= reachedIndex;
                const Icon = statusIcons[s];
                return (
                  <li key={s} className="relative flex gap-4">
                    {i < STATUSES.length - 1 ? (
                      <span
                        className={cn(
                          "absolute left-[15px] top-8 h-full w-0.5",
                          done ? "bg-primary/40" : "bg-slate-200",
                        )}
                      />
                    ) : null}
                    <span
                      className={cn(
                        "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                        done
                          ? "bg-primary text-primary-foreground"
                          : "bg-slate-100 text-slate-400",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="pb-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          done ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {s}
                      </p>
                      {event ? (
                        <>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(event.at)} · by {event.by}
                          </p>
                          {event.note ? (
                            <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>
                          ) : null}
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">Not reached yet</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Maintenance log
            </h2>
            {complaint.notes.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No maintenance notes yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {complaint.notes.map((n, i) => (
                  <li key={i} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <p>{n.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.by} · {formatDateTime(n.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {canManage ? (
              <div className="mt-4 space-y-2 border-t pt-4">
                <Textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a maintenance note, e.g. Capacitor replaced"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!note.trim()) return;
                      addNote(complaint.id, note.trim());
                      setNote("");
                      toast.success("Note added");
                    }}
                  >
                    Add note
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Student details
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Name", student?.name],
                ["Student ID", student?.studentId],
                ["Course", student?.course],
                ["Hostel", student?.hostel],
                ["Room", `${complaint.room} (Block ${complaint.block})`],
                ["Phone", student?.phone],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b pb-2 last:border-0">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value ?? "—"}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Assignment
            </h2>
            <p className="mt-3 text-sm">
              <span className="text-muted-foreground">Assigned to: </span>
              <span className="font-medium">{assignee?.name ?? "Unassigned"}</span>
            </p>

            {currentUser.role === "admin" ? (
              <div className="mt-4 space-y-3">
                <Select
                  value={complaint.assignedTo ?? ""}
                  onValueChange={(v) => {
                    assignStaff(complaint.id, v);
                    toast.success("Staff assigned");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign maintenance staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} · {s.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {canManage ? (
              <div className="mt-4">
                <p className="mb-2 text-sm text-muted-foreground">Update status</p>
                <Select
                  value={complaint.status}
                  onValueChange={(v) => {
                    changeStatus(complaint.id, v as Status);
                    toast.success(`Status set to ${v}`);
                  }}
                >
                  <SelectTrigger>
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
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
