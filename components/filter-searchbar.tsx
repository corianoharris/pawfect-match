"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { motion } from "framer-motion"


interface FilterSearchBarProps
{
  breeds: string[]
  selectedBreeds: string[]
  setSelectedBreeds: (breeds: string[]) => void
  applyFilters: () => void
  isOpen: boolean
  onClose: () => void
}

export function FilterSearchBar({
  breeds,
  selectedBreeds,
  setSelectedBreeds,
}: FilterSearchBarProps)
{
  const [searchBreed, setSearchBreed] = useState("")
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>(breeds)

  useEffect(() =>
  {
    if (searchBreed)
    {
      setFilteredBreeds(breeds.filter((breed) => breed.toLowerCase().includes(searchBreed.toLowerCase())))
    } else
    {
      setFilteredBreeds(breeds)
    }
  }, [searchBreed, breeds])

  const toggleBreed = (breed: string) =>
  {
    setSelectedBreeds(
      selectedBreeds.includes(breed) ? selectedBreeds.filter((b) => b !== breed) : [...selectedBreeds, breed],
    )
  }

  const handleBreedClick = (breed: string) =>
  {
    toggleBreed(breed)
    setSearchBreed("") // Optionally clear the search bar after selecting a breed
  }

  return (
    <div className=" hidden sm:block flex-1">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-10"
      >
        <div className="relative w-full max-w-md mx-4">

        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

          <Input
            placeholder="Search dogs by breed..."
            value={searchBreed}
            onChange={(e) => setSearchBreed(e.target.value)}
            className="pl-10 border-turquoise-200 focus:border-turquoise-400 dark:border-gray-700 shadow-md"
          />
         
            
          


          {/* Breed suggestions dropdown */}
          {searchBreed && filteredBreeds.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-turquoise-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredBreeds.slice(0, 10).map((breed, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-turquoise-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() =>handleBreedClick(breed)
                  }
                >
                  {breed}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.header>
    </div>
  )
}
