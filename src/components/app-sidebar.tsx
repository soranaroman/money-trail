"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Receipt,
  HardHat,
  Car,
  CalendarClock,
  BarChart3,
  Settings,
} from "lucide-react";

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
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clienți", url: "/clienti", icon: Users },
  { title: "Proiecte", url: "/proiecte", icon: FolderOpen },
  { title: "Cheltuieli", url: "/cheltuieli", icon: Receipt },
  { title: "Angajați", url: "/angajati", icon: HardHat },
  { title: "Deplasări", url: "/deplasari", icon: Car },
  { title: "Obligații", url: "/obligatii", icon: CalendarClock },
  { title: "Rapoarte", url: "/rapoarte", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">MoneyTrail</span>
            <span className="text-xs text-sidebar-foreground/70">Gestiune proiecte & marjă</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Module</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={active} render={<Link href={item.url} />}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/setari" />}>
              <Settings className="size-4" />
              <span>Setări</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-3 py-2 text-xs text-muted-foreground border-t">
          <div>Demo interactiv</div>
          <div>Date fictive · fără backend</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
