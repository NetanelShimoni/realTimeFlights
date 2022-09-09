const { createClient } = require("redis");
const kafka = require("../../Controller/CloudService/kafkaService");
const client = createClient({ url: "redis://localhost:6379" });
const initRedis = async () => {
  await client.connect();
};

const addToCache = async (typeOfCache, id, data) => {
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
