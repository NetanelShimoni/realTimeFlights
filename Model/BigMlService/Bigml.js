const bigml = require("bigml");
const fs = require("fs");

// Authentication
BIGML_USERNAME = "hila053"; // HILA053
BIGML_API_KEY = "f581ca2a260830e6dfe31da5be2bdd9a7699f52a";
BIGML_AUTH = "username=$BIGML_USERNAME;api_key=$BIGML_API_KEY";

const connection = new bigml.BigML(BIGML_USERNAME, BIGML_API_KEY);
const source = new bigml.Source(connection);

const createModal = () => {
  try {
    source.create(`./flights.csv`, (error, sourceInfo) => {
      if (!error && sourceInfo) {
        const dataset = new bigml.Dataset(connection);
        dataset.create(sourceInfo.resource, (error, datasetInfo) => {
          if (!error && datasetInfo) {
            const model = new bigml.Model(connection);
            model.create(datasetInfo.resource, async (error, modelInfo) => {
              if (!error && modelInfo) {
                console.log("hiiiiiiiiiiiiiii", modelInfo.resource);
                try {
                  fs.writeFile(
                    "./data/predict.json",
                    JSON.stringify(modelInfo.resource),
                    (err) => {
                      if (err) {
                        throw err;
                      }
                      console.log("JSON data is saved.");
                    }
                  );
                } catch (e) {
                  console.log("Error: - create modal", e.message);
                }
              } else {
              }
            });
          } else {
          }
        });
      } else {
      }
    });
  } catch (e) {}
};
let predictedFlights = [];

const predictFlights = async (flights) => {
  new Promise((resolve, reject) => {
    const prediction = new bigml.Prediction(connection);
    let model;
    fs.readFile("./data/predict.json", "utf8", (err, jsonString) => {
      if (err) {
        console.log("File read failed:", err);
        return;
      }
      model = JSON.parse(jsonString);
      flights?.map(async (flight) => {
        await prediction.create(model, flight, (error, predictionInfo) => {
          if (!error && predictionInfo) {
            predictedFlights = predictedFlights.filter((pred) => {
              return pred.id !== flight.id;
            });
            predictedFlights.push({
              id: flight.id,
              prediction: predictionInfo.object.output,
            });
          }
          console.log(
            "flightNumber",
            flight?.flightNumber,
            "predicte is",
            predictionInfo.object.output
          );
        });
      });
      fs.writeFileSync(
        "../../View/Redis/data/predictFlights.json",
        JSON.stringify(predictedFlights),
        (err) => {
          if (err) {
            throw err;
          }
          console.log("PredictFlights.json  is saved.");
        }
      );
    });
  });
};

module.exports = { createModal, predictFlights };
