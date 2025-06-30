package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	_ "github.com/mattn/go-sqlite3"
	_ "github.com/go-sql-driver/mysql"
	
	"quiz-app/internal/models"
)

type Database struct {
	sqlite *sql.DB
	mysql  *sql.DB
	useMySQL bool
}

type User struct {
	ID          int       `json:"id"`
	Username    string    `json:"username"`
	Password    string    `json:"-"`
	Email       string    `json:"email"`
	IsAdmin     bool      `json:"isAdmin"`
	HasPassword bool      `json:"hasPassword"`
	Created     time.Time `json:"created"`
}

type QuizResultDB struct {
	ID          int       `json:"id"`
	UserName    string    `json:"userName"`
	Category    string    `json:"category"`
	Score       int       `json:"score"`
	Total       int       `json:"total"`
	Percentage  float64   `json:"percentage"`
	Results     string    `json:"results"` // JSON string
	Timestamp   time.Time `json:"timestamp"`
	Synced      bool      `json:"synced"`
}

type MySQLConfig struct {
	Host     string `json:"host"`
	Port     string `json:"port"`
	Database string `json:"database"`
	Username string `json:"username"`
	Password string `json:"password"`
}

var db *Database

func InitDatabase() error {
	db = &Database{}
	
	// Initialize SQLite
	var err error
	db.sqlite, err = sql.Open("sqlite3", "./quiz.db")
	if err != nil {
		return fmt.Errorf("failed to open SQLite database: %v", err)
	}

	// Create tables
	if err := createSQLiteTables(); err != nil {
		return fmt.Errorf("failed to create SQLite tables: %v", err)
	}

	// Create default admin user if not exists
	if err := createDefaultAdmin(); err != nil {
		return fmt.Errorf("failed to create default admin: %v", err)
	}

	log.Println("📊 SQLite database initialized successfully")
	return nil
}

func createSQLiteTables() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password TEXT,
			email TEXT,
			is_admin BOOLEAN DEFAULT false,
			has_password BOOLEAN DEFAULT false,
			created DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS quiz_results (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_name TEXT NOT NULL,
			category TEXT NOT NULL,
			score INTEGER NOT NULL,
			total INTEGER NOT NULL,
			percentage REAL NOT NULL,
			results TEXT NOT NULL,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			synced BOOLEAN DEFAULT false
		)`,
		`CREATE TABLE IF NOT EXISTS quiz_categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			key TEXT UNIQUE NOT NULL,
			title TEXT NOT NULL,
			icon TEXT,
			active BOOLEAN DEFAULT true,
			questions TEXT NOT NULL,
			created DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL,
			updated DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for _, query := range queries {
		if _, err := db.sqlite.Exec(query); err != nil {
			return err
		}
	}

	return nil
}

func createDefaultAdmin() error {
	// Check if any admin users exist (not just the default one)
	var adminCount int
	err := db.sqlite.QueryRow("SELECT COUNT(*) FROM users WHERE is_admin = true").Scan(&adminCount)
	if err != nil {
		return err
	}

	// If there are already admin users, don't create default admin
	if adminCount > 0 {
		return nil
	}

	// Check if default admin specifically exists
	var defaultAdminCount int
	err = db.sqlite.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", "admin").Scan(&defaultAdminCount)
	if err != nil {
		return err
	}

	if defaultAdminCount > 0 {
		return nil // Default admin already exists
	}

	// Hash default password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Insert default admin with special flag
	_, err = db.sqlite.Exec(
		"INSERT INTO users (username, password, email, is_admin, has_password) VALUES (?, ?, ?, ?, ?)",
		"admin", string(hashedPassword), "admin@quiz-system.local", true, true,
	)

	if err != nil {
		return err
	}

	// Set initial setup flag
	err = SaveSetting("setup_completed", "false")
	if err != nil {
		log.Printf("Warning: Could not save setup flag: %v", err)
	}

	log.Println("👤 Default admin user created (username: admin, password: admin123)")
	log.Println("🔧 First-time setup mode activated")
	return nil
}

