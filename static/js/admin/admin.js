function adminApp() {
    return {
        // State
        currentView: 'dashboard',
        isLoading: false,
        currentUser: 'admin',
        
        // Data
        stats: {},
        recentResults: [],
        users: [],
        quizCategories: {},
        
        // Settings
        mysqlConfig: {
            host: '',
            port: '3306',
            database: '',
            username: '',
            password: ''
        },
        emailSettings: {
            graphClientId: '',
            graphClientSecret: '',
            graphTenantId: '',
            emailRecipient: '',
            smtpServer: 'smtp.gmail.com',
            smtpPort: '587',
            smtpUsername: '',
            smtpPassword: ''
        },
        
        // UI State
        showAddUser: false,
        showUploadModal: false,
        uploadType: 'csv',
        uploadPreview: false,
        previewData: {},
        mysqlStatus: '',
        mysqlConnected: false,
        
        // New User
        newUser: {
            username: '',
            email: '',
            password: ''
        },
        
        // Notification
        notification: {
            show: false,
            title: '',
            message: ''
        },
        
        // Computed properties
        get adminCount() {
            return this.users.filter(user => user.isAdmin).length;
        },
        
        // Initialization
        init() {
            this.loadDashboardData();
            this.loadUsers();
            this.loadQuizCategories();
            this.loadSettings();
        },
        
        async loadDashboardData() {
            try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                if (data.success) {
                    this.stats = data.data;
                    this.recentResults = data.data.recentResults || [];
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        },
        
        async loadUsers() {
            try {
                const response = await fetch('/api/admin/users');
                const data = await response.json();
                if (data.success) {
                    this.users = data.data;
                }
            } catch (error) {
                console.error('Failed to load users:', error);
            }
        },
        
        async loadQuizCategories() {
            try {
                const response = await fetch('/api/categories');
                const data = await response.json();
                if (data.success) {
                    this.quizCategories = data.data;
                }
            } catch (error) {
                console.error('Failed to load quiz categories:', error);
            }
        },
        
        async loadSettings() {
            try {
                const response = await fetch('/api/admin/settings');
                const data = await response.json();
                if (data.success) {
                    Object.assign(this.emailSettings, data.data.email || {});
                    Object.assign(this.mysqlConfig, data.data.mysql || {});
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        },
        
        // MySQL Methods
        async testMySQLConnection() {
            try {
                this.isLoading = true;
                const response = await fetch('/api/admin/test-mysql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.mysqlConfig)
                });
                
                const data = await response.json();
                this.mysqlStatus = data.message;
                this.mysqlConnected = data.success;
                
                if (data.success) {
                    this.showNotification('Erfolg!', 'MySQL-Verbindung erfolgreich!');
                } else {
                    this.showNotification('Fehler', data.message);
                }
            } catch (error) {
                this.mysqlStatus = 'Verbindungsfehler: ' + error.message;
                this.mysqlConnected = false;
                this.showNotification('Fehler', 'Verbindungsfehler');
            } finally {
                this.isLoading = false;
            }
        },
        
        async saveMySQLConfig() {
            try {
                this.isLoading = true;
                const response = await fetch('/api/admin/mysql-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.mysqlConfig)
                });
                
                const data = await response.json();
                if (data.success) {
                    this.mysqlConnected = true;
                    this.mysqlStatus = 'Verbunden und aktiv';
                    this.showNotification('Erfolg!', 'MySQL-Konfiguration gespeichert!');
                } else {
                    this.showNotification('Fehler', data.message);
                }
            } catch (error) {
                this.showNotification('Fehler', 'Speichern fehlgeschlagen');
            } finally {
                this.isLoading = false;
            }
        },
        
        // User Management
        async createUser() {
            if (!this.newUser.username || !this.newUser.password) {
                this.showNotification('Fehler', 'Benutzername und Passwort sind erforderlich');
                return;
            }
            
            try {
                this.isLoading = true;
                const response = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.newUser)
                });
                
                const data = await response.json();
                if (data.success) {
                    this.showNotification('Erfolg!', 'Benutzer erstellt!');
                    this.showAddUser = false;
                    this.newUser = { username: '', email: '', password: '' };
                    this.loadUsers();
                } else {
                    this.showNotification('Fehler', data.message);
                }
            } catch (error) {
                this.showNotification('Fehler', 'Benutzer konnte nicht erstellt werden');
            } finally {
                this.isLoading = false;
            }
        },
        
        async deleteUser(username) {
            if (!confirm(`Benutzer "${username}" wirklich löschen?`)) return;
            
            try {
                const response = await fetch(`/api/admin/users/${username}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                if (data.success) {
                    this.showNotification('Erfolg!', 'Benutzer gelöscht!');
                    this.loadUsers();
                } else {
                    this.showNotification('Fehler', data.message);
                }
            } catch (error) {
                this.showNotification('Fehler', 'Löschen fehlgeschlagen');
            }
        },
        
        async changePassword(username) {
            const newPassword = prompt(`Neues Passwort für "${username}":`);
            if (!newPassword) return;
            
            try {
                const response = await fetch('/api/admin/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password: newPassword })
                });
                
                const data = await response.json();
                if (data.success) {
                    this.showNotification('Erfolg!', 'Passwort geändert!');
                } else {
                    this.showNotification('Fehler', data.message);
                }
            } catch (error) {
                this.showNotification('Fehler', 'Passwort konnte nicht geändert werden');
            }
        },
        
        // Email Methods
        async testEmailConnection(type) {
            try {
                this.isLoading = true;
                const response = await fetch('/api/admin/test-connection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, settings: this.emailSettings })
                });
                
                const data = await response.json();
                if (data.success) {
                    this.showNotification('Erfolg!', `${type.toUpperCase()} Verbindung erfolgreich!`);
                } else {
                    this.showNotification('Fehler', data.message);
                }
            } catch (error) {
                this.showNotification('Fehler', 'Verbindungstest fehlgeschlagen');
            } finally {
                this.isLoading = false;
            }
        },
        
        async saveEmailSettings() {
            try {
                this.isLoading = true;
                const response = await fetch('/api/admin/email-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.emailSettings)
                });
                
                const data = await response.json();
                if (data.success) {
                    this.showNotification('Erfolg!', 'E-Mail-Einstellungen gespeichert!');
                } else {
                    this.showNotification('Fehler', data.message);
                }
            } catch (error) {
                this.showNotification('Fehler', 'Speichern fehlgeschlagen');
            } finally {
                this.isLoading = false;
            }
        },
        
        // Quiz Management
        async toggleCategory(key) {
            try {
                const response = await fetch(`/api/admin/categories/${key}/toggle`, {
                    method: 'POST'
                });
                
                const data = await response.json();
                if (data.success) {
                    this.loadQuizCategories();
                    this.showNotification('Erfolg!', 'Kategorie-Status geändert!');
                } else {
                    this.showNotification('Fehler', data.message);
                }
            } catch (error) {
                this.showNotification('Fehler', 'Status konnte nicht geändert werden');
            }
        },
        
        async deleteCategory(key) {
            if (!confirm(`Kategorie "${this.quizCategories[key]?.title}" wirklich löschen?`)) return;
            
            try {
                const response = await fetch(`/api/admin/categories/${key}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                if (data.success) {
                    this.loadQuizCategories();
                    this.showNotification('Erfolg!', 'Kategorie gelöscht!');
                } else {
                    this.showNotification('Fehler', data.message);
                }
            } catch (error) {
                this.showNotification('Fehler', 'Löschen fehlgeschlagen');
            }
        },
        
        // File Upload
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    if (this.uploadType === 'csv') {
                        this.parseCSV(e.target.result, file.name);
                    } else {
                        this.parseExcel(e.target.result, file.name);
                    }
                } catch (error) {
                    this.showNotification('Fehler', 'Datei konnte nicht gelesen werden');
                }
            };
            
            if (this.uploadType === 'csv') {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        },
        
        parseCSV(content, filename) {
            const lines = content.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                this.showNotification('Fehler', 'CSV-Datei muss mindestens Header und eine Frage enthalten');
                return;
            }
            
            // Extract category name from filename
            const categoryName = filename.replace('.csv', '').replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '');
            
            const questions = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = this.parseCSVLine(lines[i]);
                if (cols.length >= 6) {
                    const correctAnswerLetter = cols[5].trim().toUpperCase();
                    const correctIndex = correctAnswerLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
                    
                    if (correctIndex >= 0 && correctIndex < 4) {
                        questions.push({
                            question: cols[0].trim(),
                            options: [cols[1].trim(), cols[2].trim(), cols[3].trim(), cols[4].trim()],
                            correct: correctIndex
                        });
                    }
                }
            }
            
            this.previewData = {
                category: categoryName,
                questions: questions
            };
            this.uploadPreview = true;
        },
        
        parseCSVLine(line) {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            
            result.push(current);
            return result;
        },
        
        parseExcel(content, filename) {
            // For now, show a placeholder - full Excel parsing would require additional libraries
            this.showNotification('Info', 'Excel-Upload wird in der nächsten Version unterstützt');
        },
        
        async saveUploadedQuiz() {
            try {
                this.isLoading = true;
                const response = await fetch('/api/admin/upload-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.previewData)
                });
                
                const data = await response.json();
                if (data.success) {
                    this.showNotification('Erfolg!', 'Quiz-Kategorie gespeichert!');
                    this.cancelUpload();
                    this.loadQuizCategories();
                } else {
                    this.showNotification('Fehler', data.message);
                }
            } catch (error) {
                this.showNotification('Fehler', 'Quiz konnte nicht gespeichert werden');
            } finally {
                this.isLoading = false;
            }
        },
        
        cancelUpload() {
            this.showUploadModal = false;
            this.uploadPreview = false;
            this.previewData = {};
            document.getElementById('fileInput').value = '';
        },
        
        // Utilities
        showNotification(title, message) {
            this.notification = { show: true, title, message };
            setTimeout(() => {
                this.notification.show = false;
            }, 4000);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Admin Panel loaded successfully!');
});