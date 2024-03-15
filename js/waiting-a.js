
window.onload = () => {
    var copyIcon = $('.copy-icon')
    var inviteLink = $('.invite-link')
    var coatLink = $('.coat-link')
    var rivalImg = $('.rivalImg')
    var backBox = $('.back-box')
    var inviteLink = $('.invite-link')
    var myImg = $('.myImg')
    var myId = $('.myId')





    //加载用户的信息
    var userData = JSON.parse(localStorage.getItem('user'))
    myId.innerHTML = userData.userId
    if (userData.userSex == '男') {
        myImg.src = 'images/male.jpg'
    } else {
        myImg.src = 'images/female.jpg'
    }


    //复制内容到剪切板
    copyIcon.addEventListener('click', () => {
        const content = inviteLink.textContent;

        navigator.clipboard.writeText(content)
            .then(() => {
                console.log('内容已成功复制到剪贴板');
                coatLink.style.display = 'none'
            })
            .catch(err => {
                console.error('复制失败:', err);
                // 如果需要，在此处添加错误处理逻辑
            });
    });

    //点击敌方头像邀请链接出现
    rivalImg.addEventListener('click', () => {
        coatLink.style.display = 'block'
        var link = window.location.href
        inviteLink.innerHTML = link


    })


}



const ws = new WebSocket('ws://172.20.10.3:8090/ws')

// 标志变量，用于跟踪是否应该发送数据1
var shouldSendData1 = true;
var shouldSendData2 = true;
var shouldSendData3 = true;
var shouldSendData4 = true;
var shouldSendData5 = true;
var shouldSendData6 = true;



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

//双人游戏的用户a
doubleWs_a(ws);

//双人游戏的用户a
function doubleWs_a(ws) {

    var rivalImg = $('.rivalImg')
    var gameRun = $('.game-run')
    var backBox = $('.back-box')
    // 监听连接打开事件
    ws.onopen = function (event) {
        console.log(`WebSocket 连接状态： ${ws.readyState}`)

        setInterval(function () {
            if (shouldSendData4) {
                var userData = JSON.parse(localStorage.getItem('user'))
                var id = userData.userId
                // 发送数据
                ws.send(`{"Type":2,"Data":"${id}"}`)
            }
        }, 1000); // 每秒发送一次数据

    };
    rivalImg.addEventListener('click', () => {
        // 开始发送数据
        setInterval(function () {
            if (shouldSendData1) {
                var userData = JSON.parse(localStorage.getItem('user'))
                var link = window.location.href

                // 发送数据
                //玩家a创建房间
                ws.send(`{"Type":11,"Data":"${userData.userId} ${link}"}`)
            }
        }, 1000); // 每秒发送一次数据


    });

    gameRun.addEventListener('click', () => {
        // 开始发送数据
        setInterval(function () {
            if (shouldSendData2) {
                var userData = JSON.parse(localStorage.getItem('user'))
                var link = window.location.href
                //玩家a点击开始游戏
                // 发送数据
                ws.send(`{"Type":14,"Data":"${userData.userId} ${link}"}`)
            }
        }, 1000); // 每秒发送一次数据

        // 开始发送数据
        setInterval(function () {
            if (shouldSendData5) {
                var link = window.location.href
                // 发送数据
                //玩家a创建房间
                ws.send(`{"Type":16,"Data":"${link} 1 12"}`)
            }
        }, 1000); // 每秒发送一次数据
    });

    backBox.addEventListener('click', () => {
        //退出房间之前发送数据
        // 开始发送数据
        setInterval(function () {
            if (shouldSendData3) {
                var userData = JSON.parse(localStorage.getItem('user'))
                var link = window.location.href

                // 发送数据
                ws.send(`{"Type":15,"Data":"${userData.userId} ${link}"}`)
            }
        }, 1000); // 每秒发送一次数据

    });
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
        // 如果收到后端发送的数据
        if (receivedData === "200" && receivedType === 2) {
            // 停止发送数据
            shouldSendData4 = false;
        }
        // 如果收到后端发送的数据
        if (receivedData === "200" && receivedType === 11) {
            // 停止发送数据
            shouldSendData1 = false;
        }
        //玩家b进入房间，a收到玩家b的包
        if (receivedType === 13) {
            console.log(receivedData);

            // 使用 split() 方法将字符串以空格分割成数组
            let parts = receivedData.split(" ");

            // 数组解构
            let [userId, userSex] = parts;
            if (userId !== "0") {
                console.log("玩家b加入房间");
                var link = window.location.href
                var userData = JSON.parse(localStorage.getItem('user'))
                var room = { "roomId": link, "userbId": userId, "userbSex": userSex }
                localStorage.setItem("room", JSON.stringify(room))
                var usera = { "useraId": userData.userId, "useraSex": userData.userSex }
                localStorage.setItem("usera", JSON.stringify(usera))
                var userb = { "userbId": userId, "userbSex": userSex }
                localStorage.setItem("userb", JSON.stringify(userb))

                //渲染玩家b的信息
                var rivalId = $('.rivalId')
                rivalId.innerHTML = userId
                if (userSex === '男') {
                    rivalImg.src = 'images/male.jpg'
                } else {
                    rivalImg.src = 'images/female.jpg'
                }

                //开始游戏显现出来
                var gameRun = $('.game-run')
                gameRun.style.display = 'block'
                //发送按钮显现出来
                var send = $('.send')
                send.style.display = 'block'

            } else {
                console.log("玩家b退出");
                //消除玩家b的信息
                var rivalId = $('.rivalId')
                rivalId.innerHTML = '???'
                rivalImg.src = ''
                //开始游戏取消显示
                var gameRun = $('.game-run')
                gameRun.style.display = 'none'


            }

        }

        if (receivedType === 16) {
            // 停止发送数据
            shouldSendData5 = false;
            console.log(receivedData);
            // 存储到本地
            localStorage.setItem('d-idiomData', JSON.stringify(receivedData));
            //进入游戏页面
            window.location.href = 'double-game.html'
        }
        if (receivedType === 14 && receivedData === '200') {
            shouldSendData2 = false;


        }
        //接收退出房间信息后退出房间
        if (receivedType === 15 && receivedData === '200') {
            shouldSendData3 = false;

            // 跳转到另一个页面
            window.location.href = 'select.html';
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

// 监听窗口关闭事件
window.onbeforeunload = function () {
    setInterval(function () {
        if (shouldSendData3) {
            var userData = JSON.parse(localStorage.getItem('user'))
            var link = window.location.href

            // 发送数据
            ws.send(`{"Type":15,"Data":"${userData.userId} ${link}"}`)
        }
    }, 1000); // 每秒发送一次数据
}
