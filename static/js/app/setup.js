// Setup Management
const SetupManager = {
    // Load setup status from server
    async loadSetupStatus() {
        try {
            const response = await fetch('/api/setup-status');
            const data = await response.json();
            if (data.success) {
                this.setupStatus = data.data;
                console.log('🔧 Setup status loaded:', this.setupStatus);
                
                // Update UI based on setup status
                this.updateUIBasedOnSetup();
                
                return true;
            } else {
                console.error('❌ Failed to load setup status:', data.message);
                return false;
            }
        } catch (error) {
            console.error('❌ Setup status request failed:', error);
            // Fallback to initial setup mode if we can't reach the server
            this.setupStatus.isInitialSetup = true;
            return false;
        }
    },

    // Update UI based on setup status
    updateUIBasedOnSetup() {
        // Force hide modal if setup is completed
        if (!this.setupStatus.isInitialSetup || this.setupStatus.setupCompleted) {
            this.showAdminLogin = false;
            console.log('✅ Setup completed - permanently hiding admin modal');
            return;
        }

        // Only allow modal for initial setup and if not already admin
        if (this.setupStatus.isInitialSetup && !this.isAdmin) {
            console.log('🔧 Initial setup mode - modal available for manual trigger');
        }
    },

    // Check if admin modal should be shown (strict check)
    shouldShowAdminModal() {
        return this.setupStatus.isInitialSetup && 
               !this.setupStatus.setupCompleted && 
               !this.isAdmin;
    },

    // Check if setup is truly completed
    isSetupCompleted() {
        return this.setupStatus.setupCompleted && !this.setupStatus.isInitialSetup;
    }
};