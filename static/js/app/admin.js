// Admin Management
const AdminManager = {
    // Check if user is already logged in as admin
    checkAdminStatus() {
        // Check if we're on admin page
        if (window.location.pathname === '/admin') {
            this.isAdmin = true;
            return;
        }
        
        // Check localStorage for admin session
        const adminSession = localStorage.getItem('adminLoggedIn');
        if (adminSession === 'true') {
            this.isAdmin = true;
            console.log('👤 Admin session found, user is logged in');
        } else {
            this.isAdmin = false;
            console.log('👤 No admin session found');
        }
    },

    // Admin Methods
    closeAdminModal() {
        this.showAdminLogin = false;
        this.adminUsername = '';
        this.adminPassword = '';
        this.adminError = '';
        console.log('❌ Admin modal closed');
    },

    logoutAdmin() {
        this.isAdmin = false;
        localStorage.removeItem('adminLoggedIn');
        this.showNotification('Abgemeldet', 'Sie wurden erfolgreich abgemeldet');
    },

    async checkAdminPassword() {
        if (!this.adminUsername.trim() || !this.adminPassword.trim()) {
            this.adminError = 'Bitte Benutzername und Passwort eingeben';
            return;
        }
        
        try {
            this.isLoading = true;
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: this.adminUsername,
                    password: this.adminPassword 
                })
            });
            
            const data = await response.json();
            if (data.success) {
                this.isAdmin = true;
                this.adminError = '';
                this.closeAdminModal();
                localStorage.setItem('adminLoggedIn', 'true');
                
                // Reload setup status after successful login
                await this.loadSetupStatus();
                
                this.showNotification('Anmeldung erfolgreich', 'Weiterleitung zum Admin-Panel... 🔑');
                
                // Redirect to admin panel
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1000);
            } else {
                this.adminError = data.message || 'Falsche Anmeldedaten';
            }
        } catch (error) {
            this.adminError = 'Verbindungsfehler';
        } finally {
            this.isLoading = false;
        }
    }
};