package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"swipe-microservice/database"
	"swipe-microservice/models"
)

// SwipeRequest - структура для запроса свайпа
type SwipeRequest struct {
	UserID   string `json:"user_id"`
	TargetID string `json:"target_id"`
	Decision bool   `json:"decision"`
}

// Response - общая структура ответа
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// MatchResponse - структура ответа при совпадении (match)
type MatchResponse struct {
	IsMatch bool   `json:"is_match"`
	UserID  string `json:"user_id,omitempty"`
}

// MatchesListResponse - список совпадений пользователя
type MatchesListResponse struct {
	Matches []string `json:"matches"`
}

func main() {
	// Инициализация БД
	err := database.InitDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Настройка маршрутов
	http.HandleFunc("/api/swipe", handleSwipe)
	http.HandleFunc("/api/matches", handleGetMatches)

	// Запуск сервера
	port := ":8080"
	fmt.Printf("Server is running on port %s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

// handleSwipe обрабатывает запросы на свайп (лайк/дизлайк)
func handleSwipe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendResponse(w, http.StatusMethodNotAllowed, Response{
			Success: false,
			Message: "Method not allowed. Use POST",
		})
		return
	}

	var req SwipeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendResponse(w, http.StatusBadRequest, Response{
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	// Проверяем входные данные
	if req.UserID == "" || req.TargetID == "" {
		sendResponse(w, http.StatusBadRequest, Response{
			Success: false,
			Message: "User ID and Target ID are required",
		})
		return
	}

	// Обрабатываем свайп
	isMatch, err := processSwipe(req.UserID, req.TargetID, req.Decision)
	if err != nil {
		sendResponse(w, http.StatusInternalServerError, Response{
			Success: false,
			Message: "Failed to process swipe",
		})
		return
	}

	// Возвращаем результат
	sendResponse(w, http.StatusOK, Response{
		Success: true,
		Data: MatchResponse{
			IsMatch: isMatch,
			UserID:  req.TargetID,
		},
	})
}

// handleGetMatches возвращает список пользователей, с которыми есть взаимный лайк
func handleGetMatches(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendResponse(w, http.StatusMethodNotAllowed, Response{
			Success: false,
			Message: "Method not allowed. Use GET",
		})
		return
	}

	// Получаем ID пользователя из параметров запроса
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		sendResponse(w, http.StatusBadRequest, Response{
			Success: false,
			Message: "User ID is required",
		})
		return
	}

	// Получаем список совпадений
	matches, err := getUserMatches(userID)
	if err != nil {
		sendResponse(w, http.StatusInternalServerError, Response{
			Success: false,
			Message: "Failed to get matches",
		})
		return
	}

	// Возвращаем результат
	sendResponse(w, http.StatusOK, Response{
		Success: true,
		Data: MatchesListResponse{
			Matches: matches,
		},
	})
}

// getUserMatches возвращает список ID пользователей, с которыми есть взаимный лайк
func getUserMatches(userID string) ([]string, error) {
	db := database.DB
	var matches []string

	// Ищем все записи, где первый пользователь - это userID и оба поставили лайк
	var swipes1 []models.Swipe
	if err := db.Where("user_id1 = ? AND decision1 = ? AND decision2 = ?", userID, true, true).Find(&swipes1).Error; err != nil {
		return nil, err
	}

	// Добавляем ID второго пользователя в список совпадений
	for _, swipe := range swipes1 {
		matches = append(matches, swipe.UserID2)
	}

	// Ищем все записи, где второй пользователь - это userID и оба поставили лайк
	var swipes2 []models.Swipe
	if err := db.Where("user_id2 = ? AND decision1 = ? AND decision2 = ?", userID, true, true).Find(&swipes2).Error; err != nil {
		return nil, err
	}

	// Добавляем ID первого пользователя в список совпадений
	for _, swipe := range swipes2 {
		matches = append(matches, swipe.UserID1)
	}

	return matches, nil
}

// processSwipe обрабатывает свайп и возвращает true, если произошло совпадение (match)
func processSwipe(userID, targetID string, decision bool) (bool, error) {
	db := database.DB

	// Формируем порядок ID (чтобы избежать дублирования записей)
	userID1, userID2 := orderUserIDs(userID, targetID)

	// Ищем существующую запись
	var swipe models.Swipe
	result := db.Where("user_id1 = ? AND user_id2 = ?", userID1, userID2).First(&swipe)

	dec := decision // Преобразуем в указатель для хранения

	// Если запись не найдена, создаем новую
	if result.Error != nil {
		newSwipe := models.Swipe{
			UserID1: userID1,
			UserID2: userID2,
		}

		// Устанавливаем решение для правильного пользователя
		if userID == userID1 {
			newSwipe.Decision1 = &dec
		} else {
			newSwipe.Decision2 = &dec
		}

		if err := db.Create(&newSwipe).Error; err != nil {
			return false, err
		}

		return false, nil // Нет совпадения, так как это первый свайп
	}

	// Обновляем существующую запись
	if userID == userID1 {
		swipe.Decision1 = &dec
	} else {
		swipe.Decision2 = &dec
	}

	if err := db.Save(&swipe).Error; err != nil {
		return false, err
	}

	// Проверяем, есть ли совпадение (match)
	isMatch := swipe.Decision1 != nil && swipe.Decision2 != nil && *swipe.Decision1 && *swipe.Decision2

	return isMatch, nil
}

// orderUserIDs упорядочивает ID пользователей для консистентности в БД
func orderUserIDs(id1, id2 string) (string, string) {
	if id1 < id2 {
		return id1, id2
	}
	return id2, id1
}

// sendResponse отправляет JSON-ответ клиенту
func sendResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}
