Cypress.Commands.add('login', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(Cypress.env('USER_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('USER_PASSWORD'));
    cy.get('button[type="submit"]').click();
  });