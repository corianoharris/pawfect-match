"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Heart, LogOut, ArrowUpDown, Loader2, PawPrint, Menu } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { DogCard } from "@/components/dog-card"
import { FilterSidebar } from "@/components/filter-sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { FilterSearchBar } from "@/components/filter-searchbar"
import FeaturedBreed from "@/components/featuredBreed"

interface Dog {
  id: string
  img: string
  name: string
  age: number
  zip_code: string
  breed: string
}

interface SearchResponse {
  resultIds: string[]
  total: number
  next: string | null
  prev: string | null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function DogsPage() {
  const router = useRouter()
  const [breeds, setBreeds] = useState<string[]>([])
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([])
  const [ageMin, setAgeMin] = useState<string>("")
  const [ageMax, setAgeMax] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [prevCursor, setPrevCursor] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showBreedSuggestions, setShowBreedSuggestions] = useState(false)
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([])

  const { data: breedsData, isLoading: breedsLoading } = useQuery({
    queryKey: ["breeds"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/dogs/breeds`, { credentials: "include" })
      if (!response.ok) {
        throw new Error("Failed to fetch breeds")
      }
      return response.json()
    },
  })

  const {
    data: dogsData,
    isLoading: dogsLoading,
    refetch: refetchDogs,
  } = useQuery({
    queryKey: ["dogs", selectedBreeds, ageMin, ageMax, sortOrder, currentPage, searchQuery],
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      if (selectedBreeds.length > 0) {
        selectedBreeds.forEach((breed) => queryParams.append("breeds", breed))
      }
      if (ageMin) queryParams.append("ageMin", ageMin)
      if (ageMax) queryParams.append("ageMax", ageMax)
      queryParams.append("sort", `breed:${sortOrder}`)
      queryParams.append("size", "20")
      queryParams.append("page", `${currentPage}`)
      if (searchQuery) queryParams.append("search", searchQuery)
      if (nextCursor) queryParams.append("from", nextCursor)
      if (prevCursor) queryParams.append("from", prevCursor)

      const searchResponse = await fetch(`${API_BASE_URL}/dogs/search?${queryParams}`, { credentials: "include" })
      if (!searchResponse.ok) {
        throw new Error("Failed to search dogs")
      } else console.log("searchResponse", searchResponse)

      console.log("search value", searchQuery)

      const searchData: SearchResponse = await searchResponse.json()

      setNextCursor(searchData.next ? new URLSearchParams(searchData.next.split("?")[1]).get("from") : null)
      setPrevCursor(searchData.prev ? new URLSearchParams(searchData.prev.split("?")[1]).get("from") : null)

      setTotalPages(Math.ceil(searchData.total / 20))

      if (searchData.resultIds.length > 0) {
        const dogsResponse = await fetch(`${API_BASE_URL}/dogs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(searchData.resultIds),
          credentials: "include",
        })
        if (!dogsResponse.ok) {
          throw new Error("Failed to fetch dog details")
        }
        return await dogsResponse.json()
      }
      return []
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  })

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1)
    setNextCursor(null)
    setPrevCursor(null)
  }, [searchQuery, selectedBreeds, ageMin, ageMax, sortOrder])

  useEffect(() => {
    if (breedsData) {
      setBreeds(breedsData)
    }
  }, [breedsData])

  // Close breed suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowBreedSuggestions(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleNextPage = () => {
    if (nextCursor) {
      setCurrentPage((prev) => prev + 1)
      refetchDogs()
    }
  }

  const handlePrevPage = () => {
    if (prevCursor) {
      setCurrentPage((prev) => prev - 1)
      refetchDogs()
    }
  }

  const toggleFavorite = (dogId: string) => {
    setFavorites((prev) => {
      if (prev.includes(dogId)) {
        return prev.filter((id) => id !== dogId)
      } else {
        return [...prev, dogId]
      }
    })
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMatch = async () => {
    if (favorites.length === 0) {
      toast({
        title: "No favorites selected",
        description: "Please select at least one dog to find a match.",
        variant: "destructive",
      })
      return
    }

    console.log("favorites", favorites)

    try {
      // Randomly select a dog from the favorites array
      const randomIndex = Math.floor(Math.random() * favorites.length)
      const selectedDogId = favorites[randomIndex]
      console.log("selectedDogId", selectedDogId)

      // Make API call with just the selected dog's ID
      const response = await fetch(`${API_BASE_URL}/dogs/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(favorites.filter((id) => id === selectedDogId)), // Send just the randomly selected ID
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to find a match")
      }

      const data = await response.json()
      router.push(`/match?id=${data.match}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find a match. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    refetchDogs()
  }

  const applyFilters = () => {
    setCurrentPage(1)
    refetchDogs()
    setIsSidebarOpen(false)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const dog = dogsData[index]
    return (
      <motion.div
        key={dog.id}
        style={style}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <DogCard dog={dog} isFavorite={favorites.includes(dog.id)} onToggleFavorite={() => toggleFavorite(dog.id)} />
      </motion.div>
    )
  }

  const featuredBreed = useMemo(() => breeds[Math.floor(Math.random() * breeds.length)], [breeds])

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-turquoise-50 to-white dark:from-gray-900 dark:to-gray-800 ${isDarkMode ? "dark" : ""}`}
    >
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-turquoise-100 dark:border-gray-700 h-screen sticky top-0"
          aria-label="Filters"
          role="complementary"
        >
          <div className="p-4 border-b border-turquoise-100 dark:border-gray-700 flex items-center space-x-2">
            <PawPrint className="h-8 w-8 text-turquoise-500" aria-hidden="true" />
            <span className="text-xl font-bold text-turquoise-700 dark:text-turquoise-300" tabIndex={0}>
              Pawfect Match
            </span>
          </div>

          <div className="p-4 flex-1 overflow-auto">
            <FilterSidebar
              breeds={breeds}
              selectedBreeds={selectedBreeds}
              setSelectedBreeds={setSelectedBreeds}
              ageMin={ageMin}
              setAgeMin={setAgeMin}
              ageMax={ageMax}
              setAgeMax={setAgeMax}
              applyFilters={applyFilters}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          <div className="p-4 border-t border-turquoise-100 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-600 dark:text-gray-300"
              aria-label="Logout from your account"
            >
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </motion.aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Header */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-50 mt-0 bg-white dark:bg-gray-900 border-b border-turquoise-100 dark:border-gray-700 shadow-sm"
            role="banner"
          >
            <div className="container flex flex-col gap-2 mt-2 items-center flex-wrap md:flex-row h-16 px-4 mx-auto">
              <div className="flex items-center md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  aria-expanded={isSidebarOpen}
                  aria-controls="mobile-sidebar"
                  aria-label="Toggle filter sidebar"
                >
                  <Menu className="w-full h-full text-turquoise-600 dark:text-turquoise-400" aria-hidden="true" />
                </Button>
              </div>

              <FilterSearchBar
                breeds={breeds}
                selectedBreeds={selectedBreeds}
                setSelectedBreeds={setSelectedBreeds}
                applyFilters={applyFilters}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
              />

              {/* Selected breeds display */}
              <div
                className="hidden md:flex flex-wrap gap-2 align-middle items-start overflow-x-auto max-w-full ml-2 mr-24"
                role="region"
                aria-label="Selected breed filters"
              >
                {selectedBreeds.map((breed, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-turquoise-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    <span className="mr-1">{breed}</span>
                    <button
                      onClick={() => setSelectedBreeds(selectedBreeds.filter((b) => b !== breed))}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label={`Remove ${breed} filter`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-4" role="toolbar" aria-label="Page controls">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={toggleSortOrder}
                    className="border-turquoise-200 text-turquoise-700 dark:border-gray-700 dark:text-turquoise-300"
                    aria-pressed={sortOrder === "desc"}
                    aria-label={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}`}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" aria-hidden="true" />
                    {sortOrder === "asc" ? "A-Z" : "Z-A"}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={handleMatch}
                    disabled={favorites.length === 0}
                    className={`relative border-turquoise-200 dark:border-gray-700 ${favorites.length > 0 ? "text-turquoise-700 dark:text-turquoise-300" : "text-gray-400 dark:text-gray-600"}`}
                    aria-label={`Find a match from ${favorites.length} favorite dogs`}
                    aria-disabled={favorites.length === 0}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${favorites.length > 0 ? "fill-turquoise-500 text-turquoise-500" : ""}`}
                      aria-hidden="true"
                    />
                    Match
                    {favorites.length > 0 && (
                      <span
                        className="absolute -top-2 -right-2 bg-turquoise-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        aria-label={`${favorites.length} favorites selected`}
                      >
                        {favorites.length}
                      </span>
                    )}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                    className="text-turquoise-700 dark:text-turquoise-300"
                    aria-pressed={isDarkMode}
                    aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                  >
                    {isDarkMode ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Main content area */}
          <main className="container px-4 py-8 mx-auto" id="main-content">
            {/* Mobile filter sidebar */}
            <AnimatePresence>
              {isSidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                  />

                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25 }}
                    className="fixed top-0 left-0 z-50 h-full w-3/4 max-w-sm bg-white dark:bg-gray-900 p-6 shadow-lg md:hidden"
                    id="mobile-sidebar"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Filter options"
                  >
                    <FilterSidebar
                      breeds={breeds}
                      selectedBreeds={selectedBreeds}
                      setSelectedBreeds={setSelectedBreeds}
                      ageMin={ageMin}
                      setAgeMin={setAgeMin}
                      ageMax={ageMax}
                      setAgeMax={setAgeMax}
                      applyFilters={applyFilters}
                      isOpen={isSidebarOpen}
                      onClose={() => setIsSidebarOpen(false)}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Selected breeds mobile display */}
            {selectedBreeds.length > 0 && (
              <div className="md:hidden flex flex-wrap gap-2 mb-4" role="region" aria-label="Selected breed filters">
                {selectedBreeds.map((breed, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-turquoise-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    <span className="mr-1">{breed}</span>
                    <button
                      onClick={() => setSelectedBreeds(selectedBreeds.filter((b) => b !== breed))}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label={`Remove ${breed} filter`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {selectedBreeds.length > 0 && (
                  <button
                    onClick={() => setSelectedBreeds([])}
                    className="text-xs text-turquoise-600 dark:text-turquoise-400 underline"
                    aria-label="Clear all breed filters"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* Featured section */}
            <section aria-labelledby="featured-section">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div
                  className="flex flex-row gap-2 mb-4 items-center justify-center  px-2 py-1 rounded-full text-xs"
                  aria-live="polite"
                >
                  <FeaturedBreed breed={featuredBreed} />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h2
                    id="featured-section"
                    className="text-2xl font-bold text-turquoise-800 dark:text-turquoise-200"
                    tabIndex={0}
                  >
                    Featured Dogs
                  </h2>
                  <Button
                    variant="link"
                    className="text-turquoise-600 dark:text-turquoise-400"
                    aria-label="View all featured dogs"
                  >
                    View all
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list" aria-label="Featured categories">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gradient-to-br from-turquoise-500 to-turquoise-600 rounded-xl overflow-hidden text-white shadow-lg"
                      role="listitem"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2" tabIndex={0}>
                          {i === 1 ? "New Arrivals" : i === 2 ? "Staff Picks" : "Special Needs"}
                        </h3>
                        <p className="text-turquoise-100 mb-4" tabIndex={0}>
                          {i === 1
                            ? "Meet our newest furry friends looking for homes"
                            : i === 2
                              ? "Dogs our staff think deserve extra attention"
                              : "These loving dogs need special care"}
                        </p>
                        <Button
                          variant="secondary"
                          className="bg-white/20 hover:bg-white/30 text-white border-none"
                          onClick={() =>
                            router.push(
                              `/explore/${i === 1 ? "new-arrivals" : i === 2 ? "staff-picks" : "special-needs"}`,
                            )
                          }
                          aria-label={`Explore ${i === 1 ? "new arrivals" : i === 2 ? "staff picks" : "special needs"} dogs`}
                        >
                          Explore
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* Dogs grid */}
            <section aria-labelledby="available-dogs-heading">
              <div className="mb-8 w-full">
                <div className="flex flex-col items-center justify-between mb-4">
                  <h2
                    id="available-dogs-heading"
                    className="text-2xl font-bold text-turquoise-800 dark:text-turquoise-200"
                    tabIndex={0}
                  >
                    Available Dogs
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
                      {dogsData && dogsData.length > 0 ? `Showing ${dogsData.length} dogs` : "No dogs found"}
                    </span>
                  </div>
                </div>

                {dogsLoading ? (
                  <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
                    <Loader2 className="w-8 h-8 animate-spin text-turquoise-500" aria-hidden="true" />
                    <span className="sr-only">Loading dogs, please wait...</span>
                  </div>
                ) : dogsData && dogsData.length > 0 ? (
                  <>
                    <motion.div
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      role="list"
                      aria-label="Available dogs"
                    >
                      {dogsData.map((dog: Dog) => (
                        <motion.div key={dog.id} role="listitem">
                          <DogCard
                            dog={dog}
                            isFavorite={favorites.includes(dog.id)}
                            onToggleFavorite={() => toggleFavorite(dog.id)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <nav aria-label="Pagination" className="mt-8">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <Button
                                variant="outline"
                                onClick={handlePrevPage}
                                disabled={!prevCursor}
                                className="border-turquoise-200 text-turquoise-700 dark:border-gray-700 dark:text-turquoise-300"
                                aria-label="Previous page"
                                aria-disabled={!prevCursor}
                              >
                                <PaginationPrevious />
                              </Button>
                            </PaginationItem>
                            <PaginationItem>
                              <span
                                className="px-4 py-2"
                                aria-current="page"
                                aria-label={`Page ${currentPage} of ${totalPages}`}
                              >
                                Page {currentPage} of {totalPages}
                              </span>
                            </PaginationItem>
                            <PaginationItem>
                              <Button
                                variant="outline"
                                onClick={handleNextPage}
                                disabled={!nextCursor}
                                className="border-turquoise-200 text-turquoise-700 dark:border-gray-700 dark:text-turquoise-300"
                                aria-label="Next page"
                                aria-disabled={!nextCursor}
                              >
                                <PaginationNext />
                              </Button>
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </nav>
                    </motion.div>
                  </>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-turquoise-100 dark:border-gray-700"
                    role="alert"
                    aria-live="assertive"
                  >
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-4" tabIndex={0}>
                      No dogs found matching your criteria
                    </p>
                    <Button
                      variant="outline"
                      className="border-turquoise-200 text-turquoise-700 dark:border-gray-700 dark:text-turquoise-300"
                      onClick={() => {
                        setSelectedBreeds([])
                        setAgeMin("")
                        setAgeMax("")
                        setSearchQuery("")
                        refetchDogs()
                      }}
                      aria-label="Clear all filters and show all dogs"
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

