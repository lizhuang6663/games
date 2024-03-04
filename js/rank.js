
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