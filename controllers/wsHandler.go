package controllers

import (
	"IdiomGames/dao"
	"IdiomGames/model"
	"IdiomGames/utils"
	"fmt"
	"strconv"
	"strings"
)

// 业务逻辑，具体的每个函数的执行逻辑

// 更新websocket链接
// func UpdateWS(mes *model.Message, newWS *utils.WSTransfer) (str string, err error) {
// 	userId, err := strconv.Atoi(mes.Data)
// 	if err != nil {
// 		fmt.Println("UpdateWS() strconv.Atoi() err = ", err)
// 		return
// 	}
//
// 	conn, ok := onlineMap.Get(userId)
// 	if !ok {
// 		fmt.Println("UpdateWS() onlineMap.Get() 不能存在这个链接")
// 		return
// 	}
//
// 	// 更新
// 	if conn != nil {
// 		onlineMap.Set(userId, newWS.Conn)
// 	}
//
// 	return "200", nil
// }

// 挑选成语
func SelectWords(mes *model.Message) (str string, err error) {
	// 分割 mes.Data
	sli := strings.Split(mes.Data, " ")

	difficulty, err := strconv.Atoi(sli[0])
	if err != nil {
		fmt.Println("SelectWords() strconv.Atoi() err = ", err)
		return
	}
	numOfWords, err := strconv.Atoi(sli[1])
	if err != nil {
		fmt.Println("SelectWords() strconv.Atoi() err = ", err)
		return
	}

	str, err = dao.DbManager.RandomWords(difficulty, numOfWords)
	if err != nil {
		fmt.Println("SelectWords() dao.DbManager.RandomWords() err = ", err)
		return
	}

	return str, err
}

// 更改分数
func ChangeScore(mes *model.Message) (str string, err error) {
	// 分割 mes.Data
	sli := strings.Split(mes.Data, " ")
	userId, err := strconv.Atoi(sli[0])
	if err != nil {
		fmt.Println("ChangeScore() strconv.Atoi() err = ", err)
		return
	}
	score, err := strconv.Atoi(sli[1])
	if err != nil {
		fmt.Println("ChangeScore() strconv.Atoi() err = ", err)
		return
	}

	err = dao.DbManager.ChangeScoreById(userId, score)
	if err != nil {
		fmt.Println("ChangeScore() dbManager.ChangeScoreById() err = ", err)
		return
	}

	return "200", err
}

// 创建房间
func CreateRoom(mes *model.Message) (err error) {
	// 分割 mes.Data
	sli := strings.Split(mes.Data, " ")

	userAId, err := strconv.Atoi(sli[0])
	if err != nil {
		fmt.Println("CreateRoom() strconv.Atoi() err = ", err)
		return
	}

	roomId := sli[1]

	// 获取到UserA
	userA, err := dao.DbManager.GetUserById(userAId)
	if err != nil {
		fmt.Println("CreateRoom() dao.DbManager.GetUserById() err = ", err)
		return
	}

	room := &Room{
		UserA:     userA,
		RoomId:    roomId,
		UserB:     nil,
		BeginGame: false,
	}
	// 创建房间
	roomMap.Set(roomId, room)

	// 给玩家A发消息
	mes.Type = 11
	mes.Data = "200"
	err = SedingMes(userAId, mes)
	if err != nil {
		fmt.Println("CreateRoom() SedingMes() err = ", err)
		return
	}

	fmt.Printf("玩家A %v 创建了房间 %v\n", userA, roomId)

	fmt.Println("\n-------------------------------------")
	for _, v := range roomMap.room {
		fmt.Println("当前存在的房间为：", v.UserA, v.RoomId, v.UserB, v.BeginGame)
	}
	fmt.Println("-------------------------------------\n\n")

	return err
}

