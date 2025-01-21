package myapp

import (
	"encoding/json"
	"io"
	"net/http"
)

// data struct returned by the API
type Artist struct {
	ID           int      `json:"id"`
	Image        string   `json:"image"`
	Name         string   `json:"name"`
	Members      []string `json:"members"`
	CreationDate int      `json:"creationDate"`
	FirstAlbum   string   `json:"firstAlbum"`
	Locations    string   `json:"locations"`
	ConcertDates string   `json:"concertDates"`
	Relations    string   `json:"relations"`
}

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
