"use client"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import DogsPage from "../app/dogs/page" // Make sure this path is correct
import { useRouter } from "next/navigation"
import type * as React from "react"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}))

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock components that might cause issues in tests
jest.mock("@/components/filter-sidebar", () => ({
  FilterSidebar: () => <div data-testid="filter-sidebar">Filter Sidebar</div>,
}))

jest.mock("@/components/filter-searchbar", () => ({
  FilterSearchBar: () => <div data-testid="filter-searchbar">Search Bar</div>,
}))

jest.mock("@/components/featuredBreed", () => ({
  __esModule: true,
  default: () => <div data-testid="featured-breed">Featured Breed</div>,
}))

jest.mock("@/components/dog-card", () => ({
  DogCard: ({ dog, isFavorite, onToggleFavorite }: any) => (
    <div data-testid={`dog-card-${dog.id}`}>
      <h3>{dog.name}</h3>
      <button
        onClick={onToggleFavorite}
        role="switch"
        aria-pressed={isFavorite}
        aria-label={`${isFavorite ? "Remove" : "Add"} ${dog.name} to favorites`}
      >
        Favorite
      </button>
      <button onClick={() => {}} aria-label={`Learn more about ${dog.name}`}>
        Learn More
      </button>
    </div>
  ),
}))

// Mock API responses
global.fetch = jest.fn().mockImplementation((url) => {
  if (url.includes("/dogs/breeds")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(["Labrador", "Poodle", "Golden Retriever"]),
    })
  }

  if (url.includes("/dogs/search")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          resultIds: ["dog1", "dog2", "dog3"],
          total: 3,
          next: null,
          prev: null,
        }),
    })
  }

  if (url.includes("/dogs") && !url.includes("/search")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: "dog1",
            name: "Buddy",
            breed: "Labrador",
            age: 3,
            zip_code: "12345",
            img: "/placeholder.svg",
          },
          {
            id: "dog2",
            name: "Max",
            breed: "Poodle",
            age: 2,
            zip_code: "67890",
            img: "/placeholder.svg",
          },
          {
            id: "dog3",
            name: "Charlie",
            breed: "Golden Retriever",
            age: 4,
            zip_code: "54321",
            img: "/placeholder.svg",
          },
        ]),
    })
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
})

// Create a wrapper with React Query provider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe("DogsPage", () => {
  const mockRouter = {
    push: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it("renders the dogs page with loading state initially", async () => {
    render(<DogsPage />, { wrapper: createWrapper() })

    // Check for loading state
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("renders the dogs list after loading", async () => {
    render(<DogsPage />, { wrapper: createWrapper() })

    // Wait for dogs to load
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
    })

    // Check for dog cards
    await waitFor(() => {
      expect(screen.getByText("Buddy")).toBeInTheDocument()
      expect(screen.getByText("Max")).toBeInTheDocument()
      expect(screen.getByText("Charlie")).toBeInTheDocument()
    })
  })

  it("toggles favorite status when clicking the heart icon", async () => {
    render(<DogsPage />, { wrapper: createWrapper() })

    // Wait for dogs to load
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
    })

    // Find and click a favorite button
    const favoriteButtons = await screen.findAllByRole("switch")
    fireEvent.click(favoriteButtons[0])

    // Check that the favorite count is updated
    expect(screen.getByText("1")).toBeInTheDocument()

    // Click the same button again to unfavorite
    fireEvent.click(favoriteButtons[0])

    // Check that the favorite count is gone
    expect(screen.queryByText("1")).not.toBeInTheDocument()
  })

  it("handles logout when clicking the logout button", async () => {
    render(<DogsPage />, { wrapper: createWrapper() })

    // Wait for dogs to load
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
    })

    // Find and click the logout button
    const logoutButton = screen.getByRole("button", { name: /logout/i })
    fireEvent.click(logoutButton)

    // Check that fetch was called for logout
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    )

    // Check that router.push was called to redirect to login
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/")
    })
  })
})

