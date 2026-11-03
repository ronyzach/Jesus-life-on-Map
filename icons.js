/* One small line illustration per event, drawn on a 24 x 24 grid and coloured by CSS (stroke: currentColor).
   data.js names the one each event uses (`ic`); app.js puts it above the title in the bubble. */
(function (root) {
  'use strict';

  var ICONS = {
    manger:    '<path d="M12 2.5l1.4 3 3.3.4-2.4 2.3.6 3.2L12 9.7l-2.9 1.7.6-3.2L7.3 5.9l3.3-.4z"/><path d="M4 15h16l-2 5.5H6z"/>',
    crook:     '<path d="M15 21.5V8a4 4 0 0 0-8 0"/><circle cx="7" cy="12.5" r=".8"/><path d="M11 21.5h8"/>',
    temple:    '<path d="M3 9.5L12 4l9 5.5z"/><path d="M5.5 9.5v9M9.5 9.5v9M14.5 9.5v9M18.5 9.5v9M3 20.5h18"/>',
    gift:      '<path d="M5 12h14v9H5zM4 9h16v3H4zM12 9v12"/><path d="M12 9c-2-4-5-3.5-4 0M12 9c2-4 5-3.5 4 0"/><path d="M12 1.5v2"/>',
    pyramid:   '<path d="M3 20.5L13 6l8 14.5zM13 6l-3 14.5"/><circle cx="5.5" cy="6.5" r="2.5"/>',
    house:     '<path d="M3 11.5L12 4l9 7.5M5.5 10v10.5h13V10M10 20.5v-6h4v6"/>',
    book:      '<path d="M12 6.5c-2.3-1.8-5.3-2-8-1v14c2.7-1 5.7-.8 8 1 2.3-1.8 5.3-2 8-1v-14c-2.7-1-5.7-.8-8 1zM12 6.5v14"/>',
    drop:      '<path d="M12 2.5c3.6 4.3 5.5 7 5.5 9.5a5.5 5.5 0 0 1-11 0c0-2.5 1.9-5.2 5.5-9.500z"/><path d="M3 18.500c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 21.500c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/>',
    desert:    '<circle cx="17" cy="7" r="3"/><path d="M2 19c4-6.5 7-6.5 9.5-2.5 2-3.5 6-4.5 10.5-1M2 21.500h20"/>',
    cup:       '<path d="M7 3h10c0 6.5-1.5 9.5-5 9.500S7 9.5 7 3zM12 12.500V20M8 21h8M7.5 7h9"/>',
    fish:      '<path d="M2.5 12c4-6 10-6 14 0-4 6-10 6-14 0zM16.5 12l5-4v8z"/><circle cx="7" cy="11.2" r=".7"/>',
    well:      '<path d="M4 9.500L12 4.500l8 5M6 9.500v11M18 9.500v11M4.5 20.500h15M12 7v7"/><path d="M10 14h4v3.500h-4z"/>',
    walker:    '<circle cx="12" cy="4.5" r="2"/><path d="M12 6.500v8M6.5 10l5.5 1.5 5.5-1.500M12 14.500l-3.5 6.500M12 14.500l3.5 6.5"/>',
    mountain:  '<path d="M2 20.500l7.5-13 4 6.5 2.5-3.5 6 10z"/><path d="M7 11.500l2.5 1.5 1.5-2"/>',
    storm:     '<path d="M7 14.500a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5 3.5 3.5 0 0 1 .5 6.500z"/><path d="M12.5 12.500l-2.5 4.500h3.500l-2 4.5"/>',
    loaf:      '<path d="M3.5 15c0-4.5 3.8-7 8.5-7s8.5 2.5 8.5 7v2.500h-17z"/><path d="M8 11.500l1 3M12 10.500l.5 4M16 11.500l-1 3"/>',
    waves:     '<circle cx="12" cy="4.5" r="2"/><path d="M12 6.500v6M7.5 9.500L12 11l4.5-1.500M12 12.500l-2 3.500M12 12.500l2 3.5"/><path d="M2.5 19.500c2-2 4-2 6 0s4 2 6 0 4-2 7 0"/>',
    keys:      '<circle cx="7" cy="17" r="4"/><path d="M10 14l10.5-10.500M17 7l3 3M14 10.500l2.5 2.5"/>',
    glory:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
    tomb:      '<path d="M4 21V11a8 8 0 0 1 16 0v10zM2.5 21h19"/><circle cx="12" cy="13.5" r="1.7"/><path d="M12 15.200v3.300M9.5 17l5 0"/>',
    palm:      '<path d="M12 21.500V8.5"/><path d="M12 8.500C9 7 5.5 8 3.5 11.500M12 8.500c3-1.5 6.5-.5 8.5 3M12 11.500C9.5 10.5 7 11.5 5.5 14.500M12 11.500c2.5-1 5 0 6.5 3M12 5.500c-1.5-.8-2.5-2-2.5-3.500M12 5.500c1.5-.8 2.5-2 2.5-3.5"/>',
    supper:    '<path d="M3 15h18M5 15v6M19 15v6"/><path d="M4.5 4.500h6c0 4.2-1.2 5.8-3 5.800s-3-1.6-3-5.800zM7.5 10.300V15"/><path d="M13.5 14c0-3 1.8-5 4-5s4 2 4 5z"/>',
    moon:      '<path d="M17.5 3.500a8.5 8.5 0 1 0 3.5 14 7 7 0 0 1-3.5-14z"/><circle cx="19.5" cy="5.5" r=".8"/><circle cx="14.5" cy="4" r=".6"/>',
    cross:     '<path d="M12 2.500v16M6 8.500h12M4 21.500h16"/>',
    risen:     '<path d="M3 21V12.500a6 6 0 0 1 12 0V21zM2 21h20"/><circle cx="19" cy="17.5" r="3.5"/><path d="M9 2.500v2M3.5 5l1.5 1.500M14.5 5L13 6.5"/>',
    road:      '<path d="M8 21.500l3-19M16 21.500L13 2.500M12 21v-3M12 14.500v-3M12 8V5.5"/>',
    flame:     '<path d="M12 18.500c-4 0-6-2.5-5-5.5 1-2 3-3 3-6.5 3 2 6 4.5 6 8 0 2.5-1.8 4-4 4z"/><path d="M4.5 21l15-2.500M4.5 18.500l15 2.5"/>',
    globe:     '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-4 5-4 13 0 18M12 3c4 5 4 13 0 18"/>',
    ascend:    '<path d="M12 10.500V2.500M8 6.500l4-4 4 4"/><path d="M6.5 20.500a3 3 0 0 1 0-6 4 4 0 0 1 7.5-1 3 3 0 0 1 3.5 7z"/>'
  };

  /* the bubble's illustration: a small circle badge holding the line drawing */
  function svg(name) {
    var p = ICONS[name]; if (!p) return '';
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  }

  var api = { ICONS: ICONS, svg: svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Icons = api;
})(typeof window !== 'undefined' ? window : this);
