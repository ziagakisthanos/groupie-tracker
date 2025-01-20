package myapp

import (
	"encoding/json"
	"io"
	"net/http"
)

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
	url := "https://groupietrackers.herokuapp.com/api/artists"
	// send a rwuest to a website(url) get a response back
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// read the website data
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var artists []Artist
	if err := json.Unmarshal(body, &artists); err != nil {
		return nil, err
	}

	return artists, nil
}
