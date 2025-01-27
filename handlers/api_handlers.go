package myapp

import (
	"encoding/json"
	"log"
	myapp "myapp/api"
	"net/http"
)

func APIHandler(w http.ResponseWriter, r *http.Request) {
	// fetch artist data
	artists, err := myapp.FetchArtists()
	if err != nil {
		log.Printf("Error fetching artist data %v\n", err)

		http.Error(w, "Error fetching artist data", http.StatusInternalServerError)
		return
	}

	// fetch location data
	locations, err := myapp.FetchLocations()
	if err != nil {
		// log the error
		log.Printf("Error fetching location data: %v\n", err)

		http.Error(w, "Error fetching location data", http.StatusInternalServerError)
		return
	}

	// new map to combine the data for frontend use
	responseData := map[string]interface{}{
		"artists":   artists,
		"locations": locations,
	}

	// w.Header() is a method to access the HTTP response header objects
	// Headers are metadata
	// key-value headers (ex. content-type)
	// bscly define the respone format as JSON to be parsed correctly
	// Set(key, value)
	// not tied to a specific object
	// manipulate key-value pairs in an HTTP header object

	// set the metadata response format to JSON (MIME type)
	w.Header().Set("Content-Type", "application/json")

	// convert GO data structs,maps,slices,etc. into JSON format
	// and write the result to the responseWriter (w)
	if err := json.NewEncoder(w).Encode(responseData); err != nil {
		log.Printf("Error encoding JSON: %v\n", err)
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
	}
}
