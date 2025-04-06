package main

type SwipeEvent struct {
	SwiperUserID int    `json:"swiper_user_id"`
	SwipedUserID int    `json:"swiped_user_id"`
	Action       string `json:"action"`
	Timestamp    string `json:"timestamp"`
}
