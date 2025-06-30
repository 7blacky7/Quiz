package models

import "time"

type Quiz struct {
	Title     string     `json:"title"`
	Questions []Question `json:"questions"`
}

type Question struct {
	Question string   `json:"question"`
	Options  []string `json:"options"`
	Correct  int      `json:"correct"`
}

type QuizResult struct {
	UserName   string       `json:"userName"`
	Category   string       `json:"category"`
	Score      int          `json:"score"`
	Total      int          `json:"total"`
	Percentage float64      `json:"percentage"`
	Results    []UserAnswer `json:"results"`
	Timestamp  time.Time    `json:"timestamp"`
}

type UserAnswer struct {
	Question       string `json:"question"`
	SelectedAnswer string `json:"selectedAnswer"`
	CorrectAnswer  string `json:"correctAnswer"`
	Correct        bool   `json:"correct"`
}

type PageData struct {
	Title      string            `json:"title"`
	Categories map[string]Quiz   `json:"categories"`
	Features   []Feature         `json:"features"`
}

type Feature struct {
	Icon        string `json:"icon"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type AdminSettings struct {
	EmailRecipient        string `json:"email_recipient"`
	GraphClientID         string `json:"graph_client_id"`
	GraphClientSecret     string `json:"graph_client_secret"`
	GraphTenantID         string `json:"graph_tenant_id"`
	GraphServiceEndpoint  string `json:"graph_service_endpoint"`
	SMTPServer            string `json:"smtp_server"`
	SMTPPort              string `json:"smtp_port"`
	SMTPUsername          string `json:"smtp_username"`
	SMTPPassword          string `json:"smtp_password"`
	AdminPassword         string `json:"admin_password"`
}

type GraphTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

type GraphEmailRequest struct {
	Message struct {
		Subject string `json:"subject"`
		Body    struct {
			ContentType string `json:"contentType"`
			Content     string `json:"content"`
		} `json:"body"`
		ToRecipients []struct {
			EmailAddress struct {
				Address string `json:"address"`
			} `json:"emailAddress"`
		} `json:"toRecipients"`
	} `json:"message"`
}

type ConnectionTestRequest struct {
	Type     string        `json:"type"`
	Settings AdminSettings `json:"settings"`
}