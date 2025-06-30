// Quiz Management
const QuizManager = {
    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            if (data.success) {
                console.log('📚 Categories loaded:', data.data);
            }
        } catch (error) {
            console.error('❌ Failed to load categories:', error);
        }
    },

    getCategoryIcon(categoryKey) {
        const icons = {
            'notruf': '🚨',
            'brandschutz': '🔥',
            'itsicherheit': '🔒',
            'arbeitssicherheit': '⚠️',
            'vertraulichkeit': '🔐'
        };
        return icons[categoryKey] || '📋';
    },

    async selectCategory(key, title, questionCount) {
        this.selectedCategory = key;
        this.categoryTitle = title;
        
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            if (data.success && data.data[key]) {
                this.categoryQuestions = data.data[key].questions;
                console.log(`📝 Selected category: ${title} (${questionCount} questions)`);
            }
        } catch (error) {
            console.error('❌ Failed to load category questions:', error);
            this.showNotification('Fehler', 'Kategorie konnte nicht geladen werden');
        }
    },

    async startQuiz() {
        console.log('🎯 START QUIZ CLICKED!');
        console.log('🎯 Pre-check:', {
            userName: this.userName,
            selectedCategory: this.selectedCategory,
            userNameTrimmed: this.userName.trim()
        });
        
        if (!this.userName.trim() || !this.selectedCategory) {
            console.log('❌ Quiz start prevented - missing data');
            return;
        }
        
        // Check if user is authenticated
        console.log('🎯 Calling UserManager.handleUserAuth...');
        const isAuthenticated = await UserManager.handleUserAuth.call(this);
        console.log('🎯 Authentication result:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('🎯 User not authenticated - showing auth dialog');
            return; // Wait for user authentication
        }
        
        this.isLoading = true;
        
        // Add haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        setTimeout(() => {
            this.quizStarted = true;
            this.quizCompleted = false;
            this.currentQuestion = 0;
            this.selectedAnswer = null;
            this.score = 0;
            this.results = [];
            this.isLoading = false;
            
            console.log(`🎯 Quiz started: ${this.userName} - ${this.categoryTitle}`);
            this.showNotification('Quiz gestartet!', `Viel Erfolg, ${this.userName}! 🍀`);
        }, 1500);
    },

    selectAnswer(index) {
        this.selectedAnswer = index;
        
        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        console.log(`💭 Answer selected: ${String.fromCharCode(65 + index)}`);
    },

    nextQuestion() {
        if (this.selectedAnswer === null) return;
        
        const currentQ = this.currentQuestionData;
        const isCorrect = this.selectedAnswer === currentQ.correct;
        
        if (isCorrect) {
            this.score++;
        }
        
        // Store result
        this.results.push({
            question: currentQ.question,
            selectedAnswer: currentQ.options[this.selectedAnswer],
            correctAnswer: currentQ.options[currentQ.correct],
            correct: isCorrect
        });
        
        if (this.currentQuestion < this.totalQuestions - 1) {
            this.currentQuestion++;
            this.selectedAnswer = null;
        } else {
            this.completeQuiz();
        }
    },

    completeQuiz() {
        this.quizStarted = false;
        this.quizCompleted = true;
        this.selectedAnswer = null;
        
        const percentage = Math.round((this.score / this.totalQuestions) * 100);
        console.log(`🏁 Quiz completed! Score: ${this.score}/${this.totalQuestions} (${percentage}%)`);
        
        // Add confetti effect for good results
        if (percentage >= 70) {
            this.addConfetti();
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100, 50, 100]);
            }
        }
        
        this.showNotification('Quiz beendet!', this.getScoreMessage());
    },

    resetQuiz() {
        this.quizStarted = false;
        this.quizCompleted = false;
        this.selectedCategory = null;
        this.categoryTitle = '';
        // Don't reset userName or currentUser - keep user logged in
        this.currentQuestion = 0;
        this.selectedAnswer = null;
        this.score = 0;
        this.results = [];
        this.categoryQuestions = [];
        
        console.log('🔄 Quiz reset');
        this.showNotification('Reset', 'Neues Quiz kann gestartet werden!');
    }
};