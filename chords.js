/* Chord Worksheet: chord model, spelling, notation and parsing.
   No dependencies. Loaded in the browser as window.ChordLib and in Node via require(). */
(function (root) {
'use strict';

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NAT = [0, 2, 4, 5, 7, 9, 11];                       // natural pitch class of each letter
const QUALITIES = ['maj', 'min', 'dim', 'aug', 'sus2', 'sus4', '5'];
const SEVENTHS = ['6', '7', 'maj7', 'dim7'];
const EXTS = [9, 11, 13];
const ALT_KEYS = ['b5', 's5', 'b9', 's9', 's11', 'b13'];
const ALT_TEXT = { b5: '♭5', s5: '♯5', b9: '♭9', s9: '♯9', s11: '♯11', b13: '♭13' };
const ADD_KEYS = ['add9', 'add11', 'sixNine'];
const OMIT_KEYS = ['no3', 'no5'];
const NEEDS_SEVENTH = ['b9', 's9', 's11', 'b13'];
const ACC_GLYPH = { '-2': '𝄫', '-1': '♭', '0': '', '1': '♯', '2': '𝄪' };

const mod = (x, m) => ((x % m) + m) % m;
const wrapAcc = x => mod(x + 6, 12) - 6;                  // -6..5
const letterIndex = l => LETTERS.indexOf(l);
const pcOf = n => mod(NAT[letterIndex(n.letter)] + n.acc, 12);
const noteName = n => n.letter + ACC_GLYPH[n.acc];
const sameNote = (a, b) => !!a && !!b && a.letter === b.letter && a.acc === b.acc;

function emptyChord(rootNote) {
  return {
    root: { letter: rootNote.letter, acc: rootNote.acc || 0 },
    quality: 'maj', seventh: null, ext: null,
    alt: { b5: false, s5: false, b9: false, s9: false, s11: false, b13: false },
    alt7: false,
    add: { add9: false, add11: false, sixNine: false },
    omit: { no3: false, no5: false },
    bass: null
  };
}
function cleanNote(n) {
  if (!n || typeof n !== 'object' || letterIndex(n.letter) < 0) return null;
  const acc = Number.isInteger(n.acc) && n.acc >= -2 && n.acc <= 2 ? n.acc : 0;
  return { letter: n.letter, acc };
}

// Canonical form: every field present, implied choices filled in.
function normalize(c) {
  const root = cleanNote(c && c.root);
  if (!root) return null;
  const n = emptyChord(root);
  if (QUALITIES.includes(c.quality)) n.quality = c.quality;
  if (SEVENTHS.includes(c.seventh)) n.seventh = c.seventh;
  if (EXTS.includes(c.ext)) n.ext = c.ext;
  ALT_KEYS.forEach(k => { n.alt[k] = !!(c.alt && c.alt[k]); });
  n.alt7 = !!c.alt7;
  ADD_KEYS.forEach(k => { n.add[k] = !!(c.add && c.add[k]); });
  OMIT_KEYS.forEach(k => { n.omit[k] = !!(c.omit && c.omit[k]); });
  n.bass = cleanNote(c.bass);
  if (n.bass && sameNote(n.bass, n.root)) n.bass = null;
  if ((n.ext || n.alt7) && !n.seventh) n.seventh = '7';     // 9, 11, 13 and alt imply the 7th
  if (n.add.sixNine && n.seventh === '6') n.seventh = null;  // 6/9 replaces the plain 6
  if (n.quality === 'min' && n.alt.b5) { n.quality = 'dim'; n.alt.b5 = false; } // m♭5 is diminished
  return n;
}

// Reasons a chord can't be built. Empty list means valid.
function validate(c) {
  const E = [];
  const q = c.quality, sv = c.seventh, x = c.ext, a = c.alt, ad = c.add, o = c.omit;
  const anyAlt = ALT_KEYS.some(k => a[k]);
  if (q === '5' && (sv || x || anyAlt || c.alt7 || ad.add9 || ad.add11 || ad.sixNine || o.no3 || o.no5)) E.push('Power chords are only the root and 5th.');
  if (sv === 'dim7' && q !== 'dim') E.push('dim7 needs the dim quality.');
  if (q === 'dim' && sv === '6') E.push('Use dim7 instead of dim with a 6.');
  if (q === 'dim' && sv === 'maj7') E.push('Diminished with a major 7th isn’t offered.');
  if (q === 'aug' && sv === '6') E.push('Augmented with a 6 isn’t offered.');
  if (x && sv === '6') E.push('A 6 chord can’t take 9, 11 or 13. Use 6/9.');
  if (x && sv === 'dim7') E.push('dim7 chords don’t take 9, 11 or 13 here.');
  if (x === 11 && q === 'sus4') E.push('sus4 already has the 4th (the 11th).');
  if (x && q === 'sus2') E.push('sus2 already has the 2nd (the 9th).');
  if (q === 'dim' && (a.b5 || a.s5)) E.push('Diminished already has a ♭5.');
  if (q === 'aug' && (a.b5 || a.s5)) E.push('Augmented already has a ♯5.');
  if (a.s5 && a.b13) E.push('♯5 and ♭13 are the same note.');
  if (NEEDS_SEVENTH.some(k => a[k]) && (!sv || sv === '6')) E.push('Add a 7th first.');
  if ((a.b9 || a.s9) && x === 9) E.push('Use 7 (not 9) with ♭9 or ♯9.');
  if (a.s11 && x === 11) E.push('Use 9 with ♯11 (not 11).');
  if (a.b13 && x === 13) E.push('13 and ♭13 can’t be combined.');
  if (c.alt7) {
    if (q !== 'maj' || sv !== '7') E.push('7alt is a dominant 7th: major quality with 7.');
    if (x) E.push('7alt already covers the 9th and 13th.');
    if (anyAlt) E.push('7alt already includes the altered notes.');
    if (ad.add9 || ad.add11 || ad.sixNine) E.push('7alt can’t take added notes.');
  }
  if (ad.add9) {
    if (sv === '6') E.push('Use 6/9 for a 6 chord with a 9th.');
    else if (sv) E.push('Use the 9 extension on a 7th chord.');
    if (ad.sixNine) E.push('6/9 already has the 9th.');
    if (q === 'sus2') E.push('sus2 already has the 2nd (the 9th).');
  }
  if (ad.add11) {
    if (x === 11 || x === 13) E.push('This chord already covers the 11th.');
    if (q === 'sus4') E.push('sus4 already has the 4th (the 11th).');
    if (a.s11) E.push('Can’t have both 11 and ♯11.');
  }
  if (ad.sixNine) {
    if (q !== 'maj' && q !== 'min') E.push('6/9 needs a major or minor chord.');
    if (sv) E.push('6/9 replaces the 6 or 7.');
    if (x) E.push('6/9 can’t take 9, 11 or 13.');
  }
  if (o.no3) {
    if (q === 'sus2' || q === 'sus4') E.push('Sus chords have no 3rd.');
    if (x === 11 && (q === 'maj' || q === 'aug')) E.push('11 chords already leave out the 3rd.');
  }
  if (o.no5) {
    if (a.b5 || a.s5) E.push('The ♭5 or ♯5 already replaces the 5th.');
    if (c.alt7) E.push('7alt already leaves out the 5th.');
  }
  return [...new Set(E)];
}

// Chord tones as scale degrees. src 'alt' marks tones from alterations or augmentation.
function tones(chord) {
  const c = normalize(chord);
  let t = [];
  const add = (deg, semis, src = 'base') => t.push({ deg, semis, src });
  const drop = pred => { t = t.filter(x => !pred(x)); };
  const q = c.quality;
  add(1, 0);
  if (q === 'maj' || q === 'aug') add(3, 4);
  if (q === 'min' || q === 'dim') add(3, 3);
  if (q === 'sus2') add(2, 2);
  if (q === 'sus4') add(4, 5);
  if (q === 'dim') add(5, 6); else if (q === 'aug') add(5, 8, 'alt'); else add(5, 7);
  if (c.seventh === '6') add(6, 9);
  if (c.seventh === '7') add(7, 10);
  if (c.seventh === 'maj7') add(7, 11);
  if (c.seventh === 'dim7') add(7, 9);
  if (c.add.sixNine) { add(6, 9); add(9, 14); }
  if (c.ext) add(9, 14);
  if (c.ext === 11) { add(11, 17); if (q === 'maj' || q === 'aug') drop(x => x.deg === 3); }
  if (c.ext === 13) add(13, 21);                            // the 11th is left out of 13 chords
  if (c.alt7) { drop(x => x.deg === 5); add(9, 13, 'alt'); add(9, 15, 'alt'); add(13, 20, 'alt'); }
  const a = c.alt;
  if (a.b5 || a.s5) drop(x => x.deg === 5);
  if (a.b5) add(5, 6, 'alt');
  if (a.s5) add(5, 8, 'alt');
  if (a.b9 || a.s9) drop(x => x.deg === 9 && x.src === 'base');
  if (a.b9) add(9, 13, 'alt');
  if (a.s9) add(9, 15, 'alt');
  if (a.s11) { drop(x => x.deg === 11); add(11, 18, 'alt'); }
  if (a.b13) { drop(x => x.deg === 13); add(13, 20, 'alt'); }
  if (c.add.add9) add(9, 14);
  if (c.add.add11) add(11, 17);
  if (c.omit.no3) drop(x => x.deg === 3);
  if (c.omit.no5) drop(x => x.deg === 5);
  return t.sort((x, y) => x.semis - y.semis);
}

// Pick the nearest letter that names this pitch class with at most one accidental, preferring naturals.
function respell(pc, li) {
  const cands = [li - 1, li + 1, li].map(l => mod(l, 7)).map(l => ({ l, acc: wrapAcc(pc - NAT[l]) }))
    .filter(x => Math.abs(x.acc) <= 1).sort((x, y) => Math.abs(x.acc) - Math.abs(y.acc));
  const b = cands[0] || { l: li, acc: wrapAcc(pc - NAT[li]) };
  return { letter: LETTERS[b.l], acc: b.acc };
}
function spellNote(n, mode, fromAlt) {
  const li = letterIndex(n.letter);
  if (Math.abs(n.acc) > 2) return respell(mod(NAT[li] + n.acc, 12), li);
  if (mode !== 'strict') {
    if (Math.abs(n.acc) === 2) return respell(mod(NAT[li] + n.acc, 12), li);
    // E♯ B♯ F♭ C♭ become F C E B, but only for altered or augmented tones.
    if (fromAlt && n.acc !== 0 && NAT[mod(li + (n.acc > 0 ? 1 : -1), 7)] === mod(NAT[li] + n.acc, 12)) {
      return { letter: LETTERS[mod(li + (n.acc > 0 ? 1 : -1), 7)], acc: 0 };
    }
  }
  return { letter: n.letter, acc: n.acc };
}

// Spelled chord tones in ascending order, plus the bass note for slash chords.
function spell(chord, mode = 'plain') {
  const c = normalize(chord);
  if (!c) return null;
  const rli = letterIndex(c.root.letter), rpc = pcOf(c.root);
  const notes = tones(c).map(t => {
    const li = mod(rli + t.deg - 1, 7);
    const raw = { letter: LETTERS[li], acc: wrapAcc(rpc + t.semis - NAT[li]) };
    const n = t.deg === 1 ? { letter: c.root.letter, acc: c.root.acc } : spellNote(raw, mode, t.src === 'alt');
    return { letter: n.letter, acc: n.acc, pc: pcOf(n), name: noteName(n), deg: t.deg, semis: t.semis };
  });
  let bass = null;
  if (c.bass) { const b = spellNote(c.bass, mode, false); bass = { letter: b.letter, acc: b.acc, pc: pcOf(b), name: noteName(b) }; }
  return { notes, bass };
}

/* ---------- Notation ----------
   Alteration rule: parenthesize when there is more than one alteration, when a ♯ would follow a digit,
   or when the alteration would follow the root name directly. */
function render(chord, style = 'standard') {
  const c = normalize(chord);
  if (!c) return '';
  const J = style === 'jazz';
  const sv = c.seventh, q = c.quality;
  const num = c.ext ? String(c.ext) : (sv === '7' || sv === 'maj7' || sv === 'dim7') ? '7' : '';
  const MAJ = J ? '∆' : 'maj', MIN = J ? '–' : 'm';
  const sevPart = () => sv === 'maj7' ? MAJ + num : sv === '7' ? num : sv === '6' ? '6' : '';
  const alts = [];
  let base = '';
  if (q === 'maj') base = c.add.sixNine ? '6/9' : sevPart();
  else if (q === 'min') base = MIN + (c.add.sixNine ? '6/9' : sv === 'maj7' ? '(' + MAJ + num + ')' : sevPart());
  else if (q === 'dim') {
    if (sv === 'dim7') base = J ? '°7' : 'dim7';
    else if (sv === '7') { if (J) base = 'ø' + num; else { base = 'm' + num; alts.push('♭5'); } }
    else base = J ? '°' : 'dim';
  }
  else if (q === 'aug') base = (J ? '+' : 'aug') + (sv === 'maj7' ? '(' + MAJ + num + ')' : sevPart());
  else if (q === 'sus2' || q === 'sus4') base = sevPart() + q;
  else if (q === '5') base = '5';
  if (c.alt7) base += 'alt';
  ALT_KEYS.forEach(k => { if (c.alt[k]) alts.push(ALT_TEXT[k]); });
  let s = noteName(c.root) + base;
  if (alts.length) {
    const paren = alts.length > 1 || base === '' || (alts[0][0] === '♯' && /\d$/.test(s));
    s += paren ? '(' + alts.join(',') + ')' : alts[0];
  }
  if (c.add.add9) s += 'add9';
  if (c.add.add11) s += 'add11';
  if (c.omit.no3) s += '(no3)';
  if (c.omit.no5) s += '(no5)';
  if (c.bass) s += '/' + noteName(c.bass);
  return s;
}

/* ---------- Parsing (best effort) ---------- */
const NOTE_RE = /^([A-Ga-g])(bb|𝄫|##|𝄪|b|♭|#|♯)?/;
const ACC_OF = { bb: -2, '𝄫': -2, '##': 2, '𝄪': 2, b: -1, '♭': -1, '#': 1, '♯': 1 };
function readNote(str) {
  const m = NOTE_RE.exec(str);
  if (!m) return null;
  return { note: { letter: m[1].toUpperCase(), acc: m[2] ? ACC_OF[m[2]] : 0 }, len: m[0].length };
}
function parse(input) {
  if (typeof input !== 'string') return null;
  let str = input.trim().replace(/\s+/g, '');
  if (!str) return null;
  const r = readNote(str);
  if (!r) return null;
  const c = emptyChord(r.note);
  let rest = str.slice(r.len);
  const bm = /\/([A-Ga-g](?:bb|𝄫|##|𝄪|b|♭|#|♯)?)$/.exec(rest);
  if (bm) { c.bass = readNote(bm[1]).note; rest = rest.slice(0, bm.index); }
  let s = rest.replace(/♭/g, 'b').replace(/♯/g, '#').replace(/[∆Δ△^]/g, 'maj').replace(/[–−—]/g, '-').replace(/[(),]/g, '');
  let halfDim = false;
  // Quality prefix
  let m;
  if (s === '5') { c.quality = '5'; s = ''; }
  else if ((m = /^ø/.exec(s))) { c.quality = 'dim'; halfDim = true; s = s.slice(1); if (!/^\d/.test(s)) c.seventh = '7'; }
  else if ((m = /^(dim7|°7|o7)/.exec(s))) { c.quality = 'dim'; c.seventh = 'dim7'; s = s.slice(m[0].length); }
  else if ((m = /^(dim|°|o(?!m))/.exec(s))) { c.quality = 'dim'; s = s.slice(m[0].length); }
  else if ((m = /^(aug|\+)/.exec(s))) { c.quality = 'aug'; s = s.slice(m[0].length); }
  else if ((m = /^(min|mi|m(?!aj)|-)/.exec(s))) { c.quality = 'min'; s = s.slice(m[0].length); }
  else if (s === 'M') s = '';
  const set = (obj, k) => { if (obj[k]) return false; obj[k] = true; return true; };
  while (s.length) {
    if ((m = /^(?:maj|M)(7|9|11|13)?/.exec(s))) {
      if (c.seventh) return null;
      c.seventh = 'maj7'; if (m[1] && m[1] !== '7') c.ext = +m[1];
    } else if ((m = /^6\/?9/.exec(s))) { if (!set(c.add, 'sixNine')) return null; }
    else if ((m = /^add(2|9|4|11)/.exec(s))) { if (!set(c.add, m[1] === '2' || m[1] === '9' ? 'add9' : 'add11')) return null; }
    else if ((m = /^alt/.exec(s))) { c.alt7 = true; }
    else if ((m = /^sus(2|4)?/.exec(s))) { if (c.quality !== 'maj') return null; c.quality = m[1] === '2' ? 'sus2' : 'sus4'; }
    else if ((m = /^(?:no|omit)(3|5)/.exec(s))) { if (!set(c.omit, 'no' + m[1])) return null; }
    else if ((m = /^([b#+-])(5|9|11|13)/.exec(s))) {
      const k = (m[1] === 'b' || m[1] === '-' ? 'b' : 's') + m[2];
      if (!ALT_KEYS.includes(k) || !set(c.alt, k)) return null;
    } else if ((m = /^(13|11|9|7|6)/.exec(s))) {
      const v = +m[1];
      if (v === 6) { if (c.seventh) return null; c.seventh = '6'; }
      else if (v === 7) { if (c.seventh && !(halfDim && c.seventh === '7')) return null; c.seventh = '7'; }
      else { if (c.ext) return null; if (!c.seventh) c.seventh = '7'; c.ext = v; }
    } else return null;
    s = s.slice(m[0].length);
  }
  const n = normalize(c);
  if (!n || validate(n).length) return null;
  return n;
}

// Restore a saved chord, or null if it isn't a usable chord.
function sanitize(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const n = normalize(raw);
  if (!n || validate(n).length) return null;
  return n;
}

// Builder support: apply one control tap, and explain why a tap isn't allowed.
function apply(chord, group, value) {
  const n = JSON.parse(JSON.stringify(normalize(chord)));
  switch (group) {
    case 'root': n.root = { letter: value, acc: 0 }; break;
    case 'rootAcc': n.root.acc = value; break;
    case 'quality': n.quality = value; break;
    case 'seventh':
      n.seventh = value;
      if (!value) { n.ext = null; n.alt7 = false; NEEDS_SEVENTH.forEach(k => { n.alt[k] = false; }); }
      else n.add.sixNine = false;
      break;
    case 'ext': n.ext = n.ext === value ? null : value; break;
    case 'alt': if (value === 'alt7') n.alt7 = !n.alt7; else n.alt[value] = !n.alt[value]; break;
    case 'add':
      n.add[value] = !n.add[value];
      if (value === 'sixNine' && n.add.sixNine && n.seventh === '6') n.seventh = null;
      break;
    case 'omit': n.omit[value] = !n.omit[value]; break;
    case 'bass': n.bass = value ? { letter: value, acc: 0 } : null; break;
    case 'bassAcc': if (n.bass) n.bass.acc = value; break;
  }
  return normalize(n);
}
function optionReason(chord, group, value) {
  if (!chord) return group === 'root' ? null : 'Pick a root note first.';
  if (group === 'bassAcc' && !chord.bass) return 'Pick a bass note first.';
  const errs = validate(apply(chord, group, value));
  return errs[0] || null;
}
function isOn(chord, group, value) {
  const c = chord;
  if (!c) return false;
  switch (group) {
    case 'root': return c.root.letter === value;
    case 'rootAcc': return c.root.acc === value;
    case 'quality': return c.quality === value;
    case 'seventh': return c.seventh === value;
    case 'ext': return c.ext === value;
    case 'alt': return value === 'alt7' ? c.alt7 : !!c.alt[value];
    case 'add': return !!c.add[value];
    case 'omit': return !!c.omit[value];
    case 'bass': return value ? !!c.bass && c.bass.letter === value : !c.bass;
    case 'bassAcc': return !!c.bass && c.bass.acc === value;
  }
  return false;
}

// Simple close voicing: right hand plays every chord tone in root position within one octave,
// with the root between G3 and F♯4 so the chord sits around middle C. A slash bass goes in the
// left hand, in the octave below the root.
function closeVoicing(chord) {
  const c = normalize(chord);
  if (!c) return [];
  const rpc = pcOf(c.root);
  const rootMidi = 55 + mod(rpc - 7, 12);                   // G3 (55) .. F♯4 (66)
  const pcs = [...new Set(tones(c).map(t => mod(t.semis, 12)))].sort((a, b) => a - b);
  const out = pcs.map(p => ({ midi: rootMidi + p, hand: 'R' }));
  if (c.bass) {
    let b = rootMidi - 12 + mod(pcOf(c.bass) - rpc, 12);
    if (b >= rootMidi) b -= 12;
    out.unshift({ midi: b, hand: 'L' });
  }
  return out;
}

/* ---------- Transposition ----------
   A note moves by a number of semitones and a number of letter steps, like an interval, so a
   progression keeps its spelling relationships (E♭ A♭ B♭7 up a major 2nd is F B♭ C7). */
function transposeNote(n, semis, steps) {
  const li = mod(letterIndex(n.letter) + steps, 7);
  const pc = mod(pcOf(n) + semis, 12);
  const acc = wrapAcc(pc - NAT[li]);
  return Math.abs(acc) > 1 ? respell(pc, li) : { letter: LETTERS[li], acc };
}
// Pick the letter shift that spells these notes most simply after moving them: fewest accidentals,
// no E♯ B♯ F♭ C♭ or double accidentals if it can be helped, flats on a tie (D♭ rather than C♯).
function letterShift(notes, semis) {
  let best = null;
  for (let steps = 0; steps < 7; steps++) {
    let cost = 0, sum = 0;
    notes.forEach(n => {
      const li = mod(letterIndex(n.letter) + steps, 7);
      const acc = wrapAcc(mod(pcOf(n) + semis, 12) - NAT[li]);
      const odd = acc !== 0 && NAT[mod(li + Math.sign(acc), 7)] === mod(NAT[li] + acc, 12);
      cost += Math.abs(acc) > 1 ? 10 : Math.abs(acc) + (odd ? 3 : 0);
      sum += acc;
    });
    // With no notes to go on, use the plain interval: the letter step nearest the semitone count.
    const near = Math.abs(NAT[steps] - mod(semis, 12));
    const score = [cost, sum, near];
    const i = best ? score.findIndex((v, k) => v !== best.score[k]) : -1;
    if (!best || (i >= 0 && score[i] < best.score[i])) best = { steps, score };
  }
  return best.steps;
}
function transposeChord(chord, semis, steps) {
  const c = normalize(chord);
  if (!c) return null;
  c.root = transposeNote(c.root, semis, steps);
  if (c.bass) c.bass = transposeNote(c.bass, semis, steps);
  return normalize(c);
}
// Free-text labels that read as chord symbols: the root and slash bass, with where they sit in the text.
const LABEL_BASS_RE = /\/\s*([A-Ga-g](?:bb|𝄫|##|𝄪|b|♭|#|♯)?)\s*$/;
function labelNotes(label) {
  if (typeof label !== 'string' || !parse(label)) return null;
  const lead = label.length - label.trimStart().length;
  const r = readNote(label.slice(lead));
  const out = [{ note: r.note, at: lead, len: r.len }];
  const bm = LABEL_BASS_RE.exec(label);
  if (bm) {
    const at = bm.index + bm[0].indexOf(bm[1]);
    if (at > lead) out.push({ note: readNote(bm[1]).note, at, len: bm[1].length });
  }
  return out;
}
// Transpose the note names in a label, keeping the rest of the text and its ♭/b style. Null if it isn't a chord.
function transposeLabel(label, semis, steps) {
  const parts = labelNotes(label);
  if (!parts) return null;
  const ascii = /[A-Ga-g](?:b|#)/.test(label) && !/[♭♯𝄫𝄪]/.test(label);
  const name = n => n.letter + (ascii ? { '-2': 'bb', '-1': 'b', '0': '', '1': '#', '2': '##' }[n.acc] : ACC_GLYPH[n.acc]);
  let s = label;
  parts.slice().reverse().forEach(p => {
    s = s.slice(0, p.at) + name(transposeNote(p.note, semis, steps)) + s.slice(p.at + p.len);
  });
  return s;
}

const ChordLib = {
  LETTERS, NAT, QUALITIES, SEVENTHS, EXTS, ALT_KEYS, ALT_TEXT, ADD_KEYS, OMIT_KEYS,
  emptyChord, normalize, validate, tones, spell, render, parse, sanitize, apply, optionReason, isOn, closeVoicing,
  transposeNote, letterShift, transposeChord, labelNotes, transposeLabel,
  noteName, pcOf
};
root.ChordLib = ChordLib;
if (typeof module !== 'undefined' && module.exports) module.exports = ChordLib;
})(typeof window !== 'undefined' ? window : globalThis);
