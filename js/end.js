const ws = new WebSocket('ws://172.20.10.3:8090/ws')


let userData = JSON.parse(localStorage.getItem('user'))
var id = userData.userId


var shouldSendData1 = true;
var shouldSendData2 = true;

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

    setInterval(function () {
        if (shouldSendData2) {
            // 发送数据
            ws.send(`{"Type":4,"Data":"${userData.userId} ${userData.score}"}`)
        }
    }, 1000); // 每秒发送一次数据

};

ws.onmessage = function (event) {
    // console.log("ttttttttttttttttt");
    console.log(event);
    var receivedType = JSON.parse(event.data).type;
    // 如果收到后端发送的数据
    if (receivedType === 4) {
        shouldSendData3 = false;
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
