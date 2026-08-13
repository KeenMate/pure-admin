/**
 * Pure Admin — shared runtime namespace (window.pureAdmin)
 *
 * ONE global for the whole framework. Every component hangs its public handle,
 * every cross-component signal, and all diagnostics off this object instead of
 * scattering `window.PaThing` / `window.PureAdminThing` globals.
 *
 * Load-order-safe by construction: this file, and every component, opens with
 * the self-creating idiom
 *
 *     var pa = (window.pureAdmin = window.pureAdmin || {});
 *
 * so the namespace exists no matter which script parses first (the same pattern
 * the old `window.PaMenus` used). This module additionally installs the parts
 * that must exist exactly once — the event bus, the viewport source, and the
 * debug registry. Components only *use* those (events.on, debug.log, …) from
 * inside init()/handlers, which run on/after DOMContentLoaded — by then every
 * `<script>` has evaluated, so the order the tags appear in doesn't matter.
 *
 * Surface:
 *   pureAdmin.events        on(topic,fn)->off / once / off / emit(topic,payload)
 *   pureAdmin.viewport      { width, height, orientation } live snapshot; emits
 *                           'viewport:resize' (rAF-throttled) + 'viewport:orientation'
 *   pureAdmin.colorScheme   { mode: 'light'|'dark' } live OS preference; emits
 *                           'colorscheme:change' (matchMedia prefers-color-scheme)
 *   pureAdmin.config         shared UI-behavior baseline (mobileBreakpoint, …);
 *                           override keys before init. Docs: docs/config-shared-ui-baseline.md
 *   pureAdmin.components     per-component handles ({init, initAll, …}); initAll(scope)
 *   pureAdmin.menus          open-menu coordination registry (register/closeOthers)
 *   pureAdmin.debug          enable/disable/isEnabled/log/aspects (feeds a future console)
 *   pureAdmin.confirm/alert/prompt/custom, pureAdmin.toast, pureAdmin.tooltips
 *                            (installed by their own modules)
 *
 * Event topics (kept deliberately few):
 *   viewport:resize       {width,height,orientation}   the one throttled window-resize source
 *   viewport:orientation  {width,height,orientation}   portrait<->landscape (matchMedia; fires on desktop pivot)
 *   colorscheme:change    {mode}                        OS prefers-color-scheme flipped light<->dark (matchMedia)
 *   menu:opened           {id}                          a menu opened (others may close)
 *   theme:change          {theme}
 *   sidebar:mode          {mode}
 *   sidebar:resize        {width}                       sidebar drag-resized (px)
 */
