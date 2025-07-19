// Configuration globale
const CONFIG = {
    animationDuration: 300,
    scrollOffset: 100,
    breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
    }
};

// Utilitaires
const Utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Get element by selector
    $(selector) {
        return document.querySelector(selector);
    },

    // Get all elements by selector
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    // Check if element is in viewport
    isInViewport(element, offset = 0) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= -offset &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Smooth scroll to element
    scrollTo(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    // Get current breakpoint
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width >= CONFIG.breakpoints.xl) return 'xl';
        if (width >= CONFIG.breakpoints.lg) return 'lg';
        if (width >= CONFIG.breakpoints.md) return 'md';
        if (width >= CONFIG.breakpoints.sm) return 'sm';
        return 'xs';
    },

    // Format number with separators
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },

    // Generate unique ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Cookie utilities
    setCookie(name, value, days = 30) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    // Local storage utilities
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage not available');
        }
    },

    getStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('LocalStorage not available');
            return null;
        }
    }
};

// Modal Component
class Modal {
    constructor() {
        this.modals = Utils.$$('[data-modal]');
        this.init();
    }

    init() {
        this.modals.forEach(modal => {
            const closeButtons = modal.querySelectorAll('[data-modal-close]');
            
            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.close(modal.id);
                });
            });
        });
    }

    open(modalId) {
        const modal = Utils.$(`#${modalId}`);
        if (modal) {
            modal.classList.add('active');
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // Focus management
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    }

    close(modalId) {
        const modal = Utils.$(`#${modalId}`);
        if (modal) {
            modal.classList.remove('active');
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
}

// Tabs Component
class Tabs {
    constructor() {
        this.tabGroups = Utils.$$('[data-tabs]');
        this.init();
    }

    init() {
        this.tabGroups.forEach(group => {
            const buttons = group.querySelectorAll('[data-tab-button]');
            const panels = group.querySelectorAll('[data-tab-panel]');

            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const target = button.getAttribute('data-tab-button');
                    this.switchTab(group, target);
                });
            });
        });
    }

    switchTab(group, target) {
        const buttons = group.querySelectorAll('[data-tab-button]');
        const panels = group.querySelectorAll('[data-tab-panel]');

        // Update buttons
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab-button') === target) {
                btn.classList.add('active');
            }
        });

        // Update panels
        panels.forEach(panel => {
            panel.classList.add('hidden');
            if (panel.getAttribute('data-tab-panel') === target) {
                panel.classList.remove('hidden');
            }
        });
    }
}

// Accordion Component
class Accordion {
    constructor() {
        this.accordions = Utils.$$('[data-accordion]');
        this.init();
    }

    init() {
        this.accordions.forEach(accordion => {
            const items = accordion.querySelectorAll('[data-accordion-item]');
            
            items.forEach(item => {
                const trigger = item.querySelector('[data-accordion-trigger]');
                const content = item.querySelector('[data-accordion-content]');
                
                if (trigger && content) {
                    trigger.addEventListener('click', () => {
                        this.toggle(accordion, item);
                    });
                }
            });
        });
    }

    toggle(accordion, item) {
        const content = item.querySelector('[data-accordion-content]');
        const trigger = item.querySelector('[data-accordion-trigger]');
        const icon = trigger.querySelector('i');
        const isOpen = item.classList.contains('active');

        // Close all other items if single mode
        if (accordion.hasAttribute('data-single')) {
            const allItems = accordion.querySelectorAll('[data-accordion-item]');
            allItems.forEach(otherItem => {
                if (otherItem !== item) {
                    this.close(otherItem);
                }
            });
        }

        if (isOpen) {
            this.close(item);
        } else {
            this.open(item);
        }
    }

    open(item) {
        const content = item.querySelector('[data-accordion-content]');
        const icon = item.querySelector('[data-accordion-trigger] i');
        
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        
        if (icon) {
            icon.classList.add('rotate-180');
        }
    }

    close(item) {
        const content = item.querySelector('[data-accordion-content]');
        const icon = item.querySelector('[data-accordion-trigger] i');
        
        item.classList.remove('active');
        content.style.maxHeight = '0';
        
        if (icon) {
            icon.classList.remove('rotate-180');
        }
    }
}

// Counter Animation
class CounterAnimation {
    constructor() {
        this.counters = Utils.$$('[data-counter]');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-counter'));
        const duration = parseInt(element.getAttribute('data-duration')) || 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Utils.formatNumber(Math.floor(current));
        }, 16);
    }
}

// Lazy Loading
class LazyLoader {
    constructor() {
        this.images = Utils.$$('img[data-src]');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '50px' });

        this.images.forEach(img => observer.observe(img));
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        }
    }
}

