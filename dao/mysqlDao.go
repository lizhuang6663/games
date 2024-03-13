package dao

import (
	"IdiomGames/model"
	"IdiomGames/utils"
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql" // 空导入
	"math/rand"
	"strings"
	"time"
)

// mysql数据库管理

// 数据库连接信息
const (
	userName     = "root"
	userPwd      = "root"
	hostName     = "127.0.0.1:3306"
	databaseName = "idiomgames"
	poolSize     = 20 // 连接池大小
)

type DatabaseManager struct {
	db *sql.DB
}

// DbManager 全局变量，用来操作数据库
var DbManager *DatabaseManager

// InitDatabaseManager 初始化全局变量 DbManager
func InitDatabaseManager() {
	DbManager, _ = NewDatabaseManager()
}

// NewDatabaseManager 用于创建一个新的 DatabaseManager 实例
func NewDatabaseManager() (*DatabaseManager, error) {
	// 构建数据库连接字符串
	dataSourceName := fmt.Sprintf("%s:%s@tcp(%s)/%s", userName, userPwd, hostName, databaseName)

	// 创建连接池
	db, err := sql.Open("mysql", dataSourceName)
	if err != nil {
		return nil, err
	}

	// 设置连接池大小
	db.SetMaxOpenConns(poolSize)

	// 测试连接
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, err
	}

	return &DatabaseManager{
		db: db,
	}, nil
}

// Close 用于关闭数据库连接
func (dm *DatabaseManager) Close() {
	if dm.db != nil {
		dm.db.Close()
	}
}

/*
	--------------------------------------------------------------------------------------
    |用户管理																		 	 |
	--------------------------------------------------------------------------------------
*/
// GetUserById 通过 UserId 从 mysql 数据库中获取到对应的 User 对象
func (this *DatabaseManager) GetUserById(userId int) (user *model.User, err error) {
	sqlStatement := "SELECT UserPwd, UserSex, Score FROM t_users where UserId = ?"

	// 执行查询操作
	rows, err := this.db.Query(sqlStatement, userId)
	if err != nil {
		fmt.Println("MysqlDao.go GetUserById() this.db.Query() err = ", err)
		return
	}
	defer rows.Close()

	// 处理查询结果
	// 存在该用户
	for rows.Next() {
		user = &model.User{
			UserId: userId,
		}
		if err := rows.Scan(&user.UserPwd, &user.UserSex, &user.Score); err != nil {
			fmt.Println("MysqlDao.go GetUserById() rows.Scan() err = ", err)
			return user, err
		}
	}

	// 如果user为空，更改错误值
	if user == nil {
		err = utils.ERROR_USER_NOTEXISTS
	}

	return user, err
}

// Register 用户注册 （通过 GetUserById 函数返回的user对象，来判断数据库中是否存在该id，从而进行注册逻辑）
func (this *DatabaseManager) Register(userId int, userPwd string, userSex string) (err error) {
	_, err = this.GetUserById(userId)
	// 如果 err != nil，说明找不到该id的用户，可以注册；如果 err == nil，说明存在该id的用户了，不能注册
	if err == nil {
		err = utils.ERROR_USER_EXISTS
		return
	}

	sqlStatement := "INSERT INTO t_users VALUES (?, ?, ?, ?)"
	result, err := this.db.Exec(sqlStatement, userId, userPwd, userSex, 0)

	// 获取受影响的行数
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		fmt.Println("MysqlDao.go Register() result.RowsAffected() err = ", err)
		return
	}
	fmt.Printf("mysql 中 idiomGames 数据库的 t_users 表 受到了 %d 行影响\n", rowsAffected)

	return err
}

// Login 用户登录（根据传入的userId，查找到mysql中完整的user，并返回，无论是否能成功登录，返回的都是mysql中完整的user）
func (this *DatabaseManager) Login(userId int, userPwd string) (user *model.User, err error) {
	user, err = this.GetUserById(userId)
	// err != nil，说明数据库中没有该用户
	if err != nil {
		// fmt.Println("MysqlDao.go Login() this.GetUserById() err = ", err)
		return
	}

	// 判断密码
	if user.UserPwd != userPwd {
		err = utils.ERROR_USER_PWD
	}

	return
}

