'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';
import * as bcrypt from 'bcrypt';

/**
 * Update the user profile information
 */
export async function updateUserProfile(formData: FormData, sessionId?: string) {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { error: 'You must be logged in to update your profile' };
    }
    
    const name = formData.get('name') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmNewPassword = formData.get('confirmNewPassword') as string;
    
    // Build update data object
    const updateData: any = {};
    
    if (name) {
      updateData.name = name;
    }
    
    if (imageUrl) {
      updateData.image = imageUrl;
    }
    
    // Handle password update if provided
    if (currentPassword && newPassword) {
      // Check passwords match
      if (newPassword !== confirmNewPassword) {
        return { error: 'New passwords do not match' };
      }
      
      // Get current user with password
      const userWithPassword = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true }
      });
      
      if (!userWithPassword) {
        return { error: 'User not found' };
      }
      
      // Verify current password
      const passwordValid = await bcrypt.compare(
        currentPassword,
        userWithPassword.password
      );
      
      if (!passwordValid) {
        return { error: 'Current password is incorrect' };
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }
    
    // Update user if there's anything to update
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
      
      revalidatePath('/profile');
      return { success: true };
    }
    
    return { success: true, message: 'No changes to update' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { error: 'Failed to update profile' };
  }
}

/**
 * Get detailed user information
 */
export async function getUserDetails(sessionId?: string) {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { error: 'Not authenticated' };
    }
    
    // Get user with additional details but without password
    const userDetails = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            trips: true
          }
        }
      }
    });
    
    if (!userDetails) {
      return { error: 'User not found' };
    }
    
    return { success: true, user: userDetails };
  } catch (error) {
    console.error('Get user details error:', error);
    return { error: 'Failed to fetch user details' };
  }
}