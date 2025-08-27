import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/actions/auth";

export const metadata = {
  title: "Globetrotter Admin Dashboard",
  description: "Admin portal for Globetrotter travel platform",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session ID from cookies
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  
  // Verify user is logged in and has admin privileges
  if (!sessionId) {
    redirect('/login');
  }
  
  // Get current user and verify admin role
  const user = await getCurrentUser(sessionId);
  if (!user || (user.role !== 'ADMIN')) {
    redirect('/unauthorized');
  }

  // Just return children - the root layout handles all the UI structure
  return <>{children}</>;
}
