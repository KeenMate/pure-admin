/**
 * Search Field Autocomplete
 * Provides field name suggestions when user types ":"
 * Then provides operator suggestions based on field type
 * Example: :name starts with "abc" and :price is between 10 and 40
 */

class SearchAutocomplete {
    constructor(inputElement, fields, options = {}) {
        this.input = inputElement;
        this.fields = fields;
        this.popup = null;
        this.activeIndex = -1;
        this.isOpen = false;
        this.lastColonPosition = -1;
        this.mode = null; // 'fields' or 'operators'
        this.currentField = null;
        this.enableHighlighting = options.enableHighlighting !== false;
        this.highlightOverlay = null;

        // Operator definitions by field type with shortcuts
        this.operators = {
            text: [
                { name: 'equals', syntax: 'equals', shortcuts: ['eq', '='] },
                { name: 'not equals', syntax: 'not equals', shortcuts: ['neq', 'ne', '!='] },
                { name: 'starts with', syntax: 'starts with', shortcuts: ['sw', 'startswith'] },
                { name: 'ends with', syntax: 'ends with', shortcuts: ['ew', 'endswith'] },
                { name: 'contains', syntax: 'contains', shortcuts: ['c', 'has'] },
                { name: 'not contains', syntax: 'not contains', shortcuts: ['nc', 'notcontains'] }
            ],
            number: [
                { name: 'equals', syntax: 'equals', shortcuts: ['eq', '=', '=='] },
                { name: 'not equals', syntax: 'not equals', shortcuts: ['neq', 'ne', '!='] },
                { name: 'greater than', syntax: 'greater than', shortcuts: ['gt', '>'] },
                { name: 'less than', syntax: 'less than', shortcuts: ['lt', '<'] },
                { name: 'between', syntax: 'between', shortcuts: ['bw', 'btw'] },
                { name: 'greater or equal', syntax: '>=', shortcuts: ['gte', 'ge'] },
                { name: 'less or equal', syntax: '<=', shortcuts: ['lte', 'le'] }
            ],
            date: [
                { name: 'equals', syntax: 'equals', shortcuts: ['eq', '=', 'on'] },
                { name: 'before', syntax: 'before', shortcuts: ['bf', '<'] },
                { name: 'after', syntax: 'after', shortcuts: ['af', '>'] },
                { name: 'between', syntax: 'between', shortcuts: ['bw', 'btw'] },
                { name: 'in last', syntax: 'in last', shortcuts: ['last', 'past'] },
                { name: 'in next', syntax: 'in next', shortcuts: ['next', 'future'] }
            ]
        };

        this.init();
    }

    init() {
        // Create popup element
        this.popup = document.createElement('div');
        this.popup.className = 'pa-search-autocomplete';
        this.popup.style.display = 'none';
        document.body.appendChild(this.popup);

        // Create syntax highlighting overlay if enabled
        if (this.enableHighlighting) {
            this.setupHighlighting();
        }

        // Event listeners
        this.input.addEventListener('input', (e) => {
            this.handleInput(e);
            if (this.enableHighlighting) {
                this.updateHighlighting();
            }
        });
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.input.addEventListener('scroll', () => {
            if (this.enableHighlighting && this.highlightOverlay) {
                this.highlightOverlay.scrollLeft = this.input.scrollLeft;
                this.highlightOverlay.scrollTop = this.input.scrollTop;
            }
        });
        document.addEventListener('click', (e) => this.handleClickOutside(e));
    }

    setupHighlighting() {
        // Wrap input in highlighting container
        const wrapper = document.createElement('div');
        wrapper.className = 'pa-search-highlight';

        // Create overlay for highlighted text
        this.highlightOverlay = document.createElement('div');
        this.highlightOverlay.className = 'pa-search-highlight__overlay';

        // Wrap input
        this.input.parentNode.insertBefore(wrapper, this.input);
        wrapper.appendChild(this.highlightOverlay);
        wrapper.appendChild(this.input);

        // Add highlighting class to input
        this.input.classList.add('pa-search-highlight__input');
    }

