const express = require("express");
const app = express();
const { Kafka } = require("kafkajs");
const port = 4002;
const Redis = require("./Redis");
const { createClient } = require("redis");
const cors = require("cors");
const http = require("http");
app.use(cors());
const { Server } = require("socket.io");
const axios = require("axios");


const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});
const server = http.createServer(app);

// Socket IO:
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },  // GET & POST availbale for everyone
});

io.on("connection", (socket) => {
  // console.log("User Connection: ", socket.id);
  socket.on("disconnect", () => {
    // console.log("User Disconnected", socket.id);
  });
});

// Connection to Redis
Redis.initRedis()
  .then(() => {
    console.log("connected to Redis");
  })
  .catch((err) => {
    console.log("error connecting", err);
  });


// kafka
const consumer = kafka.consumer({ groupId: "1" });

const subscribeToFlight = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: ["onGround-flight", "arrivals-flight", "departures-flight"],
    fromBeginning: true,
  });

  // for each msg (filghts array):
  await consumer.run({
    autoCommit: true,
    eachBatch: async (payload) => {
      try {
        console.log(`Got message from Kafka `);
        for (const message of payload.batch.messages) {
          let flight = JSON.parse(message?.value) ?? [];
          let typeOfCache = "";
          if (
            flight.length > 1 &&
            flight[flight?.length - 1]?.isDeparture === true
          ) {
            typeOfCache = "Departures";
          } else if (
            flight.length > 1 &&
            flight[flight?.length - 1]?.isArrival === true
          ) {
            typeOfCache = "Arrivals";
          } else if (flight.length > 1) {
            typeOfCache = "OnGround";
          }
          if (typeOfCache?.length > 1) {
            console.log(`Found cache type of ${typeOfCache}`);
            flight = flight.slice(0, flight.length - 2);
            flight.map(async (x) => {
              await Redis.addToCache(typeOfCache, x.id, x);
            });
          }
        }
      } catch (e) {
        console.log("error", e);
      }
    },
  });
};

subscribeToFlight().catch(console.error);

const getWeather = async () => {
  try {
    const weather = await axios.get(
      "https://openweathermap.org/data/2.5/onecall?lat=32.9232&lon=35.0954&units=metric&appid=439d4b804bc8187953eb36d2a8c26a02"
    );

    return weather?.data?.current?.temp;
  } catch (e) {
    return "";
  }
};

// get flights from Redis every 5 seconds:
setInterval(async () => {
  const arrivalFlights = await Redis.getArrivalFlightsFromCache();
  const departuresFlights = await Redis.getDeparturesFlightsFromCache();
  const weather = await getWeather();

  let allFlight = [];
  Object.entries(arrivalFlights).forEach(([id, flight]) => {
    allFlight.push(flight);
  });
  allFlight = allFlight.slice(0, allFlight.length - 2);
  Object.entries(departuresFlights).forEach(([id, flight]) => {
    allFlight.push(flight);
  });
  allFlight = allFlight.slice(0, allFlight.length - 2);

  // send to Dashboard on socket IO
  io.emit("flights", allFlight);
  io.emit("weather", weather);
}, 5000);

// update changes
setInterval(async () => {
  await Redis.checkAllCache();
}, 5000);

// subscribeToArrivalFlights().catch(console.error);

app.get("/", (req, res) => {
  res.send("Web Server with redis db is up");
});



server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
