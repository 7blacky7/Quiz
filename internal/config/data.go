package config

import "quiz-app/internal/models"

// Global quiz data
var QuizCategories = map[string]models.Quiz{
	"notruf": {
		Title: "Notruf-Leitstellen Quiz",
		Questions: []models.Question{
			{
				Question: "Welche Notrufnummer wählt man in Deutschland für Feuerwehr und Rettungsdienst?",
				Options:  []string{"110", "112", "999", "911"},
				Correct:  1,
			},
			{
				Question: "Wofür steht die Nummer 112?",
				Options:  []string{"Feuerwehr & Rettungsdienst", "Polizei", "Giftnotruf", "Technisches Hilfswerk"},
				Correct:  0,
			},
			{
				Question: "Welcher Leitstelle meldet man einen Verkehrsunfall mit Verletzten?",
				Options:  []string{"Polizei", "Feuerwehr", "Rettungsdienst", "Alle drei"},
				Correct:  3,
			},
			{
				Question: "Was sind die 5 W-Fragen bei einem Notruf?",
				Options:  []string{"Wer, Was, Wo, Wann, Warum", "Wo, Was, Wie viele, Welche, Warten", "Wer, Wo, Was, Wie viele, Warten", "Was, Wo, Wann, Wie, Warum"},
				Correct:  2,
			},
			{
				Question: "Wer darf einen Notruf beenden?",
				Options:  []string{"Der Anrufer", "Die Leitstelle", "Der Rettungsdienst", "Niemand"},
				Correct:  1,
			},
		},
	},
	"brandschutz": {
		Title: "Brandschutz Quiz",
		Questions: []models.Question{
			{
				Question: "Was ist die erste Maßnahme bei einem Brand?",
				Options:  []string{"Löschen", "Alarmieren", "Retten", "Absichern"},
				Correct:  1,
			},
			{
				Question: "Welches Löschmittel ist für Fettbrände geeignet?",
				Options:  []string{"Wasser", "Schaum", "CO2-Löscher", "Löschdecke"},
				Correct:  3,
			},
			{
				Question: "Was bedeutet die Brandklasse A?",
				Options:  []string{"Flüssigkeiten", "Feste Stoffe", "Gase", "Metalle"},
				Correct:  1,
			},
			{
				Question: "Wie oft sollten Feuerlöscher geprüft werden?",
				Options:  []string{"Jährlich", "Alle 2 Jahre", "Alle 5 Jahre", "Bei Bedarf"},
				Correct:  1,
			},
			{
				Question: "Was ist ein Löschmittel der Brandklasse F?",
				Options:  []string{"Wasser", "Pulver", "Spezieller Fettbrandlöscher", "CO2"},
				Correct:  2,
			},
		},
	},
	"itsicherheit": {
		Title: "IT-Sicherheit Quiz",
		Questions: []models.Question{
			{
				Question: "Was ist ein sicheres Passwort?",
				Options:  []string{"Passwort123", "Qw!2e#R4t$", "MeinName", "123456789"},
				Correct:  1,
			},
			{
				Question: "Wofür steht Phishing?",
				Options:  []string{"E-Mail-Spam", "Datendiebstahl durch gefälschte E-Mails", "Firewall-Angriff", "Virus-Scan"},
				Correct:  1,
			},
			{
				Question: "Was schützt vor Viren im Internet?",
				Options:  []string{"Antivirus-Software", "Popup-Blocker", "Starkes Passwort", "Alle drei"},
				Correct:  3,
			},
			{
				Question: "Wie oft sollten wichtige Daten gesichert werden?",
				Options:  []string{"Täglich", "Wöchentlich", "Monatlich", "Je nach Wichtigkeit"},
				Correct:  3,
			},
			{
				Question: "Was ist eine Zwei-Faktor-Authentifizierung?",
				Options:  []string{"Zwei Passwörter", "Passwort + zusätzlicher Sicherheitscode", "Zwei verschiedene Browser", "Zwei E-Mail-Adressen"},
				Correct:  1,
			},
		},
	},
	"arbeitssicherheit": {
		Title: "Arbeitssicherheit Quiz",
		Questions: []models.Question{
			{
				Question: "Wann trägt man einen Sicherheitshelm?",
				Options:  []string{"Immer", "Bei Arbeiten mit Absturzgefahr", "Nur im Büro", "Bei lauten Arbeiten"},
				Correct:  1,
			},
			{
				Question: "Was bedeutet PSA?",
				Options:  []string{"Persönliche Schutz-Ausrüstung", "Prozess-Sicherheits-Analyse", "Personal-Schutz-Agent", "Prüf-Sicherheits-Ablauf"},
				Correct:  0,
			},
			{
				Question: "Welche Farbe hat ein Notausgang-Schild?",
				Options:  []string{"Rot", "Grün", "Gelb", "Blau"},
				Correct:  1,
			},
			{
				Question: "Wie oft müssen Erste-Hilfe-Kästen kontrolliert werden?",
				Options:  []string{"Monatlich", "Halbjährlich", "Jährlich", "Bei Bedarf"},
				Correct:  1,
			},
			{
				Question: "Was ist bei einem Arbeitsunfall zuerst zu tun?",
				Options:  []string{"Unfallstelle absichern", "Erste Hilfe leisten", "Rettungsdienst rufen", "Vorgesetzten informieren"},
				Correct:  0,
			},
		},
	},
	"vertraulichkeit": {
		Title: "Vertraulichkeit Quiz",
		Questions: []models.Question{
			{
				Question: "Was ist vertraulich?",
				Options:  []string{"Betriebsgeheimnisse", "Werbematerial", "Öffentliche Informationen", "Telefonnummern"},
				Correct:  0,
			},
			{
				Question: "Wie behandelt man sensible Daten?",
				Options:  []string{"Offen auf dem Schreibtisch lassen", "Verschlüsselt speichern", "Per E-Mail versenden", "In den Papierkorb werfen"},
				Correct:  1,
			},
			{
				Question: "Wer darf Zugang zu vertraulichen Daten haben?",
				Options:  []string{"Jeder", "Nur autorisierte Personen", "Alle Kollegen", "Die Geschäftsleitung"},
				Correct:  1,
			},
			{
				Question: "Wie lange sollten vertrauliche Dokumente aufbewahrt werden?",
				Options:  []string{"Für immer", "1 Jahr", "Entsprechend der Aufbewahrungsrichtlinien", "Bis zum Jahresende"},
				Correct:  2,
			},
			{
				Question: "Was tun bei Verdacht auf Datenleck?",
				Options:  []string{"Ignorieren", "Sofort melden", "Selbst beheben", "Warten"},
				Correct:  1,
			},
		},
	},
}

var Features = []models.Feature{
	{
		Icon:        "🎯",
		Title:       "Interaktive Quizzes",
		Description: "Moderne Quiz-Experience mit visuellen Effekten",
	},
	{
		Icon:        "🚀",
		Title:       "Go Performance",
		Description: "Blitzschnelle Antwortzeiten dank Go",
	},
	{
		Icon:        "📱",
		Title:       "Responsive Design",
		Description: "Optimiert für alle Geräte und Bildschirmgrößen",
	},
	{
		Icon:        "🎨",
		Title:       "Modernes UI",
		Description: "Glasmorphismus-Design mit Animationen",
	},
}