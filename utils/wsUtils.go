package utils

import (
	"IdiomGames/model"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/websocket"
)

// websocket 读取和写信息

type WSTransfer struct {
	Conn *websocket.Conn
}

// ReadPkg 读取（读取任意类型的结构体，并返回任意类型的结构体）
func (this *WSTransfer) ReadPkg() (m interface{}, err error) {
	mesType, data, err := this.Conn.ReadMessage()
	if err != nil {
		fmt.Println("ReadPkg() this.Conn.ReadMessage() err = ", err)
		return
	}
	fmt.Printf("ReadPkg() 接收到的类型为: %v，内容为：%v\n", mesType, string(data))

	// 尝试解析为 model.Message 类型
	var mes model.Message
	err = json.Unmarshal(data, &mes)

	if mes.Type != 0 && mes.Data != "" {
		fmt.Printf("ReadPkg() 反序列化后的数据为:mes.Type = %v, mes.Data = %v\n", mes.Type, mes.Data)
		return mes, nil
	}

	// 心跳检测（这里是读取数据，不是真正的心跳检测）
	// 判断读取的数据是否为 "ping" 或者 "PING"
	var s string
	if string(data) == "PING" {
		s = string(data)
		return s, nil
	}

	// 如果解析都失败，则返回错误
	return nil, errors.New("不能解析的数据")
}

// WritePkg 写（传入任意结构体，将结构体序列化，并写给前端）
func (this *WSTransfer) WritePkg(m interface{}) (err error) {
	data, err := json.Marshal(m)
	if err != nil {
		fmt.Println("WritePkg() json.Marshal() err = ", err)
		return
	}

	err = this.Conn.WriteMessage(websocket.TextMessage, data)
	if err != nil {
		fmt.Println("WritePkg() this.Conn.WriteMessage() err = ", err)
		return
	}
	fmt.Printf("WritePkg() 发送的信息为 %v\n", string(data))

	return
}
