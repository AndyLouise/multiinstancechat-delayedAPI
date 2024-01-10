import express, { json } from 'express';
import { get } from 'axios';
const app = express();
const PORT = 3000;
const delayTimeInMinutes = 5; // 4 minutes delay 

// Middleware to parse JSON requests
app.use(json());

// Queue to store incoming requests
const requestQueue = [];

async function removeOldUsers(playersToRemove) {
  const url = 'https://multiinstancechat-production.up.railway.app/setUsers?auth=TDE4RkVN&action=remove&p=' + playersToRemove;
  try {
    const response = await get(url);
    // Log the entire response object
    const occupantsCount = response.data;
    return occupantsCount;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}


// Function to process the queue
const processQueue = () => {
    if (requestQueue.length > 0) {
        const request = requestQueue.shift();
        console.log(`Processing request with number: ${request.number}`);
        // Make your API call here
        setTimeout(() => {
            removeOldUsers(request.number)
              .then(occupantsCount => {
                console.log('New Number of occupants:', occupantsCount);
              })
              .catch(error => {
                console.error('Error:', error.message);
            });
            console.log(`Executed call to delete players: ${request.number}`);
            processQueue(); // Process next request
        }, delayTimeInMinutes * 60 * 1000); // 5 minutes delay 5 * 60 * 1000
    }
};

try {
  app.get("/", async (req, res) => {
    const alive = req.query.alive || 1;
  
    if (alive == 1) {
      res.json({Status: "Alive"});
      return;
    }
  });
  
  // API endpoint to receive requests
  app.get('/enqueue', async (req, res) => {
    try {
      const number = req.query.n || null;
      if(number == null) {
        res.end("Bad Request");
        return;
      }
      requestQueue.push({ number });
      console.log(`Enqueued player removal: ${number}`);
      processQueue();
      res.json({ message: 'Request enqueued.' });
    } catch(error) {
      console.log("Error:", error)
    }
  });
  
  app.listen(PORT, () => {
      console.log(`API server is running on port ${PORT}`);
  });
} catch (error) {
  console.log(error);
}

