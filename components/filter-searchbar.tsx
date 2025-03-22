"use client"

import { useState, useEffect, useRef, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { motion } from "framer-motion"

interface FilterSearchBarProps {
  breeds: string[]
  selectedBreeds: string[]
  setSelectedBreeds: (breeds: string[]) => void
  applyFilters: () => void
  isOpen: boolean
  onClose: () => void
}

export function FilterSearchBar({ breeds, selectedBreeds, setSelectedBreeds }: FilterSearchBarProps) {
  const [searchBreed, setSearchBreed] = useState("")
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>(breeds)
  const [activeIndex, setActiveIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchBreed) {
      setFilteredBreeds(breeds.filter((breed) => breed.toLowerCase().includes(searchBreed.toLowerCase())))
      setActiveIndex(-1) // Reset active index when search changes
    } else {
      setFilteredBreeds(breeds)
    }
  }, [searchBreed, breeds])

  const toggleBreed = (breed: string) => {
    setSelectedBreeds(
      selectedBreeds.includes(breed) ? selectedBreeds.filter((b) => b !== breed) : [...selectedBreeds, breed],
    )
  }

  const handleBreedClick = (breed: string) => {
    toggleBreed(breed)
    setSearchBreed("") // Clear the search bar after selecting a breed
    inputRef.current?.focus() // Return focus to input
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const suggestionsLength = filteredBreeds.slice(0, 10).length

    // Handle arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prevIndex) => (prevIndex < suggestionsLength - 1 ? prevIndex + 1 : prevIndex))
    }
    // Handle arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1))
    }
    // Handle enter to select
    else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      handleBreedClick(filteredBreeds[activeIndex])
    }
    // Handle escape to close dropdown
    else if (e.key === "Escape") {
      e.preventDefault()
      setSearchBreed("")
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setSearchBreed("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="hidden sm:block flex-1">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-10"
        role="search"
        aria-label="Search dogs by breed"
      >
        <div className="relative w-full max-w-md mx-4">
          <label htmlFor="breed-search" className="sr-only">
            Search dogs by breed
          </label>
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            aria-hidden="true"
          />

          <Input
            id="breed-search"
            placeholder="Search dogs by breed..."
            value={searchBreed}
            onChange={(e) => setSearchBreed(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 border-turquoise-200 focus:border-turquoise-400 dark:border-gray-700 shadow-md"
            aria-autocomplete="list"
            aria-controls={searchBreed ? "breed-suggestions" : undefined}
            aria-expanded={searchBreed && filteredBreeds.length > 0 ? "true" : "false"}
            aria-activedescendant={activeIndex >= 0 ? `breed-option-${activeIndex}` : undefined}
            ref={inputRef}
          />

          {/* Breed suggestions dropdown */}
          {searchBreed && filteredBreeds.length > 0 && (
            <div
              id="breed-suggestions"
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-turquoise-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
              role="listbox"
              aria-label="Breed suggestions"
            >
              {filteredBreeds.slice(0, 10).map((breed, index) => (
                <div
                  key={index}
                  id={`breed-option-${index}`}
                  className={`px-4 py-2 cursor-pointer ${
                    index === activeIndex
                      ? "bg-turquoise-100 dark:bg-gray-700"
                      : "hover:bg-turquoise-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleBreedClick(breed)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleBreedClick(breed)
                    }
                  }}
                  role="option"
                  aria-selected={index === activeIndex}
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <span>{breed}</span>
                    {selectedBreeds.includes(breed) && (
                      <span className="text-turquoise-600 dark:text-turquoise-400" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {filteredBreeds.length > 10 && (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic" aria-live="polite">
                  {filteredBreeds.length - 10} more breeds available. Type more to refine.
                </div>
              )}
            </div>
          )}
        </div>
      </motion.header>
    </div>
  )
}

