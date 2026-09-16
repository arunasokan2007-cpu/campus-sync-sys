import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { PriorityBadge, StatusBadge } from "@/components/status";
import type { Complaint } from "@/data/types";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export function ComplaintTable({
  complaints,
  showStudent = false,
  showAssignee = true,
  emptyMessage = "No complaints match the current filters.",
}: {
  complaints: Complaint[];
  showStudent?: boolean;
  showAssignee?: boolean;
  emptyMessage?: string;
}) {
  const { userById } = useStore();

  if (complaints.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Complaint</th>
              {showStudent ? <th className="px-4 py-3 font-medium">Student</th> : null}
              <th className="px-4 py-3 font-medium">Room</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {showAssignee ? <th className="px-4 py-3 font-medium">Assigned to</th> : null}
              <th className="px-4 py-3 font-medium">Reported</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {complaints.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <Link
                    to="/complaints/$id"
                    params={{ id: c.id }}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {c.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{c.id}</p>
                </td>
                {showStudent ? (
                  <td className="px-4 py-3">
                    <p>{userById(c.studentId)?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {userById(c.studentId)?.studentId}
                    </p>
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <p className="font-medium">{c.room}</p>
                  <p className="text-xs text-muted-foreground">{c.hostel}</p>
                </td>
                <td className="px-4 py-3">{c.category}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={c.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                {showAssignee ? (
                  <td className="px-4 py-3">{userById(c.assignedTo)?.name ?? "Unassigned"}</td>
                ) : null}
                <td className="px-4 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to="/complaints/$id"
                    params={{ id: c.id }}
                    className="inline-flex items-center text-primary hover:underline"
                    aria-label={`Open ${c.id}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
