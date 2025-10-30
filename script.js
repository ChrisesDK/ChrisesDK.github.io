document.addEventListener('DOMContentLoaded', function () {
    // =========================================================
    // 1. CONTACT FORM HANDLING
    // =========================================================
    const contactForm = document.getElementById('contactForm');
    const confirmationOverlay = document.getElementById('confirmationOverlay');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const backButton = document.getElementById('backButton');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

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
                    confirmationMessage.innerHTML = 'Your message has been sent successfully!';
                } else {
                    confirmationMessage.innerHTML = 'There was an error. Please try again later.';
                }
                showConfirmModal();
                contactForm.reset();
            })
            .catch(() => {
                confirmationMessage.innerHTML = 'There was an error. Please try again later.';
                showConfirmModal();
            });
    });

    function showConfirmModal() {
        confirmationOverlay.style.display = 'flex';
        document.body.classList.add('noscroll');
    }

    backButton.addEventListener('click', function () {
        confirmationOverlay.style.display = 'none';
        document.body.classList.remove('noscroll');
    });

    // character counter
    const messageField = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    messageField.addEventListener('input', function () {
        charCount.textContent = `${messageField.value.length}/250`;
    });

    // remove error when typing
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('input', function () {
            if (input.classList.contains('error')) {
                if (input.value.trim() !== '' && !(input.id === 'email' && !emailPattern.test(input.value))) {
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

    // =========================================================
    // 3. ROTATING CUBE
    // =========================================================
    const cube = document.querySelector('.cube');
    const cubeFaces = document.querySelectorAll('.cube-face');
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

    // =========================================================
    // 4. PROJECT TABS
    // =========================================================
    const projectTabs = document.querySelectorAll('.project-tab');
    const projectCategories = document.querySelectorAll('.project-category');

    projectTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            projectTabs.forEach(t => t.removeAttribute('aria-current'));
            projectTabs.forEach(t => t.classList.remove('active'));

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
    // 5. MEDIA: load from mediaData.json (with logging + fallback)
    // =========================================================
    // structure: { "Category": { "Project": [ "path1", "path2", ... ] } }
    let mediaData = {};
    // current index per card element
    const perCardIndex = new Map();
    // which card opened the modal
    let gallerySourceCard = null;

    fetch('mediaData.json')
        .then(res => {
            if (!res.ok) {
                // e.g. 404
                throw new Error('mediaData.json not found. HTTP ' + res.status);
            }
            return res.json();
        })
        .then(data => {
            console.log('✅ Loaded mediaData.json', data);
            mediaData = data || {};
            initializeProjectCards();
        })
        .catch(err => {
            console.error('❌ Could not load mediaData.json. Falling back to placeholder.', err);
            mediaData = {}; // empty -> cards will use placeholder
            initializeProjectCards();
        });

    // =========================================================
    // 6. HELPER: update arrows on a single CARD
    // =========================================================
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

    // =========================================================
    // 7. GALLERY / MODAL ELEMENTS (global)
    // =========================================================
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

    // current media shown in modal
    let currentGalleryMedia = [];
    let currentGalleryIndex = 0;

    // =========================================================
    // 8. HELPER: update MODAL arrows
    // =========================================================
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

    // =========================================================
    // 9. INITIALIZE CARDS (runs AFTER mediaData is loaded)
    // =========================================================
    function initializeProjectCards() {
        const cards = document.querySelectorAll('.project-card');

        cards.forEach(card => {
            const categoryName = card.dataset.category;
            const projectName = card.dataset.project;

            // try to find media list based on category + project
            let mediaList = [];
            if (
                categoryName &&
                projectName &&
                mediaData[categoryName] &&
                mediaData[categoryName][projectName]
            ) {
                mediaList = mediaData[categoryName][projectName];
            } else {
                // fallback image if not found
                mediaList = ["https://via.placeholder.com/1200x700?text=No+Media"];
            }

            console.log('📦 Card:', projectName, '→', mediaList);

            // start each card at index 0
            perCardIndex.set(card, 0);

            // set initial image on card
            const imgEl = card.querySelector('.project-media-img');
            if (imgEl) {
                imgEl.src = mediaList[0];
            }

            // initial arrow state
            updateCardArrows(card, 0, mediaList.length);

            const btnPrev = card.querySelector('.card-nav.left');
            const btnNext = card.querySelector('.card-nav.right');

            // CARD: prev
            if (btnPrev) {
                btnPrev.addEventListener('click', (e) => {
                    e.stopPropagation(); // don't open modal
                    let idx = perCardIndex.get(card) || 0;
                    if (idx > 0) {
                        idx = idx - 1;
                        perCardIndex.set(card, idx);
                        if (imgEl) imgEl.src = mediaList[idx];
                        updateCardArrows(card, idx, mediaList.length);
                    }
                });
            }

            // CARD: next
            if (btnNext) {
                btnNext.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let idx = perCardIndex.get(card) || 0;
                    if (idx < mediaList.length - 1) {
                        idx = idx + 1;
                        perCardIndex.set(card, idx);
                        if (imgEl) imgEl.src = mediaList[idx];
                        updateCardArrows(card, idx, mediaList.length);
                    }
                });
            }

            // CARD: open modal
            card.addEventListener('click', () => {
                gallerySourceCard = card; // remember
                const startIndex = perCardIndex.get(card) || 0;
                openGallery(projectName, categoryName, mediaList, startIndex);
            });
        });
    }

    // =========================================================
    // 10. OPEN GALLERY (with media list)
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

    // =========================================================
    // 11. CLOSE GALLERY
    // =========================================================
    function closeGallery() {
        galleryModal.classList.remove('open');
        document.body.classList.remove('noscroll');
        if (galleryVideo) {
            galleryVideo.pause();
        }
        gallerySourceCard = null;
    }

    // =========================================================
    // 12. SHOW MEDIA IN MODAL (also syncs back to card)
    // =========================================================
    function showGalleryMedia(index) {
        const src = currentGalleryMedia[index];
        const isVideo = src && /\.(mp4|webm|ogg)$/i.test(src);

        if (isVideo) {
            galleryVideo.style.display = 'block';
            galleryImage.style.display = 'none';
            galleryPlaceholder.style.display = 'none';
            galleryVideo.src = src;
        } else if (src) {
            galleryVideo.style.display = 'none';
            galleryImage.style.display = 'block';
            galleryPlaceholder.style.display = 'none';
            galleryImage.src = src;
        } else {
            galleryVideo.style.display = 'none';
            galleryImage.style.display = 'none';
            galleryPlaceholder.style.display = 'flex';
        }

        const current = index + 1;
        const total = currentGalleryMedia.length;

        galleryCounter.textContent = current + ' / ' + total;

        if (galleryProgressBar) {
            galleryProgressBar.style.width = (current / total) * 100 + '%';
        }

        // sync back to the card
        if (gallerySourceCard) {
            perCardIndex.set(gallerySourceCard, index);
            const cardImg = gallerySourceCard.querySelector('.project-media-img');
            if (cardImg) {
                cardImg.src = src;
            }
            updateCardArrows(gallerySourceCard, index, total);
        }

        updateGalleryArrows();
    }

    // =========================================================
    // 13. MODAL NAV BUTTONS
    // =========================================================
    if (galleryPrev) {
        galleryPrev.addEventListener('click', () => {
            if (currentGalleryIndex > 0) {
                currentGalleryIndex = currentGalleryIndex - 1;
                showGalleryMedia(currentGalleryIndex);
            }
        });
    }

    if (galleryNext) {
        galleryNext.addEventListener('click', () => {
            if (currentGalleryIndex < currentGalleryMedia.length - 1) {
                currentGalleryIndex = currentGalleryIndex + 1;
                showGalleryMedia(currentGalleryIndex);
            }
        });
    }

    if (galleryClose) {
        galleryClose.addEventListener('click', closeGallery);
    }

    // close when clicking backdrop
    if (galleryModal) {
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                closeGallery();
            }
        });
    }

    // =========================================================
    // 14. KEYBOARD NAV (non-circular)
    // =========================================================
    document.addEventListener('keydown', (e) => {
        const isOpen = galleryModal && galleryModal.classList.contains('open');
        if (!isOpen) return;

        if (e.key === 'Escape') {
            closeGallery();
        } else if (e.key === 'ArrowLeft' && currentGalleryIndex > 0) {
            currentGalleryIndex = currentGalleryIndex - 1;
            showGalleryMedia(currentGalleryIndex);
        } else if (e.key === 'ArrowRight' && currentGalleryIndex < currentGalleryMedia.length - 1) {
            currentGalleryIndex = currentGalleryIndex + 1;
            showGalleryMedia(currentGalleryIndex);
        }
    });
});
