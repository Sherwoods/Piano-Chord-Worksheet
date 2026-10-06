// Run with: node tests/chords.test.js
'use strict';
const L = require('../chords.js');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) pass++;
  else { fail++; console.log('FAIL', name, detail || ''); }
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const notesOf = (sym, mode = 'plain') => {
  const c = L.parse(sym);
  if (!c) return null;
  const s = L.spell(c, mode);
  return s.notes.map(n => n.name).join(' ') + (s.bass ? ' / ' + s.bass.name : '');
};

/* ---------- Spelling ---------- */
// [symbol, expected notes, mode]
const SPELL = [
  // From the spec
  ['C13', 'C E G B♭ D A'],
  ['Cmaj7♯11', 'C E G B F♯'],
  ['F♯m7♭5', 'F♯ A C E'],
  ['B♭6/9', 'B♭ D F G C'],
  ['G7♯9', 'G B D F A♯'],
  ['Dm(maj7)', 'D F A C♯'],
  ['Csus4', 'C F G'],
  ['C7sus4', 'C F G B♭'],
  ['Aaug', 'A C♯ F'],
  ['Aaug', 'A C♯ E♯', 'strict'],
  ['G7/B', 'G B D F / B'],
  ['D♭maj9', 'D♭ F A♭ C E♭'],
  ['Bm11', 'B D F♯ A C♯ E'],
  // The spec lists E♭dim7 as E♭ G♭ B𝄫 D♭; that is the half-diminished chord. Both are tested with correct spellings.
  ['E♭dim7', 'E♭ G♭ A C'],
  ['E♭dim7', 'E♭ G♭ B𝄫 D𝄫', 'strict'],
  ['E♭m7♭5', 'E♭ G♭ A D♭'],
  ['E♭m7♭5', 'E♭ G♭ B𝄫 D♭', 'strict'],
  // Triads and sixths
  ['C', 'C E G'], ['Cm', 'C E♭ G'], ['Cdim', 'C E♭ G♭'], ['Caug', 'C E G♯'],
  ['Csus2', 'C D G'], ['C5', 'C G'], ['C6', 'C E G A'], ['Cm6', 'C E♭ G A'], ['C6/9', 'C E G A D'],
  ['F', 'F A C'], ['F♯', 'F♯ A♯ C♯'], ['C♯m', 'C♯ E G♯'], ['Bdim', 'B D F'], ['Fm6', 'F A♭ C D'],
  ['Gsus4', 'G C D'], ['Dsus2', 'D E A'], ['B♭m6/9', 'B♭ D♭ F G C'],
  // Sevenths
  ['C7', 'C E G B♭'], ['Cmaj7', 'C E G B'], ['Cm7', 'C E♭ G B♭'], ['Cm(maj7)', 'C E♭ G B'],
  ['Cm7♭5', 'C E♭ G♭ B♭'], ['Cdim7', 'C E♭ G♭ A'], ['Cdim7', 'C E♭ G♭ B𝄫', 'strict'],
  ['B♭7', 'B♭ D F A♭'], ['E♭7', 'E♭ G B♭ D♭'], ['A♭maj7', 'A♭ C E♭ G'], ['G♭maj7', 'G♭ B♭ D♭ F'],
  ['Bm7♭5', 'B D F A'], ['A7sus4', 'A D E G'], ['C7♯5', 'C E G♯ B♭'], ['Caug7', 'C E G♯ B♭'],
  // Extensions
  ['C9', 'C E G B♭ D'], ['Cmaj9', 'C E G B D'], ['Cm9', 'C E♭ G B♭ D'], ['C11', 'C G B♭ D F'],
  ['Cmaj13', 'C E G B D A'], ['G13', 'G B D F A E'], ['Cm11', 'C E♭ G B♭ D F'], ['E♭m9', 'E♭ G♭ B♭ D♭ F'],
  ['C9sus4', 'C F G B♭ D'], ['C13♯11', 'C E G B♭ D F♯ A'],
  // Alterations
  ['C7♭9', 'C E G B♭ D♭'], ['C7♯9', 'C E G B♭ D♯'], ['C7(♭9,♯11)', 'C E G B♭ D♭ F♯'],
  ['C7alt', 'C E B♭ D♭ D♯ A♭'], ['A7♭9', 'A C♯ E G B♭'], ['D7♯11', 'D F♯ A C G♯'], ['C7♭13', 'C E G B♭ A♭'],
  ['E7♯9', 'E G♯ B D G'], ['E7♯9', 'E G♯ B D F𝄪', 'strict'],
  ['Emaj7♯5', 'E G♯ C D♯'], ['Emaj7♯5', 'E G♯ B♯ D♯', 'strict'],
  ['C♯aug', 'C♯ E♯ A'], ['C♯aug', 'C♯ E♯ G𝄪', 'strict'],
  ['G♭7♭9', 'G♭ B♭ D♭ F♭ G'], ['G♭7♭9', 'G♭ B♭ D♭ F♭ A𝄫', 'strict'],
  // Add, omit, slash
  ['Cadd9', 'C E G D'], ['Cadd11', 'C E G F'], ['C7add11', 'C E G B♭ F'], ['C(no3)', 'C G'], ['C9(no3)', 'C G B♭ D'],
  ['C/E', 'C E G / E'], ['Fmaj7/A', 'F A C E / A'], ['C/B♭', 'C E G / B♭'], ['Cm7/B♭', 'C E♭ G B♭ / B♭'],
];
SPELL.forEach(([sym, want, mode]) => {
  const got = notesOf(sym, mode);
  check(`spell ${sym}${mode ? ' (' + mode + ')' : ''}`, got === want, `got "${got}" want "${want}"`);
});
const distinct = new Set(SPELL.map(s => s[0])).size;
check('at least 60 distinct chords spelled', distinct >= 60, `only ${distinct}`);

