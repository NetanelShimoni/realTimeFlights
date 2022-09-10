const { createClient } = require("redis");
const kafka = require("../../Controller/CloudService/kafkaService");
const axios = require("axios");
const fs = require("fs");
const client = createClient({ url: "redis://localhost:6379" });
const initRedis = async () => {
  await client.connect();
};

const addToCacheArrivals = async (id, data) => {
  try {
    await axios.get("http://localhost:4001/getPrediction", {
      params: { flights: JSON.stringify([data]) },
    });
    fs.readFile("./data/predictFlights.json", "utf8", (err, jsonString) => {
      if (err) {
        console.log("File read failed:", err);
        return;
      }
      if (jsonString?.length > 0) {
        const predictFlights = JSON.parse(jsonString);
        predictFlights.map(async (flight) => {
          if (flight?.id === id) {
            data = {
              ...data,
              prediction: flight?.prediction,
            };
            if (data?.hasOwnProperty("prediction")) {
              if (await client.exists(`cache:Arrivals`)) {
                await client.json.set(`cache:Arrivals`, `.${id}`, data);
              } else {
                await client.json.set(
                  `cache:Arrivals`,
                  `.`,
                  JSON.stringify({})
                );
                await client.json.set(`cache:Arrivals`, `.`, {
                  [`${id}`]: data,
                });
              }
            }
          }
        });
      }
    });
  } catch (error) {
    console.log("error in prediction", error.message);
  }
};

const addToCache = async (typeOfCache, id, data) => {
  if (typeOfCache === "Arrivals") {
    await addToCacheArrivals(id, data);
    return;
  }
  if (await client.exists(`cache:${typeOfCache}`)) {
    await client.json.set(`cache:${typeOfCache}`, `.${id}`, data);
  } else {
    await client.json.set(`cache:${typeOfCache}`, `.`, JSON.stringify({}));
    await client.json.set(`cache:${typeOfCache}`, `.`, {
      [`${id}`]: data,
    });
  }
};

const getArrivalFlightsFromCache = async () => {
  try {
    return (
      (await client.json.get(`cache:Arrivals`, {
        path: `.`,
      })) ?? {}
    );
  } catch (error) {
    return {};
  }
};
const getDeparturesFlightsFromCache = async () => {
  try {
    return (
      (await client.json.get(`cache:Departures`, {
        path: `.`,
      })) ?? {}
    );
  } catch (error) {
    return {};
  }
};

const checkAllCache = async () => {
  const arrivalsFlight = await getArrivalFlightsFromCache();
  const departuresFlight = await getDeparturesFlightsFromCache();
  Object.entries(departuresFlight).map(async ([id, flight]) => {
    if (new Date(flight?.arrival).getTime() <= new Date().getTime()) {
      await client.json.del(`cache:Departures`, `.${id}`);
    }
  });

  Object.entries(arrivalsFlight).map(async ([id, flight]) => {
    if (new Date(flight?.arrival).getTime() <= new Date().getTime()) {
      await client.json.del(`cache:Arrivals`, `.${id}`);
      await addToCache("OnGround", id, flight);
      await kafka.sendMessage("onGround-flight", JSON.stringify([flight]));
    }
  });
};

module.exports = {
  initRedis,
  addToCache,
  getDeparturesFlightsFromCache,
  getArrivalFlightsFromCache,
  checkAllCache,
};
