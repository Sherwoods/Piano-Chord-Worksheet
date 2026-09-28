# Chord Worksheet v2 — chord builder, voicing generator, chord identification

You are working in the Piano-Chord-Worksheet repo. It's a small offline PWA (GitHub Pages) that a piano teacher uses to make printable chord worksheets: each letter-size page has rows of 1, 2, or 3 chord cells; each cell has a chord name and a small piano keyboard where keys are marked for the left hand (L) or right hand (R).

Read `index.html`, `sw.js`, and `manifest.webmanifest` fully before changing anything. The app is vanilla HTML/CSS/JS with no build step, no framework, and no dependencies. Keep it that way.

Work in three phases. **Stop after each phase**, summarize what changed, list anything you were unsure about, and wait for me before starting the next one. Commit each phase separately.

---

## Hard constraints

1. **Printed output must not change** for sheets that don't use the new features. The `.paper` element and everything inside it keeps its current styles. New UI goes in the editor panel and app chrome only.
2. **No data loss.** Existing saved data (localStorage key `chordWorksheet.v1`) must load and keep working. Existing cells have only a free-text `name`; treat that as a free-text label (see the data model below). Run old data through the existing `sanitize*` functions, extended for the new fields.
3. **Undo covers every new action** (use the existing `pushUndo()` pattern).
4. **Offline still works.** If you add a file (for example `chords.js`), add it to the `CORE` list in `sw.js` and bump the cache name (`chord-worksheet-v2` → `v3`).
5. Keep the existing UI style guide (the `:root` variables, `--serif`/`--sans`, `.btn`, `.seg`, the felt accent). Light only.
6. Don't refactor unrelated code.

You may split the music logic into `chords.js`, loaded with a plain `<script src>` before the app script. Expose it as `window.ChordLib` and also `module.exports` when `module` exists, so Node can test it without a browser.

---

## Data model

Each cell becomes:

```js
{
  chord: null | Chord,   // structured chord; source of truth when present
  label: '',             // free-text name, used only when chord is null
  acc: 'sharp'|'flat',   // existing; fallback note naming for keys that aren't chord tones
  start: <int>,          // existing keyboard window
  marks: { midi: 'L'|'R' } // existing
}
```

```js
Chord = {
  root:  { letter: 'A'..'G', acc: -2..2 },   // acc: -1 = ♭, 1 = ♯
  quality: 'maj'|'min'|'dim'|'aug'|'sus2'|'sus4'|'5',
  seventh: null|'6'|'7'|'maj7'|'dim7',       // 'dim7' only when quality is 'dim'
  ext: null|9|11|13,                         // highest extension; implies the 7th and lower extensions
  alt: { b5, s5, b9, s9, s11, b13 },          // booleans
  alt7: false,                                // "7alt" chord
  add: { add9, add11, sixNine },              // booleans
  omit: { no3, no5 },                         // booleans
  bass: null | { letter, acc }                // slash chord bass
}
```

Migration: the old `name` becomes `label`, and `chord` is `null`. The printed chord name is:

- the rendered symbol when `chord` is set;
- otherwise `label`.

New per-sheet settings (sanitize with defaults):

- `notation: 'standard'|'jazz'`, default `'standard'`
- `spelling: 'plain'|'strict'`, default `'plain'`

---

## Phase 1 — chord model, spelling, notation, builder UI

### Spelling

Build each chord as a list of **degrees** (1, 3, 5, 7, 9, 11, 13 with alterations), not pitch classes.

- The letter for each degree is the root letter plus (degree − 1) letter steps.
- The accidental is whatever reaches the correct semitone.
- This makes E♭7 spell its 7th as D♭ and never C♯.

Spelling modes:

- `strict` keeps double sharps and double flats.
- `plain`, the default, respells any double accidental enharmonically (B𝄫 → A). It also respells E♯/B♯/F♭/C♭ as F/C/E/B **only** when the note comes from an alteration or augmentation.

Default chord-tone content, matching how players read symbols:

- `9` = 1 3 5 ♭7 9
- `11` = 1 (3 omitted) 5 ♭7 9 11
- `13` = 1 3 5 ♭7 9 13, with the 11 omitted
- `maj13` = 1 3 5 7 9 13
- `m11` keeps the 3rd.
- `6/9` = 1 3 5 6 9.

Note names shown on keys (the "dot with note name" mark style) must use the chord's spelling for chord tones. Keys that aren't chord tones fall back to the cell's `acc`.

### Notation rendering

Standard style (the default):

