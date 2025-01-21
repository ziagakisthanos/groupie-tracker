package myapp

import (
	"html/template"
	"log"
	myapp "myapp/api"
	"net/http"
	"path/filepath"
)

func HomePageHandler(w http.ResponseWriter, r *http.Request) {

	artists, err := myapp.FetchArtists()
	if err != nil {
		http.Error(w, "Error fetching artist data", http.StatusInternalServerError)
		return
	}

	// template file path
	templatePath := filepath.Join("html", "index.html")

	// parse the template
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		http.Error(w, "Could not load template", http.StatusInternalServerError)
		log.Println("Error loading template:", err)
		return
	}

	// execute the template with any data (use `nil` if no data)
	if err := tmpl.Execute(w, artists); err != nil {
		http.Error(w, "Failed to render template", http.StatusInternalServerError)
		log.Fatal("Failed to load template:", err)
	}
}
