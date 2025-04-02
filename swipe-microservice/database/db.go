package database

import (
	"fmt"
	"os"

	"swipe-microservice/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() error {
	// Получаем параметры подключения из переменных окружения или используем значения по умолчанию
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5400")
	user := getEnv("DB_USER", "swipe_user")
	password := getEnv("DB_PASSWORD", "swipe_pass")
	dbname := getEnv("DB_NAME", "swipe_db")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, password, dbname, port)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	DB.AutoMigrate(&models.Swipe{}) // Автоматически создает таблицу для модели Swipe
	return nil
}

// getEnv получает значение из переменной окружения или возвращает значение по умолчанию
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
