/**
 * IN-02 DEMS — Shared Components
 *
 * Injects the site header (skip link + alert bar + nav) and footer into every page.
 * Each page marks its active nav link via:  <div id="site-header" data-page="rudy|party|action|events">
 *
 * Also initialises the mobile nav toggle and the modal (if present).
 * Any element with class "js-modal-open" will open the Action Network modal.
 *
 * NOTE: This script must be loaded at the bottom of <body> (no defer/async needed).
 * The DOM is fully parsed by the time a bottom-of-body script runs, so we skip
 * DOMContentLoaded entirely — that removes one event-loop tick of lag.
 */

(function () {
    const ACTBLUE_URL =
        'https://secure.actblue.com/donate/2nd-congressional-district-democrat-committee-1';

    const NAV_ITEMS = [
        { id: 'rudy',   href: 'rudy-facts.html',  label: "Rudy's Record" },
        { id: 'party',  href: 'our-party.html',    label: 'Our Party'     },
        { id: 'action', href: 'index.html#action', label: 'Take Action'   },
        { id: 'events', href: 'index.html#events', label: 'Events'        },
    ];

    // ------------------------------------------------------------------
    // Build HTML strings
    // ------------------------------------------------------------------

    function buildHeader(activePage) {
        const links = NAV_ITEMS.map(({ id, href, label }) =>
            `<a href="${href}" class="nav-item${activePage === id ? ' active' : ''}">${label}</a>`
        ).join('\n            ');

        return `<a class="skip-link" href="#main-content">Skip to main content</a>
<div class="top-bar">Chip in $25 to help elect Indiana 2nd District Democrats</div>
<header>
    <div class="nav-container">
        <div class="logo">
            <a href="index.html"><h2>IN-02 <span>DEMS</span></h2></a>
        </div>
        <nav class="nav-links" id="nav-menu">
            ${links}
            <a href="${ACTBLUE_URL}" target="_blank" class="btn btn-yellow">Donate</a>
        </nav>
        <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
    </div>
</header>`;
    }

    function buildFooter() {
        return `<footer>
    <div class="disclaimer">
        Paid for by the Indiana 2nd Congressional District Democrats.<br>
        Not authorized by any candidate or candidate's committee.
    </div>
    <div class="footer-links">
        <a href="index.html">Home</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Contact</a>
    </div>
</footer>`;
    }

    // ------------------------------------------------------------------
    // Initialise components
    // ------------------------------------------------------------------

    function initMobileNav() {
        const toggle = document.getElementById('nav-toggle');
        const menu   = document.getElementById('nav-menu');
        if (!toggle || !menu) return;

        toggle.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('open');
            toggle.classList.toggle('open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        menu.querySelectorAll('a').forEach(link =>
            link.addEventListener('click', () => {
                menu.classList.remove('open');
                toggle.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            })
        );
    }

    function initModal() {
        const modal = document.getElementById('actionModal');
        if (!modal) return;

        const closeBtn = modal.querySelector('.close-btn');
        let formLoaded = false;

        function loadActionNetworkForm() {
            if (formLoaded) return;
            formLoaded = true;

            // Lazy-load the Action Network stylesheet and widget script
            // only when the user first opens the modal — keeps initial page
            // load free of third-party requests until they're actually needed.
            const link = document.createElement('link');
            link.rel  = 'stylesheet';
            link.href = 'https://actionnetwork.org/css/style-embed-whitelabel-v3.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://actionnetwork.org/widgets/v6/form/join-the-movement-162?format=js&source=widget&style=full';
            document.body.appendChild(script);
        }

        document.querySelectorAll('.js-modal-open').forEach(btn =>
            btn.addEventListener('click', () => {
                loadActionNetworkForm();
                modal.style.display = 'block';
            })
        );

        closeBtn?.addEventListener('click', () => { modal.style.display = 'none'; });

        window.addEventListener('click', e => {
            if (e.target === modal) modal.style.display = 'none';
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') modal.style.display = 'none';
        });
    }

    // Replaces a placeholder element with one or more injected elements
    function replaceElement(el, html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        el.replaceWith(...tmp.children);
    }

    // ------------------------------------------------------------------
    // Execute immediately — DOM is ready because this script is loaded
    // at the bottom of <body>, not in <head>
    // ------------------------------------------------------------------

    const headerPlaceholder = document.getElementById('site-header');
    const footerPlaceholder = document.getElementById('site-footer');

    if (headerPlaceholder) {
        const activePage = headerPlaceholder.dataset.page || '';
        replaceElement(headerPlaceholder, buildHeader(activePage));
        initMobileNav();
    }

    if (footerPlaceholder) {
        replaceElement(footerPlaceholder, buildFooter());
    }

    initModal();

})();
