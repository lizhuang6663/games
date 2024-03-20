//写在waiting-b中
window.onload = () => {
    let userData = JSON.parse(localStorage.getItem('user'))
    let id = userData.userId

    let send = $('.send')
    let backBox = $('#back-box')

    let roomNum = JSON.parse(localStorage.getItem("roomNum"))
    let playerBId = userData.userId

    let chatUl = $('.chat-ul')
    let sendMes = $('.send-message')
    let str = ''


    let myImg = $('.myImg')
    let myId = $('.myId')

    let rivalImg = $('.rivalImg')
    let rivalId = $('.rivalId')


    localStorage.setItem('alreadyJoin', '111111111111111')

    const ws = new WebSocket('ws://39.105.7.43:8090/ws')


    //渲染玩家b的信息
    rivalId.innerHTML = userData.userId
    if (userData.userSex == '男') {
        rivalImg.src = 'images/male.jpg'
    } else {
        rivalImg.src = 'images/female.jpg'
    }

    // 标志变量，用于跟踪是否应该发送数据
    let shouldSendData1 = true;
    let shouldSendData2 = true;
    let shouldSendData3 = true;



    //双人的玩家b,即被邀请玩家
    // 监听连接打开事件
    ws.onopen = function (event) {
        console.log(`WebSocket 连接状态： ${ws.readyState}`)
        setInterval(function () {
            if (shouldSendData1) {
                // 发送数据
                ws.send(`{"Type":2,"Data":"${id}"}`)
            }
        }, 1000); // 每秒发送一次数据

        setInterval(function () {
            if (shouldSendData3) {
                // 发送数据13表示可以接收玩家a的数据包
                ws.send(`{"Type":13,"Data":"${roomNum}"}`)
            }
        }, 1000); // 每秒发送一次数据
    };

    //退出房间按钮
    backBox.addEventListener('click', () => {
        // 开始发送数据
        setInterval(function () {
            if (shouldSendData2) {
                let roomNum = JSON.parse(localStorage.getItem("roomNum"))

                // 发送数据
                ws.send(`{"Type":15,"Data":"${playerBId} ${roomNum}"}`)
            }
        }, 1000); // 每秒发送一次数据
    });



    //发送信息都从右边发
    send.addEventListener('click', () => {
        if (sendMes.value !== "") {
            var message = sendMes.value
        } else {
            alert("发送消息不能为空")
        }
        let roomNum = JSON.parse(localStorage.getItem("roomNum"))

        // 发送数据
        ws.send(`{"Type":18,"Data":"${userData.userId} ${userData.userSex} ${roomNum} ${message}"}`)

        if (userData.userSex == '男') {
            var src = 'images/male.jpg'
        } else {
            var src = 'images/female.jpg'
        }
        str += `<li>
                        <div class="my-message">
                           ${message}
                        </div>
                        <img class="my" src=${src}></img>
                    </li>`
        chatUl.innerHTML = str
        sendMes.value = ''

    })


    // 监听消息事件
    ws.onmessage = function (event) {
        console.log(event);
        let receivedType = JSON.parse(event.data).type;
        let receivedData = JSON.parse(event.data).data;

        if (receivedData === "200" && receivedType === 2) {
            // 停止发送数据
            shouldSendData1 = false;
            //发送按钮显现出来
            send.style.display = 'block'
        }


        //类型13表示玩家b进入房间后，b收到玩家a的数据包
        if (receivedType === 13) {
            console.log(receivedData);

            shouldSendData3 = false
            // 使用 split() 方法将字符串以空格分割成数组
            let parts = receivedData.split(" ");

            // 数组解构
            //解析玩家a的数据
            let [userId, userSex] = parts;
            //本地存储玩家b的信息
            var userb = { "userbId": userData.userId, "userbSex": userData.userSex }
            localStorage.setItem("userb", JSON.stringify(userb))
            //本地存储玩家a的信息
            var usera = { "useraId": userId, "useraSex": userSex }
            localStorage.setItem("usera", JSON.stringify(usera))



            //渲染玩家a的信息
            myId.innerHTML = userId
            if (userSex == '男') {
                myImg.src = 'images/male.jpg'
            } else {
                myImg.src = 'images/female.jpg'
            }
        }


        //表示可以开始游戏
        if (receivedType === 14 && receivedData === '200') {
            console.log("收到14");

        }

        //玩家a退出房间后接收信息后退出房间
        if (receivedType === 15 && receivedData === '200') {
            console.log("收到15");
            shouldSendData2 = false;
            window.location.href = 'select.html'
        }

        //接收到双人游戏的成语
        if (receivedType === 16) {
            console.log(receivedData);
            console.log("收到16");

            // 存储到本地
            localStorage.setItem('d-idiomData', JSON.stringify(receivedData));
            window.location.href = 'double-game.html'

        }


        //接收对方的消息（位于左侧）
        if (receivedType === 18) {
            console.log("接收到对方的消息");

            // 使用 split() 方法将字符串以空格分割成数组
            let parts = receivedData.split(" ");

            // 数组解构
            let [rivalId, rivalSex, roomId, chatMes] = parts;

            if (rivalSex === '男') {
                var src = 'images/male.jpg'
            } else {
                var src = 'images/female.jpg'
            }

            str += `<li>
            <img class="rival" src=${src}></img>
                        <div class="rival-message">
                           ${chatMes}
                        </div>
                    </li>`
            var chatUl = $('.chat-ul')

            chatUl.innerHTML = str

        }

    };

    //当 WebSocket 连接关闭时触发的事件处理程序函数
    ws.onclose = data => {
        console.log('WebSocket连接已关闭')
        console.log(data);
    }

    //当发生 WebSocket 错误时触发的事件处理程序函数。
    ws.onerror = () => {
        console.error('websocket fail');
    }


}