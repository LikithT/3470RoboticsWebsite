// Smooth scrolling function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Navigation scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(255, 255, 255, 0.98)';
        nav.style.backdropFilter = 'blur(30px)';
        nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.backdropFilter = 'blur(20px)';
        nav.style.boxShadow = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize animations when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Add animation classes to elements
    const animatedElements = document.querySelectorAll(`
        .mission-card,
        .achievement-card,
        .sponsor-card,
        .info-card,
        .action-card
    `);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Stagger animation for grid items
    const missionCards = document.querySelectorAll('.mission-card');
    missionCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    const achievementCards = document.querySelectorAll('.achievement-card');
    achievementCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    const sponsorCards = document.querySelectorAll('.sponsor-card');
    sponsorCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.05}s`;
    });
});

// Video play/pause functionality
document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.showcase-video');
    const playButton = document.querySelector('.play-button');
    
    if (video && playButton) {
        playButton.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playButton.style.opacity = '0';
                playButton.style.pointerEvents = 'none';
            }
        });
        
        video.addEventListener('click', () => {
            if (!video.paused) {
                video.pause();
                playButton.style.opacity = '1';
                playButton.style.pointerEvents = 'auto';
            }
        });
        
        video.addEventListener('ended', () => {
            playButton.style.opacity = '1';
            playButton.style.pointerEvents = 'auto';
        });
    }
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add active class styles
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: #6366f1 !important;
    }
    
    .nav-link.active::after {
        width: 100% !important;
    }
`;
document.head.appendChild(style);

// Floating cards animation enhancement
document.addEventListener('DOMContentLoaded', () => {
    const floatingCards = document.querySelectorAll('.floating-card');
    
    floatingCards.forEach((card, index) => {
        // Add random gentle movement
        setInterval(() => {
            const randomX = Math.random() * 10 - 5;
            const randomY = Math.random() * 10 - 5;
            card.style.transform += ` translate(${randomX}px, ${randomY}px)`;
        }, 3000 + index * 1000);
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && heroContent) {
        const rate = scrolled * -0.5;
        heroContent.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Stats counter animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + (element.textContent.includes('+') ? '+' : '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + (element.textContent.includes('+') ? '+' : '');
        }
    }, 16);
}

// Trigger counter animation when stats come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number, .stat-big, .mini-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const hasPlus = text.includes('+');
                const number = parseInt(text.replace(/\D/g, ''));
                
                if (number && !stat.classList.contains('animated')) {
                    stat.classList.add('animated');
                    animateCounter(stat, number);
                    if (hasPlus) {
                        setTimeout(() => {
                            stat.textContent = number + '+';
                        }, 2000);
                    }
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const statsContainers = document.querySelectorAll('.hero-stats, .team-stat, .achievement-stats');
    statsContainers.forEach(container => {
        statsObserver.observe(container);
    });
});

// Mobile menu toggle (if needed for responsive)
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.nav');
    
    // Create mobile menu button if screen is small
    if (window.innerWidth <= 768) {
        const mobileButton = document.createElement('button');
        mobileButton.classList.add('mobile-menu-btn');
        mobileButton.innerHTML = '☰';
        mobileButton.style.cssText = `
            display: block;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #6366f1;
            cursor: pointer;
        `;
        
        nav.appendChild(mobileButton);
        
        mobileButton.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'rgba(255, 255, 255, 0.98)';
            navLinks.style.backdropFilter = 'blur(20px)';
            navLinks.style.flexDirection = 'column';
            navLinks.style.padding = '1rem';
            navLinks.style.borderRadius = '0 0 1rem 1rem';
        });
    }
});

// Add smooth page transitions
document.addEventListener('DOMContentLoaded', () => {
    // Fade in effect for page load
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Enhanced hover effects for cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.mission-card, .achievement-card, .sponsor-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Scroll progress indicator
document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = `${scrollPercent}%`;
    });
});

// Budget Charts Creation - Minimalistic Monochrome Design
document.addEventListener('DOMContentLoaded', () => {
    // Monochrome color palette with single accent color
    const monochromeColors = ['#4A90E2', '#9C9C9C', '#D3D3D3', '#E8E8E8'];
    
    // Common chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                titleFont: {
                    family: 'Inter',
                    weight: '600'
                },
                bodyFont: {
                    family: 'Inter',
                    weight: '500'
                },
                callbacks: {
                    label: function(context) {
                        return context.label + ': ' + context.formattedValue + '%';
                    }
                }
            }
        },
        elements: {
            arc: {
                borderWidth: 1,
                borderColor: '#fff'
            }
        }
    };

    // Parts Chart
    const partsCtx = document.getElementById('partsChart');
    if (partsCtx) {
        new Chart(partsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Motion Components', 'Structure', 'Hardware', '3D Printing Materials'],
                datasets: [{
                    data: [46.48, 31.69, 4.22, 4.93],
                    backgroundColor: monochromeColors,
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                ...chartOptions,
                cutout: '65%'
            }
        });
    }

    // Registration Chart
    const registrationCtx = document.getElementById('registrationChart');
    if (registrationCtx) {
        new Chart(registrationCtx, {
            type: 'doughnut',
            data: {
                labels: ['FTC Team Registration', 'NorCal Qualifying Tournament', 'NorCal Regional Championship', 'World Championship (NF)'],
                datasets: [{
                    data: [25, 35, 25, 15],
                    backgroundColor: monochromeColors,
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                ...chartOptions,
                cutout: '65%'
            }
        });
    }

    // Uniforms Chart
    const uniformsCtx = document.getElementById('uniformsChart');
    if (uniformsCtx) {
        new Chart(uniformsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Shirts', 'Sweatshirts'],
                datasets: [{
                    data: [50, 50],
                    backgroundColor: ['#4A90E2', '#9C9C9C'],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                ...chartOptions,
                cutout: '65%'
            }
        });
    }

    // Travel Chart
    const travelCtx = document.getElementById('travelChart');
    if (travelCtx) {
        new Chart(travelCtx, {
            type: 'doughnut',
            data: {
                labels: ['Gas'],
                datasets: [{
                    data: [100],
                    backgroundColor: ['#4A90E2'],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                ...chartOptions,
                cutout: '65%'
            }
        });
    }
});
