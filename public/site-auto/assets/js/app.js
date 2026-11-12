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

function layout(page) {
  $('#nav').innerHTML = `
  <nav class="navbar navbar-expand-lg fixed-top nav-main ${page === 'accueil' ? '' : 'nav-solid'}">
    <div class="container">
      <a class="navbar-brand fw-bold" href="index.html"><i class="bi bi-car-front-fill text-accent me-2"></i>${esc(NOM)}</a>
      <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu" aria-label="Menu"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="menu">
        <ul class="navbar-nav mx-auto">
          <li class="nav-item"><a class="nav-link" href="index.html">Accueil</a></li>
          <li class="nav-item"><a class="nav-link" href="catalogue.html">Catalogue</a></li>
          <li class="nav-item"><a class="nav-link" href="index.html#etapes">Comment ça marche</a></li>
          <li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li>
        </ul>
        <a class="btn btn-accent btn-sm px-3" href="catalogue.html">Voir les véhicules</a>
      </div>
    </div>
  </nav>`;
  $('#pied').insertAdjacentHTML('beforebegin', alerte());
  $('#pied').outerHTML = `
  <footer class="pied py-5" id="contact"><div class="container">
    <div class="row g-4">
      <div class="col-md-5"><div class="text-white fw-bold fs-5 mb-2"><i class="bi bi-car-front-fill text-accent me-2"></i>${esc(NOM)}</div><p class="small">Vente de véhicules neufs et d'occasion, contrôlés et garantis.</p></div>
      <div class="col-md-4 small"><div class="text-white fw-semibold mb-2">Contact</div>
        <div><i class="bi bi-geo-alt me-2"></i>Abidjan, Côte d'Ivoire</div>
        <div><a href="tel:${CONFIG.VENDEUR.telephone}"><i class="bi bi-telephone me-2"></i>${esc(CONFIG.VENDEUR.telephone)}</a></div>
        <div><a href="${lienWa('Bonjour')}" target="_blank" rel="noopener"><i class="bi bi-whatsapp me-2"></i>WhatsApp</a></div></div>
      <div class="col-md-3 small"><div class="text-white fw-semibold mb-2">Horaires</div><div>Lun – Sam : 8h – 18h</div></div>
    </div>
    <hr class="border-secondary my-4"><div class="small text-center">© ${new Date().getFullYear()} ${esc(NOM)}. Tous droits réservés.</div>
  </div></footer>`;
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

async function accueil() {
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
