/**
 * IN-02 DEMS — Events Module
 *
 * Fetches approved events from the API and renders event cards.
 * Also handles the "Submit an Event" collapsible form.
 *
 * AFTER DEPLOYMENT: replace the placeholder below with the ApiUrl
 * from CloudFormation outputs (sam deploy → Outputs → ApiUrl).
 */

// ─── UPDATE THIS AFTER RUNNING: sam deploy ──────────────────────────────────
const API_BASE = 'https://4ayg0m2fe8.execute-api.us-east-1.amazonaws.com/prod';
// ────────────────────────────────────────────────────────────────────────────

// ------------------------------------------------------------------
// Formatting helpers
// ------------------------------------------------------------------

function formatEventDate(dateStr, timeStr) {
    // dateStr: YYYY-MM-DD  timeStr: HH:MM
    // Append T + time so the Date is parsed as local, not UTC midnight
    const dt = new Date(`${dateStr}T${timeStr}`);
    const datePart = dt.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const timePart = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${datePart} at ${timePart}`;
}

function monthAbbr(dateStr) {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

function dayNum(dateStr) {
    return new Date(`${dateStr}T12:00:00`).getDate();
}

function escapeHtml(str) {
    return (str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ------------------------------------------------------------------
// Render events list
// ------------------------------------------------------------------

function buildEventCard(e) {
    return `
    <article class="event-card">
        <div class="event-date-badge" aria-hidden="true">
            <span class="event-month">${monthAbbr(e.date)}</span>
            <span class="event-day">${dayNum(e.date)}</span>
        </div>
        <div class="event-body">
            <h3 class="event-title">${escapeHtml(e.title)}</h3>
            <p class="event-meta">
                <time datetime="${e.date}T${e.time}">${formatEventDate(e.date, e.time)}</time>
                &bull; ${escapeHtml(e.location)}
            </p>
            ${e.address ? `<p class="event-address">${escapeHtml(e.address)}</p>` : ''}
            ${e.description ? `<p class="event-description">${escapeHtml(e.description)}</p>` : ''}
            <p class="event-organizer">Organized by ${escapeHtml(e.organizer)}</p>
            ${e.rsvpLink ? `<a href="${escapeHtml(e.rsvpLink)}" target="_blank" rel="noopener" class="btn btn-red event-rsvp">RSVP &rarr;</a>` : ''}
        </div>
    </article>`;
}

async function loadEvents() {
    const container = document.getElementById('events-list');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/events`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const events = await res.json();

        if (!events.length) {
            container.innerHTML = '<p class="events-empty">No upcoming events scheduled. Check back soon or sign up below for alerts.</p>';
        } else {
            container.innerHTML = events.map(buildEventCard).join('');
        }
    } catch (err) {
        console.error('events load error:', err);
        container.innerHTML = '<p class="events-empty">Unable to load events right now. Please try again later.</p>';
    }
}

// ------------------------------------------------------------------
// Submit form
// ------------------------------------------------------------------

function initSubmitForm() {
    const openBtn  = document.getElementById('open-submit-modal');
    const modal    = document.getElementById('submitEventModal');
    const closeBtn = modal?.querySelector('.close-btn');
    const form     = document.getElementById('event-submit-form');
    const status   = document.getElementById('submit-status');

    if (!openBtn || !modal || !form) return;

    function openModal() {
        modal.style.display = 'block';
        form.querySelector('input, textarea')?.focus();
    }

    function closeModal() {
        modal.style.display = 'none';
        if (status) { status.textContent = ''; status.className = 'submit-status'; }
    }

    openBtn.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    window.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';
        if (status) { status.textContent = ''; status.className = 'submit-status'; }

        const body = {
            title:        form.elements.title.value.trim(),
            description:  form.elements.description.value.trim(),
            date:         form.elements.date.value,
            time:         form.elements.time.value,
            location:     form.elements.location.value.trim(),
            address:      form.elements.address.value.trim(),
            organizer:    form.elements.organizer.value.trim(),
            contactEmail: form.elements.contactEmail.value.trim(),
            rsvpLink:     form.elements.rsvpLink.value.trim(),
        };

        try {
            const res  = await fetch(`${API_BASE}/events`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');

            if (status) {
                status.textContent = '✓ ' + data.message;
                status.className = 'submit-status success';
            }
            form.reset();
            setTimeout(closeModal, 2500);
        } catch (err) {
            if (status) {
                status.textContent = '✗ ' + err.message;
                status.className = 'submit-status error';
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Event';
        }
    });
}

// ------------------------------------------------------------------
// News list
// ------------------------------------------------------------------

function formatNewsDate(dateStr) {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    });
}

function buildNewsCard(n) {
    return `
    <article class="news-card">
        <div class="news-card-body">
            <span class="news-category">${escapeHtml(n.category)}</span>
            <h3 class="news-headline">
                <a href="${escapeHtml(n.url)}" target="_blank" rel="noopener">${escapeHtml(n.title)}</a>
            </h3>
            <p class="news-meta">
                <span class="news-source">${escapeHtml(n.source)}</span>
                &middot;
                <time datetime="${escapeHtml(n.publishedDate)}">${formatNewsDate(n.publishedDate)}</time>
            </p>
            <p class="news-excerpt">${escapeHtml(n.excerpt)}</p>
        </div>
        <a href="${escapeHtml(n.url)}" target="_blank" rel="noopener" class="news-read-more">Read Full Story →</a>
    </article>`;
}

async function loadNews() {
    const container = document.getElementById('news-list');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/news`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const items = await res.json();

        if (!items.length) {
            container.innerHTML = '<p class="events-empty" style="grid-column:1/-1">No news stories available. Check back soon.</p>';
        } else {
            container.innerHTML = items.map(buildNewsCard).join('');
        }
    } catch (err) {
        console.error('news load error:', err);
        container.innerHTML = '<p class="events-empty" style="grid-column:1/-1">Unable to load news right now. Please try again later.</p>';
    }
}

// ------------------------------------------------------------------
// Boot — runs after DOM is ready (script loaded at bottom of <body>)
// ------------------------------------------------------------------

loadEvents();
loadNews();
initSubmitForm();
