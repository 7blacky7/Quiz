# 📚 Dokumentation

Hier finden Sie detaillierte Dokumentation für das Quiz-System.

## 📋 Inhaltsverzeichnis

### Aktuell verfügbar:
- **Projekt-Struktur**: Siehe Haupt-README.md
- **API-Endpoints**: (In Entwicklung)
- **Datenbank-Schema**: (In Entwicklung)
- **Frontend-Architektur**: Siehe static/README.md

### 🚧 In Planung:
- **Installation-Guide**: Detaillierte Setup-Anweisungen
- **API-Dokumentation**: Vollständige REST-API-Referenz
- **Datenbank-Design**: ERD und Schema-Dokumentation
- **Frontend-Style-Guide**: CSS und Component-Patterns
- **Deployment-Guide**: Production-Setup
- **Testing-Guide**: Unit und Integration Tests
- **Troubleshooting**: Häufige Probleme und Lösungen

## 🚧 Aktuelle Probleme die dokumentiert werden müssen:

### 1. Dialog-State-Management
- **Problem**: User-Dialoge erscheinen automatisch beim Laden
- **Debug-Status**: Extensive Debug-Logs hinzugefügt
- **Workarounds**: Port-Wechsel für Cache-Umgehung

### 2. JavaScript-Module-Architecture  
- **Status**: Migration von Legacy zu AlpineJS-basiert
- **Struktur**: Manager-Pattern implementiert
- **Probleme**: State-Synchronisation zwischen Modulen

### 3. Database-Schema-Evolution
- **Changes**: User-Model erweitert für normale Benutzer
- **Migration**: Manuelle Schema-Updates erforderlich
- **Features**: Optionaler Passwort-Schutz für Quiz-Teilnehmer

### 4. Admin-Panel-Migration
- **Old**: Vanilla JS in /static/js/admin/
- **New**: AlpineJS in templates/admin.html
- **Status**: Teilweise migriert, beide Systeme koexistieren

## 📖 Entwickler-Notizen

### Setup-Workflow:
1. Fresh Installation erfordert Database-Migration
2. Default Admin (admin/admin123) wird nach echtem Admin-Setup deaktiviert
3. Port-Konfiguration variiert je nach Debug-Status (8080/8081/8082)

### Frontend-Development:
1. JS-Änderungen erfordern Version-Bump in HTML-Templates
2. Cache-Probleme häufig → Port-Wechsel für Testing
3. AlpineJS-Debugging mit Browser Dev-Tools

### Backend-Development:
1. Gin Framework mit Clean Architecture
2. Services-Layer für Business Logic
3. Handler nur für HTTP-Mapping

## 🔧 Tools und Utilities

### Debug-Features:
- Visual Debug Panel in index.html
- Console-Logging für State-Changes
- Server-Request-Logging
- Cache-Busting mit Timestamps

### Testing:
- Keine automatisierten Tests (noch nicht implementiert)
- Manuelles Testing auf verschiedenen Ports
- Browser-Console für Frontend-Debugging

## 📝 Contributing Guidelines

### Code-Style:
- Go: Standard Go-Formatting mit gofmt
- JavaScript: ES6+ mit AlpineJS-Patterns
- HTML: Semantic HTML5 mit AlpineJS-Attributen
- CSS: BEM-ähnliche Konventionen

### Commit-Messages:
- Deutsch bevorzugt
- Beschreibend und spezifisch
- Problem-orientiert bei Bugfixes

### Branch-Strategy:
- Noch nicht definiert (Single-Developer-Projekt)
- Feature-Branches bei Multi-Developer-Setup geplant