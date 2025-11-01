// Video Cycling System
let currentVideoIndex = 0;
let videoElements = [];

// Initialize video cycling system
function initVideoCycling() {
    videoElements = [
        document.getElementById('heroVideo1'),
        document.getElementById('heroVideo2'),
        document.getElementById('heroVideo3')
    ];
    
    // Set up video event listeners
    videoElements.forEach((video, index) => {
        if (video) {
            // Preload videos for smooth transitions
            video.load();
            
            // Handle video end events - automatically play next video when current one ends
            video.addEventListener('ended', () => {
                nextVideo();
            });
            
            // Handle video loading errors
            video.addEventListener('error', (e) => {
                console.warn(`Video ${index + 1} failed to load:`, e);
                // Try next video if current one fails
                if (index === currentVideoIndex) {
                    nextVideo();
                }
            });
            
            // Ensure video is ready for smooth playback
            video.addEventListener('canplaythrough', () => {
                if (index === currentVideoIndex && video.classList.contains('active-video')) {
                    video.play().catch(e => console.warn('Video autoplay blocked:', e));
                }
            });
        }
    });
    
    // Start the first video
    startVideo(0);
}

function startVideo(index) {
    const video = videoElements[index];
    if (!video) return;
    
    currentVideoIndex = index;
    
    // Hide all videos
    videoElements.forEach(v => {
        if (v) {
            v.classList.remove('active-video');
            v.pause();
        }
    });
    
    // Show current video
    video.classList.add('active-video');
    video.currentTime = 0;
    
    // Play video (handle autoplay restrictions)
    video.play().catch(e => {
        console.warn('Video autoplay blocked, user interaction required:', e);
    });
}

function nextVideo() {
    const nextIndex = (currentVideoIndex + 1) % videoElements.length;
    switchToVideo(nextIndex);
}

function switchToVideo(index) {
    if (index === currentVideoIndex) return;
    
    // Switch to new video
    startVideo(index);
}

// Enhanced Smooth scrolling for better user experience
document.addEventListener('DOMContentLoaded', () => {
    // Initialize video cycling system
    initVideoCycling();
    
    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Enhanced loading animation with stagger
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.8s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Handle page visibility changes to pause/resume videos
document.addEventListener('visibilitychange', () => {
    const currentVideo = videoElements[currentVideoIndex];
    if (document.hidden) {
        // Page is hidden - pause video
        if (currentVideo) currentVideo.pause();
    } else {
        // Page is visible - resume video
        if (currentVideo) {
            currentVideo.play().catch(e => console.warn('Resume play failed:', e));
        }
    }
});

// Device detection for fancy scroll effects
function isDesktop() {
    return window.innerWidth >= 1024 && !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

let observer = null;
let textObserver = null;
let cursorFollower = null;

function initScrollAnimations() {
    if (!isDesktop()) return;
    
    // Main scroll observer for elements
    observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                    entry.target.classList.add('animate-in');
                    
                    // Add special effects based on element type
                    if (entry.target.classList.contains('section-title')) {
                        entry.target.style.filter = 'blur(0px)';
                    }
                }, index * 100);
            }
        });
    }, observerOptions);
    
    // Text reveal observer for typing effects
    textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
                typeWriterEffect(entry.target);
            }
        });
    }, { threshold: 0.3 });
}

// Advanced typing effect for text elements
function typeWriterEffect(element) {
    if (!element.dataset.originalText) {
        element.dataset.originalText = element.textContent;
    }
    
    element.classList.add('typed');
    const text = element.dataset.originalText;
    element.textContent = '';
    element.style.borderRight = '3px solid #000';
    
    let index = 0;
    const typingSpeed = 50;
    
    function typeChar() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(typeChar, typingSpeed);
        } else {
            // Remove cursor after typing is complete
            setTimeout(() => {
                element.style.borderRight = 'none';
            }, 1000);
        }
    }
    
    typeChar();
}

