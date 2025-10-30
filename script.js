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

            // reset errors
            inputs.forEach(input => input.classList.remove('error'));

            // validate
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

    // character counter
    const messageField = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    if (messageField && charCount) {
        messageField.addEventListener('input', function () {
            charCount.textContent = `${messageField.value.length}/250`;
        });
    }

    // remove error when typing
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
            "Creative Technologist"
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
                if (cat.id === targetId) {
                    cat.classList.add('active');
                } else {
                    cat.classList.remove('active');
                }
            });
        });
    });

    // =========================================================
    // 5. MEDIA GALLERY + CARDS
    // =========================================================
    // structure of mediaData.json:
    // {
    //   "Game Development": {
    //       "Ducky Pond": ["Assets/Media/Game Development/Ducky Pond/1.png", "....mp4", ...],
    //       ...
    //   },
    //   ...
    // }
    let mediaData = {};
    const perCardIndex = new Map();
    let gallerySourceCard = null;

    // modal elements
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

    // helper: is video?
    function isVideoSrc(src) {
        return src && /\.(mp4|webm|ogg)$/i.test(src);
    }

    // helper: show media on CARD
    function showMediaOnCard(card, src) {
        const imgEl = card.querySelector('.project-media-img');
        const vidEl = card.querySelector('.project-media-video');
        const video = isVideoSrc(src);

        if (video) {
            // hide image
            if (imgEl) {
                imgEl.style.display = 'none';
            }
            // show video
            if (vidEl) {
                vidEl.style.display = 'block';
                if (vidEl.src !== src) {
                    vidEl.src = src;
                }
                // don't autoplay aggressively, just set to first frame
                try {
                    vidEl.load();
                } catch (e) {}
            } else if (imgEl) {
                // fallback if no video element in HTML (but we added it)
                imgEl.style.display = 'block';
                imgEl.src = src;
            }
        } else {
            // show image
            if (imgEl) {
                imgEl.style.display = 'block';
                imgEl.src = src;
            }
            // hide video
            if (vidEl) {
                vidEl.pause();
                vidEl.style.display = 'none';
                vidEl.removeAttribute('src');
            }
        }
    }

    // helper: update arrows on CARD
    function updateCardArrows(card, currentIndex, mediaLength) {
        const btnPrev = card.querySelector('.card-nav.left');
        const btnNext = card.querySelector('.card-nav.right');
        if (!btnPrev || !btnNext) return;

        if (currentIndex <= 0) {
            btnPrev.classList.add('is-disabled');
        } else {
            btnPrev.classList.remove('is-disabled');
        }

        if (currentIndex >= mediaLength - 1) {
            btnNext.classList.add('is-disabled');
        } else {
            btnNext.classList.remove('is-disabled');
        }
    }

    // helper: update arrows on MODAL
    function updateGalleryArrows() {
        if (!galleryPrev || !galleryNext) return;

        if (currentGalleryIndex <= 0) {
            galleryPrev.classList.add('is-disabled');
        } else {
            galleryPrev.classList.remove('is-disabled');
        }

        if (currentGalleryIndex >= currentGalleryMedia.length - 1) {
            galleryNext.classList.add('is-disabled');
        } else {
            galleryNext.classList.remove('is-disabled');
        }
    }

    // fetch mediaData.json
    fetch('mediaData.json')
        .then(res => {
            if (!res.ok) {
                throw new Error('mediaData.json not found. HTTP ' + res.status);
            }
            return res.json();
        })
        .then(data => {
            console.log('✅ mediaData.json loaded', data);
            mediaData = data || {};
            initializeProjectCards();
        })
        .catch(err => {
            console.error('❌ Could not load mediaData.json. Falling back to placeholder.', err);
            mediaData = {};
            initializeProjectCards();
        });

    // initialize cards after media is loaded
    function initializeProjectCards() {
        const cards = document.querySelectorAll('.project-card');

        cards.forEach(card => {
            const categoryName = card.dataset.category;
            const projectName = card.dataset.project;

            let mediaList = [];
            if (
                categoryName &&
                projectName &&
                mediaData[categoryName] &&
                mediaData[categoryName][projectName]
            ) {
                mediaList = mediaData[categoryName][projectName];
            } else {
                mediaList = ['Assets/no-media.png'];
            }

            // start at index 0
            perCardIndex.set(card, 0);

            // put first media on card
            const first = mediaList[0];
            if (first) {
                showMediaOnCard(card, first);
            }

            // set arrows
            updateCardArrows(card, 0, mediaList.length);

            const btnPrev = card.querySelector('.card-nav.left');
            const btnNext = card.querySelector('.card-nav.right');

            // prev
            if (btnPrev) {
                btnPrev.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let idx = perCardIndex.get(card) || 0;
                    if (idx > 0) {
                        idx -= 1;
                        perCardIndex.set(card, idx);
                        showMediaOnCard(card, mediaList[idx]);
                        updateCardArrows(card, idx, mediaList.length);
                    }
                });
            }

            // next
            if (btnNext) {
                btnNext.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let idx = perCardIndex.get(card) || 0;
                    if (idx < mediaList.length - 1) {
                        idx += 1;
                        perCardIndex.set(card, idx);
                        showMediaOnCard(card, mediaList[idx]);
                        updateCardArrows(card, idx, mediaList.length);
                    }
                });
            }

            // click card -> open gallery
            card.addEventListener('click', () => {
                const startIndex = perCardIndex.get(card) || 0;
                gallerySourceCard = card;
                openGallery(projectName, categoryName, mediaList, startIndex);
            });
        });
    }

    // open gallery
    function openGallery(projectName, categoryName, mediaList, startIndex = 0) {
        currentGalleryMedia = mediaList;
        currentGalleryIndex = Math.min(Math.max(startIndex, 0), mediaList.length - 1);

        if (galleryTitle) galleryTitle.textContent = projectName || 'Project';
        if (gallerySubtitle) gallerySubtitle.textContent = categoryName || '';

        showGalleryMedia(currentGalleryIndex);

        if (galleryModal) {
            galleryModal.classList.add('open');
            document.body.classList.add('noscroll');
        }
    }

    // close gallery
    function closeGallery() {
        if (galleryModal) {
            galleryModal.classList.remove('open');
            document.body.classList.remove('noscroll');
        }
        if (galleryVideo) {
            galleryVideo.pause();
        }
        gallerySourceCard = null;
    }

    // show media in modal (and sync to card)
    function showGalleryMedia(index) {
        const src = currentGalleryMedia[index];
        const video = isVideoSrc(src);

        if (video) {
            if (galleryVideo) {
                galleryVideo.style.display = 'block';
                if (galleryVideo.src !== src) {
                    galleryVideo.src = src;
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
        if (galleryCounter) {
            galleryCounter.textContent = current + ' / ' + total;
        }
        if (galleryProgressBar) {
            galleryProgressBar.style.width = (current / total) * 100 + '%';
        }

        // sync back to card that opened it
        if (gallerySourceCard) {
            perCardIndex.set(gallerySourceCard, index);
            showMediaOnCard(gallerySourceCard, src);
            updateCardArrows(gallerySourceCard, index, total);
        }

        updateGalleryArrows();
    }

    // modal nav
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

    // keyboard nav
    document.addEventListener('keydown', (e) => {
        const isOpen = galleryModal && galleryModal.classList.contains('open');
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
