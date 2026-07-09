/**
 * IN-02 DEMS — Shared Components
 *
 * Injects the site header (skip link + alert bar + nav) and footer into every page.
 * Each page marks its active nav link via:  <div id="site-header" data-page="rudy|party|platform|action|events">
 *
 * Also initialises the mobile nav toggle and the modal (if present).
 * Any element with class "js-modal-open" will open the Action Network modal.
 *
 * NOTE: This script must be loaded at the bottom of <body> (no defer/async needed).
 * The DOM is fully parsed by the time a bottom-of-body script runs, so we skip
 * DOMContentLoaded entirely — that removes one event-loop tick of lag.
 * Adding comment
 */

(function () {
    // ── Google Analytics 4 ───────────────────────────────────────
    // Replace the ID below with your Measurement ID from:
    // analytics.google.com → Admin → Data Streams → your stream → Measurement ID
    const GA_ID = 'G-3CD8CKKJ78';
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(gaScript);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    // ─────────────────────────────────────────────────────────────

    const ACTBLUE_URL =
        'https://secure.actblue.com/donate/2nd-congressional-district-democrat-committee-1';

    const NAV_ITEMS = [
        { id: 'rudy',     href: 'rudy-facts.html',  label: "Rudy's Record" },
        { id: 'party',    href: 'our-party.html',    label: 'Our Party'     },
        { id: 'platform', href: 'platform.html',     label: 'Platform'      },
        { id: 'events',   href: 'events.html',        label: 'News & Events' },
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
        <button class="footer-link-btn" id="privacy-policy-link">Privacy Policy</button>
        <a href="#">Contact</a>
    </div>
</footer>
<div id="privacyModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
    <div class="modal-content privacy-modal-content">
        <button class="close-btn" aria-label="Close">&times;</button>
        <h2 id="privacy-modal-title">Privacy Policy</h2>
        <p class="privacy-effective">Effective Date: January 1, 2026</p>

        <div class="privacy-body">
            <p>The Indiana 2nd Congressional District Democratic Committee ("IN-02 Democrats," "we," "us," or "our") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding that information.</p>

            <h3>1. Information We Collect</h3>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
                <li><strong>Contact information</strong> — name, email address, phone number, and mailing address when you sign up, volunteer, donate, or submit an event.</li>
                <li><strong>Event submissions</strong> — event details and organizer contact information submitted through our events form.</li>
                <li><strong>Donation information</strong> — processed securely through ActBlue. We do not store payment card information on our servers.</li>
            </ul>
            <p>We may also collect limited technical information automatically, such as your browser type, IP address, and pages visited, through standard web server logs.</p>

            <h3>2. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul>
                <li>Send you updates, event announcements, and organizing information</li>
                <li>Coordinate volunteer activities and respond to your requests</li>
                <li>Review and publish community event submissions</li>
                <li>Comply with federal and state campaign finance disclosure requirements</li>
                <li>Improve our website and communications</li>
            </ul>

            <h3>3. Sharing Your Information</h3>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
            <ul>
                <li><strong>The Indiana Democratic Party</strong> and affiliated Democratic organizations for organizing and electoral purposes</li>
                <li><strong>Service providers</strong> (such as Action Network and ActBlue) who help us operate our website and process donations — these providers are bound by their own privacy policies</li>
                <li><strong>Legal authorities</strong> when required by law or campaign finance regulations</li>
            </ul>

            <h3>4. Third-Party Services</h3>
            <p>This website uses the following third-party services, each with their own privacy practices:</p>
            <ul>
                <li><strong>Action Network</strong> — volunteer and supporter signup forms</li>
                <li><strong>ActBlue</strong> — secure online donation processing</li>
                <li><strong>Amazon Web Services (AWS)</strong> — website hosting and event data storage</li>
                <li><strong>Google Fonts</strong> — typeface delivery</li>
            </ul>

            <h3>5. Cookies</h3>
            <p>Our website may use cookies and similar technologies to improve your browsing experience and analyze site traffic. You can control cookies through your browser settings. Disabling cookies will not prevent you from using our site.</p>

            <h3>6. Data Security</h3>
            <p>We implement reasonable technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>

            <h3>7. Your Rights</h3>
            <p>You may request to access, correct, or delete your personal information at any time by contacting us. To unsubscribe from our communications, use the unsubscribe link in any email we send you.</p>

            <h3>8. Changes to This Policy</h3>
            <p>We may update this privacy policy from time to time. We will post any changes on this page with an updated effective date.</p>

            <h3>9. Contact Us</h3>
            <p>If you have questions about this privacy policy or our data practices, please contact us at:<br>
            <strong>Indiana 2nd Congressional District Democratic Committee</strong><br>
            Indiana, United States</p>
        </div>
    </div>
</div>`;
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

    function initPrivacyModal() {
        const modal    = document.getElementById('privacyModal');
        const openBtn  = document.getElementById('privacy-policy-link');
        const closeBtn = modal?.querySelector('.close-btn');
        if (!modal || !openBtn) return;

        openBtn.addEventListener('click', () => { modal.style.display = 'block'; });
        closeBtn?.addEventListener('click', () => { modal.style.display = 'none'; });
        window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.style.display = 'none'; });
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
        initPrivacyModal();
    }

    initModal();

    // Inject analytics tracking (after all components are rendered)
    const analyticsScript = document.createElement('script');
    analyticsScript.src = 'js/analytics.js';
    document.body.appendChild(analyticsScript);

})();
