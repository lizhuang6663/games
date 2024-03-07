package utils

import "errors"

// 自定义错误类型

var (
	ERROR_USER_NOTEXISTS = errors.New("用户不存在")  // 登录
	ERROR_USER_EXISTS    = errors.New("用户已经存在") // 注册
	ERROR_USER_ONLINE    = errors.New("用户已经在线") // 登录
	ERROR_USER_PWD       = errors.New("密码错误")   // 登录

	ERROR_LEVEL_NUM      = errors.New("关卡值出现错误")
	ERROR_LEVEL_WORDSNUM = errors.New("挑选的词语数量出现错误")

	ERROR_ROOM_NOTEXISTS = errors.New("房间不存在")
	ERROR_ROOM_FULL      = errors.New("房间已满")
	ERROR_ROOM_NOTFULL   = errors.New("房间人未齐")
)
