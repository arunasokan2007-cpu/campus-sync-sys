import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ImagePlus, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, PRIORITIES } from "@/data/types";
import type { Category, Priority } from "@/data/types";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/routes/_app";

export const Route = createFileRoute("/_app/student/report")({
  head: () => ({
    meta: [
      { title: "Report a Problem — HostelCare ERP" },
      {
        name: "description",
        content:
          "Raise a hostel maintenance complaint with category, priority, room number and photos.",
      },
      { property: "og:title", content: "Report a Problem — HostelCare ERP" },
      {
        property: "og:description",
        content: "Submit a new hostel room maintenance complaint in under a minute.",
      },
    ],
  }),
  component: () => (
    <RoleGate role="student">
      <ReportForm />
    </RoleGate>
  ),
});

function ReportForm() {
  const { currentUser, complaints, createComplaint, nextComplaintId } = useStore();
  const navigate = useNavigate();

  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<Category | "">("");
  const [room, setRoom] = React.useState(currentUser.room ?? "");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<Priority>("Medium");
  const [photos, setPhotos] = React.useState<string[]>([]);

  React.useEffect(() => {
    setRoom(currentUser.room ?? "");
  }, [currentUser.room]);

  const duplicate = complaints.find(
    (c) =>
      c.status !== "Completed" &&
      c.room.toLowerCase() === room.trim().toLowerCase() &&
      c.category === category,
  );

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .slice(0, 3)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => setPhotos((p) => [...p, String(reader.result)].slice(0, 3));
        reader.readAsDataURL(file);
      });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category || !room.trim() || !description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const complaint = createComplaint({
      title: title.trim(),
      category,
      room: room.trim().toUpperCase(),
      description: description.trim(),
      priority,
      photos,
    });
    toast.success(`Complaint ${complaint.id} submitted`, {
      description: "The hostel office has been notified.",
    });
    void navigate({ to: "/complaints/$id", params: { id: complaint.id } });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Report a Problem"
        description={`Your complaint will be registered as ${nextComplaintId()}.`}
      />

      <form onSubmit={submit} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="title">Complaint title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ceiling fan making loud noise"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Room number *</Label>
            <Input
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. A-204"
            />
          </div>
        </div>

        {duplicate ? (
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Possible duplicate complaint</p>
              <p className="mt-1">
                {duplicate.id} — &ldquo;{duplicate.title}&rdquo; for room {duplicate.room} (
                {duplicate.category}) is still open with status {duplicate.status}. You can still
                submit if this is a different issue.
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem, when it started and any troubleshooting you tried."
          />
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <Button
                key={p}
                type="button"
                variant={priority === p ? "default" : "outline"}
                onClick={() => setPriority(p)}
                className="rounded-full"
                size="sm"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photos">Photos (optional, up to 3)</Label>
          <label
            htmlFor="photos"
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground hover:bg-slate-50"
          >
            <ImagePlus className="h-5 w-5" />
            Click to upload photos of the issue
          </label>
          <input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          {photos.length > 0 ? (
            <div className="flex flex-wrap gap-3 pt-2">
              {photos.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
                    alt={`Complaint photo ${i + 1}`}
                    className="h-24 w-32 rounded-lg border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow ring-1 ring-border"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => void navigate({ to: "/student" })}>
            Cancel
          </Button>
          <Button type="submit">Submit complaint</Button>
        </div>
      </form>
    </div>
  );
}
