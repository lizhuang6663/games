
var userData = JSON.parse(localStorage.getItem('user'))

window.onload = () => {



    // window.onload = () => {

    const ws = new WebSocket('ws://172.20.10.3:8090/ws')


    // 标志变量，用于跟踪是否应该发送数据
    var shouldSendData1 = true;
    var shouldSendData2 = true;
    var shouldSendData6 = true;


    var roomJoin = $('.room-join')



    //双人的玩家b

    // 监听连接打开事件
    console.log("sdfadsfdsfadgasdga");
    ws.onopen = function (event) {
        console.log(`WebSocket 连接状态： ${ws.readyState}`)
        setInterval(function () {
            if (shouldSendData1) {
                var userData = JSON.parse(localStorage.getItem('user'))
                var id = userData.userId
                // 发送数据
                ws.send(`{"Type":2,"Data":"${id}"}`)
            }
        }, 1000); // 每秒发送一次数据

        var send = $('.send')
        send.style.display = 'block'
    };

    var backBox = $('#back-box')
    backBox.addEventListener('click', () => {

        var roomNum = JSON.parse(localStorage.getItem("roomNum"))
        var playerBId = userData.userId

        // 开始发送数据
        setInterval(function () {
            if (shouldSendData2) {
                // 发送数据
                ws.send(`{"Type":15,"Data":"${playerBId} ${roomNum}"}`)
            }
        }, 1000); // 每秒发送一次数据
    });

    // 监听窗口关闭事件
    window.onbeforeunload = function () {
        var roomNum = inputRoom.value
        var playerBId = userData.userId

        // 开始发送数据
        setInterval(function () {
            if (shouldSendData2) {
                // 发送数据
                ws.send(`{"Type":15,"Data":"${playerBId} ${roomNum}"}`)
            }
        }, 1000); // 每秒发送一次数据
    }



    var chatUl = $('.chat-ul')
    var sendMes = $('.send-message')
    var send = $('.send')
    var str = ''
    //发送信息都从右边发
    send.addEventListener('click', () => {
        var message = sendMes.value
        var userData = JSON.parse(localStorage.getItem('user'))
        var roomData = JSON.parse(localStorage.getItem('room'))


        // 发送数据
        ws.send(`{"Type":18,"Data":"${userData.userId} ${userData.userSex} ${roomData.roomId} ${message}"}`)

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
        // console.log("ttttttttttttttttt");
        console.log(event);
        var receivedType = JSON.parse(event.data).type;
        var receivedData = JSON.parse(event.data).data;

        console.log(111111111);
        console.log(receivedType);
        console.log(receivedData);
        if (receivedData === "200" && receivedType === 2) {
            // 停止发送数据
            shouldSendData1 = false;
        }

        console.log(222222);


        var myImg = $('.myImg')
        var myId = $('.myId')

        //渲染玩家a的信息
        var roomData = JSON.parse(localStorage.getItem('room'))
        myId.innerHTML = roomData.userbId
        if (roomData.userbSex == '男') {
            myImg.src = 'images/male.jpg'
        } else {
            myImg.src = 'images/female.jpg'
        }


        if (receivedType === 16) {
            console.log(receivedData);
            console.log("收到16");

            // 存储到本地
            localStorage.setItem('d-idiomData', JSON.stringify(receivedData));
            window.location.href = 'double-game.html'

        }
        if (receivedType === 14 && receivedData === '200') {
            console.log("收到14");

        }
        //玩家a退出房间后接收信息后退出房间
        if (receivedType === 15 && receivedData === '200') {
            console.log("收到15");
            shouldSendData2 = false;

            window.location.href = 'select.html'
        }
        if (receivedType === 19 && receivedData === '200') {

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











    // //心跳包部分////////////////////////////////////////////

    // // 发送心跳包函数
    // function sendHeartbeat() {
    //     if (ws.readyState === WebSocket.OPEN) {
    //         ws.send('PING');
    //     }
    // }

    // // 设置定时器，每隔10秒发送一次心跳包
    // const heartbeatInterval = setInterval(sendHeartbeat, 10000);

    // ws.lastReceivedTime = new Date().getTime();
    // // 监听消息事件
    // ws.addEventListener('message', function (event) {
    //     const receivedData = JSON.parse(event.data);

    //     // 收到后端的心跳包
    //     if (receivedData === 'PONG') {
    //         ws.lastReceivedTime = new Date().getTime(); // 更新 lastReceivedTime
    //     }
    // });

    // // 定义超时时间（10秒）
    // const timeoutDuration = 11000;

    // // 设置定时器，检测是否超时
    // const timeoutTimer = setInterval(function () {
    //     var currentTime = new Date().getTime(); // 获取当前时间
    //     var lastReceivedTime = ws.lastReceivedTime; // 获取上次接收到消息的时间
    //     var elapsedTime = currentTime - lastReceivedTime; // 计算经过的时间

    //     console.log(currentTime);
    //     console.log(lastReceivedTime);
    //     console.log(elapsedTime);

    //     // 如果超过超时时间，则关闭 WebSocket 连接
    //     if (elapsedTime > timeoutDuration) {
    //         clearInterval(heartbeatInterval);
    //         clearInterval(timeoutTimer);
    //         ws.close();
    //         console.log('WebSocket connection closed due to heartbeat timeout.');
    //     }
    // }, 1000);  // 每秒检测一次



    // //心跳包部分////////////////////////////////////////////////////////////
}