// Search Component
class Search {
    constructor() {
        this.searchInputs = Utils.$$('[data-search]');
        this.init();
    }

    init() {
        this.searchInputs.forEach(input => {
            const target = input.getAttribute('data-search');
            const items = Utils.$$(target);
            
            input.addEventListener('input', Utils.debounce(() => {
                this.performSearch(input.value, items);
            }, 300));
        });
    }

    performSearch(query, items) {
        const searchTerm = query.toLowerCase().trim();
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(searchTerm);
            
            item.style.display = matches || searchTerm === '' ? '' : 'none';
            
            if (matches && searchTerm !== '') {
                this.highlightText(item, searchTerm);
            } else {
                this.removeHighlight(item);
            }
        });
    }

    highlightText(element, term) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const regex = new RegExp(`(${term})`, 'gi');
            if (regex.test(text)) {
                const highlightedText = text.replace(regex, '<mark>$1</mark>');
                const span = document.createElement('span');
                span.innerHTML = highlightedText;
                textNode.parentNode.replaceChild(span, textNode);
            }
        });
    }

    removeHighlight(element) {
        const marks = element.querySelectorAll('mark');
        marks.forEach(mark => {
            mark.outerHTML = mark.innerHTML;
        });
    }
}

// Scroll to Top
class ScrollToTop {
    constructor() {
        this.button = Utils.$('#scrollToTop');
        this.init();
    }

