"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Heart, ChevronLeft, Loader2, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DogCard } from "@/components/dog-card"
import { toast } from "@/hooks/use-toast"

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

const categoryConfig: Record<
  string,
  {
    title: string
    description: string
    color: string
    bgColor: string
    sortField: string
  }
> = {
  "new-arrivals": {
    title: "New Arrivals",
    description: "Meet our newest furry friends looking for homes",
    color: "text-turquoise-700 dark:text-blue-300",
    bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
    sortField: "created_at",
  },
  "staff-picks": {
    title: "Staff Picks",
    description: "Dogs our staff think deserve extra attention",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
    sortField: "staff_pick",
  },
  "special-needs": {
    title: "Special Needs",
    description: "These loving dogs need special care",
    color: "text-pink-700 dark:text-pink-300",
    bgColor: "bg-gradient-to-br from-pink-500 to-pink-600",
    sortField: "special_needs",
  },
}

export default function CategoryExplore({ category }: { category: string }) {
  const router = useRouter()
  const config = categoryConfig[category]
  const [favorites, setFavorites] = useState<string[]>([])

  const {
    data: dogsData,
    isLoading: dogsLoading,
    error,
  } = useQuery({
    queryKey: ["dogs", category],
    queryFn: async () => {
      // Fetch all dogs without category filtering
      const response = await fetch(`${API_BASE_URL}/dogs/search`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch dogs")
      }

      const searchData: SearchResponse = await response.json()

      if (!searchData.resultIds || searchData.resultIds.length === 0) {
        return []
      }

      // Limit to 6 dogs on the client side
      const limitedResultIds = searchData.resultIds.slice(0, 4)

      // Then fetch the actual dog details for these IDs
      const dogDetailsResponse = await fetch(`${API_BASE_URL}/dogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(limitedResultIds),
        credentials: "include",
      })

      if (!dogDetailsResponse.ok) {
        throw new Error("Failed to fetch dog details")
      }

      const dogDetails: Dog[] = await dogDetailsResponse.json()
      return dogDetails
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  })

  const toggleFavorite = (dogId: string) => {
    setFavorites((prev) => {
      if (prev.includes(dogId)) {
        return prev.filter((id) => id !== dogId)
      } else {
        return [...prev, dogId]
      }
    })
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

    try {
      // Randomly select a dog from the favorites array
      const randomIndex = Math.floor(Math.random() * favorites.length)
      const selectedDogId = favorites[randomIndex]

      // Make API call with just the selected dog's ID
      const response = await fetch(`${API_BASE_URL}/dogs/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(favorites.filter((id) => id === selectedDogId)),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-turquoise-100 dark:border-gray-700 shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dogs")}
              className="text-gray-600 dark:text-gray-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <PawPrint className="h-6 w-6 text-turquoise-500" />
              <h1 className={`text-xl font-bold ${config.color}`}>{config.title}</h1>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => router.push("/dogs")}
            className="text-turquoise-700 dark:text-turquoise-300"
          >
            View All Dogs
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-8 mx-auto">
        {/* Category banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${config.bgColor} rounded-lg shadow-lg p-6 mb-8 text-white`}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{config.title}</h2>
          <p className="text-white/90 mb-4">{config.description}</p>
         
        </motion.div>

        {/* Dogs grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-turquoise-800 dark:text-turquoise-200">Featured {config.title}</h2>
            {favorites.length > 0 && (
              <Button
                variant="outline"
                onClick={handleMatch}
                className="relative border-turquoise-200 dark:border-gray-700 text-turquoise-700 dark:text-turquoise-300"
              >
                <Heart className="w-4 h-4 mr-2 fill-turquoise-500 text-turquoise-500" />
                Match
                <span className="absolute -top-2 -right-2 bg-turquoise-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              </Button>
            )}
          </div>

          {dogsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-turquoise-500" />
            </div>
          ) : dogsData && dogsData.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
            >
              {dogsData.map((dog) => (
                <motion.div
                  key={dog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DogCard
                    dog={dog}
                    isFavorite={favorites.includes(dog.id)}
                    onToggleFavorite={() => toggleFavorite(dog.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-turquoise-100 dark:border-gray-700">
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">No dogs found in this category</p>
              <Button
                variant="outline"
                onClick={() => router.push("/dogs")}
                className="border-turquoise-200 text-turquoise-700 dark:border-gray-700 dark:text-turquoise-300"
              >
                Browse All Dogs
              </Button>
            </div>
          )}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-turquoise-100 dark:border-gray-700 p-6 text-center"
        >
          <h3 className="text-xl font-bold text-turquoise-800 dark:text-turquoise-200 mb-2">Find Your Perfect Match</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Browse our complete collection of dogs to find your new best friend.
          </p>
          <Button
            onClick={() => router.push("/dogs")}
            className="bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700 text-white"
          >
            View All Dogs
          </Button>
        </motion.div>
      </main>
    </div>
  )
}