(function () {
  'use strict';

  var pa = (window.pureAdmin = window.pureAdmin || {});
  pa.components = pa.components || {};

  // --- events: a tiny topic bus -----------------------------------------
  if (!pa.events) {
    var topics = {}; // { [topic]: Set<fn> }
    pa.events = {
      on: function (topic, fn) {
        (topics[topic] || (topics[topic] = new Set())).add(fn);
        return function off() { if (topics[topic]) topics[topic].delete(fn); };
      },
      once: function (topic, fn) {
        var off = pa.events.on(topic, function (payload) { off(); fn(payload); });
        return off;
      },
      off: function (topic, fn) { if (topics[topic]) topics[topic].delete(fn); },
      emit: function (topic, payload) {
        if (!topics[topic]) return;
        topics[topic].forEach(function (fn) {
          try { fn(payload); } catch (e) { pa.debug.log('events', 'listener threw for', topic, e); }
        });
      },
      // Introspection for the future debug console.
      topics: function () { return Object.keys(topics); },
      listenerCount: function (topic) { return topics[topic] ? topics[topic].size : 0; }
    };
  }

  // --- debug: per-aspect toggles + log (replaces the old PA_*_DEBUG flags) --
  if (!pa.debug) {
    var enabled = {}; // { [aspect]: true }
    var known = {};   // every aspect name ever seen (for aspects())
    pa.debug = {
      enable: function (aspect) { enabled[aspect] = true; known[aspect] = true; },
      disable: function (aspect) { enabled[aspect] = false; },
      isEnabled: function (aspect) { known[aspect] = true; return enabled[aspect] === true; },
      log: function (aspect) {
        known[aspect] = true;
        if (enabled[aspect] !== true) return;
        var args = Array.prototype.slice.call(arguments, 1);
        console.log.apply(console, ['[pa:' + aspect + ']'].concat(args));
      },
      // { aspect: enabled } for every aspect that's been enabled or probed.
      aspects: function () {
        var out = {};
        Object.keys(known).forEach(function (k) { out[k] = enabled[k] === true; });
        return out;
      }
    };
  }

  // --- viewport: the single owner of window-level resize/orientation --------
  if (!pa.viewport) {
    var vp = pa.viewport = { width: 0, height: 0, orientation: 'landscape' };
    var raf = null;
    function measure() {
      vp.width = window.innerWidth;
      vp.height = window.innerHeight;
      // CSS-parity: "portrait" == taller-than-wide, device-agnostic (a pivoted
      // desktop monitor is portrait too). NOT the deprecated window.orientation.
      vp.orientation = vp.height >= vp.width ? 'portrait' : 'landscape';
    }
    measure();
    window.addEventListener('resize', function () {
      if (raf) return; // coalesce a burst of resizes into one frame
      raf = requestAnimationFrame(function () {
        raf = null;
        measure();
        pa.events.emit('viewport:resize', vp);
      });
    }, { passive: true });

    // Orientation via matchMedia — well-supported and, unlike the legacy
    // orientationchange event, fires on desktop monitor pivot too.
    var mq = window.matchMedia('(orientation: portrait)');
    var onOrient = function () { measure(); pa.events.emit('viewport:orientation', vp); };
    if (mq.addEventListener) mq.addEventListener('change', onOrient);
    else if (mq.addListener) mq.addListener(onOrient); // Safari <14
  }

  // --- colorScheme: the single owner of the OS light/dark preference --------
  // Mirrors viewport's ownership of window-level media queries: one matchMedia
  // watcher for prefers-color-scheme, surfaced as a live snapshot + one event.
  // Consumers that follow the OS ("auto" theme mode) read colorScheme.mode and
  // subscribe to 'colorscheme:change' instead of each opening their own query.
  if (!pa.colorScheme) {
    var cs = pa.colorScheme = { mode: 'light' };
    var csmq = window.matchMedia('(prefers-color-scheme: dark)');
    var readScheme = function () { cs.mode = csmq.matches ? 'dark' : 'light'; };
    readScheme();
    var onScheme = function () { readScheme(); pa.events.emit('colorscheme:change', cs); };
    if (csmq.addEventListener) csmq.addEventListener('change', onScheme);
    else if (csmq.addListener) csmq.addListener(onScheme); // Safari <14
  }

  // --- config: the shared UI-behavior baseline ------------------------------
  // One overridable object for the framework's binding-agnostic defaults, so
  // components stop hardcoding constants — and every wrapper (svelte / Phoenix
  // LiveView / …) inherits ONE baseline instead of drifting. Consumers override
  // by setting keys before init: window.pureAdmin.config.mobileBreakpoint = 900.
  // App-domain config (permissions, currentUser, date formats) belongs in the
  // wrappers, NOT here. See docs/config-shared-ui-baseline.md.
  if (!pa.config) pa.config = {};
  (function initConfig(cfg) {
    // Read a numeric CSS variable off :root (px / ms / unitless → number);
    // returns fallback when the stylesheet hasn't parsed or the var is absent.
    function readCssNumber(name, fallback) {
      try {
        var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        var n = parseFloat(raw);
        return isNaN(n) ? fallback : n;
      } catch (e) { return fallback; }
    }

    // mobileBreakpoint (px) — SINGLE-SOURCED from SCSS $mobile-breakpoint via the
    // --pa-mobile-breakpoint CSS var (see _layout-responsive.scss), not a JS
    // literal. Honour an explicit consumer override; else derive from CSS; else
    // 768. A blocking theme/main <link> precedes this script, so the var is
    // readable by the time this runs.
    if (cfg.mobileBreakpoint == null) {
      cfg.mobileBreakpoint = readCssNumber('--pa-mobile-breakpoint', 768);
    }
  })(pa.config);

  // --- menus: open-menu coordination (moved from window.PaMenus) ------------
  // Components register a "close me" fn; opening one calls closeOthers(self) to
  // dismiss every other registered menu. Kept imperative (not just an event) so
  // a menu can dismiss peers synchronously before it opens.
  if (!pa.menus) {
    pa.menus = {
      closers: [],
      register: function (fn) { this.closers.push(fn); return fn; },
      closeOthers: function (self) {
        this.closers.forEach(function (fn) {
          if (fn !== self) { try { fn(); } catch (e) { /* ignore */ } }
        });
        pa.events.emit('menu:opened', { id: self && self.paMenuId });
      }
    };
  }

  // --- components.initAll: init every registered component under a scope -----
  if (!pa.components.initAll) {
    pa.components.initAll = function (scope) {
      Object.keys(pa.components).forEach(function (name) {
        if (name === 'initAll') return;
        var c = pa.components[name];
        if (!c) return;
        try {
          if (typeof c.initAll === 'function') c.initAll(scope);
          else if (typeof c.init === 'function') c.init(scope);
        } catch (e) { pa.debug.log('components', name + '.initAll threw', e); }
      });
    };
  }
})();
