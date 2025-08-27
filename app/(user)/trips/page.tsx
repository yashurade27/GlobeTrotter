'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getUserTrips } from '@/lib/actions/trips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import useSession from '@/hooks/useSession';
import SearchAndSort from '@/components/Hero/SearchAndSort';
import { SortOptions, Trip, Destination } from './types';

export default function TripsPage() {
  const router = useRouter();
  const { sessionId, isLoading: sessionLoading, requireAuth } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOptions>("newest");
  
  // Require authentication for this page
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  useEffect(() => {
    async function fetchTrips() {
      if (sessionLoading) return;
      
      if (!sessionId) {
        router.push('/login');
        return;
      }
      
      try {
        const result = await getUserTrips(sessionId);
        
        if (result.error) {
          setError(result.error);
          if (result.error.includes('must be logged in')) {
            router.push('/login');
          }
          return;
        }
        
        setTrips(result.trips || []);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
        setError('Failed to load trips. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTrips();
  }, [sessionId, sessionLoading, router]);  // Function to get destinations as comma-separated string
  const getDestinationsString = (destinations: Destination[]) => {
    if (!destinations.length) return 'No destinations added';
    
    return destinations
      .map(d => d.name)
      .join(', ');
  };
  
  // Function to get a placeholder image if none is provided
  const getTripImage = (trip: Trip) => {
    return trip.imageUrl || '/paris.webp'; // Default image
  };
  
  // Handle search and sorting
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleSort = (option: SortOptions) => {
    setSortOption(option);
  };
  
  // Filter and sort trips
  const filteredTrips = useMemo(() => {
    // First filter by search query
    let result = trips;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = trips.filter(trip => {
        // Search in trip title and description
        const titleMatch = trip.title.toLowerCase().includes(query);
        const descMatch = trip.description?.toLowerCase().includes(query) || false;
        
        // Search in destinations
        const destMatch = trip.destinations.some(dest => {
          return (
            dest.name.toLowerCase().includes(query) ||
            dest.country.toLowerCase().includes(query)
          );
        });
        
        return titleMatch || descMatch || destMatch;
      });
    }
    
    // Then sort
    return [...result].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          // Assuming trips have an implied createdAt order, use ID as proxy
          return b.id.localeCompare(a.id);
        case "oldest":
          return a.id.localeCompare(b.id);
        case "startDate":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case "endDate":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case "budget-high":
          return (b.budget || 0) - (a.budget || 0);
        case "budget-low":
          return (a.budget || 0) - (b.budget || 0);
        case "destinations":
          return b.destinations.length - a.destinations.length;
        default:
          return 0;
      }
    });
  }, [trips, searchQuery, sortOption]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 animate-pulse mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 animate-pulse mb-4 w-1/2" />
                <div className="h-4 bg-gray-200 animate-pulse w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <Link href="/create-trip">
          <Button>Create New Trip</Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <SearchAndSort 
          onSearch={handleSearch}
          onSort={handleSort}
          defaultSearchValue={searchQuery}
          defaultSortOption={sortOption}
        />
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {trips.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl mb-2">You haven't created any trips yet</h3>
          <p className="text-muted-foreground mb-6">
            Get started by creating your first trip
          </p>
          <Link href="/create-trip">
            <Button size="lg">Create Your First Trip</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <h3 className="text-xl mb-2">No matching trips found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <Link href={`/trips/${trip.id}`} key={trip.id}>
                <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                  <div className="relative h-48 w-full">
                    <Image
                      src={getTripImage(trip)}
                      alt={trip.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-1">{trip.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                    </p>
                    {trip.destinations.length > 0 && (
                      <p className="text-sm mt-2">
                        {getDestinationsString(trip.destinations)}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0 flex justify-between">
                    {trip.budget && (
                      <span className="text-sm text-muted-foreground">
                        Budget: ${trip.budget}
                      </span>
                    )}
                    <Button variant="outline" size="sm">View Details</Button>
                  </CardFooter>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}