// 玩家B进入房间
func GoRoom(mes *model.Message) (err error) {
	// 分割 mes.Data
	sli := strings.Split(mes.Data, " ")

	userBId, err := strconv.Atoi(sli[0])
	if err != nil {
		fmt.Println("GoRoom() strconv.Atoi() err = ", err)
		return
	}

	roomId := sli[1]

	userB, err := dao.DbManager.GetUserById(userBId)
	if err != nil {
		fmt.Println("GoRoom() dao.DbManager.GetUserById() err = ", err)
		return
	}

	room, ok := roomMap.Get(roomId)
	if !ok {
		fmt.Printf("GoRoom() roomMap.Get() 不存在房间id 为 %v 的房间\n", roomId)
		// 不存在这个房间
		mes.Data = utils.ERROR_ROOM_NOTEXISTS.Error()

		// 给B发消息
		err = SedingMes(userBId, mes)
		if err != nil {
			fmt.Println("GoRoom() SedingMes() err = ", err)
			return
		}
		return

	} else { // 存在该房间

		if room.UserB == nil {
			room.UserB = userB
			fmt.Printf("玩家B %v 进入了房间 %v\n", userB, roomId)

			// 给玩家B发信息
			mes.Type = 12
			if mes.Data != "200" {
				mes.Data = "200"
			}
			// 给B发送：确定收到
			err = SedingMes(userBId, mes)
			if err != nil {
				fmt.Println("GoRoom() SedingMes() err = ", err)
				return
			}

			// 玩家B进入房间后，给玩家A发送一个包(包含玩家B的信息)，给玩家B发送一个包（包含玩家A的信息）
			mes2 := &model.Message{
				Type: 13,
			}

			userA := room.UserA
			idA := strconv.Itoa(userA.UserId)
			idB := strconv.Itoa(userB.UserId)

			// 给A发
			// mes2.Data = idA + " " + userA.UserSex + " " + idB + " " + userB.UserSex
			mes2.Data = idB + " " + userB.UserSex
			err = SedingMes(userA.UserId, mes2)
			if err != nil {
				fmt.Println("GoRoom() SedingMes() err = ", err)
				return
			}

			// 给B发
			// mes2.Data = idB + " " + userB.UserSex + " " + idA + " " + userA.UserSex
			mes2.Data = idA + " " + userA.UserSex
			err = SedingMes(userB.UserId, mes2)
			if err != nil {
				fmt.Println("GoRoom() SedingMes() err = ", err)
				return
			}

		} else {
			fmt.Printf("玩家B %v 无法进入房间 %v，该房间已满\n", userB, roomId)
			// 房间已经满了
			mes.Type = 12
			mes.Data = utils.ERROR_ROOM_FULL.Error()

			// 给B发送：房间已满
			err = SedingMes(userBId, mes)
			if err != nil {
				fmt.Println("GoRoom() SedingMes() err = ", err)
				return
			}
		}

	}

	fmt.Println("\n-------------------------------------")
	for _, v := range roomMap.room {
		fmt.Println("当前存在的房间为：", v.UserA, v.RoomId, v.UserB, v.BeginGame)
	}
	fmt.Println("-------------------------------------\n\n")

	return err
}

// 玩家A点击开始游戏
func BeginGame(mes *model.Message) (err error) {
	// 分割 mes.Data
	sli := strings.Split(mes.Data, " ")
	userAId, err := strconv.Atoi(sli[0])
	if err != nil {
		fmt.Println("BeginGame() strconv.Atoi() err = ", err)
		return
	}

	roomId := sli[1]

	// 获取房间
	room, ok := roomMap.Get(roomId)
	if !ok {
		fmt.Println("BeginGame() roomMap.Get() 不存在这个房间")
		return
	}

	// 给两个玩家发送 200
	if room.UserA != nil && room.UserA.UserId == userAId && room.UserB != nil && room.RoomId == roomId {
		room.BeginGame = true

		mes := &model.Message{
			Type: 14,
			Data: "200",
		}

		err = SedingMes(room.UserA.UserId, mes)
		if err != nil {
			fmt.Println("BeginGame() SedingMes() err = ", err)
			return
		}

		err = SedingMes(room.UserB.UserId, mes)
		if err != nil {
			fmt.Println("BeginGame() SedingMes() err = ", err)
			return
		}
	} else if room.UserB == nil {
		// 房间人员没有到齐...
		mes := &model.Message{
			Type: 14,
			Data: "房间人员还没有到齐，请等待...",
		}

		err = SedingMes(userAId, mes)
		if err != nil {
			fmt.Println("BeginGame() SedingMes() err = ", err)
			return
		}
	}

	fmt.Println("\n-------------------------------------")
	for _, v := range roomMap.room {
		fmt.Println("当前存在的房间为：", v.UserA, v.RoomId, v.UserB, v.BeginGame)
	}
	fmt.Println("-------------------------------------\n\n")

	return
}

