describe('Page d\'ajout de post', () => {
    beforeEach(() => {
      // Simulez la connexion d'un utilisateur admin
      cy.login();
      cy.wait(1000);
      cy.visit('/add-post');
      cy.wait(1000);
    });
  
    it('affiche le formulaire d\'ajout de post', () => {
      cy.get('.add-post-container').should('exist');
      cy.get('h2').should('contain', 'Ajouter un Post');
    });
  
    it('permet la saisie des informations du post', () => {
      cy.get('input[placeholder="Titre"]').type('Nouveau post de test');
      cy.get('input[type="date"]').type('2023-05-01');
      cy.get('input[placeholder="Pays"]').type('France');
      cy.get('textarea[placeholder="Courte description du voyage"]').type('Description de test');
      cy.get('.ql-editor').type('Contenu du post de test');
    });
  
    it('permet l\'ajout d\'une image', () => {
      cy.get('.add-post-button').contains('Insérer une image').click();
      // Simulez l'ajout d'une image
    });
  
    it('permet la soumission du formulaire', () => {
      cy.get('input[placeholder="Titre"]').type('Nouveau post de test');
      cy.get('input[type="date"]').type('2023-05-01');
      cy.get('input[placeholder="Pays"]').type('France');
      cy.get('textarea[placeholder="Courte description du voyage"]').type('Description de test');
      cy.get('.ql-editor').type('Contenu du post de test');
      cy.get('button[type="submit"]').click();
      // Vérifiez la redirection ou le message de succès
    });
  });