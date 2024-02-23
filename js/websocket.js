window.onload = () => {
    if ('WebSocket' in window) {

        // 读取并解析对象
        // const storedUser = JSON.parse(localStorage.getItem('data'));

        function loginTurnToPage() {
            var loginBtn = $(".login-btn")
            const ws = new WebSocket('ws://127.0.0.1:8090/login')
            const userId = $('#user-id')
            const password = $('#psw')


            //当与服务器建立连接时触发的事件处理程序函数
            ws.onopen = e => {
                console.log(`WebSocket 连接状态： ${ws.readyState}`)
            }

            //当接收到来自服务器的消息时触发的事件处理程序函数。
            ws.onmessage = data => {
                console.log(data);

                if (data.code == 200) {
                    //解析服务器传的数据
                    const user = {
                        "User": {
                            "UserId": 0,
                            "UserPwd": "string",
                            "UserSex": "string",
                            "Score": 0
                        }
                    };
                } else {
                    console.log("不存在该用户");
                }


                // 存储到本地
                localStorage.setItem('data', JSON.stringify(user));

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

            loginBtn.addEventListener('click', loginTurnToPage)
        }
    } else {
        console.error('dont support websocket');
    }

}
