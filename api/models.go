package api

// artist's data struct returned by the API
type Artist struct {
	ID           int      `json:"id"`
	Image        string   `json:"image"`
	Name         string   `json:"name"`
	Members      []string `json:"members"`
	CreationDate int      `json:"creationDate"`
	FirstAlbum   string   `json:"firstAlbum"`
	Locations    `json:"-"`
	Dates        `json:"-"`
	Relation     `json:"-"`
}

// concert location's data struct returned by API
type Locations struct {
	ID        int      `json:"id"` // the array values
	Locations []string `json:"locations"`
}

// the root object of the locations API response.
type LocationAPIResponse struct {
	Index []Locations `json:"index"` // the key containing the array
}

// concert dates API data struct, same approach as locations
type Dates struct {
	ID    int      `json:"id"`
	Dates []string `json:"dates"`
}

type DatesAPIResponse struct {
	Index []Dates `json:"index"`
}

// relations contains dynamic keys
// we map the data using locations as key and dates as values
type Relation struct {
	ID             int                 `json:"id"`
	DatesLocations map[string][]string `json:"datesLocations"`
}

type RelationAPIResponse struct {
	Index []Relation `json:"index"`
}

type ArtistDetails struct {
	Artist    Artist              `json:"artist"`
	Locations []string            `json:"locations"`
	Dates     []string            `json:"dates"`
	Relations map[string][]string `json:"relations"`
}
