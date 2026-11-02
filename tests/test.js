/* Run with: node tests/test.js  (from the app folder). No dependencies. */
var assert = require('assert');
var G = require('../geo.js');
var D = require('../data.js');
var passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('  ok   ' + name); } catch (e) { console.log('  FAIL ' + name + '\n       ' + e.message); process.exitCode = 1; } }
function near(a, b, tol, label) { assert.ok(Math.abs(a - b) <= tol, (label || '') + ' expected ' + b + ' +/-' + tol + ', got ' + a); }

console.log('geo');
test('Bethlehem to Jerusalem is about 9 km north-north-east', function () {
  var v = G.inverse(D.PLACES.bethlehem, D.PLACES.jerusalem);
  near(v.dist, 9.2, 1.0, 'distance'); assert.ok(['N', 'NNE', 'NE'].indexOf(G.compass(v.bearing)) >= 0, 'bearing ' + v.bearing);
});
test('known city pair: London to Paris about 344 km', function () {
  near(G.inverse({ lat: 51.5072, lng: -0.1276 }, { lat: 48.8566, lng: 2.3522 }).dist, 344, 3);
});
test('distance is symmetric and zero for the same point', function () {
  var a = D.PLACES.nazareth, b = D.PLACES.capernaum;
  near(G.inverse(a, b).dist, G.inverse(b, a).dist, 1e-9); near(G.inverse(a, a).dist, 0, 1e-9);
});
test('compass points for the four directions', function () {
  var o = { lat: 10, lng: 10 };
  assert.strictEqual(G.compass(G.inverse(o, { lat: 11, lng: 10 }).bearing), 'N');
  assert.strictEqual(G.compass(G.inverse(o, { lat: 10, lng: 11 }).bearing), 'E');
  assert.strictEqual(G.compass(G.inverse(o, { lat: 9, lng: 10 }).bearing), 'S');
  assert.strictEqual(G.compass(G.inverse(o, { lat: 10, lng: 9 }).bearing), 'W');
});
test('destination round-trips distance and bearing', function () {
  var o = { lat: 9.5916, lng: 76.5222 };
  [[10, 0], [120, 45], [250, 200], [3, 300]].forEach(function (c) {
    var back = G.inverse(o, G.destination(o, c[0], c[1]));
    near(back.dist, c[0], 0.01, 'dist'); near((back.bearing - c[1] + 540) % 360 - 180, 0, 0.05, 'bearing');
  });
});
test('destination wraps longitude across the date line', function () {
  var p = G.destination({ lat: 0, lng: 179.9 }, 50, 90); assert.ok(p.lng < -179 || p.lng > 179, 'lng ' + p.lng);
});
test('zoomToFit: closer points allow a higher zoom, result is capped and floored', function () {
  var a = { lat: 31.7, lng: 35.2 }, far = { lat: 33.2, lng: 35.7 }, near_ = { lat: 31.78, lng: 35.23 };
  assert.ok(G.zoomToFit(a, near_, 375, 400, 40, 10) >= G.zoomToFit(a, far, 375, 400, 40, 10));
  assert.ok(G.zoomToFit(a, a, 375, 400, 40, 10) === 10);
  assert.ok(G.zoomToFit({ lat: 0, lng: -170 }, { lat: 0, lng: 170 }, 375, 400, 40, 10) >= 2);
});
test('moveKind: same place, near glide, far zoom-out', function () {
  assert.strictEqual(G.moveKind(0), 'same'); assert.strictEqual(G.moveKind(0.49), 'same');
  assert.strictEqual(G.moveKind(0.5), 'near'); assert.strictEqual(G.moveKind(19.9), 'near');
  assert.strictEqual(G.moveKind(20), 'far'); assert.strictEqual(G.moveKind(400), 'far');
});
test('fmtKm', function () { assert.strictEqual(G.fmtKm(9.24), '9.2 km'); assert.strictEqual(G.fmtKm(103.4), '103 km'); });

