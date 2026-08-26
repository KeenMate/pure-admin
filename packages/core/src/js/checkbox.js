/**
 * Pure Admin — Checkbox
 *
 * Two behaviours for the custom .pa-checkbox. The visuals (checkmark + dash)
 * are pure CSS via `input:checked` / `input:indeterminate`; the JS only exists
 * because `indeterminate` is a DOM PROPERTY, not an HTML attribute — it can't be
 * expressed in markup alone (same reason svelte-treeview sets it imperatively).
 *
 *  1. Static indeterminate — an <input type="checkbox" data-pa-indeterminate>
 *     is put into the indeterminate state on init. Use for a checkbox that
 *     should render as "mixed" without any cycling (e.g. a "select all" head
 *     reflecting a partial child selection you manage yourself).
 *
 *  2. Tri-state cycling — a .pa-checkbox marked data-pa-tristate cycles through
 *     three states on each click:
 *        default order            unchecked → checked → indeterminate → …
 *        data-pa-tristate-order="indeterminate-first"
 *                                 unchecked → indeterminate → checked → …
 *     Fires a bubbling `change` event after each transition so listeners can
 *     read input.checked / input.indeterminate.
 *
 * Registered as window.pureAdmin.components.checkbox ({ init, initAll }) and
 * self-inits on DOMContentLoaded, matching the other core behaviours.
 */
(function () {
  'use strict';

  function currentState(input) {
    if (input.indeterminate) return 'indeterminate';
    return input.checked ? 'checked' : 'unchecked';
  }

  function applyState(input, state) {
    input.indeterminate = state === 'indeterminate';
    input.checked = state === 'checked';
  }

  function nextState(state, indeterminateFirst) {
    if (indeterminateFirst) {
      // unchecked → indeterminate → checked → unchecked
      return state === 'unchecked' ? 'indeterminate'
        : state === 'indeterminate' ? 'checked'
        : 'unchecked';
    }
    // default: unchecked → checked → indeterminate → unchecked
    return state === 'unchecked' ? 'checked'
      : state === 'checked' ? 'indeterminate'
      : 'unchecked';
  }

  function wireTristate(label) {
    var input = label.querySelector('input[type="checkbox"]');
    if (!input || input.__paTristateWired) return;
    input.__paTristateWired = true;

    var indeterminateFirst =
      label.getAttribute('data-pa-tristate-order') === 'indeterminate-first';

    // Intercept the input's click so we can inject the indeterminate step the
    // browser's native toggle skips. preventDefault stops the default
    // checked-flip; we then drive the full three-state machine ourselves.
    input.addEventListener('click', function (ev) {
      ev.preventDefault();
      applyState(input, nextState(currentState(input), indeterminateFirst));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function initAll(scope) {
    var root = scope || document;

    root
      .querySelectorAll('input[type="checkbox"][data-pa-indeterminate]')
      .forEach(function (input) {
        input.indeterminate = true;
      });

    root
      .querySelectorAll('.pa-checkbox[data-pa-tristate]')
      .forEach(wireTristate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }

  var pa = (window.pureAdmin = window.pureAdmin || {});
  (pa.components = pa.components || {}).checkbox = { init: initAll, initAll: initAll };
})();
