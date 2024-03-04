

const ws = new WebSocket('ws://172.20.10.3:8090/ws')



let userData = JSON.parse(localStorage.getItem('user'))
var id = userData.userId






//心跳包部分////////////////////////////////////////////

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



//心跳包部分////////////////////////////////////////////////////////////



//单人模式下的ws
singleWs(ws)




function singleWs(ws) {
    // 标志变量，用于跟踪是否应该发送数据
    var shouldSendData1 = true;
    var shouldSendData2 = true;
    var shouldSendData3 = true;

    // 监听连接打开事件
    ws.onopen = function (event) {
        console.log(`WebSocket 连接状态： ${ws.readyState}`)
        //此页面一打开就发送用户的id
        // 开始发送数据
        setInterval(function () {
            if (shouldSendData1) {
                // 发送数据
                ws.send(`{"Type":2,"Data":"${id}"}`)
            }
        }, 1000); // 每秒发送一次数据

    };

    var singleBox = $('.single-box')
    singleBox.addEventListener('click', () => {
        // 开始发送数据
        setInterval(function () {
            if (shouldSendData2) {
                // 发送数据
                ws.send(`{"Type":3,"Data":"1 12"}`)
            }
        }, 1000); // 每秒发送一次数据

    })





    // 监听消息事件
    ws.onmessage = function (event) {
        console.log("ttttttttttttttttt");
        console.log(event);
        var receivedType = JSON.parse(event.data).type;
        var receivedData = JSON.parse(event.data).data;
        // 如果收到后端发送的数据
        if (receivedData === "200" && receivedType === 2) {
            // 停止发送数据
            shouldSendData1 = false;
        }


        if (receivedType === 3) {
            shouldSendData2 = false;
            console.log(receivedData);
            // 存储到本地
            localStorage.setItem('idiomData', JSON.stringify(receivedData));
            window.location.href = 'single-game.html'
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
        ws.close();
    }

}






