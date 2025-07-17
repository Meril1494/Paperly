class DashboardManager {
    constructor() {
        this.initCounters();
        this.initInteractions();
        this.loadRecentData();
        this.initAnimations();
    }

    initCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const finalValue = parseInt(counter.textContent);
            const duration = 1500;
            const increment = finalValue / (duration / 16);
            let currentValue = 0;
            
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    counter.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(currentValue);
                }
            }, 16);
        });
    }

    initInteractions() {
        // Add click handlers for action cards
        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                this.handleActionClick(e.currentTarget);
            });
        });

        // Add click handlers for note items
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNoteClick(e.currentTarget);
            });
        });

        // Add hover effects
        const interactiveElements = document.querySelectorAll('.stat-card, .action-card, .note-item, .update-item');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.addHoverEffect(element);
            });
            
            element.addEventListener('mouseleave', () => {
                this.removeHoverEffect(element);
            });
        });
    }

    handleActionClick(card) {
        // Add click animation
        card.style.transform = 'translateY(-3px) scale(0.95)';
        
        setTimeout(() => {
            card.style.transform = 'translateY(-3px) scale(1)';
        }, 150);
    }

    handleNoteClick(item) {
        // Add click feedback
        item.style.background = 'rgba(9, 12, 2, 0.05)';
        
        setTimeout(() => {
            item.style.background = 'rgba(9, 12, 2, 0.02)';
        }, 200);
    }

    addHoverEffect(element) {
        if (element.classList.contains('stat-card')) {
            element.style.transform = 'translateY(-5px) scale(1.02)';
        }
    }

    removeHoverEffect(element) {
        if (element.classList.contains('stat-card')) {
            element.style.transform = 'translateY(-5px) scale(1)';
        }
    }

    loadRecentData() {
        // Simulate loading recent data
        this.animateActivityItems();
        this.animateNoteItems();
        this.animateUpdateItems();
    }

    animateActivityItems() {
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }

    animateNoteItems() {
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    animateUpdateItems() {
        const updateItems = document.querySelectorAll('.update-item');
        updateItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 120);
        });
    }

    initAnimations() {
        // Add intersection observer for scroll-triggered animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe cards for animation
        const cards = document.querySelectorAll('.activity-section, .quick-actions, .recent-notes, .group-updates');
        cards.forEach(card => observer.observe(card));
    }

    // Method to refresh dashboard data
    refreshDashboard() {
        // Simulate data refresh
        this.showLoadingState();
        
        setTimeout(() => {
            this.loadRecentData();
            this.hideLoadingState();
        }, 1000);
    }

    showLoadingState() {
        const cards = document.querySelectorAll('.activity-section, .quick-actions, .recent-notes, .group-updates');
        cards.forEach(card => {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
        });
    }

    hideLoadingState() {
        const cards = document.querySelectorAll('.activity-section, .quick-actions, .recent-notes, .group-updates');
        cards.forEach(card => {
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        });
    }
}

// Add refresh functionality
function refreshDashboard() {
    const dashboard = new DashboardManager();
    dashboard.refreshDashboard();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        refreshDashboard();
    }
});