/* ---------- Rendering ---------- */
const RENDER = [
  ['C', 'C', 'C'], ['Cm', 'Cm', 'C–'], ['Cdim', 'Cdim', 'C°'], ['Caug', 'Caug', 'C+'],
  ['Csus2', 'Csus2', 'Csus2'], ['Csus4', 'Csus4', 'Csus4'], ['C5', 'C5', 'C5'],
  ['C6', 'C6', 'C6'], ['Cm6', 'Cm6', 'C–6'], ['C6/9', 'C6/9', 'C6/9'],
  ['C7', 'C7', 'C7'], ['Cmaj7', 'Cmaj7', 'C∆7'], ['Cm7', 'Cm7', 'C–7'], ['Cm(maj7)', 'Cm(maj7)', 'C–(∆7)'],
  ['Cm7♭5', 'Cm7♭5', 'Cø7'], ['Cdim7', 'Cdim7', 'C°7'],
  ['C9', 'C9', 'C9'], ['Cmaj9', 'Cmaj9', 'C∆9'], ['Cm9', 'Cm9', 'C–9'], ['C11', 'C11', 'C11'],
  ['C13', 'C13', 'C13'], ['Cmaj13', 'Cmaj13', 'C∆13'],
  ['C7♭9', 'C7♭9', 'C7♭9'], ['C7#9', 'C7(♯9)', 'C7(♯9)'], ['C7(b9,#11)', 'C7(♭9,♯11)', 'C7(♭9,♯11)'], ['C7alt', 'C7alt', 'C7alt'],
  ['Cadd9', 'Cadd9', 'Cadd9'], ['C(no3)', 'C(no3)', 'C(no3)'], ['C/E', 'C/E', 'C/E'],
  ['Eb7#9/G', 'E♭7(♯9)/G', 'E♭7(♯9)/G'], ['Cmaj7#11', 'Cmaj7(♯11)', 'C∆7(♯11)'], ['C(b5)', 'C(♭5)', 'C(♭5)'],
];
RENDER.forEach(([sym, std, jazz]) => {
  const c = L.parse(sym);
  check(`parse ${sym}`, !!c);
  if (!c) return;
  check(`render standard ${sym}`, L.render(c, 'standard') === std, `got ${L.render(c, 'standard')}`);
  check(`render jazz ${sym}`, L.render(c, 'jazz') === jazz, `got ${L.render(c, 'jazz')}`);
});

