/**
 * Pure Admin Date Picker
 *
 * Lightweight date picker with excellent keyboard navigation
 * Note: This is a UI/UX demo. Full functionality in Svelte version.
 *
 * Features:
 * - Keyboard navigation (arrows, enter, esc)
 * - Rolling month/year selector
 * - Today and Clear buttons
 * - Single date and date range selection
 * - Floating UI positioning
 *
 * Dependencies: @floating-ui/dom
 */

(function() {
    'use strict';

    console.log('[DatePicker 1] Script loaded and executing');

    // Wait for Floating UI
    if (typeof window.FloatingUIDOM === 'undefined') {
        console.error('[DatePicker 2] Floating UI required for date picker positioning - NOT FOUND');
        return;
    }

    console.log('[DatePicker 3] Floating UI found, continuing...');

    const { computePosition, flip, shift, offset } = window.FloatingUIDOM;

    class PureDatePicker {
        constructor(inputElement, options = {}) {
            console.log('[DatePicker 4] Constructor called for input:', inputElement);
            this.input = inputElement;
            this.options = {
                mode: options.mode || 'single', // 'single' or 'range'
                position: options.position || 'bottom-start',
                monthsToShow: options.monthsToShow || 1, // Number of months to display
                onSelect: options.onSelect || null,
                ...options
            };

            this.currentDate = new Date();

            // Initialize separate dates for each month
            this.monthDates = [];
            const now = new Date();
            for (let i = 0; i < this.options.monthsToShow; i++) {
                const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
                this.monthDates.push(date);
                console.log(`[DatePicker Init] monthDates[${i}] = ${date.getFullYear()}-${date.getMonth()+1}`);
            }

            this.selectedDate = null;
            this.selectedStartDate = null;
            this.selectedEndDate = null;
            this.focusedDayIndex = null;
            this.activeMonthIndex = 0; // Track which month column is active for keyboard navigation

            // Initialize rolling selector state for each month
            this.showingRollingSelector = [];
            for (let i = 0; i < this.options.monthsToShow; i++) {
                this.showingRollingSelector.push(false);
            }

            // Drag state for range adjustment
            this.draggingType = null; // 'start' | 'end'
            this.isDragging = false;
            this.dragStartDate = null;
            this.originalStartDate = null;
            this.originalEndDate = null;
            this.dragPreviewStart = null;
            this.dragPreviewEnd = null;
            this.autoScrollInterval = null;

            this.init();
        }

        init() {
            console.log('[DatePicker 5] Init called');
            this.createCalendar();
            this.attachInputListeners();
            this.renderCalendar();
            console.log('[DatePicker 6] Init complete');
        }

        createCalendar() {
            console.log('[DatePicker 7] Creating calendar');
            this.calendar = document.createElement('div');
            this.calendar.className = 'pa-date-picker';

            // Create container for months
            const monthsContainer = document.createElement('div');
            monthsContainer.className = 'pa-date-picker__months';

            // Create individual month calendars
            for (let i = 0; i < this.options.monthsToShow; i++) {
                const monthCalendar = document.createElement('div');
                monthCalendar.className = 'pa-date-picker__month';
                monthCalendar.dataset.monthIndex = i;
                monthCalendar.innerHTML = `
                    <div class="pa-date-picker__header">
                        <button class="pa-date-picker__nav pa-date-picker__nav--prev" data-action="prev" data-month-index="${i}"></button>
                        <div class="pa-date-picker__month-year" data-action="toggle-rolling" data-month-index="${i}"></div>
                        <button class="pa-date-picker__nav pa-date-picker__nav--next" data-action="next" data-month-index="${i}"></button>
                    </div>
                    <div class="pa-date-picker__rolling-selector" data-month-index="${i}">
                        <div class="pa-date-picker__rolling-list" data-list="years" data-month-index="${i}"></div>
                        <div class="pa-date-picker__rolling-list" data-list="months" data-month-index="${i}"></div>
                    </div>
                    <div class="pa-date-picker__weekdays"></div>
                    <div class="pa-date-picker__days" data-month-index="${i}"></div>
                `;
                monthsContainer.appendChild(monthCalendar);
            }

            this.calendar.appendChild(monthsContainer);

            // Add selection summary (for range mode)
            if (this.options.mode === 'range') {
                const summary = document.createElement('div');
                summary.className = 'pa-date-picker__summary pa-date-picker__summary--hidden';
                this.calendar.appendChild(summary);
            }

            // Add actions at the bottom
            const actions = document.createElement('div');
            actions.className = 'pa-date-picker__actions';
            actions.innerHTML = `
                <button class="pa-date-picker__button pa-date-picker__button--today" data-action="today">Today</button>
                <button class="pa-date-picker__button pa-date-picker__button--clear" data-action="clear">Clear</button>
                ${this.options.mode === 'range' ? '<button class="pa-date-picker__button pa-date-picker__button--apply" data-action="apply">Apply</button>' : ''}
            `;
            this.calendar.appendChild(actions);

            document.body.appendChild(this.calendar);
            console.log('[DatePicker 7b] Calendar appended to body:', this.calendar);
            this.attachCalendarListeners();

            // Initialize rolling selector states for each month
            this.showingRollingSelector = new Array(this.options.monthsToShow).fill(false);
        }

        attachInputListeners() {
            console.log('[DatePicker 8] Attaching input listeners');
            this.input.addEventListener('click', () => {
                console.log('[DatePicker 9] Input clicked');
                this.show();
            });
            this.input.addEventListener('focus', () => {
                console.log('[DatePicker 10] Input focused');
                this.show();
            });
        }

        attachCalendarListeners() {
            // Delegate all click events
            this.calendar.addEventListener('click', (e) => {
                // Stop propagation to prevent "close on outside click" from firing
                e.stopPropagation();

                const action = e.target.dataset.action;
                const monthIndex = parseInt(e.target.dataset.monthIndex);

                if (action === 'prev') this.prevMonth(monthIndex);
                else if (action === 'next') this.nextMonth(monthIndex);
                else if (action === 'toggle-rolling') this.toggleRollingSelector(monthIndex);
                else if (action === 'today') this.selectToday();
                else if (action === 'clear') this.clear();
                else if (action === 'apply') this.apply();
                else if (e.target.closest('.pa-date-picker__day:not(.pa-date-picker__day--disabled)')) {
                    this.selectDay(e.target.closest('.pa-date-picker__day'));
                }
                else if (e.target.closest('[data-year]')) {
                    const yearElement = e.target.closest('[data-year]');
                    this.selectYear(parseInt(yearElement.dataset.year), parseInt(yearElement.dataset.monthIndex));
                }
                else if (e.target.closest('[data-month]')) {
                    const monthElement = e.target.closest('[data-month]');
                    this.selectMonth(parseInt(monthElement.dataset.month), parseInt(monthElement.dataset.monthIndex));
                }
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (!this.calendar.classList.contains('pa-date-picker--visible')) return;

                if (e.key === 'Escape') {
                    this.hide();
                    e.preventDefault();
                }
                else if (e.key === 'ArrowUp') {
                    this.moveFocus(-7);
                    e.preventDefault();
                }
                else if (e.key === 'ArrowDown') {
                    this.moveFocus(7);
                    e.preventDefault();
                }
                else if (e.key === 'ArrowLeft') {
                    this.moveFocus(-1);
                    e.preventDefault();
                }
                else if (e.key === 'ArrowRight') {
                    this.moveFocus(1);
                    e.preventDefault();
                }
                else if (e.key === 'Enter') {
                    if (this.focusedDayIndex !== null) {
                        const daysContainer = this.calendar.querySelector(`.pa-date-picker__days[data-month-index="${this.activeMonthIndex}"]`);
                        const days = daysContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
                        days[this.focusedDayIndex]?.click();
                    }
                    e.preventDefault();
                }
                else if (e.key === 'Tab') {
                    // Switch between columns in multi-month mode
                    if (this.options.monthsToShow > 1) {
                        const direction = e.shiftKey ? -1 : 1;
                        const newMonthIndex = this.activeMonthIndex + direction;

                        // Clamp to valid range
                        if (newMonthIndex >= 0 && newMonthIndex < this.monthDates.length) {
                            console.log(`[DatePicker] Tab: switching from Col${this.activeMonthIndex} to Col${newMonthIndex}`);

                            // Get current focused day index before switching
                            const currentFocusedIndex = this.focusedDayIndex ?? 0;

                            // Switch to new column
                            this.activeMonthIndex = newMonthIndex;

                            // Try to maintain same day index, or clamp to valid range
                            const newDaysContainer = this.calendar.querySelector(`.pa-date-picker__days[data-month-index="${this.activeMonthIndex}"]`);
                            if (newDaysContainer) {
                                const newDays = newDaysContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
                                this.focusedDayIndex = Math.min(currentFocusedIndex, newDays.length - 1);
                                console.log(`[DatePicker Col${this.activeMonthIndex}] Tab: set focusedDayIndex to ${this.focusedDayIndex}`);
                            }

                            // Re-render to show new focus
                            this.renderCalendar();
                        }
                        e.preventDefault();
                    }
                }
                else if (e.key === 't' || e.key === 'T') {
                    // Jump to today in the active month column
                    this.monthDates[this.activeMonthIndex] = new Date();
                    this.renderCalendar();
                    // Focus on today's day in the active month
                    setTimeout(() => {
                        const daysContainer = this.calendar.querySelector(`.pa-date-picker__days[data-month-index="${this.activeMonthIndex}"]`);
                        const days = daysContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
                        const todayIndex = Array.from(days).findIndex(day => day.classList.contains('pa-date-picker__day--today'));
                        if (todayIndex !== -1) {
                            this.focusedDayIndex = todayIndex;
                            days[todayIndex].classList.add('pa-date-picker__day--focused');
                            days[todayIndex].scrollIntoView({ block: 'nearest' });
                        }
                    }, 0);
                    e.preventDefault();
                }
                else if (e.key === 'PageUp') {
                    // Go to previous month in active column, same day position
                    const currentDayIndex = this.focusedDayIndex;
                    this.prevMonth(this.activeMonthIndex);
                    setTimeout(() => {
                        const daysContainer = this.calendar.querySelector(`.pa-date-picker__days[data-month-index="${this.activeMonthIndex}"]`);
                        const newDays = daysContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
                        // Try to maintain same day index, or use last day if month is shorter
                        this.focusedDayIndex = Math.min(currentDayIndex !== null ? currentDayIndex : 0, newDays.length - 1);
                        newDays[this.focusedDayIndex]?.classList.add('pa-date-picker__day--focused');
                        newDays[this.focusedDayIndex]?.scrollIntoView({ block: 'nearest' });
                    }, 0);
                    e.preventDefault();
                }
                else if (e.key === 'PageDown') {
                    // Go to next month in active column, same day position
                    const currentDayIndex = this.focusedDayIndex;
                    this.nextMonth(this.activeMonthIndex);
                    setTimeout(() => {
                        const daysContainer = this.calendar.querySelector(`.pa-date-picker__days[data-month-index="${this.activeMonthIndex}"]`);
                        const newDays = daysContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
                        // Try to maintain same day index, or use last day if month is shorter
                        this.focusedDayIndex = Math.min(currentDayIndex !== null ? currentDayIndex : 0, newDays.length - 1);
                        newDays[this.focusedDayIndex]?.classList.add('pa-date-picker__day--focused');
                        newDays[this.focusedDayIndex]?.scrollIntoView({ block: 'nearest' });
                    }, 0);
                    e.preventDefault();
                }
                else if (e.key === 'Home') {
                    // Go to January 1st of current year in active column
                    // If already there, go to January 1st of previous year
                    const currentYear = this.monthDates[this.activeMonthIndex].getFullYear();
                    const isJanuary = this.monthDates[this.activeMonthIndex].getMonth() === 0;
                    const isFirstDay = this.focusedDayIndex === 0;

                    if (isJanuary && isFirstDay) {
                        // Already at Jan 1 - go to previous year
                        this.monthDates[this.activeMonthIndex] = new Date(currentYear - 1, 0, 1);
                    } else {
                        // Go to Jan 1 of current year
                        this.monthDates[this.activeMonthIndex] = new Date(currentYear, 0, 1);
                    }
                    this.renderCalendar();
                    setTimeout(() => {
                        const daysContainer = this.calendar.querySelector(`.pa-date-picker__days[data-month-index="${this.activeMonthIndex}"]`);
                        const days = daysContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
                        this.focusedDayIndex = 0;
                        days[0]?.classList.add('pa-date-picker__day--focused');
                        days[0]?.scrollIntoView({ block: 'nearest' });
                    }, 0);
                    e.preventDefault();
                }
                else if (e.key === 'End') {
                    // Go to December 31st of current year in active column
                    // If already there, go to December 31st of next year
                    const currentYear = this.monthDates[this.activeMonthIndex].getFullYear();
                    const isDecember = this.monthDates[this.activeMonthIndex].getMonth() === 11;

                    // Check if we're at the last day
                    const daysContainer = this.calendar.querySelector(`.pa-date-picker__days[data-month-index="${this.activeMonthIndex}"]`);
                    const days = daysContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
                    const isLastDay = this.focusedDayIndex === days.length - 1;

                    if (isDecember && isLastDay) {
                        // Already at Dec 31 - go to next year
                        this.monthDates[this.activeMonthIndex] = new Date(currentYear + 1, 11, 31);
                    } else {
                        // Go to Dec 31 of current year
                        this.monthDates[this.activeMonthIndex] = new Date(currentYear, 11, 31);
                    }
                    this.renderCalendar();
                    setTimeout(() => {
                        const newContainer = this.calendar.querySelector(`.pa-date-picker__days[data-month-index="${this.activeMonthIndex}"]`);
                        const newDays = newContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
                        this.focusedDayIndex = newDays.length - 1;
                        newDays[this.focusedDayIndex]?.classList.add('pa-date-picker__day--focused');
                        newDays[this.focusedDayIndex]?.scrollIntoView({ block: 'nearest' });
                    }, 0);
                    e.preventDefault();
                }
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!this.calendar.contains(e.target) && e.target !== this.input) {
                    this.hide();
                }
            });
        }

        show() {
            console.log('[DatePicker 11] Show called - adding visible class');
            this.calendar.classList.add('pa-date-picker--visible');
            console.log('[DatePicker 11a] Calendar classes:', this.calendar.className);
            this.position();
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(this.calendar);
                console.log('[DatePicker 11e] Calendar display:', computedStyle.display, 'position:', computedStyle.position, 'left:', computedStyle.left, 'top:', computedStyle.top, 'z-index:', computedStyle.zIndex);
            }, 100);
        }

        hide() {
            this.calendar.classList.remove('pa-date-picker--visible');
            // Reset all rolling selectors to closed state
            for (let i = 0; i < this.showingRollingSelector.length; i++) {
                this.showingRollingSelector[i] = false;
            }
            this.renderCalendar();
        }

        async position() {
            console.log('[DatePicker 11b] Position method called');
            const { x, y } = await computePosition(this.input, this.calendar, {
                placement: this.options.position,
                middleware: [offset(8), flip(), shift({ padding: 8 })]
            });
            console.log('[DatePicker 11c] FloatingUI computed position - x:', x, 'y:', y);

            this.calendar.style.left = `${x}px`;
            this.calendar.style.top = `${y}px`;
            console.log('[DatePicker 11d] Position applied to calendar');
        }

        renderCalendar() {
            console.log(`[DatePicker 18] renderCalendar called, showingRollingSelector:`, this.showingRollingSelector, `activeCol: ${this.activeMonthIndex}`);
            console.log('[DatePicker 18] monthDates array:', this.monthDates.map((d, i) => `Col${i}: ${d.getFullYear()}-${d.getMonth()+1}`).join(', '));

            // Render each month
            for (let i = 0; i < this.options.monthsToShow; i++) {
                if (this.showingRollingSelector[i]) {
                    this.renderRollingSelector(i);
                } else {
                    this.renderNormalView(i);
                }
            }

            // Initialize drag listeners for range mode
            if (this.options.mode === 'range' && !this.isDragging) {
                this.initDragListeners();
            }
        }

        renderNormalView(monthIndex) {
            console.log(`[DatePicker Col${monthIndex} 19] renderNormalView called for month`, monthIndex);
            const monthContainer = this.calendar.querySelector(`.pa-date-picker__month[data-month-index="${monthIndex}"]`);
            if (!monthContainer) return;

            // Hide rolling selector for this month
            const rollingSelector = monthContainer.querySelector('.pa-date-picker__rolling-selector');
            rollingSelector.classList.remove('pa-date-picker__rolling-selector--visible');

            // Get this month's date
            const date = this.monthDates[monthIndex];

            // Update month/year display
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'];
            const monthYear = monthContainer.querySelector('.pa-date-picker__month-year');
            monthYear.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

            // Render weekdays
            const weekdays = monthContainer.querySelector('.pa-date-picker__weekdays');
            weekdays.innerHTML = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
                .map(day => `<div class="pa-date-picker__weekday">${day}</div>`).join('');

            // Render days
            this.renderDays(monthIndex, date);
        }

        renderDays(monthIndex, date) {
            console.log(`[DatePicker Col${monthIndex} 20] renderDays called for month`, monthIndex);
            const monthContainer = this.calendar.querySelector(`.pa-date-picker__month[data-month-index="${monthIndex}"]`);
            if (!monthContainer) return;

            const daysContainer = monthContainer.querySelector('.pa-date-picker__days');
            const year = date.getFullYear();
            const month = date.getMonth();
            console.log(`[DatePicker Col${monthIndex} 21] Rendering days for:`, year, month + 1);

            // Get first day of month and number of days
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();

            // Calculate previous and next month for data-date attributes
            const prevMonthDate = new Date(year, month - 1, 1);
            const prevYear = prevMonthDate.getFullYear();
            const prevMonth = prevMonthDate.getMonth();

            const nextMonthDate = new Date(year, month + 1, 1);
            const nextYear = nextMonthDate.getFullYear();
            const nextMonth = nextMonthDate.getMonth();

            let html = '';

            // Previous month days
            for (let i = firstDay - 1; i >= 0; i--) {
                const day = daysInPrevMonth - i;
                const date = new Date(prevYear, prevMonth, day);
                const classes = ['pa-date-picker__day', 'pa-date-picker__day--other-month'];

                // Check if in range (for long date ranges spanning multiple months)
                if (this.options.mode === 'range' && this.isInRange(date)) {
                    classes.push('pa-date-picker__day--in-range');
                }

                html += `<div class="${classes.join(' ')}" data-date="${prevYear}-${prevMonth}-${day}">${day}</div>`;
            }

            // Current month days
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const classes = ['pa-date-picker__day'];

                // Today
                if (this.isToday(date)) classes.push('pa-date-picker__day--today');

                // Selected
                if (this.options.mode === 'single' && this.isSameDay(date, this.selectedDate)) {
                    classes.push('pa-date-picker__day--selected');
                }

                // Range
                if (this.options.mode === 'range') {
                    if (this.isSameDay(date, this.selectedStartDate)) classes.push('pa-date-picker__day--range-start');
                    if (this.isSameDay(date, this.selectedEndDate)) classes.push('pa-date-picker__day--range-end');
                    if (this.isInRange(date)) classes.push('pa-date-picker__day--in-range');
                }

                html += `<div class="${classes.join(' ')}" data-date="${year}-${month}-${day}">${day}</div>`;
            }

            // Next month days
            const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
            const remainingCells = totalCells - (firstDay + daysInMonth);
            for (let day = 1; day <= remainingCells; day++) {
                const date = new Date(nextYear, nextMonth, day);
                const classes = ['pa-date-picker__day', 'pa-date-picker__day--other-month'];

                // Check if in range (for long date ranges spanning multiple months)
                if (this.options.mode === 'range' && this.isInRange(date)) {
                    classes.push('pa-date-picker__day--in-range');
                }

                html += `<div class="${classes.join(' ')}" data-date="${nextYear}-${nextMonth}-${day}">${day}</div>`;
            }

            daysContainer.innerHTML = html;
        }

        renderRollingSelector(monthIndex) {
            const monthContainer = this.calendar.querySelector(`.pa-date-picker__month[data-month-index="${monthIndex}"]`);
            if (!monthContainer) return;

            const selector = monthContainer.querySelector('.pa-date-picker__rolling-selector');
            selector.classList.add('pa-date-picker__rolling-selector--visible');

            // Get this month's date
            const date = this.monthDates[monthIndex];

            // Render years
            const yearsContainer = selector.querySelector('[data-list="years"]');
            const currentYear = date.getFullYear();
            let yearsHtml = '';
            for (let year = currentYear - 50; year <= currentYear + 50; year++) {
                const selected = year === currentYear ? 'pa-date-picker__rolling-item--selected' : '';
                yearsHtml += `<div class="pa-date-picker__rolling-item ${selected}" data-year="${year}" data-month-index="${monthIndex}">${year}</div>`;
            }
            yearsContainer.innerHTML = yearsHtml;
            yearsContainer.querySelector('.pa-date-picker__rolling-item--selected')?.scrollIntoView({ block: 'center' });

            // Render months
            const monthsContainer = selector.querySelector('[data-list="months"]');
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'];
            const currentMonth = date.getMonth();
            monthsContainer.innerHTML = monthNames.map((name, index) => {
                const selected = index === currentMonth ? 'pa-date-picker__rolling-item--selected' : '';
                return `<div class="pa-date-picker__rolling-item ${selected}" data-month="${index}" data-month-index="${monthIndex}">${name}</div>`;
            }).join('');
            monthsContainer.querySelector('.pa-date-picker__rolling-item--selected')?.scrollIntoView({ block: 'center' });
        }

        toggleRollingSelector(monthIndex) {
            this.showingRollingSelector[monthIndex] = !this.showingRollingSelector[monthIndex];
            this.renderCalendar();
        }

        selectYear(year, monthIndex) {
            // Update only this specific month's year
            const oldYear = this.monthDates[monthIndex].getFullYear();
            this.monthDates[monthIndex].setFullYear(year);
            console.log(`[DatePicker Col${monthIndex}] selectYear - changed from ${oldYear} to ${year}`);

            // Check for collisions with adjacent columns
            this.checkAndResolveCollisions(monthIndex);

            this.showingRollingSelector[monthIndex] = false;
            this.renderCalendar();
        }

        selectMonth(month, monthIndex) {
            // Update only this specific month's month
            const oldMonth = this.monthDates[monthIndex].getMonth();
            this.monthDates[monthIndex].setMonth(month);
            console.log(`[DatePicker Col${monthIndex}] selectMonth - changed from ${oldMonth+1} to ${month+1}`);

            // Check for collisions with adjacent columns
            this.checkAndResolveCollisions(monthIndex);

            this.showingRollingSelector[monthIndex] = false;
            this.renderCalendar();
        }

        // Check and resolve collisions after changing a column's date
        checkAndResolveCollisions(changedIdx) {
            const changedDate = this.monthDates[changedIdx];

            // Check collision with next column (if exists)
            if (changedIdx < this.monthDates.length - 1) {
                const nextDate = this.monthDates[changedIdx + 1];
                if (this.isSameOrAfterMonth(changedDate, nextDate)) {
                    console.log(`[DatePicker Col${changedIdx}] Collision with Col${changedIdx+1}, shifting forward`);
                    // Move next column to be 1 month after changed column
                    const newNextDate = new Date(changedDate.getFullYear(), changedDate.getMonth() + 1, 1);
                    this.monthDates[changedIdx + 1] = newNextDate;
                    // Recursively check next column
                    this.checkAndResolveCollisions(changedIdx + 1);
                }
            }

            // Check collision with previous column (if exists)
            if (changedIdx > 0) {
                const prevDate = this.monthDates[changedIdx - 1];
                if (this.isSameOrAfterMonth(prevDate, changedDate)) {
                    console.log(`[DatePicker Col${changedIdx}] Collision with Col${changedIdx-1}, shifting backward`);
                    // Move previous column to be 1 month before changed column
                    const newPrevDate = new Date(changedDate.getFullYear(), changedDate.getMonth() - 1, 1);
                    this.monthDates[changedIdx - 1] = newPrevDate;
                    // Recursively check previous column
                    this.checkAndResolveCollisions(changedIdx - 1);
                }
            }
        }

        // Helper: Compare if date1 >= date2 (by year-month only)
        isSameOrAfterMonth(date1, date2) {
            const year1 = date1.getFullYear();
            const month1 = date1.getMonth();
            const year2 = date2.getFullYear();
            const month2 = date2.getMonth();

            if (year1 > year2) return true;
            if (year1 === year2 && month1 >= month2) return true;
            return false;
        }

        prevMonth(monthIndex) {
            // Update only the specific month
            const idx = !isNaN(monthIndex) ? monthIndex : this.activeMonthIndex;

            const oldDate = this.monthDates[idx];
            const newDate = new Date(oldDate.getFullYear(), oldDate.getMonth() - 1, 1);
            this.monthDates[idx] = newDate;
            console.log(`[DatePicker Col${idx}] prevMonth - changed from ${oldDate.getFullYear()}-${oldDate.getMonth()+1} to ${newDate.getFullYear()}-${newDate.getMonth()+1}`);

            // If moving backward causes overlap with previous column, shift previous columns back
            if (idx > 0) {
                const prevDate = this.monthDates[idx - 1];
                if (this.isSameOrAfterMonth(prevDate, newDate)) {
                    console.log(`[DatePicker Col${idx}] Collision detected with Col${idx-1}, shifting previous columns back`);
                    // Recursively move previous column back
                    this.prevMonth(idx - 1);
                }
            }

            this.renderCalendar();
        }

        nextMonth(monthIndex) {
            // Update only the specific month
            const idx = !isNaN(monthIndex) ? monthIndex : this.activeMonthIndex;

            const oldDate = this.monthDates[idx];
            const newDate = new Date(oldDate.getFullYear(), oldDate.getMonth() + 1, 1);
            this.monthDates[idx] = newDate;
            console.log(`[DatePicker Col${idx}] nextMonth - changed from ${oldDate.getFullYear()}-${oldDate.getMonth()+1} to ${newDate.getFullYear()}-${newDate.getMonth()+1}`);

            // If moving forward causes overlap with next column, shift next columns forward
            if (idx < this.monthDates.length - 1) {
                const nextDate = this.monthDates[idx + 1];
                if (this.isSameOrAfterMonth(newDate, nextDate)) {
                    console.log(`[DatePicker Col${idx}] Collision detected with Col${idx+1}, shifting next columns forward`);
                    // Recursively move next column forward
                    this.nextMonth(idx + 1);
                }
            }

            this.renderCalendar();
        }

        selectDay(dayElement) {
            if (dayElement.classList.contains('pa-date-picker__day--disabled')) return;

            // Validate that we have a valid day element with data-date
            if (!dayElement.dataset || !dayElement.dataset.date) {
                console.warn('[DatePicker] selectDay called with invalid element:', dayElement);
                return;
            }

            // Parse the date from the element
            const [year, month, day] = dayElement.dataset.date.split('-').map(Number);
            const date = new Date(year, month, day);

            // Check if this is an "other month" day
            const isOtherMonth = dayElement.classList.contains('pa-date-picker__day--other-month');

            // Determine which column this click happened in
            const daysContainer = dayElement.closest('.pa-date-picker__days');
            if (daysContainer) {
                this.activeMonthIndex = parseInt(daysContainer.dataset.monthIndex) || 0;
                console.log(`[DatePicker Col${this.activeMonthIndex}] selectDay - activeMonthIndex:`, this.activeMonthIndex);

                // If clicked on other-month day, switch that column to the clicked date's month
                if (isOtherMonth) {
                    console.log(`[DatePicker Col${this.activeMonthIndex}] Clicked other-month day ${day}, switching to ${year}-${month+1}`);
                    this.monthDates[this.activeMonthIndex] = new Date(year, month, 1);

                    // Check for collisions after switching month
                    this.checkAndResolveCollisions(this.activeMonthIndex);

                    // Re-render calendar with the new month
                    this.renderCalendar();

                    // After switching month, find and click the day again (it's now a current-month day)
                    setTimeout(() => {
                        const newDaysContainer = this.calendar.querySelector(`.pa-date-picker__days[data-month-index="${this.activeMonthIndex}"]`);
                        if (newDaysContainer) {
                            const allDays = newDaysContainer.querySelectorAll('.pa-date-picker__day');
                            const targetDay = Array.from(allDays).find(d => d.dataset.date === `${year}-${month}-${day}`);
                            if (targetDay && !targetDay.classList.contains('pa-date-picker__day--other-month')) {
                                targetDay.click();
                            }
                        }
                    }, 0);
                    return; // Exit early, the click above will complete the selection
                }

                // For current month days, set focused index for keyboard navigation
                const days = daysContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
                this.focusedDayIndex = Array.from(days).indexOf(dayElement);
                console.log(`[DatePicker Col${this.activeMonthIndex}] selectDay - set focusedDayIndex to:`, this.focusedDayIndex);
            }

            if (this.options.mode === 'single') {
                this.selectedDate = date;
                this.input.value = this.formatDate(date);
                if (this.options.onSelect) this.options.onSelect(date);
                this.hide();
            } else { // range
                if (!this.selectedStartDate || this.selectedEndDate) {
                    // Start new range
                    this.selectedStartDate = date;
                    this.selectedEndDate = null;
                    // Show first date in input immediately
                    this.input.value = `${this.formatDate(this.selectedStartDate)} - ...`;
                } else {
                    // Complete range
                    if (date >= this.selectedStartDate) {
                        this.selectedEndDate = date;
                    } else {
                        this.selectedEndDate = this.selectedStartDate;
                        this.selectedStartDate = date;
                    }
                    this.input.value = `${this.formatDate(this.selectedStartDate)} - ${this.formatDate(this.selectedEndDate)}`;
                    if (this.options.onSelect) this.options.onSelect({ start: this.selectedStartDate, end: this.selectedEndDate });
                    // Don't close - let user click Apply button or click outside
                }
            }

            this.renderCalendar();
            this.updateSummary();
        }

        updateSummary() {
            if (this.options.mode !== 'range') return;

            const summary = this.calendar.querySelector('.pa-date-picker__summary');
            if (!summary) return;

            if (this.selectedStartDate && this.selectedEndDate) {
                // Calculate days and nights
                const msPerDay = 1000 * 60 * 60 * 24;
                const timeDiff = this.selectedEndDate - this.selectedStartDate;
                const days = Math.floor(timeDiff / msPerDay) + 1; // +1 to include both start and end days
                const nights = days - 1; // Nights = days - 1

                summary.className = 'pa-date-picker__summary pa-date-picker__summary--visible';
                summary.innerHTML = `
                    <span class="pa-date-picker__summary-count">${days} ${days === 1 ? 'day' : 'days'}</span>
                    <span>, </span>
                    <span class="pa-date-picker__summary-count">${nights} ${nights === 1 ? 'night' : 'nights'}</span>
                `;
            } else {
                summary.className = 'pa-date-picker__summary pa-date-picker__summary--hidden';
                summary.innerHTML = '';
            }
        }

        selectToday() {
            this.monthDates[this.activeMonthIndex] = new Date();
            this.selectedDate = new Date();
            this.input.value = this.formatDate(this.selectedDate);
            if (this.options.onSelect) this.options.onSelect(this.selectedDate);
            this.renderCalendar();
            if (this.options.mode === 'single') this.hide();
        }

        clear() {
            this.selectedDate = null;
            this.selectedStartDate = null;
            this.selectedEndDate = null;
            this.input.value = '';
            this.renderCalendar();
            this.updateSummary();
        }

        apply() {
            if (this.selectedStartDate && this.selectedEndDate) {
                this.hide();
            }
        }

        // === DRAG FUNCTIONALITY ===

        initDragListeners() {
            // Add mousedown listeners to range-start and range-end days
            const rangeStartDays = this.calendar.querySelectorAll('.pa-date-picker__day--range-start');
            const rangeEndDays = this.calendar.querySelectorAll('.pa-date-picker__day--range-end');

            rangeStartDays.forEach(day => {
                day.addEventListener('mousedown', (e) => this.startDrag(e, 'start'));
            });

            rangeEndDays.forEach(day => {
                day.addEventListener('mousedown', (e) => this.startDrag(e, 'end'));
            });
        }

        startDrag(event, type) {
            event.preventDefault();
            event.stopPropagation();

            this.isDragging = true;
            this.draggingType = type;
            this.originalStartDate = new Date(this.selectedStartDate);
            this.originalEndDate = new Date(this.selectedEndDate);

            // Add dragging class to the day being dragged
            event.currentTarget.classList.add('pa-date-picker__day--dragging');

            console.log(`[DatePicker Drag] Started dragging ${type} date`);

            // Add document-level listeners
            this.onDragMoveBound = this.onDragMove.bind(this);
            this.onDragEndBound = this.onDragEnd.bind(this);
            document.addEventListener('mousemove', this.onDragMoveBound);
            document.addEventListener('mouseup', this.onDragEndBound);

            // Change body cursor
            document.body.style.cursor = 'grabbing';
        }

        onDragMove(event) {
            if (!this.isDragging) return;

            // Find the day element under the cursor
            const dayElement = document.elementFromPoint(event.clientX, event.clientY);
            if (!dayElement || !dayElement.classList.contains('pa-date-picker__day')) return;

            // Skip if it's a disabled or other-month day
            if (dayElement.classList.contains('pa-date-picker__day--disabled')) return;
            if (dayElement.classList.contains('pa-date-picker__day--other-month')) {
                // Handle crossing month boundaries - will implement auto-scroll here
                this.checkAutoScroll(event);
                return;
            }

            // Parse the date from the day element
            const [year, month, day] = dayElement.dataset.date.split('-').map(Number);
            const hoveredDate = new Date(year, month, day);

            // Update preview based on what's being dragged
            if (this.draggingType === 'start') {
                this.dragPreviewStart = hoveredDate;
                this.dragPreviewEnd = this.originalEndDate;

                // Swap if start is after end
                if (this.dragPreviewStart > this.dragPreviewEnd) {
                    [this.dragPreviewStart, this.dragPreviewEnd] = [this.dragPreviewEnd, this.dragPreviewStart];
                    this.draggingType = 'end'; // Switch which end we're dragging
                }
            } else {
                this.dragPreviewStart = this.originalStartDate;
                this.dragPreviewEnd = hoveredDate;

                // Swap if end is before start
                if (this.dragPreviewEnd < this.dragPreviewStart) {
                    [this.dragPreviewStart, this.dragPreviewEnd] = [this.dragPreviewEnd, this.dragPreviewStart];
                    this.draggingType = 'start'; // Switch which end we're dragging
                }
            }

            // Update preview visuals
            this.updateDragPreview();
        }

        updateDragPreview() {
            // Remove existing preview classes
            this.calendar.querySelectorAll('.pa-date-picker__day--drag-preview').forEach(day => {
                day.classList.remove('pa-date-picker__day--drag-preview');
            });

            if (!this.dragPreviewStart || !this.dragPreviewEnd) return;

            // Add preview classes to days in the preview range
            const allDays = this.calendar.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
            allDays.forEach(day => {
                const [year, month, dayNum] = day.dataset.date.split('-').map(Number);
                const date = new Date(year, month, dayNum);

                if (date >= this.dragPreviewStart && date <= this.dragPreviewEnd) {
                    day.classList.add('pa-date-picker__day--drag-preview');
                }
            });

            // Update summary with preview counts
            this.updateSummaryWithPreview();
        }

        updateSummaryWithPreview() {
            if (this.options.mode !== 'range') return;

            const summary = this.calendar.querySelector('.pa-date-picker__summary');
            if (!summary) return;

            if (this.dragPreviewStart && this.dragPreviewEnd) {
                const msPerDay = 1000 * 60 * 60 * 24;
                const timeDiff = this.dragPreviewEnd - this.dragPreviewStart;
                const days = Math.floor(timeDiff / msPerDay) + 1;
                const nights = days - 1;

                summary.className = 'pa-date-picker__summary pa-date-picker__summary--visible';
                summary.innerHTML = `
                    <span style="opacity: 0.7;">Preview: </span>
                    <span class="pa-date-picker__summary-count">${days} ${days === 1 ? 'day' : 'days'}</span>
                    <span>, </span>
                    <span class="pa-date-picker__summary-count">${nights} ${nights === 1 ? 'night' : 'nights'}</span>
                `;
            }
        }

        onDragEnd(event) {
            if (!this.isDragging) return;

            console.log(`[DatePicker Drag] Ended dragging, finalizing selection`);

            // Finalize the selection
            if (this.dragPreviewStart && this.dragPreviewEnd) {
                this.selectedStartDate = this.dragPreviewStart;
                this.selectedEndDate = this.dragPreviewEnd;
                this.input.value = `${this.formatDate(this.selectedStartDate)} - ${this.formatDate(this.selectedEndDate)}`;

                if (this.options.onSelect) {
                    this.options.onSelect({ start: this.selectedStartDate, end: this.selectedEndDate });
                }
            }

            // Clean up
            this.isDragging = false;
            this.draggingType = null;
            this.dragPreviewStart = null;
            this.dragPreviewEnd = null;

            // Remove dragging class
            this.calendar.querySelectorAll('.pa-date-picker__day--dragging').forEach(day => {
                day.classList.remove('pa-date-picker__day--dragging');
            });

            // Remove document-level listeners
            document.removeEventListener('mousemove', this.onDragMoveBound);
            document.removeEventListener('mouseup', this.onDragEndBound);

            // Clear auto-scroll interval
            if (this.autoScrollInterval) {
                clearInterval(this.autoScrollInterval);
                this.autoScrollInterval = null;
            }

            // Reset body cursor
            document.body.style.cursor = '';

            // Re-render to show final selection
            this.renderCalendar();
            this.updateSummary();
        }

        checkAutoScroll(event) {
            // Get the calendar's bounding rect
            const calendarRect = this.calendar.getBoundingClientRect();
            const edgeThreshold = 50; // pixels from edge to trigger scroll

            // Check horizontal proximity to edges
            const leftEdge = event.clientX - calendarRect.left;
            const rightEdge = calendarRect.right - event.clientX;

            // Clear any existing auto-scroll
            if (this.autoScrollInterval) {
                clearInterval(this.autoScrollInterval);
                this.autoScrollInterval = null;
            }

            // Start auto-scroll if near edges
            if (leftEdge < edgeThreshold && leftEdge > 0) {
                // Near left edge - scroll to previous month
                console.log('[DatePicker Drag] Near left edge, auto-scrolling to previous month');
                this.autoScrollInterval = setInterval(() => {
                    if (this.activeMonthIndex > 0) {
                        this.prevMonth(this.activeMonthIndex);
                    } else if (this.options.monthsToShow === 1) {
                        this.prevMonth(0);
                    }
                }, 300);
            } else if (rightEdge < edgeThreshold && rightEdge > 0) {
                // Near right edge - scroll to next month
                console.log('[DatePicker Drag] Near right edge, auto-scrolling to next month');
                this.autoScrollInterval = setInterval(() => {
                    if (this.activeMonthIndex < this.monthDates.length - 1) {
                        this.nextMonth(this.activeMonthIndex);
                    } else if (this.options.monthsToShow === 1) {
                        this.nextMonth(0);
                    }
                }, 300);
            }
        }

        // === END DRAG FUNCTIONALITY ===

        moveFocus(offset) {
            // Only get days from the active month column
            console.log(`[DatePicker Col${this.activeMonthIndex}] moveFocus(${offset}) - focusedDayIndex:`, this.focusedDayIndex);
            const daysContainer = this.calendar.querySelector(`.pa-date-picker__days[data-month-index="${this.activeMonthIndex}"]`);
            if (!daysContainer) {
                console.log(`[DatePicker Col${this.activeMonthIndex}] ERROR: daysContainer not found!`);
                return;
            }

            const days = daysContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
            console.log(`[DatePicker Col${this.activeMonthIndex}] Found ${days.length} days in column`);
            if (days.length === 0) return;

            // Initialize focus if not set
            if (this.focusedDayIndex === null) {
                // Find today's day in the calendar as the starting point
                const todayIndex = Array.from(days).findIndex(day => day.classList.contains('pa-date-picker__day--today'));
                this.focusedDayIndex = todayIndex !== -1 ? todayIndex : 0;
                console.log(`[DatePicker Col${this.activeMonthIndex}] Initialized focusedDayIndex to ${this.focusedDayIndex} (today or first day), will move by offset ${offset}`);
            }

            // Remove old focus (if any)
            days[this.focusedDayIndex]?.classList.remove('pa-date-picker__day--focused');

            // Calculate new index
            const newIndex = this.focusedDayIndex + offset;

            // Check if we need to change months
            if (newIndex < 0) {
                const savedMonthIndex = this.activeMonthIndex;

                // For left arrow (offset -1), just go to last day of previous month
                // For up arrow (offset -7), maintain weekday column
                if (offset === -1) {
                    console.log(`[DatePicker Col${savedMonthIndex}] Edge navigation LEFT: going to last day of prev month`);
                    this.prevMonth(this.activeMonthIndex);
                    setTimeout(() => {
                        const newContainer = this.calendar.querySelector(`.pa-date-picker__month[data-month-index="${savedMonthIndex}"] .pa-date-picker__days`);
                        if (!newContainer) return;
                        const newDays = newContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
                        this.focusedDayIndex = newDays.length - 1;
                        newDays[this.focusedDayIndex]?.classList.add('pa-date-picker__day--focused');
                        newDays[this.focusedDayIndex]?.scrollIntoView({ block: 'nearest' });
                    }, 0);
                } else {
                    // Up arrow - maintain same weekday column
                    const currentDay = days[this.focusedDayIndex];
                    const [year, month, day] = currentDay.dataset.date.split('-').map(Number);
                    const currentDate = new Date(year, month, day);
                    const targetWeekday = currentDate.getDay();

                    console.log(`[DatePicker Col${savedMonthIndex}] Edge navigation UP: current day ${day} is weekday ${targetWeekday}, going to prev month`);
                    this.prevMonth(this.activeMonthIndex);
                    setTimeout(() => {
                        const newContainer = this.calendar.querySelector(`.pa-date-picker__month[data-month-index="${savedMonthIndex}"] .pa-date-picker__days`);
                        if (!newContainer) return;
                        const newDays = newContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');

                        const [lastYear, lastMonth, lastDayNum] = newDays[newDays.length - 1].dataset.date.split('-').map(Number);
                        const lastDay = new Date(lastYear, lastMonth, lastDayNum);
                        const lastWeekday = lastDay.getDay();
                        const offsetDays = (lastWeekday - targetWeekday + 7) % 7;
                        this.focusedDayIndex = newDays.length - 1 - offsetDays;

                        console.log(`[DatePicker Col${savedMonthIndex}] Last day weekday ${lastWeekday}, target ${targetWeekday}, focusing on day ${this.focusedDayIndex+1}`);
                        newDays[this.focusedDayIndex]?.classList.add('pa-date-picker__day--focused');
                        newDays[this.focusedDayIndex]?.scrollIntoView({ block: 'nearest' });
                    }, 0);
                }
                return;
            } else if (newIndex >= days.length) {
                const savedMonthIndex = this.activeMonthIndex;

                // For right arrow (offset +1), just go to first day of next month
                // For down arrow (offset +7), maintain weekday column
                if (offset === 1) {
                        console.log(`[DatePicker Col${savedMonthIndex}] Edge navigation RIGHT: going to first day of next month`);
                        this.nextMonth(this.activeMonthIndex);
                        setTimeout(() => {
                            const newContainer = this.calendar.querySelector(`.pa-date-picker__month[data-month-index="${savedMonthIndex}"] .pa-date-picker__days`);
                            if (!newContainer) return;
                            const newDays = newContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');
                            this.focusedDayIndex = 0;
                            newDays[this.focusedDayIndex]?.classList.add('pa-date-picker__day--focused');
                            newDays[this.focusedDayIndex]?.scrollIntoView({ block: 'nearest' });
                        }, 0);
                    } else {
                        // Down arrow - maintain same weekday column
                        const currentDay = days[this.focusedDayIndex];
                        const [year, month, day] = currentDay.dataset.date.split('-').map(Number);
                        const currentDate = new Date(year, month, day);
                        const targetWeekday = currentDate.getDay();

                        console.log(`[DatePicker Col${savedMonthIndex}] Edge navigation DOWN: current day ${day} is weekday ${targetWeekday}, going to next month`);
                        this.nextMonth(this.activeMonthIndex);
                        setTimeout(() => {
                            const newContainer = this.calendar.querySelector(`.pa-date-picker__month[data-month-index="${savedMonthIndex}"] .pa-date-picker__days`);
                            if (!newContainer) return;
                            const newDays = newContainer.querySelectorAll('.pa-date-picker__day:not(.pa-date-picker__day--other-month)');

                            const [firstYear, firstMonth, firstDayNum] = newDays[0].dataset.date.split('-').map(Number);
                            const firstDay = new Date(firstYear, firstMonth, firstDayNum);
                            const firstWeekday = firstDay.getDay();
                            const offsetDays = (targetWeekday - firstWeekday + 7) % 7;
                            this.focusedDayIndex = offsetDays;

                            console.log(`[DatePicker Col${savedMonthIndex}] First day weekday ${firstWeekday}, target ${targetWeekday}, focusing on day ${this.focusedDayIndex+1}`);
                            newDays[this.focusedDayIndex]?.classList.add('pa-date-picker__day--focused');
                            newDays[this.focusedDayIndex]?.scrollIntoView({ block: 'nearest' });
                        }, 0);
                    }
                    return;
            }

            // Normal movement within current month
            this.focusedDayIndex = newIndex;

            // Add new focus
            days[this.focusedDayIndex]?.classList.add('pa-date-picker__day--focused');
            days[this.focusedDayIndex]?.scrollIntoView({ block: 'nearest' });
        }

        // Helper methods
        formatDate(date) {
            if (!date) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        isToday(date) {
            const today = new Date();
            return this.isSameDay(date, today);
        }

        isSameDay(date1, date2) {
            if (!date1 || !date2) return false;
            return date1.getFullYear() === date2.getFullYear() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getDate() === date2.getDate();
        }

        isInRange(date) {
            if (!this.selectedStartDate || !this.selectedEndDate) return false;
            return date > this.selectedStartDate && date < this.selectedEndDate;
        }

        destroy() {
            this.calendar.remove();
        }
    }

    // Auto-initialize date pickers with data attribute
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[DatePicker 12] DOMContentLoaded fired, looking for [data-date-picker] inputs');
        const inputs = document.querySelectorAll('[data-date-picker]');
        console.log('[DatePicker 13] Found', inputs.length, 'date picker inputs');
        inputs.forEach((input, index) => {
            console.log('[DatePicker 14] Initializing picker', index + 1, 'for input:', input);
            const mode = input.dataset.datePickerMode || 'single';
            const monthsToShow = parseInt(input.dataset.datePickerMonths) || (mode === 'range' ? 2 : 1);
            console.log('[DatePicker 15] Mode:', mode, 'Months:', monthsToShow);
            new PureDatePicker(input, { mode, monthsToShow });
        });
        console.log('[DatePicker 16] Auto-initialization complete');
    });

    // Export to global
    window.PureDatePicker = PureDatePicker;
    console.log('[DatePicker 17] PureDatePicker class exported to window');

})();