func ConnectMySQL(config MySQLConfig) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		config.Username, config.Password, config.Host, config.Port, config.Database)

	var err error
	db.mysql, err = sql.Open("mysql", dsn)
	if err != nil {
		return err
	}

	if err = db.mysql.Ping(); err != nil {
		return err
	}

	// Create MySQL tables
	if err := createMySQLTables(); err != nil {
		return err
	}

	db.useMySQL = true
	log.Println("🔗 MySQL database connected successfully")

	// Sync pending SQLite data to MySQL
	go syncPendingData()

	return nil
}

func createMySQLTables() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS quiz_results (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_name VARCHAR(255) NOT NULL,
			category VARCHAR(255) NOT NULL,
			score INT NOT NULL,
			total INT NOT NULL,
			percentage DECIMAL(5,2) NOT NULL,
			results TEXT NOT NULL,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS quiz_categories (
			id INT AUTO_INCREMENT PRIMARY KEY,
			key_name VARCHAR(255) UNIQUE NOT NULL,
			title VARCHAR(255) NOT NULL,
			icon VARCHAR(50),
			active BOOLEAN DEFAULT true,
			questions TEXT NOT NULL,
			created DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for _, query := range queries {
		if _, err := db.mysql.Exec(query); err != nil {
			return err
		}
	}

	return nil
}

func SaveQuizResult(result models.QuizResult) error {
	resultsJSON, err := json.Marshal(result.Results)
	if err != nil {
		return err
	}

	if db.useMySQL && db.mysql != nil {
		// Try MySQL first
		_, err := db.mysql.Exec(
			"INSERT INTO quiz_results (user_name, category, score, total, percentage, results, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
			result.UserName, result.Category, result.Score, result.Total, result.Percentage, string(resultsJSON), result.Timestamp,
		)
		if err == nil {
			log.Printf("📊 Quiz result saved to MySQL: %s", result.UserName)
			return nil
		}
		log.Printf("⚠️ MySQL save failed, falling back to SQLite: %v", err)
	}

	// Save to SQLite (fallback or primary)
	_, err = db.sqlite.Exec(
		"INSERT INTO quiz_results (user_name, category, score, total, percentage, results, timestamp, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		result.UserName, result.Category, result.Score, result.Total, result.Percentage, string(resultsJSON), result.Timestamp, db.useMySQL,
	)
	if err != nil {
		return err
	}

	log.Printf("📊 Quiz result saved to SQLite: %s", result.UserName)
	return nil
}

func syncPendingData() {
	if !db.useMySQL || db.mysql == nil {
		return
	}

	// Get unsynced results from SQLite
	rows, err := db.sqlite.Query("SELECT id, user_name, category, score, total, percentage, results, timestamp FROM quiz_results WHERE synced = false")
	if err != nil {
		log.Printf("❌ Failed to get unsynced data: %v", err)
		return
	}
	defer rows.Close()

	syncCount := 0
	for rows.Next() {
		var id int
		var userName, category, results string
		var score, total int
		var percentage float64
		var timestamp time.Time

		if err := rows.Scan(&id, &userName, &category, &score, &total, &percentage, &results, &timestamp); err != nil {
			log.Printf("❌ Failed to scan row: %v", err)
			continue
		}

		// Insert into MySQL
		_, err := db.mysql.Exec(
			"INSERT INTO quiz_results (user_name, category, score, total, percentage, results, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
			userName, category, score, total, percentage, results, timestamp,
		)
		if err != nil {
			log.Printf("❌ Failed to sync result %d to MySQL: %v", id, err)
			continue
		}

		// Mark as synced and delete from SQLite
		if _, err := db.sqlite.Exec("DELETE FROM quiz_results WHERE id = ?", id); err != nil {
			log.Printf("❌ Failed to delete synced result %d from SQLite: %v", id, err)
		} else {
			syncCount++
		}
	}

	if syncCount > 0 {
		log.Printf("🔄 Synced %d results to MySQL and cleaned up SQLite", syncCount)
	}
}

func AuthenticateUser(username, password string) (*User, error) {
	var user User
	var hashedPassword sql.NullString

	err := db.sqlite.QueryRow(
		"SELECT id, username, password, email, is_admin, has_password, created FROM users WHERE username = ?",
		username,
	).Scan(&user.ID, &user.Username, &hashedPassword, &user.Email, &user.IsAdmin, &user.HasPassword, &user.Created)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	// If user has no password, allow login without password check
	if !user.HasPassword {
		return &user, nil
	}

	// If user has password, check it
	if !hashedPassword.Valid {
		return nil, fmt.Errorf("user has no password set")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword.String), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid password")
	}

	return &user, nil
}

