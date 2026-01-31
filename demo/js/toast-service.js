/**
 * Pure Admin Toast Service
 * Programmatic toast notification system
 *
 * Usage:
 *   PureAdmin.toast.success('Operation completed!');
 *   PureAdmin.toast.error('Something went wrong', { position: 'top-end' });
 *   PureAdmin.toast.show({ variant: 'warning', title: 'Warning', message: '...', persistent: true });
 *   PureAdmin.toast.dismiss(toastId);
 */

(function(window) {
  'use strict';

  // Namespace
  const PureAdmin = window.PureAdmin || {};
  window.PureAdmin = PureAdmin;

  // Toast counter for unique IDs
  let toastCounter = 0;

  // Default configuration
  const defaults = {
    position: 'top-end',
    duration: 5000,
    showProgress: false,
    persistent: false,
    closeOnBackdrop: false
  };

  // Icon mapping for variants
  const icons = {
    primary: 'ℹ️',
    success: '✓',
    danger: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  // Title mapping for variants
  const titles = {
    primary: 'Primary',
    success: 'Success',
    danger: 'Error',
    warning: 'Warning',
    info: 'Information'
  };

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
    const {
      variant = 'info',
      title = titles[variant] || 'Notification',
      message = '',
      position = defaults.position,
      duration = defaults.duration,
      showProgress = defaults.showProgress,
      persistent = defaults.persistent
    } = options;

    // Generate unique ID
    const toastId = `pa-toast-${++toastCounter}`;

    // Ensure container exists
    const container = ensureContainer(position);

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `pa-toast pa-toast--${variant}`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // Build toast HTML
    const progressHtml = showProgress && !persistent
      ? '<div class="pa-toast__progress" style="width: 100%;"></div>'
      : '';

    toast.innerHTML = `
      <div class="pa-toast__icon">${icons[variant] || 'ℹ'}</div>
      <div class="pa-toast__content">
        <div class="pa-toast__title">${escapeHtml(title)}</div>
        <div class="pa-toast__message">${escapeHtml(message)}</div>
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

    // Make all toasts clickable to dismiss
    toast.style.cursor = 'pointer';
    toast.addEventListener('click', () => dismissToast(toastId));

    // Show toast with animation
    setTimeout(() => {
      toast.classList.add('pa-toast--show');
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
        toast.parentNode.removeChild(toast);
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
  PureAdmin.toast = {
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
        title: options.title || titles.success,
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
        title: options.title || titles.danger,
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
        title: options.title || titles.warning,
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
        title: options.title || titles.info,
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
        title: options.title || titles.primary,
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

  console.log('✅ PureAdmin Toast Service loaded');
  console.log('Available methods:', Object.keys(PureAdmin.toast));

})(window);
