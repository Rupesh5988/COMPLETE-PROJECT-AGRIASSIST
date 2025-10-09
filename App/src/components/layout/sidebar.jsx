"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Bot,
  CloudSun,
  Droplets,
  FlaskConical,
  Landmark,
  Leaf,
  LayoutDashboard,
  LifeBuoy,
  Phone,
  Settings,
  Users,
  Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const SproutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 20h10"/>
        <path d="M10 20c5.5-16 0-16-5-5"/>
        <path d="M14 20c-5.5-16 0-16 5-5"/>
    </svg>
);


export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                <SproutIcon />
            </Button>
          <div className="flex flex-col text-sidebar-foreground">
            <span className="font-headline text-lg font-bold leading-tight">AgriAssist</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Dashboard" isActive>
            <LayoutDashboard />
            Dashboard
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Weather" onClick={() => window.open("http://localhost:5173/", "_blank")}>
            <CloudSun />
            Weather Forecast  
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Weather" onClick={() => window.open("http://localhost:5173/", "_blank")}>
            <CloudSun />
            Weather Advisory  
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Crop Prediction" onClick={() => window.open("http://127.0.0.1:5000", "_blank")}>
            <Leaf />
            Crop Prediction
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Fertilizer" onClick={() => window.open("http://127.0.0.1:5000", "_blank")}>
            <FlaskConical />
            Fertilizer Advisory
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
          <SidebarMenuButton tooltip="Irrigation">
            <Droplets />
            Irrigation Advisory
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
          <SidebarMenuButton tooltip="Alerts">
            <Bell />
            Alert System
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Expert Talk">
            <Phone />
            Expert Talk
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Help">
              <LifeBuoy />
              Help & Support
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