func GetUserByUsername(username string) (*User, error) {
	var user User
	var hashedPassword sql.NullString

	err := db.sqlite.QueryRow(
		"SELECT id, username, password, email, is_admin, has_password, created FROM users WHERE username = ?",
		username,
	).Scan(&user.ID, &user.Username, &hashedPassword, &user.Email, &user.IsAdmin, &user.HasPassword, &user.Created)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	if hashedPassword.Valid {
		user.Password = hashedPassword.String
	}
	return &user, nil
}

func CreateUser(username, password, email string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = db.sqlite.Exec(
		"INSERT INTO users (username, password, email, is_admin, has_password) VALUES (?, ?, ?, ?, ?)",
		username, string(hashedPassword), email, true, true,
	)

	if err != nil {
		return err
	}

	// Check if this is the first real admin user (not the default one)
	setupCompleted, _ := GetSetting("setup_completed")
	if setupCompleted == "false" {
		log.Printf("🎯 First real admin user created: %s", username)
		
		// Mark setup as completed
		err = SaveSetting("setup_completed", "true")
		if err != nil {
			log.Printf("Warning: Could not update setup flag: %v", err)
		}
		
		// Mark when this happened
		err = SaveSetting("setup_completed_at", time.Now().Format(time.RFC3339))
		if err != nil {
			log.Printf("Warning: Could not save setup timestamp: %v", err)
		}
		
		log.Println("✅ Setup completed - default admin will be disabled after first login")
	}

	return nil
}

// Create or login regular user (quiz participants)
func CreateOrLoginRegularUser(username string, password string) (*User, error) {
	// Check if user already exists
	existingUser, err := GetUserByUsername(username)
	if err == nil {
		// User exists - check if they need password authentication
		if existingUser.HasPassword {
			if password == "" {
				return nil, fmt.Errorf("password required for this user")
			}
			// Authenticate with password
			return AuthenticateUser(username, password)
		} else {
			// User exists without password - just return them
			return existingUser, nil
		}
	}

	// User doesn't exist - create new regular user
	hasPassword := password != ""
	
	if hasPassword {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}

		_, err = db.sqlite.Exec(
			"INSERT INTO users (username, password, email, is_admin, has_password) VALUES (?, ?, ?, ?, ?)",
			username, string(hashedPassword), "", false, true,
		)
		if err != nil {
			return nil, err
		}
	} else {
		_, err = db.sqlite.Exec(
			"INSERT INTO users (username, password, email, is_admin, has_password) VALUES (?, ?, ?, ?, ?)",
			username, nil, "", false, false,
		)
		if err != nil {
			return nil, err
		}
	}

	log.Printf("👤 New regular user created: %s (password protected: %v)", username, hasPassword)
	
	// Return the newly created user
	return GetUserByUsername(username)
}

func DeleteUser(username string) error {
	// Prevent deletion of last admin user
	var adminCount int
	err := db.sqlite.QueryRow("SELECT COUNT(*) FROM users WHERE is_admin = true").Scan(&adminCount)
	if err != nil {
		return err
	}

	if adminCount <= 1 {
		return fmt.Errorf("cannot delete the last admin user")
	}

	_, err = db.sqlite.Exec("DELETE FROM users WHERE username = ?", username)
	return err
}