    init() {
        if (!this.button) {
            this.createButton();
        }

        window.addEventListener('scroll', Utils.throttle(() => {
            this.toggleButton();
        }, 100));

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    createButton() {
        this.button = document.createElement('button');
        this.button.id = 'scrollToTop';
        this.button.className = 'fixed bottom-6 left-6 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 z-40 opacity-0 pointer-events-none';
        this.button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(this.button);
    }

    toggleButton() {
        if (window.scrollY > 300) {
            this.button.classList.remove('opacity-0', 'pointer-events-none');
            this.button.classList.add('opacity-100');
        } else {
            this.button.classList.add('opacity-0', 'pointer-events-none');
            this.button.classList.remove('opacity-100');
        }
    }
}

// Theme Switcher
class ThemeSwitcher {
    constructor() {
        this.currentTheme = Utils.getStorage('theme') || 'light';
        this.button = Utils.$('[data-theme-toggle]');
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        
        if (this.button) {
            this.button.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        Utils.setStorage('theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (this.button) {
            const icon = this.button.querySelector('i');
            if (icon) {
                icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }
}

// Cookie Consent
class CookieConsent {
    constructor() {
        this.banner = Utils.$('#cookieBanner');
        this.acceptBtn = Utils.$('#acceptCookies');
        this.declineBtn = Utils.$('#declineCookies');
        this.init();
    }

    init() {
        if (Utils.getCookie('cookieConsent')) {
            return;
        }

        this.showBanner();
        
        if (this.acceptBtn) {
            this.acceptBtn.addEventListener('click', () => this.acceptCookies());
        }
        
        if (this.declineBtn) {
            this.declineBtn.addEventListener('click', () => this.declineCookies());
        }
    }

    showBanner() {
        if (!this.banner) {
            this.createBanner();
        }
        this.banner.classList.remove('hidden');
    }

    createBanner() {
        this.banner = document.createElement('div');
        this.banner.id = 'cookieBanner';
        this.banner.className = 'fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50';
        this.banner.innerHTML = `
            <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex-1">
                    <p class="text-sm">
                        Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
                        <a href="/privacy" class="underline hover:no-underline">En savoir plus</a>
                    </p>
                </div>
                <div class="flex gap-2">
                    <button id="acceptCookies" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
                        Accepter
                    </button>
                    <button id="declineCookies" class="border border-gray-600 hover:bg-gray-800 px-4 py-2 rounded text-sm">
                        Refuser
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(this.banner);
        
        // Re-bind events
        this.acceptBtn = Utils.$('#acceptCookies');
        this.declineBtn = Utils.$('#declineCookies');
        this.acceptBtn.addEventListener('click', () => this.acceptCookies());
        this.declineBtn.addEventListener('click', () => this.declineCookies());
    }

    acceptCookies() {
        Utils.setCookie('cookieConsent', 'accepted', 365);
        this.hideBanner();
    }

    declineCookies() {
        Utils.setCookie('cookieConsent', 'declined', 365);
        this.hideBanner();
    }

    hideBanner() {
        if (this.banner) {
            this.banner.classList.add('hidden');
        }
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        if ('performance' in window) {
            this.measurePageLoad();
            this.measureResourceTiming();
        }
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            this.metrics.pageLoad = {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                totalTime: perfData.loadEventEnd - perfData.fetchStart
            };
            
            console.log('Page Load Metrics:', this.metrics.pageLoad);
        });
    }

    measureResourceTiming() {
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            this.metrics.resources = resources.map(resource => ({
                name: resource.name,
                duration: resource.duration,
                size: resource.transferSize
            }));
            
            console.log('Resource Timing:', this.metrics.resources);
        });
    }
}

// Main App Class
class App {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    initComponents() {
        try {
            // Initialize all components
            this.components.animationObserver = new AnimationObserver();
            this.components.formHandler = new FormHandler();
            this.components.modal = new Modal();
            this.components.tabs = new Tabs();
            this.components.accordion = new Accordion();
            this.components.counterAnimation = new CounterAnimation();
            this.components.lazyLoader = new LazyLoader();
            this.components.search = new Search();
            this.components.scrollToTop = new ScrollToTop();
            this.components.themeSwitcher = new ThemeSwitcher();
            this.components.cookieConsent = new CookieConsent();
            this.components.performanceMonitor = new PerformanceMonitor();

            // Initialize custom components
            this.initCustomComponents();
            
            console.log('IBG Site initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    initCustomComponents() {
        // Dropdown menus
        this.initDropdowns();
        
        // Image galleries
        this.initGalleries();
        
        // Tooltips
        this.initTooltips();
        
        // Copy to clipboard
        this.initCopyButtons();
        
        // Print functionality
        this.initPrintButtons();
        
        // Share functionality
        this.initShareButtons();
    }

    initDropdowns() {
        const dropdowns = Utils.$$('[data-dropdown]');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('[data-dropdown-trigger]');
            const menu = dropdown.querySelector('[data-dropdown-menu]');
            
            if (trigger && menu) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleDropdown(dropdown);
                });
                
                // Close on outside click
                document.addEventListener('click', () => {
                    this.closeDropdown(dropdown);
                });
            }
        });
    }

    toggleDropdown(dropdown) {
        const isOpen = dropdown.classList.contains('open');
        
        // Close all other dropdowns
        Utils.$$('[data-dropdown].open').forEach(d => {
            if (d !== dropdown) this.closeDropdown(d);
        });
        
        if (isOpen) {
            this.closeDropdown(dropdown);
        } else {
            this.openDropdown(dropdown);
        }
    }

    openDropdown(dropdown) {
        dropdown.classList.add('open');
        const menu = dropdown.querySelector('[data-dropdown-menu]');
        if (menu) {
            menu.classList.remove('hidden');
        }
    }

    closeDropdown(dropdown) {
        dropdown.classList.remove('open');
        const menu = dropdown.querySelector('[data-dropdown-menu]');
        if (menu) {
            menu.classList.add('hidden');
        }
    }

    initGalleries() {
        const galleries = Utils.$$('[data-gallery]');
        
        galleries.forEach(gallery => {
            const images = gallery.querySelectorAll('img');
            
            images.forEach((img, index) => {
                img.addEventListener('click', () => {
                    this.openLightbox(images, index);
                });
            });
        });
    }

    openLightbox(images, startIndex) {
        const lightbox = document.createElement('div');
        lightbox.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center';
        lightbox.innerHTML = `
            <div class="relative max-w-4xl max-h-full p-4">
                <img src="${images[startIndex].src}" alt="" class="max-w-full max-h-full object-contain">
                <button class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300" onclick="this.closest('.fixed').remove()">
                    <i class="fas fa-times"></i>
                </button>
                ${images.length > 1 ? `
                    <button class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300" data-prev>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300" data-next>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                ` : ''}
                <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                    ${startIndex + 1} / ${images.length}
                </div>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        let currentIndex = startIndex;
        
        // Navigation
        const prevBtn = lightbox.querySelector('[data-prev]');
        const nextBtn = lightbox.querySelector('[data-next]');
        const img = lightbox.querySelector('img');
        const counter = lightbox.querySelector('.absolute.bottom-4');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                img.src = images[currentIndex].src;
                counter.textContent = `${currentIndex + 1} / ${images.length}`;
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                img.src = images[currentIndex].src;
                counter.textContent = `${currentIndex + 1} / ${images.length}`;
            });
        }
        
        // Keyboard navigation
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                lightbox.remove();
                document.body.style.overflow = '';
                document.removeEventListener('keydown', handleKeydown);
            } else if (e.key === 'ArrowLeft' && prevBtn) {
                prevBtn.click();
            } else if (e.key === 'ArrowRight' && nextBtn) {
                nextBtn.click();
            }
        };
        
