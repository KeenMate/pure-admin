/**
 * Inline Query Editor with Syntax Highlighting (V2)
 * Provides inline editable query string with real-time syntax highlighting
 * User can type: :name startswith abcd :price between 1 to 3
 * Different parts get colored backgrounds (fields=blue, operators=gray, values=green)
 */

class InlineQueryEditor {
    constructor(containerElement, fields, options = {}) {
        this.container = containerElement;
        this.fields = fields;
        this.popup = null;
        this.highlightLayer = null;
        this.inputLayer = null;
        this.activeIndex = -1;
        this.isOpen = false;
        this.autocompleteResults = [];
        this.cursorPosition = 0;

        // Operator definitions by field type with shortcuts
        this.operators = {
            text: [
                { value: 'equals', label: 'Equals', shortcuts: ['eq', '=', 'is'], description: 'Exact match' },
                { value: 'not_equals', label: 'Not Equals', shortcuts: ['neq', 'ne', '!=', 'not'], description: 'Does not match' },
                { value: 'starts_with', label: 'Starts With', shortcuts: ['sw', 'startswith', 'begins'], description: 'Starts with text' },
                { value: 'ends_with', label: 'Ends With', shortcuts: ['ew', 'endswith'], description: 'Ends with text' },
                { value: 'contains', label: 'Contains', shortcuts: ['c', 'has', 'includes'], description: 'Contains text' },
                { value: 'not_contains', label: 'Not Contains', shortcuts: ['nc', 'notcontains'], description: 'Does not contain' }
            ],
            number: [
                { value: '=', label: 'Equals', shortcuts: ['eq', '==', 'is'], description: 'Exact value' },
                { value: '!=', label: 'Not Equals', shortcuts: ['neq', 'ne', 'not'], description: 'Different value' },
                { value: '>', label: 'Greater Than', shortcuts: ['gt', 'over', 'above'], description: 'Greater than value' },
                { value: '<', label: 'Less Than', shortcuts: ['lt', 'under', 'below'], description: 'Less than value' },
                { value: 'between', label: 'Between', shortcuts: ['bw', 'btw', 'from'], description: 'Between two values' },
                { value: '>=', label: 'Greater or Equal', shortcuts: ['gte', 'ge', 'atleast', 'min'], description: 'Greater or equal' },
                { value: '<=', label: 'Less or Equal', shortcuts: ['lte', 'le', 'atmost', 'max'], description: 'Less or equal' }
            ],
            date: [
                { value: 'equals', label: 'On Date', shortcuts: ['eq', '=', 'on', 'is'], description: 'Exact date' },
                { value: 'before', label: 'Before', shortcuts: ['bf', '<', 'until'], description: 'Before date' },
                { value: 'after', label: 'After', shortcuts: ['af', '>', 'since', 'from'], description: 'After date' },
                { value: 'between', label: 'Between', shortcuts: ['bw', 'btw'], description: 'Date range' },
                { value: 'in_last', label: 'In Last', shortcuts: ['last', 'past', 'recent'], description: 'In last X days' },
                { value: 'in_next', label: 'In Next', shortcuts: ['next', 'future', 'upcoming'], description: 'In next X days' }
            ]
        };

        // Keywords that are part of query syntax but not values
        this.keywords = ['to', 'and', 'or', '(', ')'];

        this.init();
    }

    init() {
        // Create dual-layer structure
        this.container.classList.add('pa-inline-query-editor');
        this.container.innerHTML = `
            <div class="pa-inline-query-editor__layers">
                <div class="pa-inline-query-editor__highlights" aria-hidden="true"></div>
                <textarea class="pa-inline-query-editor__input"
                          placeholder="Type : to search fields..."
                          rows="1"
                          spellcheck="false"></textarea>
            </div>
        `;

        this.highlightLayer = this.container.querySelector('.pa-inline-query-editor__highlights');
        this.inputLayer = this.container.querySelector('.pa-inline-query-editor__input');

        // Create popup element
        this.popup = document.createElement('div');
        this.popup.className = 'pa-inline-query-autocomplete';
        this.popup.style.display = 'none';
        document.body.appendChild(this.popup);

        // Event listeners
        this.inputLayer.addEventListener('input', (e) => this.handleInput(e));
        this.inputLayer.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.inputLayer.addEventListener('scroll', () => this.syncScroll());
        this.inputLayer.addEventListener('click', () => this.updateCursorPosition());
        this.inputLayer.addEventListener('keyup', () => this.updateCursorPosition());
        document.addEventListener('click', (e) => this.handleClickOutside(e));

        // Auto-grow textarea
        this.inputLayer.addEventListener('input', () => this.autoGrow());
    }

