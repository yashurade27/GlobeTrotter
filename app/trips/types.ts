// Define types based on our Prisma schema
export type Destination = {
  id: string;
  name: string;
  country: string;
  description?: string | null;
  imageUrl?: string | null;
};

export type Trip = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date | string;
  endDate: Date | string;
  budget: number | null;
  imageUrl: string | null;
  destinations: Destination[];
};

export type Activity = {
  id: string;
  title: string;
  description: string | null;
  startTime: Date | string | null;
  endTime: Date | string | null;
  location: string | null;
  cost: number | null;
};

export type Itinerary = {
  id: string;
  day: number;
  date: Date | string;
  notes: string | null;
  destinationId: string | null;
  activities: Activity[];
};

export type TripWithItineraries = Trip & {
  itineraries: Itinerary[];
};

export type SortOptions = 
  | 'newest' 
  | 'oldest'
  | 'startDate' 
  | 'endDate' 
  | 'budget-high'
  | 'budget-low'
  | 'destinations';