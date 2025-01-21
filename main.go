package main

import (
	"fmt"
	"log"
	myapp "myapp/web"
	"net/http"
	"os"
	"os/signal"
)

func main() {

	// server setup
	mux := http.NewServeMux()
	mux.HandleFunc("/", myapp.HomePageHandler)

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
	log.Printf("\nStarting server at http://localhost%v\n", addr)

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

	fmt.Println("✅ Server gracefully stopped.")

}
