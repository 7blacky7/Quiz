// Admin Email Module
function initEmail() {
    const emailContent = document.getElementById('email-content');
    if (!emailContent) return;
    
    emailContent.innerHTML = `
        <div class="content-grid">
            <div class="content-card">
                <h3>🔗 Microsoft Graph API</h3>
                <div class="form-group">
                    <div class="form-row">
                        <input type="text" x-model="emailSettings.graphClientId" placeholder="Client ID" class="form-input">
                        <input type="password" x-model="emailSettings.graphClientSecret" placeholder="Client Secret" class="form-input">
                    </div>
                    <div class="form-row">
                        <input type="text" x-model="emailSettings.graphTenantId" placeholder="Tenant ID" class="form-input">
                        <input type="email" x-model="emailSettings.emailRecipient" placeholder="Empfänger E-Mail" class="form-input">
                    </div>
                    <button @click="testEmailConnection('graph')" class="btn-primary">🧪 Microsoft Graph testen</button>
                </div>
            </div>
            
            <div class="content-card">
                <h3>📮 SMTP Fallback</h3>
                <div class="form-group">
                    <div class="form-row">
                        <input type="text" x-model="emailSettings.smtpServer" placeholder="SMTP Server" class="form-input">
                        <input type="text" x-model="emailSettings.smtpPort" placeholder="Port" class="form-input">
                    </div>
                    <div class="form-row">
                        <input type="text" x-model="emailSettings.smtpUsername" placeholder="Benutzername" class="form-input">
                        <input type="password" x-model="emailSettings.smtpPassword" placeholder="Passwort" class="form-input">
                    </div>
                    <button @click="testEmailConnection('smtp')" class="btn-secondary">🧪 SMTP testen</button>
                </div>
            </div>
        </div>
        
        <div class="btn-group" style="margin-top: 2rem;">
            <button @click="saveEmailSettings()" class="btn-primary">💾 E-Mail Einstellungen speichern</button>
        </div>
    `;
}

document.addEventListener('alpine:init', () => {
    Alpine.effect(() => {
        const app = Alpine.$data(document.querySelector('[x-data]'));
        if (app && app.currentView === 'email') {
            initEmail();
        }
    });
});