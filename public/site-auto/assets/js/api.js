/*
 * Contrat attendu côté Laravel :
 *   GET /api/vehicules?q=&marque=&carburant=&prix_max=&annee_min=&tri=&page=
 *       -> { data: [...], meta: { current_page, last_page, total } }   (ressource paginée)
 *   GET /api/marques -> [ "Toyota", "Kia", ... ]
 */
const Api = {
  async get(chemin, params = {}) {
    const url = new URL(CONFIG.API_URL + chemin, window.location.origin);
    Object.entries(params).forEach(([k, v]) => v !== '' && v != null && url.searchParams.set(k, v));
    const rep = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!rep.ok) throw new Error('HTTP ' + rep.status);
    return rep.json();
  },

  async vehicules(params) {
    try { return await this.get('/vehicules', params); }
    catch (e) { if (!CONFIG.REPLI_DEMO) throw e; return listeDemo(params); }
  },

  async marques() {
    try { return await this.get('/marques'); }
    catch (e) {
      if (!CONFIG.REPLI_DEMO) throw e;
      return [...new Set(VEHICULES_DEMO.map(v => v.marque))].sort();
    }
  },

  async envoyerDemande(donnees) {
    try {
      const rep = await fetch(CONFIG.API_URL + '/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(donnees)
      });
      const json = await rep.json().catch(() => ({}));
      if (rep.ok) return { ok: true, message: json.message };
      const detail = json.errors ? Object.values(json.errors).flat().join(' ') : json.message;
      return { ok: false, message: detail || 'Envoi impossible, réessayez.' };
    } catch (e) {
      return { ok: false, message: 'Connexion impossible. Réessayez dans un instant.' };
    }
  }
};
