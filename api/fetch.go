package api

import (
	"encoding/json"
	"io"
	"net/http"
)

// FetchData fetches data from a given URL and unmarshalls it into the provided target struct
func FetchData(url string, target interface{}) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if err := json.Unmarshal(body, target); err != nil {
		return err
	}
	return nil
}
