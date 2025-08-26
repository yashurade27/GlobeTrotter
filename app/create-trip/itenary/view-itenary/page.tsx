'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import useSession from '@/hooks/useSession';
import { getTrip } from '@/lib/actions/trips';

// Define types based on our Prisma schema
type Activity = {
  id: string;
  title: string;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  cost: number | null;
};

type Itinerary = {
  id: string;
  day: number;
  date: string;
  notes: string | null;
  destinationId: string | null;
  destination: {
    name: string;
    country: string;
  } | null;
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
  startDate: string;
  endDate: string;
  budget: number | null;
  imageUrl: string | null;
  destinations: Destination[];
  itineraries: Itinerary[];
};

export default function ViewItineraryPage() {
  const searchParams = useSearchParams();
  const tripId = searchParams?.get('tripId');
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  
  // Import useSession and require authentication for this page
  const { requireAuth, sessionId, isLoading: sessionLoading } = useSession();
  
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  useEffect(() => {
    async function fetchTripData() {
      if (!tripId) {
        setError('Trip ID is missing');
        setLoading(false);
        return;
      }
      
      if (sessionLoading) {
        return;
      }
      
      try {
        // Use the real getTrip server action
        const result = await getTrip(tripId, sessionId ?? undefined);
        
        if (result.error) {
          setError(result.error);
          return;
        }
        
        if (result.trip) {
          // Transform the trip data to match our Trip type
          const transformedTrip: Trip = {
            ...result.trip,
            startDate: new Date(result.trip.startDate).toISOString(),
            endDate: new Date(result.trip.endDate).toISOString(),
            destinations: result.trip.destinations.map(dest => ({
              id: dest.id,
              name: dest.name,
              country: dest.country,
              description: dest.description,
              imageUrl: dest.imageUrl
            })),
            itineraries: result.trip.itineraries.map(itin => ({
              id: itin.id,
              day: itin.day,
              date: new Date(itin.date).toISOString(),
              notes: itin.notes,
              destinationId: itin.destinationId,
              destination: null,
              activities: itin.activities.map(act => ({
                id: act.id,
                title: act.title,
                description: act.description,
                startTime: act.startTime ? new Date(act.startTime).toISOString() : null,
                endTime: act.endTime ? new Date(act.endTime).toISOString() : null,
                location: act.location,
                cost: act.cost
              }))
            }))
          };
          
          setTrip(transformedTrip);
          
          // Set the first day as active by default
          if (transformedTrip.itineraries.length > 0) {
            setActiveDay(transformedTrip.itineraries[0].id);
          }
        } else {
          setTrip(null);
        }
      } catch (err) {
        console.error('Error fetching trip data:', err);
        setError('Failed to load trip data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTripData();
  }, [tripId, sessionId, sessionLoading]);
  
  const getActiveItinerary = () => {
    if (!trip || !activeDay) return null;
    return trip.itineraries.find(itin => itin.id === activeDay) || null;
  };
  
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return format(new Date(timeString), 'h:mm a');
  };
  
  const getCurrentItineraryDates = () => {
    if (!trip) return [];
    
    return trip.itineraries.map(itin => new Date(itin.date));
  };
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading itinerary...</div>;
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
          <Button onClick={() => window.history.back()}>Go Back</Button>
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
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </CardFooter>
      </Card>
    );
  }
  
  const activeItinerary = getActiveItinerary();

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{trip.title}</h1>
        {trip.description && <p className="text-muted-foreground mt-2">{trip.description}</p>}
        <div className="flex items-center gap-2 mt-4">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
          </div>
          {trip.budget && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Budget: ${trip.budget}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Calendar and days list */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip Calendar</CardTitle>
              <CardDescription>Select a day to view activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="multiple"
                selected={getCurrentItineraryDates()}
                onSelect={(dates: Date[] | undefined) => {
                  if (!dates || dates.length === 0) return;

                  // Use the last selected date for active itinerary
                  const selectedDate = dates[dates.length - 1];
                  const dateStr = selectedDate.toISOString().split('T')[0];
                  const matchingItinerary = trip.itineraries.find(
                    itin => itin.date.split('T')[0] === dateStr
                  );

                  if (matchingItinerary) {
                    setActiveDay(matchingItinerary.id);
                  }
                }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Trip Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trip.itineraries
                  .sort((a, b) => a.day - b.day)
                  .map((itin) => (
                    <Button
                      key={itin.id}
                      variant={itin.id === activeDay ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveDay(itin.id)}
                    >
                      <div className="flex justify-between w-full">
                        <span>Day {itin.day}</span>
                        <span className="text-xs opacity-70">
                          {format(new Date(itin.date), 'MMM d')}
                        </span>
                      </div>
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column: Itinerary details */}
        <div className="md:col-span-2">
          {activeItinerary ? (
            <Card>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Day {activeItinerary.day}: {format(new Date(activeItinerary.date), 'EEEE, MMMM d')}</CardTitle>
                    {activeItinerary.destinationId && trip.destinations && (
                      <CardDescription className="mt-1">
                        {trip.destinations.find(d => d.id === activeItinerary.destinationId)?.name}, 
                        {trip.destinations.find(d => d.id === activeItinerary.destinationId)?.country}
                      </CardDescription>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Edit Day
                  </Button>
                </div>
                {activeItinerary.notes && (
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="italic text-sm">{activeItinerary.notes}</p>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Activities</h3>
                {activeItinerary.activities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No activities planned for this day</p>
                ) : (
                  <div className="space-y-4">
                    {activeItinerary.activities
                      .sort((a, b) => {
                        if (!a.startTime) return 1;
                        if (!b.startTime) return -1;
                        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
                      })
                      .map((activity) => (
                        <div key={activity.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{activity.title}</h4>
                            {activity.cost !== null && (
                              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                                ${activity.cost}
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-1 text-sm text-muted-foreground">
                            {activity.startTime && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  {formatTime(activity.startTime)}
                                  {activity.endTime && ` - ${formatTime(activity.endTime)}`}
                                </span>
                              </div>
                            )}
                            
                            {activity.location && (
                              <div className="mt-1">
                                📍 {activity.location}
                              </div>
                            )}
                            
                            {activity.description && (
                              <div className="mt-2">{activity.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                  Back to Trip
                </Button>
                <Button size="sm">Add Activity</Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>Select a day to view itinerary details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
