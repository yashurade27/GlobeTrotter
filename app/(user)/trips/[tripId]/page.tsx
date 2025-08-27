'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTrip, deleteTrip } from '@/lib/actions/trips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, differenceInDays } from 'date-fns';
import useSession from '@/hooks/useSession';
import { 
  CalendarIcon, 
  MapPinIcon, 
  WalletIcon, 
  PencilIcon, 
  TrashIcon,
  ClockIcon,
  PlusIcon
} from 'lucide-react';

// Define types based on our Prisma schema
type Activity = {
  id: string;
  title: string;
  description: string | null;
  startTime: Date | string | null;
  endTime: Date | string | null;
  location: string | null;
  cost: number | null;
};

type Itinerary = {
  id: string;
  day: number;
  date: Date | string;
  notes: string | null;
  destinationId: string | null;
  activities: Activity[];
};

type Destination = {
  id: string;
  name: string;
  country: string;
  description: string | null;
  imageUrl: string | null;
};

type Trip = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date | string;
  endDate: Date | string;
  budget: number | null;
  imageUrl: string | null;
  destinations: Destination[];
  itineraries: Itinerary[];
};

export default function TripDetailPage({ params }: { params: { tripId: string } }) {
  const router = useRouter();
  const { tripId } = params;
  const { sessionId, isLoading: sessionLoading, requireAuth } = useSession();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Require authentication for this page
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  useEffect(() => {
    async function fetchTripData() {
      if (sessionLoading) return;
      
      if (!sessionId) {
        router.push('/login');
        return;
      }
      
      try {
        const result = await getTrip(tripId, sessionId);
        
        if (result.error) {
          setError(result.error);
          if (result.error.includes('must be logged in')) {
            router.push('/login');
          }
          return;
        }
        
        if (result.trip) {
          setTrip(result.trip);
        }
      } catch (err) {
        console.error('Failed to fetch trip details:', err);
        setError('Failed to load trip details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTripData();
  }, [tripId, router, sessionId, sessionLoading]);
  
  const handleDeleteTrip = async () => {
    if (!trip || !sessionId) return;
    
    setIsDeleting(true);
    
    try {
      const result = await deleteTrip(trip.id, sessionId);
      
      if (result.error) {
        setError(result.error);
        setIsDeleting(false);
        return;
      }
      
      router.push('/trips');
      router.refresh();
    } catch (err) {
      console.error('Failed to delete trip:', err);
      setError('Failed to delete trip. Please try again.');
      setIsDeleting(false);
    }
  };
  
  // Calculate trip duration in days
  const getTripDuration = () => {
    if (!trip) return 0;
    
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
    return differenceInDays(end, start) + 1;
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading trip details...</div>;
  }
  
  if (error) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/trips')}>Back to Trips</Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (!trip) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Trip Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested trip could not be found.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/trips')}>Back to Trips</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        {/* Trip Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{trip.title}</h1>
            {trip.description && <p className="text-muted-foreground mt-1">{trip.description}</p>}
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/trips/${trip.id}/edit`}>
              <Button variant="outline" size="sm">
                <PencilIcon className="h-4 w-4 mr-1" /> Edit Trip
              </Button>
            </Link>
            
            {!showDeleteConfirm ? (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                <TrashIcon className="h-4 w-4 mr-1" /> Delete
              </Button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 p-2 rounded-md">
                <span className="text-sm text-red-600">Confirm delete?</span>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleDeleteTrip}
                >
                  {isDeleting ? 'Deleting...' : 'Yes'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  No
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Trip Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center p-4">
              <CalendarIcon className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium">Trip Dates</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <ClockIcon className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {getTripDuration()} days
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <MapPinIcon className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium">Destinations</p>
                <p className="text-sm text-muted-foreground">
                  {trip.destinations.length > 0 
                    ? `${trip.destinations.length} destination${trip.destinations.length > 1 ? 's' : ''}` 
                    : 'No destinations added'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <WalletIcon className="h-5 w-5 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-sm text-muted-foreground">
                  {trip.budget ? `$${trip.budget}` : 'Not specified'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Trip Content Tabs */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trip.imageUrl && (
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src={trip.imageUrl}
                  alt={trip.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                />
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Trip Summary</h2>
              
              <div className="space-y-4">
                {trip.description ? (
                  <p>{trip.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No description provided</p>
                )}
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Destinations</h3>
                  {trip.destinations.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {trip.destinations.map(destination => (
                        <li key={destination.id}>
                          {destination.name}, {destination.country}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">No destinations added yet</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Itinerary Status</h3>
                  {trip.itineraries.length > 0 ? (
                    <p>{trip.itineraries.length} day(s) planned</p>
                  ) : (
                    <p className="text-muted-foreground italic">No itinerary days added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Destinations Tab */}
        <TabsContent value="destinations" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Destinations</h2>
            <Link href={`/trips/${trip.id}/destinations/new`}>
              <Button size="sm">
                <PlusIcon className="h-4 w-4 mr-1" /> Add Destination
              </Button>
            </Link>
          </div>
          
          {trip.destinations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No destinations have been added to this trip yet</p>
                <Link href={`/trips/${trip.id}/destinations/new`}>
                  <Button>Add Your First Destination</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {trip.destinations.map(destination => (
                <Card key={destination.id} className="overflow-hidden">
                  {destination.imageUrl && (
                    <div className="relative h-40 w-full">
                      <Image
                        src={destination.imageUrl}
                        alt={destination.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{destination.name}</CardTitle>
                    <CardDescription>{destination.country}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {destination.description ? (
                      <p className="text-sm line-clamp-3">{destination.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No description</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link href={`/trips/${trip.id}/destinations/${destination.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Itinerary Tab */}
        <TabsContent value="itinerary" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Itinerary</h2>
            <div className="flex gap-2">
              <Link href={`/trips/${trip.id}/itinerary/new`}>
                <Button size="sm">
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Day
                </Button>
              </Link>
              <Link href={`/trips/${trip.id}`}>
                <Button variant="outline" size="sm">
                  View Full Itinerary
                </Button>
              </Link>
            </div>
          </div>
          
          {trip.itineraries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No itinerary days have been planned yet</p>
                <Link href={`/trips/${trip.id}/itinerary/new`}>
                  <Button>Plan Your First Day</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {trip.itineraries
                .sort((a, b) => a.day - b.day)
                .map(day => {
                  // Find the destination for this day if it exists
                  const dayDestination = day.destinationId 
                    ? trip.destinations.find(d => d.id === day.destinationId) 
                    : null;
                    
                  return (
                    <Card key={day.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Day {day.day}: {format(new Date(day.date), 'EEEE, MMMM d')}</CardTitle>
                            {dayDestination && (
                              <CardDescription>{dayDestination.name}, {dayDestination.country}</CardDescription>
                            )}
                          </div>
                          <Link href={`/trips/${trip.id}/itinerary/${day.id}`}>
                            <Button variant="outline" size="sm">Edit</Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {day.notes && <p className="mb-4 italic text-sm">{day.notes}</p>}
                        
                        <h4 className="text-sm font-medium mb-2">Activities:</h4>
                        {day.activities.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No activities planned for this day</p>
                        ) : (
                          <ul className="space-y-2">
                            {day.activities.map(activity => (
                              <li key={activity.id} className="text-sm">
                                <span className="font-medium">{activity.title}</span>
                                {activity.startTime && (
                                  <span className="text-muted-foreground ml-2">
                                    {format(new Date(activity.startTime), 'h:mm a')}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Link href={`/trips/${trip.id}/itinerary/${day.id}/activities/new`}>
                          <Button variant="ghost" size="sm">Add Activity</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}