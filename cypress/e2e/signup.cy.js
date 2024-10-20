describe('Page d\'inscription', () => {
    beforeEach(() => {
      cy.visit('/signup');
    });
  
    it('affiche le formulaire d\'inscription', () => {
      cy.get('.auth-form').should('exist');
      cy.get('h2').should('contain', 'Inscription');
    });
  
    it('permet la saisie des informations d\'inscription', () => {
      cy.get('input[type="email"]').type('newuser@example.com');
      cy.get('input[type="password"]').type('newpassword123');
    });
  
    it('permet la soumission du formulaire', () => {
      cy.get('input[type="email"]').type('newuser@example.com');
      cy.get('input[type="password"]').type('newpassword123');
      cy.get('button[type="submit"]').click();
      // Ajoutez ici la vérification de l'inscription réussie
    });
  
    it('affiche un lien vers la page de connexion', () => {
      cy.get('.auth-link').should('contain', 'Déjà un compte ? Se connecter').click();
      cy.url().should('include', '/login');
    });
  });