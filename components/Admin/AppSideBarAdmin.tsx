"use client";

import { 
  LayoutDashboard, 
  Users, 
  Map, 
  CalendarDays, 
  Settings, 
  LogOut, 
  BarChart3,
  Shield,
  Globe
} from "lucide-react"
import { useRouter, usePathname } from 'next/navigation'
import useSession from '@/hooks/useSession'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Admin menu items
const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Trips",
    url: "/dashboard/trips",
    icon: CalendarDays,
  },
  {
    title: "Destinations",
    url: "/dashboard/destinations",
    icon: Map,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  }
]

// Settings and account menu items
const settingsItems = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Security",
    url: "/dashboard/security",
    icon: Shield,
  },
  {
    title: "Back to Site",
    url: "/",
    icon: Globe,
  }
]



interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const AppSideBarAdmin = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useSession();
  
  const handleSignOut = () => {
    signOut();
  };
  
  const isActive = (url: string) => {
    return pathname === url;
  };
  
  return (
    <Sidebar>
      <SidebarContent className="py-2">
        <div className="px-3 py-4">
          <h1 className="text-xl font-bold text-primary">Globetrotter</h1>
          <p className="text-xs text-muted-foreground">Admin Portal</p>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item: MenuItem) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={isActive(item.url) ? 'bg-primary/10 text-primary' : ''}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item: MenuItem) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={isActive(item.url) ? 'bg-primary/10 text-primary' : ''}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Logout button */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="px-3 py-4 mt-auto">
          <div className="text-xs text-muted-foreground">
            <p>© 2025 Globetrotter</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSideBarAdmin







