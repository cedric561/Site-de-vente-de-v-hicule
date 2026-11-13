const $ = (s, r = document) => r.querySelector(s);
const NOM = CONFIG.NOM || 'BravoAuto';
const etat = { page: 1, liste: [], favoris: JSON.parse(localStorage.getItem('favoris') || '[]') };

const prix = n => new Intl.NumberFormat('fr-FR').format(n) + ' ' + CONFIG.DEVISE;
const km = n => n ? new Intl.NumberFormat('fr-FR').format(n) + ' km' : 'Neuf';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const imgs = v => (v.images && v.images.length ? v.images : v.image ? [v.image] : []);
const photo = v => imgs(v)[0] ? `<img src="${esc(imgs(v)[0])}" alt="${esc(v.marque + ' ' + v.modele)}" loading="lazy">` : '<i class="bi bi-car-front"></i>';
const lienWa = (txt = '') => `https://wa.me/${CONFIG.VENDEUR.whatsapp}?text=${encodeURIComponent(txt)}`;

const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting)), { threshold: .12 });
const revele = () => document.querySelectorAll('.rv').forEach(el => io.observe(el));

async function poster(chemin, donnees) {
  try {
    const rep = await fetch(CONFIG.API_URL + chemin, {
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

const alerte = () => `
  <section class="sec alerte">
    <div class="container"><div class="row align-items-center g-4">
      <div class="col-lg-5 rv"><span class="eyebrow">Alertes nouveautés</span><h2 class="fw-bold">Soyez prévenu sur WhatsApp</h2>
        <p class="text-muted mb-0">Laissez votre numéro : nous vous écrivons dès qu'un véhicule correspondant à votre recherche est publié.</p></div>
      <div class="col-lg-7 rv" style="--d:100ms">
        <form id="form-alerte" class="alerte-card" novalidate><div class="row g-2">
          <div class="col-md-6"><input class="form-control" name="nom" placeholder="Votre nom (facultatif)"></div>
          <div class="col-md-6"><input class="form-control" name="whatsapp" type="tel" placeholder="Numéro WhatsApp (ex. 07 00 00 00 00)" required></div>
          <div class="col-md-6"><select class="form-select" name="marque" id="alerte-marque"><option value="">Toutes les marques</option></select></div>
          <div class="col-md-6"><select class="form-select" name="budget_max"><option value="">Budget max (facultatif)</option><option value="5000000">5 000 000 FCFA</option><option value="10000000">10 000 000 FCFA</option><option value="20000000">20 000 000 FCFA</option><option value="40000000">40 000 000 FCFA</option></select></div>
          <div class="col-12"><div class="form-check"><input class="form-check-input" type="checkbox" name="consentement" id="consent">
            <label class="form-check-label small text-muted" for="consent">J'accepte d'être contacté sur WhatsApp au sujet des nouveaux véhicules. Je peux arrêter à tout moment en répondant STOP.</label></div></div>
          <div class="col-12" id="alerte-retour"></div>
          <div class="col-12 d-grid"><button class="btn btn-success" type="submit"><i class="bi bi-whatsapp me-2"></i>Je veux être alerté</button></div>
        </div></form>
      </div>
    </div></div>
  </section>`;

function alerteInit() {
  const f = $('#form-alerte');
  if (!f) return;
  Api.marques().then(ms => $('#alerte-marque').insertAdjacentHTML('beforeend', ms.map(m => `<option>${esc(m)}</option>`).join(''))).catch(() => {});
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const retour = $('#alerte-retour'), btn = f.querySelector('button');
    const d = Object.fromEntries(new FormData(f));
    d.consentement = f.consentement.checked;
    if (!d.consentement) { retour.innerHTML = '<div class="alert alert-warning mb-0">Merci de cocher la case de consentement.</div>'; return; }
    btn.disabled = true;
    const res = await poster('/abonnes', d);
    btn.disabled = false;
    if (res.ok) f.reset();
    retour.innerHTML = `<div class="alert alert-${res.ok ? 'success' : 'danger'} mb-0">${esc(res.message)}</div>`;
  });
}

const LOGO = '<svg width="32" height="32" viewBox="0 0 38 38" fill="none" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse"><stop stop-color="#f26a3d"/><stop offset="1" stop-color="#d1401a"/></linearGradient></defs><rect width="38" height="38" rx="10" fill="url(#lg)"/><path d="M9 12.5l4.2 13 5.8-9.6 5.8 9.6 4.2-13" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 30h18" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/></svg>';
const HEURES = { ouverture: 8, fermeture: 18 };
const initiales = n => String(n || NOM).split(' ').filter(Boolean).map(m => m[0]).slice(0, 2).join('').toUpperCase();
const imgSure = src => src ? `<img src="${esc(src)}" alt="" onerror="this.remove()">` : '';

function statutOuverture() {
  const t = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Abidjan' }));
  const j = t.getDay(), h = t.getHours() + t.getMinutes() / 60;
  if (j !== 0 && h >= HEURES.ouverture && h < HEURES.fermeture) return [true, `Ouvert · ferme à ${HEURES.fermeture}h`];
  const quand = (j === 6 && h >= HEURES.fermeture) || j === 0 ? 'lundi' : (h < HEURES.ouverture ? "aujourd'hui" : 'demain');
  return [false, `Fermé · ouvre ${quand} à ${HEURES.ouverture}h`];
}

const apropos = () => {
  const a = {
    nom: '', titre: 'Votre conseiller automobile', photo: '', galerie: [], chiffres: [],
    texte: [
      `Chez ${NOM}, acheter un véhicule doit rester une belle expérience. Chaque voiture proposée est sélectionnée avec soin, contrôlée avant la vente et présentée en toute transparence : état réel, historique et prix clairs.`,
      "Notre rôle est de vous accompagner de la première visite jusqu'à la remise des clés : conseils, essai du véhicule, facilités de paiement et suivi après-vente."
    ],
    valeurs: [
      ['bi-patch-check', 'Transparence', 'Prix clairs et état réel du véhicule, sans surprise.'],
      ['bi-wrench-adjustable', 'Véhicules contrôlés', 'Une inspection avant chaque mise en vente.'],
      ['bi-people', 'Accompagnement', "Conseils, essai et suivi après l'achat."]
    ],
    ...(CONFIG.APROPOS || {})
  };
  return `
  <section class="sec apropos" id="apropos"><div class="container"><div class="row align-items-center g-5">
    <div class="col-lg-5 rv"><div class="ap-visuel">
      <div class="ap-main"><i class="bi bi-person-badge"></i>${imgSure(a.photo)}</div>
      ${a.galerie.length ? `<div class="ap-mini">${a.galerie.slice(0, 2).map(g => `<div>${imgSure(g)}</div>`).join('')}</div>` : ''}
    </div></div>
    <div class="col-lg-7 rv" style="--d:120ms">
      <span class="eyebrow">Qui sommes-nous</span>
      <h2 class="fw-bold mb-1">${esc(a.nom || "Une équipe passionnée par l'automobile")}</h2>
      <p class="text-accent fw-semibold">${esc(a.titre)}</p>
      ${a.texte.map(t => `<p class="text-muted">${esc(t)}</p>`).join('')}
      ${a.chiffres.length ? `<div class="d-flex gap-4 my-4">${a.chiffres.map(([n, l]) => `<div class="chiffre"><strong>${esc(n)}</strong><div class="small text-muted">${esc(l)}</div></div>`).join('')}</div>` : ''}
      <div class="row g-3 my-2">${a.valeurs.map(([ic, t, d]) => `<div class="col-md-4"><div class="val"><i class="bi ${esc(ic)}"></i><div><div class="fw-bold">${esc(t)}</div><div class="small text-muted">${esc(d)}</div></div></div></div>`).join('')}</div>
      <div class="d-flex flex-wrap gap-2 mt-4">
        <a class="btn btn-accent px-4" data-wa target="_blank" rel="noopener" href="#"><i class="bi bi-whatsapp me-2"></i>Nous écrire</a>
        <a class="btn btn-outline-dark px-4" data-tel href="#"><i class="bi bi-telephone me-2"></i>Appeler</a>
      </div>
    </div>
  </div></div></section>`;
};

const developpeur = () => {
  const d = {
    nom: 'Cedric Yomenou', titre: 'Développeur web & mobile', photo: '', whatsapp: '', email: '',
    texte: 'Ce site (catalogue, alertes WhatsApp, statuts et espace de gestion) a été conçu sur mesure. Je réalise le même type de solution pour les concessionnaires, commerces et entreprises qui veulent vendre et se faire connaître en ligne.',
    services: [
      ['bi-globe2', 'Sites web sur mesure', 'Vitrines, catalogues et boutiques en ligne.'],
      ['bi-speedometer2', 'Plateformes de gestion', 'Espace admin, statistiques et suivi des clients.'],
      ['bi-phone', 'Applications mobiles', 'Applications web installables sur téléphone.'],
      ['bi-shield-check', 'Maintenance & évolution', 'Hébergement, sécurité et mises à jour.']
    ],
    ...(CONFIG.DEVELOPPEUR || {})
  };
  const prenom = d.nom.split(' ')[0];
  const contact = d.whatsapp
    ? `<a class="btn btn-accent px-4" target="_blank" rel="noopener" href="https://wa.me/${esc(d.whatsapp)}?text=${encodeURIComponent(`Bonjour ${prenom}, j'ai vu votre travail sur ${NOM} et je souhaite discuter d'un projet.`)}"><i class="bi bi-whatsapp me-2"></i>Discutons de votre projet</a>`
    : d.email ? `<a class="btn btn-accent px-4" href="mailto:${esc(d.email)}"><i class="bi bi-envelope me-2"></i>Discutons de votre projet</a>` : '';
  return `
  <section class="dev" id="developpeur"><div class="container"><div class="dev-card rv"><div class="row align-items-center g-4">
    <div class="col-lg-4 text-center">
      <div class="dev-photo"><div>${esc(initiales(d.nom))}${imgSure(d.photo)}</div></div>
      <h3 class="h5 fw-bold mb-1">${esc(d.nom)}</h3><div class="opacity-75">${esc(d.titre)}</div>
    </div>
    <div class="col-lg-8">
      <span class="eyebrow">Derrière ce site</span>
      <h2 class="fw-bold">Un site comme celui-ci pour votre activité ?</h2>
      <p class="opacity-75">${esc(d.texte)}</p>
      <div class="row g-3 my-3">${d.services.map(([ic, t, x]) => `<div class="col-sm-6"><div class="srv"><i class="bi ${esc(ic)}"></i><div class="fw-semibold mt-2">${esc(t)}</div><div class="small opacity-75">${esc(x)}</div></div></div>`).join('')}</div>
      ${contact}
    </div>
  </div></div></div></section>`;
};

const pied = () => {
  const r = CONFIG.RESEAUX || {};
  const ico = { facebook: 'bi-facebook', instagram: 'bi-instagram', tiktok: 'bi-tiktok', youtube: 'bi-youtube' };
  const liens = Object.entries(ico).filter(([k]) => r[k]).map(([k, c]) => `<a href="${esc(r[k])}" target="_blank" rel="noopener" aria-label="${k}"><i class="bi ${c}"></i></a>`).join('');
  const dev = (CONFIG.DEVELOPPEUR && CONFIG.DEVELOPPEUR.nom) || 'Cedric Yomenou';
  return `
  <footer class="pied" id="contact"><div class="pied-ligne"></div>
    <div class="container py-5"><div class="row g-5">
      <div class="col-lg-4 rv"><div class="pied-logo">${LOGO}<span>${esc(NOM)}</span></div>
        <p class="small mt-3 mb-0">Vente de véhicules neufs et d'occasion, contrôlés et garantis. Un conseiller vous accompagne de la visite à la remise des clés.</p>
        <div class="reseaux"><a href="${lienWa('Bonjour')}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>${liens}</div></div>
      <div class="col-6 col-lg-2 rv" style="--d:80ms"><h3 class="pied-t">Navigation</h3><ul>
        <li><a href="index.html">Accueil</a></li><li><a href="catalogue.html">Catalogue</a></li>
        <li><a href="index.html#etapes">Comment ça marche</a></li><li><a href="index.html#apropos">À propos</a></li></ul></div>
      <div class="col-6 col-lg-3 rv" style="--d:160ms"><h3 class="pied-t">Contact</h3><ul class="small">
        <li><i class="bi bi-geo-alt me-2"></i>Abidjan, Côte d'Ivoire</li>
        <li><a href="tel:${CONFIG.VENDEUR.telephone}"><i class="bi bi-telephone me-2"></i>${esc(CONFIG.VENDEUR.telephone)}</a></li>
        <li><a href="${lienWa('Bonjour')}" target="_blank" rel="noopener"><i class="bi bi-whatsapp me-2"></i>WhatsApp</a></li></ul></div>
      <div class="col-lg-3 rv" style="--d:240ms"><h3 class="pied-t">Horaires</h3><div id="ouvert"></div>
        <div class="small">Lun – Sam : ${HEURES.ouverture}h – ${HEURES.fermeture}h</div><div class="small">Dimanche : fermé</div></div>
    </div></div>
    <div class="pied-bas"><div class="container d-flex flex-wrap justify-content-between gap-2 small">
      <span>© ${new Date().getFullYear()} ${esc(NOM)}. Tous droits réservés.</span>
      <span>Site conçu par <a class="text-white" href="index.html#developpeur">${esc(dev)}</a></span></div></div>
  </footer>`;
};

function layout(page) {
  $('#nav').innerHTML = `
  <nav class="navbar navbar-expand-lg fixed-top nav-main ${page === 'accueil' ? '' : 'nav-solid'}">
    <div class="container">
      <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="index.html">${LOGO}${esc(NOM)}</a>
      <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu" aria-label="Menu"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="menu">
        <ul class="navbar-nav mx-auto">
          <li class="nav-item"><a class="nav-link" href="index.html">Accueil</a></li>
          <li class="nav-item"><a class="nav-link" href="catalogue.html">Catalogue</a></li>
          <li class="nav-item"><a class="nav-link" href="index.html#etapes">Comment ça marche</a></li>
          <li class="nav-item"><a class="nav-link" href="index.html#apropos">À propos</a></li>
          <li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li>
        </ul>
        <a class="btn btn-accent btn-sm px-3" href="catalogue.html">Voir les véhicules</a>
      </div>
    </div>
  </nav>`;
  if (page === 'accueil') $('#pied').insertAdjacentHTML('beforebegin', apropos());
  $('#pied').insertAdjacentHTML('beforebegin', alerte());
  if (page === 'accueil') $('#pied').insertAdjacentHTML('beforebegin', developpeur());
  $('#pied').outerHTML = pied();
  document.body.insertAdjacentHTML('beforeend', '<a class="fab fab-wa" data-wa target="_blank" rel="noopener" href="#" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a><button class="fab fab-haut" id="haut" aria-label="Haut de page"><i class="bi bi-arrow-up"></i></button>');
  $('#haut').onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  addEventListener('scroll', () => $('#haut').classList.toggle('on', scrollY > 600), { passive: true });
  const majOuvert = () => {
    const [ouvert, texte] = statutOuverture();
    $('#ouvert').innerHTML = `<span class="ouvert ${ouvert ? '' : 'ferme'}"><i></i>${texte}</span>`;
  };
  majOuvert();
  setInterval(majOuvert, 60000);
  document.body.insertAdjacentHTML('beforeend', '<div class="modal fade" id="modal-vehicule" tabindex="-1"><div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"><div class="modal-content" id="modal-contenu"></div></div></div>');
  document.querySelectorAll('[data-tel]').forEach(a => a.href = 'tel:' + CONFIG.VENDEUR.telephone);
  document.querySelectorAll('[data-wa]').forEach(a => a.href = lienWa('Bonjour, je souhaite des informations sur vos véhicules.'));
}

function carte(v, i = 0) {
  const fav = etat.favoris.includes(v.id);
  return `
  <div class="col-md-6 col-xl-4 rv" style="--d:${(i % 6) * 80}ms">
    <article class="carte" data-id="${v.id}">
      <div class="photo">${photo(v)}
        <span class="badge ${v.etat === 'Neuf' ? 'bg-success' : 'bg-dark'} etat">${esc(v.etat)}</span>
        <button class="btn-fav ${fav ? 'actif' : ''}" data-fav="${v.id}" aria-label="Ajouter aux favoris"><i class="bi bi-heart${fav ? '-fill' : ''}"></i></button>
      </div>
      <div class="p-3 d-flex flex-column flex-grow-1">
        <h3 class="h6 fw-bold mb-1">${esc(v.marque)} ${esc(v.modele)}</h3>
        <div class="prix mb-2">${prix(v.prix)}</div>
        <div class="specs mt-auto">
          <span><i class="bi bi-calendar3"></i>${v.annee}</span><span><i class="bi bi-speedometer2"></i>${km(v.kilometrage)}</span>
          <span><i class="bi bi-fuel-pump"></i>${esc(v.carburant)}</span><span><i class="bi bi-gear"></i>${esc(v.transmission)}</span>
        </div>
      </div>
    </article>
  </div>`;
}

function grille(el) {
  el.addEventListener('click', e => {
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      e.stopPropagation();
      const id = +fav.dataset.fav;
      etat.favoris = etat.favoris.includes(id) ? etat.favoris.filter(x => x !== id) : [...etat.favoris, id];
      localStorage.setItem('favoris', JSON.stringify(etat.favoris));
      fav.classList.toggle('actif');
      fav.firstElementChild.className = 'bi bi-heart' + (etat.favoris.includes(id) ? '-fill' : '');
      return;
    }
    const c = e.target.closest('[data-id]');
    if (c) detail(+c.dataset.id);
  });
}

function detail(id) {
  const v = etat.liste.find(x => x.id === id);
  if (!v) return;
  Suivi.envoyer('vehicule', v.id);
  const im = imgs(v), gid = 'gal-' + v.id, alt = esc(v.marque + ' ' + v.modele);
  const slides = (im.length ? im : [null]).map((s, i) =>
    `<div class="carousel-item ${i ? '' : 'active'}"><div class="photo">${s ? `<img src="${esc(s)}" alt="${alt}">` : '<i class="bi bi-car-front"></i>'}</div></div>`).join('');
  const multi = im.length > 1;
  const controles = multi ? `
    <button class="carousel-control-prev" type="button" data-bs-target="#${gid}" data-bs-slide="prev" aria-label="Précédente"><span class="carousel-control-prev-icon"></span></button>
    <button class="carousel-control-next" type="button" data-bs-target="#${gid}" data-bs-slide="next" aria-label="Suivante"><span class="carousel-control-next-icon"></span></button>` : '';
  const vignettes = multi ? `<div class="carousel-indicators thumbs">${im.map((s, i) =>
    `<button type="button" data-bs-target="#${gid}" data-bs-slide-to="${i}" class="${i ? '' : 'active'}" aria-label="Photo ${i + 1}"><img src="${esc(s)}" alt=""></button>`).join('')}</div>` : '';
  const lignes = [['Année', v.annee], ['Kilométrage', km(v.kilometrage)], ['Carburant', v.carburant], ['Transmission', v.transmission], ['Couleur', v.couleur], ['Portes', v.portes], ['État', v.etat]]
    .map(([k, val]) => `<tr><td>${k}</td><td class="fw-semibold">${esc(val)}</td></tr>`).join('');

  $('#modal-contenu').innerHTML = `
    <div class="modal-header"><h2 class="modal-title h4 fw-bold">${alt}</h2><button class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <div class="row g-4">
        <div class="col-lg-7 gal"><div id="${gid}" class="carousel slide" data-bs-ride="false"><div class="carousel-inner">${slides}</div>${controles}${vignettes}</div></div>
        <div class="col-lg-5">
          <div class="prix fs-3 mb-3">${prix(v.prix)}</div>
          <table class="table table-borderless fiche mb-3"><tbody>${lignes}</tbody></table>
          <p class="mb-0 text-muted">${esc(v.description)}</p>
        </div>
      </div>
      <hr class="my-4">
      <h3 class="h6 fw-bold mb-3">Être recontacté par un conseiller</h3>
      <form id="form-demande" class="row g-2" novalidate>
        <div class="col-md-6"><input class="form-control" name="nom" placeholder="Nom complet" required></div>
        <div class="col-md-6"><input class="form-control" name="telephone" type="tel" placeholder="Téléphone" required></div>
        <div class="col-md-6"><input class="form-control" name="email" type="email" placeholder="E-mail (facultatif)"></div>
        <div class="col-md-6"><select class="form-select" name="type"><option value="information">Demande d'information</option><option value="essai">Essai du véhicule</option><option value="reservation">Réservation</option><option value="achat">Intention d'achat</option></select></div>
        <div class="col-12"><textarea class="form-control" name="message" rows="2" placeholder="Votre message (facultatif)"></textarea></div>
        <div class="col-12" id="demande-retour"></div>
        <div class="col-12 d-grid"><button class="btn btn-accent" type="submit">Envoyer ma demande</button></div>
      </form>
    </div>
    <div class="modal-footer">
      <a class="btn btn-outline-dark" href="tel:${CONFIG.VENDEUR.telephone}"><i class="bi bi-telephone me-2"></i>Appeler</a>
      <a class="btn btn-success" target="_blank" rel="noopener" href="${lienWa(`Bonjour, je suis intéressé par la ${v.marque} ${v.modele} (${prix(v.prix)}).`)}"><i class="bi bi-whatsapp me-2"></i>WhatsApp</a>
    </div>`;
  bootstrap.Modal.getOrCreateInstance('#modal-vehicule').show();
  $('#form-demande').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, retour = $('#demande-retour'), btn = f.querySelector('button');
    btn.disabled = true;
    const res = await Api.envoyerDemande({ vehicule_id: v.id, ...Object.fromEntries(new FormData(f)) });
    btn.disabled = false;
    if (res.ok) f.reset();
    retour.innerHTML = `<div class="alert alert-${res.ok ? 'success' : 'danger'} mb-0">${esc(res.message)}</div>`;
  });
}

function compte(el, n) {
  const t0 = performance.now();
  const pas = t => { const p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(n * p); if (p < 1) requestAnimationFrame(pas); };
  requestAnimationFrame(pas);
}

function hero(data) {
  const bg = $('#hero-bg');
  const urls = [...(CONFIG.HERO_IMAGES || []), ...data.flatMap(imgs)].slice(0, 6);
  bg.innerHTML = urls.map((u, i) => `<div class="slide ${i ? '' : 'on'}" style="background-image:url('${esc(u)}')"></div>`).join('');
  if (urls.length < 2) return;
  const s = bg.children;
  let i = 0;
  setInterval(() => { s[i].classList.remove('on'); i = (i + 1) % s.length; s[i].classList.add('on'); }, 6000);
}

const ETIQ = {
  nouveau: ['Nouvel arrivage', '#e4572e'], promo: ['Promo flash', '#f59e0b'], dernier: ['Dernier exemplaire', '#8b5cf6'],
  essai: ['Essai vidéo', '#0ea5e9'], vendu: ['Vendu', '#64748b'], info: ['Info', '#10b981']
};
const SV = { liste: [], i: 0, ecoule: 0, duree: 5000, pause: false, dernier: 0, raf: 0, appui: 0 };

const mediaHtml = (s, plein = false) => s.type === 'video'
  ? `<video src="${esc(s.media)}${plein ? '' : '#t=0.1'}" muted playsinline ${plein ? '' : 'preload="metadata"'}></video>`
  : `<img src="${esc(s.media)}" alt="${esc(s.legende || 'Statut')}" ${plein ? '' : 'loading="lazy"'}>`;

async function stories() {
  let liste = [];
  try { liste = (await Api.get('/statuts')).data; } catch (e) { return; }
  if (!liste.length) return;
  SV.liste = liste;
  $('#accueil').insertAdjacentHTML('afterend', `
    <section class="stories rv"><div class="container">
      <span class="eyebrow">À la une aujourd'hui</span>
      <div class="stories-strip">${liste.map((s, i) => {
        const [nom, c] = ETIQ[s.etiquette] || ETIQ.info;
        return `<button class="st" data-st="${i}" style="--c:${c}"><div class="st-ring"><div class="st-in">${mediaHtml(s)}</div></div><div class="st-lab">${esc(nom)}</div></button>`;
      }).join('')}</div>
    </div></section>`);
  $('.stories-strip').addEventListener('click', e => { const b = e.target.closest('[data-st]'); if (b) ouvrirStory(+b.dataset.st); });
  revele();
}

function ouvrirStory(i) {
  if (!$('#sv')) {
    document.body.insertAdjacentHTML('beforeend', `
    <div class="sv" id="sv" hidden><div class="sv-box">
      <div class="sv-bars" id="sv-bars"></div>
      <div class="sv-head"><span class="sv-tag" id="sv-tag"></span>
        <div><button class="sv-btn" id="sv-son" hidden aria-label="Son"><i class="bi bi-volume-mute"></i></button> <button class="sv-btn" id="sv-x" aria-label="Fermer"><i class="bi bi-x-lg"></i></button></div></div>
      <div class="sv-media" id="sv-media"></div>
      <button class="sv-zone sv-prev" aria-label="Précédent"></button><button class="sv-zone sv-next" aria-label="Suivant"></button>
      <div class="sv-foot"><p class="sv-cap" id="sv-cap"></p><div class="sv-actions" id="sv-actions"></div></div>
    </div></div>`);
    const sv = $('#sv');
    $('#sv-x').onclick = fermerStory;
    sv.addEventListener('click', e => { if (e.target === sv) fermerStory(); });
    sv.addEventListener('pointerdown', () => { SV.pause = true; SV.appui = Date.now(); $('#sv-media video')?.pause(); });
    const reprise = () => { SV.pause = false; $('#sv-media video')?.play().catch(() => {}); };
    sv.addEventListener('pointerup', reprise);
    sv.addEventListener('pointercancel', reprise);
    const toucher = d => { if (Date.now() - SV.appui > 300) return; d > 0 ? suivante() : precedente(); };
    $('.sv-prev').onclick = () => toucher(-1);
    $('.sv-next').onclick = () => toucher(1);
    $('#sv-son').onclick = () => {
      const v = $('#sv-media video');
      if (v) { v.muted = !v.muted; $('#sv-son i').className = 'bi bi-volume-' + (v.muted ? 'mute' : 'up'); }
    };
    addEventListener('keydown', e => {
      if ($('#sv').hidden) return;
      if (e.key === 'Escape') fermerStory();
      if (e.key === 'ArrowRight') suivante();
      if (e.key === 'ArrowLeft') precedente();
    });
  }
  $('#sv').hidden = false;
  document.body.style.overflow = 'hidden';
  afficherStory(i);
}

