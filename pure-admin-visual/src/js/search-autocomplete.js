/**
 * Search Field Autocomplete with Token-Based Query Builder
 * Provides field name suggestions when user types ":"
 * Then provides operator suggestions based on field type
 * Resolved fragments appear as token badges
 * Example: :name starts_with abc → [name][starts_with][abc]
 */

class SearchAutocomplete {
    constructor(inputElement, fields, options = {}) {
        this.input = inputElement;
        this.fields = fields;
        this.popup = null;
        this.tokensContainer = null;
        this.activeIndex = -1;
        this.isOpen = false;
        this.resolvedTokens = []; // { type: 'field'|'operator'|'value', value: string, variant: string }
        this.currentQueryState = 'idle'; // 'idle' | 'expecting-operator' | 'expecting-value'
        this.autocompleteResults = [];

        // Operator definitions by field type with shortcuts
        this.operators = {
            text: [
                { value: 'equals', label: 'Equals', shortcuts: ['eq', '='], description: 'Exact match' },
                { value: 'not_equals', label: 'Not Equals', shortcuts: ['neq', 'ne', '!='], description: 'Does not match' },
                { value: 'starts_with', label: 'Starts With', shortcuts: ['sw', 'startswith'], description: 'Starts with text' },
                { value: 'ends_with', label: 'Ends With', shortcuts: ['ew', 'endswith'], description: 'Ends with text' },
                { value: 'contains', label: 'Contains', shortcuts: ['c', 'has'], description: 'Contains text' },
                { value: 'not_contains', label: 'Not Contains', shortcuts: ['nc', 'notcontains'], description: 'Does not contain' }
            ],
            number: [
                { value: '=', label: 'Equals', shortcuts: ['eq', '=='], description: 'Exact value' },
                { value: '!=', label: 'Not Equals', shortcuts: ['neq', 'ne'], description: 'Different value' },
                { value: '>', label: 'Greater Than', shortcuts: ['gt'], description: 'Greater than value' },
                { value: '<', label: 'Less Than', shortcuts: ['lt'], description: 'Less than value' },
                { value: 'between', label: 'Between', shortcuts: ['bw', 'btw'], description: 'Between two values' },
                { value: '>=', label: 'Greater or Equal', shortcuts: ['gte', 'ge'], description: 'Greater or equal' },
                { value: '<=', label: 'Less or Equal', shortcuts: ['lte', 'le'], description: 'Less or equal' }
            ],
            date: [
                { value: 'equals', label: 'On Date', shortcuts: ['eq', '=', 'on'], description: 'Exact date' },
                { value: 'before', label: 'Before', shortcuts: ['bf', '<'], description: 'Before date' },
                { value: 'after', label: 'After', shortcuts: ['af', '>'], description: 'After date' },
                { value: 'between', label: 'Between', shortcuts: ['bw', 'btw'], description: 'Date range' },
                { value: 'in_last', label: 'In Last', shortcuts: ['last', 'past'], description: 'In last X days' },
                { value: 'in_next', label: 'In Next', shortcuts: ['next', 'future'], description: 'In next X days' }
            ]
        };

        this.init();
    }

    init() {
        // Find or create tokens container
        const wrapper = this.input.parentElement;
        this.tokensContainer = wrapper.querySelector('.pa-search-tokens');

        if (!this.tokensContainer) {
            this.tokensContainer = document.createElement('div');
            this.tokensContainer.className = 'pa-search-tokens';
            wrapper.insertBefore(this.tokensContainer, this.input);
        }

        // Create popup element
        this.popup = document.createElement('div');
        this.popup.className = 'pa-search-autocomplete';
        this.popup.style.display = 'none';
        document.body.appendChild(this.popup);

        // Event listeners
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        document.addEventListener('click', (e) => this.handleClickOutside(e));

        // Initialize state
        this.updateQueryState();
    }

    /**
     * Update query state based on number of tokens
     */
    updateQueryState() {
        const tokenCount = this.resolvedTokens.length % 3;

        if (tokenCount === 0) {
            this.currentQueryState = 'idle';
        } else if (tokenCount === 1) {
            this.currentQueryState = 'expecting-operator';
        } else if (tokenCount === 2) {
            this.currentQueryState = 'expecting-value';
        }
    }

