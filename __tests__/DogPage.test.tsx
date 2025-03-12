import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import DogsPage from "../app/dogs/page"
import { act } from "react-dom/test-utils"

// Mock the next/navigation module
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock the environment variable
process.env.NEXT_PUBLIC_API_BASE_URL = "http://test-api.com"

describe("DogsPage", () => {
  const queryClient = new QueryClient()

  it("renders the dogs page", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DogsPage />
      </QueryClientProvider>,
    )

    // Check if the page title is rendered
    expect(screen.getByText("Pawfect Match")).toBeInTheDocument()

    // Check if the search input is rendered
    expect(screen.getByPlaceholderText("Search dogs...")).toBeInTheDocument()

    // Check if the sort button is rendered
    expect(screen.getByText("A-Z")).toBeInTheDocument()

    // Check if the match button is rendered
    expect(screen.getByText("Match")).toBeInTheDocument()

    // Wait for the dogs to load
    await waitFor(() => {
      expect(screen.queryByText("No dogs found matching your criteria")).not.toBeInTheDocument()
    })
  })

  it("toggles dark mode", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DogsPage />
      </QueryClientProvider>,
    )

    const darkModeButton = screen.getByRole("button", { name: /toggle dark mode/i })
    expect(darkModeButton).toBeInTheDocument()

    // Initial state should be light mode
    expect(document.documentElement.classList.contains("dark")).toBeFalsy()

    // Toggle dark mode
    await act(async () => {
      fireEvent.click(darkModeButton)
    })

    // Check if dark mode is applied
    expect(document.documentElement.classList.contains("dark")).toBeTruthy()

    // Toggle back to light mode
    await act(async () => {
      fireEvent.click(darkModeButton)
    })

    // Check if light mode is applied
    expect(document.documentElement.classList.contains("dark")).toBeFalsy()
  })

  it("opens and closes the mobile filter sidebar", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DogsPage />
      </QueryClientProvider>,
    )

    const filterButton = screen.getByRole("button", { name: /search/i })
    expect(filterButton).toBeInTheDocument()

    // Open the filter sidebar
    await act(async () => {
      fireEvent.click(filterButton)
    })

    const filterSidebar = screen.getByText("Filters")
    expect(filterSidebar).toBeVisible()

    // Close the filter sidebar
    const closeButton = screen.getByRole("button", { name: /close/i })
    await act(async () => {
      fireEvent.click(closeButton)
    })

    expect(filterSidebar).not.toBeVisible()
  })

  // Add more tests as needed
})