function fermerStory() {
  cancelAnimationFrame(SV.raf);
  $('#sv-media').innerHTML = '';
  $('#sv').hidden = true;
  document.body.style.overflow = '';
}

const suivante = () => SV.i < SV.liste.length - 1 ? afficherStory(SV.i + 1) : fermerStory();
const precedente = () => afficherStory(Math.max(0, SV.i - 1));

function afficherStory(i) {
  cancelAnimationFrame(SV.raf);
  SV.i = i; SV.ecoule = 0; SV.duree = 5000; SV.pause = false;
  const s = SV.liste[i], [nom, c] = ETIQ[s.etiquette] || ETIQ.info, veh = s.vehicule;
  $('.sv-box').style.setProperty('--c', c);
  $('#sv-tag').textContent = nom;
  $('#sv-media').innerHTML = mediaHtml(s, true);
  $('#sv-media').style.setProperty('--bg', s.type === 'image' ? `url("${s.media}")` : 'none');
  $('#sv-cap').textContent = s.legende || '';
  $('#sv-bars').innerHTML = SV.liste.map((_, k) => `<div class="sv-bar"><i style="width:${k < i ? 100 : 0}%"></i></div>`).join('');
  const v = $('#sv-media video');
  $('#sv-son').hidden = !v;
  $('#sv-son i').className = 'bi bi-volume-mute';
  if (v) {
    v.addEventListener('loadedmetadata', () => { SV.duree = Math.min(Math.max(v.duration * 1000, 3000), 30000); });
    v.play().catch(() => {});
  }
  const texte = veh
    ? `Bonjour, je suis intéressé par la ${veh.marque} ${veh.modele} (${prix(veh.prix)}).`
    : `Bonjour, je suis intéressé par : ${s.legende || 'vos véhicules'}.`;
  $('#sv-actions').innerHTML =
    (veh ? '<button class="btn btn-light fw-semibold" id="sv-voir">Voir ce véhicule</button>' : '') +
    `<a class="btn btn-success fw-semibold" id="sv-wa" target="_blank" rel="noopener" href="${lienWa(texte)}"><i class="bi bi-whatsapp me-1"></i>Je suis intéressé</a>`;
  $('#sv-wa').onclick = () => poster(`/statuts/${s.id}/clic`, {});
  if (veh) $('#sv-voir').onclick = () => {
    poster(`/statuts/${s.id}/clic`, {});
    fermerStory();
    if (!etat.liste.some(x => x.id === veh.id)) etat.liste.push(veh);
    detail(veh.id);
  };
  poster(`/statuts/${s.id}/vue`, {});
  SV.dernier = performance.now();
  SV.raf = requestAnimationFrame(boucleStory);
}