/* ---------- Parser shortcuts ---------- */
const ALIASES = [
  ['CM7', 'Cmaj7'], ['C^7', 'Cmaj7'], ['C∆', 'Cmaj7'], ['Cmin7', 'Cm7'], ['C-7', 'Cm7'], ['Cø', 'Cm7♭5'], ['Cm7b5', 'Cm7♭5'],
  ['Co', 'Cdim'], ['C°', 'Cdim'], ['Co7', 'Cdim7'], ['C+', 'Caug'], ['C+7', 'Caug7'], ['Csus', 'Csus4'], ['C7sus', 'C7sus4'],
  ['Cadd2', 'Cadd9'], ['Cno3', 'C(no3)'], ['C7+9', 'C7(♯9)'], ['C7-9', 'C7♭9'], ['Bb7', 'B♭7'], ['F#m7', 'F♯m7'], ['C69', 'C6/9'],
];
ALIASES.forEach(([inp, want]) => {
  const c = L.parse(inp);
  check(`alias ${inp}`, c && L.render(c) === want, `got ${c && L.render(c)}`);
});
['?', '', 'hello', 'Name this chord', 'C7add13', 'Cmaj7maj7', 'Csus4add11', 'C5add9', 'Cdim6'].forEach(s =>
  check(`not a chord: "${s}"`, L.parse(s) === null, JSON.stringify(L.parse(s))));

/* ---------- Round trip: render then parse gives the same chord ---------- */
const pool = new Map();
[...SPELL.map(s => s[0]), ...RENDER.map(r => r[0]), ...ALIASES.map(a => a[0])].forEach(s => { const c = L.parse(s); if (c) pool.set(JSON.stringify(c), c); });
// Plus every single builder tap from a few starting chords, to cover combinations.
const G = { quality: L.QUALITIES, seventh: [null, ...L.SEVENTHS], ext: L.EXTS, alt: [...L.ALT_KEYS, 'alt7'], add: L.ADD_KEYS, omit: L.OMIT_KEYS, bass: ['E', 'G', 'B'] };
['C', 'Cm7', 'F♯7', 'B♭maj7', 'Edim', 'Aaug', 'Dsus4', 'G9', 'E♭m9'].forEach(start => {
  const base = L.parse(start);
  Object.entries(G).forEach(([g, vals]) => vals.forEach(v => {
    if (L.optionReason(base, g, v)) return;
    const c = L.apply(base, g, v);
    pool.set(JSON.stringify(c), c);
    L.ALT_KEYS.forEach(k => { if (!L.optionReason(c, 'alt', k)) { const d = L.apply(c, 'alt', k); pool.set(JSON.stringify(d), d); } });
  }));
});
let rt = 0;
pool.forEach(c => ['standard', 'jazz'].forEach(style => {
  const sym = L.render(c, style);
  const back = L.parse(sym);
  rt++;
  check(`round trip ${style} ${sym}`, back && same(back, c), `parsed ${back && L.render(back, style)}`);
}));
check('round trip covers 200+ renderings', rt >= 200, `only ${rt}`);

/* ---------- Validation and builder ---------- */
const c7 = L.parse('C7');
check('6 with 9 disabled', !!L.optionReason(L.parse('C6'), 'ext', 9));
check('dim7 without dim disabled', !!L.optionReason(c7, 'seventh', 'dim7'));
check('11 with sus4 disabled', !!L.optionReason(L.parse('Csus4'), 'ext', 11));
check('♯5 with aug disabled', !!L.optionReason(L.parse('Caug'), 'alt', 's5'));
check('♭9 without a 7th disabled', !!L.optionReason(L.parse('C'), 'alt', 'b9'));
check('controls need a root first', L.optionReason(null, 'quality', 'min') === 'Pick a root note first.');
const tapped = L.apply(L.apply(L.emptyChord({ letter: 'G', acc: 0 }), 'quality', 'min'), 'seventh', '7');
check('three taps: G, min, 7', L.render(tapped) === 'Gm7');
check('9 on a triad adds the 7th', L.render(L.apply(L.parse('C'), 'ext', 9)) === 'C9');
check('7 none clears extensions', L.render(L.apply(L.parse('C13♭9'), 'seventh', null)) === 'C');
check('♭5 on m7 becomes half-diminished', L.render(L.apply(L.parse('Cm7'), 'alt', 'b5')) === 'Cm7♭5');
check('sanitize drops junk', L.sanitize({ root: { letter: 'H' } }) === null && L.sanitize(null) === null);
check('sanitize keeps a chord', same(L.sanitize(JSON.parse(JSON.stringify(c7))), c7));

