package handlers

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"quiz-app/internal/config"
	"quiz-app/internal/models"
	"quiz-app/internal/services"
)

func HomeHandler(c *gin.Context) {
	data := models.PageData{
		Title:      "Interaktives Quiz-System",
		Categories: config.QuizCategories,
		Features:   config.Features,
	}

	c.HTML(http.StatusOK, "index.html", data)
}

func GetCategoriesHandler(c *gin.Context) {
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Categories retrieved successfully",
		Data:    config.QuizCategories,
	})
}

// User registration/login for quiz participants
func UserRegistrationHandler(c *gin.Context) {
	var request struct {
		Username    string `json:"username" binding:"required"`
		Password    string `json:"password"`
		WantsPassword bool `json:"wantsPassword"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data: " + err.Error(),
		})
		return
	}

	// Determine password based on user choice
	password := ""
	if request.WantsPassword && request.Password != "" {
		password = request.Password
	}

	// Create or login user
	user, err := services.CreateOrLoginRegularUser(request.Username, password)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "User registered/logged in successfully",
		Data:    user,
	})
}

// User login for existing users
func UserLoginHandler(c *gin.Context) {
	var request struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data: " + err.Error(),
		})
		return
	}

	// Try to authenticate user
	user, err := services.CreateOrLoginRegularUser(request.Username, request.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Login successful",
		Data:    user,
	})
}

func SubmitQuizHandler(c *gin.Context) {
	var result models.QuizResult
	if err := c.ShouldBindJSON(&result); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data: " + err.Error(),
		})
		return
	}

	// Add timestamp
	result.Timestamp = time.Now()

	// Save to database
	if err := services.SaveQuizResult(result); err != nil {
		log.Printf("❌ Failed to save quiz result: %v", err)
	}

	// Send email if configured (handled in main.go for now due to emailService dependency)
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Quiz result submitted successfully",
		Data:    result,
	})
}

func StatsHandler(c *gin.Context) {
	stats := map[string]interface{}{
		"server_time":    time.Now(),
		"uptime":         "24h 37m",
		"total_quizzes":  len(config.QuizCategories),
		"total_questions": func() int {
			total := 0
			for _, quiz := range config.QuizCategories {
				total += len(quiz.Questions)
			}
			return total
		}(),
		"status": "operational",
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Server stats retrieved successfully",
		Data:    stats,
	})
}

func UploadQuizHandler(c *gin.Context) {
	var upload struct {
		Category  string           `json:"category"`
		Questions []models.Question `json:"questions"`
	}

	if err := c.ShouldBindJSON(&upload); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid quiz data: " + err.Error(),
		})
		return
	}

	// Add to quiz categories
	key := strings.ToLower(strings.ReplaceAll(upload.Category, " ", ""))
	config.QuizCategories[key] = models.Quiz{
		Title:     upload.Category,
		Questions: upload.Questions,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Quiz uploaded successfully",
	})
}

// Helper function - will be moved to utils package later
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}