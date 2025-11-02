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
    const menuToggle = document.querySelector('.menu-toggle');
    const popupMenu = document.querySelector('.popup-menu');

    if (menuToggle && popupMenu) {
        menuToggle.addEventListener('click', function (event) {
            menuToggle.classList.toggle('active');
            popupMenu.style.display = menuToggle.classList.contains('active') ? 'block' : 'none';
            event.stopPropagation();
        });

        document.addEventListener('click', function (event) {
            if (!menuToggle.contains(event.target) && !popupMenu.contains(event.target)) {
                menuToggle.classList.remove('active');
                popupMenu.style.display = 'none';
            }
        });

        popupMenu.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        popupMenu.querySelectorAll('a').forEach(menuItem => {
            menuItem.addEventListener('click', function () {
                menuToggle.classList.remove('active');
                popupMenu.style.display = 'none';
            });
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
            "App Developer",
            "Mixed Reality Developer",
            "STEM Educator",
            "Robotics Instructor",
            "Project Coordinator",
        ];

        let titleIndex = 0;

        function rotateCube() {
            if (!isSnapping) {
                currentAngle -= 90;
                cube.style.transform = `rotateX(${currentAngle}deg)`;

                if (currentAngle <= -360) {
                    isSnapping = true;
                }

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
        });
    });

    // =========================================================
    // 5. MEDIA GALLERY + CARDS
    // =========================================================
    let mediaData = {};
    const perCardIndex = new Map();
    let gallerySourceCard = null;

    const galleryModal = document.getElementById('galleryModal');
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

    let currentGalleryMedia = [];
    let currentGalleryIndex = 0;

    function isVideoSrc(src) {
        return src && /\.(mp4|webm|ogg)$/i.test(src);
    }

    function showMediaOnCard(card, src) {
        const imgEl = card.querySelector('.project-media-img');
        const vidEl = card.querySelector('.project-media-video');
        const video = isVideoSrc(src);

        if (video) {
            if (imgEl) imgEl.style.display = 'none';
            if (vidEl) {
                vidEl.style.display = 'block';
                if (vidEl.src !== src) vidEl.src = src;
                try { vidEl.load(); } catch (e) {}
            }
        } else {
            if (imgEl) {
                imgEl.style.display = 'block';
                imgEl.src = src;
            }
            if (vidEl) {
                vidEl.pause();
                vidEl.style.display = 'none';
                vidEl.removeAttribute('src');
            }
        }
    }

    function updateCardArrows(card, currentIndex, mediaLength) {
        const btnPrev = card.querySelector('.card-nav.left');
        const btnNext = card.querySelector('.card-nav.right');
        if (!btnPrev || !btnNext) return;

        btnPrev.classList.toggle('is-disabled', currentIndex <= 0);
        btnNext.classList.toggle('is-disabled', currentIndex >= mediaLength - 1);
    }

    function updateGalleryArrows() {
        if (!galleryPrev || !galleryNext) return;
        galleryPrev.classList.toggle('is-disabled', currentGalleryIndex <= 0);
        galleryNext.classList.toggle('is-disabled', currentGalleryIndex >= currentGalleryMedia.length - 1);
    }

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
            console.error('❌ Could not load mediaData.json:', err);
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
            showMediaOnCard(card, mediaList[0]);
            updateCardArrows(card, 0, mediaList.length);

            const btnPrev = card.querySelector('.card-nav.left');
            const btnNext = card.querySelector('.card-nav.right');

            if (btnPrev) {
                btnPrev.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let idx = perCardIndex.get(card) || 0;
                    if (idx > 0) idx -= 1;
                    perCardIndex.set(card, idx);
                    showMediaOnCard(card, mediaList[idx]);
                    updateCardArrows(card, idx, mediaList.length);
                });
            }

            if (btnNext) {
                btnNext.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let idx = perCardIndex.get(card) || 0;
                    if (idx < mediaList.length - 1) idx += 1;
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
        });
    }

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
        if (galleryVideo) galleryVideo.pause(); // ✅ pause on close
        gallerySourceCard = null;
    }

    // =========================================================
    // ✨ MODIFIED: Autoplay video in modal, pause old one
    // =========================================================
    function showGalleryMedia(index) {
        const src = currentGalleryMedia[index];
        const video = isVideoSrc(src);

        // Always stop any currently playing video first
        if (galleryVideo) galleryVideo.pause();

        if (video) {
            if (galleryVideo) {
                galleryVideo.style.display = 'block';

                if (galleryVideo.src !== src) {
                    galleryVideo.src = src;
                }

                // allow autoplay (muted & inline)
                galleryVideo.muted = true;
                galleryVideo.playsInline = true;

                // attempt to autoplay
                const playPromise = galleryVideo.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => console.log("Autoplay blocked:", err));
                }
            }

            if (galleryImage) galleryImage.style.display = 'none';
            if (galleryPlaceholder) galleryPlaceholder.style.display = 'none';
        } else if (src) {
            if (galleryImage) {
                galleryImage.style.display = 'block';
                galleryImage.src = src;
            }
            if (galleryVideo) {
                galleryVideo.pause();
                galleryVideo.style.display = 'none';
            }
            if (galleryPlaceholder) galleryPlaceholder.style.display = 'none';
        } else {
            if (galleryImage) galleryImage.style.display = 'none';
            if (galleryVideo) {
                galleryVideo.pause();
                galleryVideo.style.display = 'none';
            }
            if (galleryPlaceholder) galleryPlaceholder.style.display = 'flex';
        }

        const total = currentGalleryMedia.length;
        const current = index + 1;
        galleryCounter.textContent = `${current} / ${total}`;
        galleryProgressBar.style.width = (current / total) * 100 + '%';

        if (gallerySourceCard) {
            perCardIndex.set(gallerySourceCard, index);
            showMediaOnCard(gallerySourceCard, src);
            updateCardArrows(gallerySourceCard, index, total);
        }

        updateGalleryArrows();
    }

    // =========================================================
    // MODAL NAVIGATION
    // =========================================================
    if (galleryPrev) {
        galleryPrev.addEventListener('click', () => {
            if (currentGalleryIndex > 0) {
                currentGalleryIndex -= 1;
                showGalleryMedia(currentGalleryIndex);
            }
        });
    }

    if (galleryNext) {
        galleryNext.addEventListener('click', () => {
            if (currentGalleryIndex < currentGalleryMedia.length - 1) {
                currentGalleryIndex += 1;
                showGalleryMedia(currentGalleryIndex);
            }
        });
    }

    if (galleryClose) {
        galleryClose.addEventListener('click', closeGallery);
    }

    if (galleryModal) {
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                closeGallery();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        const isOpen = galleryModal.classList.contains('open');
        if (!isOpen) return;

        if (e.key === 'Escape') {
            closeGallery();
        } else if (e.key === 'ArrowLeft' && currentGalleryIndex > 0) {
            currentGalleryIndex -= 1;
            showGalleryMedia(currentGalleryIndex);
        } else if (e.key === 'ArrowRight' && currentGalleryIndex < currentGalleryMedia.length - 1) {
            currentGalleryIndex += 1;
            showGalleryMedia(currentGalleryIndex);
        }
    });
});