/* ---------- Close voicing used to mark the keys ---------- */
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const midiName = m => NAMES[m % 12] + (Math.floor(m / 12) - 1);
[['G7', 'G3 B3 D4 F4'], ['C', 'C4 E4 G4'], ['Cmaj7', 'C4 E4 G4 B4'], ['F♯m', 'F♯4 A4 C♯5'], ['A♭7', 'G♯3 C4 D♯4 F♯4'],
 ['C9', 'C4 D4 E4 G4 A♯4'], ['G7/B', 'L:B2 G3 B3 D4 F4'], ['C/E', 'L:E3 C4 E4 G4']].forEach(([sym, want]) => {
  const v = L.closeVoicing(L.parse(sym));
  const got = v.map(x => (x.hand === 'L' ? 'L:' : '') + midiName(x.midi)).join(' ');
  check(`close voicing ${sym}`, got === want, `got ${got}`);
});
let voiced = 0;
pool.forEach(c => {
  const v = L.closeVoicing(c), r = v.filter(x => x.hand === 'R').map(x => x.midi);
  const want = [...new Set(L.tones(c).map(t => t.semis % 12))].map(s => (L.pcOf(c.root) + s) % 12).sort((a, b) => a - b);
  const got = [...new Set(r.map(m => m % 12))].sort((a, b) => a - b);
  const sym = L.render(c);
  check(`voicing has exactly the chord tones: ${sym}`, same(got, want) && got.length === r.length, `got ${got} want ${want}`);
  check(`voicing is root position within an octave: ${sym}`, r[0] % 12 === L.pcOf(c.root) && r[r.length - 1] - r[0] < 12);
  const b = v.find(x => x.hand === 'L');
  check(`slash bass below the chord: ${sym}`, c.bass ? b && b.midi % 12 === L.pcOf(c.bass) && b.midi < r[0] : !b);
  voiced++;
});
check('voicing checked on 100+ chords', voiced >= 100, `only ${voiced}`);

/* ---------- Transposition ---------- */
const transposeAll = (syms, k) => {
  const cs = syms.map(L.parse);
  const steps = L.letterShift(cs.flatMap(c => c.bass ? [c.root, c.bass] : [c.root]), k);
  return cs.map(c => L.render(L.transposeChord(c, k, steps))).join(' ');
};
[[['E♭', 'A♭', 'B♭7', 'Cm'], 2, 'F B♭ C7 Dm'],
 [['E♭', 'A♭', 'B♭7', 'Cm'], 1, 'E A B7 C♯m'],
 [['E', 'A', 'B7', 'C♯m'], -1, 'E♭ A♭ B♭7 Cm'],
 [['C', 'F', 'G7', 'Am'], 1, 'D♭ G♭ A♭7 B♭m'],
 [['C', 'F', 'G7', 'Am'], 6, 'F♯ B C♯7 D♯m'],
 [['C', 'F', 'G7', 'Am'], -5, 'G C D7 Em'],
 [['A', 'D', 'E7', 'F♯m'], 2, 'B E F♯7 G♯m'],
 [['C/E', 'G7/B'], 3, 'E♭/G B♭7/D'],
 [['E'], 1, 'F'],
 [['Cmaj7♯11', 'F♯m7♭5'], 12, 'Cmaj7(♯11) F♯m7♭5']].forEach(([syms, k, want]) => {
  const got = transposeAll(syms, k);
  check(`transpose ${syms.join(' ')} by ${k}`, got === want, `got "${got}" want "${want}"`);
});
check('no notes: plain interval letter steps', L.letterShift([], 2) === 1 && L.letterShift([], 7) === 4 && L.letterShift([], -1) === 6);
let moved = 0;
pool.forEach(c => {
  for (let k = -11; k <= 11; k++) {
    const t = L.transposeChord(c, k, L.letterShift([c.root], k));
    const ok = t && !L.validate(t).length && (L.pcOf(t.root) - L.pcOf(c.root) - k + 24) % 12 === 0 &&
      Math.abs(t.root.acc) <= 1 && t.quality === c.quality && t.seventh === c.seventh && same(t.alt, c.alt);
    check(`transpose keeps the chord: ${L.render(c)} by ${k}`, ok, t && L.render(t));
    moved++;
  }
});
check('transposition checked on 2000+ chords', moved >= 2000, `only ${moved}`);
[['Bb7', 'C7'], [' f#m7b5 ', ' G#m7b5 '], ['C/E', 'D/F♯'], ['Dm7/G', 'Em7/A'], ['D♭maj7', 'E♭maj7'], ['?', null], ['C major', null], ['', null]]
  .forEach(([label, want]) => {
    const got = L.transposeLabel(label, 2, 1);
    check(`transpose label ${JSON.stringify(label)}`, got === want, `got ${JSON.stringify(got)}`);
  });

