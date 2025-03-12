"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, MapPin, PartyPopper, Heart, Share2, MessageCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"
import { motion } from "framer-motion"

interface Dog {
  id: string
  img: string
  name: string
  age: number
  zip_code: string
  breed: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function MatchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dogId = searchParams.get("id")
  const [dog, setDog] = useState<Dog | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!dogId) {
      router.push("/dogs")
      return
    }

    const fetchDog = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/dogs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([dogId]),
          credentials: "include",
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/")
            return
          }
          throw new Error("Failed to fetch dog details")
        }

        const data = await response.json()
        setDog(data[0])

        // Trigger confetti effect
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
        }, 500)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch dog details. Please try again.",
          variant: "destructive",
        })
        router.push("/dogs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDog()
  }, [dogId, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-turquoise-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-turquoise-500" />
      </div>
    )
  }

  if (!dog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-turquoise-50 to-white dark:from-gray-900 dark:to-gray-800">
        <p className="text-lg text-gray-500 dark:text-gray-400">Dog not found</p>
        <Button
          variant="link"
          onClick={() => router.push("/dogs")}
          className="text-turquoise-600 dark:text-turquoise-400"
        >
          Back to search
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container px-4 mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Button
            variant="ghost"
            onClick={() => router.push("/dogs")}
            className="mb-6 text-turquoise-700 dark:text-turquoise-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to search
          </Button>
        </motion.div>

        <motion.div
          className="flex items-center justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PartyPopper className="w-8 h-8 mr-2 text-turquoise-500 animate-pulse-scale" />
          <h1 className="text-3xl font-bold text-center text-turquoise-800 dark:text-turquoise-200">
            Congratulations! You've been matched!
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="max-w-4xl mx-auto overflow-hidden border-turquoise-200 dark:border-gray-700 shadow-xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative aspect-square bg-turquoise-100 dark:bg-turquoise-900/20">
                <Image
                  src={dog.img || "/placeholder.svg?height=600&width=600"}
                  alt={dog.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute top-4 left-4 flex space-x-2">
                  <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Available
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-3xl font-bold text-turquoise-800 dark:text-turquoise-200">
                      {dog.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-lg px-3 py-1 bg-turquoise-50 text-turquoise-700 border-turquoise-200 dark:bg-turquoise-900/20 dark:text-turquoise-300 dark:border-turquoise-800"
                    >
                      {dog.age} {dog.age === 1 ? "year" : "years"} old
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="px-0 py-4 flex-grow">
                  <div className="space-y-6">
                    <motion.div
                      className="bg-turquoise-50 dark:bg-turquoise-900/10 rounded-lg p-4 border border-turquoise-100 dark:border-turquoise-900/30"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <h3 className="text-lg font-semibold text-turquoise-700 dark:text-turquoise-300 mb-2">
                        Perfect Match!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Based on your preferences, {dog.name} is your ideal companion. This {dog.age}-year-old{" "}
                        {dog.breed} can't wait to meet you!
                      </p>
                    </motion.div>

                    <div>
                      <h3 className="text-lg font-semibold text-turquoise-700 dark:text-turquoise-300">Breed</h3>
                      <p className="text-gray-600 dark:text-gray-300">{dog.breed}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-turquoise-700 dark:text-turquoise-300">Location</h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 mr-1 text-turquoise-500" />
                        <span>{dog.zip_code}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-turquoise-700 dark:text-turquoise-300">About</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {dog.name} is a loving {dog.age}-year-old {dog.breed} looking for a forever home. This adorable
                        pup is ready to bring joy and companionship to your life!
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-0 pt-4 border-t border-turquoise-100 dark:border-gray-700 flex flex-col space-y-4">
                  <div className="flex space-x-3 w-full">
                    <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button className="w-full bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700 text-white">
                        Contact Shelter
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-turquoise-200 text-turquoise-700 dark:border-gray-700 dark:text-turquoise-300"
                      >
                        <Heart className="h-5 w-5" />
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-turquoise-200 text-turquoise-700 dark:border-gray-700 dark:text-turquoise-300"
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-turquoise-200 text-turquoise-700 dark:border-gray-700 dark:text-turquoise-300"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </div>

                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Contact the shelter to proceed with adoption
                  </p>
                </CardFooter>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