console.log('overview: heat clusters and travel area');
test('hull drops interior points and keeps the corners', function () {
  var h = G.hull([{ lat: 0, lng: 0 }, { lat: 0, lng: 2 }, { lat: 2, lng: 2 }, { lat: 2, lng: 0 }, { lat: 1, lng: 1 }, { lat: 0.5, lng: 1.2 }]);
  assert.strictEqual(h.length, 4);
});
test('area: 1 degree square at the equator is about 12,364 km2', function () {
  near(G.areaKm2([{ lat: 0, lng: 0 }, { lat: 0, lng: 1 }, { lat: 1, lng: 1 }, { lat: 1, lng: 0 }]), 12364, 60);
});
test('buffered hull encloses every point with at least the buffer to spare', function () {
  var pts = [D.PLACES.bethlehem, D.PLACES.nazareth, D.PLACES.caesarea], hl = G.bufferedHull(pts, 6, 16);
  assert.ok(hl.length >= 8);
  pts.forEach(function (c) { hl.forEach(function (v) { assert.ok(G.inverse(c, v).dist >= 5.9, 'vertex too close to a place'); }); });
  assert.ok(G.areaKm2(hl) > G.areaKm2(G.hull(pts)));
});
test('clusters: Jerusalem sites merge, Bethlehem stays apart, Galilee shore sites merge', function () {
  var items = []; D.EVENTS.forEach(function (e, i) { if (e.place && !D.PLACES[e.place].offmap) items.push({ i: i, key: e.place, p: D.PLACES[e.place] }); });
  var cl = G.cluster(items, 7), keysOf = function (g) { return g.map(function (x) { return x.key; }); };
  assert.strictEqual(items.length, 29, 'located events (all but Egypt, which is off the map)');
  assert.strictEqual(cl.reduce(function (s, g) { return s + g.length; }, 0), 29, 'no event lost');
  var jer = cl.filter(function (g) { return keysOf(g).indexOf('golgotha') >= 0; })[0];
  ['jerusalem', 'upperroom', 'gethsemane', 'olivet', 'bethany'].forEach(function (k) { assert.ok(keysOf(jer).indexOf(k) >= 0, k + ' in Jerusalem cluster'); });
  assert.ok(keysOf(jer).indexOf('bethlehem') < 0, 'Bethlehem is 9 km away');
  var gal = cl.filter(function (g) { return keysOf(g).indexOf('capernaum') >= 0; })[0];
  ['shore', 'lake', 'bethsaida'].forEach(function (k) { assert.ok(keysOf(gal).indexOf(k) >= 0, k + ' in Galilee cluster'); });
  console.log('       clusters: ' + cl.map(function (g) { return g[0].key + ' x' + g.length; }).join(', '));
});
test('travel area is a plausible size and contains every place', function () {
  var pts = Object.keys(D.PLACES).filter(function (k) { return !D.PLACES[k].offmap; }).map(function (k) { return D.PLACES[k]; }), hl = G.bufferedHull(pts, 6, 16), a = G.areaKm2(hl);
  assert.ok(a > 4000 && a < 20000, 'area ' + Math.round(a));
  var minLat = Math.min.apply(null, hl.map(function (p) { return p.lat; })), maxLat = Math.max.apply(null, hl.map(function (p) { return p.lat; }));
  assert.ok(minLat < 31.66 && maxLat > 33.29, 'spans Bethlehem to Caesarea Philippi (' + minLat.toFixed(3) + ' to ' + maxLat.toFixed(3) + ')');
  console.log('       area about ' + Math.round(a) + ' km2');
});

