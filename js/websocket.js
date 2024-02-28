
import { userData } from "./s-game.js";
console.log(userData.userId);


if ('WebSocket' in window) {
    console.log("1111111111");
    const ws = new WebSocket('ws://127.0.0.1:8090/WSBegin')
    console.log("222222222222");
    var id = userData
    var type2Data = {}
    var type3Data = {}
    var type4Data = {}


    //当与服务器建立连接时触发的事件处理程序函数
    ws.onopen = e => {
        console.log(`WebSocket 连接状态： ${ws.readyState}`)
        ws.send(JSON.stringify(`{type:2,data:"${id}"}`))
        console.log("ffffffffffffffff");
    }

    //当接收到来自服务器的消息时触发的事件处理程序函数。
    ws.onmessage = data => {
        console.log(data);
        if (data.type == 3) {
            console.log('33333333333333');
        }
        // 存储到本地
        // localStorage.setItem('data', JSON.stringify(user));
        if (data.type == 4) {
            console.log('444444444444444');
        }
    }

    //当 WebSocket 连接关闭时触发的事件处理程序函数
    ws.onclose = data => {
        console.log('WebSocket连接已关闭')
        console.log(data);
    }

    //当发生 WebSocket 错误时触发的事件处理程序函数。
    ws.onerror = () => {
        console.error('websocket fail');
    }

    // sendBtn.onclick = () => {
    //     ws.send(msgBox.value)
    // }
    // exit.onclick = () => {
    //     ws.close()
    // }

}
else {
    console.error('dont support websocket');
}


