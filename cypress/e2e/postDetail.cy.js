describe('Page de détail d\'un post', () => {
  beforeEach(() => {
    // Commencer par la page d'accueil ou la page de recherche
    cy.visit('/');
    // Attendre que les posts soient chargés
    cy.get('.posts-summary', { timeout: 10000 }).should('exist');
    // Cliquer sur le premier post disponible
    cy.get('.posts-summary li').first().find('a').click();
    cy.wait(1000);
    // Attendre que la page de détail soit chargée
    cy.get('.post-detail-container', { timeout: 10000 }).should('exist');
  });

  it('affiche le titre du post', () => {
    cy.get('.post-detail-title').should('exist');
  });

  it('affiche les informations du post', () => {
    cy.get('.post-detail-info').should('exist');
  });

  it('affiche le contenu du post', () => {
    cy.get('.ql-editor').should('exist');
  });

  it('affiche la date de publication', () => {
    cy.get('.post-detail-date').should('exist');
  });

  it('permet la modification du post pour les administrateurs', () => {
    cy.login();
    cy.visit('/');
    cy.wait(1000);
    cy.get('.posts-summary', { timeout: 10000 }).should('exist');
    cy.get('.posts-summary li').wait(1000).first().find('a').click();
    cy.wait(1000);
    cy.get('.post-detail-container', { timeout: 10000 }).should('exist');
    cy.get('.edit-post-button').should('exist').click();
    cy.wait(1000);
    cy.get('button[type="submit"]').should('exist');
  });
});