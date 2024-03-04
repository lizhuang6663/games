
var userData = JSON.parse(localStorage.getItem('user'))
// window.onload = () => {
var arrow = $('.arrow')
var rank = $('.rank')
var rankImg = $$(".rank-img")
var rankId = $$(".rank-id")
var scores = $$('.score')
var singleBox = $(".single-box")
var doubleBox = $(".double-box")
var img = $('.img')
var name = $('.name')
var inputRoom = $('.input-room')

var myImg = $('.myImg')
var myId = $('.myId')



//加载选择页面的用户信息
userMessageLoad(userData)


//点击双人模式
doubleBox.addEventListener('click', () => {
    window.location.href = 'waiting-a.html'
})



const ws = new WebSocket('ws://172.20.10.3:8090/ws')

// 标志变量，用于跟踪是否应该发送数据
var shouldSendData1 = true;
var shouldSendData2 = true;
var shouldSendData3 = true;


var backBox = $('.back-box')
var roomJoin = $('.room-join')



//双人的玩家b
doubleWs_b(ws)

function doubleWs_b(ws) {
    // 监听连接打开事件
    ws.onopen = function (event) {
        console.log(`WebSocket 连接状态： ${ws.readyState}`)
        setInterval(function () {
            if (shouldSendData3) {
                var userData = JSON.parse(localStorage.getItem('user'))
                var id = userData.userId
                // 发送数据
                ws.send(`{"Type":2,"Data":"${id}"}`)
            }
        }, 1000); // 每秒发送一次数据
    };

    //点击加入房间
    roomJoin.addEventListener('click', () => {
        var roomNum = inputRoom.value
        var playerBId = userData.userId

        //玩家b进入房间
        // 开始发送数据
        setInterval(function () {
            if (shouldSendData1) {
                // 发送数据
                ws.send(`{"Type":12,"Data":"${playerBId} ${roomNum}"}`)
            }
        }, 1000); // 每秒发送一次数据
    });



    // backBox.addEventListener('click', () => {
    //     var roomNum = inputRoom.value
    //     var playerBId = userData.userId

    //     // 开始发送数据
    //     setInterval(function () {
    //         if (shouldSendData2) {
    //             // 发送数据
    //             ws.send(`{"Type":15,"Data":"${playerBId} ${roomNum}"}`)
    //         }
    //     }, 1000); // 每秒发送一次数据
    // });

    // 监听消息事件
    ws.onmessage = function (event) {
        // console.log("ttttttttttttttttt");
        console.log(event);
        var receivedType = JSON.parse(event.data).type;
        var receivedData = JSON.parse(event.data).data;

        if (receivedData === "200" && receivedType === 2) {
            // 停止发送数据
            shouldSendData3 = false;
        }

        //玩家b进入房间
        // 如果收到后端发送的数据
        if (receivedData === "200" && receivedType === 12) {
            // 停止发送数据
            shouldSendData1 = false;
            window.location.href = 'waiting-b.html'
        }
        //房间不存在
        if (receivedData === "房间不存在" && receivedType === 12) {

            // 停止发送数据
            shouldSendData1 = false;
            alert('房间不存在')

        }
        //房间已满
        if (receivedData === "房间已满" && receivedType === 12) {
            // 停止发送数据
            shouldSendData1 = false;
            alert('房间已满')

        }

        //玩家b进入房间，收到玩家a的包

        if (receivedType === 13) {
            console.log(receivedData);

            // 使用 split() 方法将字符串以空格分割成数组
            let parts = receivedData.split(" ");

            // 数组解构
            let [user2Id, user2Sex, user1Id, user1Sex] = parts;
            //渲染玩家a的信息
            myId.innerHTML = user1Id
            if (user1Sex == '男') {
                myImg.src = 'images/male.jpg'
            } else {
                myImg.src = 'images/female.jpg'
            }

            // 存储到本地
            // localStorage.setItem('idiomData', JSON.stringify(receivedData));
        }
        if (receivedType === 14 && receivedData === '200') {
            //进入游戏页面
            window.location.href = 'double-game.html'
        }
        //玩家a退出房间后接收信息后退出房间
        if (receivedType === 15 && receivedData === '200') {
            shouldSendData2 = false;

            window.location.href = 'select.html'
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
        window.location.href = 'select.html'
    }

}


//排行榜部分//////////////////////////

arrow.addEventListener('click', () => {

    console.log(1);

    if (rank.className.includes('hidden')) {
        rank.className = 'rank show'
        arrow.className = 'arrow rotate'


        axios({
            url: 'http://172.20.10.3:8090/ranking',
            method: 'post',
            data: {
                "Type": 1,
                "Data": "10"
            }

        }).then(result => {
            console.log(result.data.data)
            //对象数组（存储了10个）
            var rankData = JSON.parse(result.data.data)
            localStorage.setItem('rank', result.data.data)
            for (let index = 0; index < rankData.length; index++) {
                rankId[index].innerHTML = rankData[index].userId

                if (rankData[index].userSex == '男') {
                    rankImg[index].src = 'images/male.jpg'
                } else if (rankData[index].userSex == '女') {
                    rankImg[index].src = 'images/female.jpg'

                }
                scores[index].innerHTML = rankData[index].score

            }
        }).catch(error => {
            //失败
            console.log(error)
        })
    } else {
        rank.className = 'rank hidden'
        arrow.className = 'arrow rotateBack'
    }
});
//排行榜部分/////////////////////////////////////


//加载登录进的用户信息
function userMessageLoad(userData) {

    if (userData.userSex == '男') {
        img.src = 'images/male.jpg'
    } else {
        img.src = 'images/female.jpg'
    }
    name.innerHTML = userData.userId
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