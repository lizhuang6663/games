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
前端发送{"type" : 13, "data" : "roomId"}
后端给A发送：{"type" : 13, "data" : "UserIdB B的性别"}
后端给B发送：{"type" : 13, "data" : "UserIdA A的性别"}


4.玩家A点击开始游戏
前端发送{"type" : 14, "data" : "UserAId RoomId"}
后端给玩家A发送{"type" : 14, "data" : "200"}
后端给玩家B发送{"type" : 14, "data" : "200"}
两个玩家接收到后端发送的 200 后，进入到游戏页面

5.退出房间
5.1.房主退出房间。前端将房主跳转到上一页面，并向房主显示：房间已销毁。
前端：如果玩家B存在，玩家B需要跳转到上一页面，并向B显示：房间已销毁。后端：将房间销毁
前端发送：{"type" : 15, "data" : "id roomId"} 后端给玩家A发送：{"type" : 15, "data" : "200"}，如果玩家B在房间里面，后端给玩家B发送：{"type" : 15, "data" : "200"}

5.2.对手退出房间
前端将玩家B跳转到上一页面。后端：将UserB置为nil
前端发送：{"type" : 15, "data" : "id roomId"} 后端给玩家B发送：{"type" : 15, "data" : "200"}，后端给玩家A发送：{"type" : 13, "data" : "0 0"}，前端把UserB的位置清空，并给A打印：对手userId已经退出房间

6.开始游戏后，发送词语
前端发送（房主给后端发消息）：{"type" : 16, "data" : "roomId Difficulty NumOfWords"}
玩家A和玩家B收到的成语一样：后端给玩家A发送：{"type" : 16, "data" : "..."} 后端给玩家B发送：{"type" : 16, "data" : "..."}
房间人没有齐后端给A或者B发送：{"type" : 16, "data" : "房间人未齐"}

(7和8的后端代码相同)
7.实时共享分数
房间中任意一个人分数发生变化，前端就发送{"type" : 17, "data" : "userId userSex roomId score"}
后端给这个人发送{"type" : 19, "data" : "200"}，后端给对手发送{"type" : 17, "data" : "userId userSex roomId score"}

8.双人聊天
前端发送：{"type" : 18, "data" : "userId userSex roomId chatMes"}
后端给发消息的主人发送{"type" : 19, "data" : "200"}，后端给另一个人发送 {"type" : 18, "data" : "userId userSex roomId chatMes"} （如果房间中不存在另一个用户，就不发送）



9.游戏结束后，A或者B点击确认，给A或者B发确定，给玩家A发送一个包(包含玩家B的信息)，给玩家B发送一个包（包含玩家A的信息），A，B再次进入房间
前端的玩家A或者玩家B发送：{"type" : 20, "data" : "userId roomId"}（玩家A和玩家B返回房间页面）
后端给前端的发送者发送确认{"type" : 20, "data" : "200"}
后端给A发送：{"type" : 13, "data" : "UserIdB B的性别"}
后端给B发送：{"type" : 13, "data" : "UserIdA A的性别"}

回到房间后，后端需要在roomMap中共把两个用户的分数清零

*/

/*
	Code 状态码：
	200 ：请求成功（例：成功登录，注册）
	401 ：未授权（例：密码错误）
	404 ：未找到请求的资源（例：用户不存在；服务器找不到请求的网页）
	409 ：冲突（例：用户已经存在）
	500 ：服务器内部错误（例：未知的错误）
*/

// RegisterRequest 注册请求
type RegisterRequest struct {
	UserId  int    `json:"userId"`
	UserPwd string `json:"userPwd"`
	UserSex string `json:"userSex"`
}

// RegisterResMes 注册后回送的消息
type RegisterResMes struct {
	Code  int    `json:"code"`  // 状态码，409表示用户已经存在，200表示用户注册成功
	Error string `json:"error"` // 返回错误信息
}

// LoginRequest 登录请求
type LoginRequest struct {
	UserId  int    `json:"userId"`
	UserPwd string `json:"userPwd"`
}

// LoginResMes 登陆后回送的消息
type LoginResMes struct {
	Code  int    `json:"code"` // 401:密码错误，404:用户不存在，200:登录成功
	Error string `json:"error"`
	User  *User  `json:"user"` // 给前端返回完整的User对象
}

type Message struct {
	Type int    `json:"type"`
	Data string `json:"data"`
}

// 房间链接太单调了，前端使用随机数再生成一段房间id，格式大致为：?room=a23b-rb91-f234

// 超时：如果登录完成之后，在select页面建立websocket链接，用户超过100秒什么也不干，自动断开链接（使用管道）（如果前端在一定时间内没有接收到心跳包，就可以自己判断已经断开链接了。但是后端还是发送一下信息吧）
// 后端给前端发送:{"type" : 0, "data" : "用户长时间没有操作，后端已自动断开该用户的链接......"}，前端打印给用户看
// 存在的问题：后端自动关闭和前端的链接，前端无法传递数据，roomMap无法删除房间

// 用户退出房间：
// 1.如果用户手动退出房间后，前端把本地存储的对手信息清空，并给后端发送数据
// 2.用户在浏览器页面点击箭头返回，断开房间链接：当用户点击箭头后，前端判断本地数据是否有对手的信息，如果有对手的信息，前端给后端发送数据，后端把房间销毁。后端给前端发送销毁房间的信息，前端给用户显示：”房间已销毁“，并跳转页面

// 可额外添加：
// 进入房间：点击房间链接，直接进入房间：通过判断链接中的room属性

// 断线重连：（前端是否知道用户断开了websocket链接）如果前端心跳检测没有收到后端的信息，就是用户网络断线了。前端一直发送断线的用户数据，后端接收后，更新用户的conn。

// 9.双人游戏结束
// 前端发送：{"type" : 20, "data" : "userId userSex roomId score time"}
// 前端发送数据完之后，不能跳转页面，直到收到后端发送的数据
// 当后端收到房间中的两个用户发送的消息时，后端给A发送{"type" : 20, "data" : "userIdA userSex score time userIdB userSex score time"}，后端给B发送 {"type" : 20, "data" : "userIdB userSex score time userIdA userSex score time"}
// 前端接收到数据后，跳转胜利或者失败页面
