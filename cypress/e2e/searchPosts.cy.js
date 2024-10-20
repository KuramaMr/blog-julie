describe('Page de recherche de posts', () => {
    beforeEach(() => {
      cy.visit('/search-posts');
    });
  
    it('affiche le titre de la page de recherche', () => {
      cy.get('.search-title').should('contain', 'Rechercher des Posts');
    });
  
    it('permet la recherche par titre ou contenu', () => {
      cy.get('input[placeholder="Rechercher par titre ou contenu"]').type('test');
      // Vérifiez que les résultats sont mis à jour
    });
  
    it('permet le filtrage par pays', () => {
      cy.get('input[placeholder="Filtrer par pays"]').type('France');
      // Vérifiez que les résultats sont mis à jour
    });
  
    it('permet le filtrage par date', () => {
      cy.get('input[type="date"]').type('2023-05-01');
      // Vérifiez que les résultats sont mis à jour
    });
  
    it('permet le tri des résultats', () => {
      cy.get('select').select('title');
      // Vérifiez que les résultats sont triés par titre
    });
  
    it('affiche les détails des posts dans les résultats', () => {
      cy.get('.post-item').first().should('contain', 'Lire la suite');
    });
  });