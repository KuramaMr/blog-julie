describe('Page d\'accueil', () => {
    beforeEach(() => {
      cy.visit('/');
    });
  
    it('affiche le titre de la page d\'accueil', () => {
      cy.get('.home-title').should('contain', 'Bienvenue sur mon blog');
    });
  
    it('affiche les liens d\'inscription et de connexion pour les invités', () => {
      cy.get('.guest-info').should('exist');
      cy.get('.signup-link').should('exist');
      cy.get('.login-link').should('exist');
    });
  
    it('affiche le résumé des posts', () => {
      cy.get('.posts-summary').should('exist');
      cy.get('.posts-summary-title').should('contain', 'Résumé des Posts');
    });
  
    it('permet la navigation vers les détails d\'un post', () => {
      cy.get('.posts-summary li').first().find('a').click();
      cy.url().should('include', '/posts/');
    });
  });