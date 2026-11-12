const VEHICULES_DEMO = [
  { id: 1, marque: 'Toyota', modele: 'Corolla', annee: 2021, prix: 9800000, kilometrage: 42000, carburant: 'Essence', transmission: 'Automatique', etat: 'Occasion', couleur: 'Gris', portes: 4, description: 'Berline économique et fiable, entretien suivi en concession.', image: null },
  { id: 2, marque: 'Toyota', modele: 'Land Cruiser Prado', annee: 2022, prix: 38500000, kilometrage: 28000, carburant: 'Diesel', transmission: 'Automatique', etat: 'Occasion', couleur: 'Blanc', portes: 5, description: '4x4 7 places, intérieur cuir, caméra de recul.', image: null },
  { id: 3, marque: 'Hyundai', modele: 'Tucson', annee: 2023, prix: 21500000, kilometrage: 0, carburant: 'Essence', transmission: 'Automatique', etat: 'Neuf', couleur: 'Noir', portes: 5, description: 'SUV compact neuf, garantie constructeur 5 ans.', image: null },
  { id: 4, marque: 'Peugeot', modele: '3008', annee: 2020, prix: 11900000, kilometrage: 61000, carburant: 'Diesel', transmission: 'Manuelle', etat: 'Occasion', couleur: 'Bleu', portes: 5, description: 'SUV familial, faible consommation, première main.', image: null },
  { id: 5, marque: 'Kia', modele: 'Sportage', annee: 2022, prix: 17200000, kilometrage: 19000, carburant: 'Hybride', transmission: 'Automatique', etat: 'Occasion', couleur: 'Rouge', portes: 5, description: 'Motorisation hybride, écran tactile, aides à la conduite.', image: null },
  { id: 6, marque: 'Mercedes-Benz', modele: 'Classe C', annee: 2019, prix: 18900000, kilometrage: 74000, carburant: 'Diesel', transmission: 'Automatique', etat: 'Occasion', couleur: 'Noir', portes: 4, description: 'Finition AMG Line, toit ouvrant, historique complet.', image: null },
  { id: 7, marque: 'Renault', modele: 'Duster', annee: 2021, prix: 7400000, kilometrage: 53000, carburant: 'Essence', transmission: 'Manuelle', etat: 'Occasion', couleur: 'Orange', portes: 5, description: 'Robuste et polyvalent, idéal route et piste.', image: null },
  { id: 8, marque: 'Tesla', modele: 'Model 3', annee: 2023, prix: 29900000, kilometrage: 8000, carburant: 'Électrique', transmission: 'Automatique', etat: 'Occasion', couleur: 'Blanc', portes: 4, description: 'Autonomie 500 km, mises à jour à distance.', image: null }
];

function listeDemo(p) {
  let liste = VEHICULES_DEMO.filter(v =>
    (!p.marque || v.marque === p.marque) &&
    (!p.carburant || v.carburant === p.carburant) &&
    (!p.prix_max || v.prix <= +p.prix_max) &&
    (!p.annee_min || v.annee >= +p.annee_min) &&
    (!p.q || `${v.marque} ${v.modele} ${v.description}`.toLowerCase().includes(p.q.toLowerCase()))
  );
  const tris = {
    prix_asc: (a, b) => a.prix - b.prix,
    prix_desc: (a, b) => b.prix - a.prix,
    km_asc: (a, b) => a.kilometrage - b.kilometrage,
    recent: (a, b) => b.annee - a.annee
  };
  liste.sort(tris[p.tri] || tris.recent);
  const page = +p.page || 1, n = CONFIG.PAR_PAGE;
  return {
    data: liste.slice((page - 1) * n, page * n),
    meta: { current_page: page, last_page: Math.max(1, Math.ceil(liste.length / n)), total: liste.length }
  };
}
