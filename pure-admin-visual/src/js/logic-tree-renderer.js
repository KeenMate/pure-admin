/**
 * Logic Tree Renderer - Scratch-style visual query builder
 * Renders a parsed query as a nested block structure showing logical flow
 * Similar to Scratch programming interface but readonly
 */

class LogicTreeRenderer {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showIndices: false, // Show token indices for debugging
            animated: true,     // Animate tree building
            ...options
        };
    }

    /**
     * Parse tokens into a tree structure with logical precedence
     * Handles AND (higher precedence) and OR (lower precedence)
     * Handles parentheses for grouping
     */
    parseTokens(tokens) {
        if (!tokens || tokens.length === 0) {
            return null;
        }

        // Convert tokens to easier format
        const tokenList = Array.from(tokens).map((token, index) => ({
            type: token.getAttribute('data-token-type'),
            value: token.textContent || token.getAttribute('data-token-value'),
            index
        }));

        return this.parseExpression(tokenList, 0).node;
    }

    /**
     * Parse expression with operator precedence
     * Returns { node, endIndex }
     */
    parseExpression(tokens, startIndex) {
        // Parse OR expressions (lowest precedence)
        return this.parseOrExpression(tokens, startIndex);
    }

    /**
     * Parse OR expressions (a OR b OR c)
     */
    parseOrExpression(tokens, startIndex) {
        let result = this.parseAndExpression(tokens, startIndex);
        let currentIndex = result.endIndex;

        while (currentIndex < tokens.length) {
            const token = tokens[currentIndex];

            if (token.type === 'logical' && token.value === 'OR') {
                // Found OR operator
                currentIndex++; // Skip OR token
                const rightResult = this.parseAndExpression(tokens, currentIndex);

                result = {
                    node: {
                        type: 'logical',
                        operator: 'OR',
                        left: result.node,
                        right: rightResult.node
                    },
                    endIndex: rightResult.endIndex
                };
                currentIndex = rightResult.endIndex;
            } else {
                break;
            }
        }

        return result;
    }

    /**
     * Parse AND expressions (a AND b AND c)
     */
    parseAndExpression(tokens, startIndex) {
        let result = this.parsePrimaryExpression(tokens, startIndex);
        let currentIndex = result.endIndex;

        while (currentIndex < tokens.length) {
            const token = tokens[currentIndex];

            if (token.type === 'logical' && token.value === 'AND') {
                // Found AND operator
                currentIndex++; // Skip AND token
                const rightResult = this.parsePrimaryExpression(tokens, currentIndex);

                result = {
                    node: {
                        type: 'logical',
                        operator: 'AND',
                        left: result.node,
                        right: rightResult.node
                    },
                    endIndex: rightResult.endIndex
                };
                currentIndex = rightResult.endIndex;
            } else {
                break;
            }
        }

        return result;
    }

    /**
     * Parse primary expression (condition or parenthesized group)
     */
    parsePrimaryExpression(tokens, startIndex) {
        if (startIndex >= tokens.length) {
            return { node: null, endIndex: startIndex };
        }

        const token = tokens[startIndex];

        // Handle opening parenthesis
        if (token.type === 'paren' && token.value === '(') {
            // Find matching closing paren
            let depth = 1;
            let endIndex = startIndex + 1;

            while (endIndex < tokens.length && depth > 0) {
                const t = tokens[endIndex];
                if (t.type === 'paren') {
                    if (t.value === '(') depth++;
                    if (t.value === ')') depth--;
                }
                endIndex++;
            }

            // Parse expression inside parentheses
            const innerResult = this.parseExpression(tokens, startIndex + 1);

            return {
                node: {
                    type: 'group',
                    expression: innerResult.node
                },
                endIndex: endIndex
            };
        }

        // Handle condition (field operator value)
        if (token.type === 'field') {
            let currentIndex = startIndex + 1;
            const field = token.value;

            // Expect operator
            if (currentIndex >= tokens.length || tokens[currentIndex].type !== 'operator') {
                return { node: null, endIndex: currentIndex };
            }
            const operator = tokens[currentIndex].value;
            currentIndex++;

            // Expect value
            if (currentIndex >= tokens.length || tokens[currentIndex].type !== 'value') {
                return { node: null, endIndex: currentIndex };
            }
            const value = tokens[currentIndex].value;
            currentIndex++;

            return {
                node: {
                    type: 'condition',
                    field,
                    operator,
                    value
                },
                endIndex: currentIndex
            };
        }

        return { node: null, endIndex: startIndex + 1 };
    }

    /**
     * Render the parsed tree as HTML
     */
    render(tokens) {
        this.container.innerHTML = '';

        if (!tokens || tokens.length === 0) {
            this.container.innerHTML = '<div class="pa-logic-tree__empty">No conditions defined</div>';
            return;
        }

        const tree = this.parseTokens(tokens);

        if (!tree) {
            this.container.innerHTML = '<div class="pa-logic-tree__empty">Invalid query structure</div>';
            return;
        }

        const treeElement = this.renderNode(tree, 0);
        this.container.appendChild(treeElement);

        if (this.options.animated) {
            this.container.classList.add('pa-logic-tree--animated');
        }
    }

    /**
     * Render a single node in the tree
     */
    renderNode(node, depth) {
        if (!node) {
            // Return empty div instead of text node for proper styling
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'pa-logic-tree__empty-branch';
            emptyDiv.textContent = '...';
            return emptyDiv;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'pa-logic-tree__node';
        wrapper.setAttribute('data-depth', depth);

        if (node.type === 'condition') {
            // Render condition block (field operator value)
            const block = document.createElement('div');
            block.className = 'pa-logic-tree__block pa-logic-tree__block--condition';

            block.innerHTML = `
                <div class="pa-logic-tree__block-content">
                    <span class="pa-logic-tree__token pa-logic-tree__token--field">${this.escapeHtml(node.field)}</span>
                    <span class="pa-logic-tree__token pa-logic-tree__token--operator">${this.escapeHtml(node.operator)}</span>
                    <span class="pa-logic-tree__token pa-logic-tree__token--value">${this.escapeHtml(node.value)}</span>
                </div>
            `;

            wrapper.appendChild(block);
        } else if (node.type === 'logical') {
            // Render logical operator with tree structure
            const block = document.createElement('div');
            block.className = `pa-logic-tree__block pa-logic-tree__block--logical pa-logic-tree__block--${node.operator.toLowerCase()}`;

            // Create tree structure container
            const treeContainer = document.createElement('div');
            treeContainer.className = 'pa-logic-tree__tree-structure';

            // Left branch with connector
            const leftBranch = document.createElement('div');
            leftBranch.className = 'pa-logic-tree__tree-branch pa-logic-tree__tree-branch--left';
            leftBranch.appendChild(this.renderNode(node.left, depth + 1));
            treeContainer.appendChild(leftBranch);

            // Operator node in the middle
            const operatorNode = document.createElement('div');
            operatorNode.className = 'pa-logic-tree__tree-operator';
            operatorNode.innerHTML = `<span class="pa-logic-tree__token pa-logic-tree__token--logical">${node.operator}</span>`;
            treeContainer.appendChild(operatorNode);

            // Right branch with connector
            const rightBranch = document.createElement('div');
            rightBranch.className = 'pa-logic-tree__tree-branch pa-logic-tree__tree-branch--right';
            rightBranch.appendChild(this.renderNode(node.right, depth + 1));
            treeContainer.appendChild(rightBranch);

            block.appendChild(treeContainer);
            wrapper.appendChild(block);
        } else if (node.type === 'group') {
            // Render parenthesized group
            const block = document.createElement('div');
            block.className = 'pa-logic-tree__block pa-logic-tree__block--group';

            const groupLabel = document.createElement('div');
            groupLabel.className = 'pa-logic-tree__group-label';
            groupLabel.innerHTML = '<span class="pa-logic-tree__token pa-logic-tree__token--paren">Grouped Condition</span>';
            block.appendChild(groupLabel);

            const groupContent = document.createElement('div');
            groupContent.className = 'pa-logic-tree__group-content';
            groupContent.appendChild(this.renderNode(node.expression, depth + 1));
            block.appendChild(groupContent);

            wrapper.appendChild(block);
        }

        return wrapper;
    }

    /**
     * Escape HTML for safe rendering
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clear the tree visualization
     */
    clear() {
        this.container.innerHTML = '';
    }
}