    /**
     * Search for autocomplete suggestions
     */
    searchAutocomplete(query) {
        if (this.currentQueryState === 'idle') {
            // Search for fields (must start with :)
            if (query.startsWith(':')) {
                const searchTerm = query.substring(1).toLowerCase();
                return this.fields.filter(field =>
                    field.name.toLowerCase().includes(searchTerm)
                ).map(field => ({
                    value: field.name,
                    label: field.name,
                    description: `${field.type} field`,
                    type: field.type
                }));
            }
        } else if (this.currentQueryState === 'expecting-operator') {
            // Get the last resolved field token
            const lastFieldToken = this.resolvedTokens[this.resolvedTokens.length - 1];
            const fieldDef = this.fields.find(f => f.name === lastFieldToken.value);

            if (!fieldDef) return [];

            const operators = this.operators[fieldDef.type] || [];
            const searchTerm = query.toLowerCase();

            return operators.filter(op =>
                searchTerm === '' ||
                op.value.toLowerCase().includes(searchTerm) ||
                op.label.toLowerCase().includes(searchTerm) ||
                (op.shortcuts && op.shortcuts.some(s => s.toLowerCase().includes(searchTerm)))
            );
        }

        return [];
    }

    /**
     * Render autocomplete dropdown
     */
    renderAutocomplete() {
        if (this.autocompleteResults.length === 0) {
            this.close();
            return;
        }

        const isFieldSearch = this.currentQueryState === 'idle';
        let html = '';

        this.autocompleteResults.forEach((item, index) => {
            const isActive = index === this.activeIndex;
            const icon = isFieldSearch ? '🔍' : '⚡';

            html += `
                <div class="pa-search-autocomplete__item ${isActive ? 'pa-search-autocomplete__item--active' : ''}" data-index="${index}">
                    <span class="pa-search-autocomplete__item-icon">${icon}</span>
                    <div class="pa-search-autocomplete__item-content">
                        <span class="pa-search-autocomplete__item-name">${item.label}</span>
                        <span class="pa-search-autocomplete__item-type">${item.description}</span>
                    </div>
                    <span class="pa-search-autocomplete__item-badge">${item.value}</span>
                </div>
            `;
        });

        this.popup.innerHTML = html;

        // Add click handlers
        this.popup.querySelectorAll('.pa-search-autocomplete__item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectAutocomplete(this.autocompleteResults[index]);
            });
        });

        this.position();
        this.open();
    }

    /**
     * Select autocomplete item
     */
    selectAutocomplete(item) {
        if (!item) return;

        // Determine token type and variant
        let tokenType, variant;

        if (this.currentQueryState === 'idle') {
            tokenType = 'field';
            variant = 'primary';
        } else if (this.currentQueryState === 'expecting-operator') {
            tokenType = 'operator';
            variant = 'secondary';
        }

        // Add token
        this.resolvedTokens.push({
            type: tokenType,
            value: item.value,
            variant: variant
        });

        // Update state
        this.updateQueryState();

        // Clear input and autocomplete
        this.input.value = '';
        this.autocompleteResults = [];
        this.activeIndex = -1;

        // Re-render
        this.renderTokens();
        this.close();
        this.input.focus();

        // If we just selected a field, automatically show operators
        if (tokenType === 'field') {
            // Trigger operator autocomplete immediately
            setTimeout(() => {
                this.autocompleteResults = this.searchAutocomplete('');
                this.activeIndex = this.autocompleteResults.length > 0 ? 0 : -1;
                if (this.autocompleteResults.length > 0) {
                    this.renderAutocomplete();
                }
            }, 0);
        }
    }

    /**
     * Resolve value token (when user presses Enter or Tab)
     */
    resolveValueToken() {
        const value = this.input.value.trim();

        if (value && this.currentQueryState === 'expecting-value') {
            this.resolvedTokens.push({
                type: 'value',
                value: value,
                variant: 'success'
            });

            this.updateQueryState();
            this.input.value = '';
            this.renderTokens();
        }
    }

    /**
     * Render tokens as badge groups
     */
    renderTokens() {
        this.tokensContainer.innerHTML = '';

        // Group tokens into sets of 3 (field, operator, value)
        for (let i = 0; i < this.resolvedTokens.length; i += 3) {
            const queryTokens = this.resolvedTokens.slice(i, i + 3);

            // Create group container
            const group = document.createElement('div');
            group.className = 'pa-search-token-group';

            queryTokens.forEach((token, index) => {
                const badge = document.createElement('span');
                badge.className = `pa-badge pa-badge--${token.variant}`;
                badge.textContent = token.value;
                badge.style.margin = '0';
                badge.style.borderRadius = '0';

                // Round corners on first and last badges
                if (index === 0) {
                    badge.style.borderTopLeftRadius = '4px';
                    badge.style.borderBottomLeftRadius = '4px';
                }
                if (index === queryTokens.length - 1 || i + index === this.resolvedTokens.length - 1) {
                    badge.style.borderTopRightRadius = '4px';
                    badge.style.borderBottomRightRadius = '4px';
                }

                group.appendChild(badge);
            });

            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'pa-search-token-remove';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.removeTokenGroup(i);
            };

            group.appendChild(removeBtn);
            this.tokensContainer.appendChild(group);
        }
    }

    /**
     * Remove a token group
     */
    removeTokenGroup(startIndex) {
        this.resolvedTokens.splice(startIndex, 3);
        this.updateQueryState();
        this.renderTokens();
        this.input.focus();
    }

    /**
     * Handle input changes
     */
    handleInput(e) {
        const inputValue = this.input.value;

        // Check for autocomplete
        if (this.currentQueryState === 'idle' || this.currentQueryState === 'expecting-operator') {
            this.autocompleteResults = this.searchAutocomplete(inputValue);
            this.activeIndex = this.autocompleteResults.length > 0 ? 0 : -1;

            if (this.autocompleteResults.length > 0) {
                this.renderAutocomplete();
            } else {
                this.close();
            }
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(e) {
        // Handle autocomplete navigation
        if (this.autocompleteResults.length > 0 && this.isOpen) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateAutocompletePrevious();
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateAutocompleteNext();
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                this.selectAutocomplete(this.autocompleteResults[this.activeIndex]);
                return;
            }
        }

        // Handle value resolution
        if (this.currentQueryState === 'expecting-value' && (e.key === 'Enter' || e.key === 'Tab')) {
            e.preventDefault();
            this.resolveValueToken();
            return;
        }

        // Backspace at start - remove last token
        if (e.key === 'Backspace' && this.input.value === '' && this.resolvedTokens.length > 0) {
            e.preventDefault();
            this.resolvedTokens.pop();
            this.updateQueryState();
            this.renderTokens();
            return;
        }

        // Escape to close
        if (e.key === 'Escape') {
            this.close();
        }
    }

    /**
     * Navigate autocomplete suggestions
     */
    navigateAutocompletePrevious() {
        if (this.autocompleteResults.length === 0) return;

        this.activeIndex = this.activeIndex <= 0
            ? this.autocompleteResults.length - 1
            : this.activeIndex - 1;

        this.renderAutocomplete();
    }

    navigateAutocompleteNext() {
        if (this.autocompleteResults.length === 0) return;

        this.activeIndex = this.activeIndex >= this.autocompleteResults.length - 1
            ? 0
            : this.activeIndex + 1;

        this.renderAutocomplete();
    }

    /**
     * Position popup below input
     */
    position() {
        const inputRect = this.input.getBoundingClientRect();
        this.popup.style.position = 'absolute';
        this.popup.style.left = inputRect.left + 'px';
        this.popup.style.top = (inputRect.bottom + 4) + 'px';
        this.popup.style.minWidth = Math.max(inputRect.width, 250) + 'px';
    }

    /**
     * Open popup
     */
    open() {
        this.popup.style.display = 'block';
        this.isOpen = true;
    }

    /**
     * Close popup
     */
    close() {
        this.popup.style.display = 'none';
        this.isOpen = false;
        this.activeIndex = -1;
        this.autocompleteResults = [];
    }

    /**
     * Handle click outside
     */
    handleClickOutside(e) {
        if (this.isOpen && !this.popup.contains(e.target) && e.target !== this.input) {
            this.close();
        }
    }

    /**
     * Destroy instance
     */
    destroy() {
        if (this.popup && this.popup.parentNode) {
            this.popup.parentNode.removeChild(this.popup);
        }
    }
}
