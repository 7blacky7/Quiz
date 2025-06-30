// Admin Users Module
function initUsers() {
    const usersContent = document.getElementById('users-content');
    if (!usersContent) return;
    
    usersContent.innerHTML = `
        <div class="content-card">
            <div class="btn-group" style="margin-bottom: 1.5rem;">
                <button @click="showAddUser = true" class="btn-primary">+ Admin hinzufügen</button>
            </div>
            
            <div class="data-table">
                <div class="table-header" style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr 150px; padding: 1rem;">
                    <span>Benutzername</span>
                    <span>Typ</span>
                    <span>E-Mail</span>
                    <span>Passwort</span>
                    <span>Erstellt</span>
                    <span>Aktionen</span>
                </div>
                <template x-for="user in users" :key="user.id">
                    <div class="table-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr 150px; padding: 1rem;">
                        <span x-text="user.username"></span>
                        <span class="status-indicator" :class="user.isAdmin ? 'status-active' : 'status-inactive'">
                            <span x-text="user.isAdmin ? '👑 Admin' : '👤 Teilnehmer'"></span>
                        </span>
                        <span x-text="user.email || 'Keine E-Mail'"></span>
                        <span x-text="user.hasPassword ? '🔒 Ja' : '⚡ Nein'"></span>
                        <span x-text="new Date(user.created).toLocaleDateString('de-DE')"></span>
                        <div class="btn-group">
                            <button @click="changePassword(user.username)" class="btn-secondary" 
                                    x-show="user.isAdmin" style="padding: 0.5rem;">🔑</button>
                            <button @click="deleteUser(user.username)" class="btn-secondary" 
                                    x-show="user.username !== 'admin'" style="padding: 0.5rem;">🗑️</button>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        
        <!-- Add User Modal -->
        <div x-show="showAddUser" class="modal-overlay" @click.self="showAddUser = false">
            <div class="modal-content">
                <h3>👤 Neuen Admin hinzufügen</h3>
                <div class="form-group">
                    <input type="text" x-model="newUser.username" placeholder="Benutzername" class="form-input">
                    <input type="email" x-model="newUser.email" placeholder="E-Mail (optional)" class="form-input">
                    <input type="password" x-model="newUser.password" placeholder="Passwort" class="form-input">
                </div>
                <div class="btn-group">
                    <button @click="createUser()" class="btn-primary">✅ Erstellen</button>
                    <button @click="showAddUser = false" class="btn-secondary">❌ Abbrechen</button>
                </div>
            </div>
        </div>
    `;
}

// Make functions available globally for Alpine
window.changePassword = async function(username) {
    const app = Alpine.$data(document.querySelector('[x-data]'));
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
            app.showNotification('Erfolg!', 'Passwort geändert!');
        } else {
            app.showNotification('Fehler', data.message);
        }
    } catch (error) {
        app.showNotification('Fehler', 'Passwort konnte nicht geändert werden');
    }
};

window.deleteUser = async function(username) {
    const app = Alpine.$data(document.querySelector('[x-data]'));
    if (!confirm(`Benutzer "${username}" wirklich löschen?`)) return;
    
    try {
        const response = await fetch(`/api/admin/users/${username}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (data.success) {
            app.showNotification('Erfolg!', 'Benutzer gelöscht!');
            app.loadData();
        } else {
            app.showNotification('Fehler', data.message);
        }
    } catch (error) {
        app.showNotification('Fehler', 'Löschen fehlgeschlagen');
    }
};

window.createUser = async function() {
    const app = Alpine.$data(document.querySelector('[x-data]'));
    if (!app.newUser.username || !app.newUser.password) {
        app.showNotification('Fehler', 'Benutzername und Passwort sind erforderlich');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(app.newUser)
        });
        
        const data = await response.json();
        if (data.success) {
            app.showNotification('Erfolg!', 'Benutzer erstellt!');
            app.showAddUser = false;
            app.newUser = { username: '', email: '', password: '' };
            app.loadData();
        } else {
            app.showNotification('Fehler', data.message);
        }
    } catch (error) {
        app.showNotification('Fehler', 'Benutzer konnte nicht erstellt werden');
    }
};

document.addEventListener('alpine:init', () => {
    Alpine.effect(() => {
        const app = Alpine.$data(document.querySelector('[x-data]'));
        if (app && app.currentView === 'users') {
            initUsers();
        }
    });
});