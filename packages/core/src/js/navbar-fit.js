/**
 * Pure Admin — Navbar Fit (priority-driven header degradation)
 *
 * Generalises the priority/collapse idea from `navbar-collapse.js` (which folds
 * NAV MENU items) to EVERY header slot: brand, version, page title, a search
 * box, actions — anything. When the header row can't fit all its content, slots
 * degrade one at a time, LOWEST PRIORITY FIRST, each using its declared
 * strategy, until the row fits. When space returns, everything restores.
 *
 * Declare participation with attributes on any element inside the fit container
 * (default `.pa-navbar__inner`):
 *
 *   data-pa-fit="hide"      — remove the slot when it must yield.
 *   data-pa-fit="steps"     — the slot holds ranked variants; show the LARGEST
 *                             that fits, degrading step 0 → 1 → 2 … → hidden.
 *                             The A/B/C idea: e.g. full logo → wordmark →
 *                             monogram, or a search pill → just its icon.
 *   data-pa-fit="sidebar"   — relocate the slot into the sidebar (like the nav's
 *                             own sidebar collapse), restored on widen.
 *
 *   data-pa-fit-priority="N"  — degrade order; LOWER degrades first (default 0).
 *   data-pa-fit-step="0"      — on a `steps` slot's DIRECT children; 0 = largest
 *                               / the default. Numbers, ascending = smaller.
 *   data-pa-fit-sidebar-target="#sel"  — (sidebar) the <ul> to move into
 *                                        (default: first `.pa-sidebar__nav > ul`).
 *
 * Example:
 *   <div class="pa-header__brand">
 *     <span data-pa-fit="steps" data-pa-fit-priority="30">
 *       <span data-pa-fit-step="0">Pure Admin</span>   <!-- widest, default -->
 *       <span data-pa-fit-step="1">PA</span>            <!-- narrowest -->
 *     </span>
 *     <span class="pa-header__version" data-pa-fit="hide" data-pa-fit-priority="10">v2.9.0</span>
 *   </div>
 *
 * Measurement: the row's "needed" width is the sum of the fit container's direct
 * section scrollWidths (+ gaps). scrollWidth reports each section's CONTENT width
 * even when a flex child is squeezed — so a title clipped behind the brand still
 * counts its true width and triggers a degrade before anything overlaps. The
 * algorithm is RESET-THEN-DEGRADE: every pass restores all slots to natural,
 * then degrades to fit. That makes the result a pure function of the width (no
 * hysteresis, no oscillation) and sidesteps the "freed space is absorbed by the
 * flex:1 centre slot, so a restore is undetectable" trap.
 *
 * Coordinates with navbar-collapse.js automatically: hiding a slot changes the
 * nav's available width, whose own ResizeObserver then re-folds its items.
 *
 * Public API (on window.pureAdmin.components.navFit):
 *   init(container)  — wire one fit container (idempotent)
 *   initAll(scope)   — wire every fit container under scope
 *   relayoutAll()    — force a re-measure (e.g. after markup changes)
 */
