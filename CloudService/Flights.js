const Function = require("./Functions");
const { flight } = require("flightradar24-client");
const { getWeather, getDistanceFromLatLonInKm } = require("./Functions");

const getFlightParamById = async (id, ft) => {
  try {
    // Bigml.;
    if (id) {
      return flight(id).then(async (data) => {
        let period = Function.getPeriodType(new Date(data?.arrival));
        period = await Promise.all([period]);
        const typeFlight = await getDistanceFromLatLonInKm(
          data?.origin?.coordinates?.latitude,
          data?.origin?.coordinates?.longitude,
          data?.destination?.coordinates?.latitude,
          data?.destination?.coordinates?.longitude
        );
        let originWeather = getWeather(
          data?.origin?.coordinates?.latitude,
          data?.origin?.coordinates?.longitude,
          data?.departure
        );
        let destinationWeather = getWeather(
          data?.destination?.coordinates?.latitude,
          data?.destination?.coordinates?.longitude,
          data?.arrival
        );
        originWeather = await Promise.all([originWeather]);
        destinationWeather = await Promise.all([destinationWeather]);

        return {
          id,
          latitude: ft[1] ?? undefined,
          longitude: ft[2] ?? undefined,
          fit: ft[4] ?? undefined,
          flightNumber: data?.callsign,
          originLatitude: data?.origin?.coordinates?.latitude,
          originLongitude: data?.origin?.coordinates?.longitude,
          destinationLatitude: data?.destination?.coordinates?.latitude,
          destinationLongitude: data?.destination?.coordinates?.longitude,
          departure: data?.departure,
          arrival: data?.arrival,
          scheduledArrival: data?.scheduledArrival,
          airline: data?.airline,
          originCountry: data?.origin?.country,
          destinationCountry: data?.destination?.country,
          originWeather: originWeather[0],
          destinationWeather: destinationWeather[0],
          distance: typeFlight,
          ...period[0],
          late_arrival: getLateArrival(
            new Date(data?.arrival).getTime(),
            new Date(data?.scheduledArrival).getTime()
          ),
        };
      });
    } else {
      return undefined;
    }
  } catch (e) {
    console.log("Error : got flight by id failed");
  }
};

const getLateArrival = (arrival, scheduledArrival) => {
  if (Math.abs(arrival - scheduledArrival) <= 15 * 60000) {
    return "ok";
  } else if (Math.abs(arrival - scheduledArrival) <= 60 * 60000) {
    return "late";
  } else {
    return "heavy late";
  }
};

module.exports = {
  getFlightParamById,
};
