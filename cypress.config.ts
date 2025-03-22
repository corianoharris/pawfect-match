import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Implement node event listeners here (if needed)
      config.baseUrl = "http://localhost:3000";  // Correctly set the baseUrl
      return config;  // Don't forget to return the config object
    },
  },
});
