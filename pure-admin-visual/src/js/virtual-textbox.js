/**
 * Virtual Textbox - Contenteditable Query Builder with Inline Tokens
 * Replaces standard input with contenteditable div for rich inline formatting
 * Tokens appear as inline badges within the text flow
 * Example: Type ":name" → select operator → enter value → inline [name][starts_with]["abc"]
 */

class VirtualTextbox {
    constructor(element, fields, options = {}) {
        this.element = element; // contenteditable div
        this.fields = fields;
        this.options = {
            enableHighlighting: true,
            enableGrouping: true, // Group field+operator+value together
            ...options
        };

        this.popup = null;
        this.activeIndex = -1;
        this.isOpen = false;
        this.autocompleteResults = [];
        this.currentQueryState = 'idle'; // 'idle' | 'expecting-operator' | 'expecting-value'
        this.pendingToken = null; // Stores token being built (field, operator)

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
        // Make element contenteditable if not already
        if (this.element.getAttribute('contenteditable') !== 'true') {
            this.element.setAttribute('contenteditable', 'true');
        }

        // Create autocomplete popup
        this.popup = document.createElement('div');
        this.popup.className = 'pa-search-autocomplete';
        this.popup.style.display = 'none';
        document.body.appendChild(this.popup);

        // Event listeners
        this.element.addEventListener('input', (e) => this.handleInput(e));
        this.element.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.element.addEventListener('paste', (e) => this.handlePaste(e));
        document.addEventListener('click', (e) => this.handleClickOutside(e));

        // Initialize state
        this.updateQueryState();
    }

    /**
     * Update query state based on pending token
     */
    updateQueryState() {
        if (!this.pendingToken) {
            this.currentQueryState = 'idle';
        } else if (this.pendingToken.type === 'field') {
            this.currentQueryState = 'expecting-operator';
        } else if (this.pendingToken.type === 'operator') {
            this.currentQueryState = 'expecting-value';
        }
    }

    /**
     * Get current text content at cursor position
     */
    getCurrentWord() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return '';

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;

        if (textNode.nodeType !== Node.TEXT_NODE) {
            return '';
        }

        const text = textNode.textContent;
        const cursorPos = range.startOffset;

        // Find word boundaries
        let start = cursorPos;
        while (start > 0 && !/\s/.test(text[start - 1])) {
            start--;
        }

        let end = cursorPos;
        while (end < text.length && !/\s/.test(text[end])) {
            end++;
        }

        return text.substring(start, end);
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
            // Get operators for current field type
            const fieldDef = this.fields.find(f => f.name === this.pendingToken.value);
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
     * Select autocomplete item and insert token
     */
    selectAutocomplete(item) {
        if (!item) return;

        // Remove the current word being typed
        this.removeCurrentWord();

        // Determine token type and variant
        let tokenType, variant;

        if (this.currentQueryState === 'idle') {
            tokenType = 'field';
            variant = 'field';
            this.pendingToken = { type: 'field', value: item.value, fieldType: item.type };
        } else if (this.currentQueryState === 'expecting-operator') {
            tokenType = 'operator';
            variant = 'operator';
            this.pendingToken = { type: 'operator', value: item.value, field: this.pendingToken };
        }

        // Insert token at cursor
        this.insertToken(item.value, variant);

        // Update state
        this.updateQueryState();

        // Clear autocomplete
        this.autocompleteResults = [];
        this.activeIndex = -1;
        this.close();
        this.element.focus();
    }

    /**
     * Remove current word being typed (for autocomplete replacement)
     */
    removeCurrentWord() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;

        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const text = textNode.textContent;
        const cursorPos = range.startOffset;

        // Find word boundaries
        let start = cursorPos;
        while (start > 0 && !/\s/.test(text[start - 1])) {
            start--;
        }

