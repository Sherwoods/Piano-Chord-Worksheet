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

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
