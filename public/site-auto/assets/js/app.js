const $ = s => document.querySelector(s);
const etat = { page: 1, liste: [], favoris: JSON.parse(localStorage.getItem('favoris') || '[]') };

const prix = n => new Intl.NumberFormat('fr-FR').format(n) + ' ' + CONFIG.DEVISE;
const km = n => n ? new Intl.NumberFormat('fr-FR').format(n) + ' km' : 'Neuf';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function filtres() {
  return {
    q: $('#f-q').value.trim(),
    marque: $('#f-marque').value,
    carburant: $('#f-carburant').value,
    annee_min: $('#f-annee').value,
    prix_max: $('#f-prix').value,
    tri: $('#tri').value,
    page: etat.page
  };
}

function photo(v) {
  return v.image ? `<img src="${esc(v.image)}" alt="${esc(v.marque + ' ' + v.modele)}" loading="lazy">` : '<i class="bi bi-car-front"></i>';
}

function carte(v) {
  const fav = etat.favoris.includes(v.id);
  return `
  <div class="col-md-6 col-xl-4">
    <article class="carte-vehicule" data-id="${v.id}">
      <div class="photo">
        ${photo(v)}
        <span class="badge ${v.etat === 'Neuf' ? 'bg-success' : 'bg-dark'} etat">${esc(v.etat)}</span>
        <button class="btn-fav ${fav ? 'actif' : ''}" data-fav="${v.id}" aria-label="Ajouter aux favoris"><i class="bi bi-heart${fav ? '-fill' : ''}"></i></button>
      </div>
      <div class="p-3 d-flex flex-column flex-grow-1">
        <h3 class="h6 fw-bold mb-1">${esc(v.marque)} ${esc(v.modele)}</h3>
        <div class="prix mb-2">${prix(v.prix)}</div>
        <div class="specs mt-auto">
          <span><i class="bi bi-calendar3"></i>${v.annee}</span>
          <span><i class="bi bi-speedometer2"></i>${km(v.kilometrage)}</span>
          <span><i class="bi bi-fuel-pump"></i>${esc(v.carburant)}</span>
          <span><i class="bi bi-gear"></i>${esc(v.transmission)}</span>
        </div>
      </div>
    </article>
  </div>`;
}

function pagination(m) {
  const ul = $('#pagination');
  if (m.last_page <= 1) { ul.innerHTML = ''; return; }
  let h = `<li class="page-item ${m.current_page === 1 ? 'disabled' : ''}"><a class="page-link" href="#catalogue" data-page="${m.current_page - 1}">&laquo;</a></li>`;
  for (let i = 1; i <= m.last_page; i++)
    h += `<li class="page-item ${i === m.current_page ? 'active' : ''}"><a class="page-link" href="#catalogue" data-page="${i}">${i}</a></li>`;
  h += `<li class="page-item ${m.current_page === m.last_page ? 'disabled' : ''}"><a class="page-link" href="#catalogue" data-page="${m.current_page + 1}">&raquo;</a></li>`;
  ul.innerHTML = h;
}

async function charger() {
  $('#liste').innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-secondary"></div></div>';
  try {
    const { data, meta } = await Api.vehicules(filtres());
    etat.liste = data;
    $('#compteur').textContent = `${meta.total} véhicule${meta.total > 1 ? 's' : ''} disponible${meta.total > 1 ? 's' : ''}`;
    $('#liste').innerHTML = data.length ? data.map(carte).join('') :
      '<div class="col-12 text-center text-muted py-5"><i class="bi bi-search fs-1"></i><p class="mt-2">Aucun véhicule ne correspond à votre recherche.</p></div>';
    pagination(meta);
  } catch (e) {
    $('#compteur').textContent = '';
    $('#liste').innerHTML = '<div class="col-12"><div class="alert alert-danger">Impossible de charger les véhicules. Réessayez dans un instant.</div></div>';
  }
}

function majFavoris() {
  localStorage.setItem('favoris', JSON.stringify(etat.favoris));
  $('#nb-favoris').textContent = etat.favoris.length;
}

function galerie(v) {
  const imgs = v.images && v.images.length ? v.images : (v.image ? [v.image] : []);
  const alt = esc(v.marque + ' ' + v.modele);
  if (!imgs.length) return `<div class="photo rounded">${photo(v)}</div>`;
  if (imgs.length === 1) return `<div class="photo rounded"><img src="${esc(imgs[0])}" alt="${alt}"></div>`;
  const id = 'galerie-' + v.id;
  const items = imgs.map((src, i) =>
    `<div class="carousel-item ${i === 0 ? 'active' : ''}"><div class="photo"><img src="${esc(src)}" alt="${alt}"></div></div>`
  ).join('');
  return `
    <div id="${id}" class="carousel slide rounded overflow-hidden" data-bs-ride="false">
      <div class="carousel-inner">${items}</div>
      <button class="carousel-control-prev" type="button" data-bs-target="#${id}" data-bs-slide="prev" aria-label="Photo précédente"><span class="carousel-control-prev-icon"></span></button>
      <button class="carousel-control-next" type="button" data-bs-target="#${id}" data-bs-slide="next" aria-label="Photo suivante"><span class="carousel-control-next-icon"></span></button>
    </div>`;
}

