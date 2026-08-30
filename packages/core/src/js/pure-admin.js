/**
 * Pure Admin — shared runtime namespace (window.pureAdmin)
 *
 * ADOPT-AND-EXTEND FACADE over @keenmate/pure-css's foundation runtime
 * (window.pureCss). Since the app-shell engines (fit, navbar-dropdown,
 * sidebar-resize, container-breakpoint) and the foundation runtime moved DOWN
 * into pure-css, this file no longer OWNS the event bus / viewport / device
 * classification / components registry — it BORROWS them from window.pureCss so
 * that consumers reading `window.pureAdmin.components.fit` resolve the engine
 * registered on window.pureCss through an Object.create read-through chain, with
 * ZERO call-site changes.
 *
 * Two modes:
 *   1. pure-css PRESENT (the normal case — pure-css.js loads first): adopt its
 *      events / config / viewport / colorScheme / device / overlay / menus BY
 *      REFERENCE, and make pa.components an Object.create(pureCss.components) so
 *      reads (fit, containerBreakpoint, …) fall through to pureCss while
 *      pure-admin's OWN component handles (toast, tooltips, splitter, …) register
 *      locally. initAll comes through the prototype.
 *   2. pure-css ABSENT (pure-admin loaded standalone): fall back to creating the
 *      whole runtime itself, exactly as before, so pure-admin still works alone.
 *
 * In BOTH modes the ADMIN-only config defaults (transition, toast, severity) are
 * applied onto pa.config (which, in mode 1, IS pureCss.config by reference —
 * that's fine and intended).
 *
 * Surface (unchanged for consumers):
 *   pureAdmin.events / viewport / colorScheme / device / overlay / config /
 *   pureAdmin.components (+ initAll) / pureAdmin.menus / pureAdmin.debug
 *   pureAdmin.confirm/alert/prompt/custom, pureAdmin.toast, pureAdmin.tooltips
 *                            (installed by their own modules)
 */
