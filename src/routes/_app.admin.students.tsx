import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import * as React from "react";

import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/routes/_app";

export const Route = createFileRoute("/_app/admin/students")({
  head: () => ({
    meta: [
      { title: "Students — HostelCare ERP" },
      {
        name: "description",
        content: "Directory of hostel residents with room allocation and complaint counts.",
      },
      { property: "og:title", content: "Students — HostelCare ERP" },
      {
        property: "og:description",
        content: "Hostel resident directory with rooms and complaint activity.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="admin">
      <StudentsPage />
    </RoleGate>
  ),
});

function StudentsPage() {
  const { users, complaints } = useStore();
  const [query, setQuery] = React.useState("");
  const students = users
    .filter((u) => u.role === "student")
    .filter((u) => {
      const q = query.trim().toLowerCase();
      return (
        !q ||
        [u.name, u.studentId ?? "", u.room ?? "", u.hostel ?? ""].some((v) =>
          v.toLowerCase().includes(q),
        )
      );
    });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Students" description={`${students.length} residents listed.`} />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, ID or room"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Student ID</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Hostel / Block</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Complaints</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s) => {
                const mine = complaints.filter((c) => c.studentId === s.id);
                const open = mine.filter((c) => c.status !== "Completed").length;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">{s.studentId}</td>
                    <td className="px-4 py-3">{s.course}</td>
                    <td className="px-4 py-3">
                      {s.hostel} · {s.block}
                    </td>
                    <td className="px-4 py-3 font-medium">{s.room}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{s.email}</p>
                      <p className="text-xs">{s.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      {mine.length} total
                      <span className="ml-2 text-xs text-amber-700">{open} open</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
