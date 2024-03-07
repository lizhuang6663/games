package controllers

import (
	"IdiomGames/model"
	"sync"
)

// 安全锁、存放房间
type RoomMap struct {
	mu   sync.Mutex // 锁
	room map[string]*Room
}

// 房间结构体(如果后期开发需要多人聊天，多人比赛，需要将UserA，UserB改为一个map，存放房间内的用户)
type Room struct {
	UserA  *model.User // 玩家A是房主
	RoomId string
	UserB  *model.User
}

// 创建一个新的 RoomMap 实例
func NewRoomMap() *RoomMap {
	return &RoomMap{
		room: make(map[string]*Room),
	}
}

// 设置房间数据
func (this *RoomMap) Set(roomId string, room *Room) {
	this.mu.Lock()
	defer this.mu.Unlock()

	this.room[roomId] = room
}

// 获取房间数据
func (this *RoomMap) Get(roomId string) (*Room, bool) {
	this.mu.Lock()
	defer this.mu.Unlock()

	room, ok := this.room[roomId]
	return room, ok
}

// 根据 roomId 删除房间数据
func (this *RoomMap) Del(roomId string) {
	this.mu.Lock()
	defer this.mu.Unlock()

	delete(this.room, roomId)
}

// 获取所有房间数据
func (this *RoomMap) GetAll() map[string]*Room {
	this.mu.Lock()
	defer this.mu.Unlock()

	return this.room
}