/* ---------- Scales ---------- */
const Staff = require('../staff.js');
const scale = (l, a, type, o = {}) => Object.assign(L.newScale({ letter: l, acc: a }), { type }, o);
const scaleText = s => L.scaleColumns(s).map(c => (c.R || c.L).name + (c.R || c.L).octave).join(' ');
[[scale('C', 0, 'major', { hands: 'R', dir: 'up' }), 'C4 D4 E4 F4 G4 A4 B4 C5', 0],
 [scale('A', -1, 'major', { hands: 'R', dir: 'up' }), 'A♭4 B♭4 C5 D♭5 E♭5 F5 G5 A♭5', -4],
 [scale('C', 1, 'major', { hands: 'R', dir: 'up' }), 'C♯4 D♯4 E♯4 F♯4 G♯4 A♯4 B♯4 C♯5', 7],
 [scale('C', -1, 'major', { hands: 'R', dir: 'up' }), 'C♭4 D♭4 E♭4 F♭4 G♭4 A♭4 B♭4 C♭5', -7],
 [scale('A', 0, 'natural', { hands: 'R', dir: 'up' }), 'A4 B4 C5 D5 E5 F5 G5 A5', 0],
 [scale('A', 0, 'harmonic', { hands: 'R' }), 'A4 B4 C5 D5 E5 F5 G♯5 A5 G♯5 F5 E5 D5 C5 B4 A4', 0],
 [scale('A', 0, 'melodic', { hands: 'R' }), 'A4 B4 C5 D5 E5 F♯5 G♯5 A5 G5 F5 E5 D5 C5 B4 A4', 0],
 [scale('G', 1, 'harmonic', { hands: 'R', dir: 'up' }), 'G♯4 A♯4 B4 C♯5 D♯5 E5 F𝄪5 G♯5', 5],
 [scale('E', -1, 'natural', { hands: 'L', dir: 'up' }), 'E♭3 F3 G♭3 A♭3 B♭3 C♭4 D♭4 E♭4', -6],
 [scale('B', -1, 'major', { hands: 'R', octaves: 2, dir: 'up' }), 'B♭4 C5 D5 E♭5 F5 G5 A5 B♭5 C6 D6 E♭6 F6 G6 A6 B♭6', -2],
].forEach(([s, want, sig]) => {
  check(`scale ${L.scaleName(s)}`, scaleText(s) === want, `got ${scaleText(s)}`);
  check(`key signature ${L.scaleName(s)}`, L.keySignature(s) === sig, `got ${L.keySignature(s)}`);
});
const both = L.scaleColumns(scale('F', 0, 'major'));
check('both hands: left hand two octaves below, same beat', both.length === 15 && both.every(c => c.R.midi - c.L.midi === 24), JSON.stringify(both[0]));
check('scale marks: ascending keys per hand', L.scaleMarks(scale('F', 0, 'major')).length === 16 && L.scaleMarks(scale('A', 0, 'melodic', { hands: 'R' })).length === 8);
check('no key signature is refused with a suggestion', L.validateScale(scale('G', 1, 'major'))[0] === 'G♯ major has no key signature. Use A♭ major.');
check('both hands only for one octave', !!L.scaleOptionReason(scale('C', 0, 'major'), 'octaves', 2));
check('tonic needs picking first', L.scaleOptionReason(null, 'type', 'major') === 'Pick a tonic first.');
check('G♯ in major switches to minor', L.scaleName(L.applyScale(scale('G', 0, 'major'), 'tonicAcc', 1)) === 'G♯ natural minor');
check('D♭ in minor switches to major', L.scaleName(L.applyScale(scale('D', 0, 'harmonic'), 'tonicAcc', -1)) === 'D♭ major');
check('sanitize scale', L.sanitizeScale({ tonic: { letter: 'G', acc: 1 }, type: 'major' }) === null && L.sanitizeScale(null) === null &&
  same(L.sanitizeScale(JSON.parse(JSON.stringify(scale('D', 0, 'melodic')))), scale('D', 0, 'melodic')));
