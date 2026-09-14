(function () {
  var GOOGLE_SHEET_URL =
    'https://script.google.com/macros/s/AKfycbz85ejea-P8_EyhTBQiuZSbfVH7c_vcoiAi5oImYvlpfx_TDpYZc9Vbv2HQxrQnArVI/exec';
  var WHATSAPP_NUMBER = '212600000000';

  var PACKS = {
    standard: {
      slug: 'standard',
      name: 'Pack Standard',
      price: '999',
      suffix: 'DH',
      priceLabel: '999 DH',
      desc: 'Pour lancer votre présence en ligne rapidement',
      summary: [
        'Site web 5 pages',
        'Design moderne sur-mesure',
        'Nom de domaine (.ma / .com)',
        'Garantie satisfait ou remboursé',
        'Support technique inclus',
      ],
    },
    plus: {
      slug: 'plus',
      name: 'Pack Plus',
      price: '1899',
      suffix: 'DH',
      priceLabel: '1899 DH',
      desc: 'Pour un site optimisé qui convertit les visiteurs',
      summary: [
        'Tout le Pack Standard',
        'Vitrine / catalogue en ligne',
        'Meta + TikTok Pixel intégrés',
        'Meeting avec designer',
        'SEO Standard + suivi',
      ],
    },
    business: {
      slug: 'business',
      name: 'Pack Business',
      price: 'Sur devis',
      suffix: '',
      priceLabel: 'Sur devis',
      desc: 'Solution complète pour les entreprises ambitieuses',
      summary: [
        'Tout le Pack Plus',
        'Support 24/7',
        '4 noms de domaine',
        'SEO GEO Boost Maroc',
        'Stratégie sur-mesure',
      ],
    },
  };
  var PACK_ORDER = ['standard', 'plus', 'business'];

  var MOROCCAN_CITIES = [
    'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir',
    'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Mohammédia', 'El Jadida',
    'Nador', 'Autre ville',
  ];

  var CHECK_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pathForSlug(slug) {
    return '/commande-' + slug;
  }

  // Each plan now has its own real URL (/commande-standard, /commande-plus,
  // /commande-business) rather than just a hash. The existing .htaccess
  // already falls back to index.html for any unknown path, so these just work.
  // Old-style #commande-<slug> hash links are still honored for compatibility.
  function slugFromLocation() {
    var path = window.location.pathname.replace(/\/$/, '');
    var pathMatch = path.match(/\/commande-([a-z]+)$/);
    if (pathMatch && PACKS[pathMatch[1]]) return pathMatch[1];

    var h = window.location.hash.replace('#', '');
    if (h.indexOf('commande-') === 0) {
      var slug = h.replace('commande-', '');
      if (PACKS[slug]) return slug;
    }
    return 'standard';
  }

  function isCommandeLocation() {
    return (
      /\/commande-[a-z]+\/?$/.test(window.location.pathname) ||
      window.location.hash.indexOf('#commande') === 0
    );
  }

  function buildCitiesOptions(selected) {
    return MOROCCAN_CITIES.map(function (c) {
      return '<option value="' + escapeHtml(c) + '"' + (c === selected ? ' selected' : '') + '>' + escapeHtml(c) + '</option>';
    }).join('');
  }

  function render(root, state) {
    var pack = PACKS[state.slug];

    var tabsHtml = PACK_ORDER.map(function (slug) {
      var p = PACKS[slug];
      var active = slug === state.slug;
      return (
        '<button type="button" class="cmd-tab' + (active ? ' active' : '') + '" data-slug="' + slug + '">' +
        escapeHtml(p.name) + '<span class="cmd-tab-price">' + escapeHtml(p.priceLabel) + '</span>' +
        '</button>'
      );
    }).join('');

    var recapItems = pack.summary
      .map(function (item) {
        return '<li>' + CHECK_SVG + '<span>' + escapeHtml(item) + '</span></li>';
      })
      .join('');

    var directLink = window.location.origin + pathForSlug(pack.slug);

    var recapHtml =
      '<div class="cmd-recap">' +
      '<span class="cmd-recap-badge">' + escapeHtml(pack.name) + '</span>' +
      '<div class="cmd-recap-price"><span class="amount">' + escapeHtml(pack.price) + '</span>' +
      (pack.suffix ? '<span class="suffix">' + escapeHtml(pack.suffix) + '</span>' : '') + '</div>' +
      '<p class="cmd-recap-desc">' + escapeHtml(pack.desc) + '</p>' +
      '<ul>' + recapItems + '</ul>' +
      '<div class="cmd-recap-link">' +
      '<div class="cmd-recap-link-label">Lien direct de ce pack</div>' +
      '<div class="cmd-link-row">' +
      '<code class="cmd-code">' + escapeHtml(directLink) + '</code>' +
      '<button type="button" class="cmd-copy-btn" id="cmd-copy-btn">Copier</button>' +
      '</div></div>' +
      '<div class="cmd-sync-note"><span class="cmd-dot"></span><span>Synchronisation instantanée Google Sheet</span></div>' +
      '</div>';

    var formInner;
    if (state.submitted) {
      var d = state.formData;
      formInner =
        '<div class="cmd-success">' +
        '<div class="cmd-success-icon">' +
        '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' +
        '</div>' +
        '<h3>Demande enregistrée avec succès 🎉</h3>' +
        '<p>Vos informations ont bien été transmises pour le <strong>' + escapeHtml(pack.name) + '</strong> (' +
        escapeHtml(pack.priceLabel) + '). Notre équipe vous contactera sous 24h.</p>' +
        '<div class="cmd-success-recap">' +
        '<div><span>Nom :</span><strong>' + escapeHtml(d.name) + '</strong></div>' +
        '<div><span>Téléphone :</span><strong>' + escapeHtml(d.phone) + '</strong></div>' +
        '<div><span>Ville :</span><strong>' + escapeHtml(d.city) + '</strong></div>' +
        '<div><span>Email :</span><strong>' + escapeHtml(d.email) + '</strong></div>' +
        '<div><span>Pack :</span><strong>' + escapeHtml(pack.name) + ' (' + escapeHtml(pack.priceLabel) + ')</strong></div>' +
        '</div>' +
        '<div class="cmd-success-actions">' +
        '<a class="cmd-btn-wa" target="_blank" rel="noreferrer" href="' + waLink(pack, d) + '">Confirmer plus vite sur WhatsApp</a>' +
        '<button type="button" class="cmd-btn-again" id="cmd-again-btn">Nouvelle commande</button>' +
        '</div></div>';
    } else {
      var d2 = state.formData;
      formInner =
        '<div class="cmd-form-head" style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:18px;">' +
        '<div><div class="cmd-form-title">Formulaire ' + escapeHtml(pack.name) + '</div>' +
        '<p class="cmd-form-sub">Remplissez ce formulaire pour commander le <strong>' + escapeHtml(pack.name) + ' — ' + escapeHtml(pack.priceLabel) + '</strong>.</p></div>' +
        '</div>' +
        (state.error
          ? '<div class="cmd-error"><span>' + escapeHtml(state.error) + '</span><a target="_blank" rel="noreferrer" href="' +
            waSimple(pack) + '">WhatsApp</a></div>'
          : '') +
        '<form id="cmd-form">' +
        '<div class="cmd-row">' +
        '<div><label>Nom complet *</label><input required type="text" id="cmd-name" placeholder="Ex: Karim Benali" value="' + escapeHtml(d2.name) + '" /></div>' +
        '<div><label>Téléphone / WhatsApp *</label><input required type="tel" id="cmd-phone" placeholder="06 00 00 00 00" value="' + escapeHtml(d2.phone) + '" /></div>' +
        '</div>' +
        '<div class="cmd-row">' +
        '<div><label>Email *</label><input required type="email" id="cmd-email" placeholder="votre@email.com" value="' + escapeHtml(d2.email) + '" /></div>' +
        '<div><label>Ville *</label><select required id="cmd-city">' + buildCitiesOptions(d2.city) + '</select></div>' +
        '</div>' +
        '<div class="cmd-field"><label>Type d\'activité *</label><select required id="cmd-business-type">' +
        '<option value="">Sélectionnez votre secteur...</option>' +
        ['Restaurant / Café', 'Boutique / Commerce', 'Artisan / Indépendant', 'Cabinet / Profession libérale',
          'Entreprise de services', 'Coaching / Formation', 'Association / ONG', 'Autre']
          .map(function (o) { return '<option' + (o === d2.businessType ? ' selected' : '') + '>' + o + '</option>'; })
          .join('') +
        '</select></div>' +
        '<div class="cmd-field"><label>Parlons de vos goûts et de votre projet</label>' +
        '<textarea id="cmd-description" rows="3" placeholder="Quel style de design vous aimez ? Quelles couleurs ? Vos préférences...">' +
        escapeHtml(d2.description) + '</textarea></div>' +
        '<button type="submit" class="cmd-submit" id="cmd-submit-btn"' + (state.loading ? ' disabled' : '') + '>' +
        (state.loading
          ? '<svg class="cmd-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Envoi en cours...</span>'
          : '<span>Envoyer ma commande — ' + escapeHtml(pack.priceLabel) + '</span>') +
        '</button>' +
        '<div class="cmd-foot-row"><span>🔒 Confidentialité garantie</span><span class="ok">✓ Enregistré directement dans votre Google Sheet</span></div>' +
        '</form>';
    }

    root.innerHTML =
      '<div class="cmd-wrap">' +
      '<div class="cmd-anchor" id="commande-standard"></div>' +
      '<div class="cmd-anchor" id="commande-plus"></div>' +
      '<div class="cmd-anchor" id="commande-business"></div>' +
      '<div class="cmd-header">' +
      '<span class="cmd-eyebrow">Commande &amp; Devis</span>' +
      '<h2>Chaque pack a son propre formulaire</h2>' +
      '<p class="cmd-sub">Choisissez votre pack, remplissez son formulaire dédié et recevez une réponse sous 24h.</p>' +
      '</div>' +
      '<div class="cmd-tabs-row"><div class="cmd-tabs">' + tabsHtml + '</div></div>' +
      '<div class="cmd-grid">' + recapHtml + '<div class="cmd-form-card">' + formInner + '</div></div>' +
      '</div>';

    // Wire up events
    var tabs = root.querySelectorAll('.cmd-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function (e) {
        var slug = e.currentTarget.getAttribute('data-slug');
        goToPlan(root, state, slug, true);
      });
    }

    var copyBtn = root.querySelector('#cmd-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = window.location.origin + pathForSlug(pack.slug);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = '✓ Copié';
            copyBtn.classList.add('copied');
            setTimeout(function () {
              copyBtn.textContent = 'Copier';
              copyBtn.classList.remove('copied');
            }, 2000);
          });
        }
      });
    }

    var againBtn = root.querySelector('#cmd-again-btn');
    if (againBtn) {
      againBtn.addEventListener('click', function () {
        state.submitted = false;
        state.error = null;
        state.formData = defaultFormData();
        render(root, state);
      });
    }

    var form = root.querySelector('#cmd-form');
    if (form) {
      // Keep form values in state as the user types, so re-renders (e.g. tab switches) don't lose input.
      ['name', 'phone', 'email', 'city', 'business-type', 'description'].forEach(function (field) {
        var el = form.querySelector('#cmd-' + field);
        if (!el) return;
        var key = field === 'business-type' ? 'businessType' : field;
        el.addEventListener('input', function () {
          state.formData[key] = el.value;
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        state.formData.name = form.querySelector('#cmd-name').value;
        state.formData.phone = form.querySelector('#cmd-phone').value;
        state.formData.email = form.querySelector('#cmd-email').value;
        state.formData.city = form.querySelector('#cmd-city').value;
        state.formData.businessType = form.querySelector('#cmd-business-type').value;
        state.formData.description = form.querySelector('#cmd-description').value;

        state.loading = true;
        state.error = null;
        render(root, state);

        var fullUrl = window.location.origin + pathForSlug(pack.slug);
        submitToGoogleSheet({
          name: state.formData.name,
          phone: state.formData.phone,
          email: state.formData.email,
          city: state.formData.city,
          businessType: state.formData.businessType,
          description: state.formData.description,
          packName: pack.name,
          packSlug: pack.slug,
          packPrice: pack.price,
          url: fullUrl,
        }).then(function (res) {
          state.loading = false;
          if (res.success) {
            state.submitted = true;
          } else {
            state.error = res.error || 'Une erreur est survenue lors de l\'envoi.';
          }
          render(root, state);
        });
      });
    }
  }

  function defaultFormData() {
    return { name: '', phone: '', email: '', city: 'Casablanca', businessType: '', description: '' };
  }

  function scrollToCommande() {
    var el = document.getElementById('commande');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Navigate to a plan's own URL (e.g. /commande-plus) using pushState so the
  // page doesn't reload, then re-render and scroll to the form.
  function goToPlan(root, state, slug, userInitiated) {
    var newPath = pathForSlug(slug);
    if (window.location.pathname.replace(/\/$/, '') !== newPath) {
      history.pushState({ slug: slug }, '', newPath);
    }
    state.slug = slug;
    state.submitted = false;
    state.error = null;
    state.formData = defaultFormData();
    render(root, state);
    if (userInitiated) scrollToCommande();
  }

  function waLink(pack, d) {
    var msg = 'Salam Gentelly ! Je viens de commander le ' + pack.name + ' (' + pack.priceLabel + ').\n' +
      'Nom: ' + d.name + '\nTéléphone: ' + d.phone + '\nVille: ' + d.city + '\nActivité: ' + d.businessType;
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  function waSimple(pack) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Salam Gentelly, je souhaite commander le ' + pack.name);
  }

  function submitToGoogleSheet(payload) {
    var url = new URL(GOOGLE_SHEET_URL);
    var now = new Date();
    var locale = (typeof navigator !== 'undefined' && navigator.language) || 'fr-MA';
    var userAgent = (typeof navigator !== 'undefined' && navigator.userAgent) || '';

    url.searchParams.append('submitted_at', now.toISOString());
    url.searchParams.append('form_type', 'commande_' + payload.packSlug);
    url.searchParams.append('customer_name', payload.name);
    url.searchParams.append('customer_phone', payload.phone);
    url.searchParams.append('customer_city', payload.city || 'Maroc');
    url.searchParams.append('customer_address', payload.email ? 'Email: ' + payload.email : '');
    url.searchParams.append('product_id', payload.packSlug);
    url.searchParams.append('product_name', payload.packName);
    url.searchParams.append('product_category', payload.businessType);
    url.searchParams.append('product_size', payload.description || 'Standard');
    url.searchParams.append('quantity', '1');
    url.searchParams.append('unit_price', payload.packPrice);
    url.searchParams.append('total', payload.packPrice);
    url.searchParams.append('currency', 'DH');
    url.searchParams.append('free_delivery', 'oui');
    url.searchParams.append('locale', locale);
    url.searchParams.append('page_url', payload.url);
    url.searchParams.append('user_agent', userAgent);

    url.searchParams.append('email', payload.email);
    url.searchParams.append('name', payload.name);
    url.searchParams.append('phone', payload.phone);
    url.searchParams.append('pack', payload.packName);
    url.searchParams.append('businessType', payload.businessType);
    url.searchParams.append('description', payload.description);

    return fetch(url.toString(), { method: 'GET', headers: { Accept: 'application/json, text/plain, */*' } })
      .then(function (res) {
        if (res.ok) {
          return res
            .json()
            .then(function () { return { success: true }; })
            .catch(function () { return { success: true }; });
        }
        return { success: true };
      })
      .catch(function () {
        return fetch(url.toString(), { method: 'GET', mode: 'no-cors' })
          .then(function () { return { success: true }; })
          .catch(function (err) {
            console.error('Google Sheet submission failed:', err);
            return {
              success: false,
              error: "Erreur lors de l'enregistrement. Vous pouvez nous contacter directement par WhatsApp.",
            };
          });
      });
  }

  function init() {
    var root = document.getElementById('commande');
    if (!root) return;

    var initialSlug = slugFromLocation();
    var state = { slug: initialSlug, formData: defaultFormData(), loading: false, submitted: false, error: null };
    render(root, state);

    // Landed directly on /commande-<slug> (or an old #commande-<slug> link):
    // scroll straight to the form instead of leaving the visitor at the hero.
    if (isCommandeLocation()) scrollToCommande();

    window.addEventListener('popstate', function () {
      var slug = slugFromLocation();
      if (slug !== state.slug) {
        state.slug = slug;
        state.submitted = false;
        state.error = null;
        state.formData = defaultFormData();
        render(root, state);
      }
      if (isCommandeLocation()) scrollToCommande();
    });

    // Keep supporting plain #commande-<slug> hash links without a page reload.
    window.addEventListener('hashchange', function () {
      var slug = slugFromLocation();
      if (slug !== state.slug) {
        goToPlan(root, state, slug, true);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
