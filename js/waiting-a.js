
window.onload = () => {
    let copyIcon = $('.copy-icon')
    let inviteLink = $('.invite-link')
    let coatLink = $('.coat-link')
    let rivalImg = $('.rivalImg')
    let myImg = $('.myImg')
    let myId = $('.myId')

    localStorage.setItem('alreadyJoin', '111111111111111')


    //渲染玩家a的信息
    let userData = JSON.parse(localStorage.getItem('user'))
    myId.innerHTML = userData.userId
    if (userData.userSex == '男') {
        myImg.src = 'images/male.jpg'
    } else {
        myImg.src = 'images/female.jpg'
    }

    //复制内容到剪切板
    copyIcon.addEventListener('click', () => {
        const content = inviteLink.textContent;
        console.log(content, "contenttttttttttttttt");

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(content)
                .then(() => {
                    console.log('内容已成功复制到剪贴板');
                    coatLink.style.display = 'none'
                })
                .catch(err => {
                    console.error('复制失败:', err);
                });
        } else {
            // 兼容性处理，如果浏览器不支持 navigator.clipboard API
            const textarea = document.createElement('textarea');
            textarea.value = content;
            textarea.style.position = 'fixed'; // 使其在视口之外，保证不可见
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            console.log('内容已成功复制到剪贴板');
            coatLink.style.display = 'none';
        }
    });


    //点击敌方头像邀请链接出现
    rivalImg.addEventListener('click', () => {
        coatLink.style.display = 'block'

        // 获取当前页面的href
        let currentHref = window.location.href;

        // 创建一个随机字符串
        function createUniqueString() {
            return Math.random().toString(36).substr(2, 10);
        }

        // 生成独一无二的href
        let uniqueHref = currentHref + '?key=' + createUniqueString();

        inviteLink.innerHTML = uniqueHref
        //将房间号存入玩家a的本地
        localStorage.setItem('roomNum', JSON.stringify(uniqueHref))
    })


}

const ws = new WebSocket('ws://39.105.7.43:8090/ws')

// 标志变量，用于跟踪是否应该发送数据1
let shouldSendData1 = true;
let shouldSendData2 = true;
let shouldSendData3 = true;
let shouldSendData4 = true;
let shouldSendData5 = true;
let shouldSendData6 = true;


let gameRun = $('.game-run')
let backBox = $('.back-box')
let rivalImg = $('.rivalImg')
let userData = JSON.parse(localStorage.getItem('user'))
let id = userData.userId
let chatUl = $('.chat-ul')
let sendMes = $('.send-message')
let send = $('.send')
let str = ''

// 监听连接打开事件
ws.onopen = function (event) {
    console.log(`WebSocket 连接状态： ${ws.readyState}`)

    setInterval(function () {
        if (shouldSendData4) {
            // 发送数据
            ws.send(`{"Type":2,"Data":"${id}"}`)
        }
    }, 1000); // 每秒发送一次数据

};

//点击对手头像
rivalImg.addEventListener('click', () => {
    // 开始发送数据
    setInterval(function () {
        if (shouldSendData1) {
            // 发送数据
            //玩家a创建房间
            let roomNum = JSON.parse(localStorage.getItem('roomNum'));

            localStorage.setItem("roomMaster", JSON.stringify(roomNum))

            ws.send(`{"Type":11,"Data":"${userData.userId} ${roomNum}"}`)
        }
    }, 1000); // 每秒发送一次数据


});

//点击开始游戏
gameRun.addEventListener('click', () => {
    // 开始发送数据
    setInterval(function () {
        if (shouldSendData2) {
            //玩家a点击开始游戏
            // 发送数据
            let roomNum = JSON.parse(localStorage.getItem('roomNum'))

            ws.send(`{"Type":14,"Data":"${userData.userId} ${roomNum}"}`)
        }
    }, 1000); // 每秒发送一次数据

    setInterval(function () {
        if (shouldSendData5) {
            // 发送数据
            let roomNum = JSON.parse(localStorage.getItem('roomNum'))

            //获取成语
            ws.send(`{"Type":16,"Data":"${roomNum} 1 12"}`)
        }
    }, 1000); // 每秒发送一次数据
});


//点击退出房间
backBox.addEventListener('click', () => {

    //当房主未创建房间时,即本地没有roomNum的数据
    if (localStorage.getItem("roomNum") === null) {
        //直接退出
        window.location.href = 'select.html'
    } else {
        //退出房间之前发送数据
        // 开始发送数据
        setInterval(function () {
            if (shouldSendData3) {
                let roomNum = JSON.parse(localStorage.getItem('roomNum'))

                // 发送数据
                ws.send(`{"Type":15,"Data":"${userData.userId} ${roomNum}"}`)
            }
        }, 1000); // 每秒发送一次数据
    }
});



//发送信息都从右边发
send.addEventListener('click', () => {
    if (sendMes.value !== "") {
        var message = sendMes.value
        var userData = JSON.parse(localStorage.getItem('user'))

        let roomNum = JSON.parse(localStorage.getItem('roomNum'))

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



    } else {
        alert("发送消息不能为空")
    }

})


// 监听消息事件
ws.onmessage = function (event) {
    console.log(event);
    var receivedType = JSON.parse(event.data).type;
    var receivedData = JSON.parse(event.data).data;


    //连接成功
    if (receivedData === "200" && receivedType === 2) {
        // 停止发送数据
        shouldSendData4 = false;
    }

    //玩家a创建房间
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
        //解析对方的id和性别
        let [userId, userSex] = parts;
        if (userId !== "0") {
            console.log("玩家b加入房间");

            //玩家a存储房主,即邀请者
            var usera = { "useraId": userData.userId, "useraSex": userData.userSex }
            localStorage.setItem("usera", JSON.stringify(usera))
            //玩家b存储被邀请
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
            alert("对手退出房间")

        }

    }

    //接收双人游戏的成语
    if (receivedType === 16) {
        // 停止发送数据
        shouldSendData5 = false;
        console.log(receivedData);
        // 存储到本地
        localStorage.setItem('d-idiomData', JSON.stringify(receivedData));
        //进入游戏页面
        window.location.href = 'double-game.html'
    }

    //接收到14后跳转房间
    if (receivedType === 14 && receivedData === '200') {
        shouldSendData2 = false;
    }


    //接收退出房间信息后退出房间
    if (receivedType === 15 && receivedData === '200') {
        shouldSendData3 = false;
        localStorage.removeItem('roomNum')
        // 跳转到选择页面
        window.location.href = 'select.html';
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




//当 WebSocket 连接关闭时触发的事件处理程序函数
ws.onclose = data => {
    console.log('WebSocket连接已关闭')
    console.log(data);
}

//当发生 WebSocket 错误时触发的事件处理程序函数。
ws.onerror = () => {
    console.error('websocket fail');
}
