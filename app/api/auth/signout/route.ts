import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/lib/actions/auth";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "No session ID provided" },
        { status: 400 }
      );
    }
    
    const result = await signOut(sessionId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in signout API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}