/**
 * IN-02 DEMS — Custom Analytics
 *
 * Fires GA4 custom events for meaningful user interactions.
 * GA4 is initialized in components.js — this file only fires events.
 *
 * Event reference:
 *   donate_click          — any ActBlue donation link (includes amount)
 *   register_to_vote      — Register to Vote button
 *   volunteer_modal_open  — Join the Movement / Sign Up modal trigger
 *   submit_event_modal    — Submit an Event button
 *   event_rsvp_click      — RSVP link on an event card
 *   event_form_submit     — Event submission form sent
 *   news_click            — News story Read Full Story / headline click
 *   county_card_click     — Our Party county card opened
 *   accordion_open        — Platform page accordion expanded
 *   nav_click             — Navigation link used
 *   support_jamee_click   — Jamee Decio for Congress link
 *   external_party_click  — Goshen Dems or other county party links
 */

function gaEvent(name, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', name, params || {});
}

// ── Click event delegation ────────────────────────────────────────
// Using a single delegated listener keeps this lightweight and handles
// elements injected after page load (event cards, news cards, nav).

document.addEventListener('click', function (e) {

    // Donate (ActBlue links — capture amount from URL when present)
    const donateLink = e.target.closest('a[href*="actblue.com"]');
    if (donateLink) {
        let amount = 'custom';
        try { amount = new URL(donateLink.href).searchParams.get('amount') || 'custom'; } catch (_) {}
        gaEvent('donate_click', { donate_amount: amount, page: location.pathname });
        return;
    }

    // Register to Vote
    if (e.target.closest('a[href*="indianavoters.in.gov"]')) {
        gaEvent('register_to_vote', { page: location.pathname });
        return;
    }

    // Support Jamee Decio
    if (e.target.closest('a[href*="decioforcongress.com"]')) {
        gaEvent('support_jamee_click', {});
        return;
    }

    // Volunteer / Action Network modal trigger
    if (e.target.closest('.js-modal-open')) {
        gaEvent('volunteer_modal_open', { page: location.pathname });
        return;
    }

    // Submit an Event modal
    if (e.target.matches('#open-submit-modal')) {
        gaEvent('submit_event_modal', {});
        return;
    }

    // County card (Our Party page)
    const countyCard = e.target.closest('.county-card');
    if (countyCard) {
        const county = countyCard.dataset.county
            || countyCard.querySelector('h3')?.textContent?.trim()
            || 'Unknown';
        gaEvent('county_card_click', { county_name: county });
        return;
    }

    // News story click
    const newsLink = e.target.closest('.news-read-more, .news-headline a');
    if (newsLink) {
        const card = newsLink.closest('.news-card');
        gaEvent('news_click', {
            story_title:  (card?.querySelector('.news-headline')?.textContent?.trim() || '').slice(0, 100),
            story_source: card?.querySelector('.news-source')?.textContent?.trim() || '',
        });
        return;
    }

    // Event RSVP link
    if (e.target.closest('.event-rsvp')) {
        const card = e.target.closest('.event-card');
        gaEvent('event_rsvp_click', {
            event_title: (card?.querySelector('.event-title')?.textContent?.trim() || '').slice(0, 100),
        });
        return;
    }

    // Navigation link
    const navItem = e.target.closest('.nav-item');
    if (navItem) {
        gaEvent('nav_click', { nav_item: navItem.textContent.trim() });
        return;
    }

    // External county party sites (Goshen Dems, etc.)
    const externalParty = e.target.closest('a.county-card[href]');
    if (externalParty) {
        let destination = 'unknown';
        try { destination = new URL(externalParty.href).hostname; } catch (_) {}
        gaEvent('external_party_click', { destination });
        return;
    }

});

// ── Platform accordion tracking ───────────────────────────────────
// <details>/<summary> elements fire a native "toggle" event.

document.querySelectorAll('details').forEach(function (details) {
    details.addEventListener('toggle', function () {
        if (details.open) {
            const title = details.querySelector('summary')?.textContent?.trim() || '';
            gaEvent('accordion_open', { accordion_title: title.slice(0, 100) });
        }
    });
});

// ── Event form submission tracking ───────────────────────────────

document.addEventListener('submit', function (e) {
    if (e.target.id === 'event-submit-form') {
        gaEvent('event_form_submit', { page: location.pathname });
    }
});
