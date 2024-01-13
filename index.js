// Includes
"use strict";
require("dotenv").config({ path: require("find-config")(".env") });
const cors = require("cors");
const express = require("express");
const nocache = require("nocache");
const app = express();
const axios = require('axios');

// Config

let config = {
  dataFormat: process.env.DATA_FORMAT || "json",
  keepArtifacts:
    process.env.KEEP_ARTIFACTS?.toLowerCase().trim() === "true" ? true : false,
  port: process.env.PORT || 3000
};

console.log("--------------------------------");
console.log(`| Multi-Instance Chat -  Delayed API`);
console.log("--------------------------------");
console.log(`| PORT: ${config.port}`);
console.log(`| FORMAT: ${config.dataFormat}`);
console.log(`| KEEP ARTIFACTS: ${config.keepArtifacts}`);
console.log("--------------------------------");

// Init
app.use(cors());
app.use(nocache());
app.use(express.json());
app.engine("html", require("ejs").renderFile);
app.listen(config.port);
app.use(express.static("public"));

const delayTimeInMinutes = 5; // 4 minutes delay 

// Queue to store incoming requests
const requestQueue = [];

async function removeOldUsers(playersToRemove) {
  const url = 'https://multiinstancechat-production.up.railway.app/setUsers?auth=TDE4RkVN&action=remove&p=' + playersToRemove;
  try {
    const response = await axios.get(url);
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
      const auth = req.query.auth || null;
      const authKey = process.env['MASTER_KEY'];
      if(number == null) {
        res.json({Error: "Bad Request"});
        return;
      }
      // ensure only multi instance chat API can call this, for safety reasons
      if (auth == null || auth != authKey)
      {
        res.status(403).send("Access Forbidden: Invalid authentication key");
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
} catch (error) {
  console.log(error);
  res.json({Error: "There was an issue while processing this request, please try again"});
}

