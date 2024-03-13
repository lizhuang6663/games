package controllers

import (
	"github.com/gorilla/websocket"
	"sync"
)

// OnlineMap 安全锁、存放在线用户
type OnlineMap struct {
	mu      sync.Mutex // 锁
	clients map[int]*Client
}

// Client 结构体
type Client struct {
	UserId int
	Conn   *websocket.Conn
}

func NewOnlineMap() *OnlineMap {
	return &OnlineMap{
		clients: map[int]*Client{},
	}
}

// Set 设置数据
func (this *OnlineMap) Set(id int, conn *websocket.Conn) {
	this.mu.Lock()
	defer this.mu.Unlock()

	client := Client{
		UserId: id,
		Conn:   conn,
	}
	this.clients[id] = &client
}

// Get 获取数据
func (this *OnlineMap) Get(id int) (conn *websocket.Conn, ok bool) {
	this.mu.Lock()
	defer this.mu.Unlock()
	client, ok := this.clients[id] // 说明该id在线
	if ok {
		conn = client.Conn
	}
	return conn, ok
}

// DelById 根据 id 删除数据
func (this *OnlineMap) DelById(id int) {
	this.mu.Lock()
	defer this.mu.Unlock()
	delete(this.clients, id)
}

// DelByConn 根据 Conn 删除数据
func (this *OnlineMap) DelByConn(conn *websocket.Conn) {
	this.mu.Lock()
	defer this.mu.Unlock()

	for i, v := range this.clients {
		if conn == v.Conn {
			delete(this.clients, i)
			break
		}
	}
}
