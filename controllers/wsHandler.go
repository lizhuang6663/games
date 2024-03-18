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

// 下面的函数可能出现空指针错误的原因：
// 1.前端发送的消息错误，导致 sli[index] 不存在。
// 2.前端运行的顺序逻辑出现问题，导致后端房间中的 UserB == nil （后端代码已经加过了判断，确保不会出现 UserB == nil 的时候，调用 UserB.UserId）

// SelectWords 挑选成语
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

// ChangeScore 更改分数
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
		fmt.Println("ChangeScore() dao.DbManager.ChangeScoreById() err = ", err)
		return
	}

	return "200", err
}

// CreateRoom 创建房间
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

	// 将分数清空
	userA.Score = 0

	room := &Room{
		UserA:  userA,
		RoomId: roomId,
		UserB:  nil,
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

	PrintAllRoom()

	return err
}

// GoRoom 玩家B进入房间
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

	// 将userB分数清空
	userB.Score = 0

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

	}

	// 存在该房间
	if room.UserB == nil { // 如果该房间中UserB的位置是空的，B可以加入房间
		room.UserB = userB
		fmt.Printf("玩家B %v 进入了房间 %v\n", userB, roomId)

		// 给B发送：确定收到
		mes.Data = "200"
		err = SedingMes(userBId, mes)
		if err != nil {
			fmt.Println("GoRoom() SedingMes() err = ", err)
			return
		}

		// // 玩家B进入房间后，给玩家A发送一个包(包含玩家B的信息)，给玩家B发送一个包（包含玩家A的信息）
		// resMes := &model.Message{
		// 	Type: 13,
		// }
		//
		// userA := room.UserA
		// idA := strconv.Itoa(userA.UserId)
		// idB := strconv.Itoa(userB.UserId)
		//
		// // 给A发玩家B的信息
		// resMes.Data = idB + " " + userB.UserSex
		// err = SedingMes(userA.UserId, resMes)
		// if err != nil {
		// 	fmt.Println("GoRoom() SedingMes() err = ", err)
		// 	return
		// }
		//
		// // 给B发玩家A的信息
		// resMes.Data = idA + " " + userA.UserSex
		// err = SedingMes(userB.UserId, resMes)
		// if err != nil {
		// 	fmt.Println("GoRoom() SedingMes() err = ", err)
		// 	return
		// }

	} else { // 如果该房间中UserB的位置不是空的，B不可以加入房间
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

	PrintAllRoom()

	return err
}

// B进入房间后，给两个人都发送对象的信息
func SedingInformationOfBoth(mes *model.Message) (err error) {
	roomId := mes.Data

	room, ok := roomMap.Get(roomId)
	if !ok {
		fmt.Printf("SedingInformationOfBoth() roomMap.Get() 不存在房间id 为 %v 的房间\n", roomId)
		return
	}

	// 玩家B进入房间后，给玩家A发送一个包(包含玩家B的信息)，给玩家B发送一个包（包含玩家A的信息）
	resMes := &model.Message{
		Type: 13,
	}

	// 如果A和B不为空
	if room.UserA != nil && room.UserB != nil {
		userA := room.UserA
		idA := strconv.Itoa(userA.UserId)
		userB := room.UserB
		idB := strconv.Itoa(userB.UserId)

		// 给A发玩家B的信息
		resMes.Data = idB + " " + userB.UserSex
		err = SedingMes(userA.UserId, resMes)
		if err != nil {
			fmt.Println("SedingInformationOfBoth() SedingMes() err = ", err)
			return
		}

		// 给B发玩家A的信息
		resMes.Data = idA + " " + userA.UserSex
		err = SedingMes(userB.UserId, resMes)
		if err != nil {
			fmt.Println("SedingInformationOfBoth() SedingMes() err = ", err)
			return
		}
	} else {
		fmt.Printf("房间id 为 %s 的房间内，两个用户未到齐", roomId)
	}

	return
}

// BeginGame 玩家A点击开始游戏
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
		resMes := &model.Message{
			Type: 14,
			Data: "房间人员还没有到齐，请等待...",
		}

		err = SedingMes(userAId, resMes)
		if err != nil {
			fmt.Println("BeginGame() SedingMes() err = ", err)
			return
		}
	} else {
		// 前端发送的userAId、roomId可能有问题...
		// 暂时不用补充代码...
	}

	PrintAllRoom()

	return
}

// ExitRoom 退出房间
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
	if room.UserA != nil && room.UserA.UserId == userId {
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
			Data: "0 0",
		}
		err = SedingMes(room.UserA.UserId, resMes)
		if err != nil {
			fmt.Println("ExitRoom() SedingMes() err = ", err)
			return
		}

	} else {
		err = fmt.Errorf("无法识别的 id ：%v", userId)
	}

	PrintAllRoom()

	return
}

// DoubleSelectWords 双人：开始游戏后，给A和B发送相同的词语
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

	// 房间人齐了，可以正常游戏
	if room.UserA != nil && room.UserB != nil {
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

	} else if room.UserA != nil && room.UserB == nil {
		resMes.Data = utils.ERROR_ROOM_NOTFULL.Error() // 房间人未齐
		err = SedingMes(room.UserA.UserId, resMes)
		if err != nil {
			fmt.Println("DoubleSelectWords() SedingMes() err = ", err)
			return
		}
	} else if room.UserB != nil && room.UserA == nil {
		resMes.Data = utils.ERROR_ROOM_NOTFULL.Error()
		err = SedingMes(room.UserB.UserId, resMes)
		if err != nil {
			fmt.Println("DoubleSelectWords() SedingMes() err = ", err)
			return
		}
	}

	PrintAllRoom()

	return
}

