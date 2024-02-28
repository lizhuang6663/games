
var startSign = $(".start-sign")
var countdown = $(".countdown")
var items = $$(".item")
var characters = $$(".character")
var clear = $(".clear")
var back = $(".delete")
var scoreBox = $(".score")
var img = $('.img')
var name = $('.name')
var userData = JSON.parse(localStorage.getItem('user'))



//用户拼好的汉字
var str = "";
// 用于跟踪当前应该将文字放置在哪个盒子中
var currentIndex = 0
var itemCurrentIndex = 0
var score = 0
var gameover = false



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
        img.src = 'images/male.jpg'

    } else {
        img.src = 'images/female.jpg'

    }
    name.innerHTML = userData.userId
}


userMessageLoad(userData)


setTimeout(function () {
    startSign.style.display = "none"
    // 60 秒的倒计时
    startCountdown(60);




    //正确的成语池
    var rightPools = ['一帆风顺', '二龙戏珠', '三羊开泰', '四季平安', '五谷丰登', '六畜兴旺', '七星高照', '八面玲珑', '九九归一', '十全十美', '买椟还珠', '丰富多彩']


    // 定义每个子数组的长度
    const chunkSize = Math.ceil(rightPools.length / 3);

    // 创建三个独立的数组并分配元素
    const firstArray = rightPools.slice(0, chunkSize);
    const secondArray = rightPools.slice(chunkSize, 2 * chunkSize);
    const thirdArray = rightPools.slice(2 * chunkSize);

    console.log(secondArray);

    //第一关的汉字池
    var pools1 = subStringIdiom(firstArray)
    var pools2 = subStringIdiom(secondArray)
    var pools3 = subStringIdiom(thirdArray)

    console.log(pools2);
    //汉字池的内容
    dataLoad(pools1)



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

        let isEmpty = true;
        // 如果盒子内容不为空，则将isEmpty标记为false并跳出循环
        if (item.content !== '') {
            isEmpty = false;

        }
        // console.log(isEmpty);
        // 根据isEmpty的值输出结果
        if (isEmpty) {
            console.log("aaaaaaaaa");
            // dataLoad(pools2)
        } else {
            // console.log('仍有数据');
        }

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
function startCountdown(durationInSeconds) {
    let currentTime = 0;

    var interval = setInterval(() => {
        currentTime++;
        const progressPercentage = (currentTime / durationInSeconds) * 100;
        countdown.style.width = `${100 - progressPercentage}%`;

        if (currentTime >= durationInSeconds) {
            clearInterval(interval);
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

