package model

// User 用户结构体
type User struct {
	UserId  int    `json:"userId"`
	UserPwd string `json:"userPwd"`
	UserSex string `json:"userSex"`
	Score   int    `json:"score"`
}
