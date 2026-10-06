/* Chord Worksheet: grand staff drawing. No dependencies. Loaded in the browser as window.StaffLib
   and in Node via require().

   The clef, notehead, accidental and brace outlines come from the Bravura music font,
   Copyright (c) Steinberg Media Technologies GmbH, licensed under the SIL Open Font License 1.1
   (see LICENSE-music-glyphs.txt). Units: 1000 per em, 250 per staff space, y pointing up. */
(function (root) {
'use strict';

const GLYPHS = {
  gClef: { w: 671, d: 'M376 415C374 427 376 428 382 434C398 449 419 470 438 491C522 583 572 702 572 815C572 902 548 988 507 1048C492 1070 466 1098 455 1098C441 1098 410 1072 390 1050C316 968 292 843 292 739C292 681 299 616 306 575C308 563 309 561 297 551C233 498 164 437 112 373C43 287 0 194 0 87C0 -87 119 -252 364 -252C387 -252 413 -250 433 -246C444 -244 446 -243 448 -255C460 -322 475 -409 475 -456C475 -604 375 -622 316 -622C262 -622 236 -606 236 -593C236 -586 245 -583 268 -576C299 -567 335 -540 335 -482C335 -427 300 -380 239 -380C172 -380 132 -433 132 -495C132 -560 171 -658 322 -658C389 -658 519 -628 519 -458C519 -401 501 -306 490 -244C488 -232 489 -233 503 -227C604 -187 671 -102 671 11C671 139 577 252 430 252C404 252 404 252 401 270ZM470 943C503 943 530 916 530 861C530 792 497 728 419 650C403 634 379 611 356 591C349 585 345 586 343 599C339 625 337 659 337 691C337 847 409 943 470 943ZM361 262C364 243 364 244 346 238C258 208 201 129 201 44C201 -46 248 -110 316 -133C324 -136 336 -139 343 -139C351 -139 355 -134 355 -128C355 -121 347 -118 340 -115C298 -97 268 -54 268 -8C268 49 307 92 368 109C384 113 386 112 388 101L438 -197C440 -208 439 -208 424 -211C408 -214 388 -216 368 -216C193 -216 80 -119 80 20C80 79 90 158 173 252C233 319 279 356 326 394C336 402 338 401 340 390ZM430 103C428 115 429 118 441 117C522 110 589 42 589 -46C589 -109 551 -160 495 -188C483 -194 481 -194 479 -182Z' },
  fClef: { w: 684, d: 'M252 262C78 262 0 135 0 39C0 -41 42 -110 123 -110C186 -110 229 -66 229 -4C229 60 182 100 133 100C106 100 96 93 83 93C70 93 67 101 67 111C67 151 127 224 229 224C335 224 381 120 381 -37C381 -140 359 -260 297 -356C237 -449 134 -534 10 -605C1 -610 -5 -615 -5 -623C-5 -629 -1 -635 8 -635C13 -635 19 -633 25 -630C158 -565 286 -489 392 -375C479 -281 531 -159 531 -28C531 146 425 262 252 262ZM629 180C598 180 574 156 574 125C574 94 598 70 629 70C660 70 684 94 684 125C684 156 660 180 629 180ZM630 -71C599 -71 576 -94 576 -125C576 -156 599 -179 630 -179C661 -179 684 -156 684 -125C684 -94 661 -71 630 -71Z' },
  noteheadBlack: { w: 295, d: 'M97 -125C186 -125 295 -43 295 42C295 93 255 125 198 125C88 125 0 44 0 -42C0 -94 43 -125 97 -125Z' },
  sharp: { w: 249, d: 'M237 118C244 121 249 129 249 135V206C249 211 246 214 242 214C240 214 239 214 237 213C237 213 217 205 212 204C205 204 198 209 198 217V339C198 345 192 350 184 350C174 350 168 345 168 339V209C167 199 164 186 155 180C143 173 109 159 92 155C83 155 80 167 80 175V295C80 301 73 306 66 306C56 306 50 301 50 295V160C50 146 44 136 38 133C32 130 12 122 12 122C5 120 0 112 0 106V35C0 29 3 26 8 26C9 26 11 27 12 27C12 27 27 33 34 37C35 37 36 38 37 38C44 38 50 28 50 20V-79C50 -90 45 -99 39 -102C33 -104 12 -113 12 -113C5 -115 0 -123 0 -129V-200C0 -206 3 -209 8 -209C9 -209 11 -208 12 -208C12 -208 26 -202 35 -199C36 -198 37 -198 38 -198C45 -198 50 -209 50 -214V-337C50 -343 56 -348 63 -348C73 -348 80 -343 80 -337V-198C80 -185 85 -178 90 -176L151 -151C152 -151 154 -150 155 -150C163 -150 168 -162 168 -168V-293C168 -299 174 -304 181 -304C192 -304 198 -299 198 -293V-151C198 -143 202 -131 209 -128C216 -125 237 -117 237 -117C244 -114 249 -106 249 -100V-29C249 -24 246 -21 242 -21C240 -21 239 -21 237 -22L211 -32C205 -32 198 -26 198 -14V79C198 86 203 105 211 108ZM168 -45C162 -65 115 -85 92 -85C86 -85 81 -83 80 -80C78 -76 77 -54 77 -30C77 1 78 36 80 44C82 61 128 82 153 82C160 82 166 80 168 76C170 71 172 46 172 19C172 -8 170 -36 168 -45Z' },
  flat: { w: 226, d: 'M12 -170C15 -174 18 -175 21 -175C24 -175 27 -173 27 -173C57 -156 81 -129 106 -112C195 -50 226 11 226 57C226 114 182 150 136 153C129 153 122 152 115 150C104 147 92 143 81 136C75 131 64 122 59 122C57 122 56 122 54 123C47 126 43 133 43 140C44 162 50 402 50 422C50 433 41 439 31 439C17 439 1 429 0 411C0 411 4 -160 12 -170ZM47 -81C47 -81 44 -21 44 19C44 35 45 47 46 51C50 63 76 85 90 93C99 98 108 100 116 100C126 100 135 96 141 89C151 78 157 61 157 42C157 24 152 3 140 -18C127 -42 98 -74 68 -93C64 -95 61 -96 58 -96C49 -96 47 -86 47 -81Z' },
  natural: { w: 168, d: 'M141 181C139 181 138 180 137 180C137 180 73 157 47 157C41 157 37 158 37 162V329C37 336 31 341 25 341H12C5 341 0 336 0 329V-186C0 -192 3 -195 8 -195C9 -195 11 -194 12 -194C12 -194 14 -194 15 -193C29 -187 85 -163 114 -163C124 -163 131 -166 131 -174V-323C131 -330 136 -335 143 -335H156C162 -335 168 -330 168 -323V179C168 184 164 187 160 187C159 187 157 187 156 186ZM37 39C37 53 98 79 122 79C128 79 131 78 131 74V-29C131 -47 74 -70 49 -70C42 -70 37 -68 37 -64Z' },
  doubleSharp: { w: 250, d: 'M190 -32C179 -26 143 -6 143 1C143 15 176 30 190 35C194 35 198 34 202 34C218 34 233 38 240 44C245 49 247 64 247 80C247 97 244 115 240 120C236 125 220 127 203 127C185 127 167 125 162 120C158 117 157 99 157 81C152 70 136 34 124 34C110 34 94 67 90 81C90 98 87 116 82 120C78 125 62 127 46 127C29 127 11 125 5 120C2 118 0 101 0 83C0 65 2 47 5 44C12 38 30 34 47 34C51 34 54 35 57 35C68 29 104 9 104 2C104 -11 72 -27 58 -32H48C30 -32 11 -34 5 -39C2 -42 0 -59 0 -77C0 -95 2 -113 5 -115C12 -121 28 -125 45 -125C60 -125 76 -122 82 -115C88 -110 90 -93 90 -77C90 -76 91 -74 92 -73C98 -59 110 -31 123 -31C136 -31 153 -63 157 -77C157 -95 158 -112 162 -115C169 -121 185 -125 202 -125C218 -125 233 -122 240 -115C245 -110 247 -95 247 -79C247 -62 244 -44 240 -39C235 -34 217 -32 200 -32Z' },
  doubleFlat: { w: 413, d: 'M314 151C309 151 305 151 300 150C288 147 277 141 267 135C260 131 252 122 243 122C241 122 239 122 238 123C231 125 228 132 228 140C228 161 234 402 234 421C234 432 225 437 215 437C202 437 186 428 184 411C184 411 185 274 187 135C172 145 155 151 136 151H130C125 151 120 151 116 150C104 147 93 141 83 135C75 131 68 122 59 122C57 122 56 122 54 123C47 125 43 132 43 140C43 161 50 402 50 421C50 432 41 437 31 437C17 437 1 428 0 411C0 411 5 -161 12 -170C15 -174 18 -175 21 -175C24 -175 27 -173 27 -173C58 -157 83 -129 106 -112C143 -86 171 -59 190 -35C192 -110 194 -167 197 -170C200 -174 203 -175 205 -175C208 -175 211 -173 211 -173C242 -157 266 -129 289 -113C379 -50 411 11 411 57C411 113 367 150 320 151ZM141 -18C128 -42 99 -73 67 -93C64 -95 60 -96 58 -96C50 -96 47 -86 47 -80C47 -80 44 -21 44 18C44 34 45 46 46 50C50 63 77 85 91 93C100 98 109 100 117 100C127 100 135 97 141 90C151 78 157 61 157 41C157 23 152 2 141 -18ZM324 -18C312 -42 283 -73 251 -93C247 -95 244 -96 242 -96C234 -96 231 -86 231 -80C231 -80 228 -11 228 27C228 38 228 47 229 50C233 63 260 85 275 93C284 98 293 100 301 100C311 100 319 97 325 90C334 78 340 61 340 41C340 23 335 3 324 -18Z' },
  brace: { w: 70, d: 'M0 500C24 463 37 435 37 397C37 330 2 251 2 175C2 121 20 48 61 1C64 -3 71 1 69 6C45 45 37 91 37 131C37 212 69 285 69 354C69 404 56 452 16 500C55 547 69 595 69 645C69 714 37 788 37 868C37 909 44 954 68 993C71 999 63 1003 60 999C19 951 2 879 2 824C2 748 37 669 37 602C37 564 24 537 0 500Z' }
};

const S = 6;                                   // staff space in px
const U = S / 250;                             // font unit → px
const INK = '#1E2433';
// Vertical layout: treble staff, room for middle C ledger lines, bass staff.
const TREBLE_TOP = 4 * S, TREBLE_BOTTOM = TREBLE_TOP + 4 * S;
const BASS_TOP = TREBLE_BOTTOM + 5 * S, BASS_BOTTOM = BASS_TOP + 4 * S;
const HEIGHT = BASS_BOTTOM + 4 * S;
const LETTER_INDEX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
// Right hand reads the treble staff, left hand the bass. ref: the step of the bottom line; mid: the middle line.
const STAFF = { R: { bottom: TREBLE_BOTTOM, ref: 30, mid: 34 }, L: { bottom: BASS_BOTTOM, ref: 18, mid: 22 } };
const stepOf = n => n.octave * 7 + LETTER_INDEX[n.letter];
const yOf = (h, step) => STAFF[h].bottom - (step - STAFF[h].ref) * S / 2;
const ACC_GLYPH = { '2': 'doubleSharp', '1': 'sharp', '0': 'natural', '-1': 'flat', '-2': 'doubleFlat' };
const HEAD_W = GLYPHS.noteheadBlack.w * U;
// Key signature: the step of each sharp or flat, treble staff; the bass staff is two octaves lower.
const SHARP_STEPS = [38, 35, 39, 36, 33, 37, 34], FLAT_STEPS = [34, 37, 33, 36, 32, 35, 31];
const r1 = v => Math.round(v * 10) / 10;

const glyph = (name, x, y) => `<path d="${GLYPHS[name].d}" transform="translate(${r1(x)} ${r1(y)}) scale(${U} ${-U})"/>`;
const line = (x1, y1, x2, y2, w) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${INK}" stroke-width="${w}"/>`;

function keySignatureMap(sig) {
  const map = { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 };
  'FCGDAEB'.slice(0, Math.max(sig, 0)).split('').forEach(l => { map[l] = 1; });
  'BEADGCF'.slice(0, Math.max(-sig, 0)).split('').forEach(l => { map[l] = -1; });
  return map;
}

// Which notes need an accidental printed. An accidental lasts for the rest of the line on that staff
// position (there are no bar lines), so a note that goes back to the key signature gets one too.
// columns: [{ R: [notes], L: [notes] }]; returns the same shape with true/false per note.
function shownAccidentals(columns, sig) {
  const key = keySignatureMap(sig);
  const state = { R: {}, L: {} };
  return columns.map(col => {
    const out = {};
    ['R', 'L'].forEach(h => {
      out[h] = (col[h] || []).map(n => {
        const k = n.letter + n.octave;
        const now = k in state[h] ? state[h][k] : key[n.letter];
        state[h][k] = n.acc;
        return n.acc !== now;
      });
    });
    return out;
  });
}

// One staff's notes in one column: noteheads (seconds set beside each other), stem, ledger lines, accidentals.
function drawColumn(h, notes, shows, x, stem) {
  const st = STAFF[h];
  const items = notes.map((n, i) => ({ n, step: stepOf(n), show: shows[i] })).sort((a, b) => a.step - b.step);
  if (!items.length) return '';
  const lo = items[0].step, hi = items[items.length - 1].step;
  const down = hi - st.mid > st.mid - lo || (lo === hi && lo >= st.mid);
  // A note a step from its neighbour goes on the other side of the stem.
  const order = down ? items.slice().reverse() : items;
  let prev = null;
  order.forEach(it => {
    it.side = prev && Math.abs(it.step - prev.step) === 1 && !prev.side ? (down ? -1 : 1) : 0;
    prev = it;
  });
  let out = '';
  const xs = items.map(it => x + it.side * (HEAD_W - 0.6));
  const left = Math.min(...xs), right = Math.max(...xs) + HEAD_W;
  // Ledger lines above and below the staff.
  const ledger = s => { out += line(left - 0.4 * S, yOf(h, s), right + 0.4 * S, yOf(h, s), 0.9); };
  for (let s = st.ref + 10; s <= hi; s += 2) ledger(s);
  for (let s = st.ref - 2; s >= lo; s -= 2) ledger(s);
  items.forEach((it, i) => { out += glyph('noteheadBlack', xs[i], yOf(h, it.step)); });
  if (stem) {
    const sx = down ? x + 0.6 : x + HEAD_W - 0.6;
    out += down ? line(sx, yOf(h, hi), sx, yOf(h, lo) + 3.5 * S, 1)
                : line(sx, yOf(h, lo), sx, yOf(h, hi) - 3.5 * S, 1);
  }
  // Accidentals, top down, each in the first column to the left where it doesn't clash.
  const cols = [];
  items.slice().reverse().filter(it => it.show).forEach(it => {
    let c = cols.findIndex(col => col.every(s => Math.abs(s - it.step) >= 6));
    if (c < 0) { cols.push([]); c = cols.length - 1; }
    cols[c].push(it.step);
    const g = ACC_GLYPH[it.n.acc];
    out += glyph(g, left - 0.25 * S - (c + 1) * 1.2 * S - (GLYPHS[g].w * U - S), yOf(h, it.step));
  });
  return out;
}

/* A grand staff.
   width: px; columns: [{ R: [notes], L: [notes] }] played left to right, notes as { letter, acc, octave };
   sig: sharps (+) or flats (−) in the key signature; final: end with a final bar line.
   Everything but the clefs, staff lines and key signature is grouped in .staff-notes so it can be hidden. */
function grandStaff({ width, columns, sig = 0, final = false }) {
  const W = width, x0 = 7;
  let out = '';
  [TREBLE_TOP, BASS_TOP].forEach(top => { for (let i = 0; i < 5; i++) out += line(x0, top + i * S, W - 0.5, top + i * S, 0.8); });
  out += line(x0, TREBLE_TOP, x0, BASS_BOTTOM, 1.1);
  // Brace, stretched to span both staves.
  const bs = (BASS_BOTTOM - TREBLE_TOP) / (4 * S);
  out += `<path d="${GLYPHS.brace.d}" transform="translate(0 ${BASS_BOTTOM}) scale(${r1(U * bs * 1000) / 1000} ${-r1(U * bs * 1000) / 1000})"/>`;
  let x = x0 + 0.8 * S;
  out += glyph('gClef', x, yOf('R', 32));
  out += glyph('fClef', x, yOf('L', 24));
  x += GLYPHS.gClef.w * U + 0.9 * S;
  const n = Math.min(Math.abs(sig), 7);
  for (let i = 0; i < n; i++) {
    const g = sig > 0 ? 'sharp' : 'flat', s = (sig > 0 ? SHARP_STEPS : FLAT_STEPS)[i];
    out += glyph(g, x, yOf('R', s)) + glyph(g, x, yOf('L', s - 14));
    x += (sig > 0 ? 1.05 : 0.95) * S;
  }
  // Notes: evenly spaced, with room on the left of each for an accidental.
  const end = W - (final ? 2 : 1) * S;
  const start = x + (n ? 1 : 0.5) * S + 1.6 * S;
  const pitch = columns.length > 1 ? Math.min((end - start - HEAD_W - S) / (columns.length - 1), 6 * S) : 0;
  const shows = shownAccidentals(columns, sig);
  let notes = '';
  columns.forEach((col, i) => {
    const cx = columns.length > 1 ? start + i * pitch : start + 1.5 * S;
    ['R', 'L'].forEach(h => { notes += drawColumn(h, col[h] || [], shows[i][h], cx, true); });
  });
  out += `<g class="staff-notes">${notes}</g>`;
  if (final) out += line(W - 4.2, TREBLE_TOP, W - 4.2, BASS_BOTTOM, 1) + line(W - 1.5, TREBLE_TOP, W - 1.5, BASS_BOTTOM, 3);
  else out += line(W - 0.5, TREBLE_TOP, W - 0.5, BASS_BOTTOM, 1);
  return `<svg class="staff" viewBox="0 0 ${W} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="${INK}">${out}</g></svg>`;
}

const StaffLib = { HEIGHT, grandStaff, shownAccidentals, keySignatureMap, stepOf };
root.StaffLib = StaffLib;
if (typeof module !== 'undefined' && module.exports) module.exports = StaffLib;
})(typeof window !== 'undefined' ? window : globalThis);
