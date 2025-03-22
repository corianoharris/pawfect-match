"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Clock, Award } from "lucide-react"
import { Button } from "@/components/ui/button"

const categories = [
  {
    id: "new-arrivals",
    title: "New Arrivals",
    description: "Meet our newest furry friends looking for homes",
    icon: <Clock className="h-6 w-6 text-blue-500" />,
    color: "from-blue-500 to-blue-600",
    textColor: "text-blue-800",
  },
  {
    id: "staff-picks",
    title: "Staff Picks",
    description: "Dogs our staff think deserve extra attention",
    icon: <Award className="h-6 w-6 text-purple-500" />,
    color: "from-purple-500 to-purple-600",
    textColor: "text-purple-800",
  },
  {
    id: "special-needs",
    title: "Special Needs",
    description: "These loving dogs need special care",
    icon: <Heart className="h-6 w-6 text-pink-500" />,
    color: "from-pink-500 to-pink-600",
    textColor: "text-pink-800",
  },
]

export default function ExploreLayout() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/explore/${categoryId}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dogs?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="">
      <main className="container px-4 py-8 w-full" id="main-content" aria-labelledby="explore-heading">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1
            id="explore-heading"
            className="text-3xl font-bold text-turquoise-800 dark:text-turquoise-200 mb-4"
            tabIndex={0}
          >
            Explore Dog Categories
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8" tabIndex={0}>
            Discover dogs by category and find your perfect companion. Each collection features dogs with unique
            characteristics and needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list" aria-label="Dog categories">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, stiffness: 300 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              className={`bg-gradient-to-br ${category.color} rounded-xl overflow-hidden text-white shadow-lg`}
              role="listitem"
              tabIndex={0}
              aria-labelledby={`category-title-${category.id}`}
            >
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span aria-hidden="true">{category.icon}</span>
                  <h3 id={`category-title-${category.id}`} className="text-xl font-bold ml-2">
                    {category.title}
                  </h3>
                </div>
                <p className="text-white/80 mb-4">{category.description}</p>
                <Button
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-none"
                  onClick={() => router.push(`/explore/${category.id}`)}
                  aria-label={`Explore ${category.title} dogs`}
                >
                  Explore
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

