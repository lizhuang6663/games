package controllers

import (
	"IdiomGames/dao"
	"IdiomGames/model"
	"IdiomGames/utils"
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
	"strconv"
)

// websocket

// 用于升级
var (
	upgrader = websocket.Upgrader{
		WriteBufferSize: 1024, // 设置写缓冲区的大小，即服务器向客户端发送消息时使用的缓冲区大小。
		ReadBufferSize:  1024, // 设置读缓冲区的大小，即服务器从客户端接收消息时使用的缓冲区大小。
		CheckOrigin: func(r *http.Request) bool {
			return true // 检查来自客户端的请求的来源。我们设置为始终返回 true，表示接受来自任何来源的连接请求。
		},
	}
)

// 全局变量 map
var (
	onlineMap *OnlineMap
	roomMap   *RoomMap
)

// 初始化 存放在线用户的 map
func InitMap() {
	onlineMap = NewOnlineMap()
	roomMap = NewRoomMap()
}

// 游戏开始(单人，双人)
func WSBegin(w http.ResponseWriter, r *http.Request) {
	// conn 是用户和后端的链接，如果没有用户连接，程序会在这里阻塞，不同的用户对应不同的Conn
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil { // 不能return
		fmt.Println("wsBegin() upgrader.Upgrade() err = ", err)
	} else {
		fmt.Println("某位用户成功连接到后端，for循环等待发送用户id......")
		// fmt.Println("用户进入游戏, conn = ", conn)
	}

	// 处理发送的信息，并给前端发送信息
	go process(conn)

	// 阻塞（也可以换成 for{} ）
	select {}
}

// 处理信息
func process(conn *websocket.Conn) {
	defer func() {
		// 根据conn从map中删除在线用户
		onlineMap.DelByConn(conn)
		conn.Close()
	}()

	wsTransfer := &utils.WSTransfer{
		Conn: conn,
	}

	// fmt.Println(conn)

	// 更新websocket链接
	// 一直循环读取前端发送的userId，直到成功读取到id
	for {
		// 读取数据
		m, err := wsTransfer.ReadPkg()
		if err != nil {
			fmt.Println("wsBegin() transfer.ReadPkg() err = ", err)
			return
		}

		// 接收前端传入的 user 对象，如果type == 2，接收前端传递的userId，并给用户分配一个Conn，把这个id，和Conn存储在clients中（要加锁）
		user := &model.User{}

		// 使用类型断言将 接口m 转换为 model.Message 类型
		mes, ok := m.(model.Message)
		if !ok {
			// 转换失败，处理错误
			fmt.Println("wsBegin() m.(model.Message) Failed to convert data to Message type")
		}

		if mes.Type == 2 {
			id, err := strconv.Atoi(mes.Data)
			if err != nil {
				fmt.Println("wsBegin() strconv.Atoi() err = ", err)
			}

			resMes := &model.Message{
				Type: 2,
			}
			user, err = dao.DbManager.GetUserById(id)
			if err != nil { // 说明该id不存在
				fmt.Println("wsBegin() dao.DbManager.GetUserById() err = ", err)
				resMes.Data = ""
			} else {
				// 将在线的用户id，及其对应的 conn 存到 map 中
				onlineMap.Set(user.UserId, conn)
				resMes.Data = "200"
			}

			// 如果前端接收到了包，才可以进行下一步，如果前端无法接收到这个包，就要一直发送用户的id
			err = wsTransfer.WritePkg(resMes)
			if err != nil {
				fmt.Println("wsBegin() transfer.WritePkg() err = ", err)
			}
			if resMes.Data == "200" {
				fmt.Println("接收到前端发送的用户id，退出for循环...")
				break
			}

		}
	}

	fmt.Println("\n\n-------------------------------------")
	fmt.Println("某位用户成功连接到后端，目前在线的用户为：")
	for i, v := range onlineMap.clients {
		fmt.Println("userid = ", i, "Client = ", v)
	}
	fmt.Println("-------------------------------------\n\n")

	// 正式的业务处理：
	for { // 循环接收消息
		// 读取
		m, err := wsTransfer.ReadPkg()
		if err != nil {
			fmt.Println("wsBegin() wsTransfer.ReadPkg() err = ", err)
			return
		}

		// 判断读取的信息是什么类型

		// 使用类型断言将 接口m 转换为 model.Message 类型
		mes, ok := m.(model.Message)
		if ok { // 如果可以将接口 m 转换为 model.Message 类型
			switch mes.Type {

			case 3: // 前端需要成语，后端给前端发送成语
				str, _ := SelectWords(&mes)
				mes.Type = 3
				mes.Data = str

				// 给前端传递数据
				err = wsTransfer.WritePkg(mes)
				if err != nil {
					fmt.Println("wsBegin() wsTransfer.WritePkg() err = ", err)
					return
				}

			case 4: // 前端给后端传递分数，后端接收分数，并在数据库中更改
				str, _ := ChangeScore(&mes)
				mes.Type = 4
				mes.Data = str

				// 给前端传递数据
				err = wsTransfer.WritePkg(mes)
				if err != nil {
					fmt.Println("wsBegin() wsTransfer.WritePkg() err = ", err)
					return
				}

			case 11: // 双人：创建房间
				err = CreateRoom(&mes)
				if err != nil {
					fmt.Println("CreateRoom() CreateRoom() err = ", err)
					return
				}

			case 12: // 玩家B进入房间
				err = GoRoom(&mes)
				if err != nil {
					fmt.Println("wsBegin() GoRoom() err = ", err)
					return
				}

			case 14: // 玩家A点击开始游戏
				err = BeginGame(&mes)
				if err != nil {
					fmt.Println("wsBegin() BeginGame() err = ", err)
					return
				}

			case 15: // 退出房间
				err = ExitRoom(&mes)
				if err != nil {
					fmt.Println("wsBegin() ExitRoom() err = ", err)
					return
				}

			case 16: // 双人游戏，发送相同的词语
				err = DoubleSelectWords(&mes)
				if err != nil {
					fmt.Println("wsBegin() DoubleSelectWords() err = ", err)
					return
				}

			case 17: // 实时发送分数
				// err = ShareScore(&mes)
				err = ShareScoreAndChat(&mes)
				if err != nil {
					fmt.Println("wsBegin() ShareScoreAndChat() err = ", err)
					return
				}

			case 18: // 双人聊天
				// err = DoubleChat(&mes)
				err = ShareScoreAndChat(&mes)
				if err != nil {
					fmt.Println("wsBegin() ShareScoreAndChat() err = ", err)
					return
				}

			case 20: // 双人对战结束后，再次进入房间
				err = GameOverEnterRoom(&mes)
				if err != nil {
					fmt.Println("wsBegin() GameOverEnterRoom() err = ", err)
					return
				}

			default:
				fmt.Println("无法识别的 mes.Type = ", mes.Type)
			}

		}

		// 心跳检测
		// 判断是否可以转换为 string 类型
		s, ok := m.(string)
		if ok && s == "PING" {
			// 回复客户端心跳消息
			err = wsTransfer.WritePkg("PONG")
			if err != nil {
				fmt.Println("wsBegin() wsTransfer.WritePkg() err = ", err)
				return
			}
		}

	}
}
