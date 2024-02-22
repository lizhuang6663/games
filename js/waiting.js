window.onload = () => {
    var copyIcon = $('.copy-icon')
    var inviteLink = $('.invite-link')
    var coatLink = $('.coat-link')
    var rivalImg = $('.rivalImg')
    var backBox = $('.back-box')

    //复制内容到剪切板
    copyIcon.addEventListener('click', () => {
        const content = inviteLink.textContent;

        navigator.clipboard.writeText(content)
            .then(() => {
                console.log('内容已成功复制到剪贴板');
                coatLink.style.display = 'none'
            })
            .catch(err => {
                console.error('复制失败:', err);
                // 如果需要，在此处添加错误处理逻辑
            });
    });

    rivalImg.addEventListener('click', () => {
        coatLink.style.display = 'block'

    })

    backBox.addEventListener('click', () => {
        // 跳转到另一个页面
        window.location.href = 'select.html';
    });

}

