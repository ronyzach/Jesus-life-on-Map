/* One small coloured scene per event, drawn on a 160 x 64 canvas and shown across the top of the bubble.
   Same names as icons.js (data.js `ic`). Flat shapes only, built from a few helpers so the set looks like one family. */
(function (root) {
  'use strict';

  var SKIN = '#e3b58a', WHITE = '#f4efe6', GOLD = '#f2c14e', BROWN = '#8a5a36', STONE = '#cfc6b4', GREEN = '#5a9a58', BLUE = '#3f6fb5', RED = '#b5483f', SAND = '#e8c98a';

  function sky(id, a, b) {
    return '<defs><linearGradient id="s_' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="160" height="64" fill="url(#s_' + id + ')"/>';
  }
  function rect(x, y, w, h, c, o) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"' + (o ? ' opacity="' + o + '"' : '') + '/>'; }
  function circ(x, y, r, c, o) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"' + (o ? ' opacity="' + o + '"' : '') + '/>'; }
  function ell(x, y, rx, ry, c, o) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + c + '"' + (o ? ' opacity="' + o + '"' : '') + '/>'; }
  function path(d, c, o) { return '<path d="' + d + '" fill="' + c + '"' + (o !== undefined ? ' opacity="' + o + '"' : '') + '/>'; }
  function line(d, c, w, o) { return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"' + (o ? ' opacity="' + o + '"' : '') + '/>'; }
  function star(x, y, r, c) {
    var p = [], i, a, k;
    for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; k = i % 2 ? r * 0.45 : r; p.push((x + Math.cos(a) * k).toFixed(1) + ',' + (y + Math.sin(a) * k).toFixed(1)); }
    return circ(x, y, r * 2.2, c, 0.18) + '<polygon points="' + p.join(' ') + '" fill="' + c + '"/>';
  }
  function sun(x, y, r, c) { return circ(x, y, r * 2.4, c, 0.16) + circ(x, y, r * 1.6, c, 0.25) + circ(x, y, r, c); }
  function rays(x, y, r1, r2, n, c, o) {
    var d = '', i, a;
    for (i = 0; i < n; i++) { a = i * 2 * Math.PI / n; d += 'M' + (x + Math.cos(a) * r1).toFixed(1) + ' ' + (y + Math.sin(a) * r1).toFixed(1) + 'L' + (x + Math.cos(a) * r2).toFixed(1) + ' ' + (y + Math.sin(a) * r2).toFixed(1); }
    return line(d, c, 1.4, o);
  }
  function cloud(x, y, s, c, o) { return '<g opacity="' + (o || 1) + '">' + ell(x, y, 9 * s, 3.5 * s, c) + circ(x - 3 * s, y - 3 * s, 4 * s, c) + circ(x + 3 * s, y - 4 * s, 5 * s, c) + '</g>'; }
  /* a robed figure standing on y; h is its height; head is an optional covering colour; arms 'up' | 'out' */
  function man(x, y, h, robe, head, arms) {
    var w = h * 0.5, r = h * 0.13, cy = y - h * 0.86, s = '';
    if (arms) s += line('M' + (x - w * 0.22) + ' ' + (y - h * 0.68) + 'L' + (x - w * 0.62) + ' ' + (y - h * (arms === 'up' ? 1 : 0.7)) + 'M' + (x + w * 0.22) + ' ' + (y - h * 0.68) + 'L' + (x + w * 0.62) + ' ' + (y - h * (arms === 'up' ? 1 : 0.7)), robe, h * 0.1);
    s += path('M' + (x - w / 2) + ' ' + y + 'L' + (x - w * 0.26) + ' ' + (y - h * 0.72) + 'h' + (w * 0.52) + 'L' + (x + w / 2) + ' ' + y + 'z', robe) + circ(x, cy, r, SKIN);
    if (head) s += path('M' + (x - r * 1.15) + ' ' + (cy + r * 0.2) + 'a' + (r * 1.15) + ' ' + (r * 1.15) + ' 0 0 1 ' + (r * 2.3) + ' 0l-' + r * 0.4 + ' ' + r * 0.3 + 'h-' + r * 1.5 + 'z', head);
    return s;
  }
  function palm(x, y, s) {
    return line('M' + x + ' ' + y + 'q' + (2 * s) + ' ' + (-9 * s) + ' ' + (-1 * s) + ' ' + (-16 * s), BROWN, 1.6 * s) +
      line('M' + x + ' ' + (y - 16 * s) + 'q' + (-8 * s) + ' ' + (-2 * s) + ' ' + (-12 * s) + ' ' + (4 * s) + 'M' + x + ' ' + (y - 16 * s) + 'q' + (8 * s) + ' ' + (-2 * s) + ' ' + (12 * s) + ' ' + (4 * s) + 'M' + x + ' ' + (y - 16 * s) + 'q' + (-4 * s) + ' ' + (-8 * s) + ' ' + (-9 * s) + ' ' + (-7 * s) + 'M' + x + ' ' + (y - 16 * s) + 'q' + (4 * s) + ' ' + (-8 * s) + ' ' + (9 * s) + ' ' + (-7 * s), GREEN, 1.8 * s);
  }
  function tree(x, y, s, leaf) { return rect(x - 1 * s, y - 7 * s, 2 * s, 7 * s, BROWN) + circ(x, y - 10 * s, 6 * s, leaf) + circ(x - 4 * s, y - 7 * s, 4 * s, leaf) + circ(x + 4 * s, y - 7 * s, 4 * s, leaf); }
  function house(x, y, w, h, wall) { return rect(x, y - h, w, h, wall) + rect(x - 1, y - h - 2, w + 2, 3, '#b59a78') + rect(x + w * 0.4, y - h * 0.55, w * 0.2, h * 0.55, '#5a3e28') + rect(x + w * 0.1, y - h * 0.75, w * 0.18, h * 0.2, '#5a3e28'); }
  function sheep(x, y, s) { return ell(x, y, 4 * s, 3 * s, '#f6f3ec') + circ(x + 4 * s, y - 1 * s, 1.8 * s, '#3a3a3a') + rect(x - 2.6 * s, y + 2 * s, 0.9 * s, 2 * s, '#3a3a3a') + rect(x + 1.6 * s, y + 2 * s, 0.9 * s, 2 * s, '#3a3a3a'); }
  function waves(y, c, n) { var d = '', i; for (i = 0; i < n; i++) d += 'M' + (i * 28 - 6) + ' ' + y + 'q7 -3 14 0t14 0'; return line(d, c, 1.2, 0.7); }
  function boat(x, y, s, hull, sail) {
    return path('M' + (x - 14 * s) + ' ' + y + 'l' + (4 * s) + ' ' + (6 * s) + 'h' + (20 * s) + 'l' + (4 * s) + ' ' + (-6 * s) + 'z', hull) + rect(x - 0.6 * s, y - 16 * s, 1.2 * s, 16 * s, '#5a3e28') + (sail ? path('M' + x + ' ' + (y - 16 * s) + 'l' + (10 * s) + ' ' + (13 * s) + 'h' + (-10 * s) + 'z', sail) : '');
  }
  function bread(x, y, s) { return ell(x, y, 4.5 * s, 2.6 * s, '#d79a4a') + line('M' + (x - 2 * s) + ' ' + (y - 1 * s) + 'l' + s + ' ' + s + 'M' + x + ' ' + (y - 1.4 * s) + 'l' + s + ' ' + s + 'M' + (x + 2 * s) + ' ' + (y - 1 * s) + 'l' + s + ' ' + s, '#a86f2c', 0.6); }
  function fish(x, y, s, c) { return ell(x, y, 5 * s, 2.4 * s, c) + path('M' + (x + 4 * s) + ' ' + y + 'l' + (4 * s) + ' ' + (-2.6 * s) + 'v' + (5.2 * s) + 'z', c) + circ(x - 2.6 * s, y - 0.5 * s, 0.6 * s, '#222'); }
  function cross(x, y, h, c) { return rect(x - h * 0.05, y - h, h * 0.1, h, c) + rect(x - h * 0.25, y - h * 0.78, h * 0.5, h * 0.09, c); }
  function mount(x, y, w, h, c, snow) { return path('M' + (x - w / 2) + ' ' + y + 'L' + x + ' ' + (y - h) + 'L' + (x + w / 2) + ' ' + y + 'z', c) + (snow ? path('M' + x + ' ' + (y - h) + 'l' + (-w * 0.1) + ' ' + (h * 0.22) + 'l' + (w * 0.05) + ' ' + (-h * 0.06) + 'l' + (w * 0.05) + ' ' + (h * 0.1) + 'l' + (w * 0.05) + ' ' + (-h * 0.1) + 'l' + (w * 0.05) + ' ' + (h * 0.06) + 'z', snow) : ''); }
  function dove(x, y, s) { return ell(x, y, 4 * s, 2 * s, '#fff') + path('M' + (x - 1 * s) + ' ' + y + 'q' + (-3 * s) + ' ' + (-6 * s) + ' ' + (-7 * s) + ' ' + (-5 * s) + 'q' + (3 * s) + ' ' + (4 * s) + ' ' + (7 * s) + ' ' + (5 * s), '#fff') + path('M' + (x - 1 * s) + ' ' + y + 'q' + (3 * s) + ' ' + (-6 * s) + ' ' + (7 * s) + ' ' + (-5 * s) + 'q' + (-3 * s) + ' ' + (4 * s) + ' ' + (-7 * s) + ' ' + (5 * s), '#e9eef5'); }
  function glow(x, y, r, c) { return circ(x, y, r, c, 0.22) + circ(x, y, r * 0.65, c, 0.3); }

  var S = {
    manger: function () {
      return sky('manger', '#0b1b3a', '#35487f') + star(80, 10, 5.5, GOLD) + path('M76 15L84 15L100 46L60 46z', '#ffe9a8', 0.16) +
        path('M0 50Q80 42 160 50V64H0z', '#1f3b2e') + path('M56 31L80 18L104 31z', '#7a4f2b') + rect(58, 31, 44, 19, '#5a3b22') + rect(63, 34, 34, 16, '#ffd98a') +
        glow(80, 44, 9, '#fff2b0') + path('M70 48L72 44h16l2 4z', BROWN) + ell(80, 43.5, 4, 1.8, WHITE) + circ(80, 41.5, 1.8, SKIN) +
        man(52, 56, 17, BLUE, BLUE) + man(110, 56, 17, RED, '#d9b36a') + sheep(30, 56, 1.1);
    },
    crook: function () {
      return sky('crook', '#0d1c3d', '#2b4378') + star(122, 10, 4, GOLD) + glow(122, 18, 12, '#fff2b0') + path('M0 44Q40 34 90 44T160 40V64H0z', '#27493a') + path('M0 52Q60 44 160 52V64H0z', '#1d3a2d') +
        sheep(24, 54, 1.2) + sheep(48, 58, 1.2) + sheep(68, 53, 1.1) + sheep(138, 57, 1.2) + man(100, 58, 24, BROWN, '#c9a15b') + line('M110 58V32q0 -5 -5 -5', '#a97a44', 1.6);
    },
    temple: function () {
      var cols = '', i; for (i = 0; i < 5; i++) cols += rect(46 + i * 16, 27, 5, 20, '#f6efdd') + rect(46 + i * 16 + 4, 27, 1, 20, '#cdbf9f');
      return sky('temple', '#79c6ee', '#e6f5fb') + sun(18, 14, 5, '#ffe28a') + path('M38 26L80 8L122 26z', '#e9dcc0') + rect(38, 26, 84, 4, '#d9c9a4') + cols + rect(70, 33, 20, 14, '#8a6a2c') + rect(72, 35, 16, 12, '#c9962e') +
        rect(34, 47, 92, 4, '#d9c9a4') + rect(30, 51, 100, 4, '#cfbd95') + rect(0, 55, 160, 9, '#d9c8a0') + man(62, 58, 11, BLUE, BLUE) + man(70, 58, 8, RED, '#e8c98a') + man(98, 58, 11, '#6a8f5a', '#6a8f5a');
    },
    gift: function () {
      return sky('gift', '#3b2a63', '#f08a5d') + star(112, 12, 6, GOLD) + path('M105 18L119 18L126 46L98 46z', '#ffe9a8', 0.14) + path('M0 46Q50 38 100 46T160 44V64H0z', '#d9a05a') + path('M0 54Q80 48 160 56V64H0z', '#c98c48') +
        man(30, 56, 21, '#7a4fa0', GOLD) + man(54, 58, 22, '#2f7f8f', GOLD) + man(78, 56, 21, RED, GOLD) + rect(24, 56, 6, 5, GOLD) + rect(48, 58, 6, 5, '#c0392b') + rect(86, 57, 6, 5, '#e8e1c8');
    },
    pyramid: function () {
      return sky('pyr', '#8fd0f0', '#fbe7b0') + sun(132, 14, 6, '#ffd36a') + path('M10 46L50 14L90 46z', '#e2b866') + path('M50 14L90 46H62z', '#c99a4a') + path('M70 46L108 22L146 46z', '#d9a95a') + path('M108 22L146 46H120z', '#bf8f43') +
        path('M0 46Q80 40 160 46V64H0z', '#efd08a') + palm(18, 56, 0.9) + palm(146, 58, 0.8) + ell(84, 56, 10, 4.5, '#9a8a7a') + rect(76, 58, 2, 5, '#7d6e60') + rect(90, 58, 2, 5, '#7d6e60') + circ(95, 52, 3, '#9a8a7a') + man(84, 50, 12, BLUE, BLUE) + man(62, 60, 20, BROWN, '#d9b36a');
    },
    house: function () {
      return sky('house', '#79c6ee', '#e6f5fb') + sun(140, 12, 5, '#ffe28a') + path('M0 40Q40 28 90 40T160 36V64H0z', '#7fb069') + path('M0 50Q80 42 160 50V64H0z', '#5a9a58') +
        house(34, 50, 26, 14, '#f3ead9') + house(66, 46, 22, 12, '#efe2c8') + house(98, 52, 30, 16, '#f6eedf') + tree(18, 56, 1, '#4a7d3f') + tree(144, 54, 1.1, '#4a7d3f') + path('M70 64Q80 54 90 64z', '#d9c8a0');
    },
    book: function () {
      return rect(0, 0, 160, 64, '#7a5233') + path('M20 64V24a24 24 0 0 1 48 0V64z', '#e6d3a6') + path('M92 64V24a24 24 0 0 1 48 0V64z', '#e6d3a6') + path('M28 64V26a16 16 0 0 1 32 0V64z', '#f6e7bd') + path('M100 64V26a16 16 0 0 1 32 0V64z', '#f6e7bd') +
        rect(0, 54, 160, 10, '#cdb68a') + man(36, 58, 16, RED, '#d9b36a') + man(124, 58, 16, '#2f7f8f', '#d9b36a') + man(54, 58, 14, BROWN, '#d9b36a') + glow(80, 40, 14, '#ffe9a8') + man(80, 58, 17, WHITE) + rect(66, 57, 4, 3, '#f6e7bd') + rect(90, 57, 4, 3, '#f6e7bd');
    },
    drop: function () {
      return sky('drop', '#79c6ee', '#cfeaf6') + path('M0 38Q40 30 80 38T160 36V64H0z', '#7fb069') + path('M0 42Q80 36 160 42V64H0z', '#4a9bc4') + waves(48, '#cfeefc', 6) + waves(57, '#cfeefc', 6) +
        path('M80 4L96 4L100 40L76 40z', '#fff4c0', 0.3) + man(66, 52, 22, BROWN, '#c9a15b') + man(94, 52, 22, WHITE) + rect(0, 52, 160, 12, '#4a9bc4', 0.85) + waves(56, '#e5f7ff', 6) + dove(84, 14, 1.6);
    },
    desert: function () {
      return sky('desert', '#e2753d', '#f9d38a') + sun(32, 38, 8, '#ffe28a') + path('M0 44Q40 34 80 44T160 42V64H0z', '#c98c48') + path('M90 46L108 20L124 46z', '#8a5a36') + path('M108 20L124 46H114z', '#6e4627') + path('M0 54Q80 46 160 54V64H0z', '#e0a95c') +
        ell(60, 58, 4, 2, '#b58a52') + ell(72, 60, 3.5, 2, '#b58a52') + ell(48, 61, 3, 1.6, '#b58a52') + man(122, 58, 19, WHITE, WHITE);
    },
    cup: function () {
      return rect(0, 0, 160, 64, '#5a3b24') + rect(0, 0, 160, 40, '#7a5233') + circ(20, 12, 3, '#ffd36a', 0.9) + circ(140, 12, 3, '#ffd36a', 0.9) + rect(0, 46, 160, 18, '#a87a4a') + rect(0, 46, 160, 3, '#c9a06a') +
        path('M24 46V30q0 -6 6 -6t6 6V46z', '#b46a3c') + path('M52 46V28q0 -7 7 -7t7 7V46z', '#c47a48') + path('M120 46V30q0 -6 6 -6t6 6V46z', '#b46a3c') + path('M26 31h8v15h-8z', '#8e1f2a', 0.85) + path('M54 29h10v17H54z', '#8e1f2a', 0.85) + path('M122 31h8v15h-8z', '#8e1f2a', 0.85) +
        glow(92, 36, 12, '#ff9a8a') + path('M84 30h16c0 9-3 13-8 13s-8-4-8-13z', '#c9a24a') + path('M85.500 31h13c0 6-2 9-6.500 9s-6.500-3-6.500-9z', '#a3192b') + rect(91, 43, 2, 6, '#c9a24a') + rect(86, 49, 12, 2, '#c9a24a');
    },
    fish: function () {
      return sky('fish', '#f6b36b', '#ffe9b8') + sun(116, 30, 8, '#fff0b0') + rect(0, 34, 160, 30, '#3f93a8') + path('M90 34L142 34L136 36L96 36z', '#ffe9a8', 0.5) + waves(42, '#cfeefc', 6) + waves(54, '#cfeefc', 6) +
        boat(60, 44, 1.2, BROWN, '#f4efe6') + man(54, 40, 12, BLUE, BLUE) + man(68, 40, 12, '#c0782f', '#c0782f') + path('M0 36Q30 30 50 36V40H0z', '#6a8f5a') + man(14, 38, 18, WHITE) + line('M78 38q20 -2 28 8', '#fff', 0.8, 0.8);
    },
    well: function () {
      return sky('well', '#79c6ee', '#f3e9c8') + sun(140, 12, 6, '#ffe28a') + path('M0 44Q80 38 160 44V64H0z', '#e0c487') + palm(20, 52, 1) + rect(66, 36, 28, 18, STONE) + ell(80, 36, 14, 4, '#b8ad96') + ell(80, 36, 11, 2.800, '#2a4a5a') + rect(64, 22, 2, 16, BROWN) + rect(94, 22, 2, 16, BROWN) + rect(62, 20, 36, 3, BROWN) + line('M80 23V33', '#6a4a2a', 0.8) + rect(78, 32, 4, 4, '#8a5a36') +
        man(44, 58, 20, RED, RED) + ell(44, 36, 3, 3.500, '#b8704a') + man(116, 58, 19, WHITE, WHITE);
    },
    walker: function () {
      return sky('walker', '#79c6ee', '#f6efd0') + sun(80, 30, 8, '#ffe28a', 1) + rays(80, 30, 12, 24, 14, '#ffe28a', 0.7) + path('M0 46Q40 40 90 46T160 44V64H0z', '#d9c8a0') + house(12, 50, 28, 16, '#f3ead9') + house(122, 50, 28, 16, '#efe2c8') +
        man(80, 58, 28, BLUE, null, 'up') + rect(70, 50, 20, 4, '#c9b48a') + man(52, 58, 12, RED, RED) + man(108, 58, 12, '#6a8f5a', '#6a8f5a');
    },
    mountain: function () {
      var crowd = '', i, cs = [BLUE, RED, '#6a8f5a', '#c0782f', '#7a4fa0', '#2f7f8f']; for (i = 0; i < 12; i++) crowd += man(24 + i * 10 + (i % 2) * 3, 56 - (i % 3) * 3, 9, cs[i % 6], cs[(i + 2) % 6]);
      return sky('mount', '#79c6ee', '#eaf6fb') + cloud(30, 12, 1, '#fff', 0.9) + cloud(128, 16, 0.9, '#fff', 0.9) + path('M0 50Q60 8 80 8Q100 8 160 50V64H0z', '#7fb069') + path('M0 56Q80 38 160 56V64H0z', '#5a9a58') + glow(80, 22, 10, '#fff2b0') + man(80, 36, 17, WHITE) + crowd +
        circ(30, 54, 1.2, '#f2c14e') + circ(130, 56, 1.2, '#e86a8a') + circ(102, 53, 1.2, '#fff');
    },
    storm: function () {
      return sky('storm', '#232b3c', '#5d6b82') + cloud(36, 14, 1.600, '#3a4558') + cloud(110, 12, 1.800, '#45516a') + path('M100 4L106 4L103 14L108 14L98 30L101 18L96 18z', '#ffe45e') + path('M128 0L138 0L146 40L120 40z', '#ffe9a8', 0.18) +
        rect(0, 36, 160, 28, '#1f4a5e') + path('M0 40q14 -9 28 0t28 0t28 0t28 0t28 0t28 0V64H0z', '#2c6178') + waves(52, '#9fd0e0', 6) +
        '<g transform="rotate(-10 70 40)">' + boat(70, 44, 1.300, BROWN, '#e8dfc8') + '</g>' + line('M20 8l-4 14M44 6l-4 14M70 8l-4 14M120 6l-4 14M148 8l-4 14', '#bcd0e0', 0.7, 0.6);
    },
    loaf: function () {
      var crowd = '', i, cs = [BLUE, RED, '#6a8f5a', '#c0782f', '#7a4fa0', '#2f7f8f']; for (i = 0; i < 16; i++) crowd += circ(8 + i * 9.5, 38 + (i % 3) * 3, 2.200, cs[i % 6]) + ell(8 + i * 9.5, 43 + (i % 3) * 3, 2.600, 2.200, cs[(i + 1) % 6]);
      return sky('loaf', '#79c6ee', '#eaf6fb') + path('M0 34Q80 24 160 34V64H0z', '#7fb069') + path('M0 40Q80 32 160 40V64H0z', '#6aa65a') + crowd + path('M54 64V52q0 -4 4 -4h44q4 0 4 4V64z', '#c9955a') + path('M54 52h52v3H54z', '#a8763c') +
        bread(66, 50, 1) + bread(80, 49, 1) + bread(94, 50, 1) + bread(73, 45, 1) + bread(87, 45, 1) + fish(40, 56, 1, '#5a8fb0') + fish(120, 56, 1, '#5a8fb0');
    },
    waves: function () {
      return sky('waves', '#0d1c3d', '#2b4378') + circ(132, 12, 6, '#f6f1d4') + circ(135, 10, 5.200, '#1c2f5c', 0.35) + rect(0, 34, 160, 30, '#1f4a5e') + path('M100 34H150L160 64H70z', '#f6f1d4', 0.16) + waves(40, '#7fb6c9', 6) + waves(52, '#7fb6c9', 6) +
        boat(28, 38, 0.8, BROWN, '#cfc6b4') + glow(86, 30, 14, '#fff2b0') + man(86, 46, 22, WHITE) + ell(86, 47, 12, 2.500, '#cfeefc', 0.8) + ell(86, 47, 18, 4, '#cfeefc', 0.35);
    },
    keys: function () {
      return sky('keys', '#79c6ee', '#eaf6fb') + mount(60, 40, 90, 34, '#8fa0b8', '#fff') + path('M92 64V10q0 -4 4 -4h56q4 0 4 4V64z', '#8c7b66') + path('M92 22h72M92 38h72', '#6f6050', 0) + rect(92, 18, 68, 4, '#7a6a56') + rect(92, 36, 68, 4, '#7a6a56') + path('M100 52q10 -6 20 0t20 0V64H100z', '#5aa6c4', 0.9) +
        man(28, 58, 20, WHITE) + man(46, 58, 18, BROWN, '#c9a15b') + '<g transform="rotate(-35 80 36)">' + circ(62, 36, 7, 'none') + '<circle cx="62" cy="36" r="6" fill="none" stroke="#f2c14e" stroke-width="3"/>' + rect(68, 34.500, 34, 3, GOLD) + rect(94, 37, 3, 7, GOLD) + rect(100, 37, 3, 9, GOLD) + '</g>';
    },
    glory: function () {
      return sky('glory', '#233b6e', '#7aa6d8') + cloud(24, 10, 1.400, '#fff', 0.8) + cloud(138, 12, 1.400, '#fff', 0.8) + mount(80, 52, 150, 46, '#7d6a52', null) + path('M0 56Q80 46 160 56V64H0z', '#5a4a38') + sun(80, 24, 9, '#fff6c8') + rays(80, 24, 14, 34, 18, '#fff6c8', 0.7) + man(80, 46, 26, '#fffdf2') + circ(80, 24, 4.200, '#fffdf2') +
        man(50, 44, 18, '#d9c8e8') + man(110, 44, 18, '#e8c8a8') + circ(60, 60, 3, SKIN) + path('M54 64q6 -8 12 0z', BLUE) + circ(84, 60, 3, SKIN) + path('M78 64q6 -8 12 0z', RED) + circ(106, 60, 3, SKIN) + path('M100 64q6 -8 12 0z', '#6a8f5a');
    },
    tomb: function () {
      return sky('tomb', '#f2a86b', '#fbe3b2') + sun(132, 18, 6, '#ffd36a') + path('M0 38Q50 24 100 36T160 32V64H0z', '#b9a584') + path('M0 50Q80 42 160 50V64H0z', '#9c8a68') + path('M44 52V30a22 22 0 0 1 44 0V52z', '#6e6050') + path('M52 52V32a14 14 0 0 1 28 0V52z', '#1d1814') +
        circ(104, 44, 11, '#a99880') + circ(104, 44, 7, '#b8a78f') + glow(66, 40, 13, '#fffbe0') + man(66, 52, 21, WHITE, null) + rect(62, 38, 8, 2, '#d8d0be') + rect(61, 44, 10, 2, '#d8d0be') + man(22, 60, 17, '#33384a', '#33384a') + man(36, 60, 16, '#4a3340', '#4a3340');
    },
    palm: function () {
      var i, s = ''; for (i = 0; i < 6; i++) s += man(14 + i * 24, 60, 11, [BLUE, RED, '#6a8f5a', '#c0782f', '#7a4fa0', '#2f7f8f'][i], null, 'up') + line('M' + (14 + i * 24 - 6) + ' ' + 47 + 'q-3 -6 0 -10', GREEN, 1.400);
      return sky('palm', '#79c6ee', '#f6efd0') + rect(0, 22, 160, 22, '#d9c08a') + rect(0, 22, 160, 3, '#c0a572') + rect(18, 12, 18, 12, '#cdb27a') + rect(124, 12, 18, 12, '#cdb27a') + path('M60 44V28a20 20 0 0 1 40 0V44z', '#6e5a3a') + rect(0, 44, 160, 20, '#d9c8a0') + palm(24, 52, 1) + palm(138, 52, 1) +
        ell(80, 52, 11, 5, '#9a8a7a') + rect(72, 54, 2, 7, '#7d6e60') + rect(86, 54, 2, 7, '#7d6e60') + circ(91, 47, 3.500, '#9a8a7a') + man(80, 49, 17, WHITE) + path('M48 62l12 -4l6 4zM100 62l12 -4l6 4z', GREEN);
    },
    supper: function () {
      var h = '', i, cs = [BLUE, RED, '#6a8f5a', '#c0782f', '#7a4fa0', '#2f7f8f'];
      for (i = 0; i < 7; i++) if (i !== 3) h += circ(20 + i * 20, 26, 5, SKIN) + path('M' + (12 + i * 20) + ' 42q0 -11 8 -11t8 11z', cs[i % 6]);
      return rect(0, 0, 160, 64, '#2a1d17') + path('M20 38V16a60 24 0 0 1 120 0V38z', '#3b2a20') + circ(18, 10, 3.500, '#ffd36a', 0.9) + circ(142, 10, 3.500, '#ffd36a', 0.9) + glow(80, 26, 16, '#fff2b0') + h + circ(80, 26, 5.500, SKIN) + path('M70 42q0 -12 10 -12t10 12z', '#fffdf2') + circ(80, 26, 8, 'none') + '<circle cx="80" cy="26" r="8" fill="none" stroke="#f2c14e" stroke-width="1"/>' +
        rect(0, 42, 160, 22, '#f4efe6') + rect(0, 42, 160, 3, '#d9d0bc') + path('M70 52h20c0 5-3 8-10 8s-10-3-10-8z', '#c9a24a', 0) + bread(60, 52, 1.500) + path('M86 46h12c0 5-2 8-6 8s-6-3-6-8z', '#c9a24a') + path('M87.500 47h9c0 3.500-1.500 5.500-4.500 5.500s-4.500-2-4.500-5.500z', '#a3192b') + bread(112, 54, 1.300);
    },
    moon: function () {
      return sky('moon', '#0b1630', '#2a3d6e') + circ(126, 14, 6.500, '#f6f1d4') + circ(129, 12, 6, '#13204a', 0.4) + path('M0 46Q40 36 90 44T160 40V64H0z', '#25382f') + path('M0 54Q80 46 160 54V64H0z', '#1b2b24') +
        tree(26, 52, 1.800, '#6f8f6a') + tree(132, 50, 1.700, '#6f8f6a') + path('M68 2H92L100 36H60z', '#fff2b0', 0.16) + glow(80, 40, 11, '#fff2b0') + path('M70 56q2 -12 8 -14l4 -4q4 0 4 4q6 4 4 14z', WHITE) + circ(80, 39, 3.600, SKIN) + path('M76 41l-5 4q-2 2 0 3', SKIN, 0) + rect(60, 56, 40, 3, '#5a4a38');
    },
    cross: function () {
      return sky('cross', '#2a1020', '#b5483f') + circ(120, 14, 7, '#3a1a22') + '<circle cx="120" cy="14" r="8.500" fill="none" stroke="#f2c14e" stroke-width="1.200" opacity=".7"/>' + cloud(30, 14, 1.600, '#4a2a35', 0.9) + cloud(60, 22, 1.200, '#4a2a35', 0.8) + path('M0 50Q50 38 100 46T160 42V64H0z', '#1b0f16') +
        cross(52, 46, 24, '#2a1820') + cross(108, 45, 22, '#2a1820') + cross(80, 44, 34, '#120a10') + path('M70 64l4 -8l4 8zM86 64l4 -8l4 8z', '#120a10', 0) + man(42, 62, 10, '#120a10') + man(122, 62, 10, '#120a10');
    },
    risen: function () {
      return sky('risen', '#f6a86a', '#fff0b8') + sun(80, 30, 12, '#fff6c8') + rays(80, 30, 18, 52, 24, '#fff6c8', 0.45) + path('M0 40Q50 30 100 40T160 36V64H0z', '#9bc07a') + path('M0 50Q80 42 160 50V64H0z', '#6aa65a') + path('M40 52V32a22 22 0 0 1 44 0V52z', '#8a7a64') + path('M48 52V34a14 14 0 0 1 28 0V52z', '#fff6c8') +
        circ(112, 46, 11, '#a99880') + circ(112, 46, 7, '#b8a78f') + circ(18, 56, 2.600, '#fff') + circ(26, 58, 2.600, '#fff') + line('M18 56v6M26 58v6', '#4a7d3f', 1) + circ(138, 56, 2.600, '#fff') + line('M138 56v6', '#4a7d3f', 1) + rect(54, 46, 16, 3, '#f4efe6');
    },
    road: function () {
      return sky('road', '#6a3f7a', '#f6a66a') + sun(118, 34, 8, '#ffe28a') + mount(100, 46, 80, 24, '#7a4f6a', null) + path('M0 46Q60 38 160 46V64H0z', '#c98c5a') + house(110, 46, 12, 8, '#e8d8c0') + house(126, 46, 12, 7, '#e0cdb0') + path('M62 46h12L100 64H30z', '#e8c98a') + path('M66 46h4L84 64H56z', '#f2d9a0', 0.7) +
        man(56, 60, 17, BLUE, '#d9c8a0') + glow(70, 50, 11, '#fff6c8') + man(70, 60, 19, WHITE) + man(84, 60, 17, '#b5483f', '#d9c8a0') + tree(20, 54, 1.200, '#6f7a4a');
    },
    flame: function () {
      return sky('flame', '#f6b36b', '#ffe9b8') + sun(120, 30, 7, '#fff0b0') + rect(0, 32, 160, 14, '#3f93a8') + waves(38, '#cfeefc', 6) + boat(124, 34, 0.9, BROWN, '#f4efe6') + path('M0 44Q80 40 160 46V64H0z', '#e8c98a') + path('M0 54Q80 50 160 56V64H0z', '#d9b878') +
        man(42, 58, 21, WHITE) + glow(88, 54, 12, '#ffb04a') + path('M88 58c-5 0 -7 -4 -6 -7 1 -2 3 -3 3 -7 3 2 7 5 7 9 0 3 -2 5 -4 5z', '#e8631f') + path('M88 58c-3 0 -4 -2.500 -3 -4.500 1 -1 2 -2 2 -4 2 1.500 4 3 4 5.500 0 2 -1 3 -3 3z', '#ffd36a') + line('M76 58h24', '#5a3e28', 2) + fish(88, 49, 0.9, '#9fb8c8') + man(64, 60, 15, BLUE, BLUE) + man(108, 60, 15, '#c0782f', '#c0782f');
    },
    globe: function () {
      var cs = [BLUE, RED, '#6a8f5a', '#c0782f', '#7a4fa0', '#2f7f8f'], i, d = '';
      for (i = 0; i < 7; i++) d += man(22 + i * 19, 62 - (i % 2) * 2, 11, cs[i % 6], cs[(i + 3) % 6]);
      return sky('globe', '#79c6ee', '#f6efd0') + circ(126, 20, 12, '#3f7fb5', 0.9) + '<g fill="none" stroke="#bfe0f5" stroke-width="0.8"><circle cx="126" cy="20" r="12"/><path d="M114 20h24M126 8c-6 6 -6 18 0 24M126 8c6 6 6 18 0 24"/></g>' + rays(126, 20, 15, 22, 16, '#fff6c8', 0.7) + path('M0 52Q50 20 100 24T160 46V64H0z', '#7fb069') + path('M0 56Q80 46 160 56V64H0z', '#5a9a58') + glow(70, 22, 12, '#fff6c8') + man(70, 40, 24, WHITE, null, 'up') + d;
    },
    ascend: function () {
      return sky('asc', '#4a95d6', '#cfe8f8') + cloud(30, 38, 1.800, '#fff') + cloud(130, 34, 1.800, '#fff') + cloud(80, 40, 2.400, '#fff', 0.95) + rays(80, 20, 12, 30, 18, '#fff6c8', 0.6) + glow(80, 20, 14, '#fff6c8') + man(80, 36, 24, '#fffdf2', null, 'up') + path('M0 52Q80 44 160 52V64H0z', '#7fb069') +
        man(40, 60, 13, BLUE, BLUE, 'up') + man(58, 61, 12, RED, RED) + man(104, 61, 12, '#6a8f5a', '#6a8f5a') + man(122, 60, 13, '#c0782f', '#c0782f', 'up') + man(20, 58, 11, '#fffdf2') + man(140, 58, 11, '#fffdf2');
    }
  };

  function svg(name) {
    var f = S[name]; if (!f) return '';
    return '<svg viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + f() + '</svg>';
  }

  var api = { SCENES: S, svg: svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Scenes = api;
})(typeof window !== 'undefined' ? window : this);
