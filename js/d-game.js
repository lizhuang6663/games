window.onload = () => {
    var startSign = $(".start-sign")
    var countdown = $(".countdown")

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startCountdown(durationInSeconds) {
        let currentTime = 0;

        const interval = setInterval(() => {
            currentTime++;
            const progressPercentage = (currentTime / durationInSeconds) * 100;
            countdown.style.width = `${100 - progressPercentage}%`;

            if (currentTime >= durationInSeconds) {
                clearInterval(interval);
            }
        }, 1000);
    }

    setTimeout(function () {
        startSign.style.display = "none"
        // 60 秒的倒计时
        startCountdown(60);




        var items = $$(".item")
        var characters = $$(".character")
        var clear = $(".clear")
        var back = $(".delete")
        var scoreBox = $(".score")

        //正确的成语池
        var rightPools = ['一见钟情', '买椟还珠', '吃饭韩我', '龙兴凤举']
        //展示中的汉字池
        var pools = new Array(16)
        //汉字池的内容
        pools = ['一', '见', '钟', '情', '买', '椟', '还', '珠', '吃', '饭', '韩', '我', '龙', '兴', '凤', '举']
        //汉字池的内容被打乱
        var shufflePools = shuffleArray(pools)
        //用户拼好的汉字
        var str = "";
        // 用于跟踪当前应该将文字放置在哪个盒子中
        var currentIndex = 0
        var itemCurrentIndex = 0
        var score = 0



        //数据渲染
        for (let i = 0; i < pools.length; i++) {
            items[i].textContent = shufflePools[i]

        }


        items.forEach(function (item) {
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
                            foundMatch = true;
                            score += 2
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
                        score -= 1
                        scoreBox.textContent = score

                    }


                }

            })
        });

        //删除
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


        //清空
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
    }, 1500)

}
