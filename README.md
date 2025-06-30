# 🎯 Quiz-Master - Interaktives Quiz-System

## ⚠️ **WORK IN PROGRESS - NICHT FÜR PRODUKTIONSEINSATZ GEEIGNET**

Ein modernes, webbasiertes Quiz-System entwickelt mit Go (Backend) und AlpineJS (Frontend).

## 🚧 Aktuelle Probleme (Work in Progress)

### Kritische Probleme:
1. **Dialog-Anzeige-Bug**: Benutzer-Authentifizierungsdialoge werden teilweise automatisch beim Laden der Seite angezeigt, obwohl sie nur beim Quiz-Start erscheinen sollten
2. **Browser-Cache-Probleme**: Häufige Cache-Probleme erfordern Port-Wechsel für Testing (8080/8081/8082)
3. **AlpineJS State-Management**: Inkonsistente State-Synchronisation zwischen JavaScript-Modulen
4. **Setup-System**: Admin-Modal wird in manchen Fällen fälschlicherweise angezeigt

### Bekannte Einschränkungen:
- Setup-System ist noch nicht vollständig getestet
- Admin-Panel benötigt weitere UI/UX-Verbesserungen
- Fehlerbehandlung ist noch nicht vollständig implementiert
- Tests fehlen komplett
- Datenbankmigrationen sind manuell erforderlich

## 🚀 Features

### ✅ Implementiert:
- **Multi-Kategorie Quiz-System** (Arbeitssicherheit, IT-Sicherheit, Brandschutz, etc.)
- **Benutzer-Management** mit optionalem Passwort-Schutz
- **Admin-Panel** für Benutzerverwaltung und Quiz-Konfiguration
- **Responsive Design** mit modernem UI
- **SQLite Database** mit optional MySQL-Support
- **Email-Integration** (Microsoft Graph API & SMTP)
- **CSV Quiz-Import** für einfache Content-Verwaltung
- **Modular aufgeteilte Frontend-Architektur**

### 🔄 In Entwicklung:
- Benutzer-Authentifizierung Workflow stabilisieren
- UI-State-Management Stabilisierung
- Dialog-Management korrigieren
- Fehlerbehandlung und Validierung
- Test-Suite

## 🏗️ Projektstruktur

```
quiz-go-app/
├── main.go                 # Hauptserver (45 Zeilen, reorganisiert)
├── internal/              # Interne Go-Pakete
│   ├── handlers/          # HTTP-Handler (aufgeteilt aus 1150-Zeilen main.go)
│   │   ├── admin.go       # Admin-Funktionen
│   │   ├── database.go    # Datenbank-Handler
│   │   └── quiz.go        # Quiz-Handler & User-Registration
│   ├── services/          # Business Logic
│   │   ├── database.go    # Datenbank-Service mit User-Management
│   │   └── email.go       # E-Mail-Service
│   ├── models/            # Datenmodelle
│   ├── config/            # Konfiguration und Quiz-Daten
│   └── utils/             # Hilfsfunktionen
├── static/                # Frontend-Assets
│   ├── css/              # Stylesheets (admin + main)
│   └── js/               # JavaScript-Module
│       ├── admin/        # Admin-Panel-JS (alte Struktur)
│       └── app/          # Moderne modulare App-JS
│           ├── state.js  # Zentraler App-State
│           ├── user.js   # User-Management (NEU)
│           ├── admin.js  # Admin-Funktionen
│           ├── quiz.js   # Quiz-Logik
│           ├── setup.js  # Setup-Management
│           ├── utils.js  # Hilfsfunktionen
│           └── main.js   # Haupt-App Integration
├── templates/             # HTML-Templates
│   ├── index.html        # Haupt-Quiz-Interface
│   ├── admin.html        # Admin-Panel
│   └── admin-new.html    # Alternative Admin-UI
└── docs/                  # Dokumentation
```

## 🛠️ Technologie-Stack

- **Backend**: Go 1.19+ mit Gin Web Framework
- **Frontend**: AlpineJS + Vanilla JavaScript (modular)
- **Datenbank**: SQLite (primär), MySQL (optional)
- **Styling**: TailwindCSS-inspirierte Custom CSS
- **Email**: Microsoft Graph API + SMTP Fallback

## 📋 Voraussetzungen

- Go 1.19+
- SQLite3
- Modern Web Browser mit JavaScript-Support

## 🚧 Installation (Development)

```bash
# Repository klonen
git clone https://github.com/7blacky7/Quiz.git
cd Quiz

# Dependencies installieren
go mod tidy

# Server starten (Port variiert je nach Debug-Zustand)
go run main.go
```

**Standard-Zugang:**
- URL: http://localhost:8080 (oder 8081/8082 je nach Debug-Status)
- Default Admin: `admin` / `admin123` (wird nach echtem Admin-Setup deaktiviert)

## 🔧 Bekannte Deployment-Probleme

1. **Port-Konfiguration**: Server läuft auf verschiedenen Ports je nach Debug-Zustand
2. **Database-Migration**: Schema wurde mehrfach geändert, manuelle Migration erforderlich
3. **Asset-Caching**: Aggressive Cache-Busting durch Versionsnummern (v=timestamp)
4. **Dialog-State-Management**: Race Conditions zwischen Setup- und User-Dialogen
5. **JavaScript-Module**: Gelegentliche State-Synchronisationsprobleme

## 📚 Architektur-Entscheidungen

### Backend (Go):
- **Aufgeteilte Struktur**: Aus 1150-Zeilen main.go wurden modulare Pakete
- **Clean Architecture**: Handler → Services → Database
- **Gin Framework**: Für HTTP-Routing und Middleware

### Frontend (JavaScript):
- **Modular**: Aufgeteilte JS-Dateien nach Funktionalität
- **AlpineJS**: Für reaktive UI-Komponenten
- **State Management**: Zentraler AppState mit verteilten Managern

### Datenbank:
- **User-Erweitert**: Normale Benutzer + Admins mit optionalem Passwort-Schutz
- **Setup-Tracking**: Status-System für Erst-Installation

## 🔍 Debug-Features

Das System enthält umfangreiche Debug-Funktionen:
- Console-Logging für State-Änderungen
- Visual Debug-Panel für State-Inspektion
- Cache-Busting mit Zeitstempeln
- Request-Logging im Backend

## 📄 Lizenz

Dieses Projekt ist noch in der Entwicklung. Lizenz wird bei Release festgelegt.

## 👥 Beitragen

Da sich das Projekt noch in der aktiven Entwicklung befindet, sind Beiträge willkommen, aber erwarten Sie häufige Änderungen in der Codebase.

---

**⚠️ Warnung**: Diese Software ist nicht produktionsreif und sollte nur für Entwicklungs- und Testzwecke verwendet werden.