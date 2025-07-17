class AuthManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form submissions
        const forms = document.querySelectorAll('.form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        });

        // Role toggle animations
        const roleToggles = document.querySelectorAll('.toggle-switch input');
        roleToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => this.handleRoleToggle(e));
        });
    }

    switchTab(tabName) {
        // Remove active class from all tabs and forms
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

        // Add active class to clicked tab and corresponding form
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        // Add animation effect
        const activeForm = document.getElementById(tabName);
        activeForm.style.transform = 'translateX(-20px)';
        activeForm.style.opacity = '0';
        
        setTimeout(() => {
            activeForm.style.transform = 'translateX(0)';
            activeForm.style.opacity = '1';
        }, 100);
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const formType = form.closest('.auth-form').id;

        // Add loading state
        const submitBtn = form.querySelector('.auth-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            this.processAuth(formType, formData);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    processAuth(formType, formData) {
        switch(formType) {
            case 'login':
                this.handleLogin(formData);
                break;
            case 'signup':
                this.handleSignup(formData);
                break;
            case 'forgot':
                this.handleForgotPassword(formData);
                break;
        }
    }

    handleLogin(formData) {
        // Simulate login success
        this.showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = '../home/home.html';
        }, 1500);
    }

    handleSignup(formData) {
        // Simulate signup success
        this.showMessage('Account created successfully! Please login.', 'success');
        setTimeout(() => {
            this.switchTab('login');
        }, 1500);
    }

    handleForgotPassword(formData) {
        // Simulate password reset
        this.showMessage('Password reset email sent! Check your inbox.', 'success');
    }

    handleRoleToggle(e) {
        const toggle = e.target;
        const label = toggle.nextElementSibling;
        
        // Add visual feedback
        label.style.transform = 'scale(0.95)';
        setTimeout(() => {
            label.style.transform = 'scale(1)';
        }, 150);
    }

    showMessage(message, type) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        // Style the message
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        `;

        // Add animation keyframes
        if (!document.querySelector('#message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(messageEl);

        // Remove message after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                messageEl.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Add smooth scroll behavior for better UX
document.documentElement.style.scrollBehavior = 'smooth';