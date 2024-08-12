# MavunoForecast

MavunoForecast is a USSD-based weather alert system targeting an East African audience. The application provides real-time weather updates and alerts, with support for Swahili and English languages. Users can customize their alert preferences and receive location-based weather information.

## Features

- **Real-Time Weather Alerts:** Receive the latest weather updates for your location.
- **Location-Based Services:** Get accurate local weather information based on your location.
- **Customization:** Set your preferred language (Swahili/English) and customize alert preferences.
- **Error Handling:** Robust error handling ensures a seamless user experience.

## System Architecture

### Components

1. **USSD Gateway:** Manages incoming USSD requests and responses.
2. **Node.js Backend:** Handles business logic, communicates with the weather API, and manages the database.
3. **Weather API:** Fetches real-time weather data.
4. **Database:** Stores user preferences, locations, and logs.

### Flow

1. User dials the USSD code.
2. The USSD Gateway forwards the request to the Node.js backend.
3. The backend processes the request, fetches weather data, and updates/queries the database.
4. The backend sends the appropriate response back through the USSD Gateway.

## Installation

### Prerequisites

- Node.js and npm installed on your machine.
- MongoDB or another database service.
- API key from a weather service provider (e.g., OpenWeatherMap).
- USSD Gateway service (e.g., Africa's Talking).

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/philwamba/mavunoforecast.git
   cd mavunoforecast
   ```
## Installation

### Install dependencies:

```bash
npm install
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any features, bug fixes, or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
