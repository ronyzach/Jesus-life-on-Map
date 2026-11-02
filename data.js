/* Content. Every event cites a passage that reads the same in the NIV and the KJV.
   Coordinates are approximate modern reference points for the places the passages name,
   not claims about exact biblical locations. A place the passage does not name has place:null
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
    shore:       { name: 'Sea of Galilee',   lat: 32.8700, lng: 35.5700 },
    capernaum:   { name: 'Capernaum',        lat: 32.8803, lng: 35.5750 },
    lake:        { name: 'Sea of Galilee',   lat: 32.8200, lng: 35.5900 },
    bethsaida:   { name: 'Bethsaida',        lat: 32.9060, lng: 35.6310 },
    caesarea:    { name: 'Caesarea Philippi', lat: 33.2481, lng: 35.6942 },
    bethany:     { name: 'Bethany',          lat: 31.7706, lng: 35.2610 },
    jericho:     { name: 'Jericho',          lat: 31.8611, lng: 35.4440 },
    olivet:      { name: 'Mount of Olives',  lat: 31.7787, lng: 35.2450 },
    upperroom:   { name: 'Jerusalem',        lat: 31.7717, lng: 35.2296 },
    gethsemane:  { name: 'Gethsemane',       lat: 31.7795, lng: 35.2399 },
    golgotha:    { name: 'Golgotha',         lat: 31.7784, lng: 35.2296 }
  };

  /* t: short title, ch: chapter, age: life stage as the text gives it, place: key in PLACES or null,
     pn: label when there is no pin, ref: passage, ot: optional Old Testament passage, note: caveat. */
  var EVENTS = [
    // Birth & childhood
    { t: 'Jesus is born',               ch: 'Birth & childhood', age: 'Birth',        place: 'bethlehem', ref: 'Luke 2:1-7',     ot: 'Micah 5:2' },
    { t: 'Shepherds visit',             ch: 'Birth & childhood', age: 'Newborn',      place: 'bethlehem', ref: 'Luke 2:8-20' },
    { t: 'Presented at the Temple',     ch: 'Birth & childhood', age: 'Infant',       place: 'jerusalem', ref: 'Luke 2:22-38' },
    { t: 'Wise men worship Him',        ch: 'Birth & childhood', age: 'Young child',  place: 'bethlehem', ref: 'Matthew 2:1-12', note: 'Matthew says a house in Bethlehem' },
    { t: 'Flight to Egypt',             ch: 'Birth & childhood', age: 'Young child',  place: null, pn: 'Egypt (no town named)', ref: 'Matthew 2:13-15', ot: 'Hosea 11:1' },
    { t: 'Home to Nazareth',            ch: 'Birth & childhood', age: 'Childhood',    place: 'nazareth',  ref: 'Matthew 2:19-23' },
    { t: 'Boy Jesus in the Temple',     ch: 'Birth & childhood', age: 'Age 12',       place: 'jerusalem', ref: 'Luke 2:41-52' },
    // Beginning of ministry
    { t: 'Baptised by John',            ch: 'Beginning of ministry', age: 'About 30', place: 'jordan',    ref: 'Matthew 3:13-17', note: 'Traditional baptism site' },
    { t: 'Tested in the wilderness',    ch: 'Beginning of ministry', age: 'About 30', place: null, pn: 'Wilderness (not named)', ref: 'Matthew 4:1-11' },
    { t: 'Water turned to wine',        ch: 'Beginning of ministry', age: 'About 30', place: 'cana',      ref: 'John 2:1-11' },
    { t: 'First disciples called',      ch: 'Beginning of ministry', age: 'About 30', place: 'shore',     ref: 'Matthew 4:18-22' },
    // Ministry & miracles
    { t: 'Woman at the well',           ch: 'Ministry & miracles', age: 'Ministry',   place: 'sychar',    ref: 'John 4:1-42', note: 'Jacob\'s well near Sychar' },
    { t: 'Paralysed man healed',        ch: 'Ministry & miracles', age: 'Ministry',   place: 'capernaum', ref: 'Mark 2:1-12' },
    { t: 'Sermon on the Mount',         ch: 'Ministry & miracles', age: 'Ministry',   place: null, pn: 'A mountainside (not named)', ref: 'Matthew 5:1-12' },
    { t: 'Storm calmed',                ch: 'Ministry & miracles', age: 'Ministry',   place: 'lake',      ref: 'Mark 4:35-41' },
    { t: 'Five thousand fed',           ch: 'Ministry & miracles', age: 'Ministry',   place: 'bethsaida', ref: 'Luke 9:10-17', note: 'Luke places this near Bethsaida' },
    { t: 'Walks on the water',          ch: 'Ministry & miracles', age: 'Ministry',   place: 'lake',      ref: 'Matthew 14:22-33' },
    // The road to Jerusalem
    { t: 'Peter\'s confession',         ch: 'The road to Jerusalem', age: 'Ministry', place: 'caesarea',  ref: 'Matthew 16:13-20' },
    { t: 'Transfiguration',             ch: 'The road to Jerusalem', age: 'Ministry', place: null, pn: 'A high mountain (not named)', ref: 'Mark 9:2-13' },
    { t: 'Lazarus raised',              ch: 'The road to Jerusalem', age: 'Ministry', place: 'bethany',   ref: 'John 11:1-44' },
    { t: 'Zacchaeus in Jericho',        ch: 'The road to Jerusalem', age: 'Ministry', place: 'jericho',   ref: 'Luke 19:1-10' },
    // Final days
    { t: 'Triumphal entry',             ch: 'Final days', age: 'Final week',          place: 'olivet',    ref: 'Matthew 21:1-11', ot: 'Zechariah 9:9', note: 'From the Mount of Olives into Jerusalem' },
    { t: 'The Last Supper',             ch: 'Final days', age: 'Final week',          place: 'upperroom', ref: 'Mark 14:12-26', note: 'Traditional upper room site' },
    { t: 'Gethsemane and arrest',       ch: 'Final days', age: 'Final week',          place: 'gethsemane', ref: 'Matthew 26:36-56' },
    // Crucifixion & resurrection
    { t: 'The crucifixion',             ch: 'Crucifixion & resurrection', age: 'Final week', place: 'golgotha', ref: 'Luke 23:33-49', ot: 'Psalm 22:18', note: 'Traditional site' },
    { t: 'He is risen',                 ch: 'Crucifixion & resurrection', age: 'Day 3',      place: 'golgotha', ref: 'Matthew 28:1-10', ot: 'Psalm 16:10', note: 'Traditional tomb site' },
    // Resurrection & ascension
    { t: 'Road to Emmaus',              ch: 'Resurrection & ascension', age: 'Day 3',           place: null, pn: 'Emmaus road (site unknown)', ref: 'Luke 24:13-35' },
    { t: 'Breakfast by the lake',       ch: 'Resurrection & ascension', age: 'After rising',    place: 'lake', ref: 'John 21:1-14', note: 'The Sea of Tiberias is the Sea of Galilee' },
    { t: 'The Great Commission',       ch: 'Resurrection & ascension', age: 'After rising',    place: null, pn: 'A mountain in Galilee', ref: 'Matthew 28:16-20' },
    { t: 'Jesus ascends',               ch: 'Resurrection & ascension', age: 'Day 40',          place: 'olivet', ref: 'Acts 1:3-12' }
  ];

  var data = { PLACES: PLACES, EVENTS: EVENTS };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else { root.PLACES = PLACES; root.EVENTS = EVENTS; }
})(typeof window !== 'undefined' ? window : this);
