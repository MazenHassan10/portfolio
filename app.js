/* ==========================================================================
   Mazen Hassan — Four-Facet Portfolio
   Vanilla-JS port of the design-canvas component. No build step, no deps.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------ data ---------------------------------- */

  var FACETS = {
    engineer:     { label: 'The Engineer',     color: '#1F5EFF', sub: 'Platforms & automation',  line: 'builds the platform',  swing: 25.7 },
    analyst:      { label: 'The Analyst',      color: '#009B72', sub: 'Data & insight',          line: 'finds the signal',     swing: 12.1 },
    leader:       { label: 'The Leader',       color: '#E8420C', sub: 'Teams & delivery',        line: 'ships through people', swing: -1.5 },
    communicator: { label: 'The Communicator', color: '#7B3FE4', sub: 'Teaching & storytelling', line: 'makes it make sense',  swing: -15.3 }
  };

  var KEYS = Object.keys(FACETS);
  var DEFAULT_FACET = 'engineer';
  var DIM = 0.25;

  var WORK = [
    { org: 'SCOPES Health', when: 'Current', role: 'Automation & Platform Engineer', facets: ['engineer', 'analyst'],
      blurb: 'n8n automations for a US healthcare company — turning workflows that took days into minutes, with the data pipelines to prove it.' },
    { org: 'Gramercy Center', when: 'Current', role: 'Full-Stack Engineer', facets: ['engineer'],
      blurb: 'Building a T3 Stack / Next.js platform for a US healthcare provider — typed end to end, from Prisma schema to production.' },
    { org: 'Sputnik', when: 'Current', role: 'Startup Team Lead', facets: ['leader', 'engineer'],
      blurb: 'Leading a startup team from idea to shipped product — wearing the PM hat and the engineer hat, often in the same standup.' },
    { org: 'Apple Collaboration Project', when: 'University', role: 'Technical Project Manager', facets: ['leader'],
      blurb: 'Technical PM on an Apple-collab university project — scoping, roadmapping, and keeping engineers and stakeholders in sync.' },
    { org: 'Enactus', when: 'Ongoing', role: 'Project Management Head', facets: ['leader'],
      blurb: 'Running social-impact projects that reach 200+ beneficiaries a year, and training the moderators who keep them running.' },
    { org: 'Edita Food Industries', when: 'Internship', role: 'Data Analysis Intern', facets: ['analyst'],
      blurb: 'SQL and Pandas on real FMCG production data — cleaning, joining, and answering questions the floor actually asked.' },
    { org: 'Creativa Innovation Hubs', when: 'Internship', role: 'Data Analytics Trainee', facets: ['analyst'],
      blurb: 'Power BI dashboards and analysis practice — from raw exports to visuals a non-analyst can act on.' },
    { org: 'PES Academy', when: 'Ongoing', role: 'Programming Instructor', facets: ['communicator'],
      blurb: 'Teaching programming fundamentals — breaking hard ideas into steps beginners can actually climb.' },
    { org: 'OVD & Techne Summit', when: 'Events', role: 'Public Relations', facets: ['communicator'],
      blurb: 'PR and media work for tech events — Photoshop, Premiere, and Canva when the message needs visuals, not just words.' }
  ];

  var JUGGLING = [
    { name: 'SCOPES Health', facet: 'engineer' },
    { name: 'Gramercy Center', facet: 'engineer' },
    { name: 'Sputnik', facet: 'leader' },
    { name: 'PES Academy', facet: 'communicator' },
    { name: 'Enactus', facet: 'leader' }
  ];

  var TOOLKIT = {
    engineer: ['TypeScript', 'Next.js / T3 Stack', 'tRPC · Prisma', 'PostgreSQL', 'n8n automation', 'Git / CI'],
    analyst: ['SQL', 'Python · Pandas', 'Power BI', 'Excel', 'Data cleaning', 'Dashboarding'],
    leader: ['Roadmapping', 'Agile delivery', 'Stakeholder comms', 'Team building', 'Scoping & estimation'],
    communicator: ['Teaching & curriculum', 'Public relations', 'Photoshop', 'Premiere', 'Canva', 'Presenting']
  };

  /* ----------------------------- helpers -------------------------------- */

  var $ = function (sel) { return document.querySelector(sel); };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function reduced() {
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  var active = DEFAULT_FACET;
  var typeTimer = null;

  /* --------------------------- static render ----------------------------- */

  var tabEls = {};

  function buildTabs() {
    var host = $('#tabs');
    KEYS.forEach(function (k) {
      var f = FACETS[k];
      var btn = el('button', 'tab');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', 'false');

      var head = el('span', 'tab-head');
      var dot = el('span', 'tab-dot');
      dot.style.background = f.color;
      head.appendChild(dot);
      head.appendChild(el('span', 'tab-name', f.label));

      var bar = el('span', 'tab-bar');

      btn.appendChild(head);
      btn.appendChild(el('span', 'tab-sub', f.sub));
      btn.appendChild(bar);

      btn.addEventListener('click', function () { selectFacet(k); });
      btn.addEventListener('keydown', function (e) {
        var i = KEYS.indexOf(k);
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var next = KEYS[(i + (e.key === 'ArrowRight' ? 1 : KEYS.length - 1)) % KEYS.length];
          tabEls[next].btn.focus();
          selectFacet(next);
        }
      });

      tabEls[k] = { btn: btn, bar: bar };
      host.appendChild(btn);
    });
  }

  // Reserve the tallest facet line's height so typing never resizes the caption
  // (a bottom-aligned prism would otherwise jump up when the line wraps).
  function buildFacetGhosts() {
    var slot = $('#facetSlot');
    var live = slot.firstElementChild;
    KEYS.forEach(function (k) {
      var g = el('span', 'facet-ghost', FACETS[k].line);
      g.setAttribute('aria-hidden', 'true');
      slot.insertBefore(g, live);
    });
  }

  function buildJuggling() {
    var host = $('#juggling');
    JUGGLING.forEach(function (g) {
      var wrap = el('span', 'gig');
      var dot = el('span');
      dot.style.background = FACETS[g.facet].color;
      wrap.appendChild(dot);
      wrap.appendChild(document.createTextNode(g.name));
      host.appendChild(wrap);
    });
  }

  var cardEls = [];

  function buildCards() {
    var host = $('#cards');
    WORK.forEach(function (w) {
      var art = el('article', 'card');

      var meta = el('div', 'card-meta');
      meta.appendChild(el('span', 'card-org', w.org));
      meta.appendChild(el('span', 'card-when', w.when));
      art.appendChild(meta);

      art.appendChild(el('h3', 'card-role', w.role));
      art.appendChild(el('p', 'card-blurb', w.blurb));

      var tags = el('div', 'card-tags');
      w.facets.forEach(function (k) {
        var t = el('span', 'tag', FACETS[k].label.replace('The ', ''));
        t.style.color = FACETS[k].color;
        tags.appendChild(t);
      });
      art.appendChild(tags);

      cardEls.push({ node: art, facets: w.facets });
      host.appendChild(art);
    });
  }

  var colEls = {};

  function buildToolkit() {
    var host = $('#toolkit');
    KEYS.forEach(function (k) {
      var f = FACETS[k];
      var col = el('div', 'tk-col');

      var head = el('div', 'tk-head');
      head.style.borderBottomColor = f.color;
      var dot = el('span', 'dot');
      dot.style.background = f.color;
      head.appendChild(dot);
      head.appendChild(el('span', 'tk-name', f.label));
      col.appendChild(head);

      var list = el('div', 'tk-list');
      TOOLKIT[k].forEach(function (s) { list.appendChild(el('span', null, s)); });
      col.appendChild(list);

      colEls[k] = col;
      host.appendChild(col);
    });
  }

  /* ---------------------------- facet state ------------------------------ */

  function typeLine(key) {
    var target = $('#facetLine');
    var line = FACETS[key].line;
    clearInterval(typeTimer);
    if (reduced()) { target.textContent = line; return; }
    var i = 0;
    target.textContent = '';
    typeTimer = setInterval(function () {
      i++;
      target.textContent = line.slice(0, i);
      if (i >= line.length) clearInterval(typeTimer);
    }, 42);
  }

  function sweep(color) {
    if (reduced()) return;
    var layer = $('#sweepLayer');
    layer.innerHTML = '';
    var s = el('div', 'sweep');
    s.style.background = 'linear-gradient(100deg, transparent 32%, ' + color + '4d 50%, transparent 68%)';
    s.addEventListener('animationend', function () { s.remove(); });
    layer.appendChild(s);
  }

  function applyFacet(key, animate) {
    active = key;
    var f = FACETS[key];

    document.documentElement.style.setProperty('--accent', f.color);
    $('#facetLabel').textContent = f.label;

    // tabs
    KEYS.forEach(function (k) {
      var isActive = k === key;
      var t = tabEls[k];
      t.btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.btn.style.background = isActive ? FACETS[k].color + '12' : 'transparent';
      t.bar.style.background = isActive ? FACETS[k].color : 'transparent';
    });

    // prism
    var beams = $('#beams');
    beams.style.transform = 'rotate(' + f.swing + 'deg)';
    KEYS.forEach(function (k) {
      var b = document.querySelector('[data-beam="' + k + '"]');
      b.setAttribute('stroke-width', k === key ? 7 : 3);
      b.setAttribute('opacity', k === key ? 1 : 0.45);
    });

    // work cards — matching work rises
    cardEls.forEach(function (c) {
      var match = c.facets.indexOf(key) !== -1;
      c.node.style.order = match ? 0 : 1;
      c.node.style.opacity = match ? 1 : DIM;
      c.node.style.borderColor = match ? f.color : 'rgba(16,20,24,0.12)';
    });

    // toolkit columns
    KEYS.forEach(function (k) { colEls[k].style.opacity = k === key ? 1 : 0.45; });

    if (animate) sweep(f.color);
    typeLine(key);
  }

  function selectFacet(key) {
    if (key === active) return;
    applyFacet(key, true);
  }

  /* ------------------------------ terminal ------------------------------- */

  var termLines = [
    { text: '$ mazen --help', color: 'rgba(243,245,244,0.5)' },
    { text: 'usage: mazen --facet [engineer|analyst|leader|communicator]', color: 'rgba(243,245,244,0.6)' }
  ];

  function renderTerm() {
    var host = $('#termLines');
    host.innerHTML = '';
    termLines.forEach(function (l) {
      var p = el('p', null, l.text);
      p.style.color = l.color;
      host.appendChild(p);
    });
  }

  function runCommand(v) {
    termLines.push({ text: '$ ' + v, color: '#F3F5F4' });

    var m = v.match(/^mazen\s+--facet\s+(engineer|analyst|leader|communicator)$/i);
    if (m) {
      var k = m[1].toLowerCase();
      termLines.push({ text: 'switching wavelength → ' + FACETS[k].color + ' (' + FACETS[k].label + ')', color: FACETS[k].color });
      termLines = termLines.slice(-8);
      renderTerm();
      selectFacet(k);
      return;
    }

    if (/^mazen\s+--help$/i.test(v)) {
      termLines.push({ text: 'usage: mazen --facet [engineer|analyst|leader|communicator]\n       mazen --contact', color: 'rgba(243,245,244,0.6)' });
    } else if (/^mazen\s+--contact$/i.test(v)) {
      termLines.push({ text: 'mazen.hassan.eng@gmail.com · +20 127 515 1155', color: 'rgba(243,245,244,0.85)' });
    } else {
      termLines.push({ text: "command not found: '" + v + "' — try mazen --help", color: 'rgba(243,245,244,0.5)' });
    }

    termLines = termLines.slice(-8);
    renderTerm();
  }

  function wireTerminal() {
    renderTerm();
    $('#termInput').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var v = e.target.value.trim();
      if (!v) return;
      e.target.value = '';
      runCommand(v);
    });
  }

  /* --------------------------- effects & reveal --------------------------- */

  function wireGlow() {
    var glow = $('#glow');
    if (reduced()) return;
    window.addEventListener('mousemove', function (e) {
      var c = FACETS[active].color;
      glow.style.background = 'radial-gradient(560px circle at ' + e.clientX + 'px ' + e.clientY + 'px, ' + c + '1f, transparent 70%)';
    });
  }

  function wireReveal() {
    // Only hide what starts below the fold, so the page is intact without JS.
    if (reduced() || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-reveal]').forEach(function (node) {
      if (node.getBoundingClientRect().top <= window.innerHeight * 0.85) return;
      node.style.opacity = '0';
      node.style.transform = 'translateY(30px)';
      node.style.transition = 'opacity .7s ease, transform .7s ease';
      io.observe(node);
    });
  }

  /* -------------------------------- init ---------------------------------- */

  buildTabs();
  buildFacetGhosts();
  buildJuggling();
  buildCards();
  buildToolkit();
  wireTerminal();
  applyFacet(DEFAULT_FACET, false);
  wireGlow();
  wireReveal();
})();
