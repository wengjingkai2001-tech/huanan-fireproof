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

/* ===== Certificate image lightbox ===== */
(function() {
  function getCaption(link) {
    var lang = (document.documentElement.lang || 'zh').toLowerCase();
    var key = 'data-caption-' + lang;
    // Fall back chain: lang -> zh -> empty
    return link.getAttribute(key) || link.getAttribute('data-caption-zh') || '';
  }
  // Build the lightbox element once
  var lb = document.createElement('div');
  lb.className = 'img-lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<div class="img-lightbox__inner">' +
                   '<button type="button" class="img-lightbox__close" aria-label="Close">&times;</button>' +
                   '<img class="img-lightbox__img" alt="">' +
                 '</div>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('.img-lightbox__img');
  var lbClose = lb.querySelector('.img-lightbox__close');

  function openLb(src, caption) {
    lbImg.src = src;
    lbImg.alt = caption || '';
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', function(e) {
    if (e.target === lb) closeLb();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb();
  });

  // Wire up all cert thumbnails
  function bind() {
    document.querySelectorAll('.js-cert').forEach(function(link) {
      if (link._certBound) return;
      link._certBound = true;
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var src = link.getAttribute('href');
        openLb(src, getCaption(link));
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
  // Re-bind after i18n language change in case DOM is replaced
  if (window.i18n && typeof window.i18n.onChange === 'function') {
    window.i18n.onChange(bind);
  } else {
    document.addEventListener('i18n:change', bind);
  }
})();


/* ===== Project media modal (�����˵�) ===== */
(function() {
  // Media data per project id
  // 'i' = image, 'v' = video; auto-derives urls in the standard order
  var PROJECTS = {
    'dongguan-huayangnian': { kind: 'videos-first', items: [
      { type: 'video', src: 'images/projects/dongguan-huayangnian/vid-01.mp4', thumb: 'images/projects/dongguan-huayangnian/thumb-01.jpg', name: 'vid-01' },
      { type: 'video', src: 'images/projects/dongguan-huayangnian/vid-02.mp4', thumb: 'images/projects/dongguan-huayangnian/thumb-02.jpg', name: 'vid-02' },
      { type: 'video', src: 'images/projects/dongguan-huayangnian/vid-03.mp4', thumb: 'images/projects/dongguan-huayangnian/thumb-03.jpg', name: 'vid-03' },
      { type: 'video', src: 'images/projects/dongguan-huayangnian/vid-04.mp4', thumb: 'images/projects/dongguan-huayangnian/thumb-04.jpg', name: 'vid-04' },
      { type: 'video', src: 'images/projects/dongguan-huayangnian/vid-05.mp4', thumb: 'images/projects/dongguan-huayangnian/thumb-05.jpg', name: 'vid-05' },
      { type: 'video', src: 'images/projects/dongguan-huayangnian/vid-06.mp4', thumb: 'images/projects/dongguan-huayangnian/thumb-06.jpg', name: 'vid-06' },
      { type: 'image', src: 'images/projects/dongguan-huayangnian/img-01.jpg', thumb: 'images/projects/dongguan-huayangnian/img-01.jpg', name: 'img-01' }
    ]},
    'foshan-mingdecheng': { kind: 'videos', items: [
      { type: 'video', src: 'images/projects/foshan-mingdecheng/vid-01.mp4', thumb: 'images/projects/foshan-mingdecheng/thumb-01.jpg', name: 'vid-01' },
      { type: 'video', src: 'images/projects/foshan-mingdecheng/vid-02.mp4', thumb: 'images/projects/foshan-mingdecheng/thumb-02.jpg', name: 'vid-02' },
      { type: 'video', src: 'images/projects/foshan-mingdecheng/vid-03.mp4', thumb: 'images/projects/foshan-mingdecheng/thumb-03.jpg', name: 'vid-03' },
      { type: 'video', src: 'images/projects/foshan-mingdecheng/vid-04.mp4', thumb: 'images/projects/foshan-mingdecheng/thumb-04.jpg', name: 'vid-04' },
      { type: 'video', src: 'images/projects/foshan-mingdecheng/vid-05.mp4', thumb: 'images/projects/foshan-mingdecheng/thumb-05.jpg', name: 'vid-05' }
    ]},
    'huanyu-tianxia': { kind: 'images', count: 12, prefix: 'images/projects/huanyu-tianxia/img-', ext: 'jpg' },
    'jinke-boyue':       { kind: 'images', count: 9,  prefix: 'images/projects/jinke-boyue/img-',       ext: 'jpg' },
    'jinke-cheng':       { kind: 'images', count: 12, prefix: 'images/projects/jinke-cheng/img-',       ext: 'jpg' },
    'nantian-mingyuan':  { kind: 'images', count: 8,  prefix: 'images/projects/nantian-mingyuan/img-',  ext: 'jpg' }
  };

  function expandItems(spec) {
    if (spec.items) return spec.items;
    var out = [];
    for (var i = 1; i <= spec.count; i++) {
      var name = (i < 10 ? '0' : '') + i;
      var src = spec.prefix + name + '.' + spec.ext;
      out.push({ type: 'image', src: src, thumb: src, name: 'img-' + name });
    }
    return out;
  }

  // Build modal element
  var modal = document.createElement('div');
  modal.className = 'proj-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  document.body.appendChild(modal);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function openModal(projectId) {
    var spec = PROJECTS[projectId];
    if (!spec) return;
    var items = expandItems(spec);
    var title = (function() {
      var card = document.querySelector('.js-project[data-project-id="' + projectId + '"]');
      return card ? (card.querySelector('h4') ? card.querySelector('h4').textContent : projectId) : projectId;
    })();
    var html = '<div class="proj-modal__header">' +
                 '<div><span class="proj-modal__title">' + escapeHtml(title) + '</span>' +
                   '<span class="proj-modal__count">' + items.length + '</span></div>' +
                 '<button type="button" class="proj-modal__close" aria-label="Close">��</button>' +
               '</div>' +
               '<div class="proj-modal__body">' +
                 '<div class="proj-modal__grid">' +
                   items.map(function(it) {
                     if (it.type === 'video') {
                       return '<div class="proj-media js-proj-media" data-type="video" data-src="' + escapeHtml(it.src) + '" data-thumb="' + escapeHtml(it.thumb) + '">' +
                                '<img src="' + escapeHtml(it.thumb) + '" alt="' + escapeHtml(it.name) + '" loading="lazy">' +
                                '<span class="proj-media__play">?</span>' +
                              '</div>';
                     }
                     return '<div class="proj-media js-proj-media" data-type="image" data-src="' + escapeHtml(it.src) + '">' +
                              '<img src="' + escapeHtml(it.thumb) + '" alt="' + escapeHtml(it.name) + '" loading="lazy">' +
                            '</div>';
                   }).join('') +
                 '</div>' +
               '</div>';
    modal.innerHTML = html;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    // Close on backdrop click
    modal.addEventListener('click', backdropClose);
    modal.querySelector('.proj-modal__close').addEventListener('click', closeModal);
  }

  function backdropClose(e) {
    if (e.target === modal) closeModal();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    // Pause any playing videos
    modal.querySelectorAll('video').forEach(function(v) { try { v.pause(); } catch (_) {} });
  }

  // Delegate click on .js-proj-media
  modal.addEventListener('click', function(e) {
    var el = e.target.closest('.js-proj-media');
    if (!el) return;
    var type = el.getAttribute('data-type');
    var src = el.getAttribute('data-src');
    if (type === 'video') {
      // Reuse existing video lightbox
      var videoLb = document.getElementById('video-lightbox');
      var videoEl = document.getElementById('video-lightbox-video');
      var nameEl = document.getElementById('video-lightbox-name');
      if (videoLb && videoEl) {
        videoEl.src = src;
        if (nameEl) nameEl.textContent = '';
        videoLb.hidden = false;
        requestAnimationFrame(function() { videoLb.classList.add('is-open'); });
        try { videoEl.play(); } catch (_) {}
      }
    } else {
      // Reuse existing img lightbox (img-lightbox from certificates)
      var imgLb = document.querySelector('.img-lightbox');
      var imgEl = imgLb ? imgLb.querySelector('.img-lightbox__img') : null;
      if (imgLb && imgEl) {
        imgEl.src = src;
        imgEl.alt = el.querySelector('img') ? el.querySelector('img').alt : '';
        imgLb.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }
    }
  });

  // Esc closes proj-modal first, then lets lightbox handlers take over
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // Wire up project cards
  function bind() {
    document.querySelectorAll('.js-project').forEach(function(card) {
      if (card._projBound) return;
      card._projBound = true;
      card.addEventListener('click', function() {
        openModal(card.getAttribute('data-project-id'));
      });
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(card.getAttribute('data-project-id'));
        }
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
  document.addEventListener('i18n:change', bind);
})();