    /**
     * Auto-grow textarea height
     */
    autoGrow() {
        this.inputLayer.style.height = 'auto';
        this.inputLayer.style.height = this.inputLayer.scrollHeight + 'px';
        this.highlightLayer.style.height = this.inputLayer.scrollHeight + 'px';
    }

    /**
     * Sync scroll position between input and highlight layers
     */
    syncScroll() {
        this.highlightLayer.scrollTop = this.inputLayer.scrollTop;
        this.highlightLayer.scrollLeft = this.inputLayer.scrollLeft;
    }

    /**
     * Update cursor position
     */
    updateCursorPosition() {
        this.cursorPosition = this.inputLayer.selectionStart;
    }

    /**
     * Parse query string into tokens with types
     */
    parseQuery(queryString) {
        const tokens = [];
        let currentPos = 0;
        const text = queryString;

        // Get all field names and operators for matching
        const allFieldNames = this.fields.map(f => f.name);
        const allOperators = [];
        Object.values(this.operators).forEach(ops => {
            ops.forEach(op => {
                allOperators.push(op.value);
                if (op.shortcuts) {
                    op.shortcuts.forEach(s => allOperators.push(s));
                }
            });
        });
        // Sort operators by length (longest first) to match "starts_with" before "starts"
        allOperators.sort((a, b) => b.length - a.length);

        while (currentPos < text.length) {
            const remaining = text.substring(currentPos);

            // Check if we're at the start or after whitespace/parenthesis for field matching
            const prevChar = currentPos > 0 ? text[currentPos - 1] : ' ';
            const isFieldStart = prevChar === ' ' || prevChar === '(' || currentPos === 0;

            // Match field (starts with : only at start or after whitespace)
            if (isFieldStart) {
                const fieldMatch = remaining.match(/^:([a-zA-Z_][a-zA-Z0-9_]*)/);
                if (fieldMatch) {
                    const fieldName = fieldMatch[1];
                    tokens.push({
                        type: 'field',
                        value: ':' + fieldName,
                        start: currentPos,
                        end: currentPos + fieldMatch[0].length,
                        valid: allFieldNames.includes(fieldName)
                    });
                    currentPos += fieldMatch[0].length;
                    continue;
                }
            }

            // Match operator (sorted by length, longest first)
            let operatorMatched = false;
            for (const op of allOperators) {
                const opRegex = new RegExp('^' + this.escapeRegex(op) + '(?=\\s|\\)|$)', 'i');
                const opMatch = remaining.match(opRegex);
                if (opMatch) {
                    tokens.push({
                        type: 'operator',
                        value: opMatch[0],
                        start: currentPos,
                        end: currentPos + opMatch[0].length
                    });
                    currentPos += opMatch[0].length;
                    operatorMatched = true;
                    break;
                }
            }
            if (operatorMatched) continue;

            // Match keyword - parentheses don't need trailing whitespace
            const keywordMatch = remaining.match(/^(\(|\))/);
            if (keywordMatch) {
                tokens.push({
                    type: 'keyword',
                    value: keywordMatch[0],
                    start: currentPos,
                    end: currentPos + keywordMatch[0].length
                });
                currentPos += keywordMatch[0].length;
                continue;
            }

            // Match logical keywords (to, and, or) - these need trailing whitespace or end
            const logicalKeywordMatch = remaining.match(/^(to|and|or)(?=\s|$)/i);
            if (logicalKeywordMatch) {
                tokens.push({
                    type: 'keyword',
                    value: logicalKeywordMatch[0],
                    start: currentPos,
                    end: currentPos + logicalKeywordMatch[0].length
                });
                currentPos += logicalKeywordMatch[0].length;
                continue;
            }

            // Match whitespace
            const whitespaceMatch = remaining.match(/^\s+/);
            if (whitespaceMatch) {
                tokens.push({
                    type: 'whitespace',
                    value: whitespaceMatch[0],
                    start: currentPos,
                    end: currentPos + whitespaceMatch[0].length
                });
                currentPos += whitespaceMatch[0].length;
                continue;
            }

            // Match value with optional time unit suffix (30days, 5weeks, 2months, 1year)
            const valueWithUnitMatch = remaining.match(/^(\d+)(days?|weeks?|months?|years?)(?=\s|\)|$)/i);
            if (valueWithUnitMatch) {
                tokens.push({
                    type: 'value',
                    value: valueWithUnitMatch[0],
                    start: currentPos,
                    end: currentPos + valueWithUnitMatch[0].length
                });
                currentPos += valueWithUnitMatch[0].length;
                continue;
            }

            // Match value (everything else that's not whitespace or parentheses)
            const valueMatch = remaining.match(/^[^\s()]+/);
            if (valueMatch) {
                tokens.push({
                    type: 'value',
                    value: valueMatch[0],
                    start: currentPos,
                    end: currentPos + valueMatch[0].length
                });
                currentPos += valueMatch[0].length;
                continue;
            }

            // Safety: advance one character if nothing matched
            currentPos++;
        }

