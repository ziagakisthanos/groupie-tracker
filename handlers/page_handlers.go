package handlers

import (
	"html/template"
	"log"
	"myapp/api"
	"net/http"
	"path/filepath"
)

func HomePageHandler(w http.ResponseWriter, r *http.Request) {
	// serve the 404 page
	if r.URL.Path != "/" {
		NotFoundHandler(w, r)
		return
	}

	// template file path
	templatePath := filepath.Join("assets", "index.html")

	// parse the template
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		http.Error(w, "Error loading homepage template", http.StatusInternalServerError)
		InternalServerErrorHandler(w, r)
		return
	}

	// execute the template
	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, "Error rendering homepage template", http.StatusInternalServerError)
		InternalServerErrorHandler(w, r)
		return
	}
}

func ArtistsPageHandler(w http.ResponseWriter, r *http.Request) {
	// fetch artist data
	artistDetails, err := api.FetchAllData()
	if err != nil {
		InternalServerErrorHandler(w, r)
	}

	// template file path
	templatePath := filepath.Join("assets", "artists.html")

	// parse the template
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		InternalServerErrorHandler(w, r)
		log.Println("Error loading artists template:", err)
		return
	}

	// execute the template
	// using the combined data (use `nil` if no data)
	if err := tmpl.Execute(w, artistDetails); err != nil {
		InternalServerErrorHandler(w, r)
		log.Fatal("Failed to render artists template:", err)
		return
	}
}
