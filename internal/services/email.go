package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/smtp"
	"strings"
	"time"

	"quiz-app/internal/models"
)

type EmailService struct {
	Settings models.AdminSettings
}

func NewEmailService(settings models.AdminSettings) *EmailService {
	return &EmailService{Settings: settings}
}

func (e *EmailService) SendQuizResultEmail(result models.QuizResult) error {
	// Try Microsoft Graph first, then fallback to SMTP
	if e.Settings.GraphClientID != "" && e.Settings.GraphClientSecret != "" && e.Settings.GraphTenantID != "" {
		err := e.sendEmailViaGraph(result)
		if err == nil {
			return nil
		}
		log.Printf("🔄 Microsoft Graph failed, trying SMTP fallback: %v", err)
	}

	// SMTP fallback
	if e.Settings.SMTPServer != "" && e.Settings.SMTPUsername != "" && e.Settings.SMTPPassword != "" {
		return e.sendEmailViaSMTP(result)
	}

	return fmt.Errorf("no email configuration available")
}

func (e *EmailService) sendEmailViaGraph(result models.QuizResult) error {
	// Get access token
	token, err := e.getGraphAccessToken()
	if err != nil {
		return fmt.Errorf("failed to get access token: %v", err)
	}

	// Prepare email content
	subject := fmt.Sprintf("Quiz-Ergebnis: %s - %s (%.0f%%)", result.UserName, result.Category, result.Percentage)
	content := e.generateEmailContent(result)

	// Prepare Graph API request
	emailReq := models.GraphEmailRequest{}
	emailReq.Message.Subject = subject
	emailReq.Message.Body.ContentType = "HTML"
	emailReq.Message.Body.Content = content
	emailReq.Message.ToRecipients = []struct {
		EmailAddress struct {
			Address string `json:"address"`
		} `json:"emailAddress"`
	}{{EmailAddress: struct {
		Address string `json:"address"`
	}{Address: e.Settings.EmailRecipient}}}

	// Send email via Graph API
	jsonData, err := json.Marshal(emailReq)
	if err != nil {
		return fmt.Errorf("failed to marshal email request: %v", err)
	}

	req, err := http.NewRequest("POST", e.Settings.GraphServiceEndpoint+"/me/sendMail", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusAccepted {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("graph API error (status %d): %s", resp.StatusCode, string(body))
	}

	return nil
}

func (e *EmailService) getGraphAccessToken() (string, error) {
	tokenURL := fmt.Sprintf("https://login.microsoftonline.com/%s/oauth2/v2.0/token", e.Settings.GraphTenantID)

	data := fmt.Sprintf("client_id=%s&client_secret=%s&scope=https://graph.microsoft.com/.default&grant_type=client_credentials",
		e.Settings.GraphClientID, e.Settings.GraphClientSecret)

	req, err := http.NewRequest("POST", tokenURL, strings.NewReader(data))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("token request failed (status %d): %s", resp.StatusCode, string(body))
	}

	var tokenResp models.GraphTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return "", err
	}

	return tokenResp.AccessToken, nil
}

