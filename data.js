/* Content. Every event cites a passage that reads the same in the NIV and the KJV.
   Coordinates are approximate modern reference points for the places the passages name,
   not claims about exact biblical locations. `say` is the short narration spoken during Play (audio/NN.mp3). A place the passage does not name has place:null
   and is shown without a pin. `ot` is an Old Testament passage the New Testament itself quotes for the event. */
(function (root) {
  'use strict';

  var PLACES = {
    bethlehem:   { name: 'Bethlehem',        lat: 31.7044, lng: 35.2074 },
    jerusalem:   { name: 'Jerusalem',        lat: 31.7780, lng: 35.2354 },
    nazareth:    { name: 'Nazareth',         lat: 32.6996, lng: 35.3035 },
    jordan:      { name: 'Jordan River',     lat: 31.8372, lng: 35.5506 },
    cana:        { name: 'Cana',             lat: 32.7468, lng: 35.3392 },
    sychar:      { name: 'Sychar',           lat: 32.2136, lng: 35.2847 },
    shore:       { name: 'Sea of Galilee',   lat: 32.8795, lng: 35.5655 },   // on the north-west shoreline, between Tabgha and Capernaum
    capernaum:   { name: 'Capernaum',        lat: 32.8803, lng: 35.5750 },
    lake:        { name: 'Sea of Galilee',   lat: 32.8200, lng: 35.5900 },
    bethsaida:   { name: 'Bethsaida',        lat: 32.9060, lng: 35.6310 },
    caesarea:    { name: 'Caesarea Philippi', lat: 33.2481, lng: 35.6942 },
    bethany:     { name: 'Bethany',          lat: 31.7706, lng: 35.2610 },
    olivet:      { name: 'Mount of Olives',  lat: 31.7787, lng: 35.2450 },
    upperroom:   { name: 'Jerusalem',        lat: 31.7717, lng: 35.2296 },
    gethsemane:  { name: 'Gethsemane',       lat: 31.7795, lng: 35.2399 },
    golgotha:    { name: 'Golgotha',         lat: 31.7784, lng: 35.2296 },
    /* Places the passage does not name: the best-known traditional or proposed site, labelled as such. `area` names the heat-map cluster it joins. */
    temptation:  { name: 'Mount of Temptation (traditional)', area: 'Jericho', lat: 31.8725, lng: 35.4283 },
    beatitudes:  { name: 'Mount of Beatitudes (traditional)', area: 'Capernaum', lat: 32.8809, lng: 35.5559 },
    tabor:       { name: 'Mount Tabor (traditional)', area: 'Mount Tabor', lat: 32.6867, lng: 35.3908 },
    emmaus:      { name: 'Emmaus (site uncertain)', area: 'Emmaus (uncertain)', lat: 31.8061, lng: 35.1081 },
    tabgha:      { name: 'Tabgha shore (traditional)', area: 'Capernaum', lat: 32.8708, lng: 35.5505 },
    galilee:     { name: 'Galilee hills (mountain not named)', area: 'Galilee hills', lat: 32.8000, lng: 35.4500 },
    /* Coptic tradition only: Matthew names no town. offmap keeps it out of the heat map and travel-area fence, which describe the Holy Land; wide shows it from afar (the line and its distance) instead of zooming in. */
    egypt:       { name: 'Egypt, traditional site', lat: 30.0057, lng: 31.2300, offmap: true, wide: true }
  };

  /* t: short title, ch: chapter, age: life stage as the text gives it, place: key in PLACES or null,
     pn: label when there is no pin, ref: passage, ot: optional Old Testament passage, note: caveat. */
  var EVENTS = [
    // Birth & childhood
    { t: 'Jesus is born', ic: 'manger',               ch: 'Birth & childhood', age: 'Birth',        place: 'bethlehem', ref: 'Luke 2:1-7',     ot: 'Micah 5:2', say: 'About two thousand years ago, in Bethlehem, a baby is born, and laid in a manger.' },
    { t: 'Shepherds visit', ic: 'crook',             ch: 'Birth & childhood', age: 'Newborn',      place: 'bethlehem', ref: 'Luke 2:8-20', say: 'That very night, shepherds in the fields hear angels singing, and hurry to find the child.' },
    { t: 'Presented at the Temple', ic: 'temple',     ch: 'Birth & childhood', age: 'Infant',       place: 'jerusalem', ref: 'Luke 2:22-38', say: 'Weeks later, Mary and Joseph carry Him to the Temple in Jerusalem.' },
    { t: 'Wise men worship Him', ic: 'gift',        ch: 'Birth & childhood', age: 'Young child',  place: 'bethlehem', ref: 'Matthew 2:1-12', note: 'Matthew says a house in Bethlehem', say: 'Then, following a star, wise men arrive, and kneel before the young king.' },
    { t: 'Escape to Egypt', ic: 'pyramid',             ch: 'Birth & childhood', age: 'Young child',  place: 'egypt', ref: 'Matthew 2:13-15', ot: 'Hosea 11:1', note: 'Old Cairo, by Coptic tradition; Matthew names no town', say: 'But Herod is hunting the child. Warned in a dream, the family escapes to Egypt.' },
    { t: 'Home to Nazareth', ic: 'house',            ch: 'Birth & childhood', age: 'Childhood',    place: 'nazareth',  ref: 'Matthew 2:19-23', say: 'Years pass. When Herod dies, they return, and make their home in Nazareth.' },
    { t: 'Boy Jesus in the Temple', ic: 'book',     ch: 'Birth & childhood', age: 'Age 12',       place: 'jerusalem', ref: 'Luke 2:41-52', say: 'At twelve, Jesus slips away to the Temple, and amazes the teachers with His questions.' },
    // Beginning of ministry
    { t: 'Baptised by John', ic: 'drop',            ch: 'Beginning of ministry', age: 'About 30', place: 'jordan',    ref: 'Matthew 3:13-17', note: 'Traditional baptism site', say: 'Years later, at the Jordan River, John baptises Him. The Spirit descends, and a voice speaks from heaven.' },
    { t: 'Tested in the wilderness', ic: 'desert',    ch: 'Beginning of ministry', age: 'About 30', place: 'temptation', ref: 'Matthew 4:1-11', note: 'Matthew says only ‘the wilderness’; Mount of Temptation near Jericho is the traditional site', say: 'Then He is led into the wilderness, alone, and turns away every temptation.' },
    { t: 'Water turned to wine', ic: 'cup',        ch: 'Beginning of ministry', age: 'About 30', place: 'cana',      ref: 'John 2:1-11', say: 'Soon after, at a wedding in Cana, water becomes wine. His first miracle.' },
    { t: 'First disciples called', ic: 'fish',      ch: 'Beginning of ministry', age: 'About 30', place: 'shore',     ref: 'Matthew 4:18-22', say: 'By the Sea of Galilee, He calls fishermen to leave their nets and follow Him.' },
    // Ministry & miracles
    { t: 'Woman at the well', ic: 'well',           ch: 'Ministry & miracles', age: 'Ministry',   place: 'sychar',    ref: 'John 4:1-42', note: 'Jacob\'s well near Sychar', say: 'Passing through Samaria, He rests at a well, and offers a woman living water.' },
    { t: 'Paralysed man healed', ic: 'walker',        ch: 'Ministry & miracles', age: 'Ministry',   place: 'capernaum', ref: 'Mark 2:1-12', say: 'Back in Capernaum, four friends lower a paralysed man through a roof, and he is healed.' },
    { t: 'Sermon on the Mount', ic: 'mountain',         ch: 'Ministry & miracles', age: 'Ministry',   place: 'beatitudes', ref: 'Matthew 5:1-12', note: 'Matthew says only ‘a mountainside’; the Mount of Beatitudes is the traditional site', say: 'Crowds gather. On a mountainside, He begins to teach them: blessed are the poor in spirit.' },
    { t: 'Storm calmed', ic: 'storm',                ch: 'Ministry & miracles', age: 'Ministry',   place: 'lake',      ref: 'Mark 4:35-41', say: 'Then a storm strikes the lake. Jesus stands, and says: peace, be still.' },
    { t: 'Five thousand fed', ic: 'loaf',           ch: 'Ministry & miracles', age: 'Ministry',   place: 'bethsaida', ref: 'Luke 9:10-17', note: 'Luke places this near Bethsaida', say: 'Thousands follow Him to a quiet place, and five loaves and two fish feed them all.' },
    { t: 'Walks on the water', ic: 'waves',          ch: 'Ministry & miracles', age: 'Ministry',   place: 'lake',      ref: 'Matthew 14:22-33', say: 'That night, He comes to His frightened disciples, walking on the water.' },
    // The road to Jerusalem
    { t: 'Peter\'s confession', ic: 'keys',         ch: 'The road to Jerusalem', age: 'Ministry', place: 'caesarea',  ref: 'Matthew 16:13-20', say: 'At Caesarea Philippi, He asks: who do you say I am? Peter answers: the Christ.' },
    { t: 'Transfiguration', ic: 'glory',             ch: 'The road to Jerusalem', age: 'Ministry', place: 'tabor', ref: 'Mark 9:2-13', note: 'Mark says only ‘a high mountain’; Mount Tabor is traditional, Mount Hermon is another proposal', say: 'Six days later, on a high mountain, His face shines like the sun.' },
    { t: 'Lazarus raised', ic: 'tomb',              ch: 'The road to Jerusalem', age: 'Ministry', place: 'bethany',   ref: 'John 11:1-44', say: 'Then, at Bethany, He stands at a tomb, and calls Lazarus back to life.' },
    // Final days
    { t: 'Triumphal entry', ic: 'palm',             ch: 'Final days', age: 'Final week',          place: 'olivet',    ref: 'Matthew 21:1-11', ot: 'Zechariah 9:9', note: 'From the Mount of Olives into Jerusalem', say: 'Now the final week begins. Crowds cheer as He rides into Jerusalem on a donkey.' },
    { t: 'The Last Supper', ic: 'supper',             ch: 'Final days', age: 'Final week',          place: 'upperroom', ref: 'Mark 14:12-26', note: 'Traditional upper room site', say: 'That Thursday, in an upper room, He shares bread and wine with His disciples.' },
    { t: 'Gethsemane and arrest', ic: 'moon',       ch: 'Final days', age: 'Final week',          place: 'gethsemane', ref: 'Matthew 26:36-56', say: 'That same night, in Gethsemane, He prays in anguish, and is betrayed with a kiss.' },
    // Crucifixion & resurrection
    { t: 'The crucifixion', ic: 'cross',             ch: 'Crucifixion & resurrection', age: 'Final week', place: 'golgotha', ref: 'Luke 23:33-49', ot: 'Psalm 22:18', note: 'Traditional site', say: 'By morning, at Golgotha, He is crucified. It is finished, He says.' },
    { t: 'He is risen', ic: 'risen',                 ch: 'Crucifixion & resurrection', age: 'Day 3',      place: 'golgotha', ref: 'Matthew 28:1-10', ot: 'Psalm 16:10', note: 'Traditional tomb site', say: 'Three days later, the tomb is empty. He is risen!' },
    // Resurrection & ascension
    { t: 'Road to Emmaus', ic: 'road',              ch: 'Resurrection & ascension', age: 'Day 3',           place: 'emmaus', ref: 'Luke 24:13-35', note: 'Luke gives about 60 stadia (about 11 km) from Jerusalem; Abu Ghosh, Qubeibeh and Latrun are all proposed', say: 'That same day, on the road to Emmaus, two sad travellers recognise Him, as He breaks bread.' },
    { t: 'Breakfast by the lake', ic: 'flame',       ch: 'Resurrection & ascension', age: 'After rising',    place: 'tabgha', ref: 'John 21:1-14', note: 'John says ‘the shore’ of the Sea of Tiberias (the Sea of Galilee); Tabgha is the traditional site', say: 'Later, by the lake, He cooks breakfast for His weary disciples.' },
    { t: 'The Great Commission', ic: 'globe',       ch: 'Resurrection & ascension', age: 'After rising',    place: 'galilee', ref: 'Matthew 28:16-20', note: 'Matthew names no mountain; the pin shows the general Galilee hills', say: 'Then, on a mountain in Galilee, He gives His final command: go, and make disciples of all nations.' },
    { t: 'Jesus ascends', ic: 'ascend',               ch: 'Resurrection & ascension', age: 'Day 40',          place: 'olivet', ref: 'Acts 1:3-12', say: 'Forty days after rising, from the Mount of Olives, He is taken up into the clouds. Two angels tell the watching disciples: this same Jesus will come back.' }
  ];

  /* spoken after the last event, following a pause, in a warmer and more uplifting voice (audio/30.mp3) */
  var CHEER = 'Until then, let us live lives that glorify His name.';

  /* spoken once when the journey ends (audio/31.mp3), while the place button invites a visitor to pick their own city */
  var OUTRO = 'Now, change to your favourite location.';

  var data = { PLACES: PLACES, EVENTS: EVENTS, OUTRO: OUTRO, CHEER: CHEER };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else { root.PLACES = PLACES; root.EVENTS = EVENTS; root.OUTRO = OUTRO; root.CHEER = CHEER; }
})(typeof window !== 'undefined' ? window : this);
