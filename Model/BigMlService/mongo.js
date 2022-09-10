const mongoose = require("mongoose");
const express = require("express");
const app = express();
const Flight = require("./models/Flight");
const cconsumer = require("./consumer");
const { BigML } = require("bigml");
const { predictLate_arrival, createModal, predictFlights } = require("./Bigml");
const http = require("http");
const cors = require("cors");
const { getArrivalFlights } = require("./consumer");
const createCSV = require("csv-writer").createObjectCsvWriter;
const bigml = require("./BigMl");

app.use(cors());

app.listen(4001, () => {
  console.log("Listening on port 4001");
});

app.get("/createModal", async (req, res) => {
  await createCSVFromMongo();
  res.sendStatus(200);
});

app.get("/getPrediction", async (req, res) => {
  const data = JSON.parse(req.query.flights);
  await predictFlights(data);
  res.sendStatus(200);
});

mongoose
  .connect("mongodb://127.0.0.1:27017/ariel", { useNewUrlParser: true })
  .then(() => {
    console.log("Connect to MongoDB");
  })
  .catch((e) => {
    console.log("Error connecting to MongoDB", e);
  });

cconsumer.subscribeToFlight().catch(console.error);

const createCSVFromMongo = async (arrivalFlights) => {
  const csv = createCSV({
    path: "flights.csv",
    header: [
      { id: "id", title: "id" },
      { id: "flightNumber", title: "flightNumber" },
      { id: "latitude", title: "latitude" },
      { id: "fit", title: "fit" },
      { id: "longitude", title: "longitude" },
      { id: "originLatitude", title: "originLatitude" },
      { id: "originLongitude", title: "originLongitude" },
      { id: "destinationLatitude", title: "destinationLatitude" },
      { id: "destinationLongitude", title: "destinationLongitude" },
      { id: "departure", title: "departure" },
      { id: "arrival", title: "arrival" },
      { id: "scheduledArrival", title: "scheduledArrival" },
      { id: "airline", title: "airline" },
      { id: "originCountry", title: "originCountry" },
      { id: "destinationCountry", title: "destinationCountry" },
      { id: "originWeather", title: "originWeather" },
      { id: "destinationWeather", title: "destinationWeather" },
      { id: "distance", title: "distance" },
      { id: "period", title: "period" },
      { id: "month", title: "month" },
      { id: "day", title: "day" },
      { id: "late_arrival", title: "late_arrival" },
    ],
  });
  let flightsOnGround = await Flight.find({});

  await csv.writeRecords(flightsOnGround);

  await createModal();
};

module.exports = { createCSVFromMongo };
