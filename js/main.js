// TechLeons - Combined JavaScript file with optimized functionality
document.addEventListener('DOMContentLoaded', function() {

    // Create and append the registration popup to the body
    createRegistrationPopup();
    
    // Initialize countdown timer for early bird discount
    initCountdownTimer();
    
    // Core site functionality
    console.log('TechLeons website loaded successfully');
    
    // Enhanced Hero Video Performance
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // Optimize video playback
        heroVideo.addEventListener('loadeddata', function() {
            this.play().catch(e => {
                console.log('Video autoplay prevented:', e);
                // Fallback: show poster image
                this.style.display = 'none';
            });
        });
        
        // Pause video when not in viewport for performance
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    heroVideo.play().catch(e => console.log('Video play failed:', e));
                } else {
                    heroVideo.pause();
                }
            });
        }, { threshold: 0.5 });
        
        videoObserver.observe(heroVideo);
        
        // Reduce video quality on mobile for better performance
        if (window.innerWidth <= 768) {
            heroVideo.style.filter = 'brightness(0.9)';
        }
    }
    
    // ===== IMAGE OPTIMIZATION =====
    // Preload critical images (above the fold)
    const criticalImages = document.querySelectorAll('img[data-critical="true"]');
    criticalImages.forEach(img => {
        if (img.dataset.src) {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'image';
            preloadLink.href = img.dataset.src;
            document.head.appendChild(preloadLink);
            
            // Also set the src immediately
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    });
    
    // Enhanced lazy loading with IntersectionObserver for better performance
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        // Create a new image to preload
                        const tempImage = new Image();
                        tempImage.src = img.dataset.src;
                        
                        // When the image is loaded, update the visible image
                        tempImage.onload = function() {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            img.removeAttribute('data-src');
                        };
                        
                        // Handle loading errors
                        tempImage.onerror = function() {
                            console.warn('Failed to load image:', img.dataset.src);
                            img.src = 'images/placeholder.svg';
                            img.alt = 'Image could not be loaded';
                        };
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px', // Start loading earlier (200px before it comes into view)
            threshold: 0.01
        });
        
        // Apply to all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        // Also apply native lazy loading for browsers that support it
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img:not([loading])').forEach(img => {
                img.setAttribute('loading', 'lazy');
            });
        }
    } else {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('img:not([loading])').forEach(img => {
            img.setAttribute('loading', 'lazy');
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    }

    // Add error handling for all images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            // Replace broken images with a placeholder
            if (this.src !== 'images/placeholder.svg') {
                console.warn('Image failed to load:', this.src);
                this.src = 'images/placeholder.svg';
                this.alt = 'Image could not be loaded';
            }
        }, { once: true });
    });

    // Progressive image loading
    const progressiveImages = document.querySelectorAll('.progressive-img');
    if (progressiveImages.length > 0) {
        const progressiveImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = entry.target;
                    const thumbnail = container.querySelector('.thumbnail');
                    if (thumbnail && thumbnail.dataset.src) {
                        const fullImage = new Image();
                        fullImage.src = thumbnail.dataset.src;
                        fullImage.onload = function() {
                            thumbnail.classList.add('loaded');
                        };
                        observer.unobserve(container);
                    }
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });
        
        progressiveImages.forEach(container => {
            progressiveImageObserver.observe(container);
        });
    }
    
    // Optimize image sizes based on viewport and device pixel ratio
    function optimizeImageSizes() {
        const viewportWidth = window.innerWidth;
        const pixelRatio = window.devicePixelRatio || 1;
        
        document.querySelectorAll('img[data-sizes]').forEach(img => {
            try {
                const sizes = JSON.parse(img.dataset.sizes || '{}');
                for (const breakpoint in sizes) {
                    if (viewportWidth <= parseInt(breakpoint)) {
                        img.style.maxWidth = sizes[breakpoint];
                        break;
                    }
                }
            } catch (e) {
                console.error('Error parsing image sizes:', e);
            }
        });
    }
    
    // Run once on load and then on resize with debounce
    optimizeImageSizes();
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(optimizeImageSizes, 100);
    });
    
    // Convert images to WebP format if supported
    function checkWebpSupport() {
        const webpImage = new Image();
        webpImage.onload = function() {
            const webpSupported = (webpImage.width > 0) && (webpImage.height > 0);
            document.documentElement.classList.toggle('webp', webpSupported);
            
            if (webpSupported) {
                document.querySelectorAll('img[data-webp]').forEach(img => {
                    img.src = img.dataset.webp;
                });
            }
        };
        webpImage.onerror = function() {
            document.documentElement.classList.toggle('webp', false);
        };
        webpImage.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    }
    
    // Check WebP support
    checkWebpSupport();

    // ===== NAVIGATION =====
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    if (hamburger && navLinks) {
        // Use passive event listener for better scroll performance
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('show');
            hamburger.classList.toggle('active');
        }, { passive: true });
        
        // Close menu when clicking on a nav link (for mobile)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('show');
                hamburger.classList.remove('active');
            }, { passive: true });
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks && navLinks.classList.contains('show') && 
            hamburger && !hamburger.contains(e.target) && 
            !navLinks.contains(e.target)) {
            navLinks.classList.remove('show');
            hamburger.classList.remove('active');
        }
    }, { passive: true });
    
    // Ensure menu is properly initialized on page load
    window.addEventListener('load', function() {
        if (window.innerWidth <= 768) {
            navLinks.classList.remove('show');
            hamburger.classList.remove('active');
        }
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Use requestAnimationFrame for smoother animations
                    requestAnimationFrame(() => {
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - 80; // Adjust for header
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    });
                    
                    // Close mobile menu if open
                    if (navLinks && navLinks.classList.contains('show')) {
                        navLinks.classList.remove('show');
                        hamburger.classList.remove('active');
                    }
                }
            }
        }, { passive: false });
    });
    
    // Add header scroll effect
    if (header) {
        // Use requestAnimationFrame for smoother scroll handling
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    
                    if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
                        // Scrolling down - hide header
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        // Scrolling up - show header
                        header.style.transform = 'translateY(0)';
                    }
                    
                    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
                    ticking = false;
                });
                
                ticking = true;
            }
        }, { passive: true });
    }



    // ===== TRAINING & SUPPORT =====
    // Get the Training & Support View Details button and modal
    const trainingViewDetailsBtn = document.querySelector('.wide-card-content .view-more');
    const trainingModal = document.querySelector('.service-modal:last-of-type');
    
    // Add click event listener to the Training & Support View Details button
    if (trainingViewDetailsBtn && trainingModal) {
        trainingViewDetailsBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior
            trainingModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Make sure the Training & Support section is responsive
    function adjustTrainingLayout() {
        const wideServiceCard = document.querySelector('.wide-service-card');
        if (wideServiceCard) {
            if (window.innerWidth < 992) {
                wideServiceCard.classList.add('mobile-layout');
            } else {
                wideServiceCard.classList.remove('mobile-layout');
            }
        }
    }

    // Run on page load and window resize
    adjustTrainingLayout();
    window.addEventListener('resize', adjustTrainingLayout);

    // ===== FORM VALIDATION =====
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Basic form validation
            let valid = true;
            const name = contactForm.querySelector('input[name="name"]');
            const email = contactForm.querySelector('input[name="email"]');
            const message = contactForm.querySelector('textarea[name="message"]');
            
            if (!name.value.trim()) {
                valid = false;
                name.classList.add('error');
                showValidationMessage(name, 'Please enter your name');
            } else {
                name.classList.remove('error');
                clearValidationMessage(name);
            }
            
            if (!email.value.trim() || !validateEmail(email.value)) {
                valid = false;
                email.classList.add('error');
                showValidationMessage(email, 'Please enter a valid email address');
            } else {
                email.classList.remove('error');
                clearValidationMessage(email);
            }
            
            if (!message.value.trim()) {
                valid = false;
                message.classList.add('error');
                showValidationMessage(message, 'Please enter your message');
            } else {
                message.classList.remove('error');
                clearValidationMessage(message);
            }
            
            if (valid) {
                // In a real application, you would send the form data to a server
                showSuccessMessage(contactForm, 'Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            }
        });

        // Add real-time validation
        const formInputs = contactForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateInput(this);
                }
            });
        });
    }

    // Form validation helper functions
    function validateInput(input) {
        if (input.name === 'name' && !input.value.trim()) {
            input.classList.add('error');
            showValidationMessage(input, 'Please enter your name');
            return false;
        } else if (input.name === 'email' && (!input.value.trim() || !validateEmail(input.value))) {
            input.classList.add('error');
            showValidationMessage(input, 'Please enter a valid email address');
            return false;
        } else if (input.name === 'message' && !input.value.trim()) {
            input.classList.add('error');
            showValidationMessage(input, 'Please enter your message');
            return false;
        } else {
            input.classList.remove('error');
            clearValidationMessage(input);
            return true;
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showValidationMessage(input, message) {
        let validationMessage = input.nextElementSibling;
        if (!validationMessage || !validationMessage.classList.contains('validation-message')) {
            validationMessage = document.createElement('div');
            validationMessage.className = 'validation-message';
            input.parentNode.insertBefore(validationMessage, input.nextElementSibling);
        }
        validationMessage.textContent = message;
    }

    function clearValidationMessage(input) {
        const validationMessage = input.nextElementSibling;
        if (validationMessage && validationMessage.classList.contains('validation-message')) {
            validationMessage.textContent = '';
        }
    }

    function showSuccessMessage(form, message) {
        let successMessage = form.querySelector('.success-message');
        if (!successMessage) {
            successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            form.appendChild(successMessage);
        }
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }

    // ===== ANIMATIONS =====
    // Optimize animations
    document.querySelectorAll('.card, .feature-card, .service-card').forEach(card => {
        card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    });
    
    // ===== HOME PAGE CONTENT =====
    // Add more content to home page dynamically
    addHomePageContent();
    
    // ===== PERFORMANCE MONITORING =====
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log('Page load time: ' + pageLoadTime + 'ms');
        }, 0);
    });
});



