package models

type Swipe struct {
	UserID1   string `json:"user_id_1"`
	UserID2   string `json:"user_id_2"`
	Decision1 *bool  `json:"decision_1"` // true - лайк, false - дизлайк, null - не определено
	Decision2 *bool  `json:"decision_2"` // true - лайк, false - дизлайк, null - не определено
}
