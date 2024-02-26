window.onload = () => {
    var rank = $('.rank')
    var arrow = $('.arrow')
    var singleBox = $(".single-box")

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
                console.log(result)

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

