const mongoose = require("mongoose");
const express = require("express");
const app = express();
const Flight = require("./models/Flight");
const cconsumer = require("./consumer");
const { BigML } = require("bigml");
const { predictLate_arrival } = require("./Bigml");
const http = require("http");
const cors = require("cors");
const { getArrivalFlights } = require("./consumer");
const createCSV = require("csv-writer").createObjectCsvWriter;
const bigml = require("./BigMl");

app.use(cors());

app.listen(4001, () => {
  console.log("Listening on port 4001");
});

// predict late for req flight
app.get("/makePredictLate", async (req, res) => {
  // console.log("makePredictLate", req.query.arrivalsFlight);
  const data = JSON.parse(req.query.arrivalsFlight);
  const result = await createCSVFromMongo(data);
  console.log("resullttt", result);
  // res.send(result);
});



// ###############################
// #########   MongoDB    ########
// ###############################

mongoose
  .connect("mongodb://127.0.0.1:27017/ariel", { useNewUrlParser: true })
  .then(() => {
    console.log("Connect to MongoDB");
  })
  .catch((e) => {
    console.log("Error connecting to MongoDB", e);
  });


// ###############################
// ##########   Kafka    #########
// ###############################

//Listen to kafka & push flights to mongoDB
cconsumer.subscribeToFlight().catch(console.error);

//define csv (for building model)
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

  // get all flights from MongoDB
  let flightsOnGround = await Flight.find({});

  await csv.writeRecords(flightsOnGround);
  console.log("predict to ", arrivalFlights?.length, "flights");
  
  const predictLate_arrivalArray = arrivalFlights?.map((flight) => {
    return predictLate_arrival(flight);
  });
  Promise.all(predictLate_arrivalArray).then((data) => {
    console.log("data", data);
  });

  return predictLate_arrivalArray;
};

module.exports = { createCSVFromMongo };
