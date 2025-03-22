describe("Basic Test", () => {
    it("should visit the home page", () => {
      cy.visit("/")
      cy.contains("div", "Pawfect Match").should("be.visible")
    })
  })
  
  