func (e *EmailService) sendEmailViaSMTP(result models.QuizResult) error {
	subject := fmt.Sprintf("Quiz-Ergebnis: %s - %s (%.0f%%)", result.UserName, result.Category, result.Percentage)
	content := e.generateEmailContent(result)

	// Setup SMTP
	auth := smtp.PlainAuth("", e.Settings.SMTPUsername, e.Settings.SMTPPassword, e.Settings.SMTPServer)

	// Compose message
	msg := fmt.Sprintf("To: %s\r\nSubject: %s\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		e.Settings.EmailRecipient, subject, content)

	// Send email
	err := smtp.SendMail(e.Settings.SMTPServer+":"+e.Settings.SMTPPort, auth,
		e.Settings.SMTPUsername, []string{e.Settings.EmailRecipient}, []byte(msg))

	return err
}

func (e *EmailService) generateEmailContent(result models.QuizResult) string {
	content := fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<title>Quiz-Ergebnis</title>
		<style>
			body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
			.header { background: linear-gradient(135deg, #00D9FF, #7B68EE); color: white; padding: 20px; text-align: center; border-radius: 10px; }
			.content { margin: 20px 0; }
			.score { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
			.result-item { background: #f8f9fa; margin: 10px 0; padding: 10px; border-radius: 5px; }
			.correct { border-left: 4px solid #51CF66; }
			.incorrect { border-left: 4px solid #FF6B6B; }
			.footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
		</style>
	</head>
	<body>
		<div class="header">
			<h1>🎯 Quiz-Ergebnis</h1>
			<p>Interaktives Quiz-System</p>
		</div>
		
		<div class="content">
			<h2>Teilnehmer: %s</h2>
			<p><strong>📚 Kategorie:</strong> %s</p>
			<p><strong>📅 Datum:</strong> %s</p>
			
			<div class="score">
				<h3>📊 Gesamtergebnis</h3>
				<h2>%d von %d Fragen richtig (%.0f%%)</h2>
			</div>
			
			<h3>📋 Detaillierte Ergebnisse</h3>
	`, result.UserName, result.Category, result.Timestamp.Format("02.01.2006 15:04:05"),
		result.Score, result.Total, result.Percentage)

	for i, res := range result.Results {
		correctClass := "correct"
		if !res.Correct {
			correctClass = "incorrect"
		}

		content += fmt.Sprintf(`
			<div class="result-item %s">
				<p><strong>%d. %s</strong></p>
				<p>💭 Ihre Antwort: %s %s</p>
		`, correctClass, i+1, res.Question, res.SelectedAnswer, func() string {
			if res.Correct {
				return "✅"
			}
			return "❌"
		}())

		if !res.Correct {
			content += fmt.Sprintf(`<p>💡 Richtige Antwort: %s</p>`, res.CorrectAnswer)
		}

		content += `</div>`
	}

	content += `
		</div>
		
		<div class="footer">
			<p>🚀 Erstellt mit Quiz-Master - Powered by Go</p>
			<p>⏰ Gesendet am ` + time.Now().Format("02.01.2006 15:04:05") + `</p>
		</div>
	</body>
	</html>`

	return content
}

func (e *EmailService) TestMicrosoftGraph() error {
	if e.Settings.GraphClientID == "" || e.Settings.GraphClientSecret == "" || e.Settings.GraphTenantID == "" {
		return fmt.Errorf("Microsoft Graph credentials are incomplete")
	}

	// Test by getting an access token
	tokenURL := fmt.Sprintf("https://login.microsoftonline.com/%s/oauth2/v2.0/token", e.Settings.GraphTenantID)

	data := fmt.Sprintf("client_id=%s&client_secret=%s&scope=https://graph.microsoft.com/.default&grant_type=client_credentials",
		e.Settings.GraphClientID, e.Settings.GraphClientSecret)

	req, err := http.NewRequest("POST", tokenURL, strings.NewReader(data))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("authentication failed (status %d): %s", resp.StatusCode, string(body))
	}

	return nil
}

func (e *EmailService) TestSMTP() error {
	if e.Settings.SMTPServer == "" || e.Settings.SMTPUsername == "" || e.Settings.SMTPPassword == "" {
		return fmt.Errorf("SMTP credentials are incomplete")
	}

	// Test SMTP connection
	auth := smtp.PlainAuth("", e.Settings.SMTPUsername, e.Settings.SMTPPassword, e.Settings.SMTPServer)

	// Just test the connection without sending
	client, err := smtp.Dial(e.Settings.SMTPServer + ":" + e.Settings.SMTPPort)
	if err != nil {
		return fmt.Errorf("SMTP connection failed: %v", err)
	}
	defer client.Close()

	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("SMTP authentication failed: %v", err)
	}

	return nil
}