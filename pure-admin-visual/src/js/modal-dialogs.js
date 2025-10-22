/**
 * Pure Admin Modal Dialogs
 * Promise-based programmatic modal dialogs for confirm, alert, and prompt actions
 */

(function() {
  'use strict';

  // Global PureAdmin namespace
  window.PureAdmin = window.PureAdmin || {};

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Create modal backdrop
   */
  function createBackdrop(closeOnBackdrop, resolveFn) {
    const backdrop = document.createElement('div');
    backdrop.className = 'pa-modal__backdrop';

    if (closeOnBackdrop) {
      backdrop.addEventListener('click', () => {
        resolveFn(false);
      });
    }

    return backdrop;
  }

  /**
   * Create modal container
   */
  function createModalContainer(size) {
    const container = document.createElement('div');
    container.className = 'pa-modal__container';

    if (size && size !== 'md') {
      container.classList.add(`pa-modal__container--${size}`);
    }

    return container;
  }

  /**
   * Create modal header
   */
  function createModalHeader(title, variant, onClose) {
    const header = document.createElement('div');
    header.className = 'pa-modal__header';

    if (variant && variant !== 'primary') {
      header.classList.add(`pa-modal__header--${variant}`);
    }

    const titleEl = document.createElement('h3');
    titleEl.className = 'pa-modal__title';
    titleEl.textContent = title;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'pa-btn pa-btn--primary pa-btn--icon-only pa-btn--sm';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', onClose);

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    return header;
  }

  /**
   * Create modal body
   */
  function createModalBody(content) {
    const body = document.createElement('div');
    body.className = 'pa-modal__body';

    if (typeof content === 'string') {
      const p = document.createElement('p');
      p.textContent = content;
      body.appendChild(p);
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }

    return body;
  }

  /**
   * Create modal footer
   */
  function createModalFooter(buttons) {
    const footer = document.createElement('div');
    footer.className = 'pa-modal__footer';

    buttons.forEach(btnConfig => {
      const btn = document.createElement('button');
      btn.className = `pa-btn pa-btn--${btnConfig.variant || 'primary'}`;
      btn.textContent = btnConfig.text;
      btn.addEventListener('click', btnConfig.onClick);
      footer.appendChild(btn);
    });

    return footer;
  }

  /**
   * Show modal with animation
   */
  function showModal(modal) {
    document.body.appendChild(modal);

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Trigger reflow for animation
    modal.offsetHeight;

    modal.classList.add('pa-modal--show');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = scrollbarWidth + 'px';
  }

  /**
   * Close modal with animation
   */
  function closeModal(modal) {
    modal.classList.remove('pa-modal--show');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Remove from DOM after animation
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }

  /**
   * Confirm Dialog
   * Returns Promise<boolean> - true if confirmed, false if cancelled
   */
  PureAdmin.confirm = function(options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Confirm',
        message = 'Are you sure?',
        confirmText = 'OK',
        cancelText = 'Cancel',
        variant = 'primary',
        confirmVariant = variant,
        size = 'sm',
        closeOnBackdrop = true
      } = options;

      // Create modal structure
      const modal = document.createElement('div');
      modal.className = 'pa-modal';

      // ENTER key handler - declare early
      let enterKeyHandler;

      const resolveAndClose = (result) => {
        closeModal(modal);
        resolve(result);

        // Remove event handlers
        document.removeEventListener('keydown', escKeyHandler);
        if (enterKeyHandler) {
          document.removeEventListener('keydown', enterKeyHandler);
        }
      };

      const backdrop = createBackdrop(closeOnBackdrop, () => resolveAndClose(false));
      const container = createModalContainer(size);
      const header = createModalHeader(title, variant, () => resolveAndClose(false));
      const body = createModalBody(message);
      const footer = createModalFooter([
        {
          text: cancelText,
          variant: 'secondary',
          onClick: () => resolveAndClose(false)
        },
        {
          text: confirmText,
          variant: confirmVariant,
          onClick: () => resolveAndClose(true)
        }
      ]);

      // Assemble modal
      container.appendChild(header);
      container.appendChild(body);
      container.appendChild(footer);
      modal.appendChild(backdrop);
      modal.appendChild(container);

      // ESC key handler
      const escKeyHandler = (e) => {
        if (e.key === 'Escape') {
          resolveAndClose(false);
        }
      };
      document.addEventListener('keydown', escKeyHandler);

      // ENTER key handler - confirm
      enterKeyHandler = (e) => {
        if (e.key === 'Enter') {
          resolveAndClose(true);
        }
      };
      document.addEventListener('keydown', enterKeyHandler);

      showModal(modal);

      // Focus confirm button
      setTimeout(() => {
        const confirmBtn = footer.lastElementChild;
        if (confirmBtn) confirmBtn.focus();
      }, 100);
    });
  };

  /**
   * Alert Dialog
   * Returns Promise<void> - resolves when user clicks OK
   */
  PureAdmin.alert = function(options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Alert',
        message = '',
        okText = 'OK',
        variant = 'primary',
        size = 'sm'
      } = options;

      // Create modal structure
      const modal = document.createElement('div');
      modal.className = 'pa-modal';

      const resolveAndClose = () => {
        closeModal(modal);
        resolve();

        // Remove ESC key handler
        document.removeEventListener('keydown', escKeyHandler);
        document.removeEventListener('keydown', enterKeyHandler);
      };

      const backdrop = createBackdrop(true, resolveAndClose);
      const container = createModalContainer(size);
      const header = createModalHeader(title, variant, resolveAndClose);
      const body = createModalBody(message);
      const footer = createModalFooter([
        {
          text: okText,
          variant: variant,
          onClick: resolveAndClose
        }
      ]);

      // Assemble modal
      container.appendChild(header);
      container.appendChild(body);
      container.appendChild(footer);
      modal.appendChild(backdrop);
      modal.appendChild(container);

      // ESC key handler
      const escKeyHandler = (e) => {
        if (e.key === 'Escape') {
          resolveAndClose();
        }
      };
      document.addEventListener('keydown', escKeyHandler);

      // ENTER key handler
      const enterKeyHandler = (e) => {
        if (e.key === 'Enter') {
          resolveAndClose();
        }
      };
      document.addEventListener('keydown', enterKeyHandler);

      showModal(modal);

      // Focus OK button
      setTimeout(() => {
        const okBtn = footer.firstElementChild;
        if (okBtn) okBtn.focus();
      }, 100);
    });
  };

  /**
   * Prompt Dialog
   * Returns Promise<string | null> - entered value or null if cancelled
   */
  PureAdmin.prompt = function(options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Input',
        message = 'Enter value:',
        defaultValue = '',
        placeholder = '',
        confirmText = 'OK',
        cancelText = 'Cancel',
        validator = null,
        variant = 'primary',
        size = 'sm'
      } = options;

      // Create modal structure
      const modal = document.createElement('div');
      modal.className = 'pa-modal';

      // Create input element
      const inputWrapper = document.createElement('div');
      const messageP = document.createElement('p');
      messageP.textContent = message;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'pa-input';
      input.value = defaultValue;
      input.placeholder = placeholder;
      input.style.width = '100%';
      input.style.marginTop = '0.5rem';

      const errorDiv = document.createElement('div');
      errorDiv.className = 'pa-alert pa-alert--danger';
      errorDiv.style.marginTop = '0.5rem';
      errorDiv.style.display = 'none';

      inputWrapper.appendChild(messageP);
      inputWrapper.appendChild(input);
      inputWrapper.appendChild(errorDiv);

      const resolveAndClose = (result) => {
        closeModal(modal);
        resolve(result);

        // Remove event handlers
        document.removeEventListener('keydown', escKeyHandler);
      };

      const validateAndConfirm = () => {
        const value = input.value;

        if (validator) {
          const validationResult = validator(value);

          if (validationResult !== true) {
            // Validation failed - show error
            errorDiv.textContent = validationResult;
            errorDiv.style.display = 'block';
            input.classList.add('pa-input--error');
            input.focus();
            return;
          }
        }

        resolveAndClose(value);
      };

      const backdrop = createBackdrop(true, () => resolveAndClose(null));
      const container = createModalContainer(size);
      const header = createModalHeader(title, variant, () => resolveAndClose(null));
      const body = createModalBody(inputWrapper);
      const footer = createModalFooter([
        {
          text: cancelText,
          variant: 'secondary',
          onClick: () => resolveAndClose(null)
        },
        {
          text: confirmText,
          variant: variant,
          onClick: validateAndConfirm
        }
      ]);

      // Assemble modal
      container.appendChild(header);
      container.appendChild(body);
      container.appendChild(footer);
      modal.appendChild(backdrop);
      modal.appendChild(container);

      // ESC key handler
      const escKeyHandler = (e) => {
        if (e.key === 'Escape') {
          resolveAndClose(null);
        }
      };
      document.addEventListener('keydown', escKeyHandler);

      // ENTER key handler
      const enterKeyHandler = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          validateAndConfirm();
        }
      };
      input.addEventListener('keydown', enterKeyHandler);

      // Clear error on input
      input.addEventListener('input', () => {
        errorDiv.style.display = 'none';
        input.classList.remove('pa-input--error');
      });

      showModal(modal);

      // Focus input
      setTimeout(() => {
        input.focus();
        input.select();
      }, 100);
    });
  };

})();
