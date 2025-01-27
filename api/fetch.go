package myapp

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)

func FetchArtists() ([]Artist, error) {
	// API endpoint
	url := "https://groupietrackers.herokuapp.com/api/artists"

	// send a  GET request to a website(url) get a response back
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	// close the response body to prevent resource leaks
	defer resp.Body.Close()

	// read the website data into memory
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// parse the JSON data from resp body into a slice of Artist struct
	var artists []Artist
	if err := json.Unmarshal(body, &artists); err != nil {

		return nil, err
	}

	// return the parsed data
	return artists, nil
}

func FetchLocations() ([]Location, error) {
	// API endpoint
	url := "https://groupietrackers.herokuapp.com/api/locations"

	// send GET request to the API endpoint
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read the response body into memory
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// parse the JSON data from the response in our Location struct
	var locations LocationAPIResponse
	if err := json.Unmarshal(body, &locations); err != nil {
		log.Printf("Error unmarshaling JSON: %v\n", err)

		return nil, err
	}
	// return the array containing the data
	return locations.Index, nil
}
