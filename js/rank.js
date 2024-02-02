window.onload = () => {
    var rank = $('.rank')
    var arrow = $('.arrow')
    var singleBox = $(".single-box")

    arrow.addEventListener('click', () => {
        console.log(1);
        if (rank.className.includes('hidden')) {
            rank.className = 'rank show'
            arrow.className = 'arrow rotate'
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

