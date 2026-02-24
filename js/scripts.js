/* ============================================================
   KHAMSONE PORTFOLIO — Main JavaScript
   ============================================================
   All code runs AFTER the DOM is fully loaded.
   This is guaranteed by the 'defer' attribute on the <script>
   tag in index.html, so we don't need window.onload or
   $(document).ready() wrappers.

   STRUCTURE (each section does ONE job):
     1. Navbar  — sticky scroll effect + mobile drawer
     2. Nav     — highlight the active section link
     3. Reveal  — animate elements as they scroll into view
     4. Typing  — rotating text animation in the hero
     5. Stats   — count-up numbers in the About section
     6. Top Btn — show/hide the Back-to-Top button
     7. Filter  — filter project cards by category
     8. Form    — contact form submit feedback
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. NAVBAR — SCROLL EFFECT & MOBILE DRAWER ─────────── */

    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    // All anchor links inside the nav (used to close the mobile drawer)
    const navMenuLinks = document.querySelectorAll('.nav-links a');

    /**
     * addNavScrollClass()
     * Adds .scrolled to the navbar after the user scrolls 50px down.
     * The .scrolled class (in CSS) applies the glassmorphic background
     * and a subtle bottom border so the navbar stands out from the page.
     */
    function addNavScrollClass() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Run once on page load so the correct style is applied immediately
    // (e.g., if the user reloads the page halfway down)
    addNavScrollClass();

    // { passive: true } is a performance hint to the browser:
    // it tells the browser we will NOT call event.preventDefault()
    // inside this listener, so it can handle scrolling without waiting.
    window.addEventListener('scroll', addNavScrollClass, { passive: true });


    /**
     * Mobile Drawer Toggle
     * When the hamburger button is clicked, we toggle:
     *   - .active on the hamburger (animates bars into an ✕)
     *   - .open  on the nav-menu   (slides the drawer from the right)
     *   - body overflow            (prevents background scrolling)
     */
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            // Lock background scroll while the menu is open
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close the mobile drawer when any nav link is clicked
        navMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }


    /* ── 2. ACTIVE NAV LINK — IntersectionObserver ──────────── */

    // Grab every <section> that has an id (About, Skills, Projects …)
    const contentSections = document.querySelectorAll('section[id]');
    // Grab only nav links that start with '#' (internal page anchors)
    const navAnchorLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    /**
     * IntersectionObserver watches a list of elements and fires a
     * callback whenever they enter or leave the viewport.
     *
     * threshold: 0.3  → fire when 30% of the section is visible.
     * rootMargin      → shrink the observation area:
     *   '-80px 0px'  : ignore the top 80px (the navbar height).
     *   '-50% 0px'   : stop observing once the element is past
     *                  the centre of the screen (prevents two sections
     *                  from being "active" at once).
     */
    const activeSectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            // Remove .active from all nav links, then add it to the
            // one whose href matches the section that just became visible.
            navAnchorLinks.forEach(link => {
                const isMatchingSection = link.getAttribute('href') === '#' + entry.target.id;
                link.classList.toggle('active', isMatchingSection);
            });
        });
    }, {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px'
    });

    contentSections.forEach(section => activeSectionObserver.observe(section));


    /* ── 3. SCROLL REVEAL — IntersectionObserver ─────────────── */

    // Select all elements marked for animation
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    /**
     * When a reveal element enters the viewport, we:
     *   1. Add .revealed → triggers the CSS transition (fade + slide in).
     *   2. Unobserve it  → once revealed, we no longer need to watch it.
     *      This is a performance optimisation: it avoids running the
     *      callback on elements that have already animated.
     */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target); // stop watching after reveal
        });
    }, {
        threshold: 0.1,        // fire when 10% of the element is visible
        rootMargin: '0px 0px -40px 0px' // trigger slightly before the bottom edge
    });

    revealElements.forEach(el => revealObserver.observe(el));


    /* ── 4. TYPING EFFECT — TypeWriter class ────────────────── */

    /**
     * TypeWriter
     * Simulates a typing cursor by repeatedly:
     *   a) Adding one character at a time  (typing speed: 100ms/char)
     *   b) Pausing at the full word         (waitTime, default 2000ms)
     *   c) Removing one character at a time (delete speed: 50ms/char)
     *   d) Pausing before the next word     (400ms gap)
     *
     * @param {HTMLElement} element  - The DOM element to type into.
     * @param {string[]}    words    - Array of strings to cycle through.
     * @param {number}      waitTime - How long (ms) to show the full word.
     */
    class TypeWriter {
        constructor(element, words, waitTime = 2000) {
            this.element = element;
            this.words = words;
            this.waitTime = waitTime;
            this.wordIndex = 0;   // which word in the array we're on
            this.text = '';  // current visible text (grows/shrinks)
            this.isDeleting = false;
            this.type(); // kick off the loop
        }

        type() {
            // Wrap around to the first word once we reach the end
            const currentWord = this.words[this.wordIndex % this.words.length];

            // Grow or shrink 'this.text' by one character per call
            if (this.isDeleting) {
                this.text = currentWord.substring(0, this.text.length - 1);
            } else {
                this.text = currentWord.substring(0, this.text.length + 1);
            }

            // Write the current text to the page
            this.element.textContent = this.text;

            // Deleting is faster than typing for a natural feel
            let delay = this.isDeleting ? 50 : 100;

            if (!this.isDeleting && this.text === currentWord) {
                // Finished typing the word → pause, then start deleting
                delay = this.waitTime;
                this.isDeleting = true;
            } else if (this.isDeleting && this.text === '') {
                // Finished deleting → move to next word, add a brief gap
                this.isDeleting = false;
                this.wordIndex++;
                delay = 400;
            }

            // Schedule the next character change
            setTimeout(() => this.type(), delay);
        }
    }

    // Read the list of words from the data-words attribute in the HTML.
    // Storing the data in HTML (not JS) keeps the JS generic and reusable.
    const typedTarget = document.getElementById('typed-text');
    if (typedTarget) {
        const words = JSON.parse(typedTarget.getAttribute('data-words'));
        new TypeWriter(typedTarget, words, 2000);
    }


    /* ── 5. STATS COUNTER — count-up on scroll ───────────────── */

    // Select every stat number that has a data-count target value
    const statElements = document.querySelectorAll('.stat-number[data-count]');

    /**
     * countUp(element)
     * Animates a number from 0 to its target value over 2 seconds.
     * We split the animation into 60 steps (matching a 60fps screen)
     * and use setInterval to update the display each step.
     *
     * @param {HTMLElement} el - The element with data-count and data-suffix.
     */
    function countUp(el) {
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 2000;  // total animation time in ms
        const steps = 60;    // number of updates (≈ 60fps)
        const stepTime = duration / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            // Round to avoid showing decimals mid-animation
            const value = Math.min(Math.round((target / steps) * currentStep), target);
            el.textContent = value + suffix;

            if (currentStep >= steps) {
                // Ensure the final displayed value is exactly the target
                el.textContent = target + suffix;
                clearInterval(timer);
            }
        }, stepTime);
    }

    if (statElements.length > 0) {
        // Only start counting once the stats section scrolls into view.
        // threshold: 0.5 = wait until 50% of the element is visible
        // before triggering, so the user actually sees the animation.
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                countUp(entry.target);
                statsObserver.unobserve(entry.target); // count only once
            });
        }, { threshold: 0.5 });

        statElements.forEach(el => statsObserver.observe(el));
    }


    /* ── 6. BACK-TO-TOP BUTTON ───────────────────────────────── */

    const backToTopBtn = document.querySelector('.back-to-top');

    if (backToTopBtn) {
        // Show the button after scrolling past 500px
        window.addEventListener('scroll', () => {
            // classList.toggle with a boolean second argument:
            //   true  → add the class
            //   false → remove the class
            backToTopBtn.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });
    }


    /* ── 7. PROJECT FILTER ───────────────────────────────────── */

    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card[data-category]');

    /**
     * Each filter button has a data-filter attribute (e.g. "web", "mobile").
     * The special value "all" shows every card.
     * Project cards each have a matching data-category attribute.
     * We add/remove the .hidden class (display:none in CSS) to toggle them.
     */
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Step 1: Deactivate all buttons, activate the clicked one
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedFilter = btn.getAttribute('data-filter');

            // Step 2: Show/hide cards based on the selected filter
            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                // A card is visible if we chose "all" OR its category matches
                const shouldShow = selectedFilter === 'all' || cardCategory === selectedFilter;
                card.classList.toggle('hidden', !shouldShow);
            });
        });
    });


    /* ── 8. CONTACT FORM — submit feedback ───────────────────── */

    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            // Prevent the default browser action (page reload / GET request)
            event.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalLabel = submitBtn.innerHTML;

            // Visual success state
            submitBtn.innerHTML = 'Sent! ✓';
            submitBtn.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
            submitBtn.disabled = true; // prevent double-submit

            // Reset after 2.5 seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalLabel;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                contactForm.reset();
            }, 2500);
        });
    }

}); // end DOMContentLoaded