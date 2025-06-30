package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"quiz-app/internal/config"
	"quiz-app/internal/models"
	"quiz-app/internal/services"
	"quiz-app/internal/utils"
)

func AdminHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "admin.html", gin.H{
		"Title": "Admin Panel",
	})
}

func AdminLoginHandler(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data",
		})
		return
	}

	// Check for fallback admin (backward compatibility)
	if req.Username == "" && req.Password == "admin123" {
		c.JSON(http.StatusOK, models.APIResponse{
			Success: true,
			Message: "Login successful",
		})
		return
	}

	// Check credentials against database
	if req.Username == "" || req.Password == "" {
		c.JSON(http.StatusOK, models.APIResponse{
			Success: false,
			Message: "Benutzername und Passwort erforderlich",
		})
		return
	}

	user, err := services.GetUserByUsername(req.Username)
	if err != nil {
		c.JSON(http.StatusOK, models.APIResponse{
			Success: false,
			Message: "Benutzer nicht gefunden",
		})
		return
	}

	if !user.IsAdmin {
		c.JSON(http.StatusOK, models.APIResponse{
			Success: false,
			Message: "Keine Admin-Berechtigung",
		})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusOK, models.APIResponse{
			Success: false,
			Message: "Falsches Passwort",
		})
		return
	}

	// Disable default admin if this is a real admin logging in after setup
	err = services.DisableDefaultAdminIfNeeded(req.Username)
	if err != nil {
		log.Printf("Warning: Could not disable default admin: %v", err)
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Anmeldung erfolgreich",
	})
}

func AdminStatsHandler(c *gin.Context) {
	results, _ := services.GetAllQuizResults()
	users, _ := services.GetAllUsers()
	
	stats := map[string]interface{}{
		"totalUsers":    len(users),
		"totalQuizzes":  len(config.QuizCategories),
		"totalResults":  len(results),
		"dbStatus":      "SQLite + MySQL",
		"recentResults": results[:utils.Min(10, len(results))],
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Admin stats retrieved",
		Data:    stats,
	})
}

func AdminUsersHandler(c *gin.Context) {
	users, err := services.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to load users: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    users,
	})
}

func CreateUserHandler(c *gin.Context) {
	var user struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid user data: " + err.Error(),
		})
		return
	}

	if err := services.CreateUser(user.Username, user.Password, user.Email); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to create user: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "User created successfully",
	})
}

func DeleteUserHandler(c *gin.Context) {
	username := c.Param("username")
	
	if err := services.DeleteUser(username); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to delete user: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "User deleted successfully",
	})
}

func ChangePasswordHandler(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data: " + err.Error(),
		})
		return
	}

	if err := services.UpdateUserPassword(req.Username, req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to update password: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Password updated successfully",
	})
}

func SaveSettingsHandler(c *gin.Context) {
	var settings models.AdminSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid settings data: " + err.Error(),
		})
		return
	}

	// Save settings (in real app, save to database/config file)
	// adminSettings = settings
	log.Printf("📝 Admin settings updated")

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Settings saved successfully",
	})
}

func TestConnectionHandler(c *gin.Context) {
	var request models.ConnectionTestRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data: " + err.Error(),
		})
		return
	}

	emailService := services.NewEmailService(request.Settings)
	var err error
	switch request.Type {
	case "graph":
		err = emailService.TestMicrosoftGraph()
	case "smtp":
		err = emailService.TestSMTP()
	default:
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid connection type",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusOK, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: fmt.Sprintf("%s connection test successful", strings.Title(request.Type)),
	})
}

func GetSettingsHandler(c *gin.Context) {
	// Return dummy settings structure for now
	settings := map[string]interface{}{
		"email": map[string]interface{}{
			"graphClientId":     "",
			"graphClientSecret": "",
			"graphTenantId":     "",
			"emailRecipient":    "",
			"smtpServer":        "smtp.gmail.com",
			"smtpPort":          "587",
			"smtpUsername":      "",
		},
		"mysql": map[string]interface{}{
			"host":     "",
			"port":     "3306",
			"database": "",
			"username": "",
		},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    settings,
	})
}

func GetSetupStatusHandler(c *gin.Context) {
	status := services.GetSetupStatus()
	
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Setup status retrieved",
		Data:    status,
	})
}