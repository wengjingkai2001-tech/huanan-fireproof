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

    // Collect all lightbox items (capability images + product images)
    const allItems = document.querySelectorAll('.cap-item, .product-img-wrap');
    lightboxItems = Array.from(allItems);

    // Find index
    const idx = lightboxItems.indexOf(el);

    // Set image
    const clickedImg = el.querySelector('img');
    img.src = clickedImg.src;
    const capSpan = el.querySelector('.cap-overlay span');
    caption.textContent = capSpan ? capSpan.textContent : (clickedImg.alt || '');

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
    const capSpan = item.querySelector('.cap-overlay span');
    caption.textContent = capSpan ? capSpan.textContent : (clickedImg.alt || '');
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
                   '<button type="button" class="img-lightbox__nav img-lightbox__prev" aria-label="Previous">&#10094;</button>' +
                   '<img class="img-lightbox__img" alt="">' +
                   '<button type="button" class="img-lightbox__nav img-lightbox__next" aria-label="Next">&#10095;</button>' +
                 '</div>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('.img-lightbox__img');
  var lbClose = lb.querySelector('.img-lightbox__close');
  var lbPrev = lb.querySelector('.img-lightbox__prev');
  var lbNext = lb.querySelector('.img-lightbox__next');
  var lbItems = [];
  var lbIndex = 0;

  function showLbItem() {
    if (!lbItems.length) return;
    var it = lbItems[lbIndex];
    lbImg.src = it.src;
    lbImg.alt = it.caption || '';
    lbPrev.style.display = lbItems.length > 1 ? '' : 'none';
    lbNext.style.display = lbItems.length > 1 ? '' : 'none';
  }
  function openLb(items, index) {
    lbItems = items || [];
    lbIndex = Math.max(0, Math.min(index || 0, lbItems.length - 1));
    showLbItem();
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  // 暴露给其他模块（项目弹窗）
  window.openLb = openLb;
  window.closeLb = closeLb;
  function closeLb() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  lbPrev.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!lbItems.length) return;
    lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length;
    showLbItem();
  });
  lbNext.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!lbItems.length) return;
    lbIndex = (lbIndex + 1) % lbItems.length;
    showLbItem();
  });
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', function(e) {
    if (e.target === lb) closeLb();
  });
  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') lbNext.click();
    if (e.key === 'ArrowLeft') lbPrev.click();
  });

  // Wire up all cert thumbnails
  function bind() {
    document.querySelectorAll('.js-cert').forEach(function(link) {
      if (link._certBound) return;
      link._certBound = true;
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var src = link.getAttribute('href');
        // 收集同组证书图，支持多图导航
        var group = link.getAttribute('data-group');
        var all = group
          ? Array.from(document.querySelectorAll('.js-cert[data-group="' + group + '"]'))
          : Array.from(document.querySelectorAll('.js-cert'));
        var items = all.map(function(l) {
          return { src: l.getAttribute('href'), caption: getCaption(l) };
        });
        var idx = all.indexOf(link);
        openLb(items, idx);
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
    'nantian-mingyuan':  { kind: 'images', count: 8,  prefix: 'images/projects/nantian-mingyuan/img-',  ext: 'jpg' },
    'duanqiao': { kind: 'images', items: [
      { type: 'image', src: 'images/products/duanqiao/110-zh.jpg', thumb: 'images/products/duanqiao/110-zh.jpg', name: '110断桥窗纱一体', zh: 'images/products/duanqiao/110-zh.jpg', en: 'images/products/duanqiao/110-en.jpg', th: 'images/products/duanqiao/110-th.jpg' },
      { type: 'image', src: 'images/products/duanqiao/120-zh.jpg', thumb: 'images/products/duanqiao/120-zh.jpg', name: '120断桥窗纱一体', zh: 'images/products/duanqiao/120-zh.jpg', en: 'images/products/duanqiao/120-en.jpg', th: 'images/products/duanqiao/120-th.jpg' },
      { type: 'image', src: 'images/products/duanqiao/125-zh.jpg', thumb: 'images/products/duanqiao/125-zh.jpg', name: '125六轨推拉窗', zh: 'images/products/duanqiao/125-zh.jpg', en: 'images/products/duanqiao/125-en.jpg', th: 'images/products/duanqiao/125-th.jpg' },
      { type: 'image', src: 'images/products/duanqiao/lift-zh.jpg', thumb: 'images/products/duanqiao/lift-zh.jpg', name: '120提升窗', zh: 'images/products/duanqiao/lift-zh.jpg', en: 'images/products/duanqiao/lift-en.jpg', th: 'images/products/duanqiao/lift-th.jpg' },
      { type: 'image', src: 'images/products/duanqiao/casement-zh.jpg', thumb: 'images/products/duanqiao/casement-zh.jpg', name: '断桥平开窗', zh: 'images/products/duanqiao/casement-zh.jpg', en: 'images/products/duanqiao/casement-en.jpg', th: 'images/products/duanqiao/casement-th.jpg' },
      { type: 'image', src: 'images/products/duanqiao/sliding-window-zh.jpg', thumb: 'images/products/duanqiao/sliding-window-zh.jpg', name: '断桥推拉窗', zh: 'images/products/duanqiao/sliding-window-zh.jpg', en: 'images/products/duanqiao/sliding-window-en.jpg', th: 'images/products/duanqiao/sliding-window-th.jpg' },
      { type: 'image', src: 'images/products/duanqiao/sliding-door-zh.jpg', thumb: 'images/products/duanqiao/sliding-door-zh.jpg', name: '断桥推拉门', zh: 'images/products/duanqiao/sliding-door-zh.jpg', en: 'images/products/duanqiao/sliding-door-en.jpg', th: 'images/products/duanqiao/sliding-door-th.jpg' },
      { type: 'image', src: 'images/products/duanqiao/shoot-1.jpg', thumb: 'images/products/duanqiao/shoot-1.jpg', name: '实拍图' },
      { type: 'image', src: 'images/products/duanqiao/shoot-2.jpg', thumb: 'images/products/duanqiao/shoot-2.jpg', name: '实拍图' },
      { type: 'image', src: 'images/products/duanqiao/shoot-3.jpg', thumb: 'images/products/duanqiao/shoot-3.jpg', name: '实拍图' },
      { type: 'image', src: 'images/products/duanqiao/shoot-4.jpg', thumb: 'images/products/duanqiao/shoot-4.jpg', name: '实拍图' },
      { type: 'image', src: 'images/products/duanqiao/shoot-5.jpg', thumb: 'images/products/duanqiao/shoot-5.jpg', name: '实拍图' }
    ]}
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

  // Build a self-contained video lightbox (so we don't depend on
  // #video-lightbox being present in the current HTML page).
  // If the page already has one (e.g. project-cases.html), reuse it.
  var videoLb = document.getElementById('video-lightbox');
  if (!videoLb) {
    videoLb = document.createElement('div');
    videoLb.id = 'video-lightbox';
    videoLb.className = 'video-lightbox';
    videoLb.hidden = true;
    videoLb.innerHTML =
      '<div class="video-lightbox__inner">' +
        '<button type="button" class="video-lightbox__close" id="video-lightbox-close" aria-label="Close">&times;</button>' +
        '<video class="video-lightbox__video" id="video-lightbox-video" controls playsinline></video>' +
        '<div class="video-lightbox__title" id="video-lightbox-name"></div>' +
      '</div>';
    document.body.appendChild(videoLb);
  }
  var videoEl = document.getElementById('video-lightbox-video');
  var nameEl = document.getElementById('video-lightbox-name');
  var videoClose = document.getElementById('video-lightbox-close');
  function closeVideoLb() {
    videoLb.classList.remove('is-open');
    try { videoEl.pause(); } catch (_) {}
    setTimeout(function() {
      videoLb.hidden = true;
      videoEl.removeAttribute('src');
      videoEl.load();
    }, 200);
  }
  if (videoClose) videoClose.addEventListener('click', closeVideoLb);
  videoLb.addEventListener('click', function(e) { if (e.target === videoLb) closeVideoLb(); });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function openModal(projectId) {
    var spec = PROJECTS[projectId];
    if (!spec) return;
    var items = expandItems(spec);
    var curLang = (window.HuananI18n && typeof window.HuananI18n.getLang === 'function')
      ? window.HuananI18n.getLang() : 'zh';
    var title = (function() {
      var card = document.querySelector('.js-project[data-project-id="' + projectId + '"], .js-product-modal[data-project-id="' + projectId + '"]');
      return card ? (card.querySelector('h4') ? card.querySelector('h4').textContent : (card.querySelector('h3') ? card.querySelector('h3').textContent : projectId)) : projectId;
    })();
    var html = '<div class="proj-modal__header">' +
                 '<div><span class="proj-modal__title">' + escapeHtml(title) + '</span>' +
                   '<span class="proj-modal__count">' + items.length + '</span></div>' +
                 '<button type="button" class="proj-modal__close" aria-label="Close">&times;</button>' +
               '</div>' +
               '<div class="proj-modal__body">' +
                 '<div class="proj-modal__grid">' +
                   items.map(function(it) {
                     if (it.type === 'video') {
                       return '<div class="proj-media js-proj-media" data-type="video" data-src="' + escapeHtml(it.src) + '" data-thumb="' + escapeHtml(it.thumb) + '">' +
                                '<img src="' + escapeHtml(it.thumb) + '" alt="' + escapeHtml(it.name) + '" loading="lazy" decoding="async">' +
                                '<span class="proj-media__play" aria-hidden="true">' +
                                  '<svg viewBox="0 0 24 24" width="42" height="42"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
                                '</span>' +
                              '</div>';
                     }
                     return '<div class="proj-media js-proj-media" data-type="image" data-src="' + escapeHtml(it.src) + '">' +
                              '<img src="' + escapeHtml(it[curLang] || it.thumb) + '" alt="' + escapeHtml(it.name) + '" loading="lazy" decoding="async"' +
                              (it.zh ? ' data-i18n-img-zh="' + escapeHtml(it.zh) + '"' : '') +
                              (it.en ? ' data-i18n-img-en="' + escapeHtml(it.en) + '"' : '') +
                              (it.th ? ' data-i18n-img-th="' + escapeHtml(it.th) + '"' : '') +
                            '></div>';
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
      // Use the video lightbox (either pre-existing or just-created above)
      videoEl.src = src;
      if (nameEl) nameEl.textContent = '';
      videoLb.hidden = false;
      requestAnimationFrame(function() { videoLb.classList.add('is-open'); });
      try { videoEl.play(); } catch (_) {}
    } else {
      // Use gallery lightbox with prev/next across all images in this modal
      var imgLb = document.querySelector('.img-lightbox');
      var imgEl = imgLb ? imgLb.querySelector('.img-lightbox__img') : null;
      if (imgLb && imgEl) {
        var allImgs = Array.from(modal.querySelectorAll('.js-proj-media[data-type="image"]'));
        var items = allImgs.map(function(m) {
          var t = m.querySelector('img');
          return { src: t ? (t.getAttribute('src') || m.getAttribute('data-src')) : m.getAttribute('data-src'), caption: t ? t.alt : '' };
        });
        var idx = allImgs.indexOf(el);
        // 调用 lightbox 的多图打开函数
        if (typeof openLb === 'function') {
          openLb(items, idx);
        } else {
          imgEl.src = src;
          imgEl.alt = el.querySelector('img') ? el.querySelector('img').alt : '';
          imgLb.classList.add('is-open');
          document.body.style.overflow = 'hidden';
        }
      }
    }
  });

  // Esc closes proj-modal first, then lets lightbox handlers take over
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    } else if (e.key === 'Escape' && videoLb && !videoLb.hidden) {
      closeVideoLb();
    }
  });

  // Wire up project cards
  function bind() {
    document.querySelectorAll('.js-project, .js-product-modal').forEach(function(card) {
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
