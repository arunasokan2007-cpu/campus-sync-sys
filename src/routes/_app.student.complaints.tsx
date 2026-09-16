import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import * as React from "react";

import { ComplaintTable } from "@/components/complaint-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUSES } from "@/data/types";
import type { Status } from "@/data/types";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/routes/_app";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/student/complaints")({
  head: () => ({
    meta: [
      { title: "My Complaints — HostelCare ERP" },
      {
        name: "description",
        content: "Search and filter every maintenance complaint you have raised for your room.",
      },
      { property: "og:title", content: "My Complaints — HostelCare ERP" },
      {
        property: "og:description",
        content: "Search, filter and open your hostel maintenance complaints.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="student">
      <MyComplaints />
    </RoleGate>
  ),
});

function MyComplaints() {
  const { complaints, currentUser } = useStore();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<Status | "All">("All");

  const mine = complaints.filter((c) => c.studentId === currentUser.id);
  const filtered = mine.filter((c) => {
    const matchesStatus = status === "All" || c.status === status;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      [c.id, c.title, c.category, c.room, c.description].some((v) => v.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="My Complaints"
        description={`${mine.length} complaint${mine.length === 1 ? "" : "s"} raised from your account.`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, title, category or room"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", ...STATUSES] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              className={cn("rounded-full")}
              onClick={() => setStatus(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <ComplaintTable complaints={filtered} />
    </div>
  );
}
