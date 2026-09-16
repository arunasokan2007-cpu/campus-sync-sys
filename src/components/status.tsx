import { CheckCircle2, Clock, Loader2, UserCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/data/types";

const statusStyles: Record<Status, string> = {
  Pending: "bg-amber-100 text-amber-800 ring-amber-200",
  Assigned: "bg-sky-100 text-sky-800 ring-sky-200",
  "In Progress": "bg-indigo-100 text-indigo-800 ring-indigo-200",
  Completed: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

export const statusIcons: Record<Status, typeof Clock> = {
  Pending: Clock,
  Assigned: UserCheck,
  "In Progress": Loader2,
  Completed: CheckCircle2,
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const Icon = statusIcons[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        statusStyles[status],
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

const priorityStyles: Record<Priority, string> = {
  Low: "bg-slate-100 text-slate-700 ring-slate-200",
  Medium: "bg-orange-100 text-orange-800 ring-orange-200",
  High: "bg-red-100 text-red-700 ring-red-200",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        priorityStyles[priority],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}
