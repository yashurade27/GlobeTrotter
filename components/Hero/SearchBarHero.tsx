"use client"
import { Search, X } from "lucide-react"
import { useState } from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarHeroProps {
  onSearch?: (query: string) => void;
  defaultValue?: string;
  placeholder?: string;
}

const SearchBarHero = ({ 
  onSearch, 
  defaultValue = "", 
  placeholder = "Search trips, destinations, activities...",
  ...props 
}: SearchBarHeroProps & React.ComponentProps<"form">) => {
  const [searchQuery, setSearchQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
   <form onSubmit={handleSubmit} {...props} className="w-full flex-1">
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-50 select-none" />
        
        {searchQuery && (
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8 p-0" 
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
        
        <Button 
          type="submit" 
          size="sm" 
          variant="ghost" 
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
        >
          Search
        </Button>
      </div>
    </form>
  )
}

export default SearchBarHero


