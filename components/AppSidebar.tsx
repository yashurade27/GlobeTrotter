"use client"
import { 
  Home, 
  Map, 
  PlusCircle, 
  User, 
  Search, 
  Settings, 
  Globe,
  Compass,
  Heart,
  CalendarDays,
  Hotel,
  Plane
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import useSession from "@/hooks/useSession"

// Navigation items for main menu
const mainItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Explore",
    url: "/explore",
    icon: Compass,
  },
  {
    title: "My Trips",
    url: "/trips",
    icon: Map,
  },
  {
    title: "Create Trip",
    url: "/create-trip",
    icon: PlusCircle,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  }
]

// Planning tools
const planningItems = [
  {
    title: "Itinerary Planner",
    url: "/planner",
    icon: CalendarDays,
  },
  {
    title: "Flights",
    url: "/flights",
    icon: Plane,
  },
  {
    title: "Accommodations",
    url: "/accommodations",
    icon: Hotel,
  },
  {
    title: "Saved Places",
    url: "/saved",
    icon: Heart,
  }
]

export function AppSidebar() {
  const { user } = useSession();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
        
        {/* Planning Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Planning Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {planningItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
        
        {/* User Section */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/profile">
                      <User />
                      <span>Profile</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/settings">
                      <Settings />
                      <span>Settings</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2">
          <div className="flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <p className="text-xs text-center mt-2 text-muted-foreground">
            Globetrotter v1.0
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}