        return tokens;
    }

    /**
     * Escape special regex characters
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Render syntax highlighting
     */
    renderHighlights() {
        const queryString = this.inputLayer.value;
        const tokens = this.parseQuery(queryString);

        let html = '';

        tokens.forEach(token => {
            const escapedValue = this.escapeHtml(token.value);

            if (token.type === 'field') {
                const validClass = token.valid ? '' : ' pa-inline-query-token--invalid';
                html += `<span class="pa-inline-query-token pa-inline-query-token--field${validClass}">${escapedValue}</span>`;
            } else if (token.type === 'operator') {
                html += `<span class="pa-inline-query-token pa-inline-query-token--operator">${escapedValue}</span>`;
            } else if (token.type === 'value') {
                html += `<span class="pa-inline-query-token pa-inline-query-token--value">${escapedValue}</span>`;
            } else if (token.type === 'keyword') {
                html += `<span class="pa-inline-query-token pa-inline-query-token--keyword">${escapedValue}</span>`;
            } else if (token.type === 'whitespace') {
                html += escapedValue;
            } else {
                html += escapedValue;
            }
        });

        // Add trailing space to prevent layout collapse
        html += ' ';

        this.highlightLayer.innerHTML = html;
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get context at cursor position (what type of suggestion to show)
     */
    getCursorContext() {
        const queryString = this.inputLayer.value;
        const cursorPos = this.cursorPosition;
        const tokens = this.parseQuery(queryString);

        // Find token at cursor
        const currentToken = tokens.find(t => cursorPos >= t.start && cursorPos <= t.end);
        const prevToken = tokens.filter(t => t.end <= cursorPos).pop();

        // If cursor is in a field token or after :
        if (currentToken && currentToken.type === 'field') {
            return { type: 'field', partial: currentToken.value };
        }

        // If cursor is right after : (incomplete field) - but only at start or after whitespace/parenthesis
        const beforeCursor = queryString.substring(0, cursorPos);
        if (beforeCursor.endsWith(':')) {
            const beforeColon = cursorPos > 1 ? queryString[cursorPos - 2] : ' ';
            if (beforeColon === ' ' || beforeColon === '(' || cursorPos === 1) {
                return { type: 'field', partial: ':' };
            }
        }

        // Find the field before the current position
        // We need to look backwards from the current token to find a field
        let fieldToken = null;
        for (let i = tokens.length - 1; i >= 0; i--) {
            const token = tokens[i];
            // Skip the current token if it's an operator or value (we're editing it)
            if (currentToken && token.start >= currentToken.start) {
                continue;
            }
            // Found a field token before current position
            if (token.type === 'field' && token.valid) {
                fieldToken = token;
                break;
            }
            // If we hit another operator or value before finding a field, stop
            if (token.type === 'operator' || token.type === 'value') {
                break;
            }
        }

        if (fieldToken) {
            // Get the field definition
            const fieldName = fieldToken.value.substring(1);
            const fieldDef = this.fields.find(f => f.name === fieldName);

            // Check if cursor is in operator position (typing or inside operator)
            if (currentToken && currentToken.type === 'operator') {
                return { type: 'operator', fieldType: fieldDef.type, partial: currentToken.value };
            }

            // Check if cursor is in a value token that might actually be an incomplete operator
            if (currentToken && currentToken.type === 'value') {
                // This could be an incomplete operator shortcut, show operator suggestions
                return { type: 'operator', fieldType: fieldDef.type, partial: currentToken.value };
            }

            // If cursor is right after field (no token at cursor), show all operators
            if (!currentToken || currentToken.type === 'whitespace') {
                return { type: 'operator', fieldType: fieldDef.type, partial: '' };
            }
        }

        return { type: 'none' };
    }

    /**
     * Search for autocomplete suggestions
     */
    searchAutocomplete(context) {
        if (context.type === 'field') {
            const searchTerm = context.partial.startsWith(':')
                ? context.partial.substring(1).toLowerCase()
                : context.partial.toLowerCase();

            return this.fields.filter(field =>
                field.name.toLowerCase().includes(searchTerm)
            ).map(field => ({
                value: field.name,
                label: field.name,
                description: `${field.type} field`,
                type: field.type,
                insertValue: ':' + field.name
            }));
        } else if (context.type === 'operator') {
            const operators = this.operators[context.fieldType] || [];
            const searchTerm = context.partial.toLowerCase();

            return operators.filter(op =>
                searchTerm === '' ||
                op.value.toLowerCase().includes(searchTerm) ||
                op.label.toLowerCase().includes(searchTerm) ||
                (op.shortcuts && op.shortcuts.some(s => s.toLowerCase().includes(searchTerm)))
            ).map(op => ({
                ...op,
                insertValue: op.value
            }));
        }

        return [];
    }

    /**
     * Handle input changes
     */
    handleInput(e) {
        this.updateCursorPosition();
        this.renderHighlights();
        this.syncScroll();

        // Check for autocomplete
        const context = this.getCursorContext();
        if (context.type !== 'none') {
            this.autocompleteResults = this.searchAutocomplete(context);
            this.activeIndex = this.autocompleteResults.length > 0 ? 0 : -1;

            if (this.autocompleteResults.length > 0) {
                this.renderAutocomplete();
            } else {
                this.close();
            }
        } else {
            this.close();
        }
    }

    /**
     * Render autocomplete dropdown
     */
    renderAutocomplete() {
        if (this.autocompleteResults.length === 0) {
            this.close();
            return;
        }

        const context = this.getCursorContext();
        const isFieldSearch = context.type === 'field';
        let html = '';

        this.autocompleteResults.forEach((item, index) => {
            const isActive = index === this.activeIndex;
            const icon = isFieldSearch ? '🔍' : '⚡';

            html += `
                <div class="pa-inline-query-autocomplete__item ${isActive ? 'pa-inline-query-autocomplete__item--active' : ''}" data-index="${index}">
                    <span class="pa-inline-query-autocomplete__item-icon">${icon}</span>
                    <div class="pa-inline-query-autocomplete__item-content">
                        <span class="pa-inline-query-autocomplete__item-name">${item.label}</span>
                        <span class="pa-inline-query-autocomplete__item-type">${item.description}</span>
                    </div>
                    <span class="pa-inline-query-autocomplete__item-badge">${item.value}</span>
                </div>
            `;
        });

        this.popup.innerHTML = html;

        // Add click handlers
        this.popup.querySelectorAll('.pa-inline-query-autocomplete__item').forEach((item, index) => {
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

        const context = this.getCursorContext();
        const queryString = this.inputLayer.value;
        const tokens = this.parseQuery(queryString);
        const cursorPos = this.cursorPosition;

        let newValue = queryString;
        let newCursorPos = cursorPos;

        if (context.type === 'field') {
            // Replace the partial field with selected field
            const currentToken = tokens.find(t => t.type === 'field' && cursorPos >= t.start && cursorPos <= t.end);

            if (currentToken) {
                // Replace existing field
                newValue = queryString.substring(0, currentToken.start) + item.insertValue + ' ' + queryString.substring(currentToken.end);
                newCursorPos = currentToken.start + item.insertValue.length + 1;
            } else {
                // Insert after :
                const colonPos = queryString.lastIndexOf(':', cursorPos);
                if (colonPos !== -1) {
                    newValue = queryString.substring(0, colonPos) + item.insertValue + ' ' + queryString.substring(cursorPos);
                    newCursorPos = colonPos + item.insertValue.length + 1;
                }
            }
        } else if (context.type === 'operator') {
            // Find the position to insert operator
            const currentToken = tokens.find(t => cursorPos >= t.start && cursorPos <= t.end);

            if (currentToken && (currentToken.type === 'operator' || currentToken.type === 'value')) {
                // Replace existing operator or value token (incomplete operator)
                newValue = queryString.substring(0, currentToken.start) + item.insertValue + ' ' + queryString.substring(currentToken.end);
                newCursorPos = currentToken.start + item.insertValue.length + 1;
            } else {
                // Insert at cursor
                newValue = queryString.substring(0, cursorPos) + item.insertValue + ' ' + queryString.substring(cursorPos);
                newCursorPos = cursorPos + item.insertValue.length + 1;
            }
        }

        // Update input
        this.inputLayer.value = newValue;
        this.inputLayer.setSelectionRange(newCursorPos, newCursorPos);
        this.cursorPosition = newCursorPos;

        // Update UI
        this.renderHighlights();
        this.close();
        this.inputLayer.focus();
        this.autoGrow();

        // If we just selected a field, trigger operator autocomplete
        if (context.type === 'field') {
            setTimeout(() => {
                this.updateCursorPosition();
                const newContext = this.getCursorContext();
                if (newContext.type === 'operator') {
                    this.autocompleteResults = this.searchAutocomplete(newContext);
                    this.activeIndex = this.autocompleteResults.length > 0 ? 0 : -1;
                    if (this.autocompleteResults.length > 0) {
                        this.renderAutocomplete();
                    }
                }
            }, 0);
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
            if (e.key === 'Tab') {
                e.preventDefault();
                this.selectAutocomplete(this.autocompleteResults[this.activeIndex]);
                return;
            }
            if (e.key === 'Enter' && this.activeIndex >= 0) {
                e.preventDefault();
                this.selectAutocomplete(this.autocompleteResults[this.activeIndex]);
                return;
            }
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
        const inputRect = this.inputLayer.getBoundingClientRect();
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
        if (this.isOpen && !this.popup.contains(e.target) && !this.container.contains(e.target)) {
            this.close();
        }
    }

    /**
     * Get parsed query (for external use)
     */
    getParsedQuery() {
        return this.parseQuery(this.inputLayer.value);
    }

    /**
     * Convert parsed tokens to structured query for server (JSON:API format)
     * Returns nested filter object with logical operators
     */
    toServerQuery() {
        const tokens = this.parseQuery(this.inputLayer.value);

        // Build expression tree from tokens
        const filter = this.buildFilterTree(tokens, 0).filter;

        return {
            filter: filter,
            raw: this.inputLayer.value
        };
    }

    /**
     * Build nested filter tree from flat token list
     * Handles parentheses and logical operators with proper precedence
     */
    buildFilterTree(tokens, startIndex) {
        const conditions = [];
        let currentLogic = null; // null, 'and', or 'or'
        let i = startIndex;

        while (i < tokens.length) {
            const token = tokens[i];

            // Skip whitespace
            if (token.type === 'whitespace') {
                i++;
                continue;
            }

            // Handle opening parenthesis - recursively parse group
            if (token.type === 'keyword' && token.value === '(') {
                const result = this.buildFilterTree(tokens, i + 1);
                conditions.push(result.filter);
                i = result.endIndex + 1; // Skip past closing parenthesis
                continue;
            }

            // Handle closing parenthesis - return current level
            if (token.type === 'keyword' && token.value === ')') {
                return {
                    filter: this.combineConditions(conditions, currentLogic),
                    endIndex: i
                };
            }

            // Handle logical operators (AND, OR)
            if (token.type === 'keyword' && (token.value.toLowerCase() === 'and' || token.value.toLowerCase() === 'or')) {
                const logic = token.value.toLowerCase();

                if (currentLogic === null) {
                    currentLogic = logic;
                } else if (currentLogic !== logic) {
                    // Mixed operators at same level - need to restructure
                    // Combine existing conditions with current logic, then switch
                    const combined = this.combineConditions(conditions, currentLogic);
                    conditions.length = 0; // Clear array
                    conditions.push(combined);
                    currentLogic = logic;
                }

                i++;
                continue;
            }

            // Handle field + operator + value
            if (token.type === 'field' && token.valid) {
                const field = token.value.substring(1); // Remove leading :
                i++;

                // Skip whitespace after field
                while (i < tokens.length && tokens[i].type === 'whitespace') {
                    i++;
                }

                // Get operator
                if (i < tokens.length && tokens[i].type === 'operator') {
                    const operator = this.normalizeOperator(tokens[i].value);
                    i++;

                    // Skip whitespace after operator
                    while (i < tokens.length && tokens[i].type === 'whitespace') {
                        i++;
                    }

                    // Get value(s)
                    const values = [];
                    while (i < tokens.length && (tokens[i].type === 'value' || tokens[i].type === 'keyword')) {
                        if (tokens[i].type === 'value') {
                            // Remove surrounding quotes if present
                            let value = tokens[i].value;
                            if ((value.startsWith("'") && value.endsWith("'")) ||
                                (value.startsWith('"') && value.endsWith('"'))) {
                                value = value.slice(1, -1);
                            }
                            values.push(value);
                        } else if (tokens[i].type === 'keyword' && tokens[i].value.toLowerCase() === 'to') {
                            // 'to' keyword in 'between' queries, skip it
                            i++;
                            while (i < tokens.length && tokens[i].type === 'whitespace') {
                                i++;
                            }
                            continue;
                        } else {
                            // Stop at logical operators or parentheses
                            break;
                        }
                        i++;

                        // Skip whitespace between values
                        while (i < tokens.length && tokens[i].type === 'whitespace') {
                            i++;
                        }

                        // Stop if we hit another field, operator, or keyword
                        if (i < tokens.length &&
                            (tokens[i].type === 'field' ||
                             tokens[i].type === 'operator' ||
                             (tokens[i].type === 'keyword' &&
                              (tokens[i].value.toLowerCase() === 'and' ||
                               tokens[i].value.toLowerCase() === 'or' ||
                               tokens[i].value === ')')))) {
                            break;
                        }
                    }

                    // Create filter condition in JSON:API format
                    const value = values.length === 1 ? values[0] : values;
                    const condition = {
                        [field]: { [operator]: value }
                    };

                    conditions.push(condition);
                    continue;
                }
            }

            // Unknown or invalid token, skip
            i++;
        }

        // Return combined result
        return {
            filter: this.combineConditions(conditions, currentLogic),
            endIndex: i
        };
    }

    /**
     * Combine multiple conditions with a logical operator
     */
    combineConditions(conditions, logic) {
        if (conditions.length === 0) {
            return {};
        }

        if (conditions.length === 1) {
            return conditions[0];
        }

        // Multiple conditions - wrap in logical operator
        return {
            [logic || 'and']: conditions
        };
    }

    /**
     * Normalize operator names to JSON:API standard format
     */
    normalizeOperator(operator) {
        const normalized = operator.toLowerCase();

        // Map common operators to standard names
        const operatorMap = {
            '=': 'eq',
            '==': 'eq',
            'is': 'eq',
            'equals': 'eq',
            '!=': 'ne',
            'not_equals': 'ne',
            'not': 'ne',
            'neq': 'ne',
            '>': 'gt',
            'greater_than': 'gt',
            'over': 'gt',
            'above': 'gt',
            '<': 'lt',
            'less_than': 'lt',
            'under': 'lt',
            'below': 'lt',
            '>=': 'gte',
            'greater_or_equal': 'gte',
            'atleast': 'gte',
            'min': 'gte',
            '<=': 'lte',
            'less_or_equal': 'lte',
            'atmost': 'lte',
            'max': 'lte',
            'starts_with': 'startswith',
            'sw': 'startswith',
            'begins': 'startswith',
            'ends_with': 'endswith',
            'ew': 'endswith',
            'contains': 'contains',
            'c': 'contains',
            'has': 'contains',
            'includes': 'contains',
            'not_contains': 'notcontains',
            'nc': 'notcontains',
            'between': 'between',
            'bw': 'between',
            'btw': 'between',
            'from': 'between',
            'before': 'before',
            'bf': 'before',
            'until': 'before',
            'after': 'after',
            'af': 'after',
            'since': 'after',
            'in_last': 'inlast',
            'last': 'inlast',
            'past': 'inlast',
            'recent': 'inlast',
            'in_next': 'innext',
            'next': 'innext',
            'future': 'innext',
            'upcoming': 'innext'
        };

        return operatorMap[normalized] || normalized;
    }

    /**
     * Get query string
     */
    getValue() {
        return this.inputLayer.value;
    }

    /**
     * Set query string
     */
    setValue(value) {
        this.inputLayer.value = value;
        this.renderHighlights();
        this.autoGrow();
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
