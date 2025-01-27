package myapp

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
	ID        int      `json:"id"` // they array values
	Locations []string `json:"locations"`
	Dates     string   `json:"dates"`
}

// the root object of the locations API response.

type LocationAPIResponse struct {
	Index []Location `json:"index"` // the key containing the array
}

type PageData struct {
	Artists   []Artist
	Locations []Location
}
