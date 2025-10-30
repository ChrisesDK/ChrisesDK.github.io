document.addEventListener('DOMContentLoaded', function () {
    // Form handling variables
    const contactForm = document.getElementById('contactForm');
    const confirmationOverlay = document.getElementById('confirmationOverlay');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const backButton = document.getElementById('backButton');

    // Email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        let isValid = true;

        // Get all input fields, excluding the organization field
        const inputs = document.querySelectorAll('.form-group input:not(#organization), .form-group textarea');

        // Reset all error classes
        inputs.forEach(input => {
            input.classList.remove('error'); // Remove previous error class
        });

        // Validate fields
        inputs.forEach(input => {
            if (input.id === 'email') {
                if (!emailPattern.test(input.value)) {
                    input.classList.add('error'); // Add error class if email is invalid
                    isValid = false;
                }
            } else if (input.value.trim() === '') {
                input.classList.add('error'); // Add error class for empty fields
                isValid = false;
            }
        });

        if (!isValid) {
            return; // Stop the form submission if validation fails
        }

        // Simulate form submission process if all fields are valid
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
            showModal();
            contactForm.reset(); // Reset form after successful submission
        })
        .catch(() => {
            confirmationMessage.innerHTML = 'There was an error. Please try again later.';
            showModal();
        });
    });

    function showModal() {
        confirmationOverlay.style.display = 'flex';
        document.body.classList.add('noscroll');
    }

    backButton.addEventListener('click', function () {
        confirmationOverlay.style.display = 'none';
        document.body.classList.remove('noscroll');
    });

    // Character counter
    const messageField = document.getElementById('message');
    const charCount = document.getElementById('charCount');

    messageField.addEventListener('input', function () {
        charCount.textContent = `${messageField.value.length}/250`;
    });

    // Remove error class when user starts typing
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('input', function () {
            if (input.classList.contains('error')) {
                // Revalidate the field on input
                if (input.value.trim() !== '' && !(input.id === 'email' && !emailPattern.test(input.value))) {
                    input.classList.remove('error'); // Remove error class if valid
                }
            }
        });
    });

    // Hamburger menu functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const popupMenu = document.querySelector('.popup-menu');

    menuToggle.addEventListener('click', function (event) {
        // Toggle the 'active' class on the menu toggle
        menuToggle.classList.toggle('active');

        // Show or hide the popup menu
        if (menuToggle.classList.contains('active')) {
            popupMenu.style.display = 'block';
        } else {
            popupMenu.style.display = 'none';
        }
        
        event.stopPropagation(); // Prevent click event from propagating
    });

    // Close the menu when clicking outside of it
    document.addEventListener('click', function (event) {
        if (!menuToggle.contains(event.target) && !popupMenu.contains(event.target)) {
            menuToggle.classList.remove('active');
            popupMenu.style.display = 'none';
        }
    });

    // Prevent menu from closing when clicking inside the menu
    popupMenu.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    // Close the menu when clicking on any menu item
    popupMenu.querySelectorAll('a').forEach(menuItem => {
        menuItem.addEventListener('click', function () {
            menuToggle.classList.remove('active');
            popupMenu.style.display = 'none';
        });
    });
  
  	const cube = document.querySelector('.cube');
    const cubeFaces = document.querySelectorAll('.cube-face');
    let currentAngle = 0;
    let isSnapping = false;

    // Array of titles (8 in total)
    const titles = [
      'Game Designer',
      'Game Programmer',
      "UX Designer",
      "Team Leader",
      "Software Engineer",
      "Creative Director",
      'Game Developer'
    ];

    let titleIndex = 0; // To track which title to display next

    // Function to rotate the cube
    function rotateCube() {
      if (!isSnapping) {
        // Increment the angle by 90 degrees
        currentAngle -= 90;

        // Apply the rotation with transition
        cube.style.transform = `rotateX(${currentAngle}deg)`;

        // Check if cube needs to snap back after a full 360 degrees rotation
        if (currentAngle <= -360) {
          isSnapping = true; // Prevent further rotations until snapping completes
        }

        // Determine which face is rotating away from the viewer
        const faceToUpdate = Math.abs((currentAngle / 90) - 1) % 4; // Index of the face rotating away

        // Update the hidden face with the next title from the array
        titleIndex = (titleIndex + 1) % titles.length; // Cycle through titles
        cubeFaces[faceToUpdate].textContent = titles[titleIndex];
      }
    }

    // Event listener for when the cube's transition finishes
    cube.addEventListener('transitionend', () => {
      if (currentAngle <= -360) {
        // After the transition ends, snap back to 0
        cube.style.transition = 'none'; // Disable transition for snapping
        currentAngle = 0; // Reset angle to 0
        cube.style.transform = `rotateX(${currentAngle}deg)`; // Instantly snap to 0

        // Re-enable transition for smooth future rotations
        setTimeout(() => {
          cube.style.transition = 'transform 1s ease-in-out';
          isSnapping = false; // Allow further rotations
        }, 10); // Small delay to re-enable transition
      }
    });

    // Rotate the cube every 1.5 seconds
    setInterval(rotateCube, 1500);
});
