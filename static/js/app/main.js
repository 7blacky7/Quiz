// Main Quiz Application
function quizApp() {
    return {
        // Inherit all state from AppState
        ...AppState,
        
        // Computed properties
        get totalQuestions() {
            return this.categoryQuestions.length;
        },
        
        get currentQuestionData() {
            return this.categoryQuestions[this.currentQuestion] || {};
        },

        // Initialization
        async init() {
            console.log('🚀 Quiz App initialized');
            
            // Ensure loading state is false initially
            this.isLoading = false;
            
            // Ensure user dialogs are closed initially
            this.showUserLogin = false;
            this.showPasswordDialog = false;
            console.log('👤 User dialogs explicitly closed:', {
                showUserLogin: this.showUserLogin,
                showPasswordDialog: this.showPasswordDialog
            });
            
            // Load setup status first
            await SetupManager.loadSetupStatus.call(this);
            
            // Check admin status
            AdminManager.checkAdminStatus.call(this);
            
            // Load quiz categories
            QuizManager.loadCategories.call(this);
            
            // Admin modal is disabled - setup is completed
            this.showAdminLogin = false;
            console.log('✅ Admin modal disabled - setup completed');
            
            // Ensure loading is definitely false after initialization
            this.isLoading = false;
            console.log('✅ App initialization complete - Loading state set to false');
        },

        // Setup Methods
        loadSetupStatus: SetupManager.loadSetupStatus,
        updateUIBasedOnSetup: SetupManager.updateUIBasedOnSetup,
        shouldShowAdminModal: SetupManager.shouldShowAdminModal,
        isSetupCompleted: SetupManager.isSetupCompleted,

        // Admin Methods  
        checkAdminStatus: AdminManager.checkAdminStatus,
        closeAdminModal: AdminManager.closeAdminModal,
        logoutAdmin: AdminManager.logoutAdmin,
        checkAdminPassword: AdminManager.checkAdminPassword,

        // Quiz Methods
        loadCategories: QuizManager.loadCategories,
        getCategoryIcon: QuizManager.getCategoryIcon,
        selectCategory: QuizManager.selectCategory,
        startQuiz: QuizManager.startQuiz,
        selectAnswer: QuizManager.selectAnswer,
        nextQuestion: QuizManager.nextQuestion,
        completeQuiz: QuizManager.completeQuiz,
        resetQuiz: QuizManager.resetQuiz,
        
        // User Methods
        handleUserAuth: UserManager.handleUserAuth,
        registerOrLoginUser: UserManager.registerOrLoginUser,
        loginWithPassword: UserManager.loginWithPassword,
        closeUserDialogs: UserManager.closeUserDialogs,
        showPasswordProtectionDialog: UserManager.showPasswordProtectionDialog,
        skipPasswordProtection: UserManager.skipPasswordProtection,
        setPasswordAndRegister: UserManager.setPasswordAndRegister,
        logoutUser: UserManager.logoutUser,

        // Utility Methods
        showNotification: Utils.showNotification,
        getScoreEmoji: Utils.getScoreEmoji,
        getScoreMessage: Utils.getScoreMessage,
        getScoreClass: Utils.getScoreClass,
        submitResults: Utils.submitResults,
        downloadResults: Utils.downloadResults,
        
        // Additional methods needed for full functionality
        generateResultsText() {
            const percentage = Math.round((this.score / this.totalQuestions) * 100);
            let content = `🎯 QUIZ-ERGEBNIS\n`;
            content += `${'='.repeat(50)}\n\n`;
            content += `👤 Teilnehmer: ${this.userName}\n`;
            content += `📚 Kategorie: ${this.categoryTitle}\n`;
            content += `📅 Datum: ${new Date().toLocaleString('de-DE')}\n`;
            content += `📊 Ergebnis: ${this.score} von ${this.totalQuestions} Fragen (${percentage}%)\n`;
            content += `${this.getScoreEmoji()} Bewertung: ${this.getScoreMessage()}\n\n`;
            
            content += `📋 DETAILLIERTE ERGEBNISSE\n`;
            content += `${'='.repeat(50)}\n\n`;
            
            this.results.forEach((result, index) => {
                content += `${index + 1}. ${result.question}\n`;
                content += `   💭 Ihre Antwort: ${result.selectedAnswer} ${result.correct ? '✅' : '❌'}\n`;
                if (!result.correct) {
                    content += `   💡 Richtige Antwort: ${result.correctAnswer}\n`;
                }
                content += `   ${'-'.repeat(40)}\n\n`;
            });
            
            content += `\n🚀 Erstellt mit Quiz-Master - Powered by Go\n`;
            content += `⏰ ${new Date().toLocaleString('de-DE')}\n`;
            
            return content;
        },

        // Confetti effect for good scores
        addConfetti() {
            const colors = ['#00D9FF', '#7B68EE', '#FF6B6B', '#51CF66', '#FFD93D'];
            const confettiContainer = document.createElement('div');
            confettiContainer.style.position = 'fixed';
            confettiContainer.style.top = '0';
            confettiContainer.style.left = '0';
            confettiContainer.style.width = '100%';
            confettiContainer.style.height = '100%';
            confettiContainer.style.pointerEvents = 'none';
            confettiContainer.style.zIndex = '9999';
            
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'absolute';
                confetti.style.width = Math.random() * 10 + 5 + 'px';
                confetti.style.height = confetti.style.width;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
                confettiContainer.appendChild(confetti);
            }
            
            // Add CSS animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes confettiFall {
                    to {
                        transform: translateY(100vh) rotate(${Math.random() * 720}deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(confettiContainer);
            
            setTimeout(() => {
                document.body.removeChild(confettiContainer);
                document.head.removeChild(style);
            }, 5000);
        }
    };
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Quiz-Master loaded successfully!');
});

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to reset quiz
    if (e.key === 'Escape') {
        const app = Alpine.data('quizApp')();
        if (app.quizStarted || app.quizCompleted) {
            app.resetQuiz();
        }
    }
    
    // Number keys for answer selection
    if (e.key >= '1' && e.key <= '4') {
        const app = Alpine.data('quizApp')();
        if (app.quizStarted && !app.quizCompleted) {
            const answerIndex = parseInt(e.key) - 1;
            if (answerIndex < app.currentQuestionData.options?.length) {
                app.selectAnswer(answerIndex);
            }
        }
    }
    
    // Enter to proceed
    if (e.key === 'Enter') {
        const app = Alpine.data('quizApp')();
        if (app.quizStarted && app.selectedAnswer !== null) {
            app.nextQuestion();
        }
    }
});

// Performance monitoring
window.addEventListener('load', function() {
    console.log('⚡ Page loaded in', performance.now().toFixed(2), 'ms');
});