[[scale('G', 1, 'harmonic'), 2, 1, 'B♭ harmonic minor'], [scale('G', 0, 'major'), 1, 1, 'A♭ major'], [scale('E', 0, 'major'), 4, 2, 'A♭ major'],
 [scale('C', 0, 'major'), 6, 3, 'F♯ major'], [scale('E', 0, 'major'), -1, 0, 'E♭ major']].forEach(([s, k, st, want]) => {
  const got = L.scaleName(L.transposeScale(s, k, st));
  check(`transpose ${L.scaleName(s)} by ${k}`, got === want, `got ${got}`);
});
let scalesOk = 0;
L.LETTERS.forEach(l => [-1, 0, 1].forEach(a => L.SCALE_TYPES.forEach(t => {
  const s = scale(l, a, t, { hands: 'R' });
  if (L.validateScale(s).length) return;
  const cols = L.scaleColumns(s), steps = { major: [2, 2, 1, 2, 2, 2, 1], natural: [2, 1, 2, 2, 1, 2, 2], harmonic: [2, 1, 2, 2, 1, 3, 1], melodic: [2, 1, 2, 2, 2, 2, 1] }[t];
  const up = cols.slice(0, 8);
  const ok = up.every((c, i) => i === 0 || (c.R.midi - up[i - 1].R.midi === steps[i - 1] && Staff.stepOf(c.R) - Staff.stepOf(up[i - 1].R) === 1));
  check(`every scale steps by letter and semitone: ${L.scaleName(s)}`, ok, scaleText(s));
  scalesOk++;
})));
check('checked 50+ scales', scalesOk >= 50, `only ${scalesOk}`);

