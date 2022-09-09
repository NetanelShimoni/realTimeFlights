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
                    "./predict.json",
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

const predictLate_arrival = async (flight) => {
  const result = [];
  //create source
  const source = await new bigml.Source(connection);
  return source.create("./flights.csv", (error, sourceInfo) => {
    if (!error && sourceInfo) {
      //create dataset
      const dataset = new bigml.Dataset(connection);
      return dataset.create(sourceInfo.resource, (error, datasetInfo) => {
        if (!error && datasetInfo) {
          //create model
          const model = new bigml.Model(connection);
          return model.create(
            datasetInfo.resource,
            async (error, modelInfo) => {
              if (!error && modelInfo) {
                const prediction = await new bigml.Prediction(connection);

                // prediction:
                return prediction.create(
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
                      const flightPrediction = {
                        flightNumber: flight?.flightNumber,
                        pred: predictionInfo?.object.output,
                      };
                      // fs.writeFile(
                      //   "./predict.json",
                      //   JSON.stringify(flightPrediction),
                      //   (err) => {
                      //     if (err) {postgres
                      //       throw err;
                      //     }
                      //     console.log("JSON data is saved.");
                      //   }
                      // );
                    } else {
                      console.log("error: unknown prediction", error);
                    }
                  }
                );
              }
            }
          );
        }
      });
    } else {
      console.log(error);
    }
  });
};

module.exports = { predictLate_arrival, createModal };
