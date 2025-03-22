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

    // Visit the login page
    cy.visit("/")
  })

  it("should login and navigate to dogs page", () => {
    // Fill in login form
    cy.get('input[name="name"]').type(exampleUserLogin.username)
    cy.get('input[name="email"]').type(exampleUserLogin.email)
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
    cy.findByText("Pawfect Match").should("be.visible")
    cy.findByText("Available Dogs").should("be.visible")

    // Verify dog cards are displayed
    cy.findByText("Buddy").should("be.visible")
    cy.findByText("Max").should("be.visible")
    cy.findByText("Charlie").should("be.visible")
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
    cy.findByRole("button", { name: /toggle filter sidebar/i }).click()

    // Open the breeds accordion
    cy.findByText("Breeds").click()

    // Intercept the search request with the breed filter
    cy.intercept("GET", "**/dogs/search*breeds=Labrador*", {
      statusCode: 200,
      body: {
        resultIds: ["dog1"],
        total: 1,
        next: null,
        prev: null,
      },
    }).as("filteredDogsRequest")

    // Select a breed
    cy.findByLabelText("Labrador").click()

    // Wait for the filtered request
    cy.wait("@filteredDogsRequest")

    // Intercept the dogs details request
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

    cy.wait("@filteredDogsDetailsRequest")

    // Verify only the Labrador is shown
    cy.findByText("Buddy").should("be.visible")
    cy.findByText("Max").should("not.exist")
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

    // Add a dog to favorites
    cy.findAllByRole("switch", { name: /add .* to favorites/i })
      .first()
      .click()

    // Verify the favorite count is updated
    cy.findByText("1").should("be.visible")

    // Click the match button
    cy.findByRole("button", { name: /find a match/i }).click()

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

    // Click on a dog's details button
    cy.findAllByRole("button", { name: /learn more about/i })
      .first()
      .click()

    // Verify we're redirected to the dog details page
    cy.url().should("include", "/dog?id=dog1")
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

    // Click the dark mode toggle
    cy.findByRole("button", { name: /switch to dark mode/i }).click()

    // Verify dark mode is enabled
    cy.get("html").should("have.class", "dark")

    // Toggle back to light mode
    cy.findByRole("button", { name: /switch to light mode/i }).click()

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

    // Click the logout button
    cy.findByRole("button", { name: /logout/i }).click()

    // Wait for logout request
    cy.wait("@logoutRequest")

    // Verify we're redirected to the login page
    cy.url().should("eq", Cypress.config().baseUrl + "/")
  })
})

