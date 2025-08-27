"use client";
import ImageCarousel from "@/components/Hero/ImageCarousel";
import SearchAndSort from "@/components/Hero/SearchAndSort";
import TopRegionalCard from "@/components/Hero/TopRegionalCard";

export const topRegionalCardsData = [
  {
    title: "Europe",
    description: "Explore the rich history and culture of Europe.",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    actionUrl: "/explore/europe",
  },
  {
    title: "Asia",
    description: "Discover the vibrant traditions and landscapes of Asia.",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    actionUrl: "/explore/asia",
  },
  {
    title: "South America",
    description:
      "Experience the diverse cultures and natural wonders of South America.",
    imageUrl:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    actionUrl: "/explore/south-america",
  },
  {
    title: "Africa",
    description:
      "Journey through the diverse landscapes and cultures of Africa.",
    imageUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    actionUrl: "/explore/africa",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col w-full items-center justify-start min-h-screen py-8 space-y-12">
      {/* Hero Carousel Section */}
      <div className="w-full flex items-center justify-center">
        <ImageCarousel />
      </div>

      {/* Search and Sort Section */}
      <div className="w-full max-w-6xl px-4">
        <SearchAndSort />
      </div>

      {/* Top Regional Selections */}
      <section className="w-full max-w-7xl px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Top Regional Destinations</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover amazing destinations across different continents and
            cultures
          </p>
        </div>
        <TopRegionalCard items={topRegionalCardsData} />
      </section>

      {/* Previous Trips Section */}
      <section className="w-full max-w-7xl px-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Your Travel Journey
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            View your previous trips and plan your next adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              View Previous Trips
            </button>
            <button className="bg-white hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-800 text-black dark:text-white border border-black dark:border-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Plan New Trip
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}