console.log('data');
var E = D.EVENTS, P = D.PLACES;
test('exactly 30 events in 7 chapters', function () {
  assert.strictEqual(E.length, 30); assert.strictEqual(new Set(E.map(function (e) { return e.ch; })).size, 7);
});
test('chapters appear in order, never revisited', function () {
  var seen = [], last = null;
  E.forEach(function (e) { if (e.ch !== last) { assert.ok(seen.indexOf(e.ch) < 0, 'chapter revisited: ' + e.ch); seen.push(e.ch); last = e.ch; } });
});
test('every event has title, age and a well-formed passage reference', function () {
  var re = /^(?:[1-3] )?[A-Z][a-z]+ \d+:\d+(?:-\d+(?::\d+)?)?$/;
  E.forEach(function (e, i) {
    assert.ok(e.t && e.t.length <= 32, 'title #' + (i + 1)); assert.ok(e.age, 'age #' + (i + 1));
    assert.ok(re.test(e.ref), 'ref #' + (i + 1) + ': ' + e.ref); if (e.ot) assert.ok(re.test(e.ot), 'ot #' + (i + 1) + ': ' + e.ot);
  });
});
test('every referenced place exists; events without a place say why', function () {
  E.forEach(function (e, i) { if (e.place) assert.ok(P[e.place], 'place #' + (i + 1)); else assert.ok(e.pn, 'pn #' + (i + 1)); });
});
test('coordinates are inside the Holy Land box (Egypt: Old Cairo)', function () {
  Object.keys(P).forEach(function (k) { var p = P[k]; if (p.offmap) { assert.ok(p.lat > 29 && p.lat < 31 && p.lng > 31 && p.lng < 32, k + ' (Old Cairo)'); return; } assert.ok(p.lat > 31 && p.lat < 33.5 && p.lng > 35 && p.lng < 36, k); });
});
test('Matthew, Mark, Luke, John and Acts are the only sources', function () {
  E.forEach(function (e) { assert.ok(/^(Matthew|Mark|Luke|John|Acts) /.test(e.ref), e.ref); });
});

test('camera plan: which steps zoom out and in, and which only glide', function () {
  var kinds = { same: 0, near: 0, far: 0 }, prev = null;
  E.forEach(function (e) {
    if (!e.place) return;
    if (prev) kinds[G.moveKind(G.inverse(P[prev], P[e.place]).dist)]++;
    prev = e.place;
  });
  assert.ok(kinds.same > 0 && kinds.near > 0 && kinds.far > 0, JSON.stringify(kinds));
  // Bethlehem -> Jerusalem (about 9 km) must not zoom out; Jerusalem -> Jordan River (about 31 km) must
  assert.strictEqual(G.moveKind(G.inverse(P.bethlehem, P.jerusalem).dist), 'near');
  assert.strictEqual(G.moveKind(G.inverse(P.jerusalem, P.jordan).dist), 'far');
  console.log('       steps by camera: ' + JSON.stringify(kinds));
});

console.log('home-city projection');
var cities = { Kottayam: { lat: 9.5916, lng: 76.5222 }, Singapore: { lat: 1.3521, lng: 103.8198 }, London: { lat: 51.5072, lng: -0.1276 }, 'New York': { lat: 40.7128, lng: -74.006 } };
Object.keys(cities).forEach(function (name) {
  test(name + ': distance from the anchor equals the real distance from Bethlehem, same bearing', function () {
    E.forEach(function (e) {
      if (!e.place) return;
      var v = G.inverse(P.bethlehem, P[e.place]), q = G.destination(cities[name], v.dist, v.bearing), back = G.inverse(cities[name], q);
      near(back.dist, v.dist, 0.01); if (v.dist > 0.5) near((back.bearing - v.bearing + 540) % 360 - 180, 0, 0.05);
    });
  });
  test(name + ': step-to-step distances stay within 1.5% of the real ones', function () {
    var prev = null;
    E.forEach(function (e) {
      if (!e.place) return;
      var v = G.inverse(P.bethlehem, P[e.place]), q = G.destination(cities[name], v.dist, v.bearing);
      if (prev) {
        var real = G.inverse(prev.real, P[e.place]).dist, proj = G.inverse(prev.proj, q).dist;
        if (real > 2) assert.ok(Math.abs(proj - real) / real < 0.015, e.t + ': real ' + real.toFixed(1) + ' projected ' + proj.toFixed(1));
      }
      prev = { real: P[e.place], proj: q };
    });
  });
});

console.log('\n' + passed + ' passed' + (process.exitCode ? ', some FAILED' : ''));
