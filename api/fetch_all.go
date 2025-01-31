package api

import (
	"fmt"
	"log"
	"sync"
)

func FetchAllData() ([]ArtistDetails, error) {
	// Fetch artists data
	var artists []Artist
	if err := FetchData("https://groupietrackers.herokuapp.com/api/artists", &artists); err != nil {
		return nil, fmt.Errorf("failed to fetch artists data: %v", err)
	}

	// Fetch locations, dates, and relations concurrently
	var locationsResponse LocationAPIResponse
	var datesResponse DatesAPIResponse
	var relationsResponse RelationAPIResponse

	var wg sync.WaitGroup
	wg.Add(3)

	go func() {
		defer wg.Done()
		if err := FetchData("https://groupietrackers.herokuapp.com/api/locations", &locationsResponse); err != nil {
			log.Printf("Failed to fetch locations: %v", err)
		}
	}()

	go func() {
		defer wg.Done()
		if err := FetchData("https://groupietrackers.herokuapp.com/api/dates", &datesResponse); err != nil {
			log.Printf("Failed to fetch dates: %v", err)
		}
	}()

	go func() {
		defer wg.Done()
		if err := FetchData("https://groupietrackers.herokuapp.com/api/relation", &relationsResponse); err != nil {
			log.Printf("Failed to fetch relations: %v", err)
		}
	}()

	wg.Wait()

	// Create maps for quick lookup by ID
	locationsMap := make(map[int][]string)
	for _, loc := range locationsResponse.Index {
		locationsMap[loc.ID] = loc.Locations
	}

	datesMap := make(map[int][]string)
	for _, date := range datesResponse.Index {
		datesMap[date.ID] = date.Dates
	}

	relationsMap := make(map[int]map[string][]string)
	for _, rel := range relationsResponse.Index {
		relationsMap[rel.ID] = rel.DatesLocations
	}

	// Combine all data into ArtistDetails
	var artistDetails []ArtistDetails
	for _, artist := range artists {
		artistDetails = append(artistDetails, ArtistDetails{
			Artist:    artist,
			Locations: locationsMap[artist.ID],
			Dates:     datesMap[artist.ID],
			Relations: relationsMap[artist.ID],
		})
	}

	return artistDetails, nil
}
