'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

/**
 * Create a new itinerary for a trip
 */
export async function createItinerary(tripId: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to create an itinerary' };
    }
    
    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });
    
    if (!trip) {
      return { error: 'Trip not found' };
    }
    
    if (trip.userId !== user.id) {
      return { error: 'You do not have permission to modify this trip' };
    }
    
    const day = parseInt(formData.get('day') as string);
    const date = new Date(formData.get('date') as string);
    const notes = formData.get('notes') as string || null;
    const destinationId = formData.get('destinationId') as string || null;
    
    // Validation
    if (isNaN(day) || day < 1) {
      return { error: 'Valid day number is required' };
    }
    
    // Check if destination exists and belongs to this trip
    if (destinationId) {
      const destination = await prisma.destination.findUnique({
        where: { id: destinationId },
      });
      
      if (!destination || destination.tripId !== tripId) {
        return { error: 'Invalid destination selected' };
      }
    }
    
    // Check if an itinerary for this day already exists
    const existingItinerary = await prisma.itinerary.findFirst({
      where: {
        tripId,
        day,
      },
    });
    
    if (existingItinerary) {
      return { error: `An itinerary for day ${day} already exists` };
    }
    
    const itinerary = await prisma.itinerary.create({
      data: {
        day,
        date,
        notes,
        tripId,
        destinationId,
      },
    });
    
    revalidatePath(`/trips/${tripId}/itinerary`);
    return { success: true, itinerary };
  } catch (error) {
    console.error('Create itinerary error:', error);
    return { error: 'Failed to create itinerary' };
  }
}

/**
 * Get all itineraries for a trip
 */
export async function getTripItineraries(tripId: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to view itineraries' };
    }
    
    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });
    
    if (!trip) {
      return { error: 'Trip not found' };
    }
    
    if (trip.userId !== user.id) {
      return { error: 'You do not have permission to view this trip' };
    }
    
    const itineraries = await prisma.itinerary.findMany({
      where: {
        tripId,
      },
      orderBy: {
        day: 'asc',
      },
      include: {
        destination: true,
        activities: true,
      },
    });
    
    return { success: true, itineraries };
  } catch (error) {
    console.error('Get itineraries error:', error);
    return { error: 'Failed to fetch itineraries' };
  }
}

/**
 * Update an itinerary
 */
export async function updateItinerary(itineraryId: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to update an itinerary' };
    }
    
    // Verify permission
    const existingItinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: { trip: true },
    });
    
    if (!existingItinerary) {
      return { error: 'Itinerary not found' };
    }
    
    if (existingItinerary.trip.userId !== user.id) {
      return { error: 'You do not have permission to update this itinerary' };
    }
    
    const day = parseInt(formData.get('day') as string);
    const date = new Date(formData.get('date') as string);
    const notes = formData.get('notes') as string || null;
    const destinationId = formData.get('destinationId') as string || null;
    
    // Validation
    if (isNaN(day) || day < 1) {
      return { error: 'Valid day number is required' };
    }
    
    // Check if destination exists and belongs to this trip
    if (destinationId) {
      const destination = await prisma.destination.findUnique({
        where: { id: destinationId },
      });
      
      if (!destination || destination.tripId !== existingItinerary.tripId) {
        return { error: 'Invalid destination selected' };
      }
    }
    
    // Check for day number conflicts (only if day number is changing)
    if (day !== existingItinerary.day) {
      const conflictingItinerary = await prisma.itinerary.findFirst({
        where: {
          tripId: existingItinerary.tripId,
          day,
          id: { not: itineraryId },
        },
      });
      
      if (conflictingItinerary) {
        return { error: `An itinerary for day ${day} already exists` };
      }
    }
    
    const updatedItinerary = await prisma.itinerary.update({
      where: { id: itineraryId },
      data: {
        day,
        date,
        notes,
        destinationId,
      },
    });
    
    revalidatePath(`/trips/${existingItinerary.tripId}/itinerary`);
    return { success: true, itinerary: updatedItinerary };
  } catch (error) {
    console.error('Update itinerary error:', error);
    return { error: 'Failed to update itinerary' };
  }
}

/**
 * Delete an itinerary
 */
export async function deleteItinerary(itineraryId: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to delete an itinerary' };
    }
    
    // Verify permission
    const existingItinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: { trip: true },
    });
    
    if (!existingItinerary) {
      return { error: 'Itinerary not found' };
    }
    
    if (existingItinerary.trip.userId !== user.id) {
      return { error: 'You do not have permission to delete this itinerary' };
    }
    
    const tripId = existingItinerary.tripId;
    
    await prisma.itinerary.delete({
      where: { id: itineraryId },
    });
    
    revalidatePath(`/trips/${tripId}/itinerary`);
    return { success: true };
  } catch (error) {
    console.error('Delete itinerary error:', error);
    return { error: 'Failed to delete itinerary' };
  }
}