"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { shelters } from "@/mockData/shelters"
import { Heart, MapPin, Info, User } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Dog {
  id: string
  img: string
  name: string
  age: number
  zip_code: string
  breed: string
}

interface DogCardProps {
  dog: Dog
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function DogCard({ dog, isFavorite, onToggleFavorite }: DogCardProps) {
  const [showDogDetails, setShowDogDetails] = useState(false)
  const router = useRouter()

  const handleBreedDetailsClick = () => {
    router.push(`/details?id=${dog.id}`)
  }

  return (
    <>
      <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
        <Card
          className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          tabIndex={0}
          aria-label={`${dog.name}, ${dog.age} ${dog.age === 1 ? "year" : "years"} old ${dog.breed}`}
        >
          <div className="relative">
            <div className="absolute top-3 left-3 z-10 flex space-x-1" aria-label="Shelter information">
              <div className="flex items-center space-x-1">
                <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <User width={20} height={20} className="rounded-full" aria-hidden="true" />
                </div>
                <div
                  className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs"
                  aria-label={`Shelter: ${shelters[Math.floor(Math.random() * shelters.length)].name}`}
                >
                  {shelters[Math.floor(Math.random() * shelters.length)].name}
                </div>
              </div>
            </div>

            <div className="absolute top-3 right-3 z-10">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-sm"
                onClick={(e) => {
                  e.preventDefault()
                  onToggleFavorite()
                }}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? `Remove ${dog.name} from favorites` : `Add ${dog.name} to favorites`}
                role="switch"
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-300"}`}
                  aria-hidden="true"
                />
              </motion.button>
            </div>

            <div
              className="aspect-square bg-turquoise-100 dark:bg-turquoise-900/20 relative overflow-hidden"
              aria-hidden="true"
            >
              <Image
                src={dog.img || "/placeholder.svg?height=400&width=400"}
                alt={`Photo of ${dog.name}, a ${dog.breed}`}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>

          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white" id={`dog-name-${dog.id}`}>
                  {dog.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate" id={`dog-breed-${dog.id}`}>
                  {dog.breed}
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-turquoise-50 text-turquoise-700 border-turquoise-200 dark:bg-turquoise-900/20 dark:text-turquoise-300 dark:border-turquoise-800"
                aria-label={`${dog.age} ${dog.age === 1 ? "year" : "years"} old`}
              >
                {dog.age} {dog.age === 1 ? "year" : "years"}
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div
                className="flex items-center text-sm text-gray-500 dark:text-gray-400"
                aria-label={`Location: ${dog.zip_code}`}
              >
                <MapPin className="w-4 h-4 mr-1 text-turquoise-500" aria-hidden="true" />
                <span>{dog.zip_code}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-turquoise-600 dark:text-turquoise-400 text-sm font-medium flex items-center"
                onClick={() => handleBreedDetailsClick()}
                aria-label={`View details about ${dog.name}`}
              >
                <Info className="w-4 h-4 mr-1" aria-hidden="true" />
                Details
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}

