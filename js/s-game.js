//写在single-game界面  
window.onload = () => {
    var score = 0
    var startSign = $(".start-sign")
    var countdown = $(".countdown")
    var items = $$(".item")
    var characters = $$(".character")
    var clear = $(".clear")
    var back = $(".delete")
    var scoreBox = $(".score")
    var userImg = $('.img')
    var userName = $('.name')
    var userData = JSON.parse(localStorage.getItem('user'))
    var musicBox = $('.music-box')
    var music = $('#bgMusic')
    var musicIcon = $('#musicIcon')


    // 用于跟踪当前应该将文字放置在哪个盒子中
    var currentIndex = 0
    //用户当前拼好的成语个数
    var itemCurrentIndex = 0

    //标志游戏是否结束
    let gameover = false


    //控制音乐按键的播放与暂停
    musicBox.addEventListener('click', function () {

        if (musicIcon.className.includes('iconfont icon-shengyinguanbi')) {
            musicIcon.className = 'iconfont icon-shengyin'
            music.play()
        } else {
            musicIcon.className = 'iconfont icon-shengyinguanbi'
            music.pause()
        }

    })



    //将单个字渲染到每个空格位置
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


    //将传过来的成语改变格式为以空格分隔的数组
    var idiomDataChange = function (originalString) {
        // 使用 split() 方法切割字符串为数组
        var phraseArray = originalString.split(' ');
        return phraseArray
    }

    //渲染用户的信息
    userMessageLoad(userData)


    //延迟1.5秒开始,让用户有准备时间
    setTimeout(function () {
        //将开始标志隐藏
        startSign.style.display = "none"
        console.log("游戏开始");

        // 开始60秒的倒计时
        startCountdown(60, gameover);


        //获取本地存储的未处理的成语
        var idiomData = JSON.parse(localStorage.getItem('idiomData'))
        console.log(idiomData);
        //获取以空格分隔的四字成语数组(正确的成语池)
        var rightPools = idiomDataChange(idiomData)



        //将12个四字成语分为三组,再分为单个字/////////////////////////
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
        ///将12个四字成语分为三组,再分为单个字//////////////////////////

        //汉字池的内容(先渲染第一组成语)
        dataLoad(pools1)


        //对每个放成语的方格都绑定事件
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
                            score += 5
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
                                //将本次得分存入本地和更新用户的数据
                                scoreLoad(score)
                                //跳转成功界面
                                window.location.href = 'victory.html'
                            }
                            //拼写成功后延迟0.2s清除文本框的内容
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



    //开启倒计时
    function startCountdown(durationInSeconds, gameover) {
        let overTime = 0;
        //同步倒计时方框的变化
        let interval = setInterval(() => {

            overTime++;
            const progressPercentage = (overTime / durationInSeconds) * 100;
            countdown.style.width = `${100 - progressPercentage}%`;
            //当计时达到60s时就消除定时器
            if (overTime >= durationInSeconds) {
                clearInterval(interval);
                //将游戏结束标志设为真
                gameover = true

                //将分数存入本地
                scoreLoad(score)

                //跳转失败界面
                window.location.href = 'defeat.html'

            }
        }, 1000);
    }


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
    function scoreLoad(userScore) {
        //将本次分数放进本地存储中
        localStorage.setItem('currentScore', JSON.stringify(userScore))
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


