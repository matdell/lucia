(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var el = function (tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  };

  var SERVICES = [
    ['I want to rent', 'Find the right apartment in Brickell, Edgewater, Downtown or Key Biscayne — no surprises.', 'Rental guide'],
    ['I want to buy', 'Pre-construction to resale — smart guidance, whether you are living or investing.', "Buyer's guide"],
    ['Property management', 'Hands-on management for owners who want a trusted partner, not just an administrator.', 'Management guide'],
    ['I want to sell', 'Honest market analysis — no pressure, just your real options.', "Seller's guide"],
    ['International buyer', 'LLCs, taxes, financing — buying from abroad, fully guided.', 'International guide'],
  ];
  var GUIDES = [
    ['Renters', 'The complete guide to renting in Miami', 'Process, costs, and what to watch before signing.'],
    ['Buyers', 'How to buy a condo in Miami', 'Pre-construction to closing — all you need to know.'],
    ['Owners', 'Property management in Miami', 'Protect your investment and maximize returns.'],
    ['Sellers', 'Selling your Miami property', 'Market timing, pricing, finding the right buyer.'],
    ['International', 'Buying in Miami from abroad', 'LLCs, taxes, financing and the full closing process.'],
  ];
  var FILTERS = [
    ['zone', 'Zone', ['Brickell', 'Edgewater', 'Downtown', 'Key Biscayne', 'Open to all']],
    ['type', 'Type', ['Condo', 'House', 'Either']],
    ['beds', 'Bedrooms', ['Studio', '1 bed', '2 beds', '3+ beds']],
    ['budget', 'Budget', ['Up to $2,000', '$2,000–$3,000', '$3,000–$4,500', '$4,500+']],
  ];
  var MARQUEE = ['Brickell', 'Edgewater', 'Downtown Miami', 'Key Biscayne', 'Rentals', 'Sales', 'Property management', 'International buyers'];

  // Language switch (visual only until the Spanish copy exists)
  $$('.lang button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      document.documentElement.lang = btn.dataset.lang.toLowerCase();
    });
  });

  // Marquee: four copies of the list so the -50% loop is seamless
  var track = $('[data-marquee-track]');
  if (track) {
    for (var r = 0; r < 4; r++) {
      MARQUEE.forEach(function (t) { track.appendChild(el('span', { class: 'marquee__item', text: t })); });
    }
  }

  // "What brings you here?" accordion — one open at a time, first open by default
  var servicesRoot = $('[data-services]');
  var openIndex = 0;
  var serviceNodes = SERVICES.map(function (s, i) {
    var bodyId = 'service-body-' + i;
    var head = el('button', { type: 'button', class: 'service__head', 'aria-controls': bodyId }, [
      el('span', { class: 'service__n', text: String(i + 1).padStart(2, '0') }),
      el('h3', { class: 'service__title', text: s[0], style: 'margin:0' }),
      el('span', { class: 'service__dot', 'aria-hidden': 'true' }),
    ]);
    var body = el('div', { class: 'service__body', id: bodyId }, [
      el('p', { text: s[1] }),
      el('a', { href: '#guides', class: 'link-cta', text: s[2] + ' →' }),
    ]);
    var item = el('div', { class: 'service' }, [head, body]);
    head.addEventListener('click', function () {
      openIndex = openIndex === i ? -1 : i;
      renderServices();
    });
    servicesRoot.appendChild(item);
    return { item: item, head: head, body: body };
  });
  function renderServices() {
    serviceNodes.forEach(function (n, i) {
      var open = i === openIndex;
      n.item.classList.toggle('is-open', open);
      n.head.setAttribute('aria-expanded', String(open));
      n.body.hidden = !open;
    });
  }
  renderServices();

  // Free guides — pick one, enter email, confirm
  var guideIndex = 1;
  var guideGrid = $('[data-guides]');
  var guideButtons = GUIDES.map(function (g, i) {
    var btn = el('button', { type: 'button', class: 'guide' }, [
      el('span', { class: 'guide__top' }, [
        el('span', { class: 'guide__tag', text: g[0] }),
        el('span', { class: 'guide__mark', 'aria-hidden': 'true' }),
      ]),
      el('span', { class: 'guide__text' }, [
        el('span', { class: 'guide__title', text: g[1] }),
        el('span', { class: 'guide__body', text: g[2] }),
      ]),
    ]);
    btn.addEventListener('click', function () { guideIndex = i; setGuideSent(false); });
    guideGrid.appendChild(btn);
    return btn;
  });
  var guideForm = $('[data-guide-form]');
  function setGuideSent(sent) {
    guideButtons.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === guideIndex)); });
    $$('[data-guide-title]').forEach(function (n) { n.textContent = GUIDES[guideIndex][1]; });
    $$('[data-guide-pending]').forEach(function (n) { n.hidden = sent; });
    $$('[data-guide-done]').forEach(function (n) { n.hidden = !sent; });
  }
  guideForm.addEventListener('submit', function (e) {
    e.preventDefault();
    // TODO: hook up to the email/newsletter provider
    setGuideSent(true);
  });
  $('[data-guide-reset]').addEventListener('click', function () {
    guideForm.reset();
    setGuideSent(false);
  });
  setGuideSent(false);

  // Rental inquiry — selectable filters + live summary sentence
  var sel = { zone: 'Brickell', type: 'Condo', beds: '1 bed', budget: '$2,000–$3,000' };
  var filtersRoot = $('[data-filters]');
  var chips = [];
  FILTERS.forEach(function (f) {
    var key = f[0];
    var opts = el('div', { class: 'filter__opts', role: 'group', 'aria-label': f[1] });
    f[2].forEach(function (o) {
      var chip = el('button', { type: 'button', class: 'chip', text: o });
      chip.addEventListener('click', function () { sel[key] = o; setInquirySent(false); });
      chips.push({ key: key, value: o, node: chip });
      opts.appendChild(chip);
    });
    filtersRoot.appendChild(el('div', { class: 'filter' }, [el('span', { class: 'filter__label', text: f[1] }), opts]));
  });
  function summary() {
    var beds = sel.beds;
    var bedTxt = beds === 'Studio' ? 'A studio' : beds === '3+ beds' ? 'A 3+ bedroom' : 'A ' + beds.split(' ')[0] + '-bedroom';
    var type = sel.type === 'Either' ? 'home' : sel.type.toLowerCase();
    var zone = sel.zone === 'Open to all' ? 'any neighborhood' : sel.zone;
    return bedTxt + ' ' + type + ' in ' + zone + ', ' + sel.budget.toLowerCase() + ' a month.';
  }
  function setInquirySent(sent) {
    chips.forEach(function (c) { c.node.setAttribute('aria-pressed', String(sel[c.key] === c.value)); });
    $('[data-summary]').textContent = summary();
    $('[data-inq-send]').hidden = sent;
    $('[data-inq-done]').hidden = !sent;
  }
  $('[data-inq-send]').addEventListener('click', function () {
    // TODO: send `sel` + summary() to the inquiry endpoint
    setInquirySent(true);
  });
  $('[data-inq-reset]').addEventListener('click', function () { setInquirySent(false); });
  setInquirySent(false);
})();
