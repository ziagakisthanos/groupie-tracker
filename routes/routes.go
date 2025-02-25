package routes

import (
	"myapp/api"
	"myapp/handlers"
	"net/http"
	"path/filepath"
)

func SetupRoutes() *http.ServeMux {
	// server mux setup
	mux := http.NewServeMux()

	// Serve static files from the "assets" folder
	staticDir := filepath.Join("assets")
	fs := http.FileServer(http.Dir(staticDir))
	mux.Handle("/assets/", http.StripPrefix("/assets/", fs))

	// register handlers root paths
	mux.HandleFunc("/", handlers.HomePageHandler)
	mux.HandleFunc("/artists", handlers.ArtistsPageHandler)
	mux.HandleFunc("/api/data", func(w http.ResponseWriter, r *http.Request) {
		// serve the preFetched data
		handlers.DataHandler(w, r, api.GetPrefetchedArtists())
	})
	// New route for search functionality, passing the prefetched artists
	mux.HandleFunc("/api/search", handlers.SearchHandler)

	return mux
}
