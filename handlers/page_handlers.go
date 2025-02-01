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
	artists, err := api.FetchAllData()
	if err != nil {
		http.Error(w, "Error fetching artist data", http.StatusInternalServerError)
		log.Printf("Error fetching artists: %v\n", err)
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

	// execute the template
	// using the combined data (use `nil` if no data)
	if err := tmpl.Execute(w, artists); err != nil {
		http.Error(w, "Failed to render template", http.StatusInternalServerError)
		log.Fatal("Failed to load template:", err)
		return
	}
}
