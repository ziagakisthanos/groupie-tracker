package myapp

import (
	"html/template"
	"log"
	myapp "myapp/api"
	"net/http"
	"path/filepath"
)

func HomePageHandler(w http.ResponseWriter, r *http.Request) {

	// fetch artist data
	artists, err := myapp.FetchArtists()
	if err != nil {
		http.Error(w, "Error fetching artist data", http.StatusInternalServerError)
		return
	}

	// fetch location data
	locations, err := myapp.FetchLocations()
	if err != nil {
		log.Printf("Error fetching location data: %v\n", err) // Log the error

		http.Error(w, "Error fetching location data", http.StatusInternalServerError)
		return
	}

	// combine the fetched data
	pageData := struct {
		Artists   []myapp.Artist
		Locations []myapp.Location
	}{
		Artists:   artists,
		Locations: locations,
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

	// execute the template
	// using the combined data (use `nil` if no data)
	if err := tmpl.Execute(w, pageData); err != nil {
		http.Error(w, "Failed to render template", http.StatusInternalServerError)
		log.Fatal("Failed to load template:", err)
	}
}