function boucleStory(t) {
  if (!SV.pause) SV.ecoule += t - SV.dernier;
  SV.dernier = t;
  const barre = $('#sv-bars').children[SV.i]?.firstChild;
  if (barre) barre.style.width = Math.min(SV.ecoule / SV.duree * 100, 100) + '%';
  if (SV.ecoule >= SV.duree) return suivante();
  SV.raf = requestAnimationFrame(boucleStory);
}

async function accueil() {
  stories();
  let nbV = 0, nbM = 0;
  new IntersectionObserver(es => es.forEach(e => {
    e.target.classList.toggle('play', e.isIntersecting);
    if (e.isIntersecting && nbV) { compte($('#c-vehicules'), nbV); compte($('#c-marques'), nbM); }
  })).observe($('#accueil'));
  try {
    const [res, marques] = await Promise.all([Api.vehicules({ tri: 'recent', page: 1 }), Api.marques().catch(() => [])]);
    etat.liste = res.data;
    hero(res.data);
    nbV = res.meta.total; nbM = marques.length;
    compte($('#c-vehicules'), nbV);
    compte($('#c-marques'), nbM);
    const opts = marques.map(m => `<option>${esc(m)}</option>`).join('');
    $('#hero-marque').insertAdjacentHTML('beforeend', opts);
    $('#vedette').innerHTML = res.data.map(carte).join('');
    grille($('#vedette'));
  } catch (e) {
    $('#vedette').innerHTML = '<div class="col-12"><div class="alert alert-danger">Impossible de charger les véhicules pour le moment.</div></div>';
  }
  $('#form-recherche').addEventListener('submit', e => {
    e.preventDefault();
    const p = new URLSearchParams();
    if ($('#hero-marque').value) p.set('marque', $('#hero-marque').value);
    if ($('#hero-budget').value) p.set('prix_max', $('#hero-budget').value);
    location.href = 'catalogue.html' + (p.toString() ? '?' + p : '');
  });
  revele();
}

