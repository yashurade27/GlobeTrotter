'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

/**
 * Add a destination to a trip
 */
export async function createDestination(tripId: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to add a destination' };
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
    
    const name = formData.get('name') as string;
    const country = formData.get('country') as string;
    const description = formData.get('description') as string || null;
    const imageUrl = formData.get('imageUrl') as string || null;
    
    // Validation
    if (!name) {
      return { error: 'Destination name is required' };
    }
    
    if (!country) {
      return { error: 'Country is required' };
    }
    
    const destination = await prisma.destination.create({
      data: {
        name,
        country,
        description,
        imageUrl,
        tripId,
      },
    });
    
    revalidatePath(`/trips/${tripId}`);
    return { success: true, destination };
  } catch (error) {
    console.error('Create destination error:', error);
    return { error: 'Failed to add destination' };
  }
}

/**
 * Get all destinations for a trip
 */
export async function getTripDestinations(tripId: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to view destinations' };
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
    
    const destinations = await prisma.destination.findMany({
      where: {
        tripId,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return { success: true, destinations };
  } catch (error) {
    console.error('Get destinations error:', error);
    return { error: 'Failed to fetch destinations' };
  }
}

/**
 * Update a destination
 */
export async function updateDestination(destinationId: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to update a destination' };
    }
    
    // Verify permission
    const existingDestination = await prisma.destination.findUnique({
      where: { id: destinationId },
      include: { trip: true },
    });
    
    if (!existingDestination) {
      return { error: 'Destination not found' };
    }
    
    if (existingDestination.trip.userId !== user.id) {
      return { error: 'You do not have permission to update this destination' };
    }
    
    const name = formData.get('name') as string;
    const country = formData.get('country') as string;
    const description = formData.get('description') as string || null;
    const imageUrl = formData.get('imageUrl') as string || null;
    
    // Validation
    if (!name) {
      return { error: 'Destination name is required' };
    }
    
    if (!country) {
      return { error: 'Country is required' };
    }
    
    const updatedDestination = await prisma.destination.update({
      where: { id: destinationId },
      data: {
        name,
        country,
        description,
        imageUrl,
      },
    });
    
    revalidatePath(`/trips/${existingDestination.tripId}`);
    return { success: true, destination: updatedDestination };
  } catch (error) {
    console.error('Update destination error:', error);
    return { error: 'Failed to update destination' };
  }
}

/**
 * Delete a destination
 */
export async function deleteDestination(destinationId: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: 'You must be logged in to delete a destination' };
    }
    
    // Verify permission
    const existingDestination = await prisma.destination.findUnique({
      where: { id: destinationId },
      include: { trip: true },
    });
    
    if (!existingDestination) {
      return { error: 'Destination not found' };
    }
    
    if (existingDestination.trip.userId !== user.id) {
      return { error: 'You do not have permission to delete this destination' };
    }
    
    const tripId = existingDestination.tripId;
    
    // Check if this destination is linked to any itineraries
    const linkedItineraries = await prisma.itinerary.findMany({
      where: { destinationId },
    });
    
    // Update linked itineraries to remove the destination reference
    if (linkedItineraries.length > 0) {
      await prisma.itinerary.updateMany({
        where: { destinationId },
        data: { destinationId: null },
      });
    }
    
    await prisma.destination.delete({
      where: { id: destinationId },
    });
    
    revalidatePath(`/trips/${tripId}`);
    return { success: true };
  } catch (error) {
    console.error('Delete destination error:', error);
    return { error: 'Failed to delete destination' };
  }
}