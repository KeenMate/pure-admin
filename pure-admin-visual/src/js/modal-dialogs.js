/**
 * Pure Admin Modal Dialogs
 * Promise-based programmatic modal system (confirm, alert, prompt)
 *
 * Usage:
 *   const result = await PureAdmin.confirm({ title: 'Delete?', message: '...' });
 *   await PureAdmin.alert({ title: 'Success!', message: '...' });
 *   const value = await PureAdmin.prompt({ title: 'Enter name:', message: '...' });
 */

(function(window) {
  'use strict';

  // Namespace
  const PureAdmin = window.PureAdmin || {};
  window.PureAdmin = PureAdmin;

  // Modal counter for unique IDs
  let modalCounter = 0;

  /**
   * Create modal element with given structure
   */
  function createModal(options) {
    const {
      id,
      size = 'sm',
      variant = null,
      title,
      message,
      footer
    } = options;

    const modal = document.createElement('div');
    modal.className = 'pa-modal pa-modal--show';
    modal.id = id;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', `${id}-title`);

    // Container size class
    const containerClass = size === 'md'
      ? 'pa-modal__container'
      : `pa-modal__container pa-modal__container--${size}`;

    // Header class with optional variant
    const headerClass = variant
      ? `pa-modal__header pa-modal__header--${variant}`
      : 'pa-modal__header';

    modal.innerHTML = `
      <div class="pa-modal__backdrop"></div>
      <div class="${containerClass}">
        <div class="${headerClass}">
          <h3 class="pa-modal__title" id="${id}-title">${escapeHtml(title)}</h3>
        </div>
        <div class="pa-modal__body">
          <p>${escapeHtml(message)}</p>
          ${options.inputHtml || ''}
        </div>
        <div class="pa-modal__footer">
          ${footer}
        </div>
      </div>
    `;

    return modal;
  }

  /**
   * Show modal and return promise that resolves when user responds
   */
  function showModal(modal, options = {}) {
    return new Promise((resolve) => {
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Add to DOM
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      document.body.style.paddingRight = scrollbarWidth + 'px'; // Compensate for scrollbar

      // Focus first input if exists, otherwise first button
      setTimeout(() => {
        const firstInput = modal.querySelector('input, textarea');
        const firstButton = modal.querySelector('button');
        if (firstInput) {
          firstInput.focus();
        } else if (firstButton) {
          firstButton.focus();
        }
      }, 100);

      // Store resolve function for cleanup
      modal._resolve = resolve;

      // Backdrop click to close (if enabled)
      if (options.closeOnBackdrop !== false) {
        const backdrop = modal.querySelector('.pa-modal__backdrop');
        if (backdrop) {
          backdrop.addEventListener('click', () => {
            closeModal(modal, options.cancelValue);
          });
        }
      }

      // ESC key to close
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          closeModal(modal, options.cancelValue);
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
      modal._escHandler = escHandler;
    });
  }

  /**
   * Close modal and resolve promise
   */
  function closeModal(modal, value) {
    if (!modal._resolve) return;

    // Remove show class (triggers fade out)
    modal.classList.remove('pa-modal--show');

    // Wait for animation, then remove from DOM
    setTimeout(() => {
      // Clean up event listeners
      if (modal._escHandler) {
        document.removeEventListener('keydown', modal._escHandler);
      }

      // Restore body overflow and padding
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // Resolve promise
      modal._resolve(value);
      modal._resolve = null;

      // Remove from DOM
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300); // Match modal transition time
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
   * CONFIRM DIALOG
   * Shows a confirmation dialog with OK/Cancel buttons
   * Returns Promise<boolean> - true if confirmed, false if cancelled
   */
  PureAdmin.confirm = function(options = {}) {
    console.log('#1 confirm() called with options:', options);

    const {
      title = 'Confirm',
      message = 'Are you sure?',
      confirmText = 'OK',
      cancelText = 'Cancel',
      variant = 'primary',
      size = 'sm',
      confirmVariant = variant,
      closeOnBackdrop = true
    } = options;

    const id = `pa-modal-confirm-${++modalCounter}`;
    console.log('#2 Creating modal with ID:', id);

    // Create footer with two buttons
    const footer = `
      <button type="button" class="pa-btn pa-btn--secondary" data-action="cancel">
        ${escapeHtml(cancelText)}
      </button>
      <button type="button" class="pa-btn pa-btn--${confirmVariant}" data-action="confirm">
        ${escapeHtml(confirmText)}
      </button>
    `;

    console.log('#3 Calling createModal()');
    const modal = createModal({
      id,
      size,
      variant,
      title,
      message,
      footer
    });
    console.log('#4 Modal element created:', modal);

    // Attach button handlers
    const confirmBtn = modal.querySelector('[data-action="confirm"]');
    const cancelBtn = modal.querySelector('[data-action="cancel"]');
    console.log('#5 Buttons found:', { confirmBtn, cancelBtn });

    confirmBtn.addEventListener('click', () => closeModal(modal, true));
    cancelBtn.addEventListener('click', () => closeModal(modal, false));

    // Enter key confirms
    const enterHandler = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        closeModal(modal, true);
        document.removeEventListener('keydown', enterHandler);
      }
    };
    document.addEventListener('keydown', enterHandler);
    modal._enterHandler = enterHandler;

    console.log('#6 Calling showModal()');
    return showModal(modal, { closeOnBackdrop, cancelValue: false });
  };

  /**
   * ALERT DIALOG
   * Shows an alert dialog with single OK button
   * Returns Promise<void> - resolves when user clicks OK
   */
  PureAdmin.alert = function(options = {}) {
    const {
      title = 'Alert',
      message = '',
      okText = 'OK',
      variant = 'primary',
      size = 'sm',
      closeOnBackdrop = true
    } = options;

    const id = `pa-modal-alert-${++modalCounter}`;

    // Create footer with single button
    const footer = `
      <button type="button" class="pa-btn pa-btn--${variant}" data-action="ok">
        ${escapeHtml(okText)}
      </button>
    `;

    const modal = createModal({
      id,
      size,
      variant,
      title,
      message,
      footer
    });

    // Attach button handler
    const okBtn = modal.querySelector('[data-action="ok"]');
    okBtn.addEventListener('click', () => closeModal(modal, true));

    // Enter key confirms
    const enterHandler = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        closeModal(modal, true);
        document.removeEventListener('keydown', enterHandler);
      }
    };
    document.addEventListener('keydown', enterHandler);
    modal._enterHandler = enterHandler;

    return showModal(modal, { closeOnBackdrop, cancelValue: true });
  };

  /**
   * PROMPT DIALOG
   * Shows a prompt dialog with text input
   * Returns Promise<string | null> - string if submitted, null if cancelled
   */
  PureAdmin.prompt = function(options = {}) {
    const {
      title = 'Input',
      message = 'Enter value:',
      defaultValue = '',
      placeholder = '',
      confirmText = 'OK',
      cancelText = 'Cancel',
      variant = 'primary',
      size = 'sm',
      validator = null,
      closeOnBackdrop = true
    } = options;

    const id = `pa-modal-prompt-${++modalCounter}`;
    const inputId = `${id}-input`;
    const errorId = `${id}-error`;

    // Create input HTML
    const inputHtml = `
      <div class="pa-form-group" style="margin-top: 1rem;">
        <div class="pa-input-wrapper">
          <input
            type="text"
            id="${inputId}"
            class="pa-input"
            value="${escapeHtml(defaultValue)}"
            placeholder="${escapeHtml(placeholder)}"
            aria-describedby="${errorId}"
          />
        </div>
        <div id="${errorId}" class="pa-form-error" style="display: none;"></div>
      </div>
    `;

    // Create footer with two buttons
    const footer = `
      <button type="button" class="pa-btn pa-btn--secondary" data-action="cancel">
        ${escapeHtml(cancelText)}
      </button>
      <button type="button" class="pa-btn pa-btn--${variant}" data-action="confirm">
        ${escapeHtml(confirmText)}
      </button>
    `;

    const modal = createModal({
      id,
      size,
      variant,
      title,
      message,
      inputHtml,
      footer
    });

    // Get elements
    const input = modal.querySelector(`#${inputId}`);
    const errorDiv = modal.querySelector(`#${errorId}`);
    const confirmBtn = modal.querySelector('[data-action="confirm"]');
    const cancelBtn = modal.querySelector('[data-action="cancel"]');

    // Validation function
    function validate() {
      if (!validator) return true;

      const value = input.value;
      const result = validator(value);

      if (result === true) {
        input.classList.remove('pa-input--error');
        errorDiv.style.display = 'none';
        return true;
      } else {
        input.classList.add('pa-input--error');
        errorDiv.textContent = typeof result === 'string' ? result : 'Invalid input';
        errorDiv.style.display = 'block';
        return false;
      }
    }

    // Attach button handlers
    confirmBtn.addEventListener('click', () => {
      if (validate()) {
        closeModal(modal, input.value);
      }
    });

    cancelBtn.addEventListener('click', () => closeModal(modal, null));

    // Enter key submits
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (validate()) {
          closeModal(modal, input.value);
        }
      }
    });

    // Clear error on input
    if (validator) {
      input.addEventListener('input', () => {
        if (errorDiv.style.display !== 'none') {
          validate();
        }
      });
    }

    return showModal(modal, { closeOnBackdrop: false, cancelValue: null });
  };

  /**
   * CUSTOM DIALOG
   * Advanced API for fully custom modal content
   * Returns Promise that resolves with whatever value you pass to resolve()
   */
  PureAdmin.custom = function(options = {}) {
    const {
      title = 'Dialog',
      size = 'md',
      variant = null,
      closeOnBackdrop = true,
      render
    } = options;

    if (typeof render !== 'function') {
      throw new Error('PureAdmin.custom() requires a render function');
    }

    const id = `pa-modal-custom-${++modalCounter}`;

    const modal = document.createElement('div');
    modal.className = 'pa-modal pa-modal--show';
    modal.id = id;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    // Container size class
    const containerClass = size === 'md'
      ? 'pa-modal__container'
      : `pa-modal__container pa-modal__container--${size}`;

    // Header class with optional variant
    const headerClass = variant
      ? `pa-modal__header pa-modal__header--${variant}`
      : 'pa-modal__header';

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'pa-modal__backdrop';
    modal.appendChild(backdrop);

    // Create container
    const container = document.createElement('div');
    container.className = containerClass;

    // Create header
    const headerDiv = document.createElement('div');
    headerDiv.className = headerClass;
    headerDiv.innerHTML = `<h3 class="pa-modal__title">${escapeHtml(title)}</h3>`;
    container.appendChild(headerDiv);

    modal.appendChild(container);

    // Render function gets container and close callback
    const closeCallback = (value) => closeModal(modal, value);
    render(container, closeCallback);

    return showModal(modal, { closeOnBackdrop, cancelValue: null });
  };

  console.log('✅ PureAdmin Modal Dialogs loaded');
  console.log('Available methods:', Object.keys(PureAdmin));

})(window);
