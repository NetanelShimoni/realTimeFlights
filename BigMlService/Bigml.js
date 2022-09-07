const bigml = require("bigml");

// Authentication
BIGML_USERNAME = "hila053"; // HILA053
BIGML_API_KEY = "f581ca2a260830e6dfe31da5be2bdd9a7699f52a";
BIGML_AUTH = "username=$BIGML_USERNAME;api_key=$BIGML_API_KEY";

connection = new bigml.BigML(BIGML_USERNAME, BIGML_API_KEY);

// https://bigml.io/andromeda/model?username=hila053;api_key=f581ca2a260830e6dfe31da5be2bdd9a7699f52a

flight1 = {
  // real= ok
  flight_number: 6151,
  month: 8,
  org_country: "Jakarta",
  dst_country: "Makassar",
  company: "lion air",
  period_type: "regular",
  org_weather: "Clouds",
  dst_weather: "Clouds",
};

flight2 = {
  // real= late
  flight_number: 7213,
  month: 8,
  org_country: "Shanghai",
  dst_country: "Shanghai",
  company: "chengdu airlines",
  period_type: "regular",
  org_weather: "Clouds",
  dst_weather: "Clouds",
};
flight3 = {
  // real= late
  flight_number: 72131,
  month: 8,
  org_country: "Shanghai",
  dst_country: "Shanghai",
  company: "chengdu airlines",
  period_type: "regular",
  org_weather: "Clouds",
  dst_weather: "Clouds",
};

flight4 = {
  // real= late
  // flight_number: 72131,
  month: 8,
  org_country: "Shanghai",
  dst_country: "Shanghai",
  company: "chengdu airlines",
  period_type: "regular",
  org_weather: "Clouds",
  dst_weather: "Clouds",
};

function predictLate_arrival(flight) {
  //create source
  const source = new bigml.Source(connection);
  source.create("./flights.csv", (error, sourceInfo) => {
    if (!error && sourceInfo) {
      //create dataset
      const dataset = new bigml.Dataset(connection);
      dataset.create(sourceInfo.resource, (error, datasetInfo) => {
        if (!error && datasetInfo) {
          //create model
          const model = new bigml.Model(connection);
          model.create(datasetInfo.resource, (error, modelInfo) => {
            if (!error && modelInfo) {
              const prediction = new bigml.Prediction(connection);

              // prediction:
              prediction.create(
                modelInfo.resource,
                flight,
                (error, predictionInfo) => {
                  if (!error && predictionInfo) {
                    console.log(
                      "flight is :",
                      flight.flightNumber,
                      "pred: ",
                      predictionInfo.object.output
                    );
                  } else {
                    console.log(error);
                  }
                }
              );
            }
          });
        }
      });
    } else {
      console.log(error);
    }
  });
}

module.exports = { predictLate_arrival };
