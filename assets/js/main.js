// Configuration EmailJS
emailjs.init('skaZrxw2eqsbvvS9d');

// Configuration globale
const CONFIG = {
    animationDuration: 300,
    scrollOffset: 100,
    slideInterval: 5000,
    breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
    }
};

// Utilitaires
const Utils = {
    $(selector) {
        return document.querySelector(selector);
    },
    
    $$(selector) {
        return document.querySelectorAll(selector);
    },
    
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
    
    isInViewport(element, offset = 0) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= -offset &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    formatPhone(phone) {
        return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    },
    
    createWhatsAppLink(phone, message = '') {
        const cleanPhone = phone.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/223${cleanPhone}?text=${encodedMessage}`;
    }
};

// Animation Observer
class AnimationObserver {
    constructor() {
        this.elements = Utils.$$('.animate-on-scroll');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(element => {
            observer.observe(element);
        });
    }
}

// Slideshow Banner
class SlideshowBanner {
    constructor() {
        this.container = Utils.$('.slideshow-container');
        this.slides = Utils.$$('.slide');
        this.dots = Utils.$$('.dot');
        this.currentSlide = 0;
        this.autoSlideInterval = null;
        this.init();
    }

    init() {
        if (!this.container || this.slides.length === 0) return;
        
        this.showSlide(0);
        this.createDots();
        this.startAutoSlide();
        
        // Pause on hover
        this.container.addEventListener('mouseenter', () => this.stopAutoSlide());
        this.container.addEventListener('mouseleave', () => this.startAutoSlide());
    }

    showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        this.currentSlide = index;
    }

    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(next);
    }

    prevSlide() {
        const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prev);
    }

    createDots() {
        const dotsContainer = Utils.$('.dots-container');
        if (!dotsContainer) return;
        
        dotsContainer.innerHTML = '';
        this.slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.addEventListener('click', () => this.showSlide(index));
            dotsContainer.appendChild(dot);
        });
        
        this.dots = Utils.$$('.dot');
    }

    startAutoSlide() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, CONFIG.slideInterval);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// Mobile Menu
class MobileMenu {
    constructor() {
        this.hamburger = Utils.$('#hamburger');
        this.mobileMenu = Utils.$('#mobile-menu');
        this.init();
    }

    init() {
        if (!this.hamburger || !this.mobileMenu) return;
        
        this.hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.mobileMenu.contains(e.target) && !this.hamburger.contains(e.target)) {
                this.close();
            }
        });
        
        // Close on link click
        this.mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.close());
        });
    }

    toggle() {
        const isHidden = this.mobileMenu.classList.contains('hidden');
        if (isHidden) {
            this.open();
        } else {
            this.close();
        }
    }

    open() {
        this.mobileMenu.classList.remove('hidden');
        this.mobileMenu.classList.add('active');
        
        const icon = this.hamburger.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-times text-xl';
        }
        
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.mobileMenu.classList.add('hidden');
        this.mobileMenu.classList.remove('active');
        
        const icon = this.hamburger.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-bars text-xl';
        }
        
        document.body.style.overflow = '';
    }
}

// Chat Widget
class ChatWidget {
    constructor() {
        this.createWidget();
        this.init();
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="font-bold">Assistant IBG</h4>
                            <p class="text-sm opacity-90">En ligne</p>
                        </div>
                        <button onclick="chatWidget.toggleChat()" class="text-white hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="chat-body" id="chatBody">
                    <div class="mb-4">
                        <div class="bg-white p-3 rounded-lg shadow-sm">
                            <p class="text-sm">Bonjour ! Comment puis-je vous aider aujourd'hui ?</p>
                        </div>
                    </div>
                </div>
                <div class="chat-input">
                    <div class="flex gap-2">
                        <input type="text" id="chatInput" placeholder="Tapez votre message..." 
                               class="flex-1" onkeypress="if(event.key==='Enter') chatWidget.sendMessage()">
                        <button onclick="chatWidget.sendMessage()" class="btn-ibg-primary px-4">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
            <button class="chat-button" onclick="chatWidget.toggleChat()">
                <i class="fas fa-comments"></i>
            </button>
        `;
        
        document.body.appendChild(widget);
    }

    init() {
        this.chatWindow = Utils.$('#chatWindow');
        this.chatBody = Utils.$('#chatBody');
        this.chatInput = Utils.$('#chatInput');
    }

    toggleChat() {
        this.chatWindow.classList.toggle('active');
        if (this.chatWindow.classList.contains('active')) {
            this.chatInput.focus();
        }
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            this.addBotResponse(message);
        }, 1000);
    }

    addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `mb-4 ${sender === 'user' ? 'text-right' : ''}`;
        
        const bubble = document.createElement('div');
        bubble.className = `inline-block p-3 rounded-lg max-w-xs ${
            sender === 'user' 
                ? 'bg-ibg-blue text-white' 
                : 'bg-white shadow-sm'
        }`;
        bubble.innerHTML = `<p class="text-sm">${message}</p>`;
        
        messageDiv.appendChild(bubble);
        this.chatBody.appendChild(messageDiv);
        this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }

    addBotResponse(userMessage) {
        let response = "Merci pour votre message. Un de nos conseillers vous répondra bientôt.";
        
        if (userMessage.toLowerCase().includes('formation')) {
            response = "Nous proposons diverses formations professionnelles. Consultez notre catalogue ou contactez-nous pour plus d'informations.";
        } else if (userMessage.toLowerCase().includes('contact')) {
            response = "Vous pouvez nous contacter via WhatsApp au 0767839607 ou par email à ciscogroupesecurite@gmail.com";
        } else if (userMessage.toLowerCase().includes('service')) {
            response = "Nos services incluent le conseil aux entreprises, la formation professionnelle, la gestion de projet et l'accompagnement.";
        }
        
        this.addMessage(response, 'bot');
    }
}