// Function to initialize countdown timer
function initCountdownTimer() {
    // Set the date we're counting down to (15 hours from now)
    const countDownDate = new Date();
    countDownDate.setTime(countDownDate.getTime() + (15 * 60 * 60 * 1000)); // Add 15 hours in milliseconds
    
    // Update the countdown every 1 second
    const countdownTimer = setInterval(function() {
        // Get current date and time
        const now = new Date().getTime();
        
        // Find the distance between now and the countdown date
        const distance = countDownDate - now;
        
        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Display the result
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
        
        // If the countdown is finished, display expired message
        if (distance < 0) {
            clearInterval(countdownTimer);
            document.querySelector('.discount-badge').textContent = 'EXPIRED';
            document.querySelector('.popup-header p').textContent = 'Early bird discount has ended';
            document.getElementById('countdownTimer').style.display = 'none';
        }
    }, 1000);
}

// Function to add more content to home page
function addHomePageContent() {
    const homePageContent = document.querySelector('.section .container');
    if (homePageContent && window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/TECHLEONS/')) {
        // Create new section for additional content
        const newSection = document.createElement('div');
        newSection.className = 'additional-content mt-5';
        newSection.innerHTML = `
            <h2 class="section-title">Our Latest Solutions</h2>
            <p class="section-subtitle">Discover how we're helping businesses transform digitally</p>
            <div class="grid grid-2">
                <div class="card">
                    <h3>Cloud Migration & Management</h3>
                    <p>Our cloud experts help businesses seamlessly migrate to the cloud and optimize their infrastructure for maximum performance and cost-efficiency. We provide end-to-end cloud solutions including assessment, planning, migration, and ongoing management.</p>
                    <img src="images/5.jpg" alt="Cloud Solutions" class="mt-2">
                </div>
                <div class="card">
                    <h3>AI & Machine Learning Integration</h3>
                    <p>Leverage the power of artificial intelligence and machine learning to gain valuable insights from your data. Our AI solutions help automate processes, enhance decision-making, and create personalized customer experiences.</p>
                    <img src="images/6.jpg" alt="AI Solutions" class="mt-2">
                </div>
            </div>
        `;
        
        // Insert after the first section
        const targetSection = document.querySelector('.section');
        if (targetSection && targetSection.nextElementSibling) {
            targetSection.parentNode.insertBefore(newSection, targetSection.nextElementSibling);
        } else if (targetSection) {
            targetSection.parentNode.appendChild(newSection);
        }
    }
}
