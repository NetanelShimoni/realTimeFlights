const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: "5455",
  database: "postgres",
});

const init = async (query) => {
  try {
    await client.connect();    // gets connection
    await client.query(query); // sends queries
    return true;
  } catch (error) {
    console.error(error.stack);
    return false;
  }
};
const postMessage = async (url, type, date) => {
  await client.query(
    `INSERT INTO public."API" ("URL", "TYPE","DATE") VALUES ('${url}', '${type}', '${date}') ON CONFLICT ("DATE") DO NOTHING;`
  );
};

module.exports = { postMessage, init };
