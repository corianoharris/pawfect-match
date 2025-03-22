import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import DogsPage from "@/app/dogs/page"
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
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
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

  it("filters dogs by breed when selecting a breed", async () => {
    render(<DogsPage />, { wrapper: createWrapper() })

    // Wait for breeds to load
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
    })

    // Open the filter sidebar on mobile
    const menuButton = screen.getByRole("button", { name: /toggle filter sidebar/i })
    fireEvent.click(menuButton)

    // Wait for the sidebar to open
    await waitFor(() => {
      expect(screen.getByText("Breeds")).toBeInTheDocument()
    })

    // Click on the Breeds accordion
    fireEvent.click(screen.getByText("Breeds"))

    // Select a breed
    const labradorCheckbox = await screen.findByLabelText("Labrador")
    fireEvent.click(labradorCheckbox)

    // Verify fetch was called with the correct breed filter
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("breeds=Labrador"), expect.any(Object))
    })
  })

  it("toggles favorite status when clicking the heart icon", async () => {
    render(<DogsPage />, { wrapper: createWrapper() })

    // Wait for dogs to load
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
    })

    // Find and click a favorite button
    const favoriteButtons = await screen.findAllByRole("switch", { name: /add .* to favorites/i })
    fireEvent.click(favoriteButtons[0])

    // Check that the favorite count is updated
    expect(screen.getByText("1")).toBeInTheDocument()

    // Click the same button again to unfavorite
    fireEvent.click(favoriteButtons[0])

    // Check that the favorite count is gone
    expect(screen.queryByText("1")).not.toBeInTheDocument()
  })

  it("navigates to dog details page when clicking on a dog card", async () => {
    render(<DogsPage />, { wrapper: createWrapper() })

    // Wait for dogs to load
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
    })

    // Find and click a "Learn More" button
    const learnMoreButtons = await screen.findAllByRole("button", { name: /learn more about/i })
    fireEvent.click(learnMoreButtons[0])

    // Check that router.push was called with the correct URL
    expect(mockRouter.push).toHaveBeenCalledWith("/dog?id=dog1")
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

