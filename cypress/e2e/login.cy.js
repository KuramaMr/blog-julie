describe('Page de connexion', () => {
    beforeEach(() => {
      cy.visit('/login');
    });
  
    it('affiche le formulaire de connexion', () => {
      cy.get('.auth-form').should('exist');
      cy.get('h2').should('contain', 'Connexion');
    });
  
    it('permet la saisie des informations de connexion et la soumission du formulaire', () => {
      cy.login();
      // Vérifiez ici que la connexion a réussi, par exemple en vérifiant la redirection ou un message de succès
    });
  
    it('affiche un lien vers la page d\'inscription', () => {
      cy.get('.auth-link').should('contain', 'Pas de compte ? S\'inscrire').click();
      cy.url().should('include', '/signup');
    });
  });