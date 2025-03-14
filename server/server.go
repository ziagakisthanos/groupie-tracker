package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"
)

func Server(addr string, handler http.Handler) {

	// initializing server
	server := &http.Server{
		Addr:    addr,
		Handler: handler,
	}

	// custom channel to capture OS signals
	stop := make(chan os.Signal, 1)
	// notify the channel for interrupt or termination signals
	signal.Notify(stop, os.Interrupt)

	// log the server startup
	log.Printf("\n🚀 Starting server at http://localhost%v\n", addr)

	// starting server on separate goroutine
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("\nServer error: %v\n", err)
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
