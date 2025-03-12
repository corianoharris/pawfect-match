describe("Dog Page", () => {
  beforeEach(() => {
    cy.visit("/dogs")
  })

  it("loads the dog page successfully", () => {
    cy.contains("Pawfect Match").should("be.visible")
    cy.get('input[placeholder="Search dogs..."]').should("be.visible")
    cy.contains("button", "A-Z").should("be.visible")
    cy.contains("button", "Match").should("be.visible")
  })

  it("can toggle sort order", () => {
    cy.contains("button", "A-Z").click()
    cy.contains("button", "Z-A").should("be.visible")
  })

  it("can open and close the filter sidebar", () => {
    cy.get('button[aria-label="Open filters"]').click()
    cy.contains("Filters").should("be.visible")
    cy.get('button[aria-label="Close filters"]').click()
    cy.contains("Filters").should("not.be.visible")
  })

  it("displays dog cards", () => {
    cy.get('[data-testid="dog-card"]').should("have.length.greaterThan", 0)
  })

  it("can favorite a dog", () => {
    cy.get('[data-testid="dog-card"]')
      .first()
      .within(() => {
        cy.get('button[aria-label="Favorite"]').click()
      })
    cy.get('button[aria-label="Match"]').should("not.be.disabled")
  })

  it("toggles dark mode", () => {
    cy.get('button[aria-label="Toggle dark mode"]').as("darkModeToggle")
    cy.get("html").should("not.have.class", "dark")

    cy.get("@darkModeToggle").click()
    cy.get("html").should("have.class", "dark")

    cy.get("@darkModeToggle").click()
    cy.get("html").should("not.have.class", "dark")
  })

  it("displays featured dogs section", () => {
    cy.contains("h2", "Featured Dogs").should("be.visible")
    cy.get(".bg-gradient-to-br").should("have.length", 3)
    cy.contains("New Arrivals").should("be.visible")
    cy.contains("Staff Picks").should("be.visible")
    cy.contains("Special Needs").should("be.visible")
  })

  it("applies and clears filters", () => {
    // Open filter sidebar on mobile
    cy.viewport("iphone-x")
    cy.get('button[aria-label="Open filters"]').click()

    // Select a breed
    cy.get('input[placeholder="Search breeds..."]').type("Labrador")
    cy.contains("label", "Labrador").click()

    // Set age range
    cy.get('input[placeholder="Min"]').type("2")
    cy.get('input[placeholder="Max"]').type("5")

    // Apply filters
    cy.contains("button", "Apply").click()

    // Verify filtered results
    cy.get('[data-testid="dog-card"]').should("have.length.greaterThan", 0)

    // Clear filters
    cy.contains("button", "Clear").click()

    // Verify all dogs are shown
    cy.get('[data-testid="dog-card"]').should("have.length.greaterThan", 0)
  })

  it("uses infinite scroll to load more dogs", () => {
    cy.get('[data-testid="dog-card"]').as("dogCards")
    cy.get("@dogCards")
      .its("length")
      .then((initialCount) => {
        cy.scrollTo("bottom")
        cy.wait(1000) // Wait for new dogs to load
        cy.get("@dogCards").its("length").should("be.gt", initialCount)
      })
  })
  // Add more tests as needed
})

