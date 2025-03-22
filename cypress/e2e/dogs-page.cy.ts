import { exampleUserLogin } from "../../mockData/user"

describe("Dogs Page", () => {
  beforeEach(() => {
    // Intercept API calls and provide mock responses
    cy.intercept("POST", "**/auth/login", {
      statusCode: 200,
      body: { success: true },
    }).as("loginRequest")

    cy.intercept("GET", "**/dogs/breeds", {
      statusCode: 200,
      body: ["Labrador", "Poodle", "Golden Retriever", "Beagle", "Bulldog"],
    }).as("getBreedsRequest")

    cy.intercept("GET", "**/dogs/search*", {
      statusCode: 200,
      body: {
        resultIds: ["dog1", "dog2", "dog3", "dog4", "dog5", "dog6"],
        total: 6,
        next: null,
        prev: null,
      },
    }).as("searchDogsRequest")

    cy.intercept("POST", "**/dogs", {
      statusCode: 200,
      body: [
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
        {
          id: "dog4",
          name: "Cooper",
          breed: "Beagle",
          age: 1,
          zip_code: "13579",
          img: "/placeholder.svg",
        },
        {
          id: "dog5",
          name: "Rocky",
          breed: "Bulldog",
          age: 5,
          zip_code: "24680",
          img: "/placeholder.svg",
        },
        {
          id: "dog6",
          name: "Bailey",
          breed: "Golden Retriever",
          age: 3,
          zip_code: "97531",
          img: "/placeholder.svg",
        },
      ],
    }).as("getDogsRequest")

    cy.intercept("POST", "**/dogs/match", {
      statusCode: 200,
      body: { match: "dog1" },
    }).as("matchRequest")

    // Visit the login page with a retry option
    cy.visit("/", { timeout: 120000 })
  })

  it("should login and navigate to dogs page", () => {
    // Fill in login form
    cy.get('input[name="name"]', { timeout: 10000 }).should("be.visible").type(exampleUserLogin.username)
    cy.get('input[name="email"]', { timeout: 10000 }).should("be.visible").type(exampleUserLogin.email)
    cy.get('button[type="submit"]').click()

    // Wait for login request to complete
    cy.wait("@loginRequest")

    // Verify we're on the dogs page
    cy.url().should("include", "/dogs")

    // Wait for API requests to complete
    cy.wait("@getBreedsRequest")
    cy.wait("@searchDogsRequest")
    cy.wait("@getDogsRequest")

    // Verify page content
    cy.contains("Pawfect Match", { timeout: 10000 }).should("be.visible")
    cy.contains("Available Dogs", { timeout: 10000 }).should("be.visible")

    // Verify dog cards are displayed
    cy.contains("Buddy", { timeout: 10000 }).should("be.visible")
    cy.contains("Max", { timeout: 10000 }).should("be.visible")
    cy.contains("Charlie", { timeout: 10000 }).should("be.visible")
  })

  it("should filter dogs by breed", () => {
    // Login first
    cy.get('input[name="name"]').type(exampleUserLogin.username)
    cy.get('input[name="email"]').type(exampleUserLogin.email)
    cy.get('button[type="submit"]').click()
    cy.wait("@loginRequest")

    // Wait for API requests to complete
    cy.wait("@getBreedsRequest")
    cy.wait("@searchDogsRequest")
    cy.wait("@getDogsRequest")

    // Open the filter sidebar (on desktop it's already visible)
    cy.viewport("iphone-x") // Switch to mobile view to test the toggle

    // Click the mobile filter button
    cy.get('button[aria-label="Toggle filter sidebar"]').click()

    // Wait for the mobile sidebar to be visible
    cy.get('[role="dialog"][aria-modal="true"]').should("be.visible")

    // Now click on the Breeds accordion in the mobile sidebar
    cy.get('[role="dialog"][aria-modal="true"]').contains("Breeds").click({ force: true })

    // Wait for the accordion content to be visible
    cy.get('[role="dialog"][aria-modal="true"]').find('[id*="breeds-content"]').should("be.visible")

    // Intercept both the search request and the dogs details request together
    cy.intercept("GET", "**/dogs/search*", {
      statusCode: 200,
      body: {
        resultIds: ["dog1"],
        total: 1,
        next: null,
        prev: null,
      },
    }).as("filteredDogsRequest")

    cy.intercept("POST", "**/dogs", {
      statusCode: 200,
      body: [
        {
          id: "dog1",
          name: "Buddy",
          breed: "Labrador",
          age: 3,
          zip_code: "12345",
          img: "/placeholder.svg",
        },
      ],
    }).as("filteredDogsDetailsRequest")

    // Select a breed in the mobile sidebar
    cy.get('[role="dialog"][aria-modal="true"]').contains("Labrador").click({ force: true })

    // Close the mobile sidebar to see the results
    cy.get('[role="dialog"][aria-modal="true"]').find('button[aria-label="Close filters"]').click()

    // Wait for the filtered request - only wait for the search request
    cy.wait("@filteredDogsRequest")

    // Verify only the Labrador is shown - with a longer timeout
    cy.contains("Buddy", { timeout: 10000 }).should("be.visible")
    cy.contains("Max").should("not.exist")
  })

  it("should add dogs to favorites and find a match", () => {
    // Login first
    cy.get('input[name="name"]').type(exampleUserLogin.username)
    cy.get('input[name="email"]').type(exampleUserLogin.email)
    cy.get('button[type="submit"]').click()
    cy.wait("@loginRequest")

    // Wait for API requests to complete
    cy.wait("@getBreedsRequest")
    cy.wait("@searchDogsRequest")
    cy.wait("@getDogsRequest")

    // Add a dog to favorites - use a more reliable selector
    cy.get('[role="switch"][aria-pressed="false"]').first().click()

    // Verify the favorite count is updated
    cy.contains("1").should("be.visible")

    // Click the match button
    cy.get('button[aria-label^="Find a match"]').click()

    // Wait for match request
    cy.wait("@matchRequest")

    // Verify we're redirected to the match page
    cy.url().should("include", "/match?id=dog1")
  })

  it("should navigate to dog details page", () => {
    // Login first
    cy.get('input[name="name"]').type(exampleUserLogin.username)
    cy.get('input[name="email"]').type(exampleUserLogin.email)
    cy.get('button[type="submit"]').click()
    cy.wait("@loginRequest")

    // Wait for API requests to complete
    cy.wait("@getBreedsRequest")
    cy.wait("@searchDogsRequest")
    cy.wait("@getDogsRequest")

    // Click on a dog's details button - use a more reliable selector
    cy.contains("Details").first().click()

    // Verify we're redirected to the dog details page
    cy.url().should("include", "/details")
  })

  it("should toggle dark mode", () => {
    // Login first
    cy.get('input[name="name"]').type(exampleUserLogin.username)
    cy.get('input[name="email"]').type(exampleUserLogin.email)
    cy.get('button[type="submit"]').click()
    cy.wait("@loginRequest")

    // Wait for API requests to complete
    cy.wait("@getBreedsRequest")
    cy.wait("@searchDogsRequest")
    cy.wait("@getDogsRequest")

    // Check initial state (light mode)
    cy.get("html").should("not.have.class", "dark")

    // Click the dark mode toggle - use a more reliable selector
    cy.get('button[aria-label*="dark mode"]').click()

    // Verify dark mode is enabled
    cy.get("html").should("have.class", "dark")

    // Toggle back to light mode
    cy.get('button[aria-label*="light mode"]').click()

    // Verify light mode is enabled
    cy.get("html").should("not.have.class", "dark")
  })

  it("should logout successfully", () => {
    // Login first
    cy.get('input[name="name"]').type(exampleUserLogin.username)
    cy.get('input[name="email"]').type(exampleUserLogin.email)
    cy.get('button[type="submit"]').click()
    cy.wait("@loginRequest")

    // Wait for API requests to complete
    cy.wait("@getBreedsRequest")
    cy.wait("@searchDogsRequest")
    cy.wait("@getDogsRequest")

    // Intercept logout request
    cy.intercept("POST", "**/auth/logout", {
      statusCode: 200,
      body: { success: true },
    }).as("logoutRequest")

    // Click the logout button - use a more reliable selector
    cy.contains("Logout").click()

    // Wait for logout request
    cy.wait("@logoutRequest")

    // Verify we're redirected to the login page
    cy.url().should("eq", Cypress.config().baseUrl + "/")
  })
})

