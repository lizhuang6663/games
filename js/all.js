export { user, idLimit };
window.onload = () => {
    class User {
        constructor(userId, userPwd, userSex, score) {
            this.userId = userId;
            this.userPwd = userPwd;
            this.userSex = userSex;
            this.score = score;

        }

    }
    var user = new User()

    function idLimit(inputBox) {
        const inputElement = inputBox;

        inputElement.addEventListener('input', function (event) {
            const inputValue = event.target.value;

            // 使用正则表达式检查输入是否为6位数字
            const isValidInput = /^\d{6}$/.test(inputValue);

            // 如果输入不符合要求，则清除输入
            if (!isValidInput) {
                event.target.value = inputValue.slice(0, 6).replace(/\D/g, '');
            }
        });
        return false
    }
}