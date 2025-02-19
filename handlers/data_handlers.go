package handlers

import (
	"encoding/json"
	"log"
	"myapp/api"
	"net/http"
)

func DataHandler(w http.ResponseWriter, r *http.Request, data []api.ArtistDetails) {
	// set the metadata response format to JSON (MIME type)
	w.Header().Set("Content-Type", "application/json")

	// convert GO data structs,maps,slices,etc. into JSON format
	// and write the result on ResponseWriter
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding JSON: %v\n", err)
		InternalServerErrorHandler(w, r)
	}
}
