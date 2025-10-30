document.addEventListener('DOMContentLoaded', function () {
    // ====== CONTACT FORM HANDLING ======
    const contactForm = document.getElementById('contactForm');
    const confirmationOverlay = document.getElementById('confirmationOverlay');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const backButton = document.getElementById('backButton');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        let isValid = true;
        const inputs = document.querySelectorAll('.form-group input:not(#organization), .form-group textarea');

        // reset
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
            .then(r => r.text())
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
    messageField.addEventListener('input', () => {
        charCount.textContent = `${messageField.value.length}/250`;
    });

    // remove error on input
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                if (input.value.trim() !== '' && !(input.id === 'email' && !emailPattern.test(input.value))) {
                    input.classList.remove('error');
                }
            }
        });
    });

    // ====== HAMBURGER MENU ======
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

    // ====== ROTATING CUBE ======
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

    // ====== PROJECT TABS ======
    const projectTabs = document.querySelectorAll('.project-tab');
    const projectCategories = document.querySelectorAll('.project-category');

    projectTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            projectTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            projectCategories.forEach(cat => {
                if (cat.id === targetId) {
                    cat.classList.add('active');
                } else {
                    cat.classList.remove('active');
                }
            });
        });
    });

    // ====== MEDIA DATA (mock, to be replaced with folder JSON later) ======
    const mediaData = {
        "Bachelor Project (Rudder Service and Catastrophy Preparation at Sea, In collaboration with the danish home defense)": [
            "https://via.placeholder.com/1200x700?text=Bachelor+Project+1",
            "https://via.placeholder.com/1200x700?text=Bachelor+Project+2"
        ],
        "ErhvervsTankens Skov og Naturtekniker": [
            "https://via.placeholder.com/1200x700?text=Skov+og+Naturtekniker+1",
            "https://via.placeholder.com/1200x700?text=Skov+og+Naturtekniker+2"
        ],
        "ErhvervsTankens SOSU DigiTech Assistent": [
            "https://via.placeholder.com/1200x700?text=SOSU+DigiTech+1"
        ],
        "ErhvervsTankens Elektriker og VVS": [
            "https://via.placeholder.com/1200x700?text=Elektriker+og+VVS"
        ],
        "ErhvervsTankens Automatiktekniker Koncept": [
            "https://via.placeholder.com/1200x700?text=Automatiktekniker+Koncept"
        ],
        "Maelstorm": [
            "https://via.placeholder.com/1200x700?text=Maelstorm+1",
            "https://via.placeholder.com/1200x700?text=Maelstorm+2",
            "https://via.placeholder.com/1200x700?text=Maelstorm+3"
        ],
        "Maelstorm Bean Bandits": [
            "https://via.placeholder.com/1200x700?text=Bean+Bandits"
        ],
        "Poly Airplanes": [
            "https://via.placeholder.com/1200x700?text=Poly+Airplanes"
        ],
        "Poly Copter": [
            "https://via.placeholder.com/1200x700?text=Poly+Copter"
        ],
        "Poly Rally": [
            "https://via.placeholder.com/1200x700?text=Poly+Rally+1",
            "https://via.placeholder.com/1200x700?text=Poly+Rally+2"
        ],
        "Sheepy Ranch": [
            "https://via.placeholder.com/1200x700?text=Sheepy+Ranch"
        ],
        "Ducky Pond": [
            "https://via.placeholder.com/1200x700?text=Ducky+Pond"
        ],
        "VR Construction Wrecker": [
            "https://via.placeholder.com/1200x700?text=VR+Construction+Wrecker"
        ],
        "Skate Game Go WEE": [
            "https://via.placeholder.com/1200x700?text=Skate+Game+Go+WEE"
        ],
        "Misc": [
            "https://via.placeholder.com/1200x700?text=Misc+1",
            "https://via.placeholder.com/1200x700?text=Misc+2"
        ],
        "Wireless BLE Controller of Raspberry Pi Pico W": [
            "https://via.placeholder.com/1200x700?text=BLE+Controller"
        ],
        "Personal Handheld Gaming Device": [
            "https://via.placeholder.com/1200x700?text=Handheld+Gaming"
        ],
        "Personal Nerf Dart Turret": [
            "https://via.placeholder.com/1200x700?text=Nerf+Dart+Turret"
        ],
        "Personal Robot Arm": [
            "https://via.placeholder.com/1200x700?text=Personal+Robot+Arm"
        ],
        "School Escape Room": [
            "https://via.placeholder.com/1200x700?text=Escape+Room"
        ],
        "School Motor Controller PCB": [
            "https://via.placeholder.com/1200x700?text=Motor+Controller+PCB"
        ],
        "School Omni-Directional Car": [
            "https://via.placeholder.com/1200x700?text=Omni+Directional+Car"
        ],
        "School Robot Controlled in Virtual Reality": [
            "https://via.placeholder.com/1200x700?text=Robot+in+VR"
        ],
        "School Sun-Catcher": [
            "https://via.placeholder.com/1200x700?text=Sun-Catcher"
        ],
        "School Toaster Timer": [
            "https://via.placeholder.com/1200x700?text=Toaster+Timer"
        ],
        "Nano Hogwarts Legacy": [
            "https://via.placeholder.com/1200x700?text=Nano+Hogwarts+Legacy"
        ],
        "Manual Danse-Krabbe": [
            "https://via.placeholder.com/1200x700?text=Danse-Krabbe"
        ],
        "Manual Farvesorteringsmaskine": [
            "https://via.placeholder.com/1200x700?text=Farvesorteringsmaskine"
        ],
        "Manual Farvesorteringsmaskine Avanceret": [
            "https://via.placeholder.com/1200x700?text=Farvesorteringsmaskine+Avanceret"
        ],
        "Manual Gaffeltruck": [
            "https://via.placeholder.com/1200x700?text=Gaffeltruck"
        ],
        "Manual Guitar": [
            "https://via.placeholder.com/1200x700?text=Guitar"
        ],
        "Manual Kortdeler": [
            "https://via.placeholder.com/1200x700?text=Kortdeler"
        ],
        "Manual Robot Arm": [
            "https://via.placeholder.com/1200x700?text=Robot+Arm"
        ],
        "Manual Robot Arm Stor": [
            "https://via.placeholder.com/1200x700?text=Robot+Arm+Stor"
        ],
        "Manual Rul-Bot": [
            "https://via.placeholder.com/1200x700?text=Rul-Bot"
        ],
        "ErhvervsTanken Instructor at Lego Spike Weekly Workshop 2024-2025": [
            "https://via.placeholder.com/1200x700?text=Lego+Spike+2024-2025"
        ],
        "Teknologiskolen Instructor at Camp Autumn 2025": [
            "https://via.placeholder.com/1200x700?text=Camp+Autumn+2025"
        ],
        "Teknologiskolen Instructor at Lego Spike Weekly Workshop 2025": [
            "https://via.placeholder.com/1200x700?text=Lego+Spike+2025"
        ]
    };

    // we keep which media index each card is on
    const perCardIndex = new Map();

    // ====== HELPER: update arrows on a single CARD ======
    function updateCardArrows(card, currentIndex, mediaLength) {
        const btnPrev = card.querySelector('.card-nav.left');
        const btnNext = card.querySelector('.card-nav.right');
        if (!btnPrev || !btnNext) return;

        // left
        if (currentIndex <= 0) {
            btnPrev.classList.add('is-disabled');
        } else {
            btnPrev.classList.remove('is-disabled');
        }

        // right
        if (currentIndex >= mediaLength - 1) {
            btnNext.classList.add('is-disabled');
        } else {
            btnNext.classList.remove('is-disabled');
        }
    }

    // ====== INIT CARDS ======
    const cards = document.querySelectorAll('.project-card');

    // we will also need to know which card opened the modal
    let gallerySourceCard = null;

    cards.forEach(card => {
        const projectName = card.dataset.project;
        const mediaList = mediaData[projectName] || ["https://via.placeholder.com/1200x700?text=No+Media"];

        // start each card at 0
        perCardIndex.set(card, 0);

        const imgEl = card.querySelector('.project-media-img');
        if (imgEl) {
            imgEl.src = mediaList[0];
        }

        // initial arrow state
        updateCardArrows(card, 0, mediaList.length);

        const btnPrev = card.querySelector('.card-nav.left');
        const btnNext = card.querySelector('.card-nav.right');

        // card prev
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

        // card next
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

        // clicking the card opens the big viewer
        card.addEventListener('click', () => {
            const activeCatTab = document.querySelector('.project-tab.active');
            const catName = activeCatTab ? activeCatTab.textContent.trim() : (card.dataset.category || 'Project');

            // remember this card
            gallerySourceCard = card;

            const startIndex = perCardIndex.get(card) || 0;
            openGallery(projectName, catName, startIndex);
        });
    });

    // ====== MODAL ELEMENTS ======
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

    // ====== HELPER: update arrows on MODAL ======
    function updateGalleryArrows() {
        if (!galleryPrev || !galleryNext) return;

        // left
        if (currentGalleryIndex <= 0) {
            galleryPrev.classList.add('is-disabled');
        } else {
            galleryPrev.classList.remove('is-disabled');
        }

        // right
        if (currentGalleryIndex >= currentGalleryMedia.length - 1) {
            galleryNext.classList.add('is-disabled');
        } else {
            galleryNext.classList.remove('is-disabled');
        }
    }

    // ====== OPEN GALLERY ======
    function openGallery(projectName, categoryName, startIndex = 0) {
        const mediaList = mediaData[projectName] || ["https://via.placeholder.com/1200x700?text=No+Media"];
        currentGalleryMedia = mediaList;
        currentGalleryIndex = Math.min(Math.max(startIndex, 0), mediaList.length - 1);

        galleryTitle.textContent = projectName;
        gallerySubtitle.textContent = categoryName;

        showGalleryMedia(currentGalleryIndex);

        galleryModal.classList.add('open');
        document.body.classList.add('noscroll');
    }

    // ====== CLOSE GALLERY ======
    function closeGallery() {
        galleryModal.classList.remove('open');
        document.body.classList.remove('noscroll');
        galleryVideo.pause();
        // you can keep gallerySourceCard = null; or keep it
        gallerySourceCard = null;
    }

    // ====== SHOW MEDIA IN MODAL ======
    function showGalleryMedia(index) {
        const src = currentGalleryMedia[index];
        const isVideo = /\.(mp4|webm|ogg)$/i.test(src);

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

        // text counter
        galleryCounter.textContent = current + ' / ' + total;

        // progressbar
        if (galleryProgressBar) {
            galleryProgressBar.style.width = (current / total) * 100 + '%';
        }

        // 🔁 sync back to the card that opened the modal
        if (gallerySourceCard) {
            // 1) remember index for that card
            perCardIndex.set(gallerySourceCard, index);

            // 2) update card image
            const cardImg = gallerySourceCard.querySelector('.project-media-img');
            if (cardImg) {
                cardImg.src = src;
            }

            // 3) update card arrows to match modal index
            updateCardArrows(gallerySourceCard, index, total);
        }

        // update modal arrows too
        updateGalleryArrows();
    }

    // ====== MODAL NAV ======
    galleryPrev.addEventListener('click', () => {
        if (currentGalleryIndex > 0) {
            currentGalleryIndex = currentGalleryIndex - 1;
            showGalleryMedia(currentGalleryIndex);
        }
    });

    galleryNext.addEventListener('click', () => {
        if (currentGalleryIndex < currentGalleryMedia.length - 1) {
            currentGalleryIndex = currentGalleryIndex + 1;
            showGalleryMedia(currentGalleryIndex);
        }
    });

    galleryClose.addEventListener('click', closeGallery);

    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            closeGallery();
        }
    });

    // keyboard navigation (non-circular)
    document.addEventListener('keydown', (e) => {
        const isOpen = galleryModal.classList.contains('open');
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
