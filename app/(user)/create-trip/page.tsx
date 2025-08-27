"use client";
import TopRegionalCard from "@/components/Hero/TopRegionalCard";
import { topRegionalCardsData } from "../page";
import TabsNewTrip from "@/components/CreateTrip/TabsNewTrip";
import { useEffect } from "react";
import useSession from "@/hooks/useSession";
import { Card, CardContent } from "@/components/ui/card";

const CreateNewTrip = () => {
  const { requireAuth, user, isLoading } = useSession();
  
  // Require authentication for this page
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-8 py-8 min-h-screen max-w-6xl mx-auto">
      {/* Welcome message */}
      {user && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-2">Hello, {user.name || 'Traveler'}!</h1>
            <p className="text-muted-foreground">
              Let's create your next adventure. Follow the steps below to plan your perfect trip.
            </p>
          </CardContent>
        </Card>
      )}
      
      <div className="w-full">
        {/* Trip creation form */}
        <TabsNewTrip />
      </div>

      {/* Suggestion for Places to Visit */}
      <div className="flex flex-col gap-4 mt-8">
        <h1 className="text-xl font-semibold">
          Popular Destinations to Consider
        </h1>
        <TopRegionalCard items={topRegionalCardsData} />
      </div>
    </div>
  );
};

export default CreateNewTrip;