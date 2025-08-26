"use client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Check, ChevronDown } from "lucide-react";
import { type SortOptions } from "@/app/trips/types";

const sortLabels: Record<SortOptions, string> = {
  'newest': 'Newest First',
  'oldest': 'Oldest First',
  'startDate': 'Start Date',
  'endDate': 'End Date',
  'budget-high': 'Budget: High to Low',
  'budget-low': 'Budget: Low to High',
  'destinations': 'Number of Destinations',
};

interface SortByHeroProps {
  onSort?: (sortOption: SortOptions) => void;
  defaultSort?: SortOptions;
}

const SortByHero = ({ 
  onSort, 
  defaultSort = 'newest'
}: SortByHeroProps) => {
  const [activeSort, setActiveSort] = useState<SortOptions>(defaultSort);

  const handleSort = (sortOption: SortOptions) => {
    setActiveSort(sortOption);
    if (onSort) {
      onSort(sortOption);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between">
          <ArrowDownUp className="mr-2 h-4 w-4" />
          Sort: {sortLabels[activeSort]}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleSort('newest')} className="flex justify-between">
          {sortLabels['newest']}
          {activeSort === 'newest' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSort('oldest')} className="flex justify-between">
          {sortLabels['oldest']}
          {activeSort === 'oldest' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleSort('startDate')} className="flex justify-between">
          {sortLabels['startDate']}
          {activeSort === 'startDate' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSort('endDate')} className="flex justify-between">
          {sortLabels['endDate']}
          {activeSort === 'endDate' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleSort('budget-high')} className="flex justify-between">
          {sortLabels['budget-high']}
          {activeSort === 'budget-high' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSort('budget-low')} className="flex justify-between">
          {sortLabels['budget-low']}
          {activeSort === 'budget-low' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSort('destinations')} className="flex justify-between">
          {sortLabels['destinations']}
          {activeSort === 'destinations' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortByHero;
