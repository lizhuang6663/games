
//写在double-game中
window.onload = () => {
    var score = 0
    var startSign = $(".start-sign")
    var countdown = $(".countdown")
    var items = $$(".item")
    var characters = $$(".character")
    var clear = $(".clear")
    var back = $(".delete")

    let roomNum = JSON.parse(localStorage.getItem('roomNum'))
    var heartbeatTimer = null;//心跳定时器
    let reconnectTimer = null;//重连定时器
    let ws = null;
    let connectionCount = 0;

    // 用于跟踪当前应该将文字放置在哪个盒子中
    var currentIndex = 0
    //用户当前拼好的成语个数
    var itemCurrentIndex = 0
    //标志游戏是否结束
    var gameover = false

    // 连接websocket
    function wsLink() {
        ws = new WebSocket('ws://39.105.7.43:8090/ws')
    }



    let userData = JSON.parse(localStorage.getItem('user'))
    var id = userData.userId
    var sex = userData.userSex




    //渲染两位玩家的信息///////////////////////////////////
    var useraId = $('.userAid')
    var userbId = $('.userBid')
    var useraSex = $('#useraImg')
    var userbSex = $('#userbImg')

    //从本地获取玩家a的信息
    var usera = JSON.parse(localStorage.getItem('usera'))

    //用户a在左边，即房主
    useraId.innerHTML = usera.useraId
    if (usera.useraSex === '男') {
        useraSex.src = 'images/male.jpg'

    } else {
        useraSex.src = 'images/female.jpg'
    }
    //从本地获取玩家b的信息
    var userb = JSON.parse(localStorage.getItem('userb'))

    //用户b在左边，即被邀请人

    userbId.innerHTML = userb.userbId
    if (userb.userbSex === '男') {
        userbSex.src = 'images/male.jpg'

    } else {
        userbSex.src = 'images/female.jpg'
    }

    //渲染两位玩家的信息///////////////////////////////////

    wsLink();
    doubleWS(ws)


    // 心跳检测
    function wsHeartbeat() {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
        }
        heartbeatTimer = setInterval(function () {
            if (ws.readyState === WebSocket.OPEN) { // 确保 WebSocket 连接处于打开状态
                // 发送心跳消息给服务器
                ws.send("PING");
                console.log("心跳检测")
            } else {
                // 如果 WebSocket 连接已经关闭，则清除定时器
                clearInterval(heartbeatTimer);
            }
        }, 5000); // 每隔 5 秒发送一次心跳消息
    }

    //断线重连
    function wsReconnect() {

        if (reconnectTimer) {
            clearInterval(reconnectTimer);
        }

        reconnectTimer = setInterval(function () {
            // 进行重连
            wsLink();
            if (connectionCount <= 7) {
                connectionCount++;
            } else {
                clearInterval(reconnectTimer);
                alert("重新打开吧老登")
            }
            console.log("重连定时器");
        }, 5000); // 每隔 5 秒发送一次心跳消息
    }

    function doubleWS(ws) {
        // 标志变量，用于跟踪是否应该发送数据
        var shouldSendData1 = true;
        var shouldSendData2 = true;

        // 监听连接打开事件
        ws.onopen = function (event) {
            console.log(`WebSocket 连接状态： ${ws.readyState}`)
            //此页面一打开就发送用户的id
            // // 开始发送数据
            // setInterval(function () {
            //     if (shouldSendData1) {
            //     }
            // }, 1000); // 每秒发送一次数据

            // 发送数据
            ws.send(`{"Type":2,"Data":"${id}"}`)

            //关闭重连
            clearInterval(reconnectTimer);


            //打开心跳检测
            wsHeartbeat();

        };


        // 获取要监听的元素
        var scoreA = $('.score-a');
        var scoreB = $('.score-b');


        // 创建 Mutation Observer 实例
        var observer = new MutationObserver(function (mutations) {
            console.log(mutations, "**********")
            // mutations.forEach(function (mutation) {
            console.log(score, "发送的分数")
            // setTimeout(() => {
            ws.send(`{"Type":17,"Data":"${userData.userId} ${userData.userSex} ${roomNum} ${score}"}`)
            // }, 200)
            // });
        });


        // 配置观察器的选项
        var config = { childList: true, subtree: true, characterData: true };
        let userA = JSON.parse(localStorage.getItem('usera'))
        let userB = JSON.parse(localStorage.getItem('userb'))
        let userData = JSON.parse(localStorage.getItem('user'))

        //当前玩家为usera
        if (userData.userId === userA.useraId) {
            //监听usera的盒子，将分数传出去
            console.log("当前玩家为usera,数据已经传出");
            // 启动观察器并传入目标节点和配置
            observer.observe(scoreA, config);
        } else if (userData.userId === userB.userbId) {
            //当前玩家为userb
            //监听userb的盒子，将分数传出去
            console.log("当前玩家为userb,数据已经传出");

            observer.observe(scoreB, config);
        } else {
            console.log('判断条件不成立');
        }


        // 监听消息事件
        ws.onmessage = function (event) {
            console.log(event, "监听服务器返回数据");
            var receivedType = JSON.parse(event.data).type;
            var receivedData = JSON.parse(event.data).data;

            //连接成功
            if (receivedData === "200" && receivedType === 2) {
                // 停止发送数据
                shouldSendData1 = false;
            }
            //接收对方的分数成功
            if (receivedData === "200" && receivedType === 19) {
                // 停止发送数据
                console.log("收到19");
            }

            //发送自己的分数
            if (receivedType === 17) {
                console.log("收到17");
                console.log(receivedData);
                // 使用 split() 方法将字符串以空格分割成数组
                let parts = receivedData.split(" ");

                // 得到发出分数的玩家的id和分数
                let [userId, userSex, roomId, score] = parts;
                console.log(userId, userbId.innerHTML, useraId, "userId, userbId, useraId")

                //如果发出的玩家等于userb
                if (userId == userbId.innerHTML) {
                    console.log("接收到userb的数据,改变usera的内容");
                    //usera的框发生变化
                    scoreB.innerHTML = score
                } else if (userId == useraId.innerHTML) {
                    //如果发出的玩家等于usera
                    //userb的框发生变化
                    console.log("接收到usera的数据,改变userb的内容");

                    scoreA.innerHTML = score
                } else {
                    console.log("接收到无效id，无法录入分数框");
                }
            }
        };


        //当 WebSocket 连接关闭时触发的事件处理程序函数
        ws.onclose = data => {
            console.log('WebSocket连接已关闭');

            console.log(data);
            //清除心跳定时器
            clearInterval(heartbeatTimer);

            //重新连接
            wsReconnect();
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


    //数据渲染
    function dataLoad(pools) {
        //汉字池的内容被打乱
        var shufflePools = shuffleArray(pools)
        for (let i = 0; i < pools.length; i++) {
            items[i].textContent = shufflePools[i]

        }

    }


    //将传过来的数据改变格式
    var idiomDataChange = function (originalString) {
        // 使用 split() 方法切割字符串为数组
        var phraseArray = originalString.split(' ');
        return phraseArray
    }

    var scoreBox = null
    //延迟1.5s开始游戏
    setTimeout(function () {
        // 开始标志消失
        startSign.style.display = "none"
        console.log("游戏开始");
        // 60 秒的倒计时
        startCountdown(60);

        let usera = JSON.parse(localStorage.getItem('usera'))

        //看看此时的玩家a是否是当前的玩家
        if (usera.useraId === userData.userId) {
            //是则用盒子a
            scoreBox = $('.score-a')

        } else {
            // 不是则用盒子b
            scoreBox = $('.score-b')

        }

        //从本地得到双人游戏的成语
        var idiomData = JSON.parse(localStorage.getItem('d-idiomData'))
        console.log(idiomData);
        //正确的成语池
        var rightPools = idiomDataChange(idiomData)


        // 定义每个子数组的长度
        const chunkSize = Math.ceil(rightPools.length / 3);

        // 创建三个独立的数组并分配元素
        const firstArray = rightPools.slice(0, chunkSize);
        const secondArray = rightPools.slice(chunkSize, 2 * chunkSize);
        const thirdArray = rightPools.slice(2 * chunkSize);

        //第一关的汉字池
        var pools1 = subStringIdiom(firstArray)
        var pools2 = subStringIdiom(secondArray)
        var pools3 = subStringIdiom(thirdArray)

        //汉字池的内容
        dataLoad(pools1)


        //对每个汉字都绑定事件
        items.forEach(function (item) {
            itemCurrentIndex = 0;
            //成语字数不足
            //点击使文字进入汉字框
            item.addEventListener('click', function () {
                // console.log(this.textContent)
                if (currentIndex < characters.length && this.textContent != "") {
                    characters[currentIndex].textContent = this.textContent
                    this.textContent = ""
                    currentIndex++
                    console.log(currentIndex);
                }
                //成语字数充满后获取后端数据判断
                if (currentIndex == characters.length) {
                    console.log("成语判断");
                    let str = "";

                    // 存进数组中
                    for (let i = 0; i < characters.length; i++) {
                        str += characters[i].textContent;
                    }

                    //用于判断当前成语是否拼写成功
                    let foundMatch = false;
                    for (let i = 0; i < rightPools.length; i++) {
                        if (str == rightPools[i]) {
                            console.log("拼写成功");
                            itemCurrentIndex++;
                            console.log("item" + itemCurrentIndex);
                            foundMatch = true;
                            //拼写成功加5分
                            score += 5
                            //将成语写入分数框中
                            scoreBox.textContent = score
                            //玩家答对4个成语后
                            if (itemCurrentIndex == 4) {
                                //渲染第二组成语
                                dataLoad(pools2)
                                //玩家答对8个成语后
                            } else if (itemCurrentIndex == 8) {
                                //渲染第三组成语
                                dataLoad(pools3)
                                //玩家答对12个成语且倒计时未结束
                            } else if (itemCurrentIndex == 12 && gameover == false) {
                                scoreLoad(score, scoreBox)
                                window.location.href = 'victory.html'
                            }

                            setTimeout(() => {
                                // 清除文本框的内容
                                characters.forEach(function (character) {
                                    character.textContent = "";
                                    currentIndex = 0;
                                });
                            }, 200);
                            break; // 一旦找到匹配项，就跳出循环
                        }
                    }
                    //循环结束后没有找到匹配项就输出失败
                    if (!foundMatch) {
                        console.log("拼写失败");
                    }

                }

            })

        });

        //删除键
        deleteChaContent()
        //清空键
        clearChaContent()



    }, 1500)





    //清空键（清空四个框的内容）
    var clearChaContent = function () {
        clear.addEventListener('click', function () {
            characters.forEach(function (character) {
                var foundEmpty = false; // 标志变量用于标记是否已经找到第一个空的元素
                items.forEach(function (item) {
                    if (!foundEmpty && item.textContent == "") { // 如果尚未找到空元素并且当前元素为空
                        item.textContent = character.textContent;
                        character.textContent = ""
                        foundEmpty = true; // 将标志设置为 true，表示已经找到了第一个空的元素
                    }
                });

            })
            currentIndex = 0
        })
    }

    //删除键（删除最后一个字）
    var deleteChaContent = function () {
        back.addEventListener('click', function () {
            if (currentIndex > 0 && currentIndex <= characters.length) {
                currentIndex--;
                var foundEmpty = false; // 标志变量用于标记是否已经找到第一个空的元素
                items.forEach(function (item) {
                    if (!foundEmpty && item.textContent == "") { // 如果尚未找到空元素并且当前元素为空
                        item.textContent = characters[currentIndex].textContent;
                        foundEmpty = true; // 将标志设置为 true，表示已经找到了第一个空的元素
                    }
                });
                characters[currentIndex].textContent = "";
            }
        });
    }

    //打乱数组中的元素
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    //开启倒计时
    function startCountdown(durationInSeconds, gameover) {

        let currentTime = 0;

        var interval = setInterval(() => {
            currentTime++;
            const progressPercentage = (currentTime / durationInSeconds) * 100;
            countdown.style.width = `${100 - progressPercentage}%`;

            if (currentTime >= durationInSeconds) {
                clearInterval(interval);
                gameover = true

                //返回分数写入下一页面
                scoreLoad(score, scoreBox)

                window.location.href = 'defeat.html'





            }
        }, 1000);
    }

    //将四字成语拆分成单个元素放进数组中
    function subStringIdiom(array) {
        const originalArray = array;
        const resultArray = [];

        for (let i = 0; i < originalArray.length; i++) {
            // 将当前字符串拆分成单个字符并存储在结果数组中
            for (let j = 0; j < originalArray[i].length; j++) {
                resultArray.push(originalArray[i][j]);
            }
        }
        return resultArray;
    }

    //与该玩家之前的分数作比较,较高的存入该玩家个人信息中
    function scoreLoad(userScore, scoreBox) {
        //将本次分数放进本地存储中
        localStorage.setItem('currentScore', JSON.stringify(userScore))
        //存储保存分数的盒子所指
        console.log(scoreBox);
        var scoreA = $('.score-a')
        var scoreB = $('.score-b')
        console.log(scoreA);
        console.log(scoreB);
        if (scoreBox === scoreA) {
            //存入对方的分数
            localStorage.setItem('fightScore', JSON.stringify(Number(scoreB.innerHTML)))
        } else if (scoreBox === scoreB) {
            localStorage.setItem('fightScore', JSON.stringify(Number(scoreA.innerHTML)))
        } else {
            console.log("数据有误，无法保存本地");
        }

        // 从本地存储中获取对象数组
        var objectArray = JSON.parse(localStorage.getItem('user'));
        //如果存储的用户分数比此次比赛分数高
        if (objectArray.score > userScore) {
            objectArray.score = objectArray.score
        } else {
            //修改存储的用户分数为此次比赛的分数
            objectArray.score = userScore
        }
        // 将更改后的对象数组转换回字符串，并存回本地存储
        localStorage.setItem('user', JSON.stringify(objectArray));

    }

}


