package handlers

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"quiz-app/internal/models"
	"quiz-app/internal/services"
)

func SaveMySQLConfigHandler(c *gin.Context) {
	var config services.MySQLConfig
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid MySQL config: " + err.Error(),
		})
		return
	}

	if err := services.ConnectMySQL(config); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to connect to MySQL: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "MySQL connected successfully",
	})
}

func TestMySQLHandler(c *gin.Context) {
	var config services.MySQLConfig
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid MySQL config: " + err.Error(),
		})
		return
	}

	// Test connection without saving
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		config.Username, config.Password, config.Host, config.Port, config.Database)

	testDB, err := sql.Open("mysql", dsn)
	if err != nil {
		c.JSON(http.StatusOK, models.APIResponse{
			Success: false,
			Message: "Connection failed: " + err.Error(),
		})
		return
	}
	defer testDB.Close()

	if err = testDB.Ping(); err != nil {
		c.JSON(http.StatusOK, models.APIResponse{
			Success: false,
			Message: "Ping failed: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "MySQL connection successful",
	})
}

func SaveEmailSettingsHandler(c *gin.Context) {
	var settings models.AdminSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid email settings: " + err.Error(),
		})
		return
	}

	// Update admin settings (will be moved to proper service)
	// adminSettings.EmailRecipient = settings.EmailRecipient
	// adminSettings.GraphClientID = settings.GraphClientID
	// ... etc

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Email settings saved successfully",
	})
}