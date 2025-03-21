import type { Metadata } from "next"
import { notFound } from "next/navigation"
import CategoryExplore from "@/components/category-explore"

type Props = {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params

  const categoryMap: Record<string, string> = {
    "new-arrivals": "New Arrivals",
    "staff-picks": "Staff Picks",
    "special-needs": "Special Needs",
  }

  const title = categoryMap[category]

  if (!title) {
    return {
      title: "Category Not Found | Pawfect Match",
    }
  }

  return {
    title: `${title} | Pawfect Match`,
    description: `Explore our ${title.toLowerCase()} dogs available for adoption`,
  }
}

export function generateStaticParams() {
  return [{ category: "new-arrivals" }, { category: "staff-picks" }, { category: "special-needs" }]
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params

  const validCategories = ["new-arrivals", "staff-picks", "special-needs"]

  if (!validCategories.includes(category)) {
    notFound()
  }

  return <CategoryExplore category={category} />
}

