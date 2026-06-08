document.addEventListener('DOMContentLoaded', function () {
    // =========================================================
    // 1. CONTACT FORM HANDLING
    // =========================================================
    const contactForm = document.getElementById('contactForm');
    const confirmationOverlay = document.getElementById('confirmationOverlay');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const backButton = document.getElementById('backButton');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            let isValid = true;
            const inputs = document.querySelectorAll('.form-group input:not(#organization), .form-group textarea');

            inputs.forEach(input => input.classList.remove('error'));

            inputs.forEach(input => {
                if (input.id === 'email') {
                    if (!emailPattern.test(input.value)) {
                        input.classList.add('error');
                        isValid = false;
                    }
                } else if (input.value.trim() === '') {
                    input.classList.add('error');
                    isValid = false;
                }
            });

            if (!isValid) return;

            fetch('send_email.php', {
                method: 'POST',
                body: new FormData(contactForm)
            })
                .then(response => response.text())
                .then(result => {
                    if (result === 'success') {
                        confirmationMessage.textContent = 'Your message has been sent successfully!';
                    } else {
                        confirmationMessage.textContent = 'There was an error. Please try again later.';
                    }
                    showConfirmModal();
                    contactForm.reset();
                })
                .catch(() => {
                    confirmationMessage.textContent = 'There was an error. Please try again later.';
                    showConfirmModal();
                });
        });
    }

    function showConfirmModal() {
        confirmationOverlay.style.display = 'flex';
        document.body.classList.add('noscroll');
    }

    if (backButton) {
        backButton.addEventListener('click', function () {
            confirmationOverlay.style.display = 'none';
            document.body.classList.remove('noscroll');
        });
    }

    const messageField = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    if (messageField && charCount) {
        messageField.addEventListener('input', function () {
            charCount.textContent = `${messageField.value.length}/250`;
        });
    }

    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('input', function () {
            if (input.classList.contains('error')) {
                const isEmail = input.id === 'email';
                const notEmpty = input.value.trim() !== '';
                const emailValid = isEmail ? emailPattern.test(input.value) : true;
                if (notEmpty && emailValid) {
                    input.classList.remove('error');
                }
            }
        });
    });

    // =========================================================
    // 2. HAMBURGER MENU
    // =========================================================
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        function closeMenu() {
            hamburger.classList.remove('is-open');
            mobileMenu.classList.remove('is-open');
            hamburger.setAttribute('aria-expanded', 'false');
        }

        function openMenu() {
            hamburger.classList.add('is-open');
            mobileMenu.classList.add('is-open');
            hamburger.setAttribute('aria-expanded', 'true');
        }

        hamburger.addEventListener('click', function (event) {
            event.stopPropagation();
            hamburger.classList.contains('is-open') ? closeMenu() : openMenu();
        });

        document.addEventListener('click', function (event) {
            if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeMenu();
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // =========================================================
    // 3. ROTATING CUBE
    // =========================================================
    const cube = document.querySelector('.cube');
    const cubeFaces = document.querySelectorAll('.cube-face');
    if (cube && cubeFaces.length) {
        let currentAngle = 0;
        let isSnapping = false;

        const titles = [
            "Software Engineer",
            "Game Developer",
            "Game Designer",
            "Interaction Designer",
            "Unity Developer",
            "Mobile App Developer",
            "Frontend Developer",
            "React Developer",
            "IoT Developer",
            "Virtual Reality Developer",
            "Augmented Reality Developer",
            "Technology Educator",
            "Robotics Instructor",
            "Technical Instructor",
            "Workshop Facilitator",
            "Project Coordinator",
        ];

        

        let titleIndex = 0;

        function rotateCube() {
            if (!isSnapping) {
                currentAngle -= 90;
                cube.style.transform = `rotateX(${currentAngle}deg)`;

                if (currentAngle <= -360) isSnapping = true;

                const faceToUpdate = Math.abs((currentAngle / 90) - 1) % 4;
                titleIndex = (titleIndex + 1) % titles.length;
                cubeFaces[faceToUpdate].textContent = titles[titleIndex];
            }
        }

        cube.addEventListener('transitionend', () => {
            if (currentAngle <= -360) {
                cube.style.transition = 'none';
                currentAngle = 0;
                cube.style.transform = `rotateX(${currentAngle}deg)`;
                setTimeout(() => {
                    cube.style.transition = 'transform 1s ease-in-out';
                    isSnapping = false;
                }, 10);
            }
        });

        setInterval(rotateCube, 1500);
    }

    // =========================================================
    // 4. PROJECT TABS
    // =========================================================
    const projectTabs = document.querySelectorAll('.project-tab');
    const projectCategories = document.querySelectorAll('.project-category');

    projectTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            projectTabs.forEach(t => {
                t.classList.remove('active');
                t.removeAttribute('aria-current');
            });

            tab.classList.add('active');
            tab.setAttribute('aria-current', 'page');

            projectCategories.forEach(cat => {
                cat.classList.toggle('active', cat.id === targetId);
            });

            // Cards in a freshly-shown tab have no layout box until now,
            // so kick off loading for whatever is in view.
            requestAnimationFrame(loadVisibleCards);
        });
    });

    // =========================================================
    // 5. SCROLL REVEAL
    // =========================================================
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -10% 0px' });
        revealEls.forEach(el => revealObserver.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }

    // =========================================================
    // 6. MEDIA: cards (lazy thumbnails) + gallery modal
    // =========================================================
    let mediaData = {};
    const perCardIndex = new Map();      // card -> current media index
    const cardMediaMap = new Map();      // card -> media list
    let gallerySourceCard = null;

    const galleryModal = document.getElementById('galleryModal');
    const galleryStage = document.getElementById('galleryStage');
    const galleryClose = document.getElementById('galleryClose');
    const galleryTitle = document.getElementById('galleryTitle');
    const gallerySubtitle = document.getElementById('gallerySubtitle');
    const galleryCounter = document.getElementById('galleryCounter');
    const galleryPlaceholder = document.getElementById('galleryPlaceholder');
    const galleryImage = document.getElementById('galleryImage');
    const galleryVideo = document.getElementById('galleryVideo');
    const galleryProgressBar = document.getElementById('galleryProgressBar');
    const galleryPrev = document.getElementById('galleryPrev');
    const galleryNext = document.getElementById('galleryNext');
    const galleryVideoControls = document.getElementById('galleryVideoControls');
    const gvcPlay = document.getElementById('gvcPlay');
    const gvcSeek = document.getElementById('gvcSeek');
    const gvcCurrent = document.getElementById('gvcCurrent');
    const gvcDuration = document.getElementById('gvcDuration');
    const gvcMute = document.getElementById('gvcMute');
    const gvcSpeed = document.getElementById('gvcSpeed');
    const gvcSpeedMenu = document.getElementById('gvcSpeedMenu');

    let currentGalleryMedia = [];
    let currentGalleryIndex = 0;
    let galleryLoadToken = 0; // guards async full-res swaps against fast nav

    function isVideoSrc(src) {
        return src && /\.(mp4|webm|ogg)$/i.test(src);
    }

    // Maps a full-res media path to its generated thumbnail.
    // Mirrors generateThumbnails.js. Returns null for videos (no thumb).
    function thumbFor(src) {
        if (!src || isVideoSrc(src)) return null;
        if (!src.startsWith('Assets/Media/')) return null;
        return src
            .replace(/^Assets\/Media\//, 'Assets/Thumbs/')
            .replace(/\.[^.]+$/, '.webp');
    }

    // Maps a video path to its generated poster-frame thumbnail (a .webp under
    // Assets/Thumbs, same as images). Produced by generateVideoPosters.js.
    // If the poster doesn't exist yet the card just falls back to the play scrim.
    function videoThumbFor(src) {
        if (!src || !isVideoSrc(src)) return null;
        if (!src.startsWith('Assets/Media/')) return null;
        return src
            .replace(/^Assets\/Media\//, 'Assets/Thumbs/')
            .replace(/\.[^.]+$/, '.webp');
    }

    // --- card display ---------------------------------------------------
    function showMediaOnCard(card, src) {
        const media = card.querySelector('.project-media');
        const imgEl = card.querySelector('.project-media-img');
        const poster = card.querySelector('.project-media-poster');

        if (isVideoSrc(src)) {
            // Cards never download the video itself; show a play scrim, and a
            // lightweight poster-frame thumbnail behind it when one exists.
            if (poster) poster.classList.add('show');
            if (media) media.classList.add('is-ready');
            if (imgEl) {
                const vthumb = videoThumbFor(src);
                if (vthumb) {
                    imgEl.classList.remove('is-loaded');
                    imgEl.onload = () => imgEl.classList.add('is-loaded');
                    imgEl.onerror = () => { imgEl.classList.remove('is-loaded'); imgEl.removeAttribute('src'); };
                    imgEl.src = vthumb;
                } else {
                    imgEl.classList.remove('is-loaded');
                    imgEl.removeAttribute('src');
                }
            }
            return;
        }

        if (poster) poster.classList.remove('show');
        if (!imgEl) return;

        const thumb = thumbFor(src) || src;
        imgEl.classList.remove('is-loaded');
        imgEl.onload = () => {
            imgEl.classList.add('is-loaded');
            if (media) media.classList.add('is-ready');
        };
        imgEl.onerror = () => {
            // fall back to the full-res original if a thumb is missing
            if (imgEl.src.indexOf('Assets/Thumbs/') !== -1) imgEl.src = src;
        };
        imgEl.src = thumb;
    }

    function updateCardArrows(card, currentIndex, mediaLength) {
        const btnPrev = card.querySelector('.card-nav.left');
        const btnNext = card.querySelector('.card-nav.right');
        if (btnPrev) btnPrev.classList.toggle('is-disabled', currentIndex <= 0);
        if (btnNext) btnNext.classList.toggle('is-disabled', currentIndex >= mediaLength - 1);
    }

    // Load a card's current thumbnail once (idempotent).
    function loadCard(card) {
        if (card.dataset.loaded === '1') return;
        card.dataset.loaded = '1';
        const mediaList = cardMediaMap.get(card) || ['Assets/no-media.png'];
        const idx = perCardIndex.get(card) || 0;
        showMediaOnCard(card, mediaList[idx]);
    }

    function loadVisibleCards() {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        document.querySelectorAll('.project-category.active .project-card').forEach(card => {
            const r = card.getBoundingClientRect();
            if (r.bottom > -200 && r.top < vh + 200) loadCard(card);
        });
    }

    // Lazy-load card thumbs as they approach the viewport.
    const cardObserver = ('IntersectionObserver' in window)
        ? new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadCard(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '300px 0px' })
        : null;

    // --- gallery arrows -------------------------------------------------
    function updateGalleryArrows() {
        if (!galleryPrev || !galleryNext) return;
        galleryPrev.classList.toggle('is-disabled', currentGalleryIndex <= 0);
        galleryNext.classList.toggle('is-disabled', currentGalleryIndex >= currentGalleryMedia.length - 1);
    }

    // --- load data + init ----------------------------------------------
    fetch('mediaData.json')
        .then(res => {
            if (!res.ok) throw new Error('mediaData.json not found. HTTP ' + res.status);
            return res.json();
        })
        .then(data => {
            mediaData = data || {};
            initializeProjectCards();
        })
        .catch(err => {
            console.error('Could not load mediaData.json:', err);
            mediaData = {};
            initializeProjectCards();
        });

    function initializeProjectCards() {
        const cards = document.querySelectorAll('.project-card');

        cards.forEach(card => {
            const categoryName = card.dataset.category;
            const projectName = card.dataset.project;
            const mediaList = (mediaData[categoryName]?.[projectName]) || ['Assets/no-media.png'];

            perCardIndex.set(card, 0);
            cardMediaMap.set(card, mediaList);
            updateCardArrows(card, 0, mediaList.length);

            // inject the video play poster element
            const inner = card.querySelector('.project-media-inner');
            if (inner && !inner.querySelector('.project-media-poster')) {
                const poster = document.createElement('div');
                poster.className = 'project-media-poster';
                poster.innerHTML = '<span class="poster-ring"></span>';
                inner.appendChild(poster);
            }

            const btnPrev = card.querySelector('.card-nav.left');
            const btnNext = card.querySelector('.card-nav.right');

            if (btnPrev) {
                btnPrev.addEventListener('click', (e) => {
                    e.stopPropagation();                 // always swallow the click so the card doesn't open
                    let idx = perCardIndex.get(card) || 0;
                    if (idx <= 0) return;                // at the first item: blocked, but no-op
                    idx -= 1;
                    perCardIndex.set(card, idx);
                    showMediaOnCard(card, mediaList[idx]);
                    updateCardArrows(card, idx, mediaList.length);
                });
            }

            if (btnNext) {
                btnNext.addEventListener('click', (e) => {
                    e.stopPropagation();                 // always swallow the click so the card doesn't open
                    let idx = perCardIndex.get(card) || 0;
                    if (idx >= mediaList.length - 1) return; // at the last item: blocked, but no-op
                    idx += 1;
                    perCardIndex.set(card, idx);
                    showMediaOnCard(card, mediaList[idx]);
                    updateCardArrows(card, idx, mediaList.length);
                });
            }

            card.addEventListener('click', () => {
                const startIndex = perCardIndex.get(card) || 0;
                gallerySourceCard = card;
                openGallery(projectName, categoryName, mediaList, startIndex);
            });

            if (cardObserver) cardObserver.observe(card);
        });

        // First-paint: load whatever is already visible right away.
        loadVisibleCards();

        // Then progressively warm the rest of the thumbnails round-robin
        // (every project's 2nd image, then 3rd, ...) so card/modal nav is instant.
        schedulePreload(cards);
    }

    // =========================================================
    // 7. ROUND-ROBIN THUMBNAIL PRELOAD
    //    Warms thumbnails column-by-column across all projects so the
    //    user has the shortest possible wait whichever group they open.
    // =========================================================
    function schedulePreload(cards) {
        const lists = [];
        cards.forEach(card => {
            const list = cardMediaMap.get(card);
            if (list && list.length) lists.push(list);
        });
        if (!lists.length) return;

        const maxLen = lists.reduce((m, l) => Math.max(m, l.length), 0);
        const queue = [];
        // column 0 first (the visible cover), then 1, 2, ... across every group
        for (let col = 0; col < maxLen; col++) {
            for (const list of lists) {
                if (col < list.length) {
                    const t = thumbFor(list[col]);
                    if (t) queue.push(t);
                }
            }
        }

        const idle = window.requestIdleCallback || function (cb) { return setTimeout(() => cb({ timeRemaining: () => 8 }), 200); };
        let qi = 0;

        function pump(deadline) {
            while (qi < queue.length && (deadline.timeRemaining ? deadline.timeRemaining() > 4 : true)) {
                const img = new Image();
                img.decoding = 'async';
                img.src = queue[qi++];
                if (!deadline.timeRemaining) break; // setTimeout fallback: one per tick
            }
            if (qi < queue.length) idle(pump);
        }
        idle(pump);
    }

    // =========================================================
    // 8. GALLERY MODAL
    // =========================================================
    function openGallery(projectName, categoryName, mediaList, startIndex = 0) {
        currentGalleryMedia = mediaList;
        currentGalleryIndex = Math.min(Math.max(startIndex, 0), mediaList.length - 1);

        galleryTitle.textContent = projectName || 'Project';
        gallerySubtitle.textContent = categoryName || '';

        showGalleryMedia(currentGalleryIndex);

        galleryModal.classList.add('open');
        document.body.classList.add('noscroll');
    }

    function closeGallery() {
        galleryModal.classList.remove('open');
        document.body.classList.remove('noscroll');
        if (galleryVideo) {
            galleryVideo.pause();
            galleryVideo.removeAttribute('src');
            galleryVideo.load();
        }
        if (gvcSpeedMenu) {
            gvcSpeedMenu.classList.remove('open');
            if (gvcSpeed) gvcSpeed.setAttribute('aria-expanded', 'false');
        }
        gallerySourceCard = null;
    }

    function showGalleryMedia(index) {
        const src = currentGalleryMedia[index];
        const token = ++galleryLoadToken;

        if (galleryVideo) galleryVideo.pause();

        if (galleryStage) galleryStage.classList.toggle('is-video', isVideoSrc(src));

        if (isVideoSrc(src)) {
            if (galleryImage) { galleryImage.style.display = 'none'; galleryImage.classList.remove('is-loading'); }
            if (galleryPlaceholder) galleryPlaceholder.style.display = 'none';
            if (galleryVideo) {
                galleryVideo.style.display = 'block';
                if (galleryVideo.src !== src) galleryVideo.src = src;
                galleryVideo.muted = true;
                galleryVideo.playsInline = true;
                const p = galleryVideo.play();
                if (p !== undefined) p.catch(() => {});
            }
        } else if (src) {
            if (galleryVideo) { galleryVideo.pause(); galleryVideo.style.display = 'none'; }
            if (galleryPlaceholder) galleryPlaceholder.style.display = 'none';
            if (galleryImage) {
                galleryImage.style.display = 'block';
                // Blur-up: show the tiny thumb instantly (already cached),
                // then swap to full-res once it has decoded.
                const thumb = thumbFor(src);
                galleryImage.classList.add('is-loading');
                galleryImage.src = thumb || src;

                const full = new Image();
                full.onload = () => {
                    if (token !== galleryLoadToken) return; // user moved on
                    galleryImage.src = src;
                    galleryImage.classList.remove('is-loading');
                };
                full.onerror = () => {
                    if (token !== galleryLoadToken) return;
                    galleryImage.classList.remove('is-loading');
                };
                full.src = src;
            }
        } else {
            if (galleryImage) galleryImage.style.display = 'none';
            if (galleryVideo) { galleryVideo.pause(); galleryVideo.style.display = 'none'; }
            if (galleryPlaceholder) galleryPlaceholder.style.display = 'flex';
        }

        const total = currentGalleryMedia.length;
        galleryCounter.textContent = `${index + 1} / ${total}`;
        galleryProgressBar.style.width = ((index + 1) / total) * 100 + '%';

        if (gallerySourceCard) {
            perCardIndex.set(gallerySourceCard, index);
            gallerySourceCard.dataset.loaded = '1';
            showMediaOnCard(gallerySourceCard, src);
            updateCardArrows(gallerySourceCard, index, total);
        }

        updateGalleryArrows();
        prefetchNeighbours(index);
    }

    // Warm the full-res images on either side so Prev/Next feel instant.
    function prefetchNeighbours(index) {
        [index - 1, index + 1].forEach(i => {
            const s = currentGalleryMedia[i];
            if (s && !isVideoSrc(s)) {
                const img = new Image();
                img.decoding = 'async';
                img.src = s;
            }
        });
    }

    function galleryGo(delta) {
        const next = currentGalleryIndex + delta;
        if (next < 0 || next >= currentGalleryMedia.length) return;
        currentGalleryIndex = next;
        showGalleryMedia(currentGalleryIndex);
    }

    if (galleryPrev) galleryPrev.addEventListener('click', () => galleryGo(-1));
    if (galleryNext) galleryNext.addEventListener('click', () => galleryGo(1));
    if (galleryClose) galleryClose.addEventListener('click', closeGallery);

    // --- custom video controls -----------------------------------------
    const PLAY_ICON = '▶';   // ▶
    const PAUSE_ICON = '⏸';  // ⏸
    const VOL_ON = '🔊';  // 🔊
    const VOL_OFF = '🔇'; // 🔇

    function fmtTime(s) {
        if (!isFinite(s) || s < 0) s = 0;
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return m + ':' + String(sec).padStart(2, '0');
    }

    function togglePlay() {
        if (galleryVideo.paused) { const p = galleryVideo.play(); if (p) p.catch(() => {}); }
        else galleryVideo.pause();
    }

    let galleryRate = 1;   // remembered across videos

    function updateSeekFill() {
        if (!gvcSeek) return;
        const pct = (parseFloat(gvcSeek.value) / 1000) * 100;
        gvcSeek.style.setProperty('--seek', pct + '%');
    }

    if (galleryVideo) {
        let gvcSeeking = false;

        const syncPlayIcon = () => { if (gvcPlay) gvcPlay.textContent = galleryVideo.paused ? PLAY_ICON : PAUSE_ICON; };
        const syncMuteIcon = () => {
            if (!gvcMute) return;
            gvcMute.textContent = galleryVideo.muted ? VOL_OFF : VOL_ON;
            gvcMute.setAttribute('aria-label', galleryVideo.muted ? 'Unmute' : 'Mute');
        };

        galleryVideo.addEventListener('play', syncPlayIcon);
        galleryVideo.addEventListener('pause', syncPlayIcon);
        galleryVideo.addEventListener('volumechange', syncMuteIcon);

        galleryVideo.addEventListener('loadedmetadata', () => {
            if (gvcDuration) gvcDuration.textContent = fmtTime(galleryVideo.duration);
            if (gvcSeek) gvcSeek.value = '0';
            if (gvcCurrent) gvcCurrent.textContent = '0:00';
            galleryVideo.playbackRate = galleryRate;   // keep chosen speed
            updateSeekFill();
            syncMuteIcon();
            syncPlayIcon();
        });

        galleryVideo.addEventListener('timeupdate', () => {
            if (gvcSeeking) return;
            const d = galleryVideo.duration;
            if (gvcSeek && isFinite(d) && d > 0) gvcSeek.value = String((galleryVideo.currentTime / d) * 1000);
            if (gvcCurrent) gvcCurrent.textContent = fmtTime(galleryVideo.currentTime);
            updateSeekFill();
        });

        if (gvcPlay) gvcPlay.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
        if (gvcMute) gvcMute.addEventListener('click', (e) => { e.stopPropagation(); galleryVideo.muted = !galleryVideo.muted; });

        if (gvcSeek) {
            // Scrub live: seek as the knob moves so the video follows and the
            // filled track tracks the knob (no jumping back).
            gvcSeek.addEventListener('input', () => {
                gvcSeeking = true;
                const d = galleryVideo.duration;
                if (isFinite(d) && d > 0) {
                    const t = (parseFloat(gvcSeek.value) / 1000) * d;
                    galleryVideo.currentTime = t;
                    if (gvcCurrent) gvcCurrent.textContent = fmtTime(t);
                }
                updateSeekFill();
            });
            gvcSeek.addEventListener('change', () => { gvcSeeking = false; });
        }

        // Click the video itself to toggle play/pause.
        galleryVideo.addEventListener('click', togglePlay);

        // --- playback speed menu ---
        if (gvcSpeed && gvcSpeedMenu) {
            const speedItems = gvcSpeedMenu.querySelectorAll('button[data-rate]');

            const closeSpeedMenu = () => {
                gvcSpeedMenu.classList.remove('open');
                gvcSpeed.setAttribute('aria-expanded', 'false');
            };

            gvcSpeed.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = gvcSpeedMenu.classList.toggle('open');
                gvcSpeed.setAttribute('aria-expanded', open ? 'true' : 'false');
            });

            speedItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    galleryRate = parseFloat(item.dataset.rate);
                    galleryVideo.playbackRate = galleryRate;
                    gvcSpeed.innerHTML = item.innerHTML;          // e.g. "1.5×"
                    speedItems.forEach(b => b.setAttribute('aria-checked', b === item ? 'true' : 'false'));
                    closeSpeedMenu();
                });
            });

            // close when clicking elsewhere
            document.addEventListener('click', (e) => {
                if (!gvcSpeedMenu.contains(e.target) && e.target !== gvcSpeed) closeSpeedMenu();
            });
        }
    }

    if (galleryModal) {
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) closeGallery();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!galleryModal.classList.contains('open')) return;
        if (e.key === 'Escape') { closeGallery(); return; }
        // let arrow keys drive the focused seek slider instead of navigating
        if (e.target === gvcSeek) return;
        if (e.key === 'ArrowLeft') galleryGo(-1);
        else if (e.key === 'ArrowRight') galleryGo(1);
    });

    // Swipe navigation on touch devices
    let touchX = null;
    if (galleryModal) {
        galleryModal.addEventListener('touchstart', (e) => {
            // ignore swipes that start on the video controls (e.g. dragging the scrubber)
            if (galleryVideoControls && galleryVideoControls.contains(e.target)) { touchX = null; return; }
            touchX = e.changedTouches[0].clientX;
        }, { passive: true });
        galleryModal.addEventListener('touchend', (e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) galleryGo(dx < 0 ? 1 : -1);
            touchX = null;
        }, { passive: true });
    }

    // Keep visible cards loading as the user scrolls (covers tab switches too).
    window.addEventListener('scroll', () => {
        if (window.__cardScrollRaf) return;
        window.__cardScrollRaf = requestAnimationFrame(() => {
            window.__cardScrollRaf = null;
            loadVisibleCards();
        });
    }, { passive: true });
});
