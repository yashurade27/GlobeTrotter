"use client";
import { Moon, Sun, User, LogOut, Home, PlusCircle, Map } from "lucide-react";
import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import useSession from "@/hooks/useSession";

const Navbar = () => {
  const path = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { user, isLoading, signOut } = useSession();

  // Generate breadcrumbs based on the current path
  const generateBreadcrumbs = () => {
    if (path === "/") return null;
    
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
      // Create the path for this breadcrumb
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      
      // Format the display text
      let displayText = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Handle dynamic segments (those in [brackets])
      if (segment.startsWith('[') && segment.endsWith(']')) {
        displayText = segment.slice(1, -1).charAt(0).toUpperCase() + segment.slice(2, -1);
      }
      
      return { href, displayText };
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex items-center justify-between p-4 sticky top-0 z-40 bg-background border-b">
      <div className="gap-4 flex items-center">
        <SidebarTrigger />
        <Link href="/">
          <h1 className="text-md font-bold hover:text-primary cursor-pointer">GlobeTrotter</h1>
        </Link>
      </div>
      <div>
        {breadcrumbs && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i === breadcrumbs.length - 1 ? (
                    <BreadcrumbItem>
                      <BreadcrumbPage>{crumb.displayText}</BreadcrumbPage>
                    </BreadcrumbItem>
                  ) : (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink href={crumb.href}>{crumb.displayText}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        {isLoading ? (
          <Avatar>
            <AvatarFallback>...</AvatarFallback>
          </Avatar>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src={user.image || ''} />
                <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer w-full flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trips" className="cursor-pointer w-full flex items-center">
                    <Map className="mr-2 h-4 w-4" />
                    <span>My Trips</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/create-trip" className="cursor-pointer w-full flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Create Trip</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={signOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
