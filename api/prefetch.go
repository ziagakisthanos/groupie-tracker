package api

// store the prefetched artist data
var prefetchedArtists []ArtistDetails

// fetch artists
func PreFetchData() error {
	var err error
	prefetchedArtists, err = FetchAllData()
	if err != nil {
		return err
	}
	return nil
}

// return the prefetched artists data
func GetPrefetchedArtists() []ArtistDetails {
	return prefetchedArtists
}
