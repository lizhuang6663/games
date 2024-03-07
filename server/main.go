package main

import (
	"IdiomGames/controllers"
	"IdiomGames/dao"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"net/http"
)

func init() {
	// 初始化 mysql管理系统对象
	dao.InitDatabaseManager()

	// 初始化 map
	controllers.InitMap()
}

func main() {
	defer dao.DbManager.Close()

	r := mux.NewRouter()
	// 接收消息
	r.HandleFunc("/login", controllers.Login)
	r.HandleFunc("/register", controllers.Register)
	r.HandleFunc("/ranking", controllers.Ranking)
	r.HandleFunc("/ws", controllers.WSBegin)

	// 允许来自所有域的跨域请求（允许特定的请求头、HTTP 方法和域进行跨域访问），也可以根据需求进行更改
	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}) // AllowedHeaders：指定允许的自定义请求头
	methods := handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"})        // AllowedMethods：指定允许的 HTTP 方法。
	origins := handlers.AllowedOrigins([]string{"*"})                             // AllowedOrigins：指定允许跨域请求的域。
	// AllowedHeaders 允许了 "Content-Type" 和 "Authorization"，AllowedMethods 允许了 "GET"、"POST" 和 "OPTIONS" 方法，AllowedOrigins 允许了所有域。
	// 然后，handlers.CORS 将这些参数应用到 http.ListenAndServe 函数中创建的 HTTP 处理器中。这样就可以通过中间件来处理跨域请求，而不需要在每个处理器中单独设置响应头了。
	http.ListenAndServe(":8090", handlers.CORS(headers, methods, origins)(r))
}
