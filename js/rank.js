
var rank = $('.rank')
var arrow = $('.arrow')
var singleBox = $(".single-box")
var rankImg = $$(".rank-img")
var rankId = $$(".rank-id")
var scores = $$('.score')
var img = $('.img')
var name = $('.name')
export var userData = JSON.parse(localStorage.getItem('user'))

var userMessageLoad = function (userData) {

    if (userData.userSex == '男') {
        img.src = 'images/male.jpg'
    } else {
        img.src = 'images/female.jpg'
    }
    name.innerHTML = userData.userId
}

userMessageLoad(userData)

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
            for (let index = 0; index < rankData.length; index++) {
                rankId[index].innerHTML = rankData[index].userId

                if (rankData[index].userSex == '男') {
                    rankImg[index].src = 'images/male.jpg'
                } else {
                    rankImg[index].src = 'images/female.jpg'

                }
                scores[index].innerHTML = rankData[index].score
                index++
            }




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