// Magnetic cursor effect
function initMagneticCursor() {
    if (!isDesktop()) return;
    
    // Create custom cursor
    cursorFollower = document.createElement('div');
    cursorFollower.className = 'cursor-follower';
    cursorFollower.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        transform: translate(-50%, -50%) scale(1);
    `;
    document.body.appendChild(cursorFollower);
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    });
    
    // Add magnetic effect to interactive elements
    const magneticElements = document.querySelectorAll('.contact-btn, .cad-btn, .sponsor-item');
    magneticElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(2)';
            cursorFollower.style.background = 'rgba(37, 99, 235, 0.6)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorFollower.style.background = 'rgba(255, 255, 255, 0.8)';
        });
        
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            el.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });
}



// Initialize fancy animations when DOM loads (Desktop Only)
document.addEventListener('DOMContentLoaded', () => {
    if (!isDesktop()) {
        // On mobile, ensure all elements are visible by default
        const allAnimatedElements = document.querySelectorAll('.section-title, .section-description, .team-image, .video-container, .video-description, .outreach-item, .sponsor-item, .contact-btn');
        allAnimatedElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }
    
    // Initialize all fancy desktop-only effects
    initScrollAnimations();
    initMagneticCursor();
    
    // Add animation classes to elements with different effects
    const titleElements = document.querySelectorAll('.section-title');
    const contentElements = document.querySelectorAll('.section-description, .team-image, .video-container, .video-description');
    const gridElements = document.querySelectorAll('.outreach-item, .sponsor-item');
    const buttonElements = document.querySelectorAll('.contact-btn');
    
    // Titles with slide-up effect
    titleElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px) scale(0.9)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        observer.observe(el);
    });
    
    // Content with fade-in effect
    contentElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
        observer.observe(el);
    });
    
    // Grid items with staggered animation
    gridElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px) scale(0.95)';
        el.style.transition = `opacity 0.6s ease-out, transform 0.6s ease-out`;
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
    
    // Buttons with bounce effect
    buttonElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px) scale(0.9)';
        el.style.transition = 'opacity 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        observer.observe(el);
    });
});

// Enhanced scroll progress indicator with gradient (Desktop Only)
document.addEventListener('DOMContentLoaded', () => {
    if (!isDesktop()) return;
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #ffffff 0%, #cccccc 100%);
        z-index: 9999;
        transition: width 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        box-shadow: 0 1px 3px rgba(255, 255, 255, 0.3);
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
    });
});

// Parallax effect for hero background (Desktop Only)
document.addEventListener('DOMContentLoaded', () => {
    if (!isDesktop()) return;
    
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        });
    }
});

// Add hover effects to interactive elements (Desktop Only)
document.addEventListener('DOMContentLoaded', () => {
    if (!isDesktop()) return;
    
    // Enhanced hover effects for sponsor items
    const sponsorItems = document.querySelectorAll('.sponsor-item');
    sponsorItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-8px) scale(1.02)';
            item.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
            item.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Enhanced hover effects for buttons
    const buttons = document.querySelectorAll('.contact-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = 'none';
        });
    });
});

// Smooth section transitions (Desktop Only)
window.addEventListener('scroll', () => {
    if (!isDesktop()) return;
    
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
            const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight));
            section.style.filter = `brightness(${0.8 + (progress * 0.2)})`;
        }
    });
});

// Handle window resize to reinitialize effects if screen size changes
window.addEventListener('resize', () => {
    // Debounce resize events
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        const wasDesktop = observer !== null;
        const isNowDesktop = isDesktop();
        
        if (wasDesktop !== isNowDesktop) {
            // Screen size category changed, reinitialize
            location.reload();
        }
    }, 250);
});

// CAD 3D Viewer Setup
let scene, camera, renderer, controls, cadModel;
let isWireframe = false;

// Cloud CAD model configuration - now supports both FBX and OBJ
const CAD_MODEL_PATHS = {
    fbx: './Single+Fuel+Cell+Car.fbx', // Your FBX file from Fusion 360 (preferred)
    obj: './fuelcellCarCAD_optimized.obj' // Your optimized OBJ file (fallback)
};

function initCADViewer() {
    const container = document.getElementById('cadViewer');
    const loadingElement = container.querySelector('.cad-loading');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5); // Match website background color
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -5);
    scene.add(pointLight);
    
    // Add renderer to container
    container.appendChild(renderer.domElement);
    
    // Load CAD model
    loadCADModel();
    
    // Animation loop
    animate();
    
    // Remove loading text
    setTimeout(() => {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }, 2000);
}

function loadCADModel() {
    // First try to load FBX file (preferred format from Fusion 360)
    const fbxLoader = new THREE.FBXLoader();
    fbxLoader.load(CAD_MODEL_PATHS.fbx, (object) => {
        setupLoadedModel(object, 'FBX');
    }, (progress) => {
        console.log('FBX Loading progress:', (progress.loaded / progress.total * 100) + '%');
    }, (error) => {
        console.log('FBX not found, trying OBJ format...');
        // Fallback to OBJ format
        loadOBJModel();
    });
}

function loadOBJModel() {
    // Fallback to OBJ file
    const objLoader = new THREE.OBJLoader();
    objLoader.load(CAD_MODEL_PATHS.obj, (object) => {
        setupLoadedModel(object, 'OBJ');
    }, (progress) => {
        console.log('OBJ Loading progress:', (progress.loaded / progress.total * 100) + '%');
    }, (error) => {
        console.error('Error loading both FBX and OBJ models:', error);
        createPlaceholderRobot(); // Final fallback to placeholder
    });
}

function setupLoadedModel(object, format) {
    // Remove placeholder if it exists
    if (cadModel) {
        scene.remove(cadModel);
    }
    
    cadModel = object;
    
    // Set materials for the model
    cadModel.traverse((child) => {
        if (child.isMesh) {
            // Preserve existing materials from FBX if available, otherwise apply default
            if (!child.material || format === 'OBJ') {
                child.material = new THREE.MeshPhongMaterial({ 
                    color: 0x2563eb,
                    shininess: 30
                });
            }
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    // Scale and center the model
    const box = new THREE.Box3().setFromObject(cadModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4 / maxDim; // Scale to fit in viewport
    cadModel.scale.setScalar(scale);
    
    // Center the model
    const center = box.getCenter(new THREE.Vector3());
    cadModel.position.sub(center.multiplyScalar(scale));
    
    scene.add(cadModel);
    
    console.log(`CAD model loaded successfully from cloud using ${format} format`);
}

function createPlaceholderRobot() {
    // Create a more detailed robot placeholder inspired by FTC robots
    const robotGroup = new THREE.Group();
    
    // Main chassis/body
    const bodyGeometry = new THREE.BoxGeometry(2.5, 1.2, 1.8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2563eb,
        shininess: 50
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    body.receiveShadow = true;
    robotGroup.add(body);
    
    // Drive train wheels (mecanum wheels simulation)
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 16);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x1f2937 });
    
    const wheelPositions = [
        { x: -1.0, y: 0.4, z: 0.8 },
        { x: 1.0, y: 0.4, z: 0.8 },
        { x: -1.0, y: 0.4, z: -0.8 },
        { x: 1.0, y: 0.4, z: -0.8 }
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(pos.x, pos.y, pos.z);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        robotGroup.add(wheel);
    });
    
    // Linear slide system
    const slideBaseGeometry = new THREE.BoxGeometry(0.4, 2.5, 0.3);
    const slideMaterial = new THREE.MeshPhongMaterial({ color: 0x6b7280 });
    const slideBase = new THREE.Mesh(slideBaseGeometry, slideMaterial);
    slideBase.position.set(0, 2.5, -0.7);
    slideBase.castShadow = true;
    robotGroup.add(slideBase);
    
    // Intake mechanism
    const intakeGeometry = new THREE.BoxGeometry(1.8, 0.3, 0.8);
    const intakeMaterial = new THREE.MeshPhongMaterial({ color: 0xf59e0b });
    const intake = new THREE.Mesh(intakeGeometry, intakeMaterial);
    intake.position.set(0, 0.3, 1.2);
    intake.castShadow = true;
    robotGroup.add(intake);
    
    // Manipulator arm
    const armBaseGeometry = new THREE.BoxGeometry(0.3, 0.3, 1.2);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0xdc2626 });
    const armBase = new THREE.Mesh(armBaseGeometry, armMaterial);
    armBase.position.set(0, 1.8, 0);
    armBase.castShadow = true;
    robotGroup.add(armBase);
    
    // End effector/claw
    const clawGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.4);
    const clawMaterial = new THREE.MeshPhongMaterial({ color: 0x059669 });
    const claw = new THREE.Mesh(clawGeometry, clawMaterial);
    claw.position.set(0, 1.8, 0.8);
    claw.castShadow = true;
    robotGroup.add(claw);
    
    // Control hub (REV hub simulation)
    const hubGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.6);
    const hubMaterial = new THREE.MeshPhongMaterial({ color: 0x4338ca });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.position.set(0.6, 1.4, 0);
    hub.castShadow = true;
    robotGroup.add(hub);
    
    // Battery pack
    const batteryGeometry = new THREE.BoxGeometry(0.6, 0.25, 1.0);
    const batteryMaterial = new THREE.MeshPhongMaterial({ color: 0x374151 });
    const battery = new THREE.Mesh(batteryGeometry, batteryMaterial);
    battery.position.set(-0.6, 1.35, 0);
    battery.castShadow = true;
    robotGroup.add(battery);
    
    // Add some detail panels
    const panelGeometry = new THREE.BoxGeometry(0.05, 0.8, 1.2);
    const panelMaterial = new THREE.MeshPhongMaterial({ color: 0xe5e7eb });
    
    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.set(-1.25, 1.0, 0);
    robotGroup.add(leftPanel);
    
    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.set(1.25, 1.0, 0);
    robotGroup.add(rightPanel);
    
    cadModel = robotGroup;
    scene.add(cadModel);
    
    console.log('Detailed FTC robot placeholder created');
}

function animate() {
    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    // Slowly rotate the model for visual appeal
    if (cadModel) {
        cadModel.rotation.y += 0.005;
    }
    
    renderer.render(scene, camera);
}

// CAD Viewer Controls
document.addEventListener('DOMContentLoaded', () => {
    // Initialize CAD viewer when page loads
    setTimeout(() => {
        if (document.getElementById('cadViewer')) {
            initCADViewer();
        }
    }, 1000);
    
    // Reset view button
    document.getElementById('resetView')?.addEventListener('click', () => {
        if (camera && controls) {
            camera.position.set(5, 5, 5);
            controls.reset();
        }
    });
    
    // Wireframe toggle button
    document.getElementById('wireframe')?.addEventListener('click', () => {
        if (cadModel) {
            isWireframe = !isWireframe;
            cadModel.traverse((child) => {
                if (child.isMesh) {
                    child.material.wireframe = isWireframe;
                }
            });
            document.getElementById('wireframe').textContent = isWireframe ? 'Solid' : 'Wireframe';
        }
    });
    
    // Download model button
    document.getElementById('downloadModel')?.addEventListener('click', () => {
        // Download the FBX file
        const downloadUrl = CAD_MODEL_PATHS.fbx;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'Single+Fuel+Cell+Car.fbx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

// Handle window resize for CAD viewer
window.addEventListener('resize', () => {
    if (camera && renderer) {
        const container = document.getElementById('cadViewer');
        if (container) {
            camera.aspect = container.offsetWidth / container.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.offsetWidth, container.offsetHeight);
        }
    }
});