const filtres = () => ({
  q: $('#f-q').value.trim(), marque: $('#f-marque').value, carburant: $('#f-carburant').value,
  annee_min: $('#f-annee').value, prix_max: $('#f-prix').value, tri: $('#tri').value, page: etat.page
});

async function charger() {
  $('#liste').innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-secondary"></div></div>';
  try {
    const { data, meta } = await Api.vehicules(filtres());
    etat.liste = data;
    $('#compteur').textContent = `${meta.total} véhicule${meta.total > 1 ? 's' : ''} disponible${meta.total > 1 ? 's' : ''}`;
    $('#liste').innerHTML = data.length ? data.map(carte).join('') :
      '<div class="col-12 text-center text-muted py-5"><i class="bi bi-search fs-1"></i><p class="mt-2">Aucun véhicule ne correspond à votre recherche.</p></div>';
    let h = '';
    if (meta.last_page > 1) {
      h = `<li class="page-item ${meta.current_page === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${meta.current_page - 1}">&laquo;</a></li>`;
      for (let i = 1; i <= meta.last_page; i++) h += `<li class="page-item ${i === meta.current_page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
      h += `<li class="page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${meta.current_page + 1}">&raquo;</a></li>`;
    }
    $('#pagination').innerHTML = h;
    revele();
  } catch (e) {
    $('#compteur').textContent = '';
    $('#liste').innerHTML = '<div class="col-12"><div class="alert alert-danger">Impossible de charger les véhicules. Réessayez dans un instant.</div></div>';
  }
}

async function catalogue() {
  try {
    const opts = (await Api.marques()).map(m => `<option>${esc(m)}</option>`).join('');
    $('#f-marque').insertAdjacentHTML('beforeend', opts);
  } catch (e) { /* les filtres restent utilisables */ }
  const p = new URLSearchParams(location.search);
  [['q', '#f-q'], ['marque', '#f-marque'], ['carburant', '#f-carburant'], ['annee_min', '#f-annee'], ['prix_max', '#f-prix'], ['tri', '#tri']]
    .forEach(([k, sel]) => { if (p.get(k)) $(sel).value = p.get(k); });

  $('#form-filtres').addEventListener('submit', e => { e.preventDefault(); etat.page = 1; charger(); bootstrap.Offcanvas.getInstance('#filtres')?.hide(); });
  $('#form-filtres').addEventListener('reset', () => setTimeout(() => { etat.page = 1; charger(); }));
  $('#tri').addEventListener('change', () => { etat.page = 1; charger(); });
  $('#pagination').addEventListener('click', e => {
    const a = e.target.closest('[data-page]');
    if (!a) return;
    e.preventDefault();
    etat.page = +a.dataset.page; charger(); scrollTo({ top: 0, behavior: 'smooth' });
  });
  grille($('#liste'));
  charger();
}

addEventListener('pageshow', e => {
  if (!e.persisted) return;
  document.querySelectorAll('.rv.in').forEach(el => el.classList.remove('in'));
  io.disconnect(); revele();
});

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  layout(page);
  alerteInit();
  Suivi.envoyer('page');
  addEventListener('scroll', () => $('.nav-main').classList.toggle('nav-solid', page !== 'accueil' || scrollY > 40), { passive: true });
  page === 'accueil' ? accueil() : catalogue();
});
