window.onload = () => {
    var rank = $('.rank')
    var arrow = $('.arrow')
    var singleBox = $(".single-box")
    var rankImg = $$(".rank-img")
    var rankId = $$(".rank-id")
    var scores = $$('.score')
    var img = $('.img')
    var name = $('.name')

    var userMessageLoad = function () {
        var userData = JSON.parse(localStorage.getItem('user'))
        if (userData.userSex == '男') {
            img.src = 'images/male.jpg'

        } else {
            img.src = 'images/female.jpg'

        }
        name.innerHTML = userData.userId
    }

    userMessageLoad()

    arrow.addEventListener('click', () => {

        console.log(1);

        if (rank.className.includes('hidden')) {
            rank.className = 'rank show'
            arrow.className = 'arrow rotate'

            axios({
                url: 'http://localhost:8090/ranking',
                method: 'post',
                data: {
                    "Type": 1,
                    "Data": "10"
                }

            }).then(result => {
                console.log(result.data.data)
                //对象数组（存储了10个）
                var rankData = JSON.parse(result.data.data)
                localStorage.setItem('rank', rankData)
                rankData.forEach(element => {
                    var user = element
                    var index = 0
                    rankId[index].innerHTML = user.userId

                    if (user.userSex == '男') {
                        rankImg[index].src = 'images/male.jpg'
                    } else {
                        rankImg[index].src = 'images/female.jpg'

                    }
                    scores[index].innerHTML = user.score
                    index++
                });

            }).catch(error => {
                //失败
                console.log(error)
            })
        } else {
            rank.className = 'rank hidden'
            arrow.className = 'arrow rotateBack'
        }
    });
    singleBox.addEventListener('click', () => {
        var targetURL = 'single-game.html'

        window.location.href = targetURL
    })



}

