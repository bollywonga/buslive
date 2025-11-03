# Bus Location Tracker

## Overview
The Bus Location Tracker is a web application that allows bus drivers to share their real-time location with passengers without requiring any login. The application utilizes HTML, CSS, JavaScript, Firebase Realtime Database, and the Google Maps JavaScript API to provide a seamless experience for both drivers and passengers.

## Features
- **Driver View**: 
  - Start sharing location with a single button.
  - Generate a unique link for passengers to view the live map.
  - Stop sharing location updates easily.

- **Passenger View**: 
  - View the bus's real-time location on Google Maps.
  - No login or sign-up required.

## Technology Stack
- **Frontend**: HTML, CSS, JavaScript
- **Map**: Google Maps JavaScript API
- **Database**: Firebase Realtime Database

## File Structure
```
bus-location-tracker
├── src
│   ├── assets
│   │   ├── styles
│   │   │   ├── driver.css
│   │   │   ├── passenger.css
│   │   │   └── main.css
│   │   └── js
│   │       ├── config.js
│   │       ├── firebase.js
│   │       ├── driver.js
│   │       ├── passenger.js
│   │       ├── map.js
│   │       └── utils.js
│   ├── driver.html
│   ├── passenger.html
│   └── index.html
├── .gitignore
├── firebase.json
├── package.json
└── README.md
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the necessary dependencies using npm:
   ```
   npm install
   ```
4. Configure your Firebase project in `src/assets/js/config.js` with your API keys and database URLs.
5. Deploy the application using Firebase Hosting:
   ```
   firebase deploy
   ```

## Usage
- Open `index.html` to access the application.
- Drivers can start sharing their location and generate a link for passengers.
- Passengers can use the link to view the driver's real-time location on the map.

## License
This project is licensed under the MIT License.