/* ---------- Staff accidentals ---------- */
const nt = (letter, acc, octave) => ({ letter, acc, octave });
const shows = (cols, sig) => Staff.shownAccidentals(cols.map(c => ({ R: c, L: [] })), sig).map(c => c.R.map(Number).join('')).join(' ');
check('key signature notes need no accidental', shows([[nt('B', -1, 4)], [nt('E', -1, 5)]], -2) === '0 0');
check('raised note shows, and stays raised', shows([[nt('G', 1, 4)], [nt('G', 1, 4)]], 0) === '1 0');
check('melodic minor down shows the naturals again', shows([[nt('C', 1, 4)], [nt('C', 0, 4)]], -1) === '1 1');
check('accidentals belong to one octave', shows([[nt('G', 1, 4)], [nt('G', 1, 5)]], 0) === '1 1');
const drawn = Staff.grandStaff({ width: 720, columns: L.scaleColumns(scale('A', -1, 'major')).map(c => ({ R: [c.R], L: [c.L] })), sig: -4, final: true });
check('staff draws without bad numbers', !/NaN|undefined/.test(drawn.svg) && (drawn.svg.match(/class="staff-notes"/g) || []).length === 1 && drawn.height > 0, drawn.svg.slice(0, 200));
check('staff draws every finger, colored ones for the start and crossings', (drawn.svg.match(/<text /g) || []).length === 30 && (drawn.svg.match(/fill="#7D1D2C"/g) || []).length > 0);
const high = Staff.grandStaff({ width: 720, columns: L.scaleColumns(scale('B', 0, 'major', { hands: 'R', octaves: 2 })).map(c => ({ R: [c.R], L: [] })), sig: 5, final: true });
check('staff grows to fit high notes and their fingers', high.height > drawn.height && /viewBox="0 -/.test(high.svg), high.svg.slice(0, 120));

/* ---------- Scale fingering ---------- */
const fing = (s, h) => (L.scaleFingering(s, h) || []).map(x => x.finger).join('');
const acc = (s, h) => (L.scaleFingering(s, h) || []).map(x => (x.accent ? '*' : '') + x.finger).join(' ');
[[scale('C', 0, 'major', { dir: 'up' }), '12312345', '54321321'],
 [scale('F', 0, 'major', { dir: 'up' }), '12341234', '54321321'],
 [scale('B', -1, 'major', { dir: 'up' }), '21231234', '32143213'],
 [scale('E', -1, 'major', { dir: 'up' }), '31234123', '32143213'],
 [scale('A', -1, 'major', { dir: 'up' }), '34123123', '32143213'],
 [scale('D', -1, 'major', { dir: 'up' }), '23123412', '32143213'],
 [scale('C', 1, 'major', { dir: 'up' }), '23123412', '32143213'],
 [scale('F', 1, 'major', { dir: 'up' }), '23412312', '43213214'],
 [scale('G', -1, 'major', { dir: 'up' }), '23412312', '43213214'],
 [scale('B', 0, 'major', { dir: 'up' }), '12312345', '43214321'],
 [scale('C', -1, 'major', { dir: 'up' }), '12312345', '43214321'],
 [scale('E', -1, 'harmonic', { dir: 'up' }), '31234123', '21432132'],
 [scale('B', -1, 'natural', { dir: 'up' }), '21231234', '21321432'],
 [scale('F', 1, 'harmonic', { dir: 'up' }), '34123123', '43213214'],
 [scale('C', 1, 'natural', { dir: 'up' }), '34123123', '32143213'],
 [scale('D', 0, 'melodic', { dir: 'up' }), '12312345', '54321321'],
 [scale('G', 1, 'natural', { dir: 'up' }), '34123123', '32132143'],
 [scale('G', 1, 'harmonic', { dir: 'up' }), '34123123', '32143213'],
].forEach(([s, rh, lh]) => {
  check(`fingering ${L.scaleName(s)} RH`, fing(s, 'R') === rh, `got ${fing(s, 'R')}`);
  check(`fingering ${L.scaleName(s)} LH`, fing(s, 'L') === lh, `got ${fing(s, 'L')}`);
});
check('two octaves: right hand crosses with the thumb at the middle tonic', fing(scale('C', 0, 'major', { hands: 'R', octaves: 2, dir: 'up' }), 'R') === '123123412312345');
check('two octaves: F major right hand thumb in the middle, 4 on top', fing(scale('F', 0, 'major', { hands: 'R', octaves: 2, dir: 'up' }), 'R') === '123412312341234');
check('two octaves: left hand repeats from the second note', fing(scale('C', 0, 'major', { hands: 'L', octaves: 2, dir: 'up' }), 'L') === '543213214321321');
check('coming down reverses the fingers', fing(scale('C', 0, 'major'), 'R') === '123123454321321');
check('start and crossings marked, C major RH', acc(scale('C', 0, 'major'), 'R') === '*1 2 3 *1 2 3 4 5 4 3 2 1 *3 2 1', acc(scale('C', 0, 'major'), 'R'));
check('start and crossings marked, C major LH', acc(scale('C', 0, 'major'), 'L') === '*5 4 3 2 1 *3 2 1 2 3 *1 2 3 4 5', acc(scale('C', 0, 'major'), 'L'));
check('melodic minor on a black tonic has no fingering yet', [1, 3, 6, 8, 10].every(pc => {
  const t = [['C', 1], ['E', -1], ['F', 1], ['G', 1], ['B', -1]][[1, 3, 6, 8, 10].indexOf(pc)];
  return L.scaleFingering(scale(t[0], t[1], 'melodic'), 'R') === null && L.scaleFingering(scale(t[0], t[1], 'melodic'), 'L') === null;
}));
let fingered = 0;
const BLACK = [1, 3, 6, 8, 10];
L.LETTERS.forEach(l => [-1, 0, 1].forEach(a => L.SCALE_TYPES.forEach(t => [1, 2].forEach(oct => ['R', 'L'].forEach(h => {
  const s = scale(l, a, t, { hands: h, octaves: oct });
  if (L.validateScale(s).length) return;
  const f = L.scaleFingering(s, h);
  if (!f) return;
  const notes = L.scaleColumns(s).map(c => c[h]);
  const name = `${L.scaleName(s)} ${oct} oct ${h}`;
  check(`one finger per note: ${name}`, f.length === notes.length);
  check(`thumb only on white keys: ${name}`, notes.every((n, i) => f[i].finger !== 1 || !BLACK.includes(n.midi % 12)), acc(s, h));
  check(`no finger twice in a row: ${name}`, f.every((x, i) => i === 0 || x.finger !== f[i - 1].finger), acc(s, h));
  check(`every crossing uses the thumb: ${name}`, f.every((x, i) => i === 0 || !x.accent || x.finger === 1 || f[i - 1].finger === 1), acc(s, h));
  fingered++;
})))));
check('fingering checked on 100+ scales', fingered >= 100, `only ${fingered}`);

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
