const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: 'cypress/support/e2e.js',
    baseUrl: 'http://localhost:3000', // Remplacez par l'URL de base de votre application
  },
});
