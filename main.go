package main

import (
	myapp "myapp/web"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", myapp.HomePageHandler)

}
