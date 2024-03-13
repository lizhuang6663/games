package controllers

import (
	"IdiomGames/dao"
	"IdiomGames/model"
	"IdiomGames/utils"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
)

// Register 注册
func Register(w http.ResponseWriter, r *http.Request) {
	httpTransfer := &utils.HttpTransfer{
		W: w,
		R: r,
	}

	// 注册请求
	registerRequest := &model.RegisterRequest{}
	// 读取前端发来的信息， 并反序列化
	_, err := httpTransfer.ReadPkg(registerRequest)

	// 注册，向数据库中插入新用户信息
	err = dao.DbManager.Register(registerRequest.UserId, registerRequest.UserPwd, registerRequest.UserSex)

	// 定义注册回送消息类型，准备回送给前端数据：LoginResMes
	var registerResMes model.RegisterResMes

	if err != nil {
		// 判断错误的具体内容
		// err == utils.ERROR_USER_NOTEXISTS 是直接比较错误值是否相等。
		// errors.Is(err, utils.ERROR_USER_NOTEXISTS) 是使用 errors.Is 函数来检查错误链中是否包含某个特定的错误。
		// 通常来说，推荐使用 errors.Is 函数来检查错误，因为它能够正确处理错误链。如果错误是嵌套在其他错误中的，使用 errors.Is 可以正确地检查到。 而直接比较错误值则不具备这种能力。
		if errors.Is(err, utils.ERROR_USER_EXISTS) { // 用户已存在
			registerResMes.Code = 409
			registerResMes.Error = err.Error()
		} else { // 未知错误
			registerResMes.Code = 505
			registerResMes.Error = "注册未知错误..."
		}
	} else {
		registerResMes.Code = 200
		fmt.Println("注册成功")
	}

	err = httpTransfer.WritePkg(registerResMes)
	if err != nil {
		fmt.Println("Register() httpTransfer.WritePkg() err = ", err)
		return
	}
}

// Login 登录
func Login(w http.ResponseWriter, r *http.Request) {
	httpTransfer := &utils.HttpTransfer{
		W: w,
		R: r,
	}

	loginRequest := &model.LoginRequest{}
	_, err := httpTransfer.ReadPkg(loginRequest)

	// 登录，无论是否成功登录，都从数据库中返回完整的 realUser
	wholeUser, err := dao.DbManager.Login(loginRequest.UserId, loginRequest.UserPwd)

	// 定义登录回送消息类型，准备回送给前端数据：LoginResMes
	loginResMes := &model.LoginResMes{}
	loginResMes.User = wholeUser
	fmt.Println("完整的用户信息为：", wholeUser)

	// 判断用户是否在线（可能会有两个人同时登录一个账号的情况）
	if _, ok := onlineMap.Get(loginRequest.UserId); ok { // ok为true说明用户已在线，这时候要给前端返回错误
		err = utils.ERROR_USER_ONLINE
	}

	if err != nil {
		// 判断错误的具体内容
		if errors.Is(err, utils.ERROR_USER_NOTEXISTS) { // 用户不存在
			loginResMes.Code = 404
			loginResMes.Error = err.Error()
		} else if errors.Is(err, utils.ERROR_USER_PWD) { // 密码错误
			loginResMes.Code = 401
			loginResMes.Error = err.Error()
		} else if errors.Is(err, utils.ERROR_USER_ONLINE) { // 用户已经在线了
			loginResMes.Code = 409
			loginResMes.Error = err.Error()
		} else { // 未知错误
			loginResMes.Code = 500
			loginResMes.Error = "登录未知错误..."
		}
	} else {
		loginResMes.Code = 200
		fmt.Println("登录成功")
	}

	err = httpTransfer.WritePkg(loginResMes)
	if err != nil {
		fmt.Println("Register() httpTransfer.WritePkg() err = ", err)
		return
	}
}

// Ranking 返回前十排名
func Ranking(w http.ResponseWriter, r *http.Request) {
	httpTransfer := &utils.HttpTransfer{
		W: w,
		R: r,
	}
	mes := &model.Message{}
	data, err := httpTransfer.ReadPkg(mes)

	n, err := strconv.Atoi(mes.Data)
	if err != nil {
		fmt.Println("Ranking() strconv.Atoi() err = ", err)
		return
	}

	sli, err := dao.DbManager.QueryRankingByScore(n)
	if err != nil {
		fmt.Println("Ranking dbManager.QueryRankingBySCore() err = ", err)
		return
	}

	// 将切片序列化，存储在 Message.Data 中
	data, err = json.Marshal(sli)
	if err != nil {
		fmt.Println("Ranking() json.Marshal() err = ", err)
		return
	}

	// 给 mes 赋值，回送给前端数据：Message
	mes.Type = 1
	mes.Data = string(data)

	err = httpTransfer.WritePkg(mes)
	if err != nil {
		fmt.Println("Register() httpTransfer.WritePkg() err = ", err)
		return
	}
}
