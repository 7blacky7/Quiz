// Admin Panel Main App
function adminPanelApp() {
    return {
        currentView: 'dashboard',
        notification: {
            show: false,
            title: '',
            message: ''
        },
        stats: {},
        recentResults: [],
        users: [],
        mysqlConfig: {
            host: '',
            port: '3306',
            database: '',
            username: '',
            password: ''
        },
        mysqlStatus: '',
        mysqlConnected: false,
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
        quizCategories: {},
        isLoading: false,
        showAddUser: false,
        newUser: {
            username: '',
            email: '',
            password: ''
        },
        uploadType: 'csv',
        showUploadModal: false,
        uploadPreview: false,
        previewData: {},
        
        init() {
            this.loadData();
            
            // Watch for view changes
            this.$watch('currentView', (value) => {
                console.log('🔀 View changed to:', value);
                this.initializeView(value);
            });
        },
        
        async loadData() {
            try {
                // Load stats
                const statsResponse = await fetch('/api/admin/stats');
                const statsData = await statsResponse.json();
                if (statsData.success) {
                    this.stats = statsData.data;
                    this.recentResults = statsData.data.recentResults || [];
                }
                
                // Load users
                const usersResponse = await fetch('/api/admin/users');
                const usersData = await usersResponse.json();
                if (usersData.success) {
                    this.users = usersData.data;
                }
                
                // Load quiz categories
                const categoriesResponse = await fetch('/api/categories');
                const categoriesData = await categoriesResponse.json();
                if (categoriesData.success) {
                    this.quizCategories = categoriesData.data;
                }
                
                // Load settings
                const settingsResponse = await fetch('/api/admin/settings');
                const settingsData = await settingsResponse.json();
                if (settingsData.success) {
                    Object.assign(this.emailSettings, settingsData.data.email || {});
                    Object.assign(this.mysqlConfig, settingsData.data.mysql || {});
                }
            } catch (error) {
                console.error('❌ Failed to load data:', error);
            }
        },
        
        initializeView(view) {
            // Let the specific module initialize its content
            switch(view) {
                case 'dashboard':
                    setTimeout(() => initDashboard(), 100);
                    break;
                case 'database':
                    setTimeout(() => initDatabase(), 100);
                    break;
                case 'users':
                    setTimeout(() => initUsers(), 100);
                    break;
                case 'email':
                    setTimeout(() => initEmail(), 100);
                    break;
                case 'quiz':
                    setTimeout(() => initQuiz(), 100);
                    break;
            }
        },
        
        showNotification(title, message) {
            this.notification = { show: true, title, message };
            setTimeout(() => {
                this.notification.show = false;
            }, 4000);
        },
        
        logout() {
            if (confirm('Möchten Sie sich wirklich abmelden?')) {
                localStorage.removeItem('adminLoggedIn');
                window.location.href = '/';
            }
        }
    }
}