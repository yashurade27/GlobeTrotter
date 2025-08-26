'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  createdAt?: string | Date;
};

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // First try to get the sessionId from cookie
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('sessionId='));
        let sessionId = sessionCookie ? sessionCookie.split('=')[1].trim() : null;
        
        // If no cookie, check localStorage as fallback
        if (!sessionId) {
          sessionId = localStorage.getItem('sessionId');
        }
        
        // If we have a sessionId from localStorage but no cookie, set the cookie
        if (sessionId && !sessionCookie) {
          document.cookie = `sessionId=${sessionId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        }
        
        setSessionId(sessionId);
        
        if (!sessionId) {
          setIsLoading(false);
          return;
        }
        
        // Call the server action with the sessionId
        const userData = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`
          },
          body: JSON.stringify({ sessionId }),
        }).then(res => res.json());
        
        if (userData.error) {
          setError(userData.error);
          setIsLoading(false);
          return;
        }
        
        setUser(userData.user);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to authenticate session');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSession();
  }, []);
  
  const signOut = async () => {
    if (sessionId) {
      try {
        // Call API to invalidate session
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`
          },
          body: JSON.stringify({ sessionId }),
        });
        
        // Clear the cookie
        document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Clear localStorage
        localStorage.removeItem('sessionId');
        
        setSessionId(null);
        setUser(null);
        
        // Redirect to login
        router.push('/login');
        router.refresh();
      } catch (err) {
        console.error('Error signing out:', err);
      }
    }
  };
  
  const requireAuth = () => {
    if (!isLoading && !sessionId) {
      router.push('/login');
    }
  };

  return {
    sessionId,
    user,
    isLoading,
    error,
    signOut,
    requireAuth
  };
}

export default useSession;