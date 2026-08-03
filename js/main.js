// ===== Mobile Hamburger =====
const hamburger = document.getElementById('hamburger');
const nav = document.querySelector('.nav');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('open');
    });
});

// ===== Header Scroll =====
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Active Nav Link =====
const sections = document.querySelectorAll('.section, .hero');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + entry.target.id) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// ===== Counter Animation =====
const counters = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'));
            const duration = 2000;
            const start = performance.now();

            function update(timestamp) {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.floor(eased * target);
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target + '+';
                }
            }

            requestAnimationFrame(update);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => counterObserver.observe(counter));

// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll('.section');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => {
    el.classList.add('fade-in');
    revealObserver.observe(el);
});

// ===== Contact Form (AJAX via Formspree) =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const status = document.getElementById('formStatus');
        const originalText = btn.textContent;

        btn.textContent = '提交中...';
        btn.disabled = true;
        if (status) { status.className = 'form-status'; status.textContent = ''; }

        try {
            const formData = new FormData(contactForm);
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                if (status) {
                    status.className = 'form-status form-success';
                    status.textContent = '✓ 提交成功，我们会尽快联系您！';
                }
                contactForm.reset();
            } else {
                let errMsg = '提交失败';
                try { const data = await response.json(); errMsg = data.error || errMsg; } catch (_) {}
                throw new Error(errMsg);
            }
        } catch (err) {
            if (status) {
                status.className = 'form-status form-error';
                status.textContent = '✗ ' + (err.message || '网络错误，请稍后重试');
            }
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

// ===== Lightbox =====
let lightboxItems = [];

function openLightbox(el) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');

    // Collect all cap-items
    const allItems = document.querySelectorAll('.cap-item');
    lightboxItems = Array.from(allItems);

    // Find index
    const idx = lightboxItems.indexOf(el);

    // Set image
    const clickedImg = el.querySelector('img');
    img.src = clickedImg.src;
    caption.textContent = el.querySelector('.cap-overlay span').textContent;

    // Store current index
    lightbox.dataset.index = idx;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
}

function nextImage() {
    const lightbox = document.getElementById('lightbox');
    let idx = parseInt(lightbox.dataset.index);
    idx = (idx + 1) % lightboxItems.length;
    updateLightbox(lightbox, idx);
}

function prevImage() {
    const lightbox = document.getElementById('lightbox');
    let idx = parseInt(lightbox.dataset.index);
    idx = (idx - 1 + lightboxItems.length) % lightboxItems.length;
    updateLightbox(lightbox, idx);
}

function updateLightbox(lightbox, idx) {
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    const item = lightboxItems[idx];
    const clickedImg = item.querySelector('img');
    img.src = clickedImg.src;
    caption.textContent = item.querySelector('.cap-overlay span').textContent;
    lightbox.dataset.index = idx;
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
});

// ===== Construction Video Lightbox (project-cases) =====
(function() {
    const lightbox = document.getElementById('video-lightbox');
    const video    = document.getElementById('video-lightbox-video');
    const nameEl   = document.getElementById('video-lightbox-name');
    const btnClose = document.getElementById('video-lightbox-close');
    if (!lightbox || !video) return;

    function open(src, title) {
        video.src = src;
        if (nameEl && title) nameEl.textContent = title;
        lightbox.hidden = false;
        requestAnimationFrame(() => lightbox.classList.add('is-open'));
        // best-effort play (autoplay may be blocked until user gesture, but click counts)
        try { video.play(); } catch (_) {}
    }
    function close() {
        lightbox.classList.remove('is-open');
        try { video.pause(); } catch (_) {}
        setTimeout(() => {
            lightbox.hidden = true;
            video.removeAttribute('src');
            video.load();
        }, 200);
    }

    document.querySelectorAll('.video-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const src   = btn.getAttribute('data-video-src');
            const cap   = btn.querySelector('.video-card__caption strong');
            const title = cap ? cap.textContent.trim() : '';
            if (src) open(src, title);
        });
    });
    if (btnClose) btnClose.addEventListener('click', close);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !lightbox.hidden) close();
    });
})();
