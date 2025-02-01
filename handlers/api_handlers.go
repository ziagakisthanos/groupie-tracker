package handlers

import (
	"encoding/json"
	"log"
	"myapp/api"
	"net/http"
)

func APIHandler(w http.ResponseWriter, r *http.Request) {
	// fetch artist data
	artistDetails, err := api.FetchAllData()
	if err != nil {
		log.Printf("Error fetching artist data %v\n", err)
		http.Error(w, "Error fetching artist data", http.StatusInternalServerError)
		return
	}

	// set the metadata response format to JSON (MIME type)
	w.Header().Set("Content-Type", "application/json")

	// convert GO data structs,maps,slices,etc. into JSON format
	// and write the result on ResponseWriter
	if err := json.NewEncoder(w).Encode(artistDetails); err != nil {
		log.Printf("Error encoding JSON: %v\n", err)
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
	}
}
