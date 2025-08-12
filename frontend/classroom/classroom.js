class ClassroomManager {
    constructor() {
        this.recentClassrooms = this.loadRecentClassrooms();
        this.currentClassroom = null;
        this.resources = this.loadResources();
        this.init();
    }

    init() {
        this.initEventListeners();
        this.renderRecentClassrooms();
        this.initResourceUpload();
    }

    initEventListeners() {
        document.getElementById("createForm").addEventListener("submit", (e) => {
            this.handleCreateClassroom(e);
        });

        document.getElementById("joinForm").addEventListener("submit", (e) => {
            this.handleJoinClassroom(e);
        });

        // Classroom tabs
        const classroomTabs = document.querySelectorAll('.classroom-tab');
        classroomTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchClassroomTab(e.target.dataset.tab);
            });
        });

        // Resource upload form
       document.addEventListener('DOMContentLoaded', () => {
    const resourceForm = document.getElementById('resourceUploadForm');

    if (resourceForm) {
        resourceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const manager = new ClassroomManager(); // ✅ create instance
            manager.handleResourceUpload(e);        // ✅ call instance method
        });

    } else {
        console.error('resourceUploadForm not found in DOM.');
    }
});

        document.getElementById('deleteClassroomBtn').addEventListener('click', () => {
            this.deleteCurrentClassroom();
        });
    }

    initResourceUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('resourceFile');

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                this.updateFileDisplay(files);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.updateFileDisplay(e.target.files);
            }
        });
    }

    updateFileDisplay(files) {
        const uploadContent = document.querySelector('.upload-content');
        const fileList = Array.from(files).map(file => file.name).join(', ');
        
        uploadContent.innerHTML = `
            <div class="upload-icon">📁</div>
            <h4>Files Selected</h4>
            <p>${fileList}</p>
        `;
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
            const res = await fetch("http://localhost:5002/api/classrooms/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
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
                    id: data.classroom?._id || Date.now(),
                    name: className,
                    subject: classSubject,
                    role: 'teacher',
                    joinedAt: new Date().toISOString(),
                    code: data.classroom?.code
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
            const res = await fetch("http://localhost:5002/api/classrooms/join", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
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
                    id: data.classroom?._id || Date.now(),
                    name: data.classroom?.name || `Classroom ${joinCode}`,
                    subject: data.classroom?.subject || 'General',
                    role: 'student',
                    joinedAt: new Date().toISOString(),
                    code: data.classroom?.code
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

    async handleResourceUpload(e) {
        const fileInput = document.getElementById('resourceFile');
        const title = document.getElementById('resourceTitle').value.trim();
        const description = document.getElementById('resourceDescription').value.trim();

        if (!fileInput.files.length || !title) {
            this.showMessage('Please select files and enter a title', 'error');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading-spinner"></div>Uploading...';
        submitBtn.disabled = true;

        try {
            // Simulate file upload (in real app, would upload to server)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Add resources to local storage
            Array.from(fileInput.files).forEach(file => {
                const resource = {
                    id: Date.now() + Math.random(),
                    title: title,
                    description: description,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type || this.getFileType(file.name),
                    uploadDate: new Date().toISOString(),
                    classroomId: this.currentClassroom?.id || 1
                };
                this.resources.push(resource);
            });

            this.saveResources();
            this.renderResources();
            
            // Reset form
            document.getElementById('resourceUploadForm').reset();
            this.resetUploadArea();
            
            this.showMessage('Resources uploaded successfully!', 'success');
        } catch (err) {
            console.error('Upload error:', err);
            this.showMessage('Error uploading resources', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    resetUploadArea() {
        const uploadContent = document.querySelector('.upload-content');
        uploadContent.innerHTML = `
            <div class="upload-icon">📁</div>
            <h4>Drop files here or click to browse</h4>
            <p>Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT</p>
        `;
    }

    getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const types = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            txt: 'text/plain'
        };
        return types[extension] || 'application/octet-stream';
    }

    loadResources() {
        const saved = localStorage.getItem('paperly_classroom_resources');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default resources for demo
        return [
            {
                id: 1,
                title: 'Physics Chapter 1 Notes',
                description: 'Introduction to mechanics and motion',
                fileName: 'physics_ch1.pdf',
                fileSize: 2048576,
                fileType: 'application/pdf',
                uploadDate: new Date(Date.now() - 86400000).toISOString(),
                classroomId: 1
            },
            {
                id: 2,
                title: 'Math Assignment Template',
                description: 'Template for homework submissions',
                fileName: 'math_template.docx',
                fileSize: 1024000,
                fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                uploadDate: new Date(Date.now() - 172800000).toISOString(),
                classroomId: 1
            }
        ];
    }

    saveResources() {
        localStorage.setItem('paperly_classroom_resources', JSON.stringify(this.resources));
    }

    renderResources() {
        const grid = document.getElementById('resourcesGrid');
        const classroomResources = this.resources.filter(r => 
            r.classroomId === (this.currentClassroom?.id || 1)
        );
        
        if (classroomResources.length === 0) {
            grid.innerHTML = `
                <div class="empty-resources">
                    <div class="empty-icon">📁</div>
                    <div>No resources uploaded yet</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = classroomResources.map(resource => `
            <div class="resource-item">
                <div class="resource-header">
                    <div class="resource-icon">${this.getFileIcon(resource.fileType)}</div>
                    <div class="resource-info">
                        <div class="resource-title">${resource.title}</div>
                        <div class="resource-meta">
                            ${this.formatFileSize(resource.fileSize)} • ${this.formatDate(resource.uploadDate)}
                        </div>
                    </div>
                </div>
                ${resource.description ? `<div class="resource-description">${resource.description}</div>` : ''}
                <div class="resource-actions">
                    <a href="#" class="resource-btn primary" onclick="downloadResource(${resource.id})">
                        📥 Download
                    </a>
                    <button class="resource-btn" onclick="deleteResource(${resource.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    getFileIcon(fileType) {
        const icons = {
            'application/pdf': '📄',
            'application/msword': '📝',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
            'application/vnd.ms-powerpoint': '📊',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
            'application/vnd.ms-excel': '📈',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📈',
            'text/plain': '📄'
        };
        return icons[fileType] || '📁';
    }

    switchClassroomTab(tabName) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.classroom-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        // Add active class to clicked tab and corresponding panel
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        // Load content based on tab
        if (tabName === 'resources') {
            this.renderResources();
        } else if (tabName === 'members') {
            this.renderMembers();
        }
    }

    renderMembers() {
        const membersList = document.getElementById('membersList');
        const mockMembers = [
            { name: 'John Doe', role: 'Teacher', avatar: 'JD' },
            { name: 'Alice Johnson', role: 'Student', avatar: 'AJ' },
            { name: 'Bob Smith', role: 'Student', avatar: 'BS' },
            { name: 'Carol Davis', role: 'Student', avatar: 'CD' }
        ];

        membersList.innerHTML = mockMembers.map(member => `
            <div class="member-item">
                <div class="member-avatar">${member.avatar}</div>
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-role">${member.role}</div>
                </div>
            </div>
        `).join('');
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
                joinedAt: new Date(Date.now() - 86400000).toISOString(),
                code: 'ABC123'
            },
            {
                id: 2,
                name: 'Mathematics 101',
                subject: 'Mathematics',
                role: 'teacher',
                joinedAt: new Date(Date.now() - 172800000).toISOString(),
                code: 'XYZ789'
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

        container.innerHTML = this.recentClassrooms.map(classroom => {
            const classId = classroom._id || classroom.id;
            return `
            <div class="recent-classroom-item" onclick="openClassroomView('${classId}')">
                <div class="recent-classroom-header">
                    <div class="recent-classroom-icon">${classroom.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}</div>
                    <div class="recent-classroom-name">${classroom.name}</div>
                </div>
                <div class="recent-classroom-subject">${classroom.subject}</div>
                <div class="recent-classroom-meta">
                    <span>Role: ${classroom.role}</span>
                    <span>${this.formatDate(classroom.joinedAt)}</span>
                </div>
            </div>`;
        }).join('');
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

    openClassroomView(classroomId) {
        const classroom = this.recentClassrooms.find(c => (c._id || c.id).toString() === classroomId.toString());
        if (classroom) {
            this.currentClassroom = classroom;
            
            // Populate classroom info
            document.getElementById('classroomTitle').textContent = classroom.name;
            document.getElementById('classroomSubject').textContent = classroom.subject;
            document.getElementById('classroomMemberCount').textContent = '4 members';
            document.getElementById('classroomRole').textContent = classroom.role;
            document.getElementById('classroomCode').textContent = classroom.code || '-';
            const deleteBtn = document.getElementById('deleteClassroomBtn');
            deleteBtn.textContent = classroom.role === 'teacher' ? 'Delete Classroom' : 'Leave Classroom';

            // Show modal
            document.getElementById('classroomViewModal').classList.add('active');

            // Load default tab content
            this.renderResources();
        }
    }

    closeClassroomView() {
        document.getElementById('classroomViewModal').classList.remove('active');
        this.currentClassroom = null;
    }

    async deleteCurrentClassroom() {
        if (!this.currentClassroom) return;
        const classroomId = this.currentClassroom._id || this.currentClassroom.id;
        const isTeacher = this.currentClassroom.role === 'teacher';
        if (!confirm(isTeacher ? 'Delete this classroom?' : 'Leave this classroom?')) return;
        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:5002/api/classrooms/${classroomId}`;
            const options = {
                method: isTeacher ? 'DELETE' : 'POST',
                headers: { 'Authorization': token }
            };
            if (!isTeacher) options.headers['Content-Type'] = 'application/json';
            const endpoint = isTeacher ? url : `${url}/leave`;
            const res = await fetch(endpoint, options);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Operation failed');
            this.recentClassrooms = this.recentClassrooms.filter(c => (c._id || c.id).toString() !== classroomId.toString());
            this.saveRecentClassrooms();
            this.closeClassroomView();
            this.renderRecentClassrooms();
            this.showMessage(isTeacher ? 'Classroom deleted' : 'Left classroom', 'success');
        } catch (err) {
            alert(err.message);
        }
    }
}

// Global functions for HTML onclick handlers
function openClassroomView(classroomId) {
    classroomManager.openClassroomView(classroomId);
}

function closeClassroomView() {
    classroomManager.closeClassroomView();
}

function downloadResource(resourceId) {
    const resource = classroomManager.resources.find(r => r.id === resourceId);
    if (resource) {
        // In a real app, this would download the actual file
        classroomManager.showMessage(`Downloading ${resource.fileName}...`, 'info');
        
        // Simulate download
        const link = document.createElement('a');
        link.href = '#';
        link.download = resource.fileName;
        link.click();
    }
}

function deleteResource(resourceId) {
    if (confirm('Are you sure you want to delete this resource?')) {
        classroomManager.resources = classroomManager.resources.filter(r => r.id !== resourceId);
        classroomManager.saveResources();
        classroomManager.renderResources();
        classroomManager.showMessage('Resource deleted successfully!', 'success');
    }
}

// Initialize classroom manager
let classroomManager;
document.addEventListener('DOMContentLoaded', () => {
    classroomManager = new ClassroomManager();
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeClassroomView();
    }
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