// QueryRankingByScore 查询前n个分数最高的人，降序排列
func (this *DatabaseManager) QueryRankingByScore(n int) (ranking []*model.User, err error) {
	sqlStatement := "SELECT * FROM t_users ORDER BY score DESC LIMIT ?;"
	rows, err := this.db.Query(sqlStatement, n)
	if err != nil {
		fmt.Println("mysqlDao.go QueryRankingBySCore() this.db.Query() err = ", err)
		return
	}
	defer rows.Close()

	ranking = make([]*model.User, 0)
	for rows.Next() {
		user := &model.User{}
		if err := rows.Scan(&user.UserId, &user.UserPwd, &user.UserSex, &user.Score); err != nil {
			fmt.Println("mysqlDao.go QueryRankingBySCore() rows.Scan() err = ", err)
			return nil, err
		}
		ranking = append(ranking, user)
	}

	// rows.Err()：该方法用于检查查询结果集 rows 是否有错误发生。
	if err = rows.Err(); err != nil {
		return
	}

	return
}

// ChangeScoreById 更改用户的分数（根据传入的userId，查询到该用户的分数，并和传入的 score 比较，选择两者间最大的分数作为mysql中的分数，并将mysql中的分数改为socre）
func (this *DatabaseManager) ChangeScoreById(userId int, score int) (err error) {
	user, err := this.GetUserById(userId)
	if err != nil {
		fmt.Println("ChangeScoreById() this.GetUserById() err = ", err)
		return
	}

	if score > user.Score {
		// 构建更新语句
		sqlStatement := "UPDATE t_users SET Score = ? WHERE UserId = ?"

		// 执行更新操作
		_, err := this.db.Exec(sqlStatement, score, userId)
		if err != nil {
			fmt.Println("dao.ChangeScoreById() err = ", err)
			return err
		}
	}

	return err
}

/*
	--------------------------------------------------------------------------------------
    |成语管理																			 |
	--------------------------------------------------------------------------------------
*/
// RandomWords 根据当前关卡，从 mysql 中随机抽取 n 个成语，并返回
func (this *DatabaseManager) RandomWords(difficulty int, numOfWords int) (resultString string, err error) {
	if numOfWords <= 0 {
		err = utils.ERROR_LEVEL_WORDSNUM
		return
	}

	if difficulty < 1 || difficulty > 3 {
		err = utils.ERROR_LEVEL_NUM
		return
	}

	start, end := 0, 0
	if difficulty == 1 {
		start = 1
		end = 40
	} else if difficulty == 2 {
		start = 41
		end = 100
	} else if difficulty == 3 {
		start = 101
		end = 130
	}
	sqlStatement := "select word from t_words where id = ?"

	// 随机种子
	rand.Seed(time.Now().UnixNano())
	// 存放从数据库中挑选的每一个词语的id号码，防止挑选的词语重复
	num := make([]int, 0)
	// 存放挑选好的成语
	result := make([]string, 0)

	// 挑选n个不同的词语
	for i := 1; i <= numOfWords; i++ {
		// 找出一个不重复的id
		randomId := rand.Intn(end-start+1) + start
		for judgeSliExistsNum(num, randomId) {
			randomId = rand.Intn(end-start+1) + start
		}
		num = append(num, randomId)

		rows, err := this.db.Query(sqlStatement, randomId)
		if err != nil {
			fmt.Println("mysqlDao.go RandomWords() this.db.Query() err = ", err)
			return "", err
		}
		defer rows.Close()

		var word string

		for rows.Next() {
			if err := rows.Scan(&word); err != nil {
				fmt.Println("mysqlDao.go RandomWords() rows.Scan() err = ", err)
				return resultString, err
			}
			result = append(result, word)
		}
	}

	// 将result切片变为将每个元素以空格分割的字符串
	resultString = strings.Join(result, " ")
	return resultString, nil
}

// judgeSliExistsNum 判断切片中是否包含某个数
func judgeSliExistsNum(nums []int, n int) bool {
	for i := 0; i < len(nums); i++ {
		if nums[i] == n {
			return true
		}
	}
	return false
}