function detail(id) {
  const v = etat.liste.find(x => x.id === id);
  if (!v) return;
  Suivi.envoyer('vehicule', v.id);
  const lignes = [['Année', v.annee], ['Kilométrage', km(v.kilometrage)], ['Carburant', v.carburant], ['Transmission', v.transmission], ['Couleur', v.couleur], ['Portes', v.portes], ['État', v.etat]]
    .map(([k, val]) => `<tr><td>${k}</td><td class="fw-semibold">${esc(val)}</td></tr>`).join('');
  $('#modal-contenu').innerHTML = `
    <div class="modal-header"><h2 class="modal-title h5">${esc(v.marque)} ${esc(v.modele)}</h2><button class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <div class="row g-4">
        <div class="col-md-6">${galerie(v)}</div>
        <div class="col-md-6">
          <div class="prix fs-4 mb-3">${prix(v.prix)}</div>
          <table class="table table-borderless fiche-table mb-0"><tbody>${lignes}</tbody></table>
        </div>
      </div>
      <p class="mt-4 mb-0">${esc(v.description)}</p>
      <hr class="my-4">
      <h3 class="h6 fw-bold mb-3">Être recontacté par un conseiller</h3>
      <form id="form-demande" class="row g-2" novalidate>
        <div class="col-md-6"><input class="form-control" name="nom" placeholder="Nom complet" required></div>
        <div class="col-md-6"><input class="form-control" name="telephone" type="tel" placeholder="Téléphone" required></div>
        <div class="col-md-6"><input class="form-control" name="email" type="email" placeholder="E-mail (facultatif)"></div>
        <div class="col-md-6">
          <select class="form-select" name="type">
            <option value="information">Demande d'information</option>
            <option value="essai">Essai du véhicule</option>
            <option value="reservation">Réservation</option>
            <option value="achat">Intention d'achat</option>
          </select>
        </div>
        <div class="col-12"><textarea class="form-control" name="message" rows="2" placeholder="Votre message (facultatif)"></textarea></div>
        <div class="col-12" id="demande-retour"></div>
        <div class="col-12 d-grid"><button class="btn btn-accent" type="submit">Envoyer ma demande</button></div>
      </form>
    </div>
    <div class="modal-footer">
      <a class="btn btn-outline-dark" href="tel:${CONFIG.VENDEUR.telephone}"><i class="bi bi-telephone me-2"></i>Appeler</a>
      <a class="btn btn-success" target="_blank" rel="noopener" href="https://wa.me/${CONFIG.VENDEUR.whatsapp}?text=${encodeURIComponent(`Bonjour, je suis intéressé par la ${v.marque} ${v.modele} (${prix(v.prix)}).`)}"><i class="bi bi-whatsapp me-2"></i>WhatsApp</a>
    </div>`;
  bootstrap.Modal.getOrCreateInstance('#modal-vehicule').show();
  $('#form-demande').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, retour = $('#demande-retour'), btn = f.querySelector('button');
    btn.disabled = true;
    const res = await Api.envoyerDemande({ vehicule_id: v.id, ...Object.fromEntries(new FormData(f)) });
    btn.disabled = false;
    if (res.ok) {
      f.reset();
      retour.innerHTML = `<div class="alert alert-success mb-0">${esc(res.message)}</div>`;
    } else {
      retour.innerHTML = `<div class="alert alert-danger mb-0">${esc(res.message)}</div>`;
    }
  });
}

async function init() {
    Suivi.envoyer('page');
  $('#annee').textContent = new Date().getFullYear();
  majFavoris();
  try {
    const marques = await Api.marques();
    const opts = marques.map(m => `<option>${esc(m)}</option>`).join('');
    $('#f-marque').insertAdjacentHTML('beforeend', opts);
    $('#hero-marque').insertAdjacentHTML('beforeend', opts);
  } catch (e) { /* les filtres restent utilisables sans la liste des marques */ }

  $('#form-recherche').addEventListener('submit', e => {
    e.preventDefault();
    $('#f-marque').value = $('#hero-marque').value;
    $('#f-prix').value = $('#hero-budget').value;
    etat.page = 1; charger();
    $('#catalogue').scrollIntoView();
  });
  $('#form-filtres').addEventListener('submit', e => {
    e.preventDefault(); etat.page = 1; charger();
    bootstrap.Offcanvas.getInstance('#filtres')?.hide();
  });
  $('#form-filtres').addEventListener('reset', () => setTimeout(() => { etat.page = 1; charger(); }));
  $('#tri').addEventListener('change', () => { etat.page = 1; charger(); });

  $('#pagination').addEventListener('click', e => {
    const a = e.target.closest('[data-page]');
    if (!a) return;
    e.preventDefault();
    etat.page = +a.dataset.page; charger();
    $('#catalogue').scrollIntoView();
  });

  $('#liste').addEventListener('click', e => {
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      e.stopPropagation();
      const id = +fav.dataset.fav;
      etat.favoris = etat.favoris.includes(id) ? etat.favoris.filter(x => x !== id) : [...etat.favoris, id];
      majFavoris();
      fav.classList.toggle('actif');
      fav.firstElementChild.className = 'bi bi-heart' + (etat.favoris.includes(id) ? '-fill' : '');
      return;
    }
    const c = e.target.closest('[data-id]');
    if (c) detail(+c.dataset.id);
  });

  charger();
}

document.addEventListener('DOMContentLoaded', init);
