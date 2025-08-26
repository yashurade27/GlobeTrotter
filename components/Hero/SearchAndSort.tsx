"use client";

import React from "react";
import SearchBarHero from "./SearchBarHero";
import SortByHero from "./SortByHero";
import { type SortOptions } from "@/app/trips/types";

interface SearchAndSortProps {
  onSearch?: (query: string) => void;
  onSort?: (sortOption: SortOptions) => void;
  defaultSearchValue?: string;
  defaultSortOption?: SortOptions;
}

const SearchAndSort = ({
  onSearch,
  onSort,
  defaultSearchValue = "",
  defaultSortOption = "newest",
}: SearchAndSortProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 sm:gap-6">
      <div className="w-full sm:w-2/3">
        <SearchBarHero 
          onSearch={onSearch} 
          defaultValue={defaultSearchValue} 
        />
      </div>
      <div className="sm:w-1/3 flex justify-end">
        <SortByHero 
          onSort={onSort} 
          defaultSort={defaultSortOption} 
        />
      </div>
    </div>
  );
};

export default SearchAndSort;