        // Create range to delete word
        const deleteRange = document.createRange();
        deleteRange.setStart(textNode, start);
        deleteRange.setEnd(textNode, cursorPos);
        deleteRange.deleteContents();
    }

    /**
     * Insert token at cursor position
     */
    insertToken(value, variant) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        // Map variants to badge classes
        const variantMap = {
            'field': 'primary',
            'operator': 'secondary',
            'value': 'success'
        };
        const badgeVariant = variantMap[variant] || 'default';

        // Create token element using standard pa-badge
        const token = document.createElement('span');
        token.className = `pa-badge pa-badge--${badgeVariant} pa-badge--sm`;
        token.setAttribute('contenteditable', 'false');
        token.setAttribute('data-token-type', variant);
        token.setAttribute('data-token-value', value);
        token.textContent = value;

        // Add space after token
        const space = document.createTextNode(' ');

        // Insert token and space
        range.deleteContents();
        range.insertNode(space);
        range.insertNode(token);

        // Move cursor after space
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * Complete value token (when user types text and presses Space/Enter)
     */
    completeValueToken() {
        const currentWord = this.getCurrentWord();

        if (currentWord && this.currentQueryState === 'expecting-value') {
            // Remove the typed word
            this.removeCurrentWord();

            // Insert value token
            this.insertToken(currentWord, 'value');

            // Reset state - query is complete
            this.pendingToken = null;
            this.updateQueryState();

            return true;
        }

        return false;
    }

    /**
     * Handle input changes
     */
    handleInput(e) {
        // Sync state with actual token structure in DOM
        this.syncStateWithTokens();

        const currentWord = this.getCurrentWord();

        // Check for autocomplete trigger
        if (this.currentQueryState === 'idle' || this.currentQueryState === 'expecting-operator') {
            this.autocompleteResults = this.searchAutocomplete(currentWord);
            this.activeIndex = this.autocompleteResults.length > 0 ? 0 : -1;

            if (this.autocompleteResults.length > 0) {
                this.renderAutocomplete();
            } else {
                this.close();
            }
        }
    }

    /**
     * Sync internal state with actual tokens in DOM
     * Called on input to detect token deletions
     */
    syncStateWithTokens() {
        const tokens = Array.from(this.element.querySelectorAll('.pa-badge[data-token-type]'));

        if (tokens.length === 0) {
            // No tokens at all - reset to idle
            this.pendingToken = null;
            this.updateQueryState();
            return;
        }

        // Get the last token to determine state
        const lastToken = tokens[tokens.length - 1];
        const lastTokenType = lastToken.getAttribute('data-token-type');
        const lastTokenValue = lastToken.getAttribute('data-token-value');

        if (lastTokenType === 'field') {
            // Last token is a field - expecting operator
            const fieldDef = this.fields.find(f => f.name === lastTokenValue);
            this.pendingToken = {
                type: 'field',
                value: lastTokenValue,
                fieldType: fieldDef ? fieldDef.type : 'text'
            };
            this.updateQueryState();
        } else if (lastTokenType === 'operator') {
            // Last token is an operator - expecting value
            // Need to find the preceding field token
            const fieldToken = tokens[tokens.length - 2];
            if (fieldToken && fieldToken.getAttribute('data-token-type') === 'field') {
                const fieldValue = fieldToken.getAttribute('data-token-value');
                const fieldDef = this.fields.find(f => f.name === fieldValue);
                this.pendingToken = {
                    type: 'operator',
                    value: lastTokenValue,
                    field: {
                        type: 'field',
                        value: fieldValue,
                        fieldType: fieldDef ? fieldDef.type : 'text'
                    }
                };
                this.updateQueryState();
            }
        } else if (lastTokenType === 'value') {
            // Last token is a value - query complete, back to idle
            this.pendingToken = null;
            this.updateQueryState();
        }
    }

    /**
     * Handle keyboard navigation and shortcuts
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

        // Handle value completion
        if (this.currentQueryState === 'expecting-value') {
            if (e.key === 'Enter' || e.key === 'Tab' || e.key === ' ') {
                e.preventDefault();
                this.completeValueToken();
                return;
            }
        }

        // Escape to close
        if (e.key === 'Escape') {
            this.close();
        }
    }

    /**
     * Handle paste - strip formatting
     */
    handlePaste(e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
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
     * Position popup below element (at cursor position ideally)
     */
    position() {
        const elementRect = this.element.getBoundingClientRect();

        // Try to position near cursor
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            if (rect.left > 0 && rect.top > 0) {
                this.popup.style.position = 'absolute';
                this.popup.style.left = rect.left + 'px';
                this.popup.style.top = (rect.bottom + 4) + 'px';
                this.popup.style.minWidth = Math.max(250, elementRect.width) + 'px';
                return;
            }
        }

        // Fallback: position below element
        this.popup.style.position = 'absolute';
        this.popup.style.left = elementRect.left + 'px';
        this.popup.style.top = (elementRect.bottom + 4) + 'px';
        this.popup.style.minWidth = Math.max(250, elementRect.width) + 'px';
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
        if (this.isOpen && !this.popup.contains(e.target) && e.target !== this.element && !this.element.contains(e.target)) {
            this.close();
        }
    }

    /**
     * Get parsed query from tokens
     */
    getQuery() {
        const tokens = this.element.querySelectorAll('.pa-badge[data-token-type]');
        const query = [];

        tokens.forEach(token => {
            query.push({
                type: token.getAttribute('data-token-type'),
                value: token.getAttribute('data-token-value')
            });
        });

        return query;
    }

    /**
     * Clear all content
     */
    clear() {
        this.element.innerHTML = '';
        this.pendingToken = null;
        this.updateQueryState();
    }

    /**
     * Destroy instance
     */
    destroy() {
        if (this.popup && this.popup.parentNode) {
            this.popup.parentNode.removeChild(this.popup);
        }
        this.element.removeAttribute('contenteditable');
    }
}
