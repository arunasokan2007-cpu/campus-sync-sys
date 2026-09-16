import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  ClipboardList,
  FilePlus2,
  Gauge,
  LayoutDashboard,
  ListChecks,
  LogIn,
  Users,
  Wrench,
} from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import type { Role } from "@/data/types";
import { timeAgo } from "@/lib/format";
import { useMyNotifications, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const navByRole: Record<Role, { title: string; url: string; icon: typeof Gauge }[]> = {
  student: [
    { title: "Dashboard", url: "/student", icon: LayoutDashboard },
    { title: "Report a Problem", url: "/student/report", icon: FilePlus2 },
    { title: "My Complaints", url: "/student/complaints", icon: ClipboardList },
  ],
  staff: [
    { title: "Dashboard", url: "/staff", icon: LayoutDashboard },
    { title: "Assigned Complaints", url: "/staff/complaints", icon: ListChecks },
  ],
  admin: [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "All Complaints", url: "/admin/complaints", icon: ClipboardList },
    { title: "Students", url: "/admin/students", icon: Users },
    { title: "Maintenance Staff", url: "/admin/staff", icon: Wrench },
    { title: "Staff Performance", url: "/admin/performance", icon: Gauge },
  ],
};

const roleLabels: Record<Role, string> = {
  student: "Student",
  staff: "Maintenance Staff",
  admin: "Administrator",
};

function AppLayout() {
  return (
    <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-50">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="flex-1 px-4 py-6 md:px-8">
              <Outlet />
            </main>
          </div>
        </div>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}

function AppSidebar() {
  const { currentUser } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = navByRole[currentUser.role];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-1 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">HostelCare ERP</p>
            <p className="truncate text-xs text-muted-foreground">Maintenance Desk</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{roleLabels[currentUser.role]}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.url ||
                      (item.url !== "/student" &&
                        item.url !== "/staff" &&
                        item.url !== "/admin" &&
                        pathname.startsWith(item.url))
                    }
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Switch role">
                  <Link to="/">
                    <LogIn className="h-4 w-4" />
                    <span>Switch account</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function TopBar() {
  const { currentUser, users, setCurrentUser, switchRole } = useStore();
  const notifications = useMyNotifications();
  const unread = notifications.filter((n) => !n.read).length;
  const { markRead, markAllRead } = useStore();
  const peers = users.filter((u) => u.role === currentUser.role);

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b bg-white px-4 py-3 md:px-8">
      <SidebarTrigger />
      <div className="mr-auto min-w-0">
        <h2 className="truncate text-sm font-semibold text-foreground">
          Smart Hostel Maintenance &amp; Complaint Management
        </h2>
        <p className="truncate text-xs text-muted-foreground">
          {currentUser.role === "student"
            ? `${currentUser.hostel} · Room ${currentUser.room}`
            : roleLabels[currentUser.role]}
        </p>
      </div>

      <Select value={currentUser.role} onValueChange={(v) => switchRole(v as Role)}>
        <SelectTrigger className="w-[150px]" aria-label="Switch role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="staff">Maintenance Staff</SelectItem>
          <SelectItem value="admin">Administrator</SelectItem>
        </SelectContent>
      </Select>

      {peers.length > 1 ? (
        <Select value={currentUser.id} onValueChange={setCurrentUser}>
          <SelectTrigger className="hidden w-[190px] sm:flex" aria-label="Switch account">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {peers.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unread}
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "block w-full border-b px-4 py-3 text-left last:border-0 hover:bg-slate-50",
                    !n.read && "bg-primary/5",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!n.read ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                    <p className="text-sm font-medium">{n.title}</p>
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {timeAgo(n.at)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {currentUser.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="hidden leading-tight lg:block">
          <p className="text-sm font-medium">{currentUser.name}</p>
          <p className="text-xs text-muted-foreground">{roleLabels[currentUser.role]}</p>
        </div>
      </div>
    </header>
  );
}

export function useRoleGuard(role: Role) {
  const { currentUser, hydrated } = useStore();
  return { allowed: !hydrated || currentUser.role === role, currentUser };
}

export const RoleGate = ({ role, children }: { role: Role; children: React.ReactNode }) => {
  const { allowed, currentUser } = useRoleGuard(role);
  if (allowed) return <>{children}</>;
  const home = currentUser.role === "student" ? "/student" : `/${currentUser.role}`;
  return (
    <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold">Access restricted</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This area is only available to {roleLabels[role].toLowerCase()} accounts.
      </p>
      <Button asChild className="mt-4">
        <Link to={home}>Go to my dashboard</Link>
      </Button>
    </div>
  );
};