| Chord | Standard | Jazz |
|---|---|---|
| Major | C | C |
| Minor | Cm | C– |
| Diminished | Cdim | C° |
| Augmented | Caug | C+ |
| Sus | Csus2, Csus4 | same |
| Power chord | C5 | same |
| Sixth | C6, Cm6, C6/9 | C6, C–6, C6/9 |
| Seventh | C7 | C7 |
| Major 7th | Cmaj7 | C∆7 |
| Minor 7th | Cm7 | C–7 |
| Minor-major 7th | Cm(maj7) | C–(∆7) |
| Half-diminished | Cm7♭5 | Cø7 |
| Diminished 7th | Cdim7 | C°7 |
| Extensions | C9, Cmaj9, Cm9, C11, C13, Cmaj13 | C9, C∆9, C–9, C11, C13, C∆13 |
| Altered | C7♭9, C7(♯9), C7(♭9,♯11), C7alt | same |
| Add and omit | Cadd9, C(no3) | same |
| Slash | C/E | same |

Use real ♭ and ♯ characters in the rendered symbol. Parenthesize alterations when there's more than one, or when a ♯ follows a number directly. Settle on one consistent rule and apply it everywhere.

### Builder UI

The builder goes in the chord editor panel, above the keyboard, as a collapsible section. It's open by default when the cell has a chord or is empty.

1. **Root:** A–G letter buttons plus a ♮/♯/♭ segmented control.
2. **Quality:** maj · min · dim · aug · sus2 · sus4 · 5.
3. **Seventh:** none · 6 · 7 · maj7 · dim7.
4. **Extensions:** 9 · 11 · 13, chosen one at a time.
5. **Alterations:** ♭5 ♯5 ♭9 ♯9 ♯11 ♭13, plus "alt". These are toggle chips.
6. **Add and omit:** add9 · add11 · 6/9 · no 3rd · no 5th, as toggle chips.
7. **Bass:** none, or a note, for slash chords.
8. **Live preview line:** the rendered symbol plus the spelled notes, for example `E♭7(♯9)/G · E♭ G B♭ D♭ F♯ · bass G`.
9. **Invalid combinations are disabled, not hidden.** A short reason appears on tap. Examples: sus with min; 6 with 7; dim7 without dim; 11 with sus4; ♯5 with aug.
10. **Common chords take three taps:** root, quality, seventh.
11. **Clear chord** returns the cell to empty.

Keep the free-text field, relabeled "Custom label". It's used when the builder is empty. Typing a custom label clears `chord`, after an undoable confirm if a chord was set. Allow a label like `?` so a teacher can make "name this chord" worksheets.

### Typed shortcut, best effort

In the custom-label field, if the text parses as a chord symbol, show "Use as chord: Cmaj7 ✓". Tapping it fills in the builder.

The parser accepts:

- `b` and `#` as ♭ and ♯;
- `M`, `maj`, `∆`, `^` for major 7th;
- `m`, `min`, `-` for minor;
- `ø`, `m7b5` for half-diminished;
- `°`, `o`, `dim` for diminished;
- `+`, `aug` for augmented;
- `sus`, which means sus4;
- `add`, `no3`, `alt`, and a slash bass.

Anything it can't parse is left alone as a label. The parser is a convenience, not the main input.

### Sheet settings

Add a small sheet-settings control (next to "Hands" is fine) with two options:

- Notation: Standard / Jazz
- Spelling: Plain / Strict

Changing them re-renders every chord on the sheet and is undoable.

### Phase 1 tests (Node, no dependencies)

Create `tests/chords.test.js`, runnable with `node tests/chords.test.js`. It exits non-zero on failure. Cover at least 60 chords, including these, with exact expected spellings (plain unless noted):

| Chord | Expected notes |
|---|---|
| C13 | C E G B♭ D A |
| Cmaj7♯11 | C E G B F♯ |
| E♭dim7 (plain) | E♭ G♭ A D♭ |
| E♭dim7 (strict) | E♭ G♭ B𝄫 D♭ |
| F♯m7♭5 | F♯ A C E |
| B♭6/9 | B♭ D F G C |
| G7♯9 | G B D F A♯ |
| Dm(maj7) | D F A C♯ |
| Csus4 | C F G |
| C7sus4 | C F G B♭ |
| Aaug (plain) | A C♯ F |
| Aaug (strict) | A C♯ E♯ |
| G7/B | G B D F, bass B |
| D♭maj9 | D♭ F A♭ C E♭ |
| Bm11 | B D F♯ A C♯ E |

