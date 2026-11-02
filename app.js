(function () {
  'use strict';
  var G = window.Geo, E = window.EVENTS, P = window.PLACES, cfg = window.APP_CONFIG || {};
  var LAST = E.length - 1, BETH = P.bethlehem, CLOSE = 12;
  var PRESETS = [
    { name: 'Kottayam', lat: 9.5916, lng: 76.5222 }, { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 }, { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 }, { name: 'London', lat: 51.5072, lng: -0.1276 },
    { name: 'New York', lat: 40.7128, lng: -74.0060 }
  ];
  var STORE = 'ihf.v1';
  var S = { idx: 0, mode: 'holy', home: null, map: null, markers: [], layers: [], overview: false, route: null, dot: null, raf: 0, playing: false, fly: 0, loaded: false, gmErr: '', sheet: false, prevFocus: null };

  function $(id) { return document.getElementById(id); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function stillCurrent(tk, ms) { return wait(ms).then(function () { return tk === S.fly; }); }

  /* ---------- places and distances ---------- */
  function loc(i) { var p = E[i].place; return p ? P[p] : null; }
  function placeName(i) { var p = E[i].place; return p ? P[p].name : E[i].pn; }
  function prevIdx(i) { for (var j = i - 1; j >= 0; j--) if (loc(j)) return j; return -1; }
  /* Where a place is drawn: its real position, or in "My city" mode the same distance and bearing from Bethlehem, anchored on the city. */
  function pt(i) {
    var l = loc(i); if (!l) return null;
    if (S.mode !== 'home' || !S.home) return { lat: l.lat, lng: l.lng };
    var v = G.inverse(BETH, l);
    return G.destination(S.home, v.dist, v.bearing);
  }
  function legText(i) {
    var l = loc(i); if (!l) return 'No fixed place';
    var pj = prevIdx(i); if (pj < 0) return 'Start';
    var v = G.inverse(loc(pj), l);
    return v.dist < 0.5 ? 'Same place' : G.fmtKm(v.dist) + ' ' + G.compass(v.bearing);
  }

  /* ---------- persistence and URL ---------- */
  function save() { try { localStorage.setItem(STORE, JSON.stringify({ mode: S.mode, home: S.home })); } catch (e) {} }
  function restore() { try { var o = JSON.parse(localStorage.getItem(STORE) || 'null'); if (o && o.mode === 'home' && o.home && isFinite(o.home.lat)) { S.mode = 'home'; S.home = o.home; } } catch (e) {} }
  function readUrl() {
    var q = new URLSearchParams(location.search), e = parseInt(q.get('e'), 10);
    if (e >= 1 && e <= E.length) S.idx = e - 1;
    return q.get('city');
  }
  function shareUrl() {
    var u = location.origin + location.pathname + '?e=' + (S.idx + 1);
    if (S.mode === 'home' && S.home) u += '&city=' + encodeURIComponent(S.home.name);
    return location.protocol === 'file:' ? location.href.split('?')[0] + '?e=' + (S.idx + 1) : u;
  }

  /* On the last event, Next becomes "Overview": the journey ends with the heat map and travel area */
  function updateNext() {
    var last = S.idx === LAST;
    $('next').textContent = last ? '◎' : '›';
    $('next').disabled = last && S.overview;
    $('next').setAttribute('aria-label', last ? 'Show heat map and travel area' : 'Next event');
    $('next').title = last ? 'Heat map and travel area' : 'Next event';
  }

  /* ---------- card and menu ---------- */
  function bible(ref, ver) { return 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(ref) + '&version=' + ver; }
  /* bubble above the centred pin: event, life stage, place, and how far from the previous event */
  function renderBubble() {
    var b = $('bubble');
    if (S.overview) { b.classList.remove('show'); return; }
    var e = E[S.idx];
    $('bTitle').textContent = e.t;
    $('bMeta').innerHTML = esc('◷ ' + e.age + ' · ⌖ ' + placeName(S.idx)) + '<br>' + esc('↗ ' + legText(S.idx));
    b.classList.toggle('nopin', !loc(S.idx));
    b.classList.add('show');
  }
  function renderCard() {
    var e = E[S.idx];
    $('prev').disabled = S.idx === 0;
    updateNext();
    $('play').innerHTML = S.playing ? '&#10074;&#10074;' : '&#9654;';
    $('play').setAttribute('aria-label', S.playing ? 'Pause' : 'Play');
    $('chipText').textContent = S.mode === 'home' && S.home ? S.home.name : 'Holy Land';
    $('passage').textContent = e.t + ' — ' + e.ref.replace('-', '–') + (e.note ? ' (' + e.note + ')' : '');
    $('linkNIV').href = bible(e.ref, 'NIV'); $('linkNIV').textContent = 'NIV';
    $('linkKJV').href = bible(e.ref, 'KJV'); $('linkKJV').textContent = 'KJV';
    var ot = $('linkOT'); ot.hidden = !e.ot;
    if (e.ot) { ot.href = bible(e.ot, 'NIV'); ot.textContent = 'OT: ' + e.ot; }
    /* the ladder: current event highlighted, earlier ones muted */
    document.querySelectorAll('#ladder button').forEach(function (b, k) {
      b.classList.toggle('cur', k === S.idx); b.classList.toggle('done', k < S.idx);
      if (k === S.idx) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    var cur = document.querySelector('#ladder .cur'); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
    $('modeHoly').setAttribute('aria-pressed', String(S.mode === 'holy'));
    $('modeHome').setAttribute('aria-pressed', String(S.mode === 'home'));
    renderBubble();
  }
  function buildMenu() {
    $('ladder').style.gridTemplateRows = 'repeat(' + E.length + ',minmax(19px,1fr))';
    $('ladder').innerHTML = E.map(function (e, i) {
      return '<li><button type="button" data-i="' + i + '" title="' + esc(e.t + ' — ' + e.ref) + '"><b>' + (i + 1) + '</b><span>' + esc(e.t) + '</span></button></li>';
    }).join('');
    $('presets').innerHTML = PRESETS.map(function (c, i) { return '<button type="button" data-p="' + i + '">' + esc(c.name) + '</button>'; }).join('');
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function setSheet(open) {
    S.sheet = !!open;
    document.body.classList.toggle('open', S.sheet);
    $('menuBtn').setAttribute('aria-expanded', String(S.sheet));
    $('sheet').setAttribute('aria-hidden', String(!S.sheet));
    if (S.sheet) {
      S.prevFocus = document.activeElement; $('sheet').inert = false; $('sheetBody').scrollTop = 0;
      setTimeout(function () { if (S.sheet) $('closeBtn').focus(); }, 30);
    } else {
      $('sheet').inert = true;
      if (S.prevFocus && S.prevFocus.isConnected) S.prevFocus.focus();
      S.prevFocus = null;
    }
  }
  /* ---------- place dropdown (top-left chip) ---------- */
  function placeOptions() {
    var cur = S.mode === 'home' && S.home ? S.home.name : null;
    var opts = [{ label: 'Holy Land', checked: !cur, act: 'holy' }];
    PRESETS.forEach(function (c, i) { opts.push({ label: c.name, checked: cur === c.name, act: 'preset', i: i }); });
    if (cur && !PRESETS.some(function (c) { return c.name === cur; })) opts.splice(1, 0, { label: cur, checked: true, act: 'current' });
    return opts;
  }
  function buildPlaceMenu() {
    $('placeMenu').innerHTML = placeOptions().map(function (o) {
      return '<button type="button" role="menuitemradio" aria-checked="' + o.checked + '" data-act="' + o.act + '"' + (o.i != null ? ' data-i="' + o.i + '"' : '') + '>' + esc(o.label) + '</button>';
    }).join('') + '<hr><button type="button" role="menuitem" class="other" data-act="other">Other city…</button>';
  }
  function setPlaceMenu(open) {
    var m = $('placeMenu'); if (open) buildPlaceMenu();
    m.hidden = !open; $('chip').setAttribute('aria-expanded', String(open));
    if (open) { var c = m.querySelector('[aria-checked="true"]') || m.querySelector('button'); if (c) c.focus(); }
  }
  function placeMenuOpen() { return !$('placeMenu').hidden; }
  function pickPlace(b) {
    var act = b.dataset.act;
    setPlaceMenu(false);
    if (act === 'holy') applyHoly();
    else if (act === 'preset') applyCity(PRESETS[+b.dataset.i]);
    else if (act === 'current') applyCity(S.home);
    else if (act === 'other') { setSheet(true); setTimeout(function () { $('cityInput').focus(); }, 80); }
  }

  function msg(text, ok) { var m = $('cityMsg'); m.textContent = text || ''; m.classList.toggle('ok', !!ok); }

  /* ---------- map overlays ---------- */
  function pin(active) {
    return { path: google.maps.SymbolPath.CIRCLE, scale: active ? 15 : 10, fillColor: active ? '#c28a2c' : '#1d5a73', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: active ? 3 : 2 };
  }
  function clearOverlays() {
    cancelAnimationFrame(S.raf); S.raf = 0;
    S.markers.forEach(function (m) { m.setMap(null); }); S.markers = [];
    S.layers.forEach(function (l) { l.setMap(null); }); S.layers = [];
    if (S.route) { S.route.setMap(null); S.route = null; }
    if (S.dot) { S.dot.setMap(null); S.dot = null; }
  }
  function drawMarkers() {
    if (!S.map) return;
    clearOverlays();
    var seen = {};
    for (var j = 0; j <= S.idx; j++) {
      if (!loc(j)) continue;
      var key = E[j].place;
      if (seen[key] && j !== S.idx) continue;
      seen[key] = 1;
      var active = j === S.idx;
      var m = new google.maps.Marker({
        map: S.map, position: pt(j), title: placeName(j) + ': ' + E[j].t, zIndex: active ? 10 : 1, icon: pin(active),
        label: { text: String(j + 1), color: '#ffffff', fontWeight: '700', fontSize: active ? '13px' : '11px' }
      });
      m.addListener('click', (function (k) { return function () { stop(); go(k); }; })(j));
      S.markers.push(m);
    }
  }
  function drawRoute(a, b) {
    S.route = new google.maps.Polyline({ map: S.map, path: [a, b], strokeOpacity: 0, clickable: false,
      icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.9, strokeColor: '#c28a2c', scale: 3 }, offset: '0', repeat: '14px' }] });
  }
  function runDot(a, b, ms) {
    var dot = new google.maps.Marker({ map: S.map, position: a, clickable: false, zIndex: 5,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: '#e0a63e', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 } });
    S.dot = dot;
    var t0 = performance.now();
    (function frame(t) {
      if (S.dot !== dot) return;
      var f = Math.min((t - t0) / ms, 1); f = 1 - (1 - f) * (1 - f);
      dot.setPosition({ lat: a.lat + (b.lat - a.lat) * f, lng: a.lng + (b.lng - a.lng) * f });
      if (f < 1) S.raf = requestAnimationFrame(frame);
    })(t0);
  }

  function hideBubble() { $('bubble').classList.remove('show'); }

  /* ---------- camera: the target is always centred.
     far move  (20 km or more): long view first, then close view
     near move (under 20 km):   glide across at the same zoom, no zoom out and in
     same place:                stay put ---------- */
  async function fly(tk) {
    var to = pt(S.idx); if (!to || !S.map) return;
    var pj = prevIdx(S.idx), from = pj >= 0 ? pt(pj) : null;
    var kind = pj < 0 ? 'near' : G.moveKind(G.inverse(loc(pj), loc(S.idx)).dist);
    if (kind === 'far') {
      var el = $('map'), w = el.clientWidth, h = el.clientHeight;
      var wide = Math.max(3, Math.min(CLOSE - 2, G.zoomToFit(from, to, w, h - 2 * Math.min(200, h * 0.25), 50, CLOSE - 2)));
      S.map.setZoom(wide); S.map.panTo({ lat: (from.lat + to.lat) / 2, lng: (from.lng + to.lng) / 2 });
      if (!(await stillCurrent(tk, 1000))) return;
      drawRoute(from, to); runDot(from, to, 1200);
      S.map.panTo(to);
      if (!(await stillCurrent(tk, 1250))) return;
      S.map.setZoom(CLOSE);
      if (!(await stillCurrent(tk, 600))) return;
    } else {
      if (S.map.getZoom() !== CLOSE) S.map.setZoom(CLOSE);
      if (from && kind === 'near') { drawRoute(from, to); runDot(from, to, 1000); }
      S.map.panTo(to);
      if (!(await stillCurrent(tk, kind === 'same' ? 600 : 1200))) return;
    }
  }
  async function go(i) {
    i = Math.max(0, Math.min(LAST, i));
    S.idx = i; var tk = ++S.fly;
    leaveOverview();
    renderCard(); drawMarkers();
    if (S.map) await fly(tk);
  }

  /* ---------- overview: heat map of where the events happened + fence around the whole travel area ---------- */
  var HEAT = [[1, '#ffd84d', 0.16], [0.72, '#ffb02e', 0.2], [0.46, '#ff6a1f', 0.26], [0.24, '#d62d20', 0.34]];
  var CLUSTER_KM = 7, FENCE_KM = 6;
  function clusterEvents() {
    var items = [];
    E.forEach(function (e, i) { if (e.place) items.push({ p: pt(i), name: P[e.place].name }); });
    return G.cluster(items, CLUSTER_KM).map(function (g) {
      var lat = 0, lng = 0, tally = {};
      g.forEach(function (x) { lat += x.p.lat; lng += x.p.lng; tally[x.name] = (tally[x.name] || 0) + 1; });
      var name = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; })[0];
      return { n: g.length, center: { lat: lat / g.length, lng: lng / g.length }, name: name };
    }).sort(function (a, b) { return b.n - a.n; });
  }
  function fenceRing() {
    var pts = []; E.forEach(function (e, i) { if (e.place) pts.push(pt(i)); });
    return G.bufferedHull(pts, FENCE_KM, 16);
  }
  function syncOverviewUI() {
    $('legend').hidden = !S.overview;
    $('overviewBtn').setAttribute('aria-pressed', String(S.overview));
    $('overviewBtn').textContent = S.overview ? 'Back to journey' : 'Show on map';
    updateNext();
  }
  function ringStats(ring) {
    var lats = ring.map(function (p) { return p.lat; }), lngs = ring.map(function (p) { return p.lng; });
    var minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats), minLng = Math.min.apply(null, lngs), maxLng = Math.max.apply(null, lngs);
    var midLat = (minLat + maxLat) / 2, midLng = (minLng + maxLng) / 2;
    return {
      ns: G.inverse({ lat: minLat, lng: midLng }, { lat: maxLat, lng: midLng }).dist,
      ew: G.inverse({ lat: midLat, lng: minLng }, { lat: midLat, lng: maxLng }).dist,
      area: Math.round(G.areaKm2(ring) / 100) * 100
    };
  }
  function areaText(s) { return 'Travel area: about ' + s.area.toLocaleString('en') + ' km² (' + Math.round(s.ns) + ' km N–S, ' + Math.round(s.ew) + ' km E–W)'; }
  var HEAT_COLORS = ['#ffd84d', '#ffb02e', '#ff6a1f', '#d62d20'];
  /* The heat map as a ranked list in the menu; tap a row to see that hotspot on the map */
  function buildHeatMenu() {
    var cl = clusterEvents(), max = cl[0].n;
    $('heatList').innerHTML = cl.map(function (c, i) {
      var r = c.n / max, col = HEAT_COLORS[Math.min(3, Math.round(r * 3))];
      return '<li><button type="button" data-c="' + i + '"><i style="width:' + Math.round(r * 100) + '%;background:' + col + '"></i><span>' + esc(c.name) + '</span><b>' + c.n + (c.n === 1 ? ' event' : ' events') + '</b></button></li>';
    }).join('');
    $('heatArea').textContent = areaText(ringStats(fenceRing()));
  }
  function focusCluster(i) {
    showOverview();
    var c = S.overviewInfo && S.overviewInfo.clusters[i]; if (!c || !S.map) return;
    S.map.setZoom(11); S.map.panTo(c.center);
  }
  function leaveOverview() { if (!S.overview) return; S.overview = false; syncOverviewUI(); renderBubble(); }
  function showOverview() {
    if (!S.map) return;
    S.overview = true; S.fly++; stop(); hideBubble(); clearOverlays();
    var cl = clusterEvents(), ring = fenceRing(), b = new google.maps.LatLngBounds();
    ring.forEach(function (p) { b.extend(p); });
    S.layers.push(new google.maps.Polygon({ map: S.map, paths: ring, strokeWeight: 0, fillColor: '#1d5a73', fillOpacity: 0.07, clickable: false, zIndex: 0 }));
    S.layers.push(new google.maps.Polyline({ map: S.map, path: ring.concat([ring[0]]), strokeOpacity: 0, clickable: false, zIndex: 2,
      icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: '#1d5a73', scale: 3 }, offset: '0', repeat: '12px' }] }));
    cl.forEach(function (c) {
      var r = 5000 + 3200 * Math.sqrt(c.n);
      HEAT.forEach(function (h) {
        S.layers.push(new google.maps.Circle({ map: S.map, center: c.center, radius: r * h[0], fillColor: h[1], fillOpacity: h[2], strokeWeight: 0, clickable: false, zIndex: 1 }));
      });
      S.layers.push(new google.maps.Marker({ map: S.map, position: c.center, clickable: false, zIndex: 3, title: c.name + ': ' + c.n + (c.n === 1 ? ' event' : ' events'),
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 11, fillColor: '#16222c', fillOpacity: 0.92, strokeColor: '#ffffff', strokeWeight: 2 },
        label: { text: String(c.n), color: '#ffffff', fontWeight: '700', fontSize: '12px' } }));
    });
    var st = ringStats(ring);
    $('lgTop').textContent = 'Most events: ' + cl.slice(0, 3).map(function (c) { return c.name + ' ' + c.n; }).join(' · ');
    $('lgArea').textContent = areaText(st);
    syncOverviewUI();
    S.map.fitBounds(b, { top: 70, bottom: $('legend').offsetHeight + 30, left: 20, right: 20 });
    S.overviewInfo = { clusters: cl, ring: ring, area: st.area, ns: st.ns, ew: st.ew };
  }
  function refreshView() { if (S.overview) showOverview(); else go(S.idx); }

  /* ---------- play ---------- */
  function stop() { if (!S.playing) return; S.playing = false; renderCard(); }
  async function play() {
    if (S.playing) { stop(); return; }
    S.playing = true; renderCard(); setSheet(false);
    if (S.overview) { leaveOverview(); drawMarkers(); }
    if (S.idx >= LAST) await go(0);
    while (S.playing && S.idx < LAST) {
      await wait(1500);
      if (!S.playing) break;
      await go(S.idx + 1);
    }
    /* the journey ends with the heat map and travel area, unless the user stopped it */
    var finished = S.playing && S.idx >= LAST;
    if (finished) { await wait(2500); finished = S.playing; }
    S.playing = false; renderCard();
    if (finished) showOverview();
  }

  /* ---------- city ---------- */
  function applyCity(c) { S.mode = 'home'; S.home = { name: c.name, lat: c.lat, lng: c.lng }; save(); renderCard(); refreshView(); }
  function applyHoly() { S.mode = 'holy'; save(); renderCard(); refreshView(); }
  async function findCity(q) {
    var preset = PRESETS.filter(function (c) { return c.name.toLowerCase() === q.toLowerCase(); })[0];
    if (preset) return preset;
    if (!window.google || !S.map) throw new Error('The map is not ready yet. Try again in a moment.');
    var r;
    try { r = await new google.maps.Geocoder().geocode({ address: q }); }
    catch (err) {
      var c = (err && err.code) || '';
      throw new Error(c === 'ZERO_RESULTS' ? 'City not found. Try adding the country.'
        : c === 'REQUEST_DENIED' ? 'City search is not enabled for this key (enable the Geocoding API). Pick a city below instead.'
        : 'City search failed' + (c ? ' (' + c + ')' : '') + '.');
    }
    var g = r && r.results && r.results[0];
    if (!g) throw new Error('City not found. Try adding the country.');
    var comp = (g.address_components || []).filter(function (a) { return a.types.indexOf('locality') >= 0; })[0] || (g.address_components || [])[0];
    return { name: comp ? comp.long_name : q, lat: g.geometry.location.lat(), lng: g.geometry.location.lng() };
  }

  /* ---------- Google Maps loading (key comes from config.js, visitors never see it) ---------- */
  var GM_HINT = {
    RefererNotAllowedMapError: 'This site address is not allowed for the key. Add it under Website restrictions.',
    ApiNotActivatedMapError: 'Maps JavaScript API is not enabled for the key\'s project.',
    BillingNotEnabledMapError: 'Billing is not enabled for the key\'s project.',
    InvalidKeyMapError: 'The key is not valid.',
    ApiTargetBlockedMapError: 'The key\'s API restrictions exclude Maps JavaScript API.',
    ExpiredKeyMapError: 'The key has expired.',
    MissingKeyMapError: 'No key was sent.'
  };
  function banner(text) { var b = $('banner'); b.textContent = text; b.hidden = !text; }
  function failMessage() {
    var base = 'The map could not load.';
    var why = GM_HINT[S.gmErr] || (location.protocol === 'file:' ? 'This page was opened from a file; open it from its web address.' : 'Check the Google Maps key, the Maps JavaScript API and billing.');
    return base + ' ' + why + (S.gmErr ? ' (' + S.gmErr + ')' : '');
  }
  var oce = console.error;
  console.error = function () {
    try { var m = /Google Maps JavaScript API error: (\w+)/.exec(String(arguments[0])); if (m) { S.gmErr = m[1]; if (S.map && !S.loaded) banner(failMessage()); } } catch (e) {}
    return oce.apply(console, arguments);
  };
  window.gm_authFailure = function () { banner(failMessage()); };
  function loadScript(key) {
    return new Promise(function (res, rej) {
      if (window.google && google.maps) return res();
      var t = setTimeout(function () { rej(new Error('No response from Google. Check the internet connection.')); }, 15000);
      window.__gmReady = function () { clearTimeout(t); res(); };
      var s = document.createElement('script'); s.async = true;
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key) + '&v=weekly&loading=async&callback=__gmReady';
      s.onerror = function () { clearTimeout(t); rej(new Error('The Google Maps script was blocked or could not load.')); };
      document.head.appendChild(s);
    });
  }
  async function initMap() {
    var key = (cfg.GOOGLE_MAPS_KEY || '').trim();
    if (!key) { banner('Map key missing: add the Google Maps key to config.js.'); return; }
    try {
      await loadScript(key);
      var lib = await google.maps.importLibrary('maps');
      S.map = new lib.Map($('map'), { center: { lat: 32.0, lng: 35.3 }, zoom: 8, disableDefaultUI: true, gestureHandling: 'greedy', clickableIcons: false, keyboardShortcuts: false });
      google.maps.event.addListenerOnce(S.map, 'tilesloaded', function () { S.loaded = true; banner(''); });
      setTimeout(function () { if (!S.loaded) banner(failMessage()); }, 12000);
      go(S.idx);
    } catch (err) { banner(err.message); }
  }

  /* ---------- wiring ---------- */
  function wire() {
    $('next').addEventListener('click', function () { stop(); if (S.idx === LAST) showOverview(); else go(S.idx + 1); });
    $('heatList').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; stop(); setSheet(false); focusCluster(+b.dataset.c); });
    $('prev').addEventListener('click', function () { stop(); go(S.idx - 1); });
    $('play').addEventListener('click', play);
    $('menuBtn').addEventListener('click', function () { setPlaceMenu(false); setSheet(!S.sheet); });
    $('chip').addEventListener('click', function () { setPlaceMenu(!placeMenuOpen()); });
    $('overviewBtn').addEventListener('click', function () { setSheet(false); if (S.overview) go(S.idx); else showOverview(); });
    $('lgExit').addEventListener('click', function () { go(S.idx); });
    $('placeMenu').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) pickPlace(b); });
    document.addEventListener('click', function (ev) { if (placeMenuOpen() && !ev.target.closest('.place')) setPlaceMenu(false); });
    $('closeBtn').addEventListener('click', function () { setSheet(false); });
    $('scrim').addEventListener('click', function () { setSheet(false); });
    $('ladder').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; stop(); setSheet(false); go(+b.dataset.i); });
    $('presets').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; var c = PRESETS[+b.dataset.p]; $('cityInput').value = c.name; msg(''); applyCity(c); setSheet(false); });
    $('modeHoly').addEventListener('click', function () { msg(''); applyHoly(); setSheet(false); });
    $('modeHome').addEventListener('click', function () {
      if (S.home) { applyCity(S.home); setSheet(false); } else { msg('Type your city below or pick one.', true); $('cityInput').focus(); }
    });
    $('cityForm').addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var q = $('cityInput').value.trim(); if (!q) { msg('Type a city first.'); return; }
      msg('Searching…', true);
      try { var c = await findCity(q); msg(''); applyCity(c); setSheet(false); }
      catch (err) { msg(err.message); }
    });
    $('shareBtn').addEventListener('click', function () {
      var url = shareUrl(), text = 'In His Footsteps — follow the life of Jesus on the map: ' + url;
      if (navigator.share) navigator.share({ title: 'In His Footsteps', text: text, url: url }).catch(function () {});
      else window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
    document.addEventListener('keydown', function (e) {
      if (placeMenuOpen()) {
        if (e.key === 'Escape') { setPlaceMenu(false); $('chip').focus(); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          var items = Array.prototype.slice.call($('placeMenu').querySelectorAll('button')), k = items.indexOf(document.activeElement);
          items[(k + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
        }
        return;
      }
      if (S.sheet) {
        if (e.key === 'Escape') { setSheet(false); return; }
        if (e.key === 'Tab') {
          var f = Array.prototype.filter.call($('sheet').querySelectorAll('button:not(:disabled),a[href]:not([hidden]),input'), function (n) { return n.getClientRects().length; });
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { stop(); go(S.idx + 1); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { stop(); go(S.idx - 1); }
    });
  }

  buildMenu(); buildHeatMenu(); wire(); restore();
  var cityParam = readUrl();
  renderCard();
  initMap().then(async function () {
    if (!cityParam) return;
    try { applyCity(await findCity(cityParam)); } catch (e) { /* link keeps working in Holy Land mode */ }
  });

  window.__app = { S: S, showOverview: showOverview, go: go, play: play, stop: stop, pt: pt, legText: legText, findCity: findCity, applyCity: applyCity, applyHoly: applyHoly, setSheet: setSheet, shareUrl: shareUrl };
})();
