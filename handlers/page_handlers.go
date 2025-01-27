package handlers

import (
	"html/template"
	"log"
	"myapp/api"
	"net/http"
	"path/filepath"
)

func HomePageHandler(w http.ResponseWriter, r *http.Request) {

	// fetch artist data
	artists, err := api.FetchArtists()
	if err != nil {
		http.Error(w, "Error fetching artist data", http.StatusInternalServerError)
		log.Printf("Error fetching artist data: %v\n", err)
		return
	}

	// fetch location data
	locations, err := api.FetchLocations()
	if err != nil {
		http.Error(w, "Error fetching location data", http.StatusInternalServerError)
		log.Printf("Error fetching location data: %v\n", err) // Log the error
		return
	}

	// template file path
	templatePath := filepath.Join("assets", "index.html")

	// parse the template
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		http.Error(w, "Could not load template", http.StatusInternalServerError)
		log.Println("Error loading template:", err)
		return
	}

	// combine the fetched data
	data := api.PageData{
		Artists:   artists,
		Locations: locations,
	}

	// execute the template
	// using the combined data (use `nil` if no data)
	if err := tmpl.Execute(w, data); err != nil {
		http.Error(w, "Failed to render template", http.StatusInternalServerError)
		log.Fatal("Failed to load template:", err)
	}
}