Also test that rendering then parsing gives back the same chord, in both notation styles.

**Stop here for review.**

---

## Phase 2 — voicing generator

In the editor, below the builder, show a voicing control when the cell has a chord:

`‹ Style ›` and `‹ Variation ›`, with a label such as "Rootless · Type B" or "Close · 2nd inversion".

- Tapping an arrow replaces the cell's marks with the generated voicing, as one undoable step.
- It also moves the cell's keyboard window (`start`) to fit the voicing.
- Manual key tapping still works afterward as before.
- Changing the chord in the builder never wipes marks by itself. Marks only change when the user taps a voicing arrow.

Styles, in cycle order. A style that doesn't apply to the chord is skipped.

1. **Close position:** root position and every inversion. Right hand only. The top of the voicing sits roughly between C4 and C6.
2. **Open / spread (two hands):**
   - Left-hand root, right-hand close voicing of the remaining tones.
   - Left-hand root and 5th (or root and 7th), right hand takes the rest.
   - Drop-2 of a 4-note close voicing: the second note from the top drops an octave into the left hand.
3. **Shells:**
   - Left hand plays root, 3rd, 7th or root, 7th, 3rd, with the root between about C2 and G2.
   - One variation adds the chord's highest extension in the right hand.
   - Sixth chords use 6 in place of 7.
4. **Rootless (left hand), for 7th-family chords with or without extensions:**
   - Type A: 3–5–7–9. For dominant 13th chords, 3–13–7–9.
   - Type B: 7–9–3–5. For dominant 13th chords, 7–9–3–13.
   - Alterations substitute their tones: ♭9 or ♯9 replaces the 9; ♭13 or ♯5 replaces the 5.
   - The lowest note falls in roughly D3–G3, and the top note stays at or below about C5.

Register rules for every style:

- **Respect low-interval limits.** No interval between adjacent notes may sit below its limit. Use approximately:

  | Interval | Lowest allowed starting note |
  |---|---|
  | m2 | E3 |
  | M2 | E♭3 |
  | m3 | C3 |
  | M3 | B♭2 |
  | P4 | B♭2 |
  | Tritone | B2 |
  | P5 | B♭1 |
  | Sixths and sevenths | F2 |

  Octaves are fine lower.
- **Hand spans:** no more than a 10th within one hand.
- **Keyboard range:** stay within A0–C8.

Fit to the cell:

- Only offer voicings that fit the cell's keyboard width (`KEYS_PER_ROW` for the row's chords-per-row).
- If a style exists for the chord but can't fit, show it greyed out with the reason: "Needs a wider keyboard. Use 1 chord in this row."

The hand assignment ('L'/'R') comes from the style and uses the sheet's existing hand colors.

### Phase 2 tests

- Every generated voicing contains exactly the intended chord tones.
- Every voicing obeys the low-interval limits and the hand-span rule.
- Every voicing offered for a cell fits that cell's window.
- Rootless voicings never contain the root.

**Stop here for review.**

---

## Phase 3 — suggest names from marked keys

When a cell has marks, whether from tapping or a generated voicing, show up to 4 suggested chord names under the keyboard, like "Em7 · G6/E · Cmaj9 (no root)".

- Tapping a suggestion fills in the builder, as an undoable step.
- The app **never** changes an existing chord or label automatically.

Algorithm:

1. Take the pitch classes of the marks and the lowest marked note, which is the bass.
2. For each pitch class as a candidate root, and each chord template the builder can produce, score:
   - required tones present;
   - a penalty for extra notes;
   - a small penalty for a missing 5th, which is common and allowed;
   - a bonus when the root is the bass;
   - a bonus for common chords over exotic ones.
3. When the bass isn't the root, name it as a slash chord, for example C/E.
4. Include rootless readings, where the root is absent, only if the notes match a Type A or Type B rootless voicing. Rank them lowest and label them "(no root)".
5. Break ties toward simpler symbols.
6. Name each suggestion's notes using that chord's own spelling.

### Phase 3 tests

- Generate a voicing, then identify it. The original chord must be among the suggestions, and first for close and open voicings.
- Known ambiguous sets list both readings. For example, A C E G gives Am7 and C6/A.

---

## Done when

- All tests pass with `node tests/chords.test.js`.
- Old saved data loads unchanged, and a sheet with no chords prints identically to before.
- Everything new is undoable and works offline.
- It's usable on an iPhone-width screen, 390px wide. The builder may scroll, but nothing may overflow sideways.