func GetAllUsers() ([]User, error) {
	rows, err := db.sqlite.Query("SELECT id, username, email, is_admin, has_password, created FROM users ORDER BY created DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.IsAdmin, &user.HasPassword, &user.Created); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func GetAllQuizResults() ([]QuizResultDB, error) {
	var results []QuizResultDB

	// Get results from MySQL if available
	if db.useMySQL && db.mysql != nil {
		rows, err := db.mysql.Query("SELECT user_name, category, score, total, percentage, results, timestamp FROM quiz_results ORDER BY timestamp DESC LIMIT 100")
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var result QuizResultDB
				if err := rows.Scan(&result.UserName, &result.Category, &result.Score, &result.Total, &result.Percentage, &result.Results, &result.Timestamp); err == nil {
					result.Synced = true
					results = append(results, result)
				}
			}
		}
	}

	// Get results from SQLite
	rows, err := db.sqlite.Query("SELECT id, user_name, category, score, total, percentage, results, timestamp, synced FROM quiz_results ORDER BY timestamp DESC LIMIT 100")
	if err != nil {
		return results, err
	}
	defer rows.Close()

	for rows.Next() {
		var result QuizResultDB
		if err := rows.Scan(&result.ID, &result.UserName, &result.Category, &result.Score, &result.Total, &result.Percentage, &result.Results, &result.Timestamp, &result.Synced); err == nil {
			results = append(results, result)
		}
	}

	return results, nil
}

func UpdateUserPassword(username, newPassword string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = db.sqlite.Exec("UPDATE users SET password = ? WHERE username = ?", string(hashedPassword), username)
	return err
}

func SaveSetting(key, value string) error {
	_, err := db.sqlite.Exec(
		"INSERT OR REPLACE INTO settings (key, value, updated) VALUES (?, ?, ?)",
		key, value, time.Now(),
	)
	return err
}

func GetSetting(key string) (string, error) {
	var value string
	err := db.sqlite.QueryRow("SELECT value FROM settings WHERE key = ?", key).Scan(&value)
	if err == sql.ErrNoRows {
		return "", nil
	}
	return value, err
}

// Check if system is in initial setup mode
func IsInitialSetup() bool {
	setupCompleted, err := GetSetting("setup_completed")
	if err != nil {
		return true // If we can't read the setting, assume it's initial setup
	}
	return setupCompleted != "true"
}

// Disable default admin after first real admin login
func DisableDefaultAdminIfNeeded(newAdminUsername string) error {
	// Only disable if setup is completed and this is not the default admin logging in
	if !IsInitialSetup() && newAdminUsername != "admin" {
		// Check if default admin still exists and is active
		var defaultAdminExists int
		err := db.sqlite.QueryRow("SELECT COUNT(*) FROM users WHERE username = 'admin' AND is_admin = true").Scan(&defaultAdminExists)
		if err != nil {
			return err
		}

		if defaultAdminExists > 0 {
			// Mark the default admin as inactive (don't delete to preserve audit trail)
			_, err = db.sqlite.Exec("UPDATE users SET is_admin = false WHERE username = 'admin'")
			if err != nil {
				return err
			}
			
			// Log the action
			err = SaveSetting("default_admin_disabled_at", time.Now().Format(time.RFC3339))
			if err != nil {
				log.Printf("Warning: Could not save disable timestamp: %v", err)
			}
			
			log.Printf("🔒 Default admin 'admin' disabled after real admin '%s' logged in", newAdminUsername)
		}
	}
	return nil
}

// Get setup status information
func GetSetupStatus() map[string]interface{} {
	status := map[string]interface{}{
		"isInitialSetup": IsInitialSetup(),
		"setupCompleted": false,
		"hasDefaultAdmin": false,
		"adminCount": 0,
	}

	// Check setup completion
	setupCompleted, _ := GetSetting("setup_completed")
	status["setupCompleted"] = setupCompleted == "true"

	// Check if default admin exists and is active
	var defaultAdminActive int
	err := db.sqlite.QueryRow("SELECT COUNT(*) FROM users WHERE username = 'admin' AND is_admin = true").Scan(&defaultAdminActive)
	if err == nil {
		status["hasDefaultAdmin"] = defaultAdminActive > 0
	}

	// Count total active admins
	var adminCount int
	err = db.sqlite.QueryRow("SELECT COUNT(*) FROM users WHERE is_admin = true").Scan(&adminCount)
	if err == nil {
		status["adminCount"] = adminCount
	}

	return status
}