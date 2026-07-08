/**
 * IN-02 DEMS — Shared Components
 *
 * Injects the site header (nav) and footer into every page.
 * Each page marks its active nav link via:  <div id="site-header" data-page="rudy|party|action">
 *
 * Also initialises the mobile nav toggle and the modal (if present).
 */

(function () {
    const ACTBLUE_URL =
        'https://secure.actblue.com/donate/2nd-congressional-district-democrat-committee-1';

    const NAV_ITEMS = [
        { id: 'rudy',   href: 'rudy-facts.html',  label: "Rudy's Record" },
        { id: 'party',  href: 'our-party.html',    label: 'Our Party'     },
        { id: 'action', href: 'index.html#action', label: 'Take Action'   },
    ];

    // ------------------------------------------------------------------
    // Build HTML strings
    // ------------------------------------------------------------------

    function buildHeader(activePage) {
        const links = NAV_ITEMS.map(({ id, href, label }) =>
            `<a href="${href}" class="nav-item${activePage === id ? ' active' : ''}">${label}</a>`
        ).join('\n                ');

        return `<header>
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
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        // Close mobile menu when any link is tapped
        menu.querySelectorAll('a').forEach(link =>
            link.addEventListener('click', () => {
                menu.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            })
        );
    }

    function initModal() {
        const modal    = document.getElementById('actionModal');
        if (!modal) return;

        const openBtn  = document.getElementById('openModalBtn');
        const closeBtn = modal.querySelector('.close-btn');

        openBtn?.addEventListener('click',  () => { modal.style.display = 'block'; });
        closeBtn?.addEventListener('click', () => { modal.style.display = 'none'; });

        // Click outside modal content to close
        window.addEventListener('click', e => {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Escape key to close
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') modal.style.display = 'none';
        });
    }

    function replaceElement(el, html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        el.replaceWith(tmp.firstElementChild);
    }

    // ------------------------------------------------------------------
    // Boot on DOMContentLoaded
    // ------------------------------------------------------------------

    document.addEventListener('DOMContentLoaded', () => {
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
    });
})();
