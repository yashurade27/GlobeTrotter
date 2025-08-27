"use server";

import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "./auth";
import { redis } from "@/lib/redis";
import { success } from "zod";

const prisma = new PrismaClient();

async function isAdmin(sessionId?: string) {
  const user = await getCurrentUser(sessionId);
  return user?.role === "ADMIN";
}

//get all users for Admin Dashboard
export async function getUsers(
  sessionId?: string,
  page: number = 1,
  limit: number = 10,
  searchQuery: string = ""
) {
  try {
    if (!(await isAdmin(sessionId))) {
      return { error: "Unauthorized. Admin access required." };
    }

    //Calculate pagination
    const skip = (page - 1) * limit;

    // Create filter Conditions

    const where = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" as const } },
            { email: { contains: searchQuery, mode: "insensitive" } as const },
          ],
        }
      : {};

    // Get users with pagination

    const users = await prisma.user.findMany({
      where,
      skip,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: {
            trips: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    //Get total count for pagination
    const totalUsers = await prisma.user.count({ where });

    return {
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
  } catch (e) {
    console.error("Get users error:", e);
    return { error: "Failed to fetch users." };
  }
}

export async function toggleUserBan(
  sessionId: string,
  userId: string,
  isBanned: boolean
) {
  try {
    if (!(await isAdmin(sessionId))) {
      return { error: "Unauthorized. Admin access required." };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isBanned },
      select: { id: true, name: true, email: true, isBanned: true },
    });

    if (isBanned) {
      const sessionKeys = await redis.keys(`session:*${userId}`);

      // Delete all user sessions
      if (sessionKeys.length > 0) {
        await Promise.all(sessionKeys.map((key: any) => redis.del(key)));
      }
    }

    return {
      success: true,
      message: `User has been ${isBanned ? "banned" : "unbanned"}.`,
      user,
    };
  } catch (error) {
    console.error("Toggle user ban error:", error);
    return { error: "Failed to update user status." };
  }
}

export async function getDashboardAnalytics(sessionId?: string) {
  try {
    if (!(await isAdmin(sessionId))) {
      return { error: "Unauthorized. Admin access required." };
    }

    //Total Users
    const totalUsers = await prisma.user.count();
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
        },
      },
    });

    //Total Trips
    const totalTrips = await prisma.trip.count();

    //Total Destinations
    const totalDestinations = await prisma.destination.count();

    const popularDestinations = await prisma.destination.groupBy({
      by: ["name", "country"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    });

    // Get monthly user signups (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userSignups = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    return {
      overview: {
        totalUsers,
        newUsersToday,
        totalTrips,
        totalDestinations,
      },
      popularDestinations,
      userSignups
    };
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return { error: "Failed to fetch analytics data." };
  }
}


export async function deleteUser(sessionId: string, userId: string) {
  try {
    if (!(await isAdmin(sessionId))) {
      return { error: "Unauthorized. Admin access required." };
    }

    // Delete user and cascade delete related data if set in Prisma schema
    await prisma.user.delete({
      where: { id: userId },
    });

    // Optionally, clear any sessions related to the deleted user
    const sessionKeys = await redis.keys(`session:*${userId}`);
    if (sessionKeys.length > 0) {
      await Promise.all(sessionKeys.map((key: any) => redis.del(key)));
    }

    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "Failed to delete user." };
  }
}


export default async function changeRole(sessionId: string, userSessionId: string) {
    try {
        if(!await isAdmin(sessionId)){
            return { error: "Unauthorized. Admin access required." };
        }
        const user = await getCurrentUser(userSessionId);
        if(!user){
            return { error: "User not found." };
        }
        const newRole = user.role === "USER" ? "ADMIN" : "USER";
        await prisma.user.update({
            where: { id: user.id },
            data: { role: newRole },
        });
        return { success: true, message: `Role changed to ${newRole}` };

    } catch(e) {
        console.error("Change role error:", e);
        return { error: "Failed to change user role." };
    }
}
