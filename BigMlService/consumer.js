const { Kafka } = require("kafkajs");
const Flight = require("./models/Flight");
const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "2" });
let arrivalFlights = [];

const getArrivalFlights = () => {
  return arrivalFlights;
};
const subscribeToFlight = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: ["onGround-flight", "arrivals-flight"],
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: true,
    eachBatch: async (payload) => {
      try {
        // console.log(`Got message from Kafka `);
        for (const message of payload.batch.messages) {
          let ft = JSON.parse(message?.value) ?? [];
          arrivalFlights = [];
          if (ft.length > 1 && ft[ft?.length - 1]?.isArrival === true) {
            ft = ft.slice(0, ft.length - 2);
            ft.map((flight) => {
              const dateAfterAdded15Min = new Date(
                new Date().getTime() + 15 * 60000
              );

              if (
                Math.abs(
                  new Date(flight?.arrival).getTime() -
                    dateAfterAdded15Min.getTime()
                ) <=
                15 * 60000
              ) {
                arrivalFlights.push(flight);
              }
            });
          } else {
            ft.map(async (x) => {
              if (
                x?.hasOwnProperty("id") &&
                x?.hasOwnProperty("flightNumber")
              ) {
                const flight = new Flight({
                  id: x.id,
                  latitude: x?.latitude,
                  longitude: x?.longitude,
                  flightNumber: x.flightNumber,
                  originLatitude: x?.originLatitude,
                  originLongitude: x?.originLongitude,
                  destinationLatitude: x?.destinationLatitude,
                  destinationLongitude: x?.destinationLongitude,
                  departure: x?.departure,
                  arrival: x?.arrival,
                  scheduledArrival: x?.scheduledArrival,
                  airline: x?.airline,
                  originCountry: x?.originCountry,
                  destinationCountry: x?.destinationCountry,
                  originWeather: x?.originWeather,
                  destinationWeather: x?.destinationWeather,
                  period: x?.period,
                  month: x?.month,
                  day: x?.day,
                  fit: x?.fit,
                  late_arrival: x?.late_arrival,
                });
                const result = await Flight.findOne({ id: x.id });
                if (!result) {
                  flight
                    .save()
                    .then((result) => {
                      console.log("Added flight");
                    })
                    .catch((err) => {
                      console.log("error to add flight", flight, err);
                    });
                }
              }
            });
          }
        }
      } catch (e) {
        console.log("error", e);
      }
    },
  });
};

module.exports = { subscribeToFlight, getArrivalFlights };
