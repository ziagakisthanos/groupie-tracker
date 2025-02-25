package searchbar

import (
	"myapp/api"
	"strconv"
	"strings"
)

// details of a matched item
type SearchMatch struct {
	ID    int    `json:"id"`
	Value string `json:"value"`
	Type  string `json:"type"`
}

// all match results
type Matches struct {
	Matches []SearchMatch `json:"matches"`
}

// filter prefetched artists based on the query.
func SearchData(query string) Matches {
	query = strings.TrimSpace(strings.ToLower(query))
	if query == "" {
		return Matches{}
	}

	// get the artist data
	artists := api.GetPrefetchedArtists()

	var matches []SearchMatch

	for _, artist := range artists {
		artistID := artist.Artist.ID

		if strings.Contains(strings.ToLower(artist.Artist.Name), query) {
			matches = append(matches, SearchMatch{ID: artistID, Type: "artist/band", Value: artist.Artist.Name})
		}
		for _, member := range artist.Artist.Members {
			if strings.Contains(strings.ToLower(member), query) {
				matches = append(matches, SearchMatch{ID: artistID, Type: "member", Value: member})
			}
		}
		for _, location := range artist.Locations {
			if strings.Contains(strings.ToLower(location), query) {
				matches = append(matches, SearchMatch{ID: artistID, Type: "location", Value: location})
			}
		}
		if strings.Contains(strings.ToLower(artist.Artist.FirstAlbum), query) {
			matches = append(matches, SearchMatch{ID: artistID, Type: "first-album-date", Value: artist.Artist.FirstAlbum})
		}
		creationDate := strconv.Itoa(artist.Artist.CreationDate)
		if strings.Contains(creationDate, query) {
			matches = append(matches, SearchMatch{ID: artistID, Type: "creation-date", Value: creationDate})
		}

		for _, date := range artist.Dates {
			cleanDate := strings.TrimPrefix(date, "*")
			if strings.Contains(cleanDate, query) {
				matches = append(matches, SearchMatch{Type: "date", Value: cleanDate})
			}
		}
		// for location, dates := range artist.Relations {
		// 	for _, date := range dates {
		// 		if strings.Contains(strings.ToLower(location), query) || strings.Contains(date, query) {
		// 			matches = append(matches, SearchMatch{Type: "concert", Value: location + " - " + date})
		// 		}
		// 	}
		// }
	}

	return Matches{Matches: matches}
}
