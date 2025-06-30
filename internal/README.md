# 🏗️ Internal Packages

Dieses Verzeichnis enthält alle internen Go-Pakete der Quiz-Anwendung, organisiert nach Clean Architecture Prinzipien.

## 📁 Struktur

### `/handlers` - HTTP Request Handler
- **admin.go**: Admin-Panel Funktionalitäten, User-Management, Settings
- **database.go**: Datenbank-spezifische HTTP-Endpoints 
- **quiz.go**: Quiz-Funktionen, User-Registration, Quiz-Submission

### `/services` - Business Logic Layer
- **database.go**: Datenbank-Operationen, User-Management, Setup-Status
- **email.go**: E-Mail-Integration (Microsoft Graph API + SMTP)

### `/models` - Datenstrukturen
- **types.go**: Alle Struct-Definitionen, API-Response-Typen, Datenmodelle

### `/config` - Konfiguration
- **data.go**: Quiz-Kategorien, Fragen-Daten, System-Features

### `/utils` - Hilfsfunktionen
- **helpers.go**: Allgemeine Utility-Funktionen

## 🔄 Datenfluss

```
HTTP Request → Handlers → Services → Database
                ↓
              Models (Data Transfer)
```

## 🚧 Bekannte Probleme

1. **Import-Zyklen vermeiden**: Services dürfen nicht auf Handlers zugreifen
2. **Global State**: adminSettings sollte in Service verschoben werden
3. **Error Handling**: Inconsistent error handling zwischen Packages
4. **Testing**: Keine Unit Tests vorhanden

## 📝 Entwicklungsrichtlinien

- Handler sollten minimal sein und nur HTTP-spezifische Logik enthalten
- Business Logic gehört in Services
- Database-Zugriff nur über Services
- Models definieren Datenstrukturen, keine Logik