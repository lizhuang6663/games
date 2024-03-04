import { score } from "./s-game"

export var core = 0
window.onload = () => {
    var startSign = $(".start-sign")
    var countdown = $(".countdown")
    var items = $$(".item")
    var characters = $$(".character")
    var clear = $(".clear")
    var back = $(".delete")
    var scoreBox = $(".score-b")
    var userImg = $('.img')
    var userName = $('.name')
    var userData = JSON.parse(localStorage.getItem('user'))



    //用户拼好的汉字
    var str = "";
    // 用于跟踪当前应该将文字放置在哪个盒子中
    var currentIndex = 0
    var itemCurrentIndex = 0

    var gameover = false



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

    //渲染两位玩家的信息
    var useraId = $('.userAid')
    var userbId = $('.userBid')
    var useraSex = $('#useraImg')
    var userbSex = $('#userbImg')

    var roomData = JSON.parse(localStorage.getItem('room'))
    useraId.innerHTML = roomData.useraId
    userbId.innerHTML = roomData.userbId

    if (roomData.useraSex == '男') {
        useraSex.src = 'images/male.jpg'
    } else {
        useraSex.src = 'images/female.jpg'
    }

    if (roomData.userbSex == '男') {
        userbSex.src = 'images/male.jpg'
    } else {
        userbSex.src = 'images/female.jpg'
    }



    //单人模式下的ws
    doubleWS(ws)




    function doubleWS(ws) {
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


        // 获取要监听的元素
        var targetNode = $('.score-b')

        // 创建 Mutation Observer 实例
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                setInterval(function () {
                    if (shouldSendData3) {
                        var roomData = JSON.parse(localStorage.getItem('room'))
                        // 发送数据
                        ws.send(`{"Type":17,"Data":"${id} ${roomData.roomId} ${score}"}`)
                    }
                }, 1000); // 每秒发送一次数据

            });
        });

        // 配置观察器的选项
        var config = { childList: true, subtree: true, characterData: true };

        // 启动观察器并传入目标节点和配置
        observer.observe(targetNode, config);

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
            if (receivedData === "200" && receivedType === 19) {
                // 停止发送数据
                shouldSendData3 = false;
            }


            if (receivedType === 17) {
                shouldSendData2 = false;
                console.log(receivedData);
                var scoreA = $('.score-a')
                scoreA.innerHTML = receivedData
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


    //数据渲染
    function dataLoad(pools) {
        //汉字池的内容被打乱
        var shufflePools = shuffleArray(pools)
        for (let i = 0; i < pools.length; i++) {
            items[i].textContent = shufflePools[i]

        }

    }


    //个人信息的加载
    var userMessageLoad = function (userData) {
        if (userData.userSex == '男') {
            userImg.src = 'images/male.jpg'

        } else {
            userImg.src = 'images/female.jpg'

        }
        userName.innerHTML = userData.userId
    }


    //将传过来的数据改变格式
    var idiomDataChange = function (originalString) {
        // 使用 split() 方法切割字符串为数组
        var phraseArray = originalString.split(' ');
        return phraseArray
    }


    userMessageLoad(userData)
    // console.log(idiomDataChange());


    setTimeout(function () {
        startSign.style.display = "none"
        console.log("游戏开始");
        // 60 秒的倒计时
        startCountdown(60);



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

        // console.log(secondArray);

        //第一关的汉字池
        var pools1 = subStringIdiom(firstArray)
        var pools2 = subStringIdiom(secondArray)
        var pools3 = subStringIdiom(thirdArray)

        // console.log(pools2);
        //汉字池的内容
        dataLoad(pools1)




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
                            if (itemCurrentIndex == 4) {
                                console.log("123456789");
                                dataLoad(pools2)
                            } else if (itemCurrentIndex == 8) {
                                console.log("7777777777777777");
                                dataLoad(pools3)
                            } else if (itemCurrentIndex == 12 && gameover == false) {
                                scoreLoad(score)
                                window.location.href = 'victory.html'
                            }
                            foundMatch = true;
                            score += 5
                            scoreBox.textContent = score
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
                        score -= 3
                        scoreBox.textContent = score

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

                scoreLoad(score)

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

    function scoreLoad(userScore) {
        //将本次分数放进本地存储中
        localStorage.setItem('currentScore', JSON.stringify(userScore))
        // 从本地存储中获取对象数组
        var objectArray = JSON.parse(localStorage.getItem('user'));

        objectArray.score += userScore
        // 将更改后的对象数组转换回字符串，并存回本地存储
        localStorage.setItem('user', JSON.stringify(objectArray));

    }
}


