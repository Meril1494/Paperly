class AISummarizerManager {
    constructor() {
        this.currentDocument = null;
        this.summaryHistory = this.loadHistory();
        this.init();
    }

    init() {
        this.initEventListeners();
        this.renderHistory();
    }

    initEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
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
            if (files[0] && files[0].type === 'application/pdf') {
                this.handleFileUpload(files[0]);
            }
        });

        // Summary tabs
        const summaryTabs = document.querySelectorAll('.summary-tab');
        summaryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchSummaryTab(e.target.dataset.tab);
            });
        });

        // Upload area click
        uploadArea.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
    }

    handleFileUpload(file) {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File size should be less than 10MB');
            return;
        }

        this.currentDocument = {
            name: file.name,
            size: file.size,
            uploadDate: new Date()
        };

        this.startProcessing();
    }

    startProcessing() {
        // Hide upload section
        document.getElementById('uploadSection').style.display = 'none';
        
        // Show processing section
        document.getElementById('processingSection').style.display = 'block';
        
        // Simulate processing steps
        this.simulateProcessingSteps();
    }

    simulateProcessingSteps() {
        const steps = document.querySelectorAll('.step');
        let currentStep = 0;
        
        const processStep = () => {
            if (currentStep > 0) {
                steps[currentStep - 1].classList.remove('active');
            }
            
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                currentStep++;
                setTimeout(processStep, 1500);
            } else {
                setTimeout(() => {
                    this.showResults();
                }, 1000);
            }
        };
        
        processStep();
    }

    showResults() {
        // Hide processing section
        document.getElementById('processingSection').style.display = 'none';
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        
        // Generate mock summary data
        const summaryData = this.generateMockSummary();
        
        // Populate results
        this.populateResults(summaryData);
        
        // Save to history
        this.saveToHistory(summaryData);
    }

    generateMockSummary() {
        const overviewTexts = [
            "This document presents a comprehensive analysis of quantum mechanics principles and their applications in modern physics. The paper covers fundamental concepts including wave-particle duality, quantum entanglement, and the uncertainty principle. Key findings demonstrate the practical implications of quantum theory in developing new technologies such as quantum computers and quantum cryptography systems.",
            "The research paper examines the environmental impact of renewable energy sources, focusing on solar, wind, and hydroelectric power generation. The study analyzes data from multiple countries over the past decade, revealing significant reductions in carbon emissions and improvements in energy efficiency. The document concludes with recommendations for policy makers and industry leaders.",
            "This academic paper explores the intersection of artificial intelligence and healthcare, discussing recent breakthroughs in machine learning applications for medical diagnosis and treatment. The document reviews case studies from leading medical institutions and presents statistical evidence of improved patient outcomes through AI-assisted medical procedures."
        ];

        const keyPoints = [
            "Quantum mechanics demonstrates wave-particle duality in subatomic particles",
            "Quantum entanglement enables instantaneous communication between particles",
            "The uncertainty principle fundamentally limits measurement precision",
            "Quantum computers leverage superposition for exponential processing power",
            "Quantum cryptography provides theoretically unbreakable security",
            "Practical applications include quantum sensors and quantum communication"
        ];

        const highlights = [
            "The double-slit experiment conclusively demonstrates the wave nature of electrons when unobserved",
            "Einstein's criticism of quantum mechanics led to the development of Bell's theorem",
            "Quantum decoherence explains the transition from quantum to classical behavior",
            "Schrödinger's equation describes the time evolution of quantum systems",
            "The Copenhagen interpretation remains the most widely accepted framework"
        ];

        return {
            overview: overviewTexts[Math.floor(Math.random() * overviewTexts.length)],
            keyPoints: keyPoints.slice(0, 4 + Math.floor(Math.random() * 3)),
            highlights: highlights.slice(0, 3 + Math.floor(Math.random() * 3))
        };
    }

    populateResults(summaryData) {
        // Document info
        const docInfo = document.getElementById('documentInfo');
        docInfo.innerHTML = `
            <div class="doc-icon">📄</div>
            <div class="doc-details">
                <div class="doc-name">${this.currentDocument.name}</div>
                <div class="doc-meta">
                    <span>Size: ${this.formatFileSize(this.currentDocument.size)}</span>
                    <span>Processed: ${this.formatDate(this.currentDocument.uploadDate)}</span>
                    <span>Pages: ${Math.floor(Math.random() * 20) + 5}</span>
                </div>
            </div>
        `;

        // Overview
        document.getElementById('overviewText').textContent = summaryData.overview;

        // Key points
        const keyPointsList = document.getElementById('keyPointsList');
        keyPointsList.innerHTML = summaryData.keyPoints.map(point => `
            <div class="key-point">
                <div class="key-point-icon">•</div>
                <div class="key-point-text">${point}</div>
            </div>
        `).join('');

        // Highlights
        const highlightsList = document.getElementById('highlightsList');
        highlightsList.innerHTML = summaryData.highlights.map(highlight => `
            <div class="highlight">
                <div class="highlight-text">${highlight}</div>
            </div>
        `).join('');
    }

    switchSummaryTab(tabName) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.summary-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.summary-panel').forEach(panel => panel.classList.remove('active'));

        // Add active class to clicked tab and corresponding panel
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    saveToHistory(summaryData) {
        const historyItem = {
            id: Date.now(),
            documentName: this.currentDocument.name,
            processedDate: this.currentDocument.uploadDate.toISOString(),
            summary: summaryData
        };

        this.summaryHistory.unshift(historyItem);
        
        // Keep only last 10 items
        if (this.summaryHistory.length > 10) {
            this.summaryHistory = this.summaryHistory.slice(0, 10);
        }

        localStorage.setItem('paperly_ai_history', JSON.stringify(this.summaryHistory));
        this.renderHistory();
    }

    loadHistory() {
        const saved = localStorage.getItem('paperly_ai_history');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default history items
        return [
            {
                id: 1,
                documentName: 'Research_Paper_AI.pdf',
                processedDate: new Date(Date.now() - 86400000).toISOString(),
                summary: {
                    overview: 'Previous AI research summary...',
                    keyPoints: ['AI advancement', 'Machine learning', 'Deep learning'],
                    highlights: ['Breakthrough in neural networks']
                }
            },
            {
                id: 2,
                documentName: 'Physics_Textbook_Ch3.pdf',
                processedDate: new Date(Date.now() - 172800000).toISOString(),
                summary: {
                    overview: 'Physics chapter summary...',
                    keyPoints: ['Quantum mechanics', 'Wave functions', 'Probability'],
                    highlights: ['Heisenberg uncertainty principle']
                }
            }
        ];
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.summaryHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <div class="empty-icon">📄</div>
                    <div class="empty-text">No summaries yet</div>
                    <div class="empty-subtext">Upload your first PDF to get started</div>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.summaryHistory.map(item => `
            <div class="history-item" data-history-id="${item.id}">
                <div class="history-icon">📄</div>
                <div class="history-info">
                    <div class="history-name">${item.documentName}</div>
                    <div class="history-date">${this.formatDate(new Date(item.processedDate))}</div>
                </div>
                <div class="history-actions">
                    <button class="history-action" onclick="aiManager.viewHistoryItem(${item.id})" title="View">👁️</button>
                    <button class="history-action" onclick="aiManager.deleteHistoryItem(${item.id})" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    viewHistoryItem(historyId) {
        const item = this.summaryHistory.find(h => h.id === historyId);
        if (item) {
            this.currentDocument = {
                name: item.documentName,
                size: 0,
                uploadDate: new Date(item.processedDate)
            };
            
            // Show results section
            document.getElementById('uploadSection').style.display = 'none';
            document.getElementById('processingSection').style.display = 'none';
            document.getElementById('resultsSection').style.display = 'block';
            
            // Populate with historical data
            this.populateResults(item.summary);
        }
    }

    deleteHistoryItem(historyId) {
        if (confirm('Are you sure you want to delete this summary?')) {
            this.summaryHistory = this.summaryHistory.filter(h => h.id !== historyId);
            localStorage.setItem('paperly_ai_history', JSON.stringify(this.summaryHistory));
            this.renderHistory();
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(date) {
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    downloadSummary() {
        if (!this.currentDocument) return;
        
        // Create a simple text summary
        const summaryText = `
PDF Summary: ${this.currentDocument.name}
Generated: ${this.formatDate(new Date())}

OVERVIEW:
${document.getElementById('overviewText').textContent}

KEY POINTS:
${Array.from(document.querySelectorAll('.key-point-text')).map((point, index) => `${index + 1}. ${point.textContent}`).join('\n')}

HIGHLIGHTS:
${Array.from(document.querySelectorAll('.highlight-text')).map((highlight, index) => `• ${highlight.textContent}`).join('\n')}

Generated by Paperly AI Summarizer
        `;
        
        // Create and download file
        const blob = new Blob([summaryText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentDocument.name}_summary.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('Summary downloaded successfully!', 'success');
    }

    shareSummary() {
        if (!this.currentDocument) return;
        
        // Create shareable link (mock)
        const shareText = `Check out this AI-generated summary of "${this.currentDocument.name}" created with Paperly!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'PDF Summary',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(shareText + '\n\n' + window.location.href)
                .then(() => {
                    this.showMessage('Summary link copied to clipboard!', 'success');
                })
                .catch(() => {
                    this.showMessage('Could not copy to clipboard', 'error');
                });
        }
    }

    startNew() {
        // Reset state
        this.currentDocument = null;
        
        // Show upload section
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('processingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        
        // Clear file input
        document.getElementById('fileInput').value = '';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
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
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
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

// Global functions for HTML onclick handlers
function triggerFileInput() {
    document.getElementById('fileInput').click();
}

function downloadSummary() {
    aiManager.downloadSummary();
}

function shareSummary() {
    aiManager.shareSummary();
}

function startNew() {
    aiManager.startNew();
}

// Initialize AI manager
let aiManager;
document.addEventListener('DOMContentLoaded', () => {
    aiManager = new AISummarizerManager();
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