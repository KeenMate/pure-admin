(function () {
    const form = document.getElementById('formDemoForm');
    if (!form) return;

    const alertSlot = document.getElementById('formDemoAlertSlot');
    const tableBody = document.getElementById('formDemoTableBody');
    const tableWrapper = document.getElementById('formDemoTableWrapper');
    const emptyState = document.getElementById('formDemoEmptyState');
    const countBadge = document.getElementById('formDemoCount');
    const clearAllBtn = document.getElementById('formDemoClearAll');
    const forceErrorsCheckbox = document.getElementById('fd-force-errors');
    const cancelBtn = document.getElementById('formDemoCancelBtn');
    const resetBtn = document.getElementById('formDemoResetBtn');
    const submitLabel = form.querySelector('[data-submit-label]');

    const FIELDS = ['first_name', 'last_name', 'email', 'department', 'start_date', 'bio'];
    const REQUIRED = ['first_name', 'last_name', 'email'];

    const FORCED_ERRORS = {
        first_name: 'forced error: first name is bad',
        last_name: 'forced error: last name is bad',
        email: 'forced error: email is bad',
        department: 'forced error: pick a different one',
        start_date: 'forced error: date is off',
        bio: 'forced error: rewrite this'
    };

    const REQUIRED_LABELS = {
        first_name: 'first name is required',
        last_name: 'last name is required',
        email: 'email is required'
    };

    // Seed rows — kept in sync with keen-pure-admin's form_demo_live.ex so both
    // demos show the same initial state. `seconds_ago` drives inserted_at so the
    // Submitted column shows variance (recent, hours-old, days-old).
    const SEED = [
        {
            first_name: 'Dale',
            last_name: 'Cooper',
            email: 'dale.cooper@twinpeaks.example',
            department: 'Support',
            start_date: '2024-02-24',
            bio: 'Damn fine coffee enthusiast. FBI-level attention to detail.',
            seconds_ago: 90
        },
        {
            first_name: 'Audrey',
            last_name: 'Horne',
            email: 'audrey.horne@twinpeaks.example',
            department: 'Sales',
            start_date: '2023-09-12',
            bio: 'Great Northern hospitality brought to enterprise accounts.',
            seconds_ago: 5 * 3600
        },
        {
            first_name: 'Donna',
            last_name: 'Hayward',
            email: 'donna.hayward@twinpeaks.example',
            department: 'Marketing',
            start_date: '2025-01-07',
            bio: '',
            seconds_ago: 3 * 86400
        }
    ];

    const now = Date.now();
    const entries = SEED.map((e, i) => ({
        id: i + 1,
        first_name: e.first_name,
        last_name: e.last_name,
        email: e.email,
        department: e.department,
        start_date: e.start_date,
        bio: e.bio,
        inserted_at: new Date(now - e.seconds_ago * 1000)
    }));
    let nextId = entries.length + 1;
    let editingId = null;

    function readValues() {
        const data = new FormData(form);
        const values = {};
        FIELDS.forEach(f => { values[f] = (data.get(f) || '').toString().trim(); });
        values.force_errors = forceErrorsCheckbox.checked;
        return values;
    }

    function validate(values) {
        if (values.force_errors) return { ...FORCED_ERRORS };

        const errors = {};
        REQUIRED.forEach(f => {
            if (!values[f]) errors[f] = REQUIRED_LABELS[f];
        });

        if (!errors.email && values.email) {
            if (!(values.email.includes('@') && values.email.includes('.'))) {
                errors.email = 'enter a valid email address';
            }
        }
        return errors;
    }

    function clearFieldErrors() {
        form.querySelectorAll('[data-field]').forEach(group => {
            group.classList.remove('pa-form-group--error');
        });
        form.querySelectorAll('[data-error-for]').forEach(el => {
            el.textContent = '';
            el.hidden = true;
        });
        form.querySelectorAll('.pa-input, .pa-select').forEach(el => {
            el.classList.remove('pa-input--error', 'pa-select--error');
        });
    }

    function applyFieldErrors(errors) {
        Object.keys(errors).forEach(field => {
            const group = form.querySelector(`[data-field="${field}"]`);
            const help = form.querySelector(`[data-error-for="${field}"]`);
            const control = form.querySelector(`[name="${field}"]`);
            if (group) group.classList.add('pa-form-group--error');
            if (help) {
                help.textContent = errors[field];
                help.hidden = false;
            }
            if (control) {
                if (control.classList.contains('pa-select')) control.classList.add('pa-select--error');
                else if (!control.classList.contains('pa-textarea')) control.classList.add('pa-input--error');
            }
        });
    }

    function showAlert(variant, title, message) {
        alertSlot.innerHTML = '';
        const alert = document.createElement('div');
        alert.className = `pa-alert pa-alert--${variant} pa-alert--dismissible mb-4`;
        alert.innerHTML = `
            <div class="pa-alert__content">
                <strong>${title}</strong>
                <p class="mb-0">${message}</p>
            </div>
            <button type="button" class="pa-alert__close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        alert.querySelector('.pa-alert__close').addEventListener('click', () => alert.remove());
        alertSlot.appendChild(alert);
    }

    function clearAlert() {
        alertSlot.innerHTML = '';
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));
    }

    function truncate(str, max) {
        if (!str) return '';
        return str.length > max ? str.slice(0, max) + '…' : str;
    }

    function formatTime(dt) {
        const pad = n => String(n).padStart(2, '0');
        return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())} ` +
            `${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}:${pad(dt.getUTCSeconds())} UTC`;
    }

    function renderTable() {
        countBadge.textContent = `${entries.length} total`;

        if (entries.length === 0) {
            emptyState.hidden = false;
            tableWrapper.hidden = true;
            clearAllBtn.hidden = true;
            tableBody.innerHTML = '';
            return;
        }

        emptyState.hidden = true;
        tableWrapper.hidden = false;
        clearAllBtn.hidden = false;

        tableBody.innerHTML = entries.map(e => {
            const isEditing = e.id === editingId;
            const fullName = escapeHtml([e.first_name, e.last_name].filter(Boolean).join(' '));
            const email = escapeHtml(e.email);
            const dept = e.department
                ? `<span class="pa-badge pa-badge--info">${escapeHtml(e.department)}</span>`
                : `<span class="text-muted">—</span>`;
            const date = e.start_date
                ? escapeHtml(e.start_date)
                : `<span class="text-muted">—</span>`;
            const bio = e.bio
                ? `<span title="${escapeHtml(e.bio)}">${escapeHtml(truncate(e.bio, 60))}</span>`
                : `<span class="text-muted">—</span>`;
            return `
                <tr data-entry-id="${e.id}"${isEditing ? ' class="is-editing"' : ''}>
                    <td>
                        <div class="pa-btn-group">
                            <button type="button" class="pa-btn pa-btn--secondary pa-btn--xs" data-edit="${e.id}" title="Edit entry" aria-label="Edit entry">
                                <i class="fa-solid fa-pencil"></i>
                            </button>
                            <button type="button" class="pa-btn pa-btn--danger pa-btn--xs" data-delete="${e.id}" title="Delete entry" aria-label="Delete entry">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </td>
                    <td>${fullName}</td>
                    <td><a href="mailto:${email}" class="pa-link">${email}</a></td>
                    <td>${dept}</td>
                    <td>${date}</td>
                    <td>${bio}</td>
                    <td><small class="text-muted">${formatTime(e.inserted_at)}</small></td>
                </tr>
            `;
        }).join('');
    }

    function enterEditMode(entry) {
        editingId = entry.id;
        form.elements['first_name'].value = entry.first_name || '';
        form.elements['last_name'].value = entry.last_name || '';
        form.elements['email'].value = entry.email || '';
        form.elements['department'].value = entry.department || '';
        form.elements['start_date'].value = entry.start_date || '';
        form.elements['bio'].value = entry.bio || '';
        forceErrorsCheckbox.checked = false;

        submitLabel.textContent = 'Update Entry';
        cancelBtn.hidden = false;
        resetBtn.hidden = true;

        clearFieldErrors();
        showAlert('info', 'Edit mode', 'Make changes and click Update Entry.');
        renderTable();

        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function exitEditMode() {
        editingId = null;
        submitLabel.textContent = 'Save Entry';
        cancelBtn.hidden = true;
        resetBtn.hidden = false;
        form.reset();
        clearFieldErrors();
        renderTable();
    }

    function simulateServerSave() {
        // ~10% chance of failure, with a small delay to feel like a request
        return new Promise((resolve) => {
            setTimeout(() => {
                if (Math.random() < 0.1) {
                    resolve({ ok: false, error: 'Server is unavailable — please try again.' });
                } else {
                    resolve({ ok: true });
                }
            }, 150);
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const values = readValues();
        const errors = validate(values);

        clearFieldErrors();

        if (Object.keys(errors).length > 0) {
            applyFieldErrors(errors);
            showAlert('danger', 'Validation failed', 'Please fix the errors below.');
            return;
        }

        clearAlert();

        const result = await simulateServerSave();
        if (!result.ok) {
            const verb = editingId ? 'update' : 'save';
            showAlert('danger', `Could not ${verb} entry`, result.error);
            return;
        }

        if (editingId) {
            const idx = entries.findIndex(x => x.id === editingId);
            if (idx >= 0) {
                entries[idx] = {
                    ...entries[idx],
                    first_name: values.first_name,
                    last_name: values.last_name,
                    email: values.email,
                    department: values.department,
                    start_date: values.start_date,
                    bio: values.bio,
                    inserted_at: new Date()
                };
            }
            exitEditMode();
            showAlert('success', 'Updated', 'Entry changes saved.');
        } else {
            entries.unshift({
                id: nextId++,
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                department: values.department,
                start_date: values.start_date,
                bio: values.bio,
                inserted_at: new Date()
            });

            const forcedState = forceErrorsCheckbox.checked;
            form.reset();
            forceErrorsCheckbox.checked = forcedState;
            renderTable();

            showAlert('success', 'Saved', 'Entry added to the list below.');
        }
    });

    form.addEventListener('reset', () => {
        clearFieldErrors();
        clearAlert();
    });

    cancelBtn.addEventListener('click', () => {
        exitEditMode();
        clearAlert();
    });

    tableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-edit]');
        if (editBtn) {
            const id = Number(editBtn.getAttribute('data-edit'));
            const entry = entries.find(x => x.id === id);
            if (entry) enterEditMode(entry);
            return;
        }

        const delBtn = e.target.closest('[data-delete]');
        if (delBtn) {
            const id = Number(delBtn.getAttribute('data-delete'));
            const idx = entries.findIndex(x => x.id === id);
            if (idx < 0) return;

            const [removed] = entries.splice(idx, 1);
            const removedIndex = idx;
            if (editingId === id) exitEditMode();
            renderTable();

            const name = [removed.first_name, removed.last_name].filter(Boolean).join(' ') || 'Entry';
            if (window.PureAdmin && window.PureAdmin.toast) {
                let restored = false;
                window.PureAdmin.toast.show({
                    variant: 'info',
                    title: 'Entry removed',
                    message: `${name} was deleted.`,
                    duration: 6000,
                    actions: [
                        {
                            label: 'Undo',
                            variant: 'secondary',
                            onClick: (toastId) => {
                                if (restored) return;
                                restored = true;
                                entries.splice(Math.min(removedIndex, entries.length), 0, removed);
                                renderTable();
                                window.PureAdmin.toast.dismiss(toastId);
                            }
                        }
                    ]
                });
            }
        }
    });

    clearAllBtn.addEventListener('click', () => {
        if (entries.length === 0) return;
        if (!confirm('Remove all stored submissions?')) return;
        entries.length = 0;
        if (editingId !== null) exitEditMode();
        renderTable();
        showAlert('info', 'Cleared', 'All entries removed.');
    });

    renderTable();
})();
