// Utility Functions
const Utils = {
    // Notification system
    showNotification(title, message) {
        this.notification = {
            show: true,
            title: title,
            message: message
        };
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.notification.show = false;
        }, 3000);
        
        console.log(`📢 ${title}: ${message}`);
    },

    // Score calculation helpers
    getScoreEmoji() {
        const percentage = (this.score / this.totalQuestions) * 100;
        if (percentage >= 90) return '🏆';
        if (percentage >= 80) return '🥇';
        if (percentage >= 70) return '🥈';
        if (percentage >= 60) return '🥉';
        if (percentage >= 50) return '👍';
        return '💪';
    },

    getScoreMessage() {
        const percentage = (this.score / this.totalQuestions) * 100;
        if (percentage >= 90) return 'Exzellent!';
        if (percentage >= 80) return 'Sehr gut!';
        if (percentage >= 70) return 'Gut gemacht!';
        if (percentage >= 60) return 'Nicht schlecht!';
        if (percentage >= 50) return 'Ausbaufähig!';
        return 'Weiter üben!';
    },

    getScoreClass() {
        const percentage = (this.score / this.totalQuestions) * 100;
        if (percentage >= 80) return 'excellent';
        if (percentage >= 60) return 'good';
        return 'needs-improvement';
    },

    // Quiz submission
    async submitResults() {
        const quizResult = {
            userName: this.userName,
            category: this.categoryTitle,
            score: this.score,
            total: this.totalQuestions,
            percentage: (this.score / this.totalQuestions) * 100,
            results: this.results
        };

        try {
            this.isLoading = true;
            const response = await fetch('/api/submit-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizResult)
            });

            const data = await response.json();
            if (data.success) {
                this.showNotification('Erfolg!', 'Ergebnisse wurden gespeichert und E-Mail versendet! 📧');
            } else {
                this.showNotification('Fehler', 'Ergebnisse konnten nicht gespeichert werden');
            }
        } catch (error) {
            console.error('❌ Failed to submit results:', error);
            this.showNotification('Fehler', 'Verbindungsfehler beim Speichern');
        } finally {
            this.isLoading = false;
        }
    },

    // Download results as text file
    downloadResults() {
        const content = this.generateResultsText();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Quiz-Ergebnis-${this.userName}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Download gestartet', 'Datei wurde heruntergeladen! 💾');
    }
};