"use client"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import Image from "next/image"
import { MapPin, ArrowRight } from "lucide-react"

export type TopRegionalCardProps = {
  items: Array<{
    title: string;
    description: string;
    imageUrl: string;
    actionUrl: string;
  }>;
}

const TopRegionalCard = ({ items }: TopRegionalCardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
      {items.map((item, index) => (
        <Card 
          key={index} 
          className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-64"
          onClick={() => window.open(item.actionUrl, '_blank')}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
          </div>

          {/* Location Icon */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 z-10">
            <MapPin className="h-4 w-4 text-white" />
          </div>

          {/* Content Overlay */}
          <CardContent className="absolute inset-0 p-6 flex flex-col justify-end z-10">
            <div className="text-white">
              <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors duration-200">
                {item.title}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed line-clamp-2 mb-4">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/95">
                  Explore Destination
                </span>
                <ArrowRight className="h-4 w-4 text-white transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default TopRegionalCard