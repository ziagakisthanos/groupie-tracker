package handlers

import (
	"encoding/json"
	"myapp/api/searchbar"
	"net/http"
)

func SearchHandler(w http.ResponseWriter, r *http.Request) {
	// Get the query parameter from the URL
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, `{"error": "Query parameter 'q' is required"}`, http.StatusBadRequest)
		return
	}

	// Perform the search
	results := searchbar.SearchData(query)

	// Set the response format to JSON
	w.Header().Set("Content-Type", "application/json")

	// Encode the results as JSON and write to the response
	if err := json.NewEncoder(w).Encode(results); err != nil {
		InternalServerErrorHandler(w, r)
		http.Error(w, `{"error": "Failed to encode search results"}`, http.StatusInternalServerError)
	}
}
