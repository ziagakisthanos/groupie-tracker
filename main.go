package main

import (
	"log"
	"myapp/api"
	"myapp/routes"
	"myapp/server"
)

func main() {
	// fetch data before starting server
	if err := api.PreFetchData(); err != nil {
		log.Fatalf("Failed to pre-fetch artists: %v\n", err)
	}

	mux := routes.SetupRoutes()

	// defining server port
	addr := ":8080"
	// start the server
	server.Server(addr, mux)
}
