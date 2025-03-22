import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Add a longer timeout for the server to start
    defaultCommandTimeout: 30000,
    // Add a longer timeout for page loads
    pageLoadTimeout: 120000,
    // Add a longer timeout for requests
    requestTimeout: 30000,
    // Add a longer timeout for responses
    responseTimeout: 30000,
    // Add retries for flaky tests
    retries: {
      runMode: 2,
      openMode: 1,
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },

  viewportWidth: 1280,
  viewportHeight: 720,
})

