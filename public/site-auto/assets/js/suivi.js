const Suivi = {
  envoyer(type, vehiculeId = null) {
    try {
      const params = new URLSearchParams(location.search);
      fetch(CONFIG.API_URL + '/visites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          type,
          vehicule_id: vehiculeId,
          utm_source: params.get('utm_source'),
          referrer: document.referrer || null
        }),
        keepalive: true
      }).catch(() => {});
    } catch (e) { /* le suivi ne doit jamais gêner le site */ }
  }
};
