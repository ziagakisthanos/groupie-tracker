package main

import (
	"context"
	"fmt"
	"log"
	"myapp/handlers"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"time"
)

func main() {
	// server setup
	mux := http.NewServeMux()

	// Serve static files from the "assets" folder
	staticDir := filepath.Join("assets")
	fs := http.FileServer(http.Dir(staticDir))
	mux.Handle("/assets/", http.StripPrefix("/assets/", fs))

	// register homePage root path
	mux.HandleFunc("/", handlers.HomePageHandler)
	mux.HandleFunc("/artists", handlers.ArtistsPageHandler)
	// JSON data path
	mux.HandleFunc("/api/data", handlers.APIHandler)

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

	// add 5 second timeout as a layer before forcing shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// attempt shutdown
	if err := server.Shutdown(ctx); err != nil {
		fmt.Printf("❌ Error during server shutdown: %v\n", err)
	}

	log.Println("\n✅ Server gracefully stopped.")

}
