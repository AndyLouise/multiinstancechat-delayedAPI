# Multi-Instance Chat Player Count API Documentation

### Overview
This API is designed to enqueue and process requests to remove users from a chat system after a specified delay. It utilizes Express.js for handling HTTP requests and Axios for making HTTP requests to an external API.

### Base URL
The base URL for this API is the root domain of the server where it is hosted.

### Enqueue Request
- **Endpoint:** `/enqueue`
- **Method:** GET
- **Parameters:**
  - `n` (required): The number of the player to be removed.
- **Description:** Enqueues a player removal request with the specified number. The request will be processed after a delay.

### Alive Check
- **Endpoint:** `/`
- **Method:** GET
- **Parameters:**
  - `alive` (optional): If set to 1, it returns a JSON response with the status "Alive".
- **Description:** Checks if the API server is running and returns a status response. If the `alive` parameter is not provided or set to a value other than 1, it does not return any data.

### Data Removal
- **Function:** `removeOldUsers(playersToRemove)`
  - **Parameters:**
    - `playersToRemove`: The number of players to be removed.
  - **Description:** Sends a request to an external API to remove the specified number of players. It returns the new number of occupants after the removal.

### Server Configuration
- **Port:** The API server runs on port 3000 by default. You can access the API endpoints using `http://localhost:3000` if running locally.

### Usage
1. Send a GET request to `/enqueue` with the `n` parameter to enqueue a player removal request.
2. The API will process the enqueued requests after a delay of 4 minutes.
3. To check if the API server is running, send a GET request to `/`. Optionally, you can include the `alive` parameter set to 1 to receive a status response.
