const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define flight scheme
const flightSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: false,
  },
  longitude: {
    type: Number,
    required: false,
  },
  flightNumber: {
    type: String,
    required: true,
  },
  originLatitude: {
    type: Number,
    required: false,
  },
  originLongitude: {
    type: Number,
    required: false,
  },
  destinationLatitude: {
    type: Number,
    required: false,
  },
  destinationLongitude: {
    type: Number,
    required: false,
  },
  departure: {
    type: String,
    required: false,
  },
  arrival: {
    type: String,
    required: false,
  },
  scheduledArrival: {
    type: String,
    required: false,
  },
  airline: {
    type: String,
    required: false,
  },
  originCountry: {
    type: String,
    required: false,
  },
  destinationCountry: {
    type: String,
    required: false,
  },
  originWeather: {
    type: String,
    required: false,
  },
  destinationWeather: {
    type: String,
    required: false,
  },
  distance: {
    type: String,
    required: false,
  },
  period: {
    type: String,
    required: false,
  },
  month: {
    type: Number,
    required: false,
  },
  day: {
    type: Number,
    required: false,
  },
  fit: {
    type: Number,
    required: false,
  },
  late_arrival: {
    type: String,
    required: false,
  },
});

const Flight = mongoose.model("Flight", flightSchema);
module.exports = Flight;
