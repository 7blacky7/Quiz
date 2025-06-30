// Admin Dashboard Module
function initDashboard() {
    const dashboardContent = document.getElementById('dashboard-content');
    if (!dashboardContent) return;
    
    dashboardContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <h3 x-text="stats.totalUsers || 0"></h3>
                    <p>Benutzer</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-info">
                    <h3 x-text="stats.totalQuizzes || 0"></h3>
                    <p>Quiz-Kategorien</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                    <h3 x-text="stats.totalResults || 0"></h3>
                    <p>Ergebnisse</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💾</div>
                <div class="stat-info">
                    <h3 x-text="stats.dbStatus || 'SQLite'"></h3>
                    <p>Datenbank</p>
                </div>
            </div>
        </div>
        
        <div class="content-card">
            <h3>🔥 Neueste Ergebnisse</h3>
            <div class="recent-results">
                <template x-for="result in recentResults" :key="result.id">
                    <div class="result-row">
                        <span x-text="result.userName"></span>
                        <span x-text="result.category"></span>
                        <span x-text="result.score + '/' + result.total"></span>
                        <span x-text="Math.round(result.percentage) + '%'"></span>
                        <span x-text="new Date(result.timestamp).toLocaleDateString('de-DE')"></span>
                    </div>
                </template>
            </div>
        </div>
    `;
}

document.addEventListener('alpine:init', () => {
    Alpine.effect(() => {
        const app = Alpine.$data(document.querySelector('[x-data]'));
        if (app && app.currentView === 'dashboard') {
            initDashboard();
        }
    });
});