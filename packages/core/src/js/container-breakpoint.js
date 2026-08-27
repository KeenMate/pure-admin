/**
 * Pure Admin — Container Breakpoint (element-width → named mode, event-driven)
 *
 * The JS counterpart to a CSS container query. A CSS `@container` rule can only
 * SHOW / HIDE — it can never skip work. This watches an element's inline size
 * with a ResizeObserver, maps it to a NAMED mode from author-declared width
 * thresholds, and EMITS a change only when the mode actually flips. A framework
 * wrapper turns that event into conditional rendering — so the branches for
 * other modes are never MOUNTED (no off-screen Chart.js instance, no eager data
 * fetch, no shadow-DOM widget built to be immediately hidden).
 *
 * This is the "expensive 2-D swap" tool; `fit.js` remains the "cheap 1-D row
 * fold" tool. The difference is measurement:
 *   - fit.js is CONTENT-measured (it renders every variant to read its width),
 *     so it can't avoid mounting the losers.
 *   - container-breakpoint is THRESHOLD-declared (you name the widths), so the
 *     losers never need to exist — which is exactly what lets a wrapper mount
 *     on demand.
 *
 * Because it is threshold-declared it does NOT need `container-type` on the
 * element (the ResizeObserver measures the box directly). It reads the element's
 * CONTENT-box inline size, to match `@container inline-size` semantics — so a
 * `data-mode` written here and an `@container` rule agree on width.
 *
 * ── Programmatic API (what a Svelte / vanilla caller uses) ──────────────────
 *   var handle = pureAdmin.components.containerBreakpoint.observe(el, {
 *     steps: { compact: 0, comfy: 34, wide: 64 },  // name → MIN inline size
 *     unit: 'rem',            // 'rem' (default, resolved vs :root font-size) | 'px'
 *     hysteresis: 1,          // dead-band (in `unit`) to stop boundary flapping
 *     attribute: 'data-mode', // reflect the mode here (false to not write any)
 *     initial: 'comfy',       // mode written synchronously before first measure
 *                             //   (SSR/first-paint default; omit to skip)
 *     emitEvent: true         // also dispatch a 'pa:breakpoint' CustomEvent on el
 *   }, function (mode, prev, detail) { ... });   // cb fires once on settle, then on change
 *
 *   handle.current();    // → the current mode string
 *   handle.remeasure();  // force a re-evaluate (e.g. after a font swap)
 *   handle.destroy();    // disconnect the observer + drop the attribute
 *
 * The callback and the 'pa:breakpoint' event (detail: {mode, prev, width, el})
 * are two faces of the same signal — use the callback from JS, the event from a
 * framework hook (Phoenix LiveView, etc.) that can't take a closure.
 *
 * ── Declarative API (zero-framework / keen bridge) ──────────────────────────
 * Wire it from markup — no JS call site — so CSS can key off [data-mode] and a
 * LiveView hook can listen for 'pa:breakpoint':
 *
 *   <div data-pa-breakpoints='{"compact":0,"comfy":34,"wide":64}'
 *        data-pa-breakpoint-initial="comfy">
 *     <div data-pa-show="wide">…rich…</div>      <!-- .d-none unless mode = wide -->
 *     <div data-pa-show="compact comfy">…lite…</div>
 *   </div>
 *
 *   pureAdmin.components.containerBreakpoint.initAll();   // or .init(el)
 *
 * data-pa-show="a b …" — a descendant appears ONLY in the listed modes; in any
 * other mode the engine toggles the shared `.d-none` utility onto it (a CLASS,
 * not inline display — so it reverts to its natural stylesheet display when
 * shown, and you can watch the class hop in devtools, same idea as fit.js's
 * `pa-fit-hidden`). Override the class per-call with opts.hiddenClass or globally
 * via pureAdmin.config.containerBreakpoint.hiddenClass. Elements without
 * data-pa-show are never touched — pure CSS `[data-mode]` styling still works
 * alongside it.
 *
 * Optional attrs: data-pa-breakpoint-unit ("rem"|"px"),
 * data-pa-breakpoint-hysteresis (number), data-pa-breakpoint-attr (attr name to
 * reflect into, default "data-mode").
 *
 * Public API (window.pureAdmin.components.containerBreakpoint):
 *   observe(el, opts, cb) — wire one element; returns a handle (idempotent per call)
 *   init(el)              — declarative wire from data-pa-breakpoints (idempotent)
 *   initAll(scope)        — declarative wire every [data-pa-breakpoints] under scope
 *   relayoutAll()         — force a re-measure of every declaratively-wired element
 */