// Form Handler avec EmailJS
class FormHandler {
    constructor() {
        this.forms = Utils.$$('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleSubmit(e);
            });
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Show loading state
        if (submitButton) {
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="loading"></span> Envoi...';
            submitButton.disabled = true;
        }

        try {
            // Prepare EmailJS parameters
            const templateParams = {
                from_name: formData.get('name') || formData.get('nom') || 'Visiteur',
                from_email: formData.get('email'),
                message: formData.get('message') || formData.get('sujet'),
                phone: formData.get('phone') || formData.get('telephone'),
                to_email: 'ciscogroupesecurite@gmail.com'
            };

            // Send email via EmailJS
            await emailjs.send('default_service', 'template_default', templateParams);
            
            this.showNotification('Message envoyé avec succès ! Nous vous répondrons bientôt.', 'success');
            form.reset();
        } catch (error) {
            console.error('Erreur EmailJS:', error);
            this.showNotification('Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter directement.', 'error');
        } finally {
            if (submitButton) {
                submitButton.innerHTML = submitButton.getAttribute('data-original-text') || 'Envoyer';
                submitButton.disabled = false;
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
        
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-500', 'text-white');
                break;
            default:
                notification.classList.add('bg-blue-500', 'text-white');
        }
        
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="flex-1">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
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
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }
}

// Newsletter Subscription
async function subscribeNewsletter(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value;
    const submitButton = form.querySelector('button[type="submit"]');
    
    if (!email) {
        showNotification('Veuillez saisir votre adresse email', 'error');
        return;
    }
    
    // Show loading state
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="loading"></span> Inscription...';
    submitButton.disabled = true;
    
    try {
        // Send via EmailJS
        await emailjs.send('default_service', 'template_newsletter', {
            email: email,
            to_email: 'ciscogroupesecurite@gmail.com',
            subject: 'Nouvelle inscription newsletter'
        });
        
        showNotification('Inscription réussie ! Merci de votre intérêt.', 'success');
        form.reset();
    } catch (error) {
        console.error('Erreur newsletter:', error);
        showNotification('Erreur lors de l\'inscription. Veuillez réessayer.', 'error');
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Show Notification Function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
    
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center">
            <span class="flex-1">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// WhatsApp Functions
function openWhatsApp(phone, message = '') {
    const url = Utils.createWhatsAppLink(phone, message);
    window.open(url, '_blank');
}

// Main App Class
class IBGApp {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    initComponents() {
        try {
            // Initialize core components
            this.components.animationObserver = new AnimationObserver();
            this.components.slideshowBanner = new SlideshowBanner();
            this.components.mobileMenu = new MobileMenu();
            this.components.chatWidget = new ChatWidget();
            this.components.formHandler = new FormHandler();
            this.components.counterAnimation = new CounterAnimation();
            
            // Initialize custom features
            this.initSmoothScroll();
            this.initScrollToTop();
            this.initLazyLoading();
            
            console.log('IBG Site initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    initSmoothScroll() {
        Utils.$$('a[href^="#"]').forEach(anchor => {
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
    }

    initScrollToTop() {
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'fixed bottom-6 left-6 bg-ibg-blue text-white w-12 h-12 rounded-full shadow-lg hover:bg-ibg-medium-blue transition-all duration-200 z-40 opacity-0 pointer-events-none';
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.appendChild(scrollBtn);

        window.addEventListener('scroll', Utils.debounce(() => {
            if (window.scrollY > 300) {
                scrollBtn.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                scrollBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        }, 100));
    }

    initLazyLoading() {
        const images = Utils.$$('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('opacity-0');
                    img.classList.add('opacity-100');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            img.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            imageObserver.observe(img);
        });
    }
}

// Global variables
let ibgApp;
let chatWidget;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    ibgApp = new IBGApp();
    chatWidget = ibgApp.components.chatWidget;
});

// Global functions
window.subscribeNewsletter = subscribeNewsletter;
window.showNotification = showNotification;
window.openWhatsApp = openWhatsApp;
