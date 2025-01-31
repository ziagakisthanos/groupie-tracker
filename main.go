package main

import (
	"fmt"
	"log"
	"myapp/handlers"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
)

func main() {

	// server setup
	mux := http.NewServeMux()
	// register homePage root path
	mux.HandleFunc("/", handlers.HomePageHandler)
	// JSON data path
	mux.HandleFunc("/api/data", handlers.APIHandler)

	// Serve static files from the "assets" folder
	staticDir := filepath.Join("assets")
	fs := http.FileServer(http.Dir(staticDir))
	mux.Handle("/assets/", http.StripPrefix("/assets/", fs))

	// defining server port
	addr := ":8080"

	// initializing server
	server := &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	// custom channel to capture OS signals
	stop := make(chan os.Signal, 1)

	// notify the channel for interupt or termination signals
	signal.Notify(stop, os.Interrupt)

	// log the server startup
	log.Printf("\n🚀 Starting server at http://localhost%v\n", addr)

	// starting server on separate goroutine
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("\nServer error: %v\n", err)
			// os.Exit(1) not needed in case of log.fatalf
		}
	}()

	// waiting for signals
	<-stop
	log.Println("\nShutting down server...")

	// attempt shutdown
	if err := server.Close(); err != nil {
		fmt.Printf("❌ Error during server shutdown: %v\n", err)
	}

	log.Println("\n✅ Server gracefully stopped.")

}