        document.addEventListener('keydown', handleKeydown);
        
        // Close on backdrop click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.remove();
                document.body.style.overflow = '';
                document.removeEventListener('keydown', handleKeydown);
            }
        });
    }

    initTooltips() {
        const tooltips = Utils.$$('[data-tooltip]');
        
        tooltips.forEach(element => {
            let tooltip = null;
            
            element.addEventListener('mouseenter', () => {
                const text = element.getAttribute('data-tooltip');
                const position = element.getAttribute('data-tooltip-position') || 'top';
                
                tooltip = document.createElement('div');
                tooltip.className = `absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg pointer-events-none`;
                tooltip.textContent = text;
                
                document.body.appendChild(tooltip);
                
                const rect = element.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                
                let top, left;
                
                switch (position) {
                    case 'top':
                        top = rect.top - tooltipRect.height - 8;
                        left = rect.left + (rect.width - tooltipRect.width) / 2;
                        break;
                    case 'bottom':
                        top = rect.bottom + 8;
                        left = rect.left + (rect.width - tooltipRect.width) / 2;
                        break;
                    case 'left':
                        top = rect.top + (rect.height - tooltipRect.height) / 2;
                        left = rect.left - tooltipRect.width - 8;
                        break;
                    case 'right':
                        top = rect.top + (rect.height - tooltipRect.height) / 2;
                        left = rect.right + 8;
                        break;
                }
                
                tooltip.style.top = `${top + window.scrollY}px`;
                tooltip.style.left = `${left + window.scrollX}px`;
            });
            
            element.addEventListener('mouseleave', () => {
                if (tooltip) {
                    tooltip.remove();
                    tooltip = null;
                }
            });
        });
    }

    initCopyButtons() {
        const copyButtons = Utils.$$('[data-copy]');
        
        copyButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const target = button.getAttribute('data-copy');
                const element = Utils.$(target);
                
                if (element) {
                    try {
                        await navigator.clipboard.writeText(element.textContent);
                        this.showCopyFeedback(button);
                    } catch (err) {
                        console.error('Failed to copy text: ', err);
                    }
                }
            });
        });
    }

    showCopyFeedback(button) {
        const originalText = button.textContent;
        button.textContent = 'Copié !';
        button.classList.add('bg-green-600');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-600');
        }, 2000);
    }

    initPrintButtons() {
        const printButtons = Utils.$$('[data-print]');
        
        printButtons.forEach(button => {
            button.addEventListener('click', () => {
                const target = button.getAttribute('data-print');
                
                if (target) {
                    const element = Utils.$(target);
                    if (element) {
                        this.printElement(element);
                    }
                } else {
                    window.print();
                }
            });
        });
    }

    printElement(element) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Impression</title>
                <link rel="stylesheet" href="/assets/css/style.css">
                <style>
                    body { font-family: Arial, sans-serif; }
                    .no-print { display: none !important; }
                </style>
            </head>
            <body>
                ${element.outerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    }

    initShareButtons() {
        const shareButtons = Utils.$$('[data-share]');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', () => {
                const platform = button.getAttribute('data-share');
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(document.title);
                
                let shareUrl = '';
                
                switch (platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                        break;
                    case 'linkedin':
                        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                        break;
                    case 'whatsapp':
                        shareUrl = `https://wa.me/?text=${title}%20${url}`;
                        break;
                    case 'email':
                        shareUrl = `mailto:?subject=${title}&body=${url}`;
                        break;
                }
                
                if (shareUrl) {
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                }
            });
        });
    }

    // Public API methods
    showNotification(message, type = 'info') {
        if (this.components.formHandler) {
            this.components.formHandler.showNotification(message, type);
        }
    }

    scrollToElement(selector, offset = CONFIG.scrollOffset) {
        const element = Utils.$(selector);
        if (element) {
            Utils.scrollTo(element, offset);
        }
    }

    openModal(modalId) {
        if (this.components.modal) {
            this.components.modal.open(modalId);
        }
    }

    closeModal(modalId) {
        if (this.components.modal) {
            this.components.modal.close(modalId);
        }
    }
}

// Initialize app when DOM is ready
const IBGSite = new App();

// Expose global API
window.IBGSite = IBGSite;
window.Utils = Utils;

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // You could send this to an error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // You could send this to an error tracking service
});

// Performance monitoring
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
                console.log('LCP:', entry.startTime);
            }
            if (entry.entryType === 'first-input') {
                console.log('FID:', entry.processingStart - entry.startTime);
            }
            if (entry.entryType === 'layout-shift') {
                if (!entry.hadRecentInput) {
                    console.log('CLS:', entry.value);
                }
            }
        }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
}