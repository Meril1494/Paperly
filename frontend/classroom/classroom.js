class ClassroomManager {
    constructor() {
        this.recentClassrooms = this.loadRecentClassrooms();
        this.init();
    }

    init() {
        this.initEventListeners();
        this.renderRecentClassrooms();
    }

    initEventListeners() {
        document.getElementById("createForm").addEventListener("submit", (e) => {
            this.handleCreateClassroom(e);
        });

        document.getElementById("joinForm").addEventListener("submit", (e) => {
            this.handleJoinClassroom(e);
        });
    }

    async handleCreateClassroom(e) {
        e.preventDefault();

        const className = document.getElementById("className").value.trim();
        const classSubject = document.getElementById("classSubject").value.trim();

        if (!className || !classSubject) {
            this.showMessage("Please fill in all fields", "error");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            this.showMessage("Please log in first", "error");
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading-spinner"></div>Creating...';
        submitBtn.disabled = true;

        try {
            const res = await fetch("http://localhost:5000/api/classrooms/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: className,
                    subject: classSubject,
                }),
            });

            const data = await res.json();
            
            if (res.ok) {
                this.showMessage("Classroom created successfully!", "success");
                document.getElementById("createForm").reset();
                
                // Add to recent classrooms
                this.addToRecentClassrooms({
                    id: data.classroom?.id || Date.now(),
                    name: className,
                    subject: classSubject,
                    role: 'teacher',
                    joinedAt: new Date().toISOString()
                });
            } else {
                this.showMessage(data.message || "Error creating classroom", "error");
            }
        } catch (err) {
            console.error("Create classroom error:", err);
            this.showMessage("Server error. Please try again later.", "error");
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleJoinClassroom(e) {
        e.preventDefault();

        const joinCode = document.getElementById("joinCode").value.trim();

        if (!joinCode) {
            this.showMessage("Please enter a classroom code", "error");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            this.showMessage("Please log in first", "error");
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading-spinner"></div>Joining...';
        submitBtn.disabled = true;

        try {
            const res = await fetch("http://localhost:5000/api/classrooms/join", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code: joinCode,
                }),
            });

            const data = await res.json();
            
            if (res.ok) {
                this.showMessage("Joined classroom successfully!", "success");
                document.getElementById("joinForm").reset();
                
                // Add to recent classrooms
                this.addToRecentClassrooms({
                    id: data.classroom?.id || Date.now(),
                    name: data.classroom?.name || `Classroom ${joinCode}`,
                    subject: data.classroom?.subject || 'General',
                    role: 'student',
                    joinedAt: new Date().toISOString()
                });
            } else {
                this.showMessage(data.message || "Error joining classroom", "error");
            }
        } catch (err) {
            console.error("Join classroom error:", err);
            this.showMessage("Server error. Please try again later.", "error");
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    loadRecentClassrooms() {
        const saved = localStorage.getItem('paperly_recent_classrooms');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default recent classrooms for demo
        return [
            {
                id: 1,
                name: 'Advanced Physics',
                subject: 'Physics',
                role: 'student',
                joinedAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 2,
                name: 'Mathematics 101',
                subject: 'Mathematics',
                role: 'teacher',
                joinedAt: new Date(Date.now() - 172800000).toISOString()
            }
        ];
    }

    saveRecentClassrooms() {
        localStorage.setItem('paperly_recent_classrooms', JSON.stringify(this.recentClassrooms));
    }

    addToRecentClassrooms(classroom) {
        // Remove if already exists
        this.recentClassrooms = this.recentClassrooms.filter(c => c.id !== classroom.id);
        
        // Add to beginning
        this.recentClassrooms.unshift(classroom);
        
        // Keep only last 6
        if (this.recentClassrooms.length > 6) {
            this.recentClassrooms = this.recentClassrooms.slice(0, 6);
        }
        
        this.saveRecentClassrooms();
        this.renderRecentClassrooms();
    }

    renderRecentClassrooms() {
        const container = document.getElementById('recentClassrooms');
        
        if (this.recentClassrooms.length === 0) {
            container.innerHTML = `
                <div class="loading-state">
                    <span>No recent classrooms</span>
                </div>
            `;
            return;
        }

        container.innerHTML = this.recentClassrooms.map(classroom => `
            <div class="recent-classroom-item" onclick="openClassroom(${classroom.id})">
                <div class="recent-classroom-header">
                    <div class="recent-classroom-icon">${classroom.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}</div>
                    <div class="recent-classroom-name">${classroom.name}</div>
                </div>
                <div class="recent-classroom-subject">${classroom.subject}</div>
                <div class="recent-classroom-meta">
                    <span>Role: ${classroom.role}</span>
                    <span>${this.formatDate(classroom.joinedAt)}</span>
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }

    showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3'
        };
        
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
            background: ${colors[type] || '#666'};
        `;

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                messageEl.remove();
            }, 300);
        }, 3000);
    }
}

// Global function for classroom item clicks
function openClassroom(classroomId) {
    // This would typically navigate to a classroom detail page
    console.log('Opening classroom:', classroomId);
    // For now, just show a message
    const manager = new ClassroomManager();
    manager.showMessage('Classroom feature coming soon!', 'info');
}

// Initialize classroom manager
document.addEventListener('DOMContentLoaded', () => {
    new ClassroomManager();
});

// Add CSS for animations
const style = document.createElement('style');
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