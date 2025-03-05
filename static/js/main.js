class TypingTest {
    constructor() {
        this.displayText = document.getElementById('displayText');
        this.inputText = document.getElementById('inputText');
        this.timer = document.getElementById('timer');
        this.wpm = document.getElementById('wpm');
        this.accuracy = document.getElementById('accuracy');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileInput = document.getElementById('textFile');
        this.progressBar = document.querySelector('.progress-bar');
        this.canvasInstance = null;

        this.originalText = '';
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isPaused = false;

        this.bindEvents();
        this.initializeTooltips();
    }

    setCanvasInstance(instance) {
        this.canvasInstance = instance;
    }

    bindEvents() {
        this.uploadBtn.addEventListener('click', () => this.handleFileUpload());
        this.startBtn.addEventListener('click', () => this.startTest());
        this.pauseBtn.addEventListener('click', () => this.pauseTest());
        this.resetBtn.addEventListener('click', () => this.resetTest());
        this.inputText.addEventListener('input', () => this.checkInput());
        this.inputText.addEventListener('keydown', (e) => {
            if (this.canvasInstance && this.canvasInstance.isActive) {
                const currentPosition = this.inputText.value.length;
                const isCorrect = currentPosition < this.originalText.length && 
                                 e.key === this.originalText[currentPosition];
                
                if (e.key.length === 1) {
                    this.canvasInstance.addParticle(isCorrect);
                }
            }
        });
        
        // Add file drag and drop support
        const dropZone = document.querySelector('.file-upload-container');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-primary');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-primary');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary');
            const files = e.dataTransfer.files;
            if (files.length) {
                this.fileInput.files = files;
                this.handleFileUpload();
            }
        });
    }

    initializeTooltips() {
        const tooltips = [
            { element: this.startBtn, text: 'Start typing test' },
            { element: this.pauseBtn, text: 'Pause test' },
            { element: this.resetBtn, text: 'Reset test' },
            { element: this.uploadBtn, text: 'Upload new text file' }
        ];

        tooltips.forEach(({ element, text }) => {
            element.setAttribute('data-bs-toggle', 'tooltip');
            element.setAttribute('data-bs-placement', 'top');
            element.setAttribute('title', text);
        });

        // Initialize all tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    async handleFileUpload() {
        const file = this.fileInput.files[0];
        if (!file) {
            this.showAlert('warning', 'Please select a text file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Show upload progress
            this.progressBar.style.width = '50%';
            
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            // Complete upload
            this.progressBar.style.width = '100%';
            setTimeout(() => {
                this.progressBar.style.width = '0';
            }, 500);

            if (response.ok) {
                this.originalText = data.text;
                this.displayText.textContent = this.originalText;
                this.resetTest();
                this.startBtn.disabled = false;
                this.showAlert('success', 'File uploaded successfully!');
            } else {
                this.showAlert('error', data.error);
            }
        } catch (error) {
            this.showAlert('error', 'An error occurred while uploading the file');
            console.error('Error:', error);
        }
    }

    showAlert(icon, text) {
        Swal.fire({
            icon,
            text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    startTest() {
        if (!this.originalText) {
            this.showAlert('warning', 'Please upload a text file first');
            return;
        }

        this.inputText.disabled = false;
        this.inputText.focus();
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        if (!this.startTime) {
            this.startTime = Date.now() - this.elapsedTime;
            this.showAlert('info', 'Start typing!');
        }
        
        this.isPaused = false;
        this.updateTimer();
    }

    pauseTest() {
        this.isPaused = true;
        this.inputText.disabled = true;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timerInterval);
        this.showAlert('info', 'Paused');
    }

    resetTest() {
        Swal.fire({
            title: 'Are you sure you want to reset?',
            text: 'Current progress will be lost',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                this.performReset();
                this.showAlert('success', 'Reset successfully');
            }
        });
    }

    performReset() {
        this.isPaused = true;
        clearInterval(this.timerInterval);
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timer.textContent = '0:00';
        this.wpm.textContent = '0';
        this.accuracy.textContent = '0%';
        this.inputText.value = '';
        this.inputText.disabled = true;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.displayText.innerHTML = this.originalText;
    }

    updateTimer() {
        if (this.isPaused) return;

        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            const seconds = Math.floor(this.elapsedTime / 1000);
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            this.timer.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            
            this.calculateWPM();
        }, 1000);
    }

    calculateWPM() {
        const minutes = this.elapsedTime / (1000 * 60);
        const charCount = this.inputText.value.length;
        const wpmValue = Math.round((charCount / 5) / minutes);
        this.wpm.textContent = wpmValue;

        // Add WPM animation effect
        if (wpmValue > 0) {
            this.wpm.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                this.wpm.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
        }
    }

    checkInput() {
        const inputValue = this.inputText.value;
        let displayHtml = '';
        let correctCount = 0;

        for (let i = 0; i < this.originalText.length; i++) {
            if (i < inputValue.length) {
                if (inputValue[i] === this.originalText[i]) {
                    displayHtml += `<span class="correct">${this.originalText[i]}</span>`;
                    correctCount++;
                } else {
                    displayHtml += `<span class="incorrect">${this.originalText[i]}</span>`;
                }
            } else {
                if (i === inputValue.length) {
                    displayHtml += `<span class="current">${this.originalText[i]}</span>`;
                } else {
                    displayHtml += this.originalText[i];
                }
            }
        }

        this.displayText.innerHTML = displayHtml;
        
        // Calculate accuracy
        const accuracyValue = Math.round((correctCount / inputValue.length) * 100) || 0;
        this.accuracy.textContent = `${accuracyValue}%`;

        // If Canvas is active, add particles based on accuracy
        if (this.canvasInstance && this.canvasInstance.isActive && inputValue.length > 0) {
            const lastCharCorrect = inputValue.length > 0 && 
                                   inputValue[inputValue.length-1] === this.originalText[inputValue.length-1];
            if (lastCharCorrect) {
                this.canvasInstance.addParticle(true);
            }
        }

        // Check if completed
        if (inputValue.length === this.originalText.length) {
            this.testComplete();
        }
    }

    testComplete() {
        this.pauseTest();
        const finalWpm = this.wpm.textContent;
        const finalAccuracy = this.accuracy.textContent;
        
        // If Canvas is active, add celebration particles
        if (this.canvasInstance && this.canvasInstance.isActive) {
            for (let i = 0; i < 20; i++) {
                this.canvasInstance.addParticle(true);
            }
        }
        
        Swal.fire({
            title: 'Test completed!',
            html: `
                <div class="text-center">
                    <p class="mb-2">Final WPM: <strong>${finalWpm}</strong></p>
                    <p class="mb-2">Accuracy: <strong>${finalAccuracy}</strong></p>
                    <div class="mt-3">
                        ${this.getCompletionMessage(parseInt(finalWpm), parseInt(finalAccuracy))}
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonText: 'Awesome!'
        });
    }

    getCompletionMessage(wpm, accuracy) {
        if (wpm >= 60 && accuracy >= 95) {
            return 'Amazing! Your typing skills are very professional! 🏆';
        } else if (wpm >= 40 && accuracy >= 90) {
            return 'Great! Keep up this level! 👏';
        } else if (wpm >= 20 && accuracy >= 80) {
            return 'Good start! Keep practicing and you will get better! 💪';
        } else {
            return 'Take your time, the important thing is to keep practicing! 🎯';
        }
    }
}

// Initialize typing test
document.addEventListener('DOMContentLoaded', () => {
    const typingTest = new TypingTest();
    
    // Wait for Canvas initialization to set reference
    window.addEventListener('load', () => {
        if (window.typingCanvas) {
            typingTest.setCanvasInstance(window.typingCanvas);
        }
    });
}); 