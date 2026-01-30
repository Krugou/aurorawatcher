import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3005",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: false, // Disabling support file for simplicity if not needed yet
  },
});
