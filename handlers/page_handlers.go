package handlers

import (
	"html/template"
	"log"
	"net/http"
	"os"
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
	_, err := os.Stat(templatePath)
	if err != nil {
		InternalServerErrorHandler(w, r)
	}

	http.ServeFile(w, r, templatePath)
}

func ArtistsPageHandler(w http.ResponseWriter, r *http.Request) {
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
	if err := tmpl.Execute(w, nil); err != nil {
		InternalServerErrorHandler(w, r)
		log.Fatal("Failed to render artists template:", err)
		return
	}
}

func AboutPageHandler(w http.ResponseWriter, r *http.Request) {
	templatePath := filepath.Join("assets", "about.html")

	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		InternalServerErrorHandler(w, r)
		log.Println("Error loading about us template:", err)
		return
	}

	if err := tmpl.Execute(w, nil); err != nil {
		log.Fatal("Failed to load about us template:", err)
		return
	}
}
