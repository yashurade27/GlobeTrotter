'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

/**
 * Create a new trip
 */
export async function createTrip(formData: FormData, sessionId?: string) {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { error: 'You must be logged in to create a trip' };
    }
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    const budget = parseFloat(formData.get('budget') as string) || null;
    const imageUrl = formData.get('imageUrl') as string || null;
    
    // Validation
    if (!title) {
      return { error: 'Title is required' };
    }
    
    if (endDate < startDate) {
      return { error: 'End date cannot be before start date' };
    }
    
    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        budget,
        imageUrl,
        userId: user.id,
      },
    });
    
    revalidatePath('/trips');
    return { success: true, trip };
  } catch (error) {
    console.error('Create trip error:', error);
    return { error: 'Failed to create trip' };
  }
}

/**
 * Get all trips for the current user
 */
export async function getUserTrips(sessionId?: string) {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { error: 'You must be logged in to view trips' };
    }
    
    const trips = await prisma.trip.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        startDate: 'asc',
      },
      include: {
        destinations: true,
      },
    });
    
    return { success: true, trips };
  } catch (error) {
    console.error('Get trips error:', error);
    return { error: 'Failed to fetch trips' };
  }
}


export async function getTrip(tripId: string, sessionId?: string) {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { error: 'You must be logged in to view trip details' };
    }
    
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        destinations: true,
        itineraries: {
          include: {
            activities: true,
          },
          orderBy: {
            day: 'asc',
          },
        },
      },
    });
    
    if (!trip) {
      return { error: 'Trip not found' };
    }
    
    if (trip.userId !== user.id) {
      return { error: 'You do not have permission to view this trip' };
    }
    
    return { success: true, trip };
  } catch (error) {
    console.error('Get trip error:', error);
    return { error: 'Failed to fetch trip details' };
  }
}

/**
 * Update a trip
 */
export async function updateTrip(tripId: string, formData: FormData, sessionId?: string) {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { error: 'You must be logged in to update a trip' };
    }
    
    // Verify ownership
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
    });
    
    if (!existingTrip) {
      return { error: 'Trip not found' };
    }
    
    if (existingTrip.userId !== user.id) {
      return { error: 'You do not have permission to update this trip' };
    }
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    const budget = parseFloat(formData.get('budget') as string) || null;
    const imageUrl = formData.get('imageUrl') as string || null;
    
    // Validation
    if (!title) {
      return { error: 'Title is required' };
    }
    
    if (endDate < startDate) {
      return { error: 'End date cannot be before start date' };
    }
    
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        title,
        description,
        startDate,
        endDate,
        budget,
        imageUrl,
      },
    });
    
    revalidatePath(`/trips/${tripId}`);
    return { success: true, trip: updatedTrip };
  } catch (error) {
    console.error('Update trip error:', error);
    return { error: 'Failed to update trip' };
  }
}

/**
 * Delete a trip
 */
export async function deleteTrip(tripId: string, sessionId?: string) {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { error: 'You must be logged in to delete a trip' };
    }
    
    // Verify ownership
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
    });
    
    if (!existingTrip) {
      return { error: 'Trip not found' };
    }
    
    if (existingTrip.userId !== user.id) {
      return { error: 'You do not have permission to delete this trip' };
    }
    
    await prisma.trip.delete({
      where: { id: tripId },
    });
    
    revalidatePath('/trips');
    return { success: true };
  } catch (error) {
    console.error('Delete trip error:', error);
    return { error: 'Failed to delete trip' };
  }
}