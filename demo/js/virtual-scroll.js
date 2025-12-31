/**
 * Pure Admin Virtual Scroll
 *
 * A general-purpose virtual scrolling utility that keeps DOM size constant
 * by rendering only visible items. Works with tables, lists, timelines, etc.
 *
 * @example
 * const vs = new VirtualScroll({
 *   container: document.getElementById('my-container'),
 *   itemHeight: 50,
 *   totalItems: 10000,
 *   renderItem: (index) => {
 *     const div = document.createElement('div');
 *     div.textContent = `Item ${index}`;
 *     return div;
 *   }
 * });
 */
class VirtualScroll {
    constructor(options) {
        // Required options
        this.container = options.container;
        this.itemHeight = options.itemHeight || 50;
        this.totalItems = options.totalItems || 0;
        this.renderItem = options.renderItem;

        // Optional options
        this.bufferSize = options.bufferSize || 5; // Extra items to render above/below viewport
        this.onScroll = options.onScroll || null;

        // Internal state
        this.scrollTop = 0;
        this.viewportHeight = 0;
        this.visibleStart = 0;
        this.visibleEnd = 0;

        // Create internal structure
        this.init();
    }

    init() {
        // Clear container
        this.container.innerHTML = '';

        // Create wrapper for positioning
        this.wrapper = document.createElement('div');
        this.wrapper.style.position = 'relative';
        this.wrapper.style.height = `${this.totalItems * this.itemHeight}px`;

        // Create viewport for visible items
        this.viewport = document.createElement('div');
        this.viewport.style.position = 'absolute';
        this.viewport.style.top = '0';
        this.viewport.style.left = '0';
        this.viewport.style.right = '0';

        this.wrapper.appendChild(this.viewport);
        this.container.appendChild(this.wrapper);

        // Set container styles if not set
        if (!this.container.style.overflowY) {
            this.container.style.overflowY = 'auto';
        }
        if (!this.container.style.position || this.container.style.position === 'static') {
            this.container.style.position = 'relative';
        }

        // Bind scroll handler
        this.container.addEventListener('scroll', this.handleScroll.bind(this));

        // Initial render
        this.viewportHeight = this.container.clientHeight;
        this.render();
    }

    handleScroll() {
        this.scrollTop = this.container.scrollTop;
        this.render();

        if (this.onScroll) {
            this.onScroll(this.scrollTop);
        }
    }

    render() {
        // Calculate visible range
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.ceil((this.scrollTop + this.viewportHeight) / this.itemHeight);

        // Add buffer
        this.visibleStart = Math.max(0, startIndex - this.bufferSize);
        this.visibleEnd = Math.min(this.totalItems, endIndex + this.bufferSize);

        // Clear viewport
        this.viewport.innerHTML = '';

        // Render visible items
        for (let i = this.visibleStart; i < this.visibleEnd; i++) {
            const item = this.renderItem(i);

            // Set item position
            if (item) {
                item.style.position = 'absolute';
                item.style.top = `${i * this.itemHeight}px`;
                item.style.left = '0';
                item.style.right = '0';

                this.viewport.appendChild(item);
            }
        }
    }

    // Update total items and re-render
    setTotalItems(count) {
        this.totalItems = count;
        this.wrapper.style.height = `${this.totalItems * this.itemHeight}px`;
        this.render();
    }

    // Scroll to specific item
    scrollToItem(index) {
        this.container.scrollTop = index * this.itemHeight;
    }

    // Get current visible range
    getVisibleRange() {
        return {
            start: this.visibleStart,
            end: this.visibleEnd
        };
    }

    // Destroy and cleanup
    destroy() {
        this.container.removeEventListener('scroll', this.handleScroll.bind(this));
        this.container.innerHTML = '';
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VirtualScroll;
}
