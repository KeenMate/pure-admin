/**
 * Pure Admin Toast Service
 * Programmatic toast notification system
 *
 * Usage:
 *   pureAdmin.toast.success('Operation completed!');
 *   pureAdmin.toast.error('Something went wrong', { position: 'top-end' });
 *   pureAdmin.toast.show({ variant: 'warning', title: 'Warning', message: '...', persistent: true });
 *   pureAdmin.toast.dismiss(toastId);
 */

(function(window) {
  'use strict';

  // Namespace
  const pureAdmin = window.pureAdmin || {};
  window.pureAdmin = pureAdmin;

  // Toast counter for unique IDs
  let toastCounter = 0;

  // Defaults live in the shared UI baseline (window.pureAdmin.config, populated
  // by pure-admin.js) — one place to tune toasts + severity icons/titles. Read
  // at use-time so a consumer override is honoured; the literals are a
  // last-resort guard for when the bootstrap isn't present.
  // NOTE: this file is the demo's (feature-ahead) copy of the core toast-service
  // — it shadows packages/core/src/js/toast-service.js via the demo's /src/js
  // route. Both read config; see docs/config-shared-ui-baseline.md.
  function paConfig() {
    return (window.pureAdmin && window.pureAdmin.config) || {};
  }

  function toastDefaults() {
    const t = paConfig().toast || {};
    return {
      position: t.position != null ? t.position : 'top-end',
      duration: t.duration != null ? t.duration : 5000,
      showProgress: !!t.showProgress,
      persistent: !!t.persistent,
      closeOnBackdrop: !!t.closeOnBackdrop
    };
  }

  function severityFor(variant) {
    const s = (paConfig().severity || {})[variant] || {};
    return {
      icon: s.icon != null ? s.icon : 'ℹ',
      title: s.title != null ? s.title : 'Notification'
    };
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Ensure toast container exists for given position
   */
  function ensureContainer(position) {
    const containerId = `toast-container-${position}`;
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = `pa-toast-container pa-toast-container--${position}`;
      document.body.appendChild(container);
    }

    return container;
  }

  /**
   * Create and show a toast notification
   */
  function createToast(options) {
    const variant = options.variant || 'info';
    const d = toastDefaults();
    const sev = severityFor(variant);
    const {
      title = sev.title,
      message = '',
      position = d.position,
      duration = d.duration,
      showProgress = d.showProgress,
      persistent = d.persistent,
      filled = false,
      progressColor = null,
      actions = null, // Array of { label, variant, onClick }
      maxWidth = null // Custom max-width (e.g. '50rem', '500px')
    } = options;

    // Generate unique ID
    const toastId = `pa-toast-${++toastCounter}`;

    // Ensure container exists
    const container = ensureContainer(position);

    // Create toast element
    const toast = document.createElement('div');
    const variantClass = filled ? `pa-toast--filled-${variant}` : `pa-toast--${variant}`;
    toast.className = `pa-toast ${variantClass}`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    if (maxWidth) toast.style.maxWidth = maxWidth;

    // Build toast HTML
    const progressStyle = progressColor
      ? `width: 100%; color: ${progressColor};`
      : 'width: 100%;';
    const progressHtml = showProgress && !persistent
      ? `<div class="pa-toast__progress" style="${progressStyle}"></div>`
      : '';

    // Build actions HTML
    let actionsHtml = '';
    if (actions && actions.length) {
      const btns = actions.map(a =>
        `<button class="pa-btn pa-btn--xs pa-btn--${a.variant || 'secondary'}" data-action="${escapeHtml(a.label)}">${escapeHtml(a.label)}</button>`
      ).join('');
      actionsHtml = `<div class="pa-toast__actions">${btns}</div>`;
    }

    toast.innerHTML = `
      <div class="pa-toast__icon">${sev.icon}</div>
      <div class="pa-toast__content">
        <div class="pa-toast__title">${escapeHtml(title)}</div>
        <div class="pa-toast__message">${escapeHtml(message)}</div>
        ${actionsHtml}
      </div>
      <button class="pa-toast__close" aria-label="Close">✕</button>
      ${progressHtml}
    `;

    // Append to container
    container.appendChild(toast);

    // Attach close button handler
    const closeBtn = toast.querySelector('.pa-toast__close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent toast click handler from firing
      dismissToast(toastId);
    });

    // Attach action button handlers
    if (actions && actions.length) {
      const actionBtns = toast.querySelectorAll('.pa-toast__actions .pa-btn');
      actionBtns.forEach((btn, i) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (actions[i].onClick) actions[i].onClick(toastId);
          dismissToast(toastId);
        });
      });
    }

    // Make toasts without actions clickable to dismiss
    if (!actions || !actions.length) {
      toast.style.cursor = 'pointer';
      toast.addEventListener('click', () => dismissToast(toastId));
    }

    // Show toast with animation, then ratchet container min-width
    setTimeout(() => {
      toast.classList.add('pa-toast--show');

      // Ratchet: once visible, lock container to its peak width
      requestAnimationFrame(() => {
        const currentWidth = container.offsetWidth;
        const peakWidth = parseInt(container.dataset.peakWidth || '0', 10);
        if (currentWidth > peakWidth) {
          container.dataset.peakWidth = currentWidth;
          container.style.minWidth = currentWidth + 'px';
        }
      });
    }, 10);

    // Progress bar animation
    if (showProgress && !persistent) {
      const progress = toast.querySelector('.pa-toast__progress');
      if (progress) {
        progress.style.transition = `width ${duration}ms linear`;
        setTimeout(() => {
          progress.style.width = '0%';
        }, 50);
      }
    }

    // Auto-dismiss (only if not persistent)
    if (!persistent) {
      setTimeout(() => {
        dismissToast(toastId);
      }, duration);
    }

    return toastId;
  }

  /**
   * Dismiss a toast by ID
   */
  function dismissToast(toastId) {
    const toast = document.getElementById(toastId);
    if (!toast) return;

    toast.classList.remove('pa-toast--show');
    toast.classList.add('pa-toast--hide');

    setTimeout(() => {
      if (toast.parentNode) {
        const container = toast.parentNode;
        container.removeChild(toast);

        // Reset peak width when container is empty
        if (!container.querySelector('.pa-toast')) {
          container.style.minWidth = '';
          container.dataset.peakWidth = '0';
        }
      }
    }, 300); // Match toast transition time
  }

  /**
   * Dismiss all toasts (optionally filtered by position)
   */
  function dismissAll(position = null) {
    const selector = position
      ? `#toast-container-${position} .pa-toast`
      : '.pa-toast';

    const toasts = document.querySelectorAll(selector);
    toasts.forEach(toast => {
      if (toast.id) {
        dismissToast(toast.id);
      }
    });
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  /**
   * Toast namespace
   */
  pureAdmin.toast = {
    /**
     * Show a toast with full control over options
     * @param {Object} options - Toast configuration
     * @returns {string} - Toast ID for programmatic dismissal
     */
    show: function(options = {}) {
      return createToast(options);
    },

    /**
     * Show a success toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options (position, duration, etc.)
     * @returns {string} - Toast ID
     */
    success: function(message, options = {}) {
      return createToast({
        variant: 'success',
        message,
        ...options
      });
    },

    /**
     * Show an error toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     * @returns {string} - Toast ID
     */
    error: function(message, options = {}) {
      return createToast({
        variant: 'danger',
        message,
        ...options
      });
    },

    /**
     * Show a warning toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     * @returns {string} - Toast ID
     */
    warning: function(message, options = {}) {
      return createToast({
        variant: 'warning',
        message,
        ...options
      });
    },

    /**
     * Show an info toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     * @returns {string} - Toast ID
     */
    info: function(message, options = {}) {
      return createToast({
        variant: 'info',
        message,
        ...options
      });
    },

    /**
     * Show a primary toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     * @returns {string} - Toast ID
     */
    primary: function(message, options = {}) {
      return createToast({
        variant: 'primary',
        message,
        ...options
      });
    },

    /**
     * Dismiss a specific toast by ID
     * @param {string} toastId - Toast ID returned from show/success/error/etc
     */
    dismiss: function(toastId) {
      dismissToast(toastId);
    },

    /**
     * Dismiss all toasts (optionally filtered by position)
     * @param {string} position - Optional position filter (e.g., 'top-end')
     */
    dismissAll: function(position = null) {
      dismissAll(position);
    }
  };

  console.log('✅ Pure Admin Toast Service loaded');
  console.log('Available methods:', Object.keys(pureAdmin.toast));

})(window);