(function () {
  'use strict';

  var CONTAINER_SELECTOR = '.pa-navbar__inner';
  // Toggled to hide a slot / an inactive step. A class (not inline display) so
  // "show" reverts to the element's natural stylesheet display; `!important` so
  // it beats component rules like `.pa-navbar-search { display: flex }`.
  var HIDDEN_CLASS = 'pa-fit-hidden';
  var containers = [];

  function stepIndex(el) {
    return parseFloat(el.getAttribute('data-pa-fit-step')) || 0;
  }

  // Collect participating slots under a container, sorted by degrade order:
  // lowest priority first, ties broken by DOM order (later element first, so
  // trailing decoration yields before leading content at equal priority).
  function collectSlots(container) {
    var els = container.querySelectorAll('[data-pa-fit]');
    var slots = [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var strategy = el.getAttribute('data-pa-fit') || 'hide';
      if (strategy !== 'hide' && strategy !== 'steps' && strategy !== 'sidebar') strategy = 'hide';
      var steps = [];
      if (strategy === 'steps') {
        var children = el.children;
        for (var c = 0; c < children.length; c++) {
          if (children[c].hasAttribute('data-pa-fit-step')) steps.push(children[c]);
        }
        steps.sort(function (a, b) { return stepIndex(a) - stepIndex(b); });
      }
      slots.push({
        el: el,
        strategy: strategy,
        priority: parseFloat(el.getAttribute('data-pa-fit-priority')) || 0,
        steps: steps,
        domIndex: i,
        state: 0,      // current degradation level
        inSidebar: false,
        home: null     // { parent, next } saved when relocated
      });
    }
    // maxState: how far a slot can degrade.
    slots.forEach(function (s) {
      s.maxState = s.strategy === 'steps' ? s.steps.length /* last step + then hidden */ : 1;
    });
    return slots;
  }

  // The furthest-along degrade first: pick the lowest-priority slot not yet at
  // its maxState. Tie-break: later DOM position degrades first.
  function nextToDegrade(slots) {
    var best = null;
    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      if (s.state >= s.maxState) continue;
      if (!best ||
          s.priority < best.priority ||
          (s.priority === best.priority && s.domIndex > best.domIndex)) {
        best = s;
      }
    }
    return best;
  }

  function setHidden(el, hidden) {
    if (hidden) el.classList.add(HIDDEN_CLASS);
    else el.classList.remove(HIDDEN_CLASS);
  }

  // Apply a slot's MEASUREMENT state — class toggles only, no DOM moves.
  // (Sidebar relocation is reconciled once, after the loop settles.)
  function applyMeasureState(slot) {
    var s = slot.state;
    if (slot.strategy === 'steps') {
      for (var i = 0; i < slot.steps.length; i++) {
        setHidden(slot.steps[i], i !== s);
      }
      // Past the last step → the whole slot is hidden.
      setHidden(slot.el, s >= slot.steps.length);
    } else if (slot.strategy === 'hide') {
      setHidden(slot.el, s >= 1);
    } else if (slot.strategy === 'sidebar') {
      // In-row proxy while measuring: hidden means "will live in the sidebar".
      // Only hide here if it's still in the row; if already relocated it's out.
      if (!slot.inSidebar) setHidden(slot.el, s >= 1);
    }
  }

  function defaultSidebarTarget(container) {
    // Prefer a sidebar in the same document; fall back to none.
    var ul = document.querySelector('.pa-sidebar__nav > ul');
    return ul || null;
  }

  // Reconcile sidebar relocation against the settled states (diff, so we only
  // touch the DOM when membership actually flips).
  function reconcileSidebar(container, slots) {
    slots.forEach(function (slot) {
      if (slot.strategy !== 'sidebar') return;
      var wantOut = slot.state >= 1;
      if (wantOut && !slot.inSidebar) {
        var target = slot.el.getAttribute('data-pa-fit-sidebar-target');
        target = target ? document.querySelector(target) : defaultSidebarTarget(container);
        if (!target) { return; } // no sidebar → leave hidden in row (proxy already applied)
        slot.home = { parent: slot.el.parentNode, next: slot.el.nextSibling };
        var li = document.createElement('li');
        li.className = 'pa-sidebar__item pa-fit-relocated';
        setHidden(slot.el, false); // visible in its new sidebar home
        li.appendChild(slot.el);
        target.appendChild(li);
        slot.wrapper = li;
        slot.inSidebar = true;
      } else if (!wantOut && slot.inSidebar) {
        if (slot.home && slot.home.parent) {
          slot.home.parent.insertBefore(slot.el, slot.home.next || null);
        }
        if (slot.wrapper && slot.wrapper.parentNode) slot.wrapper.parentNode.removeChild(slot.wrapper);
        slot.wrapper = null;
        slot.inSidebar = false;
        setHidden(slot.el, false);
      }
    });
  }

  // A section's CONTENT width. For a flex-GROWING section (the centre slot,
  // flex:1) scrollWidth reports the inflated box, not the content — so removing
  // content makes it grow and read *wider*, which would make the engine fight
  // itself and over-degrade. For those, sum the children instead; for fixed
  // sections (flex-grow:0) scrollWidth already equals content.
  function contentWidth(el) {
    if (parseFloat(getComputedStyle(el).flexGrow) > 0) {
      var w = 0, kids = el.children;
      for (var i = 0; i < kids.length; i++) {
        if (getComputedStyle(kids[i]).display !== 'none') w += kids[i].scrollWidth;
      }
      return w;
    }
    return el.scrollWidth;
  }

  function measure(container) {
    var cs = getComputedStyle(container);
    var gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
    var padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    var avail = container.clientWidth - padX;
    var kids = container.children, need = 0, vis = 0;
    for (var i = 0; i < kids.length; i++) {
      if (getComputedStyle(kids[i]).display === 'none') continue;
      need += contentWidth(kids[i]);
      vis++;
    }
    need += gap * Math.max(0, vis - 1);
    return { avail: avail, need: need };
  }

  function overflowing(container) {
    var m = measure(container);
    return m.need > m.avail + 1; // 1px tolerance for sub-pixel rounding
  }

  function relayout(entry) {
    var container = entry.container;
    var slots = entry.slots = collectSlots(container);

    // Reset every slot to natural, then degrade until it fits. Deterministic:
    // the settled state is a pure function of the current width.
    slots.forEach(function (s) { s.state = 0; applyMeasureState(s); });

    // Fold any collapsing nav FIRST (at the natural, widest slot state), so we
    // measure against a nav that's already shed what it can — otherwise we'd
    // over-degrade the header to fit items that fold into the sidebar anyway.
    var pa = window.pureAdmin;
    if (pa && pa.components && pa.components.navCollapse && pa.components.navCollapse.relayoutAll) {
      pa.components.navCollapse.relayoutAll();
    }

    var guard = 0;
    while (overflowing(container) && guard++ < 100) {
      var s = nextToDegrade(slots);
      if (!s) break; // nothing left to give
      s.state += 1;
      applyMeasureState(s);
    }

    reconcileSidebar(container, slots);
  }

  function schedule(entry) {
    if (entry.raf) return;
    entry.raf = (typeof requestAnimationFrame === 'function')
      ? requestAnimationFrame(function () { entry.raf = null; relayout(entry); })
      : (relayout(entry), null);
  }

  function init(container) {
    if (!container || container.__paFitInit) return;
    if (!container.querySelector('[data-pa-fit]')) return; // nothing to manage
    container.__paFitInit = true;

    var entry = { container: container, slots: [], raf: null };
    containers.push(entry);

    schedule(entry);

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () { schedule(entry); });
      ro.observe(container);
    } else if (window.pureAdmin && window.pureAdmin.events) {
      window.pureAdmin.events.on('viewport:resize', function () { schedule(entry); });
    } else {
      window.addEventListener('resize', function () { schedule(entry); });
    }
  }

  function initAll(scope) {
    var root = scope || document;
    var els = root.querySelectorAll(CONTAINER_SELECTOR);
    for (var i = 0; i < els.length; i++) init(els[i]);
  }

  function relayoutAll() {
    containers.forEach(schedule);
  }

  var pa = (window.pureAdmin = window.pureAdmin || {});
  (pa.components = pa.components || {}).navFit = { init: init, initAll: initAll, relayoutAll: relayoutAll };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }
})();
