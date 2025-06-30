// App State Management
const AppState = {
    // App State
    isLoading: false,
    quizStarted: false,
    quizCompleted: false,
    showAdminLogin: false,
    
    // Quiz Data
    selectedCategory: null,
    categoryTitle: '',
    categoryQuestions: [],
    userName: '',
    currentQuestion: 0,
    selectedAnswer: null,
    score: 0,
    results: [],
    
    // User Authentication
    currentUser: null,
    isLoggedIn: false,
    showUserLogin: false,
    showPasswordDialog: false,
    userPassword: '',
    wantsPassword: false,
    
    // Admin State
    isAdmin: false,
    adminUsername: '',
    adminPassword: '',
    adminError: '',
    adminToken: null,
    
    // Setup State
    setupStatus: {
        isInitialSetup: true,
        setupCompleted: false,
        hasDefaultAdmin: true,
        adminCount: 0
    },
    
    // Settings
    settings: {
        email_recipient: '',
        graph_client_id: '',
        graph_client_secret: '',
        graph_tenant_id: '',
        graph_service_endpoint: 'https://graph.microsoft.com/v1.0',
        smtp_server: 'smtp.gmail.com',
        smtp_port: '587',
        smtp_username: '',
        smtp_password: '',
        admin_password: ''
    },
    
    // Notification
    notification: {
        show: false,
        title: '',
        message: ''
    }
};