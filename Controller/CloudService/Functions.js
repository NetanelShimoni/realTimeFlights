const fs = require("fs");
const axios = require("axios");
const { restart } = require("nodemon");
const sqlPostgres = require("./sqlPostgres");

async function getGeoLoc(iata_code, icao_code) {
  const params = {
    api_key: "6fb06579-30b0-4f17-a827-ecda6a285025",
    iata_code: iata_code,
    icao_code: icao_code,
  };

  try {
    const raw_resp = await axios.get("https://airlabs.co/api/v9/airports", {
      params,
    });
    resp = raw_resp.data.response[0];
    return [resp.lat, resp.lng];
  } catch (err) {
    // Handle Error Here
    console.log("ERROR in get Period");
  }
}
const cacheWeather = {};

async function getWeather(lat, lon, date) {
  dt = getUnixTime(date);

  if (cacheWeather[`${lat}${lon}${dt}`]) {
    return cacheWeather[`${lat}${lon}${dt}`];
  }
  const params = {
    appid: "59baeef82439631e38d57f2dc02e4570",
    lat: lat,
    lon: lon,
    dt: dt,
  };

  if (lon && lat) {
    try {
      const urlWeather = "https://api.openweathermap.org/data/2.5/weather";
      const res = await axios.get(urlWeather, { params });

      await sqlPostgres.postMessage(
        urlWeather,
        "openweathermap",
        new Date().toISOString()
      );
      const resp = res?.data?.weather?.[0].main;
      cacheWeather[`${lat}${lon}${dt}`] = resp;
      return resp;
    } catch (err) {
      // Handle Error Here
      console.error("ERROR ing ger weather", err.message);
    }
  }
  return undefined;
}
const cache = {};
async function getPeriodType(date_) {
  const params = {
    date: date_.toISOString().slice(0, 10),
  };

  try {
    if (cache[params?.date]) {
      return cache[params?.date];
    }
    const urlPeriod =
      "https://www.hebcal.com/converter?cfg=json&g2h=1&strict=1";
    const raw_resp = await axios.get(urlPeriod, { params });

    await sqlPostgres.postMessage(
      urlPeriod,
      "Period",
      new Date().toISOString()
    );

    const events = raw_resp.data.events;
    const month = raw_resp.data.gm;
    const day = date_.getDay() + 1;
    if (month === 7 || month === 8) {
      cache[params.date] = { period: "vacation", month, day };
      return { period: "vacation", month, day };
    } else if (events.length === 1) {
      cache[params.date] = { period: "regular", month, day };
      return { period: "regular", month, day };
    }
    cache[params.date] = { period: "holiday", month, day };

    return { period: "holiday", month, day };
  } catch (err) {
    // Handle Error Here
    console.error("ERROR in get period", err.message);
  }
}

function getUnixTime(dateStr) {
  const date = new Date(dateStr);
  // console.log(date)

  const timestampInMs = date.getTime();

  const unixTimestamp = Math.floor(date.getTime() / 1000);
  // console.log(unixTimestamp)
  return unixTimestamp;
}

//https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula

async function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  if (d <= 1500) {
    return "short";
  }

  if (d <= 3500) {
    return "medium";
  }
  return "long";
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// const start = async function() {
//   const data = await sendGetRequest("CGK", "WIII");
//   console.log(data);
// }
// start();

module.exports = {
  getGeoLoc,
  getWeather,
  getDistanceFromLatLonInKm,
  getPeriodType,
};
