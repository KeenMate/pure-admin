/**
 * Pure Admin — Fit (priority-driven container degradation)
 *
 * Generalises the priority/collapse idea from `navbar-collapse.js` (which folds
 * NAV MENU items) to EVERY slot in a horizontal container: brand, version, page
 * title, a search box, actions — or, on any flex row (a toolbar, a filter bar, a
 * form's action row), whatever you put in it. When the row can't fit all its
 * content, slots degrade one at a time, LOWEST PRIORITY FIRST, each using its
 * declared strategy, until the row fits. When space returns, everything restores.
 *
 * The navbar (`.pa-navbar__inner`) auto-inits; any other container opts in with
 * `pureAdmin.components.fit.init(el)` (aliased `navFit` for back-compat).
 *
 * Declare participation with attributes on any element inside the container:
 *
 *   data-pa-fit="hide"      — remove the slot when it must yield.
 *   data-pa-fit="steps"     — the slot holds ranked variants; show the LARGEST
 *                             that fits, degrading step 0 → 1 → 2 … → hidden.
 *                             The A/B/C idea: e.g. full logo → wordmark →
 *                             monogram, or a search pill → just its icon.
 *   data-pa-fit="relocate"  — move the slot OUT of the row into a named
 *                             destination when it must yield, restored on widen.
 *                             WHERE it goes is a registered sink named by
 *                             data-pa-fit-target ("sidebar" | "floating-menu" |
 *                             a custom sink you register). fit only DECIDES;
 *                             the sink PLACES. `data-pa-fit="sidebar"` is sugar
 *                             for relocate + target=sidebar.
 *
 *   data-pa-fit-priority="N"  — degrade order; LOWER degrades first. When omitted,
 *                               resolves to the nearest ancestor's
 *                               data-pa-fit-default-priority, else
 *                               pureAdmin.config.fit.defaultPriority, else 0.
 *   data-pa-fit-step="0"      — on a `steps` slot's DIRECT children; 0 = largest
 *                               / the default. Numbers, ascending = smaller.
 *   data-pa-fit-target="sidebar"       — (relocate) which sink places the slot.
 *   data-pa-fit-target-selector="#sel" — (relocate) destination element for sinks
 *                                        that need one (sidebar: the <ul> to move
 *                                        into; default: first `.pa-sidebar__nav > ul`).
 *   data-pa-fit-managed                — (relocate) HANDS-OFF: fit fires the event
 *                                        + hides the slot in-row but does NOT move
 *                                        the DOM. A framework wrapper owns placement
 *                                        and re-renders the block from state (fresh
 *                                        data, never a stale moved node). Same effect
 *                                        as calling preventDefault() on the event.
 *
 * Group opt-in / opt-out (so you don't have to tag every child):
 *
 *   data-pa-fit-auto        — on a CONTAINER: fold ALL its direct children into
 *                             the fit set. Children with their own data-pa-fit
 *                             keep it; the rest become implicit `hide` slots at
 *                             the default priority (so an un-ranked control drops
 *                             first). Use for a toolbar/filter bar you want to
 *                             shrink without ranking each button.
 *   data-pa-fit-ignore      — PIN this element: never a slot, even next to
 *                             declared siblings or inside a data-pa-fit-auto
 *                             container. Use for a burger, a notification bell,
 *                             a profile avatar, a form's submit button.
 *   data-pa-fit-default-priority="N"  — on a container: the priority implicit /
 *                             un-ranked descendants inherit (overrides the global
 *                             config default for that subtree).
 *
 * Example:
 *   <div class="pa-app-header">
 *     <span data-pa-fit="steps" data-pa-fit-priority="30">
 *       <span data-pa-fit-step="0">Pure Admin</span>   <!-- widest, default -->
 *       <span data-pa-fit-step="1">PA</span>            <!-- narrowest -->
 *     </span>
 *     <span class="pa-app-header__version" data-pa-fit="hide" data-pa-fit-priority="10">v2.9.0</span>
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
 * Relocation events (on the slot element, bubbling):
 *   pa:fit-relocate  — CustomEvent, cancelable. detail = { action:'out'|'in',
 *                      target, container }. Fires once per flip. preventDefault()
 *                      (or data-pa-fit-managed) → fit performs NO DOM move; the
 *                      listener owns placement.
 *
 * Public API (on window.pureAdmin.components.fit, alias .navFit):
 *   init(container)          — wire one fit container (idempotent)
 *   initAll(scope)           — wire every navbar fit container under scope
 *   relayoutAll()            — force a re-measure (e.g. after markup changes)
 *   registerSink(name, sink) — add a relocation destination. sink =
 *                              { out(el, ctx) -> mount|false, in(el, ctx) }.
 *                              Built-ins: 'sidebar', 'floating-menu'.
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

  function isIgnored(el) {
    return el.nodeType === 1 && el.hasAttribute('data-pa-fit-ignore');
  }

  // The priority a slot without its own data-pa-fit-priority falls back to.
  function configDefaultPriority() {
    var pa = window.pureAdmin;
    var v = pa && pa.config && pa.config.fit && pa.config.fit.defaultPriority;
    return typeof v === 'number' && !isNaN(v) ? v : 0;
  }

  // Resolve a slot's priority: its own data-pa-fit-priority wins; else the
  // nearest ancestor (up to and including the container) carrying
  // data-pa-fit-default-priority; else the global config default; else 0.
  function resolvePriority(el, container) {
    if (el.hasAttribute('data-pa-fit-priority')) {
      var own = parseFloat(el.getAttribute('data-pa-fit-priority'));
      if (!isNaN(own)) return own;
    }
    var node = el.parentNode;
    while (node && node.nodeType === 1) {
      if (node.hasAttribute('data-pa-fit-default-priority')) {
        var d = parseFloat(node.getAttribute('data-pa-fit-default-priority'));
        if (!isNaN(d)) return d;
      }
      if (node === container) break;
      node = node.parentNode;
    }
    return configDefaultPriority();
  }

  // Build one slot descriptor. Declared slots read their strategy/steps from the
  // markup; implicit slots (folded in by a data-pa-fit-auto container) are always
  // a plain `hide`.
  function describeSlot(el, container, implicit) {
    var strategy = 'hide';
    var steps = [];
    var target = null;
    if (!implicit) {
      strategy = el.getAttribute('data-pa-fit') || 'hide';
      // 'sidebar' is sugar for relocate → the built-in 'sidebar' sink.
      if (strategy === 'sidebar') { strategy = 'relocate'; target = 'sidebar'; }
      if (strategy !== 'hide' && strategy !== 'steps' && strategy !== 'relocate') strategy = 'hide';
      if (strategy === 'relocate') {
        target = el.getAttribute('data-pa-fit-target') || target || 'sidebar';
      }
      if (strategy === 'steps') {
        var children = el.children;
        for (var c = 0; c < children.length; c++) {
          if (children[c].hasAttribute('data-pa-fit-step')) steps.push(children[c]);
        }
        steps.sort(function (a, b) { return stepIndex(a) - stepIndex(b); });
      }
    }
    return {
      el: el,
      strategy: strategy,
      target: target,          // relocate: name of the destination sink
      priority: resolvePriority(el, container),
      steps: steps,
      domIndex: 0,   // assigned after the document-order sort below
      state: 0,      // current degradation level
      // maxState: how far a slot can degrade.
      maxState: strategy === 'steps' ? steps.length /* last step + then hidden */ : 1
    };
  }

  // Collect participating slots under a container. Two sources:
  //   1. DECLARED — any [data-pa-fit] element (its strategy/priority as written).
  //   2. IMPLICIT — the direct children of any [data-pa-fit-auto] container that
  //      didn't declare their own data-pa-fit; folded in as `hide` @ default
  //      priority so an un-ranked control yields first.
  // data-pa-fit-ignore excludes an element from both. domIndex is assigned in
  // document order so equal-priority ties break "later element first" (trailing
  // decoration yields before leading content).
  function collectSlots(container) {
    var i, k;

    var declared = [];
    var els = container.querySelectorAll('[data-pa-fit]');
    for (i = 0; i < els.length; i++) {
      if (!isIgnored(els[i])) declared.push(els[i]);
    }

    // Armed containers: every [data-pa-fit-auto] inside, plus the container
    // itself if it carries the attribute.
    var autoParents = [];
    var autos = container.querySelectorAll('[data-pa-fit-auto]');
    for (i = 0; i < autos.length; i++) autoParents.push(autos[i]);
    if (container.nodeType === 1 && container.hasAttribute('data-pa-fit-auto')) {
      autoParents.push(container);
    }

    var implicit = [];
    for (i = 0; i < autoParents.length; i++) {
      var kids = autoParents[i].children;
      for (k = 0; k < kids.length; k++) {
        var kid = kids[k];
        if (kid.hasAttribute('data-pa-fit')) continue;   // already a declared slot
        if (isIgnored(kid)) continue;                    // pinned out
        if (implicit.indexOf(kid) === -1) implicit.push(kid);
      }
    }

    var slots = [];
    for (i = 0; i < declared.length; i++) slots.push(describeSlot(declared[i], container, false));
    for (i = 0; i < implicit.length; i++) slots.push(describeSlot(implicit[i], container, true));

    slots.sort(function (a, b) {
      var pos = a.el.compareDocumentPosition(b.el);
      if (pos & 4 /* DOCUMENT_POSITION_FOLLOWING */) return -1; // a precedes b
      if (pos & 2 /* DOCUMENT_POSITION_PRECEDING */) return 1;
      return 0;
    });
    for (i = 0; i < slots.length; i++) slots[i].domIndex = i;

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
    } else if (slot.strategy === 'relocate') {
      // Every relayout starts by pulling relocated nodes home (resetAll), so a
      // relocate slot is always in-row during measurement. Hidden here means
      // "won't fit — will move to its sink (or a managed wrapper renders it
      // elsewhere)". reconcileRelocate acts on the settled state afterwards.
      setHidden(slot.el, s >= 1);
    }
  }

  // --- Relocation: fit decides, a SINK places -----------------------------
  // fit.js only decides a slot must yield; WHERE it goes is a registered sink
  // keyed by data-pa-fit-target. A sink is:
  //   out(el, ctx) -> mount | false   place `el`; return an opaque mount (passed
  //                                   back to in), or false to refuse (→ acts
  //                                   like `hide`). Do NOT manage `el`'s home —
  //                                   the engine leaves a placeholder and moves
  //                                   `el` back itself.
  //   in(el, ctx)                     tear down the destination wrapper; ctx.mount
  //                                   is what out() returned. The engine has
  //                                   already moved `el` back to its placeholder.
  // Before invoking a sink, fit fires a cancelable `pa:fit-relocate` on the
  // element. A framework (svelte/phoenix) preventDefault()s it — or the slot /
  // container carries data-pa-fit-managed — to own placement itself: it hides
  // in-row (already done) and re-renders the block from state, so restored
  // content is always fresh, never a stale moved node.
  var sinks = {};
  function registerSink(name, sink) { if (name && sink) sinks[name] = sink; }

  function isManaged(slot, container) {
    return slot.el.hasAttribute('data-pa-fit-managed') ||
      (container.nodeType === 1 && container.hasAttribute('data-pa-fit-managed'));
  }

  function dispatchRelocate(slot, action, container) {
    var detail = { action: action, target: slot.target, container: container };
    var ev;
    try {
      ev = new CustomEvent('pa:fit-relocate', { bubbles: true, cancelable: true, detail: detail });
    } catch (e) {
      ev = document.createEvent('CustomEvent');
      ev.initCustomEvent('pa:fit-relocate', true, true, detail);
    }
    slot.el.dispatchEvent(ev);
    return ev;
  }

  // Physically move a slot out through its sink, leaving a placeholder comment
  // at its home so it restores to the exact spot. Returns a record, or null if
  // the sink refused / is unknown (slot then behaves like `hide`).
  function relocateOut(slot, container) {
    var el = slot.el, sink = sinks[slot.target];
    if (!sink) return null;
    var placeholder = document.createComment('pa-fit-slot');
    el.parentNode.insertBefore(placeholder, el);
    setHidden(el, false); // visible in its new home
    var mount = sink.out(el, { container: container, target: slot.target });
    if (mount === false || mount == null) {
      // Refused (e.g. no sidebar present). Undo: pull el back, drop placeholder,
      // hide in row.
      if (el.parentNode !== placeholder.parentNode) placeholder.parentNode.insertBefore(el, placeholder);
      placeholder.parentNode.removeChild(placeholder);
      setHidden(el, true);
      return null;
    }
    return { el: el, placeholder: placeholder, sink: sink, target: slot.target, mount: mount };
  }

  // Move a relocated node home and tear down its sink wrapper.
  function restoreRec(rec) {
    if (rec.placeholder && rec.placeholder.parentNode) {
      rec.placeholder.parentNode.insertBefore(rec.el, rec.placeholder);
      rec.placeholder.parentNode.removeChild(rec.placeholder);
    }
    try { if (rec.sink && rec.sink.in) rec.sink.in(rec.el, { target: rec.target, mount: rec.mount }); } catch (e) {}
    setHidden(rec.el, false);
  }

  // Pull every relocated node back home so the next measure sees natural width
  // and collectSlots finds the full set again. This is what makes relocation a
  // pure function of width (restore-on-widen falls out for free).
  function resetAll(entry) {
    if (!entry.relocs || !entry.relocs.length) return;
    var recs = entry.relocs; entry.relocs = [];
    for (var i = 0; i < recs.length; i++) restoreRec(recs[i]);
  }

  // After the degrade loop settles, relocate slots whose state says "out".
  // Events fire only on a real flip (deduped via el.__paFitOut) so a framework
  // listener isn't spammed every resize frame.
  function reconcileRelocate(entry, container, slots) {
    slots.forEach(function (slot) {
      if (slot.strategy !== 'relocate') return;
      var wantOut = slot.state >= 1;
      var was = slot.el.__paFitOut === true;
      if (wantOut !== was) dispatchRelocateFlip(slot, wantOut, container, entry);
      else if (wantOut && !isManaged(slot, container)) {
        // No user-visible flip, but resetAll pulled it home this pass — put it
        // back out (no event) so a stable narrow width keeps it relocated.
        var rec = relocateOut(slot, container);
        if (rec) entry.relocs.push(rec);
      }
    });
  }

  function dispatchRelocateFlip(slot, wantOut, container, entry) {
    var ev = dispatchRelocate(slot, wantOut ? 'out' : 'in', container);
    slot.el.__paFitOut = wantOut;
    // Managed / prevented: the framework owns placement. Node stays hidden
    // in-row (applyMeasureState); nothing to move. Restore ('in') is likewise
    // the framework's job.
    if (ev.defaultPrevented || isManaged(slot, container)) return;
    if (wantOut) {
      var rec = relocateOut(slot, container);
      if (rec) entry.relocs.push(rec);
    }
    // Non-managed 'in' already happened in resetAll() at the top of relayout.
  }

  // --- Built-in sink: sidebar --------------------------------------------
  // Rebuilds the slot as a sidebar list item under the app sidebar's nav <ul>.
  // Target <ul>: data-pa-fit-target-selector (or legacy data-pa-fit-sidebar-target),
  // else the first `.pa-sidebar__nav > ul`.
  registerSink('sidebar', {
    out: function (el, ctx) {
      var sel = el.getAttribute('data-pa-fit-target-selector') || el.getAttribute('data-pa-fit-sidebar-target');
      var ul = sel ? document.querySelector(sel) : document.querySelector('.pa-sidebar__nav > ul');
      if (!ul) return false;
      var li = document.createElement('li');
      li.className = 'pa-sidebar__item pa-fit-relocated';
      li.appendChild(el);
      ul.appendChild(li);
      return { wrapper: li };
    },
    in: function (el, ctx) {
      var li = ctx.mount && ctx.mount.wrapper; // el already moved home by the engine
      if (li && li.parentNode) li.parentNode.removeChild(li);
    }
  });

  // --- Built-in sink: floating-menu --------------------------------------
  // Self-contained flyout — needs no sidebar, so it works on sidebar-less pages.
  // One trigger (pinned in the container, ignored by fit) + one panel (on body)
  // per container, created lazily and hidden when empty.
  var flyouts = [];
  function flyoutFor(container) {
    for (var i = 0; i < flyouts.length; i++) if (flyouts[i].container === container) return flyouts[i];
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'pa-fit-flyout__trigger';
    trigger.setAttribute('data-pa-fit-ignore', '');
    trigger.setAttribute('aria-label', 'More');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.style.display = 'none';
    trigger.innerHTML = '<span class="pa-fit-flyout__dots" aria-hidden="true"></span>';
    var panel = document.createElement('div');
    panel.className = 'pa-fit-flyout__panel';
    var f = { container: container, trigger: trigger, panel: panel, count: 0 };
    function reposition() {
      var r = trigger.getBoundingClientRect();
      panel.style.top = (r.bottom + 4) + 'px';
      panel.style.left = 'auto';
      panel.style.right = Math.max(4, window.innerWidth - r.right) + 'px';
    }
    function close() { panel.classList.remove('pa-fit-flyout__panel--open'); trigger.setAttribute('aria-expanded', 'false'); }
    function open() { reposition(); panel.classList.add('pa-fit-flyout__panel--open'); trigger.setAttribute('aria-expanded', 'true'); }
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.classList.contains('pa-fit-flyout__panel--open')) close(); else open();
    });
    document.addEventListener('click', function (e) {
      if (e.target !== trigger && !trigger.contains(e.target) && !panel.contains(e.target)) close();
    });
    window.addEventListener('resize', function () {
      if (panel.classList.contains('pa-fit-flyout__panel--open')) reposition();
    });
    f.close = close;
    container.appendChild(trigger);
    document.body.appendChild(panel);
    flyouts.push(f);
    return f;
  }
  registerSink('floating-menu', {
    out: function (el, ctx) {
      var f = flyoutFor(ctx.container);
      var item = document.createElement('div');
      item.className = 'pa-fit-flyout__item pa-fit-relocated';
      item.appendChild(el);
      f.panel.appendChild(item);
      f.count++;
      f.trigger.style.display = '';
      return { wrapper: item, flyout: f };
    },
    in: function (el, ctx) {
      var m = ctx.mount || {};
      if (m.wrapper && m.wrapper.parentNode) m.wrapper.parentNode.removeChild(m.wrapper);
      if (m.flyout) {
        m.flyout.count = Math.max(0, m.flyout.count - 1);
        if (m.flyout.count === 0) { m.flyout.trigger.style.display = 'none'; m.flyout.close && m.flyout.close(); }
      }
    }
  });

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

    // Pull any relocated nodes home FIRST, so we measure natural width and
    // collectSlots sees the full set again (relocation = pure function of width).
    resetAll(entry);

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
    // Fit-managed navs (data-pa-fit-nav) fold first too — same reason.
    relayoutAllNav();

    var guard = 0;
    while (overflowing(container) && guard++ < 100) {
      var s = nextToDegrade(slots);
      if (!s) break; // nothing left to give
      s.state += 1;
      applyMeasureState(s);
    }

    reconcileRelocate(entry, container, slots);
  }

  function schedule(entry) {
    if (entry.raf) return;
    entry.raf = (typeof requestAnimationFrame === 'function')
      ? requestAnimationFrame(function () { entry.raf = null; relayout(entry); })
      : (relayout(entry), null);
  }

  function init(container) {
    if (!container || container.__paFitInit) return;
    // Nothing to manage unless there's a declared slot, an armed sub-container,
    // or the container itself is armed (data-pa-fit-auto with no tagged child).
    var armedSelf = container.nodeType === 1 && container.hasAttribute('data-pa-fit-auto');
    if (!armedSelf && !container.querySelector('[data-pa-fit], [data-pa-fit-auto]')) return;
    container.__paFitInit = true;

    var entry = { container: container, slots: [], raf: null, relocs: [] };
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

  // ======================================================================
  // NAV COLLAPSE — a nav is a fit container whose ITEMS degrade (Option A:
  // ported from navbar-collapse.js into the one engine). A nav's <li>s fold,
  // lowest-priority first, into a sink chosen by data-pa-fit-nav
  // ("sidebar" | "menu" | "off"), restoring as space returns.
  //
  //   <nav class="pa-navmenu" data-pa-fit-nav="sidebar"
  //        data-pa-fit-nav-label="Menu"&gt;…
  //
  // Per-<li>: data-pa-fit-nav-priority (lower drops first),
  //   data-pa-nav-icon (sidebar icon), data-pa-fit-nav="hide" (drop, don't
  //   relocate). Nav config: data-pa-fit-nav-target (sidebar <ul> selector),
  //   data-pa-fit-nav-label / -icon, data-pa-fit-nav-more-label (menu).
  //
  // Measurement is NAV-specific — sums the <li> bounding widths vs
  // nav.clientWidth (the nav is overflow:visible so item hover-dropdowns aren't
  // clipped), NOT scrollWidth. This is the key reason it lived in its own file;
  // now it's one engine with a per-container measure.
  // ======================================================================
  var NAV_SELECTOR = '.pa-navmenu[data-pa-fit-nav]';
  var navRelayouts = [];

  function navDirectChild(parent, tag) {
    for (var c = parent.firstElementChild; c; c = c.nextElementSibling) {
      if (c.tagName && c.tagName.toLowerCase() === tag) return c;
    }
    return null;
  }
  function navEscapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // MENU sink — fold items into a generated "More ▾" nav dropdown (on <body>).
  function navMenuStrategy(nav, ul) {
    var moreLabel = nav.getAttribute('data-pa-fit-nav-more-label') || 'More';
    var moreLi = document.createElement('li');
    moreLi.className = 'pa-navmenu__item pa-navmenu__item--more';
    var moreLink = document.createElement('a');
    moreLink.href = '#';
    moreLink.className = 'pa-navmenu__link';
    moreLink.setAttribute('aria-haspopup', 'true');
    moreLink.setAttribute('aria-expanded', 'false');
    moreLink.innerHTML = navEscapeHtml(moreLabel) +
      ' <span class="pa-navmenu__more-chevron" aria-hidden="true">›</span>';
    moreLi.appendChild(moreLink);
    ul.appendChild(moreLi);
    moreLi.style.display = 'none';

    var menu = document.createElement('ul');
    menu.className = 'pa-navmenu__dropdown pa-navmenu__more-menu';
    menu.setAttribute('role', 'menu');
    document.body.appendChild(menu);

    function position() {
      var r = moreLink.getBoundingClientRect();
      menu.style.position = 'fixed';
      menu.style.top = (r.bottom + 4) + 'px';
      menu.style.left = 'auto';
      menu.style.right = (window.innerWidth - r.right) + 'px';
    }
    function isOpen() { return menu.classList.contains('pa-navmenu__more-menu--open'); }
    function openMenu() {
      if (menu.children.length === 0) return;
      position();
      menu.classList.add('pa-navmenu__more-menu--open');
      moreLi.classList.add('is-open');
      moreLink.setAttribute('aria-expanded', 'true');
      window.addEventListener('scroll', position, true);
      window.addEventListener('resize', position);
      setTimeout(function () { document.addEventListener('mousedown', onDocClick); }, 0);
    }
    function closeMenu() {
      menu.classList.remove('pa-navmenu__more-menu--open');
      moreLi.classList.remove('is-open');
      moreLink.setAttribute('aria-expanded', 'false');
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
      document.removeEventListener('mousedown', onDocClick);
    }
    function onDocClick(e) {
      if (menu.contains(e.target) || moreLi.contains(e.target)) return;
      closeMenu();
    }
    moreLink.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (isOpen()) closeMenu(); else openMenu();
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setTimeout(closeMenu, 0);
    });

    return {
      count: function () { return menu.children.length; },
      restore: function (el) { if (el.parentNode === menu) ul.insertBefore(el, moreLi); },
      afterRestore: function () { moreLi.style.display = 'none'; closeMenu(); },
      onFits: function () {},
      onOverflow: function () {},
      collapse: function (el) { moreLi.style.display = ''; menu.appendChild(el); }
    };
  }

  // SIDEBAR sink — build genuine .pa-sidebar__* markup from each nav item under
  // an injected section heading. Leaf → link item; dropdown parent → collapsible
  // toggle group (chevron, starts closed, parent's own page first). The original
  // nav <li> is kept detached and re-inserted on restore.
  function navSidebarStrategy(nav, ul) {
    var targetSel = nav.getAttribute('data-pa-fit-nav-target');
    var target = targetSel ? document.querySelector(targetSel) : document.querySelector('.pa-sidebar__nav > ul');
    var label = nav.getAttribute('data-pa-fit-nav-label') || 'Menu';
    var defaultIcon = nav.getAttribute('data-pa-fit-nav-icon');
    if (defaultIcon == null) defaultIcon = '•';

    var section = null, divider = null;
    function ensureSection() {
      if (!target) return null;
      if (!section) {
        section = document.createElement('li');
        section.className = 'pa-sidebar__section';
        section.setAttribute('data-pa-nav-injected', '');
        section.textContent = label;
      }
      if (!divider) {
        divider = document.createElement('li');
        divider.className = 'pa-sidebar__divider';
        divider.setAttribute('data-pa-nav-injected', '');
        divider.setAttribute('aria-hidden', 'true');
      }
      if (section.parentNode !== target) target.insertBefore(section, target.firstChild);
      if (divider.parentNode !== target) target.insertBefore(divider, section.nextSibling);
      return section;
    }
    function removeSection() {
      if (section && section.parentNode) section.parentNode.removeChild(section);
      if (divider && divider.parentNode) divider.parentNode.removeChild(divider);
    }
    function labelOf(a) { return (a ? a.textContent : '').replace(/\s*[›»>]+\s*$/, '').trim(); }
    function iconHtml(icon) { return icon ? '<span class="pa-sidebar__icon">' + navEscapeHtml(icon) + '</span>' : ''; }
    function labelHtml(text) { return '<span class="pa-sidebar__label">' + navEscapeHtml(text) + '</span>'; }
    function buildLinkItem(text, href, icon, active) {
      var li = document.createElement('li');
      li.className = 'pa-sidebar__item';
      var a = document.createElement('a');
      a.className = 'pa-sidebar__link' + (active ? ' pa-sidebar__link--active' : '');
      a.setAttribute('href', href == null ? '#' : href);
      a.innerHTML = iconHtml(icon) + labelHtml(text);
      li.appendChild(a);
      return li;
    }
    function buildSidebarItem(navLi) {
      var link = navDirectChild(navLi, 'a');
      var sub = navDirectChild(navLi, 'ul');
      var icon = navLi.getAttribute('data-pa-nav-icon');
      if (icon == null) icon = defaultIcon;
      var text = labelOf(link);
      var href = link ? link.getAttribute('href') : null;
      var active = navLi.classList.contains('pa-navmenu__item--active');
      var isReal = href && href !== '#' && href.charAt(href.length - 1) !== '#';
      if (!sub) return buildLinkItem(text, href, icon, active);

      var li = document.createElement('li');
      li.className = 'pa-sidebar__item' + (active ? ' pa-sidebar__item--open' : '');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pa-sidebar__toggle';
      btn.setAttribute('aria-expanded', active ? 'true' : 'false');
      btn.innerHTML = iconHtml(icon) + labelHtml(text) +
        '<span class="pa-sidebar__chevron" aria-hidden="true">›</span>';
      li.appendChild(btn);
      var submenu = document.createElement('ul');
      submenu.className = 'pa-sidebar__submenu' + (active ? ' pa-sidebar__submenu--open' : '');
      if (isReal) submenu.appendChild(buildLinkItem(text, href, icon, active));
      for (var c = sub.firstElementChild; c; c = c.nextElementSibling) {
        if (c.tagName && c.tagName.toLowerCase() === 'li') submenu.appendChild(buildSidebarItem(c));
      }
      li.appendChild(submenu);
      btn.addEventListener('click', function () {
        var open = !li.classList.contains('pa-sidebar__item--open');
        li.classList.toggle('pa-sidebar__item--open', open);
        submenu.classList.toggle('pa-sidebar__submenu--open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      return li;
    }

    return {
      count: function () { return target ? target.querySelectorAll('[data-pa-nav-collapsed]').length : 0; },
      restore: function (el) {
        if (el.__paCollapsed) {
          var node = el.__paSidebarNode;
          if (node && node.parentNode) node.parentNode.removeChild(node);
          el.__paSidebarNode = null;
          el.__paCollapsed = false;
        }
        ul.appendChild(el);
      },
      afterRestore: function () {
        if (target && !target.querySelector('[data-pa-nav-collapsed]')) removeSection();
      },
      onFits: function () { removeSection(); },
      onOverflow: function () {},
      collapse: function (el) {
        if (!target || el.__paCollapsed) return;
        ensureSection();
        var node = buildSidebarItem(el);
        node.setAttribute('data-pa-nav-collapsed', '');
        el.__paSidebarNode = node;
        el.__paCollapsed = true;
        if (el.parentNode) el.parentNode.removeChild(el);
        target.insertBefore(node, section.nextSibling);
      }
    };
  }

  function initNav(nav) {
    if (!nav || nav.__paFitNavInit) return;
    var mode = nav.getAttribute('data-pa-fit-nav') || 'menu';
    if (mode === 'off') return;
    if (mode !== 'menu' && mode !== 'sidebar') mode = 'menu';
    nav.__paFitNavInit = true;

    var ul = nav.querySelector(':scope > ul');
    if (!ul) return;

    var items = Array.prototype.slice.call(ul.children).filter(function (el) { return el.nodeType === 1; });
    if (items.length === 0) return;

    var ordered = items.map(function (el, idx) {
      var raw = parseInt(el.getAttribute('data-pa-fit-nav-priority'), 10);
      var priority = isNaN(raw) ? 0 : raw;
      var hide = el.getAttribute('data-pa-fit-nav') === 'hide';
      return { el: el, priority: priority, domIndex: idx, hide: hide };
    });
    var dropOrder = ordered.slice().sort(function (a, b) {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.domIndex - a.domIndex;
    });

    var strategy = (mode === 'sidebar') ? navSidebarStrategy(nav, ul) : navMenuStrategy(nav, ul);

    function contentWidth() {
      var cs = getComputedStyle(ul);
      var gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
      var total = 0, count = 0, kids = ul.children;
      for (var i = 0; i < kids.length; i++) {
        var k = kids[i];
        if (k.nodeType !== 1) continue;
        if (getComputedStyle(k).display === 'none') continue;
        total += k.getBoundingClientRect().width;
        count++;
      }
      if (count > 1) total += gap * (count - 1);
      return total;
    }
    function overflowing() { return contentWidth() > nav.clientWidth + 1; }

    function relayout() {
      ordered.slice().sort(function (a, b) { return a.domIndex - b.domIndex; })
        .forEach(function (item) {
          if (item.hide) item.el.style.display = '';
          strategy.restore(item.el);
        });
      strategy.afterRestore();

      if (!overflowing()) { strategy.onFits(); return; }

      strategy.onOverflow();
      for (var i = 0; i < dropOrder.length; i++) {
        if (!overflowing()) break;
        if (dropOrder[i].hide) dropOrder[i].el.style.display = 'none';
        else strategy.collapse(dropOrder[i].el);
      }
    }

    navRelayouts.push(relayout);
    (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : function (f) { f(); })(relayout);

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () { relayout(); });
      ro.observe(nav);
      var inner = nav.closest('.pa-navbar__inner') || nav.parentNode;
      if (inner) ro.observe(inner);
    } else if (window.pureAdmin && window.pureAdmin.events) {
      window.pureAdmin.events.on('viewport:resize', relayout);
    } else {
      window.addEventListener('resize', relayout);
    }
  }

  function initAllNav(scope) {
    var root = scope || document;
    var els = root.querySelectorAll(NAV_SELECTOR);
    for (var i = 0; i < els.length; i++) initNav(els[i]);
  }
  function relayoutAllNav() { navRelayouts.forEach(function (fn) { fn(); }); }

  // Register the two nav sinks by name so a custom nav target is possible and
  // the fit + nav paths share one registry.
  registerSink('nav-sidebar', { nav: navSidebarStrategy });
  registerSink('nav-menu', { nav: navMenuStrategy });

  var pa = (window.pureAdmin = window.pureAdmin || {});
  var api = {
    init: init, initAll: initAll, relayoutAll: relayoutAll, registerSink: registerSink,
    initNav: initNav, initAllNav: initAllNav, relayoutAllNav: relayoutAllNav
  };
  // `fit` is the canonical name (the engine is container-generic now); `navFit`
  // stays as a back-compat alias for existing callers.
  (pa.components = pa.components || {}).fit = api;
  pa.components.navFit = api;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); initAllNav(); });
  } else {
    initAll();
    initAllNav();
  }
})();
