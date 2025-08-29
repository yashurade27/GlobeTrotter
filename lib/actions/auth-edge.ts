"use server";

import { PrismaClient } from "@prisma/client";
import { edgeRedis } from '@/lib/edge-redis';

const prisma = new PrismaClient();

// Edge-compatible version of getCurrentUser for middleware
export async function getCurrentUserEdge(sessionId?: string) {
  try {
    // Validate sessionId
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      console.log('getCurrentUserEdge: No valid sessionId provided');
      return null;
    }
    
    // Get user ID from Redis session using edge client
    const userId = await edgeRedis.get(`session:${sessionId}`);
    
    if (!userId || typeof userId !== 'string') {
      console.log('getCurrentUserEdge: No valid userId found in Redis for session:', sessionId);
      return null;
    }
    
    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log('getCurrentUserEdge: User not found in database:', userId);
      return null;
    }

    // Check if user is banned
    if (user.isBanned) {
      console.log('getCurrentUserEdge: User is banned:', user.email);
      // Optionally, you could delete the session here
      // await edgeRedis.del(`session:${sessionId}`);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Get current user edge error:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// Edge-compatible sign out function
export async function signOutEdge(sessionId: string) {
  try {
    if (!sessionId || typeof sessionId !== 'string') {
      return { success: false, error: 'Invalid session ID' };
    }

    // Delete session from Redis
    const result = await edgeRedis.del(`session:${sessionId}`);
    
    return { 
      success: true, 
      message: 'Signed out successfully',
      deleted: result > 0 
    };
  } catch (error) {
    console.error('Edge sign out error:', error);
    return { success: false, error: 'Failed to sign out' };
  }
}

// Edge-compatible session validation
export async function validateSessionEdge(sessionId?: string) {
  try {
    if (!sessionId) {
      return { isValid: false, user: null };
    }

    const user = await getCurrentUserEdge(sessionId);
    
    return { 
      isValid: !!user, 
      user,
      isBanned: user?.isBanned || false,
      isAdmin: user?.role === 'ADMIN' || false
    };
  } catch (error) {
    console.error('Edge session validation error:', error);
    return { isValid: false, user: null };
  }
}