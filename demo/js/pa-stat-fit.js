/* ============================================================================
   pa-stat-fit.js — fit-to-box for pa-stat--square[data-pa-stat-fit]

   Opt-in companion to the SCSS "fit + progressive disclosure" mode. For every
   .pa-stat--square[data-pa-stat-fit] it:

     1. Wraps the authored .pa-stat__number (+ optional .pa-stat__symbol, in
        their authored order so prefix "$847K" and suffix "87%" both work) into
        a  .pa-stat__slot > .pa-stat__group  structure. Idempotent.
     2. Sizes .pa-stat__group so it fills .pa-stat__slot at the largest font
        that still fits — never overflowing, independent of character count
        (which a pure-CSS `cqi` clamp can't guarantee). The symbol scales with
        the number because the SCSS sizes it in `em`.
     3. Re-fits whenever the slot changes size — including when the CSS
        @container ladder reveals/hides the label / change / context rows
        (which grows or shrinks the slot).

   The progressive disclosure itself (which rows show at which size) is pure
   CSS — see core-components/_statistics.scss. This file only does the one
   thing CSS can't: fit the primary number to the box.

   Public API (window.PaStatFit):
     init(root)   — wrap + observe every fit tile under `root` (default document)
     refresh(el)  — re-run fit on one tile (or all, if omitted); call after you
                    change the number's text content programmatically
   ========================================================================== */
(function () {
  'use strict';

  var BASE = 200;      // measure the group at a known font-size, then scale linearly
  var SAFETY = 0.92;   // leave a hair of breathing room so glyphs never kiss the edge
  // The number is the HERO; the metadata is subordinate. Its column font-size is set
  // to this fraction of the TILE HEIGHT, so the label / trend / context stay small and
  // — crucially — CONSISTENT across a row of same-height tiles. (Basing it on the fitted
  // number size looked right on one tile but drifted between tiles: a wide "847K" fits
  // at a different size than "87", so the meta came out bigger on some tiles than others.
  // Tile height is uniform across the row, so the meta matches while still scaling if the
  // tile itself grows/shrinks.) This is THE hierarchy knob — lower = tinier meta. The
  // rows are em-relative in the SCSS, so this one value drives all three.
  var META_RATIO = 0.10;   // ~14px label on a 140px tile (was 0.07 ≈ 10px, too small to read)
  var META_MIN_PX = 12;    // …but never below this: on a short tile the proportional size
                           // would go illegible. Floors the __label; __change/__context are
                           // 0.9em/0.8em of it, so the smallest row bottoms out ~9.6px.
  var HORIZONTAL_MIN_REM = 32;  // keep in sync with $stat-square-fit-horizontal-min-w
  var observed = [];   // [{ tile, slot }] for refresh()

  function rootFontPx() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  }

  // Switch a tile to the horizontal "banner" layout once it's wide enough.
  // Done in JS (not a @container query) because the tile is its own size
  // container, and a container query can't restyle the container element itself.
  function applyMode(tile) {
    var wide = tile.clientWidth >= HORIZONTAL_MIN_REM * rootFontPx();
    tile.classList.toggle('pa-stat--fit-wide', wide);
  }

  // Wrap the authored-flat children:
  //   __number + __symbol (in DOM order) → __slot > __group   (the fit target)
  //   __label / __change / __context     → __meta             (the metadata column)
  // so the metadata can move beside the number in the horizontal banner layout.
  // Returns the slot element, or null if there's no number to fit.
  function ensureStructure(tile) {
    var existing = tile.querySelector(':scope > .pa-stat__slot');
    if (existing) return existing;

    var numberParts = [];
    var metaParts = [];
    Array.prototype.forEach.call(tile.children, function (child) {
      if (child.classList.contains('pa-stat__number') ||
          child.classList.contains('pa-stat__symbol')) {
        numberParts.push(child);
      } else if (child.classList.contains('pa-stat__label') ||
                 child.classList.contains('pa-stat__change') ||
                 child.classList.contains('pa-stat__context')) {
        metaParts.push(child);
      }
    });
    if (!numberParts.length) return null;

    var group = document.createElement('span');
    group.className = 'pa-stat__group';
    var slot = document.createElement('div');
    slot.className = 'pa-stat__slot';

    // Drop the slot where the first number part lived, then move the parts into
    // the group (appendChild relocates them, preserving authored order).
    tile.insertBefore(slot, numberParts[0]);
    numberParts.forEach(function (part) { group.appendChild(part); });
    slot.appendChild(group);

    // Wrap the metadata rows into a column after the slot.
    if (metaParts.length) {
      var meta = document.createElement('div');
      meta.className = 'pa-stat__meta';
      tile.insertBefore(meta, metaParts[0]);
      metaParts.forEach(function (part) { meta.appendChild(part); });
    }

    return slot;
  }

  // Scale .pa-stat__group to fill its slot without overflowing either axis.
  function fitSlot(slot) {
    if (!slot) return;
    var group = slot.querySelector('.pa-stat__group');
    if (!group) return;

    group.style.fontSize = BASE + 'px';
    var gw = group.offsetWidth, gh = group.offsetHeight;
    var sw = slot.clientWidth, sh = slot.clientHeight;
    if (!gw || !gh || !sw || !sh) return;

    var scale = Math.min(sw / gw, sh / gh) * SAFETY;
    group.style.fontSize = (BASE * scale) + 'px';

    // Size the metadata column as a small fraction of the TILE HEIGHT so it stays
    // subordinate AND consistent across same-height tiles (not coupled to the per-tile
    // number size). The slot's parent is the tile; the meta column is its sibling.
    // label/change/context are em-relative, so this one set cascades to all three.
    var tile = slot.parentNode;
    var meta = tile && tile.querySelector(':scope > .pa-stat__meta');
    if (meta && tile.clientHeight) {
      meta.style.fontSize = Math.max(META_MIN_PX, tile.clientHeight * META_RATIO) + 'px';
    }
  }

  // ResizeObserver fires when a watched box changes. We watch:
  //   • the TILE  → toggle the horizontal/vertical layout class by its width
  //   • the SLOT  → refit the number (also catches the @container disclosure
  //                 ladder growing/shrinking the slot, which doesn't resize the tile)
  var ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (el.classList.contains('pa-stat__slot')) {
            fitSlot(el);
          } else {
            applyMode(el);
            fitSlot(el.querySelector(':scope > .pa-stat__slot'));
          }
        });
      })
    : null;

  function setupTile(tile) {
    if (tile.__paStatFit) return;
    var slot = ensureStructure(tile);
    if (!slot) return;
    tile.__paStatFit = true;
    observed.push({ tile: tile, slot: slot });
    applyMode(tile);            // set initial layout before first fit
    if (ro) { ro.observe(tile); ro.observe(slot); }
    fitSlot(slot);              // initial pass (also covers no-ResizeObserver fallback)
  }

  function init(root) {
    (root || document)
      .querySelectorAll('.pa-stat--square[data-pa-stat-fit]')
      .forEach(setupTile);
  }

  // Re-fit after the number text changes (font-size needs recomputing even
  // though the slot box didn't move, so ResizeObserver wouldn't fire).
  function refresh(el) {
    if (el) {
      var slot = el.classList && el.classList.contains('pa-stat__slot')
        ? el
        : el.querySelector('.pa-stat__slot');
      fitSlot(slot);
      return;
    }
    observed.forEach(function (rec) { fitSlot(rec.slot); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  window.PaStatFit = { init: init, refresh: refresh };
})();