// 退出房间
func ExitRoom(mes *model.Message) (err error) {
	// 分割 mes.Data
	sli := strings.Split(mes.Data, " ")
	userId, err := strconv.Atoi(sli[0])
	if err != nil {
		fmt.Println("ExitRoom() strconv.Atoi() err = ", err)
		return
	}

	roomId := sli[1]

	room, ok := roomMap.Get(roomId)
	if !ok {
		fmt.Println("ExitRoom() roomMap.Get() 不存在这个房间")
		return
	}

	mes.Data = "200"

	// 1.房主退出房间。将房间销毁、给A，B发消息
	if room.UserA.UserId == userId {
		fmt.Printf("房主 %v 退出了房间，将房间 %v 销毁...\n", room.UserA, room.RoomId)

		// 销毁房间
		roomMap.Del(sli[1])

		// 给玩家A发消息
		err = SedingMes(userId, mes)
		if err != nil {
			fmt.Println("ExitRoom() SedingMes() err = ", err)
			return
		}

		// 如果玩家B在房间里面，给B发消息；如果不在房间里面就什么也不干
		if room.UserB != nil {
			err = SedingMes(room.UserB.UserId, mes)
			if err != nil {
				fmt.Println("ExitRoom() SedingMes() err = ", err)
				return
			}
		}

	} else if room.UserB != nil && room.UserB.UserId == userId {
		// 2.对手退出房间。将UserB置为nil、给A，B发消息
		fmt.Printf("玩家 %v 退出了房间...\n", room.UserB)
		room.UserB = nil

		// 给B发消息
		err = SedingMes(userId, mes)
		if err != nil {
			fmt.Println("ExitRoom() SedingMes() err = ", err)
			return
		}

		// 给玩家A发送
		resMes := &model.Message{
			Type: 13,
			Data: strconv.Itoa(room.UserA.UserId) + " " + room.UserA.UserSex + " " + "0 0",
		}
		err = SedingMes(room.UserA.UserId, resMes)
		if err != nil {
			fmt.Println("ExitRoom() SedingMes() err = ", err)
			return
		}

	} else {
		err = fmt.Errorf("无法识别的 id ：%v", userId)
	}

	return
}

// 双人：开始游戏后，给A和B发送相同的词语
func DoubleSelectWords(mes *model.Message) (err error) {
	// 分割 mes.Data
	sli := strings.Split(mes.Data, " ")

	roomId := sli[0]

	difficulty, err := strconv.Atoi(sli[1])
	if err != nil {
		fmt.Println("DoubleSelectWords() strconv.Atoi() err = ", err)
		return
	}
	numOfWords, err := strconv.Atoi(sli[2])
	if err != nil {
		fmt.Println("DoubleSelectWords() strconv.Atoi() err = ", err)
		return
	}

	data, err := dao.DbManager.RandomWords(difficulty, numOfWords)
	if err != nil {
		fmt.Println("DoubleSelectWords() dao.DbManager.RandomWords() err = ", err)
		return
	}

	room, ok := roomMap.Get(roomId)
	if !ok {
		fmt.Println("DoubleSelectWords() roomMap.Get() 不存在这个房间")
		return
	}

	// 给玩家A，玩家B发送相同的词语
	resMes := &model.Message{
		Type: 16,
		Data: data,
	}

	// 有对手，可以正常游戏
	if room.UserB != nil {
		err = SedingMes(room.UserA.UserId, resMes)
		if err != nil {
			fmt.Println("DoubleSelectWords() SedingMes() err = ", err)
			return
		}

		err = SedingMes(room.UserB.UserId, resMes)
		if err != nil {
			fmt.Println("DoubleSelectWords() SedingMes() err = ", err)
			return
		}

	}

	return
}

