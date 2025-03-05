# Groupie Tracker

## Overview
Groupie Tracker is a web application built with **Go** that fetches and displays music-related data from an API. It provides details about artists, their concert locations, tour dates, and the relationships between them. The goal is to present this information in an intuitive and engaging way.

## Features
- **Artist Profiles**: Displays band details, including name, image, active years, and first album release date.
- **Concert Locations**: Shows venues for past and upcoming concerts.
- **Concert Dates**: Lists event schedules.
- **Data Relations**: Links artists with corresponding locations and dates.
- **Searchbar**:
    - Search by artist/band anme, members, locations, first alabum date and creation date.
    - Case-insensitive search.
    - Auto-suggestions while typing. 
- **Client-Server Interaction**: Implements an interactive feature that requests and processes data from the server.

## API Data Structure
The application retrieves data from the following API endpoints:

- **Artists**: Provides details about bands and musicians.
- **Locations**: Lists concert venues.
- **Dates**: Displays concert schedules.
- **Relation**: Connects artists to locations and dates.

## Setup and Installation
### Prerequisites
- Install [Go](https://golang.org/doc/install)
- A web browser

### Steps to Run
#### Step 1
run this command to clone the repo locally and set it as the working directory.
```sh
git clone https://gitea.com/aziagaki/groupie-tracker.git
cd groupie-tracker
```

#### Step 2
run this to start the server 
```sh
go run main.go
```
#### Step 3
Then open `http://localhost:8080` in your browser.

## Project Structure
```
groupietracker/
├── api/
│   ├── fetch_all.go
│   ├── fetch.go
│   ├── models.go
├── assets/...
├── handlers/
│   ├── api_handlers.go
│   ├── errorhandlers.go
│   ├── page_handlers.go
├── .gitignore
├── go.mod
├── main.go
└── README.md
```

## Usage
- View a list of artists on the homepage.
- Use the search bar to find artists, members, locations, or albums.
- Click on an artist for detailed information.
- Interact with elements that trigger server responses.

## Authors
Maria tzemanaki 🍓

Thanos Ziagakis 🍇

