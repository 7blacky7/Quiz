// User Management for Quiz Participants
const UserManager = {
    
    // Check if user needs to register/login before starting quiz
    async handleUserAuth() {
        console.log('🔍 UserAuth check started:', {
            currentUser: this.currentUser,
            isLoggedIn: this.isLoggedIn,
            userName: this.userName
        });
        
        if (this.currentUser && this.isLoggedIn) {
            console.log('✅ User already authenticated - proceeding');
            return true; // User already authenticated
        }
        
        // Show user login/registration dialog
        console.log('🚨 SHOWING USER LOGIN DIALOG - User not authenticated');
        this.showUserLogin = true;
        console.log('📱 showUserLogin set to:', this.showUserLogin);
        return false;
    },
    
    // Register or login user
    async registerOrLoginUser() {
        if (!this.userName.trim()) {
            Utils.showNotification.call(this, '❌ Fehler', 'Bitte geben Sie einen Namen ein');
            return;
        }
        
        try {
            const payload = {
                username: this.userName.trim(),
                wantsPassword: this.wantsPassword,
                password: this.wantsPassword ? this.userPassword : ''
            };
            
            const response = await fetch('/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                // User might exist and need password
                if (data.message.includes('password required')) {
                    console.log('❗ User needs password - showing password dialog');
                    this.showPasswordDialog = true;
                    return;
                }
                throw new Error(data.message);
            }
            
            // Success - user registered/logged in
            this.currentUser = data.data;
            this.isLoggedIn = true;
            this.showUserLogin = false;
            this.showPasswordDialog = false;
            
            console.log('👤 User authenticated:', this.currentUser.username);
            Utils.showNotification.call(this, '✅ Erfolg', 
                this.currentUser.hasPassword ? 'Erfolgreich angemeldet!' : 'Willkommen! Account erstellt.');
                
        } catch (error) {
            console.error('User auth error:', error);
            Utils.showNotification.call(this, '❌ Fehler', error.message);
        }
    },
    
    // Login existing user with password
    async loginWithPassword() {
        if (!this.userName.trim() || !this.userPassword.trim()) {
            Utils.showNotification.call(this, '❌ Fehler', 'Bitte geben Sie Name und Passwort ein');
            return;
        }
        
        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.userName.trim(),
                    password: this.userPassword
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            // Success - user logged in
            this.currentUser = data.data;
            this.isLoggedIn = true;
            this.showUserLogin = false;
            this.showPasswordDialog = false;
            this.userPassword = ''; // Clear password
            
            console.log('👤 User logged in:', this.currentUser.username);
            Utils.showNotification.call(this, '✅ Erfolg', 'Erfolgreich angemeldet!');
            
        } catch (error) {
            console.error('Login error:', error);
            Utils.showNotification.call(this, '❌ Fehler', error.message);
            this.userPassword = ''; // Clear password on error
        }
    },
    
    // Close user dialogs
    closeUserDialogs() {
        this.showUserLogin = false;
        this.showPasswordDialog = false;
        this.userPassword = '';
        this.wantsPassword = false;
    },
    
    // Show password protection dialog
    showPasswordProtectionDialog() {
        console.log('🔒 SHOWING PASSWORD PROTECTION DIALOG');
        console.log('🔒 Current state before:', {
            showPasswordDialog: this.showPasswordDialog,
            showUserLogin: this.showUserLogin,
            wantsPassword: this.wantsPassword
        });
        this.showPasswordDialog = true;
        this.wantsPassword = true;
        console.log('🔒 State after setting:', {
            showPasswordDialog: this.showPasswordDialog,
            showUserLogin: this.showUserLogin,
            wantsPassword: this.wantsPassword
        });
    },
    
    // Skip password protection
    skipPasswordProtection() {
        this.wantsPassword = false;
        this.userPassword = '';
        this.registerOrLoginUser();
    },
    
    // Set password and register
    setPasswordAndRegister() {
        if (!this.userPassword.trim()) {
            Utils.showNotification.call(this, '❌ Fehler', 'Bitte geben Sie ein Passwort ein');
            return;
        }
        this.registerOrLoginUser();
    },
    
    // Logout user
    logoutUser() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.userName = '';
        this.userPassword = '';
        this.wantsPassword = false;
        this.showUserLogin = false;
        this.showPasswordDialog = false;
        
        // Reset quiz state
        this.selectedCategory = null;
        this.quizStarted = false;
        this.quizCompleted = false;
        
        Utils.showNotification.call(this, '👋 Abgemeldet', 'Sie wurden erfolgreich abgemeldet');
    }
};