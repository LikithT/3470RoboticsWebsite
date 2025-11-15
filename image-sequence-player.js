/**
 * Image Sequence Player - 60fps Canvas-based Animation
 * Industry-standard scroll-driven video technique
 */

class ImageSequencePlayer {
    constructor() {
        this.canvas = document.getElementById('sequenceCanvas');
        if (!this.canvas) {
            console.warn('Sequence canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.section = document.querySelector('.fullscreen-sequence-section');
        this.frameInfo = document.getElementById('sequenceFrameInfo');
        
        // Configuration
        this.frameCount = 400;
        this.frameDigits = 4;
        this.framePath = 'frames/frame_';
        this.frameExtension = '.webp';
        
        // State
        this.frames = [];
        this.imagesLoaded = 0;
        this.isReady = false;
        this.currentFrame = 0;
        this.targetFrame = 0;
        this.lastRenderedFrame = -1;
        
        // Performance tracking
        this.frameLoadStart = performance.now();
        
        this.init();
    }
    
    async init() {
        console.log('🎬 Initializing Image Sequence Player...');
        console.log(`📊 Loading ${this.frameCount} frames...`);
        
        // Setup canvas first
        this.setupCanvas();
        
        // Start loading frames
        await this.preloadFrames();
        
        // Start animation loop
        this.startAnimation();
        
        // Setup scroll listener
        this.setupScrollListener();
        
        const loadTime = ((performance.now() - this.frameLoadStart) / 1000).toFixed(2);
        console.log(`✅ Image Sequence Player Ready! ${this.frameCount} frames loaded in ${loadTime}s`);
    }
    
    setupCanvas() {
        // Set canvas to full viewport size
        const updateCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = window.innerWidth * dpr;
            this.canvas.height = window.innerHeight * dpr;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            
            // Scale context for retina displays
            this.ctx.scale(dpr, dpr);
        };
        
        updateCanvasSize();
        window.addEventListener('resize', () => {
            updateCanvasSize();
            if (this.isReady) {
                this.drawFrame(this.lastRenderedFrame);
            }
        });
    }
    
    async preloadFrames() {
        const loadPromises = [];
        
        // Load all frames in parallel
        for (let i = 1; i <= this.frameCount; i++) {
            const frameNumber = String(i).padStart(this.frameDigits, '0');
            const framePath = `${this.framePath}${frameNumber}${this.frameExtension}`;
            
            const promise = new Promise((resolve, reject) => {
                const img = new Image();
                
                img.onload = () => {
                    this.frames[i - 1] = img;
                    this.imagesLoaded++;
                    
                    // Log progress every 50 frames
                    if (this.imagesLoaded % 50 === 0 || this.imagesLoaded === this.frameCount) {
                        const percent = ((this.imagesLoaded / this.frameCount) * 100).toFixed(0);
                        console.log(`📥 Loading: ${this.imagesLoaded}/${this.frameCount} (${percent}%)`);
                    }
                    
                    resolve();
                };
                
                img.onerror = () => {
                    console.error(`❌ Failed to load frame ${i}: ${framePath}`);
                    // Create a blank frame as fallback
                    this.frames[i - 1] = null;
                    this.imagesLoaded++;
                    resolve();
                };
                
                img.src = framePath;
            });
            
            loadPromises.push(promise);
        }
        
        // Wait for all frames to load
        await Promise.all(loadPromises);
        this.isReady = true;
        
        // Draw first frame
        this.drawFrame(0);
    }
    
    setupScrollListener() {
        const canvasContainer = document.querySelector('.sequence-canvas-container');
        
        // Use passive listener for better scroll performance
        window.addEventListener('scroll', () => {
            this.calculateTargetFrame();
            this.updateCanvasVisibility(canvasContainer);
        }, { passive: true });
        
        // Initial calculation
        this.calculateTargetFrame();
        this.updateCanvasVisibility(canvasContainer);
    }
    
    updateCanvasVisibility(canvasContainer) {
        if (!this.section || !canvasContainer) return;
        
        const rect = this.section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Show canvas only when sequence section is in viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
            canvasContainer.classList.add('visible');
        } else {
            canvasContainer.classList.remove('visible');
        }
    }
    
    calculateTargetFrame() {
        if (!this.isReady || !this.section) return;
        
        const rect = this.section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Calculate scroll progress through the section
        // Start: section enters viewport (top = windowHeight)
        // End: section leaves viewport (bottom = 0)
        const scrollStart = windowHeight;
        const scrollEnd = -sectionHeight;
        const scrollRange = scrollStart - scrollEnd;
        
        let progress = (scrollStart - sectionTop) / scrollRange;
        progress = Math.max(0, Math.min(1, progress));
        
        // Map to frame index (0 to frameCount - 1)
        this.targetFrame = Math.floor(progress * (this.frameCount - 1));
        
        // Update info display
        if (this.frameInfo) {
            const percentage = (progress * 100).toFixed(1);
            this.frameInfo.textContent = `Frame: ${this.targetFrame + 1} / ${this.frameCount} (${percentage}%)`;
        }
    }
    
    startAnimation() {
        const animate = () => {
            if (this.isReady) {
                // Smooth interpolation towards target frame
                const diff = this.targetFrame - this.currentFrame;
                this.currentFrame += diff * 0.15; // Smoothness factor
                
                // Round to nearest frame for rendering
                const frameToRender = Math.round(this.currentFrame);
                
                // Only redraw if frame actually changed
                if (frameToRender !== this.lastRenderedFrame) {
                    this.drawFrame(frameToRender);
                    this.lastRenderedFrame = frameToRender;
                }
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    drawFrame(frameIndex) {
        // Clamp frame index
        frameIndex = Math.max(0, Math.min(frameIndex, this.frames.length - 1));
        
        const frame = this.frames[frameIndex];
        if (!frame) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Calculate scaling to fit viewport while maintaining aspect ratio
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;
        const frameAspect = frame.width / frame.height;
        const canvasAspect = canvasWidth / canvasHeight;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (frameAspect > canvasAspect) {
            // Frame is wider than canvas
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / frameAspect;
            drawX = 0;
            drawY = (canvasHeight - drawHeight) / 2;
        } else {
            // Frame is taller than canvas
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * frameAspect;
            drawX = (canvasWidth - drawWidth) / 2;
            drawY = 0;
        }
        
        // Draw frame centered and scaled
        this.ctx.drawImage(frame, drawX, drawY, drawWidth, drawHeight);
    }
    
    // Utility: Get current progress
    getProgress() {
        return this.currentFrame / (this.frameCount - 1);
    }
    
    // Utility: Jump to specific frame
    jumpToFrame(frameIndex) {
        this.targetFrame = Math.max(0, Math.min(frameIndex, this.frameCount - 1));
        this.currentFrame = this.targetFrame;
    }
    
    // Utility: Destroy player
    destroy() {
        this.isReady = false;
        this.frames = [];
        console.log('🗑️ Image Sequence Player destroyed');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageSequencePlayer = new ImageSequencePlayer();
    });
} else {
    window.imageSequencePlayer = new ImageSequencePlayer();
}

console.log('🎨 Image Sequence Player script loaded');
