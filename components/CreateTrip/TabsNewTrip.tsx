"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar, Users, DollarSign, Check, ChevronRight, Loader2 } from "lucide-react"
import { createTrip } from "@/lib/actions/trips";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import useSession from "@/hooks/useSession";

const TabsNewTrip = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { sessionId } = useSession();
  const [activeTab, setActiveTab] = useState("where");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    destination: "",
    locationType: "",
    startDate: "",
    endDate: "",
    duration: "",
    travelers: "",
    travelStyle: "",
    ageGroup: "",
    totalBudget: "",
    currency: "",
    budgetType: ""
  });

  const tabs = [
    { id: "where", label: "Where", icon: MapPin },
    { id: "when", label: "When", icon: Calendar },
    { id: "people", label: "People", icon: Users },
    { id: "budget", label: "Budget", icon: DollarSign }
  ];

  const isTabCompleted = (tabId: string) => {
    switch (tabId) {
      case "where":
        return formData.destination && formData.locationType;
      case "when":
        return formData.startDate && formData.endDate && formData.duration;
      case "people":
        return formData.travelers && formData.travelStyle && formData.ageGroup;
      case "budget":
        return formData.totalBudget && formData.currency && formData.budgetType;
      default:
        return false;
    }
  };

  const allTabsCompleted = tabs.every(tab => isTabCompleted(tab.id));
  const completedTabs = tabs.filter(tab => isTabCompleted(tab.id)).length;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleCreateTrip = async () => {
    try {
      setIsSubmitting(true);
      
      // Create form data from state
      const tripFormData = new FormData();
      
      // Set title from destination
      tripFormData.set('title', `Trip to ${formData.destination}`);
      
      // Create description from collected information
      const description = `A ${formData.duration} ${formData.locationType} trip for ${formData.travelers} ${formData.travelStyle} travelers. Budget: ${formData.totalBudget} ${formData.currency} (${formData.budgetType}).`;
      tripFormData.set('description', description);
      
      // Set dates
      tripFormData.set('startDate', formData.startDate);
      tripFormData.set('endDate', formData.endDate);
      
      // Set budget
      tripFormData.set('budget', formData.totalBudget);
      
      // We could use a destination image based on the location type in the future
      let imageUrl = "";
      switch(formData.locationType) {
        case "city": imageUrl = "/new-york-png-7.webp"; break;
        case "beach": imageUrl = "/dubai.avif"; break;
        case "mountains": imageUrl = "/tokyo.webp"; break;
        default: imageUrl = "/paris.webp";
      }
      tripFormData.set('imageUrl', imageUrl);
      
      // Submit the trip to be created
      const result = await createTrip(tripFormData, sessionId || undefined);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      
      // Show success message
      toast({
        title: "Trip Created!",
        description: "Your new trip has been successfully created.",
        variant: "default",
      });
      
      // Redirect to the new trip's page
      if (result.trip && result.trip.id) {
        // Go to the new trip's detail page
        router.push(`/trips/${result.trip.id}`);
      } else {
        // Fallback to trips list
        router.push('/trips');
      }
      
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Plan Your Perfect Trip</CardTitle>
              <CardDescription>
                Complete all steps to create your personalized travel plan
              </CardDescription>
            </div>
            <div className="text-sm font-medium text-gray-500">
              {completedTabs}/{tabs.length} completed
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedTabs / tabs.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between">
            {tabs.map((tab, index) => (
              <div key={tab.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isTabCompleted(tab.id) 
                    ? 'bg-green-500 text-white' 
                    : activeTab === tab.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {isTabCompleted(tab.id) ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="where" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Choose Your Destination
              </CardTitle>
              <CardDescription>
                Tell us where you'd like to explore and what type of experience you're looking for.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destination" className="text-sm font-medium">
                  Destination *
                </Label>
                <Input
                  id="destination"
                  placeholder="e.g., Paris, Tokyo, New York..."
                  className="w-full"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-type" className="text-sm font-medium">
                  What type of destination? *
                </Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.locationType}
                  onChange={(e) => handleInputChange('locationType', e.target.value)}
                >
                  <option value="">Select destination type</option>
                  <option value="city">City & Urban</option>
                  <option value="beach">Beach & Coastal</option>
                  <option value="mountains">Mountains & Nature</option>
                  <option value="countryside">Countryside & Rural</option>
                  <option value="adventure">Adventure & Outdoors</option>
                </select>
              </div>
              {isTabCompleted("where") && (
                <Button onClick={handleNextTab} className="w-full">
                  Next: Choose Dates <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="when" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Plan Your Dates
              </CardTitle>
              <CardDescription>
                When would you like to travel? Choose your perfect timing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    Departure Date *
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    className="w-full"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    Return Date *
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    className="w-full"
                    value={formData.endDate}
                    min={formData.startDate || undefined}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Trip Duration *
                </Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                >
                  <option value="">Select duration</option>
                  <option value="1-3 days">1-3 days (Weekend getaway)</option>
                  <option value="4-7 days">4-7 days (Short vacation)</option>
                  <option value="1-2 weeks">1-2 weeks (Standard vacation)</option>
                  <option value="2-4 weeks">2-4 weeks (Extended trip)</option>
                  <option value="1+ month">More than a month (Long-term travel)</option>
                </select>
              </div>
              {isTabCompleted("when") && (
                <Button onClick={handleNextTab} className="w-full">
                  Next: Add Travelers <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="people" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Who's Traveling?
              </CardTitle>
              <CardDescription>
                Tell us about your travel companions to personalize your experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="travelers" className="text-sm font-medium">
                  Number of Travelers *
                </Label>
                <Input
                  id="travelers"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="How many people are traveling?"
                  className="w-full"
                  value={formData.travelers}
                  onChange={(e) => handleInputChange('travelers', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="travel-style" className="text-sm font-medium">
                  Travel Group Type *
                </Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.travelStyle}
                  onChange={(e) => handleInputChange('travelStyle', e.target.value)}
                >
                  <option value="">Select group type</option>
                  <option value="solo">Solo Travel</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family with Kids</option>
                  <option value="friends">Friends Group</option>
                  <option value="business">Business Travel</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age-group" className="text-sm font-medium">
                  Primary Age Group *
                </Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.ageGroup}
                  onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                >
                  <option value="">Select age group</option>
                  <option value="18-25">18-25 (Young adults)</option>
                  <option value="26-35">26-35 (Young professionals)</option>
                  <option value="36-50">36-50 (Mid-career)</option>
                  <option value="51-65">51-65 (Pre-retirement)</option>
                  <option value="65+">65+ (Seniors)</option>
                </select>
              </div>
              {isTabCompleted("people") && (
                <Button onClick={handleNextTab} className="w-full">
                  Next: Set Budget <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Set Your Budget
              </CardTitle>
              <CardDescription>
                Help us plan activities and recommendations within your budget range.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total-budget" className="text-sm font-medium">
                    Total Budget *
                  </Label>
                  <Input
                    id="total-budget"
                    type="number"
                    placeholder="Enter your total budget"
                    className="w-full"
                    value={formData.totalBudget}
                    onChange={(e) => handleInputChange('totalBudget', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Currency *
                  </Label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  >
                    <option value="">Select currency</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-type" className="text-sm font-medium">
                  Budget Style *
                </Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.budgetType}
                  onChange={(e) => handleInputChange('budgetType', e.target.value)}
                >
                  <option value="">Select budget style</option>
                  <option value="Budget">Budget Travel (Hostels, local food)</option>
                  <option value="Mid-range">Mid-range (3-star hotels, mix of dining)</option>
                  <option value="Luxury">Luxury (4-5 star hotels, fine dining)</option>
                  <option value="Ultra Luxury">Ultra Luxury (Premium everything)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Trip Button */}
      {allTabsCompleted && (
        <Card className="border-2 border-green-200 bg-green-50 dark:bg-gray-800 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mx-auto">
                <Check className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                  Ready to Create Your Trip!
                </h3>
                <p className="text-green-600 dark:text-green-400 text-sm mb-4">
                  All information collected. Let's build your personalized travel plan.
                </p>
              </div>
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                onClick={handleCreateTrip}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Trip...
                  </>
                ) : (
                  'Build Your Itinerary'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TabsNewTrip;