(function () {
  'use strict';

  var SELECTOR = '[data-pa-breakpoints]';

  // :root font-size in px, for resolving rem thresholds against the live base
  // (pure-admin ships 10px, but resolve rather than assume so a consumer that
  // changes it stays correct). Falls back to 16 if unreadable.
  function rootFontPx() {
    try {
      var n = parseFloat(getComputedStyle(document.documentElement).fontSize);
      return (!isNaN(n) && n > 0) ? n : 16;
    } catch (e) { return 16; }
  }

  // Normalise `steps` (object {name:min} or array [{name,min}]) into an array of
  // { name, min } sorted ASCENDING by min. min is in the caller's unit.
  function normSteps(steps) {
    var out = [];
    if (Array.isArray(steps)) {
      steps.forEach(function (s) {
        if (s && s.name != null && isFinite(s.min)) out.push({ name: String(s.name), min: +s.min });
      });
    } else if (steps && typeof steps === 'object') {
      Object.keys(steps).forEach(function (name) {
        var v = parseFloat(steps[name]);
        if (!isNaN(v)) out.push({ name: name, min: v });
      });
    }
    out.sort(function (a, b) { return a.min - b.min; });
    return out;
  }

  // Largest step whose min <= width (px). Returns its index; 0 (the floor) when
  // the element is narrower than every threshold.
  function candidateIndex(widthPx, stepsPx) {
    var idx = 0;
    for (var i = 0; i < stepsPx.length; i++) {
      if (widthPx >= stepsPx[i].min) idx = i; else break;
    }
    return idx;
  }

  // Resolve the settled mode index with a dead-band so a width parked on a
  // boundary doesn't flip every frame:
  //   - moving UP:   accept the higher step only once width clears its min by band
  //   - moving DOWN: accept a lower step only once width drops below the CURRENT
  //                  step's min by band
  // First evaluation (curIdx == null) takes the plain candidate — no band, so the
  // initial mode is a pure function of width.
  function settleIndex(widthPx, stepsPx, curIdx, bandPx) {
    var cand = candidateIndex(widthPx, stepsPx);
    if (curIdx == null || cand === curIdx) return cand;
    if (cand > curIdx) {
      return (widthPx >= stepsPx[cand].min + bandPx) ? cand : curIdx;
    }
    // cand < curIdx
    return (widthPx < stepsPx[curIdx].min - bandPx) ? cand : curIdx;
  }

  function observe(el, opts, cb) {
    if (!el || el.nodeType !== 1) return null;
    opts = opts || {};

    var steps = normSteps(opts.steps);
    if (!steps.length) return null; // nothing to switch between

    var unit = opts.unit === 'px' ? 'px' : 'rem';
    var hysteresis = isFinite(opts.hysteresis) ? +opts.hysteresis
      : ((window.pureAdmin && pureAdmin.config && pureAdmin.config.containerBreakpoint
          && pureAdmin.config.containerBreakpoint.hysteresis) || 0);
    var attribute = opts.attribute === false ? null : (opts.attribute || 'data-mode');
    var emitEvent = opts.emitEvent !== false;
    var hiddenClass = opts.hiddenClass
      || (window.pureAdmin && pureAdmin.config && pureAdmin.config.containerBreakpoint
          && pureAdmin.config.containerBreakpoint.hiddenClass)
      || 'd-none';

    var curIdx = null;        // settled step index; null until first measure
    var curMode = null;

    // Convert the declared thresholds + band into px for comparison. Recomputed
    // per measure so a runtime root-font-size change is honoured (rem unit only).
    function toPx() {
      var base = unit === 'rem' ? rootFontPx() : 1;
      return {
        steps: steps.map(function (s) { return { name: s.name, min: s.min * base }; }),
        band: hysteresis * base
      };
    }

    // Toggle the shared hidden class on [data-pa-show] descendants: an element
    // stays visible only in the modes listed in its data-pa-show; in any other
    // mode it gets `hiddenClass`. A class (not inline display) so it reverts to
    // its natural display when shown — and is visible "jumping" in devtools.
    function applyVisibility(mode) {
      if (!hiddenClass) return;
      var shown = el.querySelectorAll('[data-pa-show]');
      for (var i = 0; i < shown.length; i++) {
        var tokens = (shown[i].getAttribute('data-pa-show') || '').split(/\s+/);
        shown[i].classList.toggle(hiddenClass, tokens.indexOf(mode) === -1);
      }
    }

    function reflect(mode) {
      if (attribute) el.setAttribute(attribute, mode);
      applyVisibility(mode);
    }

    // Optional synchronous default before the observer's first callback — lets a
    // wrapper render a sane branch on first paint / SSR hydration.
    if (opts.initial != null) {
      curMode = String(opts.initial);
      curIdx = -1; // sentinel: "have a provisional mode, but width not yet read"
      reflect(curMode);
    }

    function evaluate(widthPx) {
      var p = toPx();
      // Treat the provisional `initial` as "no settled index yet" for the band.
      var fromIdx = (curIdx == null || curIdx < 0) ? null : curIdx;
      var nextIdx = settleIndex(widthPx, p.steps, fromIdx, p.band);
      var nextMode = p.steps[nextIdx].name;
      if (nextMode === curMode && curIdx === nextIdx) return;
      var prev = curMode;
      curIdx = nextIdx;
      curMode = nextMode;
      reflect(curMode);
      var detail = { mode: curMode, prev: prev, width: widthPx, el: el };
      if (typeof cb === 'function') {
        try { cb(curMode, prev, detail); }
        catch (e) { if (window.pureAdmin && pureAdmin.debug) pureAdmin.debug.log('container-breakpoint', 'callback threw', e); }
      }
      if (emitEvent && typeof CustomEvent === 'function') {
        el.dispatchEvent(new CustomEvent('pa:breakpoint', { detail: detail, bubbles: false }));
      }
    }

    // Content-box inline size, matching @container inline-size. Prefer the
    // observer entry's contentBoxSize; fall back to clientWidth minus padding.
    function widthFromEntry(entry) {
      if (entry && entry.contentBoxSize) {
        var box = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
        if (box && isFinite(box.inlineSize)) return box.inlineSize;
      }
      if (entry && entry.contentRect) return entry.contentRect.width;
      var cs = getComputedStyle(el);
      return el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    }

    var ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].target === el) { evaluate(widthFromEntry(entries[i])); return; }
        }
        evaluate(widthFromEntry(null));
      });
      ro.observe(el);
    } else {
      // No ResizeObserver: settle once now, and follow the shared viewport source.
      evaluate(widthFromEntry(null));
      if (window.pureAdmin && pureAdmin.events) {
        var off = pureAdmin.events.on('viewport:resize', function () { evaluate(widthFromEntry(null)); });
        ro = { disconnect: off };
      }
    }

    return {
      current: function () { return curMode; },
      remeasure: function () { evaluate(widthFromEntry(null)); },
      destroy: function () {
        if (ro && ro.disconnect) ro.disconnect();
        if (attribute) el.removeAttribute(attribute);
        if (hiddenClass) {
          var shown = el.querySelectorAll('[data-pa-show]');
          for (var i = 0; i < shown.length; i++) shown[i].classList.remove(hiddenClass);
        }
        el.__paCbHandle = null;
      }
    };
  }

  // Declarative: read config off data-* attributes and observe.
  function init(el) {
    if (!el || el.__paCbHandle) return el && el.__paCbHandle;
    var raw = el.getAttribute('data-pa-breakpoints');
    if (!raw) return null;
    var steps;
    try { steps = JSON.parse(raw); }
    catch (e) {
      if (window.pureAdmin && pureAdmin.debug) pureAdmin.debug.log('container-breakpoint', 'bad data-pa-breakpoints JSON', raw, e);
      return null;
    }
    var opts = {
      steps: steps,
      unit: el.getAttribute('data-pa-breakpoint-unit') || 'rem',
      attribute: el.getAttribute('data-pa-breakpoint-attr') || 'data-mode',
      initial: el.getAttribute('data-pa-breakpoint-initial') || undefined
    };
    var hy = el.getAttribute('data-pa-breakpoint-hysteresis');
    if (hy != null && hy !== '') opts.hysteresis = parseFloat(hy);
    var handle = observe(el, opts);
    if (handle) el.__paCbHandle = handle;
    return handle;
  }

  function initAll(scope) {
    var root = scope || document;
    var els = root.querySelectorAll(SELECTOR);
    for (var i = 0; i < els.length; i++) init(els[i]);
  }

  function relayoutAll() {
    var els = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < els.length; i++) {
      if (els[i].__paCbHandle) els[i].__paCbHandle.remeasure();
    }
  }

  var pa = (window.pureAdmin = window.pureAdmin || {});
  (pa.components = pa.components || {}).containerBreakpoint = {
    observe: observe,
    init: init,
    initAll: initAll,
    relayoutAll: relayoutAll
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }
})();
