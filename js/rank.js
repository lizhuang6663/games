//写在select界面

window.onload = () => {
    console.log(121)
    let userData = JSON.parse(localStorage.getItem('user'))

    let arrow = $('.arrow')
    let rank = $('.rank')
    let rankImg = $$(".rank-img")
    let rankId = $$(".rank-id")
    let scores = $$('.score')
    let doubleBox = $(".double-box")
    let img = $('.img')
    let name = $('.name')
    let inputRoom = $('.input-room')
    let roomJoin = $('.room-join')
    var heartbeatTimer = null;//心跳定时器
    let reconnectTimer = null;//重连定时器
    let ws = null;
    let connectionCount = 0;

    let myImg = $('.myImg')
    let myId = $('.myId')


    //加载登录进的用户信息
    function userMessageLoad(userData) {
        //渲染头像
        if (userData.userSex == '男') {
            img.src = 'images/male.jpg'
        } else {
            img.src = 'images/female.jpg'
        }
        //渲染用户id
        name.innerHTML = userData.userId
    }
    //加载选择页面的用户信息
    userMessageLoad(userData)


    //点击双人模式跳转等待界面
    doubleBox.addEventListener('click', () => {
        window.location.href = 'waiting-a.html'
    })


    //双人模式下玩家b的websocket连接和数据//////////////////////////////////
    //获取websocket连接
    // 连接websocket
    function wsLink() {
        ws = new WebSocket('ws://39.105.7.43:8090/ws')
        doubleWS(ws);
    }

    wsLink();


    // 心跳检测
    function wsHeartbeat() {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
        }
        heartbeatTimer = setInterval(function () {
            if (ws.readyState === WebSocket.OPEN) { // 确保 WebSocket 连接处于打开状态
                // 发送心跳消息给服务器
                ws.send("PING");
                console.log("心跳检测")
            } else {
                // 如果 WebSocket 连接已经关闭，则清除定时器
                clearInterval(heartbeatTimer);
            }
        }, 5000); // 每隔 5 秒发送一次心跳消息
    }

    //断线重连
    function wsReconnect() {

        if (reconnectTimer) {
            clearInterval(reconnectTimer);
        }
        // 进行重连
        wsLink();
        reconnectTimer = setInterval(function () {
            // 进行重连
            wsLink();
            if (connectionCount <= 7) {
                connectionCount++;
            } else {
                clearInterval(reconnectTimer);
                alert("重新打开吧老登")
            }
            console.log("重连定时器");
        }, 5000); // 每隔 5 秒发送一次心跳消息
    }

    function doubleWS(ws) {
        // 标志变量，用于跟踪是否应该发送数据
        // var shouldSendData1 = true;
        var shouldSendData2 = true;
        var shouldSendData3 = true;


        // 监听连接打开事件
        ws.onopen = function (event) {
            console.log(`WebSocket 连接状态： ${ws.readyState}`)
            let id = userData.userId
            // 发送数据2
            ws.send(`{"Type":2,"Data":"${id}"}`);

            //关闭重连
            clearInterval(reconnectTimer);


            //打开心跳检测
            wsHeartbeat();

            // setInterval(function () {
            //     if (shouldSendData3) {

            //     }
            // }, 5000); // 每秒发送一次数据


            //双人模式下玩家1的websocket连接和数据//////////////////////////////////


            //如果本地存储的有usera的数据，则证明用户是从浏览器后退退出
            //需要和后端发消息说要清除房间


            if (localStorage.getItem("alreadyJoin") !== null) {

                let roomNum = JSON.parse(localStorage.getItem('roomNum'))

                //判断当前用户是房主还是被邀请玩家
                let user = JSON.parse(localStorage.getItem("user"))
                let roomMaster = JSON.parse(localStorage.getItem("roomMaster")) || null

                if (roomMaster) {
                    console.log("房主退出");
                    ws.send(`{"Type":15,"Data":"${user.userId} ${roomNum}"}`)
                    localStorage.removeItem("roomMaster");
                    localStorage.removeItem("alreadyJoin");
                    localStorage.removeItem("roomNum");

                    console.log("已删除名为 'usera'和'userb' 的本地存储项。");
                } else {
                    console.log("被邀请玩家退出");
                    ws.send(`{"Type":15,"Data":"${user.userId} ${roomNum}"}`)
                    localStorage.removeItem("alreadyJoin");
                }
                //当前玩家为房主
                // if (user.userId == usera.useraId) {
                //     console.log("房主退出");
                //     ws.send(`{"Type":15,"Data":"${usera.useraId} ${roomNum}"}`)
                if (localStorage.getItem("usera") !== null) {
                    localStorage.removeItem("usera");
                    localStorage.removeItem("userb");

                }

                //     console.log("已删除名为 'usera'和'userb' 的本地存储项。");
                // } else {
                //     console.log("被邀请玩家退出");
                //     ws.send(`{"Type":15,"Data":"${userb.userbId} ${roomNum}"}`)
                //     localStorage.removeItem("usera");
                //     localStorage.removeItem("userb");
                //     console.log("已删除名为 'usera'和'userb' 的本地存储项。");

                // }
            }

        };

        //点击加入房间发送数据
        roomJoin.addEventListener('click', () => {
            let roomNum = inputRoom.value
            let playerBId = userData.userId

            // 发送数据12代表玩家b要加入某个房间,作为被邀请的玩家
            ws.send(`{"Type":12,"Data":"${playerBId} ${roomNum}"}`)

        });

        let singleBox = $('.single-box')
        //点击单人模式的盒子就发送数据
        singleBox.addEventListener('click', () => {
            // 开始发送数据
            setInterval(function () {
                if (shouldSendData2) {
                    // 发送数据
                    // 1是第一关，12是获取12个成语
                    ws.send(`{"Type":3,"Data":"1 12"}`)
                }
            }, 1000); // 每秒发送一次数据

        })


        // 监听消息事件
        ws.onmessage = function (event) {
            console.log(event);
            let receivedType = JSON.parse(event.data).type;
            let receivedData = JSON.parse(event.data).data;

            //类型2表示连接成功
            if (receivedData === "200" && receivedType === 2) {
                // 停止发送数据
                shouldSendData3 = false;
            }
            console.log(receivedType, receivedData, receivedType === 12, receivedData === "200", receivedType === 12 && receivedData === "200", "receivedType, receivedData");

            // 接收到类型3表示获取到成语值
            if (receivedType === 3) {
                shouldSendData2 = false;
                console.log(receivedData);
                //将成语值不做处理存储到本地
                localStorage.setItem('idiomData', JSON.stringify(receivedData));
                //跳转单人游戏界面
                window.location.href = 'single-game.html'
            }




            //类型12表示玩家b进入房间
            // 如果收到后端发送的数据
            //得到进入许可
            if (receivedType === 12 && receivedData === "200") {
                console.log("收到12");
                // shouldSendData1 = false;
                console.log("ttttttttttttttttt");
                let roomNum = inputRoom.value
                //将此房间号存入到本地
                localStorage.setItem("roomNum", JSON.stringify(roomNum))


                //跳转进玩家b的等待界面
                window.location.href = 'waiting-b.html'
            }
            //房间不存在
            if (receivedType === 12 && receivedData === "房间不存在") {
                // shouldSendData1 = false;
                alert('房间不存在')

            };
            //房间已满
            if (receivedType === 12 && receivedData === "房间已满") {
                // shouldSendData1 = false;
                alert('房间已满')
            }
        }
        //当 WebSocket 连接关闭时触发的事件处理程序函数
        ws.onclose = data => {
            console.log('WebSocket连接已关闭')
            console.log(data);
            //清除心跳定时器
            clearInterval(heartbeatTimer);

            //重新连接
            wsReconnect();

        }

        //当发生 WebSocket 错误时触发的事件处理程序函数。
        ws.onerror = () => {
            console.error('websocket fail');
        }



    }

    //排行榜部分//////////////////////////

    //点击排行榜的按钮
    arrow.addEventListener('click', () => {

        //调换排行榜按钮的方向
        //并将排行榜显示
        if (rank.className.includes('hidden')) {
            rank.className = 'rank show'
            arrow.className = 'arrow rotate'

            //获取http连接,排行榜前十名的信息
            axios({
                url: 'http://39.105.7.43:8090/ranking',
                method: 'post',
                data: {
                    "Type": 1,
                    "Data": "10"
                }

            }).then(result => {
                console.log(result.data.data)
                //存储了排行榜前10名用户对象
                let rankData = JSON.parse(result.data.data)
                localStorage.setItem('rank', result.data.data)
                //循环遍历渲染前十名用户信息
                for (let index = 0; index < rankData.length; index++) {
                    //用户id
                    rankId[index].innerHTML = rankData[index].userId
                    //用户头像
                    if (rankData[index].userSex == '男') {
                        rankImg[index].src = 'images/male.jpg'
                    } else if (rankData[index].userSex == '女') {
                        rankImg[index].src = 'images/female.jpg'
                    }
                    //用户分数
                    scores[index].innerHTML = rankData[index].score
                }

            }).catch(error => {
                //失败
                console.log(error)
            })
        } else {
            //调换排行榜按钮的方向
            //并将排行榜隐藏
            rank.className = 'rank hidden'
            arrow.className = 'arrow rotateBack'
        }
    });
    //排行榜部分/////////////////////////////////////


}


