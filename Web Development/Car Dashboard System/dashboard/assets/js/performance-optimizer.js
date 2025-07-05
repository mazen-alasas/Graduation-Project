class PerformanceOptimizer {
    constructor() {
        this.isInitialized = false;
        this.observers = [];
        this.intervals = [];
        this.timeouts = [];
        this.animationFrames = [];

        this.init();
    }

    init() {
        if (this.isInitialized) return;


        this.setupMemoryOptimization();

        this.setupAnimationOptimization();

        this.setupEventOptimization();

        this.setupPerformanceMonitoring();

        this.isInitialized = true;
    }

    setupMemoryOptimization() {
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });

        this.addInterval(() => {
            if (performance.memory && performance.memory.usedJSHeapSize > 50 * 1024 * 1024) { 
                this.forceGarbageCollection();
            }
        }, 30000); 
    }

    setupAnimationOptimization() {
        let lastInteraction = Date.now();

        const updateLastInteraction = () => {
            lastInteraction = Date.now();
        };

        ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, updateLastInteraction, { passive: true });
        });

        this.addInterval(() => {
            const timeSinceLastInteraction = Date.now() - lastInteraction;
            if (timeSinceLastInteraction > 5000) { 
                this.reduceAnimationQuality();
            } else {
                this.restoreAnimationQuality();
            }
        }, 1000);
    }

    setupEventOptimization() {
        let resizeTimeout;
        const optimizedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                window.dispatchEvent(new Event('optimizedResize'));
            }, 250);
        };

        window.addEventListener('resize', optimizedResize);
        this.timeouts.push(resizeTimeout);

        let scrollTimeout;
        const optimizedScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                window.dispatchEvent(new Event('optimizedScroll'));
            }, 100);
        };

        window.addEventListener('scroll', optimizedScroll, { passive: true });
        this.timeouts.push(scrollTimeout);
    }

    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();

        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

                if (fps < 30) {
                    console.warn(`⚠️ معدل إطارات منخفض: ${fps} FPS`);
                    this.applyPerformanceOptimizations();
                }

                frameCount = 0;
                lastTime = currentTime;
            }

            this.addAnimationFrame(measureFPS);
        };

        this.addAnimationFrame(measureFPS);
    }

    applyPerformanceOptimizations() {
        this.reduceAnimationQuality();

        this.reduceUpdateRate();

        this.disableNonEssentialEffects();
    }


    reduceAnimationQuality() {
        document.body.classList.add('reduced-animations');


        if (window.targetFPS && window.targetFPS > 15) {
            window.targetFPS = 15;
        }
    }

    restoreAnimationQuality() {
        document.body.classList.remove('reduced-animations');


        if (window.targetFPS && window.targetFPS < 30) {
            window.targetFPS = 30;
        }
    }

    reduceUpdateRate() {
        if (window.speedometerUpdateInterval) {
            window.speedometerUpdateInterval = 1000 / 15;
        }
    }

    disableNonEssentialEffects() {

        document.body.classList.add('performance-mode');
    }


    pauseAnimations() {
        if (typeof window.stopAnimation === 'function') {
            window.stopAnimation();
        }
    }


    resumeAnimations() {
        if (typeof window.startAnimation === 'function') {
            window.startAnimation();
        }
    }


    forceGarbageCollection() {

        if (window.gc) {
            window.gc();
        }


        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    if (name.includes('old') || name.includes('temp')) {
                        caches.delete(name);
                    }
                });
            });
        }
    }


    addInterval(callback, delay) {
        const intervalId = setInterval(callback, delay);
        this.intervals.push(intervalId);
        return intervalId;
    }


    addTimeout(callback, delay) {
        const timeoutId = setTimeout(callback, delay);
        this.timeouts.push(timeoutId);
        return timeoutId;
    }


    addAnimationFrame(callback) {
        const frameId = requestAnimationFrame(callback);
        this.animationFrames.push(frameId);
        return frameId;
    }


    cleanup() {


        this.intervals.forEach(id => clearInterval(id));
        this.intervals = [];


        this.timeouts.forEach(id => clearTimeout(id));
        this.timeouts = [];


        this.animationFrames.forEach(id => cancelAnimationFrame(id));
        this.animationFrames = [];


        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];

    }

    getPerformanceStats() {
        const stats = {
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
            } : 'غير متاح',
            intervals: this.intervals.length,
            timeouts: this.timeouts.length,
            animationFrames: this.animationFrames.length,
            observers: this.observers.length
        };

        return stats;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();


    window.getPerformanceStats = () => {
        console.table(window.performanceOptimizer.getPerformanceStats());
    };

    window.forceCleanup = () => {
        window.performanceOptimizer.forceGarbageCollection();
    };
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}
