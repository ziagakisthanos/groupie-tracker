package handlers

import (
	"html/template"
	"log"
	"net/http"
	"path/filepath"
)

func NotFoundHandler(w http.ResponseWriter, r *http.Request) {
	// custom 404 page file path
	templatePath := filepath.Join("assets", "404.html")

	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		http.Error(w, "Could not load 404 template", http.StatusInternalServerError)
		log.Println("Error loading 404 template:", err)
		return
	}
	// set the HTTP status code to 404
	w.WriteHeader(http.StatusNotFound)

	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, "Failed to render 404 template", http.StatusInternalServerError)
		log.Println("Failed to render 404 template:", err)
		return
	}
}

// serve 500 error page
func InternalServerErrorHandler(w http.ResponseWriter, r *http.Request) {
	templatePath := filepath.Join("assets", "404.html")

	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		http.Error(w, "Could not load 404 template", http.StatusInternalServerError)
		log.Println("Error loading 404 template:", err)
		return
	}
	// set the HTTP status code to 500
	w.WriteHeader(http.StatusInternalServerError)

	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, "Failed to render 404 template", http.StatusInternalServerError)
		log.Println("Failed to render 404 template:", err)
		return
	}
}
