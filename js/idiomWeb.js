window.onload = () => {
    if ('WebSocket' in window) {

        // 读取并解析对象
        // const storedUser = JSON.parse(localStorage.getItem('data'));

        const ws = new WebSocket('ws://127.0.0.1:8090/WSBegin')

        var id = Number($('#user-id').value)
        var type2Data = {}


        // { type: 2, data : "userId" }

        //当与服务器建立连接时触发的事件处理程序函数
        ws.onopen = e => {
            console.log(`WebSocket 连接状态： ${ws.readyState}`)
        }

        ws.send("早日康复")

        //当接收到来自服务器的消息时触发的事件处理程序函数。
        ws.onmessage = data => {
            console.log(data);

            // 存储到本地
            // localStorage.setItem('data', JSON.stringify(user));

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

}
