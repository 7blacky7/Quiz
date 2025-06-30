// Admin Database Module
function initDatabase() {
    const databaseContent = document.getElementById('database-content');
    if (!databaseContent) return;
    
    databaseContent.innerHTML = `
        <div class="content-grid">
            <div class="content-card">
                <h3>🗄️ SQLite Datenbank</h3>
                <p>Lokale Datenbank für Fallback und primäre Speicherung</p>
                <div class="db-status">
                    <span class="status-indicator active"></span>
                    <span>Aktiv und funktional</span>
                </div>
            </div>
            
            <div class="content-card">
                <h3>🌐 MySQL Datenbank</h3>
                <div class="form-group">
                    <div class="form-row">
                        <input type="text" x-model="mysqlConfig.host" placeholder="Host (z.B. localhost)" class="form-input">
                        <input type="text" x-model="mysqlConfig.port" placeholder="Port (3306)" class="form-input">
                    </div>
                    <div class="form-row">
                        <input type="text" x-model="mysqlConfig.database" placeholder="Datenbankname" class="form-input">
                        <input type="text" x-model="mysqlConfig.username" placeholder="Benutzername" class="form-input">
                    </div>
                    <div class="form-group">
                        <input type="password" x-model="mysqlConfig.password" placeholder="Passwort" class="form-input">
                    </div>
                    
                    <div class="btn-group">
                        <button @click="testMySQLConnection()" class="btn-secondary" :disabled="isLoading">
                            🧪 Verbindung testen
                        </button>
                        <button @click="saveMySQLConfig()" class="btn-primary" :disabled="isLoading">
                            💾 Speichern & Verbinden
                        </button>
                    </div>
                    
                    <div class="db-status" x-show="mysqlStatus">
                        <span class="status-indicator" :class="mysqlConnected ? 'active' : 'inactive'"></span>
                        <span x-text="mysqlStatus"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

document.addEventListener('alpine:init', () => {
    Alpine.effect(() => {
        const app = Alpine.$data(document.querySelector('[x-data]'));
        if (app && app.currentView === 'database') {
            initDatabase();
        }
    });
});