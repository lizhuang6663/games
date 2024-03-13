package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type HttpTransfer struct {
	W http.ResponseWriter
	R *http.Request
}

// ReadPkg 读取
func (this *HttpTransfer) ReadPkg(request interface{}) ([]byte, error) {
	data, err := io.ReadAll(this.R.Body)
	if err != nil {
		fmt.Println("ReadPkg() io.ReadAll() err = ", err)
		return nil, err
	}
	fmt.Println("接收到的内容为：", string(data))

	// 反序列化
	err = json.Unmarshal(data, &request)
	if err != nil {
		fmt.Println("ReadPkg() json.Unmarshal() err = ", err)
		return nil, err
	}

	return data, nil
}

// WritePkg 写给前端
func (this *HttpTransfer) WritePkg(v interface{}) error {
	// 序列化
	data, err := json.Marshal(v)
	if err != nil {
		fmt.Println("WritePkg() json.Marshal() err = ", err)
		return err
	}

	// 将序列化之后的结果发送给前端
	n, err := io.WriteString(this.W, string(data))
	if err != nil {
		fmt.Println("WritePkg() WriteString() err = ", err)
		return err
	}
	fmt.Printf("向前端写入了 %d 个字节数，内容为：%s\n", n, string(data))

	return nil
}
