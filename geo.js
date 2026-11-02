/* Spherical geometry helpers. Works in the browser (window.Geo) and in Node (module.exports). */
(function (root) {
  'use strict';
  var R = 6371.0088; // mean Earth radius, km
  function rad(d) { return d * Math.PI / 180; }
  function deg(r) { return r * 180 / Math.PI; }

  /* Great-circle distance (km) and initial bearing (degrees, 0 = north) from a to b. */
  function inverse(a, b) {
    var p1 = rad(a.lat), p2 = rad(b.lat), dl = rad(b.lng - a.lng), dp = p2 - p1;
    var h = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    var dist = 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
    var y = Math.sin(dl) * Math.cos(p2);
    var x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    return { dist: dist, bearing: (deg(Math.atan2(y, x)) + 360) % 360 };
  }

  /* Point reached from a after travelling dist km on the given bearing. */
  function destination(a, dist, bearing) {
    var d = dist / R, t = rad(bearing), p1 = rad(a.lat), l1 = rad(a.lng);
    var p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(t));
    var l2 = l1 + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
    return { lat: deg(p2), lng: ((deg(l2) + 540) % 360) - 180 };
  }

  var POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  function compass(bearing) { return POINTS[Math.round(bearing / 22.5) % 16]; }

  function mercY(lat) {
    return Math.log(Math.tan(Math.PI / 4 + rad(Math.max(-85, Math.min(85, lat))) / 2));
  }

  /* Highest whole zoom level (<= maxZ) at which both points fit inside a w x h box with pad px margins. */
  function zoomToFit(a, b, w, h, pad, maxZ) {
    var dx = Math.abs(a.lng - b.lng) / 360;
    var dy = Math.abs(mercY(a.lat) - mercY(b.lat)) / (2 * Math.PI);
    var zx = dx > 0 ? Math.log(Math.max(40, w - 2 * pad) / (256 * dx)) / Math.LN2 : maxZ;
    var zy = dy > 0 ? Math.log(Math.max(40, h - 2 * pad) / (256 * dy)) / Math.LN2 : maxZ;
    return Math.max(2, Math.min(maxZ, Math.floor(Math.min(zx, zy))));
  }

  /* "9.2 km" under 10 km, whole kilometres above. */
  function fmtKm(km) { return (km < 10 ? km.toFixed(1) : String(Math.round(km))) + ' km'; }

  /* How the camera should travel for a move of km: 'same' (stay), 'near' (glide, keep zoom), 'far' (zoom out, pan, zoom in). */
  var NEAR_KM = 20;
  function moveKind(km) { return km < 0.5 ? 'same' : km < NEAR_KM ? 'near' : 'far'; }

  /* Single-link clusters: items within km of each other (directly or through a chain) end up together. items: [{p:{lat,lng}}] */
  function cluster(items, km) {
    var parent = items.map(function (_, i) { return i; });
    function find(i) { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; }
    for (var i = 0; i < items.length; i++) for (var j = i + 1; j < items.length; j++)
      if (inverse(items[i].p, items[j].p).dist <= km) parent[find(i)] = find(j);
    var groups = {};
    items.forEach(function (it, i) { var r = find(i); (groups[r] = groups[r] || []).push(it); });
    return Object.keys(groups).map(function (k) { return groups[k]; });
  }

  /* Convex hull (Andrew's monotone chain), x = lng, y = lat. Returns points counter-clockwise. */
  function hull(pts) {
    var p = pts.slice().sort(function (a, b) { return a.lng - b.lng || a.lat - b.lat; });
    if (p.length < 3) return p;
    function cross(o, a, b) { return (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng); }
    var lo = [], up = [], i;
    for (i = 0; i < p.length; i++) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p[i]) <= 0) lo.pop(); lo.push(p[i]); }
    for (i = p.length - 1; i >= 0; i--) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p[i]) <= 0) up.pop(); up.push(p[i]); }
    lo.pop(); up.pop();
    return lo.concat(up);
  }

  /* Outline that stays km away from every point: hull of a ring of n points around each one. */
  function bufferedHull(pts, km, n) {
    var ring = [];
    pts.forEach(function (c) { for (var k = 0; k < n; k++) ring.push(destination(c, km, k * 360 / n)); });
    return hull(ring);
  }

  /* Polygon area in km2 (local flat projection, fine for regions of a few hundred km). */
  function areaKm2(poly) {
    if (poly.length < 3) return 0;
    var lat0 = 0, lng0 = poly[0].lng, i;
    poly.forEach(function (p) { lat0 += p.lat; }); lat0 /= poly.length;
    var c = Math.cos(rad(lat0)), s = 0;
    var xy = poly.map(function (p) { return { x: R * rad(p.lng - lng0) * c, y: R * rad(p.lat - lat0) }; });
    for (i = 0; i < xy.length; i++) { var a = xy[i], b = xy[(i + 1) % xy.length]; s += a.x * b.y - b.x * a.y; }
    return Math.abs(s) / 2;
  }

  var api = { R: R, NEAR_KM: NEAR_KM, cluster: cluster, hull: hull, bufferedHull: bufferedHull, areaKm2: areaKm2, inverse: inverse, destination: destination, compass: compass, mercY: mercY, zoomToFit: zoomToFit, fmtKm: fmtKm, moveKind: moveKind };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Geo = api;
})(typeof window !== 'undefined' ? window : this);
