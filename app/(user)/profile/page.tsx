'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useSession from '@/hooks/useSession';
import { updateUserProfile, getUserDetails } from '@/lib/actions/user';

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, signOut, requireAuth } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  
  // Require authentication for this page
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Fetch extended user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        try {
          setIsLoadingDetails(true);
          const result = await getUserDetails();
          if (result.success && result.user) {
            setUserDetails(result.user);
          }
        } catch (err) {
          console.error("Failed to fetch user details:", err);
        } finally {
          setIsLoadingDetails(false);
        }
      }
    };

    if (user) {
      fetchUserDetails();
    }
  }, [user]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData(event.currentTarget);
      const result = await updateUserProfile(formData);
      
      if (result.success) {
        setSuccess(result.message || 'Profile updated successfully');
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="mb-8 flex flex-col items-center">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={user?.image || ''} />
          <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-medium">{user?.name}</h2>
        <p className="text-muted-foreground">{user?.email}</p>
        
        {userDetails && (
          <div className="mt-4 text-center">
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div className="bg-muted rounded-lg p-3">
                <div className="font-medium">Trips Created</div>
                <div className="text-2xl mt-1">{userDetails._count?.trips || 0}</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="font-medium">Member Since</div>
                <div className="text-sm mt-1">
                  {new Date(userDetails.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoadingDetails && (
          <div className="mt-4 text-sm text-muted-foreground">Loading details...</div>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm">
                {success}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user?.name || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Profile Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                defaultValue={user?.image || ''}
                placeholder="https://example.com/your-image.jpg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter to change password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Leave blank to keep current"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                placeholder="Leave blank to keep current"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}