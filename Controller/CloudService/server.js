const express = require("express");
const axios = require("axios");
const app = express();
const port = 3005;
const cors = require("cors");
const flight = require("flightradar24-client/lib/flight");
const { Kafka, logLevel } = require("kafkajs");
app.use(cors());
const { Server } = require("socket.io");
const http = require("http");
const sqlPostgres = require("./sqlPostgres");
const { sendMessage } = require("./kafkaService");
const { getFlightParamById } = require("./Flights");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});

const text = `
    CREATE TABLE IF NOT EXISTS "API" (
	    "URL" VARCHAR(300) NOT NULL,
	    "TYPE" VARCHAR(300) NOT NULL,
	    "DATE" VARCHAR(300) NOT NULL,
	    PRIMARY KEY ("DATE")
    );`;

sqlPostgres.init(text).then((onSuccess) => {
  if (onSuccess) {
    console.log("Postgres initialized and table created");
  } else {
    console.log("Postgres not initialized");
  }
});

const producer = kafka.producer();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

setInterval(async () => {
  try {
    const UrlFlight =
      "https://data-cloud.flightradar24.com/zones/fcgi/feed.js?faa=1&bounds=41.449%2C21.623%2C16.457%2C53.063&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=14400&gliders=1&stats=1";
    let dataFlights = await axios.get(UrlFlight);
    // dataFlights = Object.entries(dataFlights).slice(2);
    dataFlights = dataFlights.data;
    delete dataFlights?.full_count;
    delete dataFlights?.version;

    const flightParams = [];

    Object.entries(dataFlights).filter(([id, ft]) => {
      if (
        ft[12] === "TLV" ||
        ft[12] === "LLBG" ||
        ft[11] === "TLV" ||
        ft[11] === "LLBG"
      ) {
        // flight(id).then((dataFlights) => console.log(dataFlights));
        flightParams.push(getFlightParamById(id, ft));
        return true;
      }
      return false;
    });

    // const allFlights = await Promise.all(flightParams);
    // console.log("############", flightParams.length);
    let arrivalFlights = [];
    let onGroundFlights = [];
    let departureFlights = [];
    Promise.all(flightParams).then(async (allFlights) => {
      allFlights.map((flights) => {
        if (flights?.destinationCountry === "ISR") {
          if (new Date(flights.arrival).getTime() <= new Date().getTime()) {
            onGroundFlights.push(flights);
          } else {
            arrivalFlights.push(flights);
          }
        } else {
          departureFlights.push(flights);
        }
        // }
      });

      if (onGroundFlights?.length) {
        onGroundFlights = onGroundFlights.filter((flights) => flights.arrival);
        onGroundFlights.push({ isOnGround: true });
        await sendMessage(
          "onGround-flight",
          JSON.stringify(onGroundFlights ?? [])
        );
      }
      if (arrivalFlights?.length) {
        arrivalFlights.push({ isArrival: true });
        await sendMessage(
          "arrivals-flight",
          JSON.stringify(arrivalFlights ?? [])
        );
      }
      if (departureFlights?.length) {
        departureFlights = departureFlights.filter(
          (flights) => flights?.flightNumber
        );
        departureFlights.push({ isDeparture: true });
        await sendMessage(
          "departures-flight",
          JSON.stringify(departureFlights ?? [])
        );
      }
      // dataFlights = Object.entries(dataFlights).filter(([id, fl]) => {
      // console.log("id is:", id);
      // flight(id);
    });

    // console.log("dataFlights", dataFlights);
  } catch (e) {
    console.log("Error: ", e);
  }
}, 5000);

server.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
});
