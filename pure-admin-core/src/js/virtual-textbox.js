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
        this.currentQueryState = 'idle'; // 'idle' | 'expecting-operator' | 'expecting-value' | 'expecting-logical'
        this.pendingToken = null; // Stores token being built (field, operator)

        // Logical operators
        this.logicalOperators = [
            { value: 'AND', label: 'AND', shortcuts: ['and', '&&', '&'], description: 'All conditions must match' },
            { value: 'OR', label: 'OR', shortcuts: ['or', '||', '|'], description: 'Any condition can match' }
        ];

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
        } else if (this.pendingToken.type === 'value-completed') {
            this.currentQueryState = 'expecting-logical';
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
        } else if (this.currentQueryState === 'expecting-logical') {
            // Show logical operators
            const searchTerm = query.toLowerCase();
            return this.logicalOperators.filter(op =>
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
        } else if (this.currentQueryState === 'expecting-logical') {
            tokenType = 'logical';
            variant = 'logical';
            // Reset to idle after logical operator
            this.pendingToken = null;
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

        // Map variants to color classes (no badges, just colored text)
        const colorMap = {
            'field': '#1565c0',      // Blue
            'operator': '#616161',   // Gray
            'value': '#2e7d32',      // Green
            'logical': '#e65100',    // Orange
            'paren': '#7b1fa2'       // Purple
        };
        const color = colorMap[variant] || '#000000';

        // Create colored text span (non-editable to prevent cursor getting stuck)
        const token = document.createElement('span');
        token.style.color = color;
        token.style.fontWeight = (variant === 'logical' || variant === 'field') ? 'bold' : 'normal';
        token.style.cursor = 'pointer';
        token.setAttribute('contenteditable', 'false');
        token.setAttribute('data-token-type', variant);
        token.setAttribute('data-token-value', value);
        token.textContent = value;
        token.className = 'pa-query-token';

        // Allow editing on double-click
        token.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.editToken(token);
        });

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
     * Check if we're inside a quoted string
     */
    isInQuotedString() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        if (textNode.nodeType !== Node.TEXT_NODE) return false;

        const text = textNode.textContent;
        const cursorPos = range.startOffset;

        // Count quotes before cursor
        let quoteCount = 0;
        for (let i = 0; i < cursorPos; i++) {
            if (text[i] === '"') quoteCount++;
        }

        // If odd number of quotes, we're inside a quoted string
        return quoteCount % 2 === 1;
    }

    /**
     * Get current word or quoted string at cursor
     */
    getCurrentValue() {
        const selection = window.getSelection();
        if (!selection.rangeCount)             return {
	        text: "",
	        range: document.createRange()
        };


	    const range = selection.getRangeAt(0);
        const textNode = range.startContainer;

        if (textNode.nodeType !== Node.TEXT_NODE) {
            return {
	            text: "",
	            range: document.createRange()
            };
        }

        const text = textNode.textContent;
        const cursorPos = range.startOffset;

        // Check if we're in a quoted string
        let quoteStart = -1;
        for (let i = cursorPos - 2; i >= 0; i--) {
            if (text[i] === '"') {
                quoteStart = i;
                break;
            }
        }

        if (quoteStart >= 0) {
            // Find closing quote
            let quoteEnd = text.indexOf('"', quoteStart + 1);
            if (quoteEnd > quoteStart) {
                // Return the quoted string with quotes

	            const newRange = document.createRange()
	            newRange.setStart(textNode, quoteStart);
	            newRange.setEnd(textNode, quoteEnd - quoteStart + 2);
	            return {
		            text: text.substring(quoteStart, quoteEnd + 1),
		            range: newRange
	            };
            }
        }

        // Not in quotes, get regular word
        let start = cursorPos;
        while (start > 0 && !/\s/.test(text[start - 1])) {
            start--;
        }

        let end = cursorPos;
        while (end < text.length && !/\s/.test(text[end])) {
            end++;
        }

	    const newRange = document.createRange()
	    newRange.setStart(textNode, start);
	    newRange.setEnd(textNode, end - start + 1);
        return {
					text: text.substring(start, end),
	        range: newRange
        };
    }

    /**
     * Complete value token (when user types text and presses Space/Enter)
     */
    completeValueToken() {
        const {text: currentValue, range: currentValueRange} = this.getCurrentValue();

        if (currentValue && this.currentQueryState === 'expecting-value') {
            // Check if it's a quoted string
            let value = currentValue;
            if (value.startsWith('"') && value.endsWith('"')) {
                // Remove quotes for the token value
                value = value.substring(1, value.length - 1);
            }

            // Remove the typed text
            // this.removeCurrentWord();
	        // console.log("currentValueRange ", currentValueRange)
	        currentValueRange.deleteContents();

            // Insert value token
            this.insertToken(value, 'value');

            // After value, expect logical operator
            this.pendingToken = { type: 'value-completed' };
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
        if (this.currentQueryState === 'idle' || this.currentQueryState === 'expecting-operator' || this.currentQueryState === 'expecting-logical') {
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
        const tokens = Array.from(this.element.querySelectorAll('span[data-token-type]'));

        if (tokens.length === 0) {
            // No tokens at all - reset to idle
            this.pendingToken = null;
            this.updateQueryState();
            return;
        }

        // Get the last token to determine state
        const lastToken = tokens[tokens.length - 1];
        const lastTokenType = lastToken.getAttribute('data-token-type');
        const lastTokenValue = lastToken.textContent || lastToken.getAttribute('data-token-value');

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
                const fieldValue = fieldToken.textContent || fieldToken.getAttribute('data-token-value');
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
            // Last token is a value - expect logical operator
            this.pendingToken = { type: 'value-completed' };
            this.updateQueryState();
        } else if (lastTokenType === 'logical' || lastTokenType === 'paren') {
            // After logical operator or opening paren - back to idle (expecting field)
            this.pendingToken = null;
            this.updateQueryState();
        }
    }

    /**
     * Handle keyboard navigation and shortcuts
     */
    handleKeydown(e) {
        // Handle parentheses insertion
        if (e.key === '(' || e.key === ')') {
            e.preventDefault();
            const parenType = e.key === '(' ? 'paren-open' : 'paren-close';
            this.insertToken(e.key, 'paren');

            // Update state based on paren type
            if (e.key === '(') {
                this.pendingToken = null; // Expecting field after (
            } else {
                this.pendingToken = { type: 'value-completed' }; // Expecting logical after )
            }
            this.updateQueryState();
            return;
        }

        // Handle space key - auto-complete if exactly one match
        if (e.key === ' ' && (this.currentQueryState === 'expecting-operator' || this.currentQueryState === 'expecting-logical')) {
            if (this.autocompleteResults.length === 1) {
                e.preventDefault();
                this.selectAutocomplete(this.autocompleteResults[0]);
                return;
            }
        }

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
            // Space also accepts the selected item when autocomplete is open
            if (e.key === ' ' && this.activeIndex >= 0) {
                e.preventDefault();
                this.selectAutocomplete(this.autocompleteResults[this.activeIndex]);
                return;
            }
        }

        // Handle value completion
        if (this.currentQueryState === 'expecting-value') {
            // Only complete on space if we're NOT in a quoted string AND there's actual text
            if (e.key === ' ' && !this.isInQuotedString()) {
                const {text: currentValue} = this.getCurrentValue();
                // Only complete if there's actual text to tokenize
                if (currentValue && currentValue.trim() !== '') {
                    e.preventDefault();
                    this.completeValueToken();
                    return;
                }
                // Otherwise, let the space be inserted naturally (user is starting to type)
            }
            // Always complete on Enter or Tab (but only if there's text)
            if (e.key === 'Enter' || e.key === 'Tab') {
                const {text: currentValue} = this.getCurrentValue();
                if (currentValue && currentValue.trim() !== '') {
                    e.preventDefault();
                    this.completeValueToken();
                }
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
        const tokens = this.element.querySelectorAll('span[data-token-type]');
        const query = [];

        tokens.forEach(token => {
            query.push({
                type: token.getAttribute('data-token-type'),
                value: token.textContent || token.getAttribute('data-token-value')
            });
        });

        return query;
    }

    /**
     * Edit a token (make it temporarily editable)
     */
    editToken(token) {
        const originalValue = token.textContent;
        const originalColor = token.style.color;

        // Make it editable
        token.setAttribute('contenteditable', 'true');
        token.style.backgroundColor = '#fff9e6';
        token.style.padding = '2px 4px';
        token.style.borderRadius = '3px';

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(token);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Focus it
        token.focus();

        // Handle blur (when user clicks away or presses enter)
        const finishEdit = () => {
            token.setAttribute('contenteditable', 'false');
            token.style.backgroundColor = '';
            token.style.padding = '';
            token.style.borderRadius = '';

            const newValue = token.textContent.trim();
            if (newValue === '') {
                // Remove token if empty
                token.remove();
            } else {
                // Update the data attribute
                token.setAttribute('data-token-value', newValue);
            }

            // Trigger input event to update tree
            this.element.dispatchEvent(new Event('input', { bubbles: true }));
        };

        token.addEventListener('blur', finishEdit, { once: true });
        token.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                token.blur();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                token.textContent = originalValue;
                token.blur();
            }
        });
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
