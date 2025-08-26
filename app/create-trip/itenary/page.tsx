"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, List, Plus, Clock, MapPin, DollarSign, Trash2 } from "lucide-react";
import Link from "next/link";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  cost: number;
}

interface Day {
  id: string;
  date: string;
  city: string;
  activities: Activity[];
}

const localizer = momentLocalizer(moment);

const Itinerary = () => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [days, setDays] = useState<Day[]>([
    {
      id: '1',
      date: '2024-03-15',
      city: 'Paris',
      activities: [
        {
          id: '1',
          time: '09:00',
          title: 'Visit Eiffel Tower',
          location: 'Champ de Mars, Paris',
          description: 'Iconic landmark with stunning city views',
          cost: 25
        },
        {
          id: '2',
          time: '14:00',
          title: 'Lunch at Local Bistro',
          location: 'Le Comptoir du Relais',
          description: 'Traditional French cuisine experience',
          cost: 45
        }
      ]
    }
  ]);

  const addNewDay = () => {
    const newDay: Day = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      city: '',
      activities: []
    };
    setDays([...days, newDay]);
  };

  const addActivity = (dayId: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      time: '09:00',
      title: '',
      location: '',
      description: '',
      cost: 0
    };
    
    setDays(days.map(day => 
      day.id === dayId 
        ? { ...day, activities: [...day.activities, newActivity] }
        : day
    ));
  };

  const updateDay = (dayId: string, field: keyof Day, value: string) => {
    setDays(days.map(day => 
      day.id === dayId ? { ...day, [field]: value } : day
    ));
  };

  const updateActivity = (dayId: string, activityId: string, field: keyof Activity, value: string | number) => {
    setDays(days.map(day => 
      day.id === dayId 
        ? {
            ...day, 
            activities: day.activities.map(activity => 
              activity.id === activityId ? { ...activity, [field]: value } : activity
            )
          }
        : day
    ));
  };

  const deleteActivity = (dayId: string, activityId: string) => {
    setDays(days.map(day => 
      day.id === dayId 
        ? { ...day, activities: day.activities.filter(activity => activity.id !== activityId) }
        : day
    ));
  };

  const deleteDay = (dayId: string) => {
    setDays(days.filter(day => day.id !== dayId));
  };

  const getTotalCost = () => {
    return days.reduce((total, day) => 
      total + day.activities.reduce((dayTotal, activity) => dayTotal + activity.cost, 0), 0
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Prepare events for calendar
  const events = days.flatMap(day =>
    day.activities
      .filter(act => act.title.trim() !== '') // Only show activities with titles
      .map(act => {
        const start = new Date(`${day.date}T${act.time}`);
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // assume 2h activity
        return {
          id: act.id,
          title: act.title,
          start,
          end,
          resource: {
            city: day.city,
            cost: act.cost,
            location: act.location
          }
        };
      })
  );

  // Custom calendar styles for dark mode
  const calendarStyles = {
    height: 600,
    fontFamily: 'inherit',
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 mt-8 mb-8">
      {/* Clean monochrome calendar styles */}
      <style jsx global>{`
        .rbc-calendar {
          background-color: transparent !important;
          color: inherit !important;
        }
        
        .dark .rbc-calendar {
          color: rgb(243 244 246) !important;
        }
        
        .rbc-header {
          background-color: rgb(255 255 255) !important;
          border-color: rgb(229 231 235) !important;
          color: rgb(17 24 39) !important;
          font-weight: 500 !important;
          padding: 12px 8px !important;
        }
        
        .dark .rbc-header {
          background-color: rgb(17 24 39) !important;
          border-color: rgb(75 85 99) !important;
          color: rgb(243 244 246) !important;
        }
        
        .rbc-month-view, .rbc-time-view {
          border-color: rgb(229 231 235) !important;
        }
        
        .dark .rbc-month-view, .dark .rbc-time-view {
          border-color: rgb(75 85 99) !important;
        }
        
        .rbc-day-bg {
          background-color: white !important;
          border-color: rgb(229 231 235) !important;
        }
        
        .dark .rbc-day-bg {
          background-color: rgb(17 24 39) !important;
          border-color: rgb(75 85 99) !important;
        }
        
        .rbc-today {
          background-color: rgb(249 250 251) !important;
        }
        
        .dark .rbc-today {
          background-color: rgb(31 41 55) !important;
        }
        
        .rbc-off-range-bg {
          background-color: rgb(249 250 251) !important;
        }
        
        .dark .rbc-off-range-bg {
          background-color: rgb(31 41 55) !important;
        }
        
        .rbc-date-cell {
          padding: 8px !important;
          color: rgb(17 24 39) !important;
        }
        
        .dark .rbc-date-cell {
          color: rgb(243 244 246) !important;
        }
        
        .rbc-off-range {
          color: rgb(156 163 175) !important;
        }
        
        .dark .rbc-off-range {
          color: rgb(107 114 128) !important;
        }
        
        .rbc-event {
          background-color: rgb(17 24 39) !important;
          border-color: rgb(55 65 81) !important;
          color: white !important;
          border-radius: 4px !important;
          padding: 2px 6px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
        }
        
        .dark .rbc-event {
          background-color: rgb(243 244 246) !important;
          border-color: rgb(229 231 235) !important;
          color: rgb(17 24 39) !important;
        }
        
        .rbc-event:hover {
          background-color: rgb(55 65 81) !important;
        }
        
        .dark .rbc-event:hover {
          background-color: rgb(229 231 235) !important;
        }
        
        .rbc-button-link {
          color: rgb(75 85 99) !important;
          text-decoration: none !important;
        }
        
        .dark .rbc-button-link {
          color: rgb(156 163 175) !important;
        }
        
        .rbc-toolbar {
          margin-bottom: 20px !important;
          padding: 0 !important;
        }
        
        .rbc-toolbar button {
          background-color: white !important;
          border: 1px solid rgb(209 213 219) !important;
          color: rgb(17 24 39) !important;
          padding: 8px 16px !important;
          border-radius: 6px !important;
          font-weight: 500 !important;
          margin: 0 2px !important;
        }
        
        .dark .rbc-toolbar button {
          background-color: rgb(17 24 39) !important;
          border-color: rgb(75 85 99) !important;
          color: rgb(243 244 246) !important;
        }
        
        .rbc-toolbar button:hover {
          background-color: rgb(249 250 251) !important;
        }
        
        .dark .rbc-toolbar button:hover {
          background-color: rgb(31 41 55) !important;
        }
        
        .rbc-toolbar button.rbc-active {
          background-color: rgb(17 24 39) !important;
          color: white !important;
          border-color: rgb(55 65 81) !important;
        }
        
        .dark .rbc-toolbar button.rbc-active {
          background-color: rgb(243 244 246) !important;
          color: rgb(17 24 39) !important;
          border-color: rgb(229 231 235) !important;
        }
        
        .rbc-toolbar-label {
          color: rgb(17 24 39) !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          margin: 0 20px !important;
        }
        
        .dark .rbc-toolbar-label {
          color: rgb(243 244 246) !important;
        }
      `}</style>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Trip Itinerary
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Plan and organize your travel activities
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4 text-blue-500" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-green-500" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border border-gray-300 dark:border-gray-600 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {days.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Days Planned</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {days.reduce((total, day) => total + day.activities.length, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Activities</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                ${getTotalCost()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Budget</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List / Calendar Toggle */}
      {viewMode === "list" ? (
        <div className="space-y-6">
          {days.length === 0 ? (
            <Card className="border border-gray-300 dark:border-gray-600">
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No days planned yet</h3>
                  <p className="mb-4">Start planning your trip by adding your first day</p>
                  <Button
                    onClick={addNewDay}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-blue-500" />
                    Add First Day
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            days.map((day, dayIndex) => (
              <Card key={day.id} className="border border-gray-300 dark:border-gray-600">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Day {dayIndex + 1}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          type="date"
                          value={day.date}
                          onChange={(e) => updateDay(day.id, 'date', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          placeholder="City/Location"
                          value={day.city}
                          onChange={(e) => updateDay(day.id, 'city', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      {day.date && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(day.date)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addActivity(day.id)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4 text-blue-500" />
                        Add Activity
                      </Button>
                      {days.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteDay(day.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {day.activities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No activities planned for this day</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addActivity(day.id)}
                          className="mt-3"
                        >
                          <Plus className="w-4 h-4 mr-2 text-blue-500" />
                          Add First Activity
                        </Button>
                      </div>
                    ) : (
                      day.activities.map((activity) => (
                        <div key={activity.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <Input
                                  type="time"
                                  value={activity.time}
                                  onChange={(e) => updateActivity(day.id, activity.id, 'time', e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                              <Input
                                placeholder="Activity title"
                                value={activity.title}
                                onChange={(e) => updateActivity(day.id, activity.id, 'title', e.target.value)}
                                className="text-sm font-medium"
                              />
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <Input
                                  type="number"
                                  placeholder="Cost"
                                  value={activity.cost || ''}
                                  onChange={(e) => updateActivity(day.id, activity.id, 'cost', parseFloat(e.target.value) || 0)}
                                  className="text-sm"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteActivity(day.id, activity.id)}
                              className="ml-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-purple-500" />
                              <Input
                                placeholder="Location/Address"
                                value={activity.location}
                                onChange={(e) => updateActivity(day.id, activity.id, 'location', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <Textarea
                              placeholder="Activity description or notes"
                              value={activity.description}
                              onChange={(e) => updateActivity(day.id, activity.id, 'description', e.target.value)}
                              className="text-sm resize-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card className="border border-gray-300 dark:border-gray-600">
          <CardContent className="pt-6">
            <div className="h-[600px]">
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={calendarStyles}
                views={['month', 'week', 'day']}
                defaultView="month"
                popup
                tooltipAccessor="title"
                eventPropGetter={() => ({
                  style: {
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Day + View Itinerary */}
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button
          onClick={addNewDay}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-blue-500" />
          Add Another Day
        </Button>
        <Link href="/create-trip/itenary/view-itenary">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
            View Your Itinerary
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Itinerary;