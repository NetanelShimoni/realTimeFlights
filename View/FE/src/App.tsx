import React, { useEffect, useState } from "react";
import "./App.css";
import ReactBingMap, { Layer, Pushpin } from "@3acaga/react-bing-maps";
import Card from "./Card";
import { io } from "socket.io-client";
import { calculateTimeArrival, calculateTimeDeparture } from "./utils/general";
import axios from "axios";
// import { createCSVFromMongo } from "../../BigMlService/mongo";

const App = () => {
  const [data, setData] = useState<any>();
  const [weather, setWeather] = useState<any>("");
  const cache: { [key: string]: any } = {};
  const socket = io("ws://localhost:4002");

  const [arrivals, setArrivals] = useState<Array<any>>([]);
  const [departure, setDeparture] = useState([]);
  const [
    flightOnGroundToReadyToDeparture,
    setFlightOnGroundToReadyToDeparture,
  ] = useState<any>([]);

  const [isConnected, setIsConnected] = useState(socket.connected);
  
  // before app is up- connect Redis (by socket IO)
  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("pong");
    };
  }, []);


  const handleOnClickLearning = async () => {
    const result = await axios.get("http://localhost:4001/makePredictLate", {
      params: { arrivalsFlight: JSON.stringify(arrivals) },
    });
  };

  // get form socket IO
  socket.on("weather", (temp) => {
    setWeather(temp);
  });

  socket.on("flights", (flights) => {
    setData(flights);

    // seperate to type (arrival & departure in *this 15 min*)
    setArrivals([]);
    setFlightOnGroundToReadyToDeparture([]);
    let arrivalFlights: any = [];
    let flightReadyToDeparture: any = [];
    flights.map((flight: any) => {
      if (
        flight.destinationCountry === "ISR" &&
        calculateTimeArrival(flight?.arrival)
      ) {
        arrivalFlights.push(flight);
      } else if (
        flight?.originCountry === "ISR" &&
        flight?.fit <= 300 &&
        calculateTimeDeparture(flight?.departure)
      ) {
        flightReadyToDeparture.push(flight);
      }
    });
    setFlightOnGroundToReadyToDeparture(flightReadyToDeparture);
    setArrivals(arrivalFlights);
  });

  
// ###############################
// ##########   html    ##########
// ###############################

  return (
    <div className="App">
      <div
        style={{
          backgroundColor: "rgb(76 33 33 / 84%)",
          width: "100%",
          height: "15vh",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          bgColor={"red"}
          text={"טיסות ממתינות לנחיתה"}
          data={arrivals.length}
          flights={arrivals}
        />
        <Card
          bgColor={"blue"}
          text={"טיסות ממתינות להמראה"}
          data={flightOnGroundToReadyToDeparture?.length}
          flights={flightOnGroundToReadyToDeparture}
        />
        <Card 
          bgColor={"orange"} 
          text={"מזג האוויר"} 
          data={`${weather}°C`} 
        />
        <button
          style={{
            backgroundColor: "#2c2c2c2c",
            width: 150,
            position: "relative",
            left: "19.5vh",
            cursor: "pointer",
          }}
          onClick={async () => {
            await handleOnClickLearning();
          }}
        >
          Learning Modal
        </button>
      </div>
      <ReactBingMap
        apiKey={
          "AgGQrQQKgc75153hSWxyDknBfPmMxWY-9eof12Zvy6F3fqM1o4XgTkE2ITeOx8MF"
        }
        zoom={6}
        center={{ latitude: 31.8, longitude: 33.4 }}
      >

        {data?.map((x: any) => {
          return (
            <Layer animationDuration={500}>
              <Pushpin
                key={x?.flightNumber}
                location={{ latitude: x?.latitude, longitude: x?.longitude }}
                onClick={() => alert(JSON.stringify(x))}
                icon={"https://i.imgur.com/AkXmgKU.png"}
              />
            </Layer>
          );
        })}
      </ReactBingMap>
    </div>
  );
};

export default App;
