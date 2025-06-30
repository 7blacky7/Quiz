# 📄 HTML Templates

Go-Templates für das Quiz-System mit AlpineJS-Integration.

## 📁 Dateien

### `index.html` - Haupt-Quiz-Interface
**Funktionen:**
- Responsive Quiz-Interface mit AlpineJS
- Kategorie-Auswahl und Benutzer-Anmeldung
- Moderne modulare JavaScript-Integration
- Debug-Panel für Entwicklung

**Bekannte Probleme:**
- Dialog-Management: User-Dialoge werden teilweise fälschlicherweise angezeigt
- Cache-Busting: Manuelle Versionierung der JS-Dateien erforderlich
- State-Debugging: Debug-Panel für Dialog-Probleme hinzugefügt

### `admin.html` - Admin-Panel (AlpineJS)
**Funktionen:**
- Vollständiges Admin-Interface mit AlpineJS
- Benutzerverwaltung (Admins + normale User)
- Datenbank-Konfiguration (MySQL + SQLite)
- E-Mail-Settings und Quiz-Management

**Features:**
- Benutzertyp-Unterscheidung (👑 Admin vs 👤 Teilnehmer)
- Passwort-Status-Anzeige (🔒 Ja / ⚡ Nein)
- Responsive Design mit moderner UI

### `admin-new.html` - Alternative Admin-UI
**Status:** Experimentell/Backup
- Alternative Admin-Panel-Implementierung
- Weniger verwendet als `admin.html`

## 🏗️ Template-Architektur

### AlpineJS Integration:
```html
<body x-data="quizApp()" x-cloak>
  <!-- Reaktive UI-Komponenten -->
  <div x-show="showUserLogin">...</div>
  <div x-text="userName">...</div>
</body>
```

### JavaScript-Module Loading:
```html
<!-- Cache-Busting mit manuellen Versionen -->
<script src="/static/js/app/state.js?v=1735644700"></script>
<script src="/static/js/app/user.js?v=1735644700"></script>
<script src="/static/js/app/main.js?v=1735644700"></script>
```

### Go Template Integration:
```html
<!-- Server-Side Data Injection -->
{{range .Categories}}
  <div @click="selectCategory('{{$key}}')">{{.Title}}</div>
{{end}}
```

## 🚧 Bekannte Template-Probleme

### 1. Dialog-State-Management:
**Problem:** User-Dialoge erscheinen beim Laden statt bei Quiz-Start
**Status:** Debug-Code hinzugefügt, Root-Cause noch nicht gefunden
**Workaround:** Explizite `style="display: none;"` als Fallback

### 2. Cache-Invalidierung:
**Problem:** Browser cached alte JS-Versionen trotz neuer Zeitstempel
**Lösung:** Manuelle Versionierung + Port-Wechsel für Testing
**Location:** Version-Parameter in Script-Tags

### 3. AlpineJS State-Sync:
**Problem:** Inkonsistente State-Updates zwischen Components
**Debug:** Visual Debug-Panel in `index.html` hinzugefügt
**Monitor:** State-Variablen werden live angezeigt

## 🔧 Debug-Features

### Visual Debug Panel:
```html
<div class="fixed top-0 left-0 bg-red-900 text-white p-2">
  <div>showUserLogin: <span x-text="showUserLogin"></span></div>
  <div>showPasswordDialog: <span x-text="showPasswordDialog"></span></div>
</div>
```

### Console Debugging:
- `x-init` und `x-effect` für Component-Lifecycle
- Button-Click-Logging
- State-Change-Tracking

## 📱 Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

**Components:**
- Flexible Grid-Layout
- Mobile-first Approach
- Touch-friendly Controls

## 🔄 Entwicklung

### Template-Updates:
1. HTML-Änderungen in Template-Dateien
2. JS-Version in Script-Tags erhöhen
3. Server neu starten
4. Hard-Refresh (Ctrl+F5) im Browser

### Testing:
- Verschiedene Browser testen
- Mobile-Responsive prüfen
- AlpineJS Dev-Tools verwenden
- Console-Logs monitoren