(function () {
  'use strict';

  var pa = (window.pureAdmin = window.pureAdmin || {});
  var pc = window.pureCss;

  if (pc) {
    // ================= MODE 1 — adopt pure-css's foundation ================
    // Buses shared BY REFERENCE: one event bus, one config object, one viewport
    // source across the whole framework. Never re-create what pure-css owns.
    pa.events = pa.events || pc.events;
    pa.config = pa.config || pc.config;
    pa.viewport = pa.viewport || pc.viewport;
    pa.colorScheme = pa.colorScheme || pc.colorScheme;
    pa.device = pa.device || pc.device;
    pa.overlay = pa.overlay || pc.overlay;
    pa.menus = pa.menus || pc.menus;
    pa.debug = pa.debug || pc.debug;

    // components: read-through prototype. Reads (fit, containerBreakpoint,
    // navDropdown, sidebarResize, initAll) fall to pureCss.components; writes
    // (pureAdmin's own toast/tooltips/splitter/… handles) stay local.
    if (!pa.components || Object.getPrototypeOf(pa.components) !== pc.components) {
      var own = pa.components || {};
      pa.components = Object.create(pc.components);
      // Preserve any handles registered before this facade ran.
      Object.keys(own).forEach(function (k) { pa.components[k] = own[k]; });
    }
  } else {
    // ================= MODE 2 — standalone bootstrap =======================
    // pure-css is absent; create the whole runtime ourselves, exactly as
    // pure-admin did before Stage C (so pure-admin still works alone).
    pa.components = pa.components || {};

    // --- events: a tiny topic bus ---------------------------------------
    if (!pa.events) {
      var topics = {};
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
        topics: function () { return Object.keys(topics); },
        listenerCount: function (topic) { return topics[topic] ? topics[topic].size : 0; }
      };
    }

    // --- debug ----------------------------------------------------------
    if (!pa.debug) {
      var enabled = {};
      var known = {};
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
        aspects: function () {
          var out = {};
          Object.keys(known).forEach(function (k) { out[k] = enabled[k] === true; });
          return out;
        }
      };
    }

    // --- viewport -------------------------------------------------------
    if (!pa.viewport) {
      var vp = pa.viewport = { width: 0, height: 0, orientation: 'landscape' };
      var raf = null;
      function measure() {
        vp.width = window.innerWidth;
        vp.height = window.innerHeight;
        vp.orientation = vp.height >= vp.width ? 'portrait' : 'landscape';
      }
      measure();
      window.addEventListener('resize', function () {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          measure();
          pa.events.emit('viewport:resize', vp);
        });
      }, { passive: true });

      var mq = window.matchMedia('(orientation: portrait)');
      var onOrient = function () { measure(); pa.events.emit('viewport:orientation', vp); };
      if (mq.addEventListener) mq.addEventListener('change', onOrient);
      else if (mq.addListener) mq.addListener(onOrient);
    }

    // --- colorScheme ----------------------------------------------------
    if (!pa.colorScheme) {
      var cs = pa.colorScheme = { mode: 'light' };
      var csmq = window.matchMedia('(prefers-color-scheme: dark)');
      var readScheme = function () { cs.mode = csmq.matches ? 'dark' : 'light'; };
      readScheme();
      var onScheme = function () { readScheme(); pa.events.emit('colorscheme:change', cs); };
      if (csmq.addEventListener) csmq.addEventListener('change', onScheme);
      else if (csmq.addListener) csmq.addListener(onScheme);
    }

    // --- config (foundation half — only present standalone) -------------
    if (!pa.config) pa.config = {};
    (function initFoundationConfig(cfg) {
      function readCssNumber(name, fallback) {
        try {
          var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
          var n = parseFloat(raw);
          return isNaN(n) ? fallback : n;
        } catch (e) { return fallback; }
      }
      function fillDefaults(target, defs) {
        Object.keys(defs).forEach(function (k) {
          if (target[k] === undefined) target[k] = defs[k];
        });
      }
      if (cfg.mobileBreakpoint == null) {
        cfg.mobileBreakpoint = readCssNumber('--pc-mobile-breakpoint', 768);
      }
      if (cfg.typingDebounceDelay == null) cfg.typingDebounceDelay = 300;
      if (cfg.tabletMinShortSide == null) cfg.tabletMinShortSide = 600;
      cfg.fit = cfg.fit || {};
      fillDefaults(cfg.fit, { defaultPriority: 0 });
      cfg.containerBreakpoint = cfg.containerBreakpoint || {};
      fillDefaults(cfg.containerBreakpoint, { hysteresis: 1, hiddenClass: 'd-none' });
    })(pa.config);

    // --- device ---------------------------------------------------------
    if (!pa.device) {
      var dev = pa.device = { class: 'desktop', isTouchPrimary: false };
      var coarseMq = window.matchMedia('(pointer: coarse)');
      var hoverMq = window.matchMedia('(hover: hover)');
      var classifyDevice = function () {
        var touchPrimary = coarseMq.matches && !hoverMq.matches;
        dev.isTouchPrimary = touchPrimary;
        if (!touchPrimary) return 'desktop';
        var shortSide = Math.min(window.innerWidth, window.innerHeight);
        var line = (pa.config && pa.config.tabletMinShortSide) || 600;
        return shortSide < line ? 'mobile' : 'tablet';
      };
      var reclassify = function () {
        var next = classifyDevice();
        if (next === dev.class) return;
        dev.class = next;
        pa.events.emit('device:change', dev);
      };
      dev.class = classifyDevice();
      pa.events.on('viewport:resize', reclassify);
      pa.events.on('viewport:orientation', reclassify);
      if (coarseMq.addEventListener) {
        coarseMq.addEventListener('change', reclassify);
        hoverMq.addEventListener('change', reclassify);
      } else if (coarseMq.addListener) {
        coarseMq.addListener(reclassify);
        hoverMq.addListener(reclassify);
      }
    }

    // --- overlay --------------------------------------------------------
    if (!pa.overlay) {
      var lockCount = 0;
      var stashedOverflow = null;
      pa.overlay = {
        lockBodyScroll: function () {
          if (lockCount === 0) {
            stashedOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
          }
          lockCount++;
          var released = false;
          return function () {
            if (released) return;
            released = true;
            lockCount = Math.max(0, lockCount - 1);
            if (lockCount === 0 && stashedOverflow !== null) {
              document.body.style.overflow = stashedOverflow;
              stashedOverflow = null;
            }
          };
        },
        observeKeyboardInset: function (panel) {
          var vv = window.visualViewport;
          if (!vv || !panel) return function () {};
          var raf2 = null;
          var apply = function () {
            raf2 = null;
            panel.style.height = vv.height + 'px';
            panel.style.top = vv.offsetTop + 'px';
          };
          var schedule = function () {
            if (raf2) return;
            raf2 = requestAnimationFrame(apply);
          };
          vv.addEventListener('resize', schedule);
          vv.addEventListener('scroll', schedule);
          schedule();
          return function () {
            vv.removeEventListener('resize', schedule);
            vv.removeEventListener('scroll', schedule);
            panel.style.height = '';
            panel.style.top = '';
          };
        }
      };
    }

    // --- menus ----------------------------------------------------------
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

    // --- components.initAll ---------------------------------------------
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
  }

  // ================= ADMIN-only config defaults (BOTH modes) ==============
  // Applied onto pa.config — which, in mode 1, IS pureCss.config by reference.
  // transition / toast / severity are admin surfaces (motion sequencing, the
  // toast service, severity-driven UI), NOT foundation, so they live here.
  (function initAdminConfig(cfg) {
    if (!cfg) return;

    function fillDefaults(target, defs) {
      Object.keys(defs).forEach(function (k) {
        if (target[k] === undefined) target[k] = defs[k];
      });
    }
    function readCssString(name, fallback) {
      try {
        var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v || fallback;
      } catch (e) { return fallback; }
    }
    // Resolve a duration CSS variable to MILLISECONDS via a probe element (calc()
    // motion tokens don't resolve on an unregistered custom property).
    function readCssMs(name, fallbackMs) {
      try {
        var probe = document.createElement('div');
        probe.style.cssText = 'position:absolute;visibility:hidden;transition-duration:var(' + name + ')';
        document.documentElement.appendChild(probe);
        var v = getComputedStyle(probe).transitionDuration;
        document.documentElement.removeChild(probe);
        var n = parseFloat(v);
        if (isNaN(n)) return fallbackMs;
        return v.indexOf('ms') !== -1 ? n : n * 1000;
      } catch (e) { return fallbackMs; }
    }

    // transition.* (ms) + easing — MIRROR the SCSS motion scale via CSS vars.
    cfg.transition = cfg.transition || {};
    fillDefaults(cfg.transition, {
      fast: readCssMs('--pc-transition-fast', 100),
      normal: readCssMs('--pc-transition-normal', 150),
      medium: readCssMs('--pc-transition-medium', 250),
      slow: readCssMs('--pc-transition-slow', 300),
      easing: readCssString('--pc-easing-snappy', 'ease-out')
    });

    // toast.* — defaults for pureAdmin.toast.
    cfg.toast = cfg.toast || {};
    fillDefaults(cfg.toast, {
      position: 'top-end', // logical, RTL-aware
      duration: 5000,
      showProgress: false,
      persistent: false,
      closeOnBackdrop: false
    });

    // severity.* — per-level presentation (icon + title). Core ships EMOJI icons.
    cfg.severity = cfg.severity || {};
    fillDefaults(cfg.severity, {
      primary: { icon: 'ℹ️', title: 'Primary' },
      success: { icon: '✓', title: 'Success' },
      danger: { icon: '✕', title: 'Error' },
      warning: { icon: '⚠', title: 'Warning' },
      info: { icon: 'ℹ', title: 'Information' }
    });
  })(pa.config);
})();
