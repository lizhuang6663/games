window.onload = () => {
    var startSign = $(".start-sign")
    var countdownBox = $(".countdown-box")
    var countdown = $(".countdown")

    setTimeout(function () {
        startSign.style.display = "none"
        var countdownBoxWidth = countdownBox.offsetWidth

        // var intervalId = setInterval(function () {
        //     // console.log(1);

        //     // 递减宽度，这里可以根据需要调整递减的速度
        //     var newWidth = countdownBoxWidth - 1;

        //     // 设置新宽度
        //     countdown.style.width = newWidth + "px";

        //     // 如果宽度为零，清除定时器
        //     if (newWidth <= 0) {
        //         clearInterval(intervalId);
        //     }
        // }, 1000); // 时间间隔为1秒，可以根据需要调整














    }, 1500);

}
