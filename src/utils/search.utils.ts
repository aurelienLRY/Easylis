
/*
 * Recherche dans un objet
 * @param objet - L'objet à rechercher
 * @param search - La recherche à effectuer
 * @returns Les objets qui correspondent à la recherche
 */ 
 export function SearchInObject(objet: object[] , search: string ) : object[] {
    const searchLower = search.toLowerCase(); // Convertir la recherche en minuscules pour une comparaison insensible à la casse
  
    function searchIn(obj: any): boolean {
      if (obj !== null && typeof obj === "object") {
        for (const [cle, valeur] of Object.entries(obj)) {
          // Vérifier si la valeur est une chaîne et si elle contient la chaîne de recherche
          if (
            typeof valeur === "string" &&
            valeur.toLowerCase().includes(searchLower)
          ) {
            return true; // Correspondance trouvée, renvoyer vrai
          }
          // Récursion pour chercher dans les objets imbriqués
          if (typeof valeur === "object" && searchIn(valeur)) {
            return true; // Correspondance trouvée dans un sous-objet, renvoyer vrai
          }
        }
      }
      return false; // Aucune correspondance trouvée, renvoyer faux
    }
  
    return objet.filter((obj : object) => searchIn(obj)); // Filtrer les sessions où une correspondance est trouvée
  }