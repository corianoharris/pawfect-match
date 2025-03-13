"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FilterSidebarProps {
  breeds: string[]
  selectedBreeds: string[]
  setSelectedBreeds: (breeds: string[]) => void
  ageMin: string
  setAgeMin: (age: string) => void
  ageMax: string
  setAgeMax: (age: string) => void
  applyFilters: () => void
  isOpen: boolean
  onClose: () => void
}

export function FilterSidebar({
  breeds,
  selectedBreeds,
  setSelectedBreeds,
  ageMin,
  setAgeMin,
  ageMax,
  setAgeMax,
  applyFilters,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const [searchBreed, setSearchBreed] = useState("")
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>(breeds)
  const [ageRange, setAgeRange] = useState<number[]>([0, 20])

  useEffect(() => {
    if (searchBreed) {
      setFilteredBreeds(breeds.filter((breed) => breed.toLowerCase().includes(searchBreed.toLowerCase())))
    } else {
      setFilteredBreeds(breeds)
    }
  }, [searchBreed, breeds])

  useEffect(() => {
    if (ageMin) setAgeRange((prev) => [Number.parseInt(ageMin), prev[1]])
    if (ageMax) setAgeRange((prev) => [prev[0], Number.parseInt(ageMax)])
  }, [ageMin, ageMax])

  const handleAgeRangeChange = (values: number[]) => {
    setAgeRange(values)
    setAgeMin(values[0].toString())
    setAgeMax(values[1].toString())
  }

  const toggleBreed = (breed: string) => {
    setSelectedBreeds(
      selectedBreeds.includes(breed) ? selectedBreeds.filter((b) => b !== breed) : [...selectedBreeds, breed],
    )
  }

  const clearFilters = () => {
    setSelectedBreeds([])
    setAgeMin("")
    setAgeMax("")
    setSearchBreed("")
    setAgeRange([0, 20])
  }

  return (
    <div className="space-y-6">
      <div className="md:hidden flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-turquoise-800 dark:text-turquoise-200">Filters</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="hidden md:block">
        <h2 className="text-xl font-bold text-turquoise-800 dark:text-turquoise-200 mb-4">Filters</h2>
      </div>

      <Accordion type="single" collapsible defaultValue="age" className="w-full">
        <AccordionItem value="age" className="border-b border-turquoise-100 dark:border-gray-700">
          <AccordionTrigger className="text-turquoise-700 dark:text-turquoise-300 hover:text-turquoise-800 dark:hover:text-turquoise-200 py-3">
            Age Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4">
              <div className="mb-6">
                <Slider
                  value={ageRange}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={handleAgeRangeChange}
                  className="my-6"
                />
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{ageRange[0]} years</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{ageRange[1]} years</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  min="0"
                  className="w-full border-turquoise-200 focus:border-turquoise-400 dark:border-gray-700"
                />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  min={ageMin || "0"}
                  className="w-full border-turquoise-200 focus:border-turquoise-400 dark:border-gray-700"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="breeds" className="border-b border-turquoise-100 dark:border-gray-700">
          <AccordionTrigger className="text-turquoise-700 dark:text-turquoise-300 hover:text-turquoise-800 dark:hover:text-turquoise-200 py-3">
            Breeds
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4 space-y-4">
              <Input
                placeholder="Search breeds..."
                value={searchBreed}
                onChange={(e) => setSearchBreed(e.target.value)}
                className="border-turquoise-200 focus:border-turquoise-400 dark:border-gray-700"
              />

              {selectedBreeds.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <AnimatePresence>
                    {selectedBreeds.map((breed) => (
                      <motion.div
                        key={breed}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge className="flex items-center gap-1 bg-turquoise-100 text-turquoise-700 hover:bg-turquoise-200 dark:bg-turquoise-900/30 dark:text-turquoise-300 dark:hover:bg-turquoise-900/50">
                          {breed}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => toggleBreed(breed)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <ScrollArea className="h-72 rounded-md border border-turquoise-100 dark:border-gray-700">
                <div className="p-4 space-y-2">
                  {filteredBreeds.length > 0 ? (
                    filteredBreeds.map((breed) => (
                      <motion.div
                        key={breed}
                        className="flex items-center space-x-2"
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Checkbox
                          id={`breed-${breed}`}
                          checked={selectedBreeds.includes(breed)}
                          onCheckedChange={() => toggleBreed(breed)}
                          className="text-turquoise-600 border-turquoise-300 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`breed-${breed}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {breed}
                        </label>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No breeds found</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="flex-1 border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50 dark:border-gray-700 dark:text-turquoise-300 dark:hover:bg-gray-800"
        >
          Clear
        </Button>
        {/* <Button onClick={applyFilters} className="flex-1 bg-turquoise-600 hover:bg-turquoise-700 text-white">
          Apply
        </Button> */}
      </div>
    </div>
  )
}

