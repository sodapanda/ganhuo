// main good
package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"
)

var isDone bool

func main() {
	// 模拟每天的0点执行任务
	go func() {
		for {
			now := time.Now()
			nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())
			duration := nextMidnight.Sub(now)
			// duration := 10 * time.Second
			fmt.Println("sleep:")
			fmt.Println(duration)
			time.Sleep(duration)

			if !isDone {
				removeRandomFile("/home/qishui/media/Backup/bxs/")
			}

			isDone = false
		}
	}()

	// 设置 HTTP 接口
	http.HandleFunc("/setIsDone", setIsDoneHandler)
	log.Fatal(http.ListenAndServe(":7771", nil))
}

func removeRandomFile(dirPath string) {
	files, err := ioutil.ReadDir(dirPath)
	if err != nil {
		log.Println("Error reading directory:", err)
		return
	}

	if len(files) == 0 {
		log.Println("No files to remove.")
		return
	}

	rand.Seed(time.Now().UnixNano())
	randomIndex := rand.Intn(len(files))
	fileToRemove := files[randomIndex].Name()
	err = os.Remove(dirPath + fileToRemove)
	if err != nil {
		log.Println("Error removing file:", err)
		return
	}

	fmt.Println("Removed file:", fileToRemove)
}

func setIsDoneHandler(w http.ResponseWriter, r *http.Request) {
	// 允许跨域请求
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		return
	}

	query := r.URL.Query()
	val := query.Get("value")
	if val == "" {
		http.Error(w, "Missing 'value' parameter", http.StatusBadRequest)
		return
	}

	b, err := strconv.ParseBool(val)
	if err != nil {
		http.Error(w, "Invalid boolean value", http.StatusBadRequest)
		return
	}

	isDone = b
	fmt.Fprintf(w, "isDone set to %v", isDone)
}
