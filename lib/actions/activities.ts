'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

/**
 * Create a new activity for an itinerary
 */
export async function createActivity(itineraryId: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to create an activity' };
    }
    
    // Verify permission by checking itinerary and trip ownership
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: { trip: true },
    });
    
    if (!itinerary) {
      return { error: 'Itinerary not found' };
    }
    
    if (itinerary.trip.userId !== user.id) {
      return { error: 'You do not have permission to modify this itinerary' };
    }
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || null;
    const startTimeStr = formData.get('startTime') as string || null;
    const endTimeStr = formData.get('endTime') as string || null;
    const location = formData.get('location') as string || null;
    const costStr = formData.get('cost') as string || null;
    
    // Validation
    if (!title) {
      return { error: 'Activity title is required' };
    }
    
    // Process time and cost data
    const startTime = startTimeStr ? new Date(startTimeStr) : null;
    const endTime = endTimeStr ? new Date(endTimeStr) : null;
    const cost = costStr ? parseFloat(costStr) : null;
    
    // Time validation
    if (startTime && endTime && endTime < startTime) {
      return { error: 'End time cannot be before start time' };
    }
    
    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        startTime,
        endTime,
        location,
        cost,
        itineraryId,
      },
    });
    
    const tripId = itinerary.tripId;
    revalidatePath(`/trips/${tripId}/itinerary`);
    return { success: true, activity };
  } catch (error) {
    console.error('Create activity error:', error);
    return { error: 'Failed to create activity' };
  }
}

/**
 * Get all activities for an itinerary
 */
export async function getItineraryActivities(itineraryId: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to view activities' };
    }
    
    // Verify permission by checking itinerary and trip ownership
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: { trip: true },
    });
    
    if (!itinerary) {
      return { error: 'Itinerary not found' };
    }
    
    if (itinerary.trip.userId !== user.id) {
      return { error: 'You do not have permission to view this itinerary' };
    }
    
    const activities = await prisma.activity.findMany({
      where: {
        itineraryId,
      },
      orderBy: [
        { startTime: 'asc' },
        { title: 'asc' },
      ],
    });
    
    return { success: true, activities };
  } catch (error) {
    console.error('Get activities error:', error);
    return { error: 'Failed to fetch activities' };
  }
}

/**
 * Update an activity
 */
export async function updateActivity(activityId: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to update an activity' };
    }
    
    // Verify permission by checking activity, itinerary and trip ownership
    const existingActivity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { itinerary: { include: { trip: true } } },
    });
    
    if (!existingActivity) {
      return { error: 'Activity not found' };
    }
    
    if (existingActivity.itinerary.trip.userId !== user.id) {
      return { error: 'You do not have permission to update this activity' };
    }
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || null;
    const startTimeStr = formData.get('startTime') as string || null;
    const endTimeStr = formData.get('endTime') as string || null;
    const location = formData.get('location') as string || null;
    const costStr = formData.get('cost') as string || null;
    
    // Validation
    if (!title) {
      return { error: 'Activity title is required' };
    }
    
    // Process time and cost data
    const startTime = startTimeStr ? new Date(startTimeStr) : null;
    const endTime = endTimeStr ? new Date(endTimeStr) : null;
    const cost = costStr ? parseFloat(costStr) : null;
    
    // Time validation
    if (startTime && endTime && endTime < startTime) {
      return { error: 'End time cannot be before start time' };
    }
    
    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        title,
        description,
        startTime,
        endTime,
        location,
        cost,
      },
    });
    
    const tripId = existingActivity.itinerary.tripId;
    revalidatePath(`/trips/${tripId}/itinerary`);
    return { success: true, activity: updatedActivity };
  } catch (error) {
    console.error('Update activity error:', error);
    return { error: 'Failed to update activity' };
  }
}

/**
 * Delete an activity
 */
export async function deleteActivity(activityId: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to delete an activity' };
    }
    
    // Verify permission by checking activity, itinerary and trip ownership
    const existingActivity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { itinerary: { include: { trip: true } } },
    });
    
    if (!existingActivity) {
      return { error: 'Activity not found' };
    }
    
    if (existingActivity.itinerary.trip.userId !== user.id) {
      return { error: 'You do not have permission to delete this activity' };
    }
    
    const tripId = existingActivity.itinerary.tripId;
    
    await prisma.activity.delete({
      where: { id: activityId },
    });
    
    revalidatePath(`/trips/${tripId}/itinerary`);
    return { success: true };
  } catch (error) {
    console.error('Delete activity error:', error);
    return { error: 'Failed to delete activity' };
  }
}