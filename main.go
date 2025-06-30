package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"./internal/config"
	"./internal/handlers"
	"./internal/services"
)

func main() {
	// Initialize database
	db, err := services.InitDB()
	if err != nil {
		log.Fatal("Datenbankinitialisierung fehlgeschlagen:", err)
	}
	defer db.Close()

	// Initialize Gin router
	router := gin.Default()

	// Serve static files
	router.Static("/static", "./static")

	// Load HTML templates
	router.LoadHTMLGlob("templates/*")

	// Routes
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"Categories": config.GetCategories(),
			"Features":   config.GetFeatures(),
		})
	})

	// API Routes
	api := router.Group("/api")
	{
		// Admin routes
		api.POST("/admin/login", handlers.AdminLogin)
		api.GET("/admin/panel", handlers.AdminPanel)
		api.GET("/admin/users", handlers.GetUsers)
		api.DELETE("/admin/users/:id", handlers.DeleteUser)
		api.PUT("/admin/settings", handlers.UpdateSettings)

		// Database routes
		api.POST("/database/test", handlers.TestDatabaseConnection)
		api.POST("/database/migrate", handlers.MigrateDatabase)

		// Quiz routes
		api.POST("/quiz/submit", handlers.SubmitQuiz)
		api.POST("/quiz/user", handlers.CreateOrLoginUser)

		// Setup routes
		api.GET("/setup/status", handlers.GetSetupStatus)
	}

	log.Println("🚀 Quiz-System startet auf http://0.0.0.0:8082")
	log.Fatal(router.Run("0.0.0.0:8082"))
}