    updateHighlighting() {
        if (!this.highlightOverlay) return;

        const value = this.input.value;
        let highlighted = this.escapeHtml(value);

        // Get all field names for highlighting
        const fieldNames = this.fields.map(f => f.name);

        // Get all operator keywords
        const allOperators = new Set();
        Object.values(this.operators).forEach(ops => {
            ops.forEach(op => allOperators.add(op.syntax));
        });

        // Highlight field names (:fieldname)
        fieldNames.forEach(fieldName => {
            const regex = new RegExp(`(:${fieldName})(?=\\s|$)`, 'gi');
            highlighted = highlighted.replace(regex, '<span class="pa-search-highlight__field">$1</span>');
        });

        // Highlight operators
        Array.from(allOperators).forEach(operator => {
            // Escape special regex characters
            const escapedOp = operator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b(${escapedOp})\\b`, 'gi');
            highlighted = highlighted.replace(regex, '<span class="pa-search-highlight__operator">$1</span>');
        });

        this.highlightOverlay.innerHTML = highlighted;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleInput(e) {
        const value = this.input.value;
        const cursorPos = this.input.selectionStart;

        // Find the last colon before cursor
        const beforeCursor = value.substring(0, cursorPos);
        const lastColonIndex = beforeCursor.lastIndexOf(':');

        if (lastColonIndex !== -1) {
            // Get text after the colon
            const afterColon = beforeCursor.substring(lastColonIndex + 1);

            // Check if we're after a field name (has space)
            const spaceIndex = afterColon.indexOf(' ');

            if (spaceIndex !== -1) {
                // We're after the field name, check for operator suggestions
                const fieldName = afterColon.substring(0, spaceIndex).trim();
                const afterSpace = afterColon.substring(spaceIndex + 1);

                // Find the field to get its type
                const field = this.fields.find(f => f.name === fieldName);

                if (field && !afterSpace.includes(' ')) {
                    // Show operator suggestions
                    this.currentField = field;
                    this.lastColonPosition = lastColonIndex;
                    this.showOperators(afterSpace.toLowerCase());
                    return;
                } else {
                    this.close();
                    return;
                }
            }

            // Show field suggestions
            this.lastColonPosition = lastColonIndex;
            this.currentField = null;
            this.showSuggestions(afterColon.toLowerCase());
        } else {
            this.close();
        }
    }

    handleKeydown(e) {
        if (!this.isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.moveSelection(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.moveSelection(-1);
                break;
            case 'Enter':
            case 'Tab':
                e.preventDefault();
                this.selectActive();
                break;
            case 'Escape':
                this.close();
                break;
        }
    }

    handleClickOutside(e) {
        if (this.isOpen && !this.popup.contains(e.target) && e.target !== this.input) {
            this.close();
        }
    }

    showSuggestions(filter) {
        this.mode = 'fields';

        // Filter fields based on input
        const filtered = this.fields.filter(field =>
            filter === '' || field.name.toLowerCase().includes(filter)
        );

        if (filtered.length === 0) {
            this.popup.innerHTML = '<div class="pa-search-autocomplete__empty">No matching fields</div>';
        } else {
            this.popup.innerHTML = filtered.map((field, index) => `
                <div class="pa-search-autocomplete__item" data-index="${index}">
                    <span class="pa-search-autocomplete__item-name">${field.name}</span>
                    <span class="pa-search-autocomplete__item-type">${field.type}</span>
                </div>
            `).join('');

            // Add click handlers
            this.popup.querySelectorAll('.pa-search-autocomplete__item').forEach((item, index) => {
                item.addEventListener('click', () => this.selectField(filtered[index]));
            });
        }

        this.filteredItems = filtered;
        this.activeIndex = filtered.length > 0 ? 0 : -1;
        this.updateActiveItem();
        this.position();
        this.open();
    }

    showOperators(filter) {
        this.mode = 'operators';

        const operators = this.operators[this.currentField.type] || [];
        const filtered = operators.filter(op => {
            if (filter === '') return true;

            const lowerFilter = filter.toLowerCase();

            // Match against name, syntax, or any shortcuts
            return op.name.toLowerCase().includes(lowerFilter) ||
                   op.syntax.toLowerCase().includes(lowerFilter) ||
                   (op.shortcuts && op.shortcuts.some(s => s.toLowerCase().includes(lowerFilter)));
        });

        if (filtered.length === 0) {
            this.popup.innerHTML = '<div class="pa-search-autocomplete__empty">No matching operators</div>';
        } else {
            this.popup.innerHTML = `
                <div class="pa-search-autocomplete__section">Operators for ${this.currentField.name} (${this.currentField.type})</div>
                ${filtered.map((op, index) => {
                    // Show matched shortcut if user typed a shortcut
                    let displayText = op.name;
                    const lowerFilter = filter.toLowerCase();

                    if (filter && op.shortcuts) {
                        const matchedShortcut = op.shortcuts.find(s => s.toLowerCase().includes(lowerFilter));
                        if (matchedShortcut && !op.name.toLowerCase().includes(lowerFilter)) {
                            displayText = `${op.name} <span class="pa-search-autocomplete__item-type">${matchedShortcut}</span>`;
                        }
                    }

                    return `
                        <div class="pa-search-autocomplete__item" data-index="${index}">
                            <span class="pa-search-autocomplete__item-name">${displayText}</span>
                        </div>
                    `;
                }).join('')}
            `;

            // Add click handlers
            this.popup.querySelectorAll('.pa-search-autocomplete__item').forEach((item, index) => {
                item.addEventListener('click', () => this.selectOperator(filtered[index]));
            });
        }

        this.filteredItems = filtered;
        this.activeIndex = filtered.length > 0 ? 0 : -1;
        this.updateActiveItem();
        this.position();
        this.open();
    }

    moveSelection(direction) {
        if (!this.filteredItems || this.filteredItems.length === 0) return;

        this.activeIndex += direction;

        // Wrap around
        if (this.activeIndex < 0) {
            this.activeIndex = this.filteredItems.length - 1;
        } else if (this.activeIndex >= this.filteredItems.length) {
            this.activeIndex = 0;
        }

        this.updateActiveItem();
    }

    updateActiveItem() {
        this.popup.querySelectorAll('.pa-search-autocomplete__item').forEach((item, index) => {
            item.classList.toggle('pa-search-autocomplete__item--active', index === this.activeIndex);
        });

        // Scroll into view if needed
        const activeItem = this.popup.querySelector('.pa-search-autocomplete__item--active');
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }

    selectActive() {
        if (this.activeIndex >= 0 && this.filteredItems[this.activeIndex]) {
            if (this.mode === 'fields') {
                this.selectField(this.filteredItems[this.activeIndex]);
            } else if (this.mode === 'operators') {
                this.selectOperator(this.filteredItems[this.activeIndex]);
            }
        }
    }

    selectField(field) {
        const value = this.input.value;
        const beforeColon = value.substring(0, this.lastColonPosition);
        const afterField = value.substring(this.input.selectionStart);

        // Insert field name with space after
        this.input.value = beforeColon + ':' + field.name + ' ' + afterField;

        // Move cursor after the inserted field name
        const newCursorPos = beforeColon.length + field.name.length + 2; // +2 for ":" and space
        this.input.setSelectionRange(newCursorPos, newCursorPos);

        // Don't close yet - trigger operator suggestions
        this.currentField = field;
        this.input.focus();

        // Trigger input event to show operators
        setTimeout(() => {
            this.handleInput({ target: this.input });
        }, 50);
    }

    selectOperator(operator) {
        const value = this.input.value;
        const cursorPos = this.input.selectionStart;
        const beforeCursor = value.substring(0, cursorPos);
        const afterCursor = value.substring(cursorPos);

        // Find where to insert the operator (after field name and space)
        const lastColonIndex = beforeCursor.lastIndexOf(':');
        const afterColon = beforeCursor.substring(lastColonIndex + 1);
        const spaceIndex = afterColon.indexOf(' ');

        if (spaceIndex !== -1) {
            const beforeOperator = beforeCursor.substring(0, lastColonIndex + spaceIndex + 2);

            // Insert operator with space after
            this.input.value = beforeOperator + operator.syntax + ' ' + afterCursor;

            // Move cursor after operator
            const newCursorPos = beforeOperator.length + operator.syntax.length + 1;
            this.input.setSelectionRange(newCursorPos, newCursorPos);
        }

        this.close();
        this.input.focus();
    }

    position() {
        const inputRect = this.input.getBoundingClientRect();
        this.popup.style.position = 'absolute';
        this.popup.style.left = inputRect.left + 'px';
        this.popup.style.top = (inputRect.bottom + 4) + 'px';
        this.popup.style.minWidth = Math.max(inputRect.width, 200) + 'px';
    }

    open() {
        this.popup.style.display = 'block';
        this.isOpen = true;
    }

    close() {
        this.popup.style.display = 'none';
        this.isOpen = false;
        this.activeIndex = -1;
        this.filteredItems = [];
        this.mode = null;
    }

    destroy() {
        if (this.popup && this.popup.parentNode) {
            this.popup.parentNode.removeChild(this.popup);
        }
    }
}

// Example usage:
// const fields = [
//     { name: 'name', type: 'text' },
//     { name: 'price', type: 'number' },
//     { name: 'status', type: 'text' },
//     { name: 'created_at', type: 'date' }
// ];
// const autocomplete = new SearchAutocomplete(document.getElementById('search-input'), fields);