// 实时共享分数
func ShareScore(mes *model.Message) (err error) {
	// 分割 mes.Data
	sli := strings.Split(mes.Data, " ")

	userId, err := strconv.Atoi(sli[0])
	if err != nil {
		fmt.Println("ShareScoreAndChat() strconv.Atoi() err = ", err)
		return
	}

	roomId := sli[2]
	// score := sli[2]

	room, ok := roomMap.Get(roomId)
	if !ok {
		fmt.Println("RealTimeShareScore() roomMap.Get() 不存在这个房间")
		return
	}

	// 确定消息
	resMes := &model.Message{
		Type: 19,
		Data: "200",
	}

	// 给玩家A发送确定，给玩家B发送消息
	if userId == room.UserA.UserId {
		// 给A发确定
		err = SedingMes(room.UserA.UserId, resMes)
		if err != nil {
			fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
			return
		}

		// 如果B不是nil，就给B发消息
		if room.UserB != nil {
			// 给B发消息
			// mes.Data = score
			err = SedingMes(room.UserB.UserId, mes)
			if err != nil {
				fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
				return
			}
		}

	} else if userId == room.UserB.UserId { //  给玩家B发送确定，给玩家A发送消息
		// 给B发确定
		err = SedingMes(room.UserB.UserId, resMes)
		if err != nil {
			fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
			return
		}

		// 如果B不是nil，就给B发消息
		if room.UserA != nil {
			// 给A发消息
			// mes.Data = score
			err = SedingMes(room.UserA.UserId, mes)
			if err != nil {
				fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
				return
			}
		}

	}

	return
}

// 聊天
func DoubleChat(mes *model.Message) (err error) {
	// 分割 mes.Data
	sli := strings.Split(mes.Data, " ")

	userId, err := strconv.Atoi(sli[0])
	if err != nil {
		fmt.Println("ShareScoreAndChat() strconv.Atoi() err = ", err)
		return
	}

	// sex := sli[1]
	roomId := sli[2]
	// fmt.Println(roomId)
	// data := sli[3] // 分数、聊天的消息

	room, ok := roomMap.Get(roomId)
	if !ok {
		fmt.Println("RealTimeShareScore() roomMap.Get() 不存在这个房间")
		return
	}

	// 确定消息
	resMes := &model.Message{
		Type: 19,
		Data: "200",
	}

	// 给玩家A发送确定，给玩家B发送消息
	if userId == room.UserA.UserId {
		// 给A发确定
		err = SedingMes(room.UserA.UserId, resMes)
		if err != nil {
			fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
			return
		}

		// 如果B不是nil，就给B发消息
		if room.UserB != nil {
			// 把mes.Data 全部发送给B
			// mes.Data = data
			err = SedingMes(room.UserB.UserId, mes)
			if err != nil {
				fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
				return
			}
		}

	} else if userId == room.UserB.UserId { //  给玩家B发送确定，给玩家A发送消息
		// 给B发确定
		err = SedingMes(room.UserB.UserId, resMes)
		if err != nil {
			fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
			return
		}

		// 如果B不是nil，就给B发消息
		if room.UserA != nil {
			// 给A发消息
			// mes.Data = data
			err = SedingMes(room.UserA.UserId, mes)
			if err != nil {
				fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
				return
			}
		}

	}

	return
}

func SedingMes(id int, mes *model.Message) (err error) {
	// 获取websocket链接
	conn, ok := onlineMap.Get(id)
	if !ok {
		fmt.Printf("SedingMes() onlineMap.Get() 没有找到 id 为 %v 的在线玩家\n", id)
		return
	}

	// 创建对象
	ws := utils.WSTransfer{
		Conn: conn,
	}

	// 给这个id发信息
	err = ws.WritePkg(mes)
	if err != nil {
		fmt.Println("SedingMes() ws.WritePkg() err = ", err)
		return
	}

	return err
}
