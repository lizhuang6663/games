window.onload = () => {


    class Message {
        constructor(Type, Data) {
            this.Type = Type;//字符串
            this.Data = Data;//数据 字符串
        }
    }

    class User {
        constructor(UserId, UserPwd, UserSex, Score) {
            this.UserId = UserId;
            this.UserPwd = UserPwd;
            this.UserSex = UserSex;
            this.Score = Score;

        }
    }

    var loginBtn = $(".login-btn")

    function loginTurnToPage() {
        var userId = $('#user-id').value
        var password = $('#psw').value
        console.log(userId);
        let user = new User(userId, password, null, null);
        console.log(user);
        let loginMes = JSON.stringify(new Message("LoginMes", JSON.stringify(user)));
        console.log(loginMes);
        axios({
            url: 'http://localhost:8090/login',
            method: 'post',
            data: {
                loginMes
            }

        }).then(result => {
            //获取成功
            console.log(result)
            // window.location.href = "index.html";
        }).catch(error => {
            //失败
            console.log(error)
        })

    }

    loginBtn.addEventListener('click', loginTurnToPage)

}


