package utils

import "errors"

// 自定义错误类型

/*
	Code 状态码：
	200 ：请求成功（例：成功登录，注册）
	401 ：未授权（例：密码错误）
	404 ：未找到请求的资源（例：用户不存在；服务器找不到请求的网页）
	409 ：冲突（例：用户已经存在）
	500 ：服务器内部错误（例：未知的错误）
*/

var (
	ERROR_USER_NOTEXISTS = errors.New("用户不存在")  // 登录
	ERROR_USER_EXISTS    = errors.New("用户已经存在") // 注册
	ERROR_USER_ONLINE    = errors.New("用户已经在线") // 登录
	ERROR_USER_PWD       = errors.New("密码错误")   // 登录

	ERROR_LEVEL_NUM      = errors.New("关卡值出现错误")
	ERROR_LEVEL_WORDSNUM = errors.New("挑选的词语数量出现错误")

	ERROR_ROOM_NOTEXISTS = errors.New("房间不存在")
	ERROR_ROOM_FULL      = errors.New("房间已满")
)
