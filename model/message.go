package model

/*


除了登录，注册以外，其他的消息交互使用的全部是 Message结构体：{"type" : __, "data" : "__" }

单人游戏：
排行榜
前端发送{"type" : 1, "data" : "n"}，后端发送{"type" : 1, "data" : "{\"userId\":100,\"userPwd\":\"123456\",\"userSex\":\"男\",\"score\":363},{\"userId\":800,\"userPwd\":\"123456\",\":\"男\",\"score\":300}, ....." }

前端再次输入userId
前端{"type" : 2, "data" : "userId"} 后端{"type" : 2, "data" : "200"}

获取成语
前端{"type" : 3, "data" : "Difficulty NumOfWords"} 后端{"type" : 3, "data" : ""井井有条 轻松愉快 各抒己见 ..."}

发送分数
前端{"type" : 4, "data" : "userId score"} 后端{"type" : 4, "data" : "200"}



---------------------------------------------------------------------------------------------------------------------


双人游戏：
1.玩家A创建房间
前端发送{"type" : 11, "data" : "UserAId RoomId"} 后端成功接收到信息就发送{"type" : 11, "data" : "200"}，如果没有接收到信息就发送{"type" : 11, "data" : ""}

2.玩家B进入房间
前端发送{"type" : 12, "data" : "UserBId RoomId"}
后端发送：{"type":12,"data":"200"}
{"type":12,"data":"房间不存在"}
{"type":12,"data":"房间已满"}

3.当玩家B进入房间的时候，后端会给玩家A发送一个包(包含玩家B的信息)，给玩家B发送一个包（包含玩家A的信息）
后端给A发送：{"type" : 13, "data" : "UserIdB B的性别"}
后端给B发送：{"type" : 13, "data" : "UserIdA A的性别"}

4.玩家A点击开始游戏
前端发送{"type" : 14, "data" : "UserAId RoomId"}
后端给玩家A发送{"type" : 14, "data" : "200"}
后端给玩家B发送{"type" : 14, "data" : "200"}
两个玩家接收到后端发送的 200 后，进入到游戏页面

5.退出房间
5.1.房主退出房间。前端将房主跳转到上一页面
前端：如果玩家B存在，玩家B需要跳转到上一页面。后端：将房间销毁
前端发送：{"type" : 15, "data" : "id roomId"} 后端给玩家A发送：{"type" : 15, "data" : "200"}，如果玩家B在房间里面，后端给玩家B发送：{"type" : 15, "data" : "200"}

5.2.对手退出房间
前端将玩家B跳转到上一页面。后端：将UserB置为nil
前端发送：{"type" : 15, "data" : "id roomId"} 后端给玩家B发送：{"type" : 15, "data" : "200"}，后端给玩家A发送：{"type" : 13, "data" : "0 0"}，前端把UserB的位置清空

6.开始游戏后，发送词语
前端发送（房主给后端发消息）：{"type" : 16, "data" : "roomId Difficulty NumOfWords"}
玩家A和玩家B收到的成语一样：后端给玩家A发送：{"type" : 16, "data" : "..."} 后端给玩家B发送：{"type" : 16, "data" : "..."}

7.实时共享分数
房间中任意一个人分数发生变化，前端就发送{"type" : 17, "data" : "userId roomId score"}
后端给这个人发送{"type" : 19, "data" : "200"}，后端给对手发送{"type" : 17, "data" : "score"}

8.双人聊天
前端发送：{"type" : 18, "data" : "userId userSex roomId chatMes"}
后端给发消息的主人发送{"type" : 19, "data" : "200"}，后端给另一个人发送 {"type" : 18, "data" : "chatMes"} （如果房间中不存在另一个用户，就不发送）


*/

/*
	Code 状态码：
	200 ：请求成功（例：成功登录，注册）
	401 ：未授权（例：密码错误）
	404 ：未找到请求的资源（例：用户不存在；服务器找不到请求的网页）
	409 ：冲突（例：用户已经存在）
	500 ：服务器内部错误（例：未知的错误）
*/

const (
	RegisterMesType    = "RegisterMes"
	RegisterResMesType = "RegisterResMes"
	LoginMesType       = "LoginMes"
	LoginResMesType    = "LoginResMes"
)

// 注册请求
type RegisterRequest struct {
	UserId  int    `json:"userId"`
	UserPwd string `json:"userPwd"`
	UserSex string `json:"userSex"`
}

// 注册后回送的消息
type RegisterResMes struct {
	Code  int    `json:"code"`  // 状态码，409表示用户已经存在，200表示用户注册成功
	Error string `json:"error"` // 返回错误信息
}

// 登录请求
type LoginRequest struct {
	UserId  int    `json:"userId"`
	UserPwd string `json:"userPwd"`
}

// 登陆后回送的消息
type LoginResMes struct {
	Code  int    `json:"code"` // 401:密码错误，404:用户不存在，200:登录成功
	Error string `json:"error"`
	User  *User  `json:"user"` // 给前端返回完整的User对象
}

type Message struct {
	Type int    `json:"type"`
	Data string `json:"data"`
}
