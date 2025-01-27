package api

// artist's data struct returned by the API
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

// concert location's data struct returned by API
type Location struct {
	ID        int      `json:"id"` // the array values
	Locations []string `json:"locations"`
	Dates     []string `json:"dates"`
}

// concert dates's data struct returned by API
type ConcertDate struct {
	ID    int      `json:"id"`
	Dates []string `json:"dates"`
}

// the root object of the locations API response.
type LocationAPIResponse struct {
	Index []Location `json:"index"` // the key containing the array
}

// object of dates's API response
type DatesAPIResponse struct {
	Index []ConcertDate `json:"index"`
}

type PageData struct {
	Artists   []Artist
	Locations []Location
}
