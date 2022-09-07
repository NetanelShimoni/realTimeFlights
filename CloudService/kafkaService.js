const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
const sendMessage = async (topic, message) => {
  await producer.connect();
  // io.emit("weather", Number(temp / 10).toFixed() + " C");
  await producer.send({
    topic: `${topic}`,
    messages: [
      {
        value: message,
      },
    ],
  });
  console.log("kafka sent message to topic - ", topic);
};

module.exports = { sendMessage };