// ShareScoreAndChat 共享双人分数、双人聊天
func ShareScoreAndChat(mes *model.Message) (err error) {
	// 分割 mes.Data
	sli := strings.Split(mes.Data, " ")

	userId, err := strconv.Atoi(sli[0])
	if err != nil {
		fmt.Println("ShareScoreAndChat() strconv.Atoi() err = ", err)
		return
	}

	roomId := sli[2]

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
	if room.UserA != nil && userId == room.UserA.UserId {
		// 给A发确定
		err = SedingMes(room.UserA.UserId, resMes)
		if err != nil {
			fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
			return
		}

		// 如果B不是nil，就给B发消息
		if room.UserB != nil {
			// 前端传过来什么数据，就把什么数据发给B
			err = SedingMes(room.UserB.UserId, mes)
			if err != nil {
				fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
				return
			}
		}

		// 如果发送的内容是分数，更改 roomMap中的分数
		if mes.Type == 17 {
			score, err := strconv.Atoi(sli[3])
			if err != nil {
				fmt.Println("ShareScoreAndChat() strconv.Atoi() err = ", err)
				return err
			}
			room.UserA.Score = score
		}

	} else if room.UserB != nil && userId == room.UserB.UserId { //  给玩家B发送确定，给玩家A发送消息
		// 给B发确定
		err = SedingMes(room.UserB.UserId, resMes)
		if err != nil {
			fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
			return
		}

		// 如果A不是nil，就给A发消息
		if room.UserA != nil {
			// 前端传过来什么数据，就把什么数据发给A
			err = SedingMes(room.UserA.UserId, mes)
			if err != nil {
				fmt.Println("ShareScoreAndChat() SedingMes() err = ", err)
				return
			}
		}

		// 如果发送的内容是分数，更改 roomMap中的分数
		if mes.Type == 17 {
			score, err := strconv.Atoi(sli[3])
			if err != nil {
				fmt.Println("ShareScoreAndChat() strconv.Atoi() err = ", err)
				return err
			}
			room.UserB.Score = score
		}

	}

	return
}

// GameOverEnterRoom 游戏结束后，A或者B点击确认，给A或者B发确定，给玩家A发送一个包(包含玩家B的信息)，给玩家B发送一个包（包含玩家A的信息），A，B再次进入房间
func GameOverEnterRoom(mes *model.Message) (err error) {
	// 分割 mes.Data
	sli := strings.Split(mes.Data, " ")

	userId, err := strconv.Atoi(sli[0])
	if err != nil {
		fmt.Println("GameOverEnterRoom() strconv.Atoi() err = ", err)
		return
	}

	roomId := sli[1]
	room, ok := roomMap.Get(roomId)
	if !ok {
		fmt.Println("GameOverEnterRoom() roomMap.Get() 不存在这个房间")
		return
	}

	// 给A或者B发确定
	mes.Data = "200"
	err = SedingMes(userId, mes)
	if err != nil {
		fmt.Println("GameOverEnterRoom() SedingMes() err = ", err)
		return
	}

	// 玩家B进入房间后，给玩家A发送一个包(包含玩家B的信息)，给玩家B发送一个包（包含玩家A的信息）

	resMes := &model.Message{
		Type: 13,
	}


	if room.UserA != nil &&  room.UserB != nil{
		// 给A发玩家B的信息
		// 清空分数
		room.UserA.Score = 0

		resMes.Data = strconv.Itoa(room.UserB.UserId) + " " + room.UserB.UserSex
		err = SedingMes(room.UserA.UserId, resMes)
		if err != nil {
			fmt.Println("GameOverEnterRoom() SedingMes() err = ", err)
			return
		}


		// 给B发玩家A的信息
		room.UserB.Score = 0

		resMes.Data = strconv.Itoa(room.UserA.UserId) + " " + room.UserA.UserSex
		err = SedingMes(room.UserB.UserId, resMes)
		if err != nil {
			fmt.Println("GameOverEnterRoom() SedingMes() err = ", err)
			return
		}
	} else if room.UserA != nil &&  room.UserB == nil {// B 不存在，给A发 0 0
		room.UserA.Score = 0
		resMes.Data ="0 0"
		err = SedingMes(room.UserA.UserId, resMes)
		if err != nil {
			fmt.Println("GameOverEnterRoom() SedingMes() err = ", err)
			return
		}
	}
	
	// 如果A不在房间里，这个房间也找不到，前面就会直接退出了

	return
}

// SedingMes 给某个id发送消息
func SedingMes(id int, mes *model.Message) (err error) {

	fmt.Println("--------------------------------------------------------------------------------------------------------------")
	PrintAllRoom()

	fmt.Println("\n\n-------------------------------------")
	fmt.Println("某位用户成功连接到后端，目前在线的用户为：")
	for i, v := range onlineMap.clients {
		fmt.Println("userid = ", i, "Client = ", v)
	}
	fmt.Print("-------------------------------------\n\n\n")

	fmt.Println("--------------------------------------------------------------------------------------------------------------")

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

// PrintAllRoom 打印当前所有房间的信息
func PrintAllRoom() {
	fmt.Println("\n-------------------------------------")

	for _, v := range roomMap.room {
		fmt.Printf("当前存在的 roomId = %v，UserA = %v，UserB = %v\n", v.RoomId, v.UserA, v.UserB)
	}

	fmt.Print("-------------------------------------\n\n")
}
