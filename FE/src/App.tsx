import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import ReactBingMap, {
  Layer,
  Polyline,
  Pushpin,
} from "@3acaga/react-bing-maps";
import Card from "./Card";
import { io } from "socket.io-client";
import { calculateTime } from "./utils/general";
import axios from "axios";
// import { createCSVFromMongo } from "../../BigMlService/mongo";

const App = () => {
  const [data, setData] = useState<any>();
  const [weather, setWeather] = useState<any>("");
  const cache: { [key: string]: any } = {};
  const socket = io("ws://localhost:4002");

  const [arrivals, setArrivals] = useState<any>([]);
  const [departure, setDeparture] = useState([]);
  const [
    flightOnGroundToReadyToDeparture,
    setFlightOnGroundToReadyToDeparture,
  ] = useState<any>([]);

  const [isConnected, setIsConnected] = useState(socket.connected);

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

  const id = {
    id: "Adad",
  };
  const handleOnClickLearning = async () => {
    const result = await axios.get("http://localhost:4001/makePredictLate");
  };

  socket.on("weather", (temp) => {
    setWeather(temp);
  });

  socket.on("flights", (flights) => {
    setData(flights);
    setArrivals([]);
    setFlightOnGroundToReadyToDeparture([]);
    let arrivalFlights: any = [];
    let flightReadyToDeparture: any = [];
    flights.map((flight: any) => {
      if (
        flight.destinationCountry === "ISR" &&
        calculateTime(flight?.arrival)
      ) {
        arrivalFlights.push(flight);
      } else if (
        flight?.originCountry === "ISR" &&
        flight?.fit <= 300 &&
        calculateTime(flight?.departure, true)
      ) {
        flightReadyToDeparture.push(flight);
      }
    });
    setFlightOnGroundToReadyToDeparture(flightReadyToDeparture);
    setArrivals(arrivalFlights);
  });

  console.log("arrriiivalss", arrivals);
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
        <Card bgColor={"orange"} text={"מזג האוויר"} data={`${weather}°C`} />
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
        {/*<Polyline*/}
        {/*  strokeThickness={5}*/}
        {/*  strokeDashArray={[2, 2]}*/}
        {/*  strokeColor="red"*/}
        {data?.map((x: any) => {
          return (
            <Layer animationDuration={500}>
              <Pushpin
                location={{ latitude: x?.latitude, longitude: x?.longitude }}
                onClick={() => alert(JSON.stringify(x))}
                icon={"https://i.imgur.com/AkXmgKU.png"}
              />
              {/*<Polyline*/}
              {/*  strokeThickness={5}*/}
              {/*  strokeDashArray={[2, 2]}*/}
              {/*  strokeColor="red"*/}
              {/*  path={[{ latitude: x?.[1], longitude: x?.[2] }]}*/}
              {/*  curved={true}*/}
              {/*  level={1}*/}
              {/*  onClick={() => alert(`${x}`)}*/}
              {/*  withMovingMarker={true}*/}
              {/*  movingMarkerConfig={{*/}
              {/*    icon: "https://i.imgur.com/AkXmgKU.png",*/}
              {/*  }}*/}
              {/*  pathPointsCount={5}*/}
              {/*/>*/}
            </Layer>
          );
        })}
      </ReactBingMap>

      {/*  path={[a]}*/}
      {/*  curved={true}*/}
      {/*  level={1}*/}
      {/*  withMovingMarker={true}*/}
      {/*  // movingMarkerConfig={{*/}
      {/*  //   icon: "http://files.softicons.com/download/game-icons/super-mario-icons-by-sandro-pereira/png/32/Mushroom%20-%201UP.png",*/}
      {/*  // }}*/}
      {/*  pathPointsCount={5}*/}
      {/*/>*/}
      {/*{get()}*/}
      {/*<BingMapsReact*/}
      {/*  bingMapsKey="AgGQrQQKgc75153hSWxyDknBfPmMxWY-9eof12Zvy6F3fqM1o4XgTkE2ITeOx8MF"*/}
      {/*  // pushPins={[*/}
      {/*  //   {*/}
      {/*  //     location: [32.283203125, 34.97600151317588],*/}
      {/*  //     option: { color: "red" },*/}
      {/*  //     addHandler: { type: "click", callback: () => null },*/}
      {/*  //   },*/}
      {/*  // ]}*/}
      {/*  Pushpin={[*/}
      {/*    {*/}
      {/*      location: [32.283203125, 34.97600151317588],*/}
      {/*      option: { color: "black" },*/}
      {/*      addHandler: { type: "mouseover", callback: () => alert("ssss") },*/}
      {/*    },*/}
      {/*    {*/}
      {/*      location: [32.283203125, 34.97600151317588],*/}
      {/*      option: { color: "black" },*/}
      {/*      addHandler: { type: "mouseover", callback: () => alert("ssss") },*/}
      {/*    },*/}
      {/*    {*/}
      {/*      location: [32.283203125, 34.97600151317588],*/}
      {/*      option: { color: "red" },*/}
      {/*      addHandler: { type: "mouseover", callback: () => alert("ssss") },*/}
      {/*    },*/}
      {/*    {*/}
      {/*      location: [32.283203125, 34.97600151317588],*/}
      {/*      option: { color: "black" },*/}
      {/*      addHandler: { type: "mouseover", callback: () => alert("ssss") },*/}
      {/*    },*/}
      {/*    {*/}
      {/*      location: [32.283203125, 34.97600151317588],*/}
      {/*      option: { color: "black" },*/}
      {/*      addHandler: { type: "mouseover", callback: () => alert("ssss") },*/}
      {/*    },*/}
      {/*  ]}*/}
      {/*  onMapReady={({ map }: any) => {*/}
      {/*    // setMapReady(true);*/}
      {/*    console.log("maappp", map);*/}
      {/*    // for (let i = 0; i < timestamps.length; i++) {*/}
      {/*    //   map.TileSource({*/}
      {/*    //     uriConstructor: urlTemplate.replace("{timestamp}", timestamps[i]),*/}
      {/*    //   });*/}
      {/*    // }*/}
      {/*  }}*/}
      {/*  // mapOptions={{*/}
      {/*  //   enableClickableLogo: false,*/}
      {/*  //   navigationBarMode: "square",*/}
      {/*  //   enableHighDpi: true,*/}
      {/*  //   showTermsLink: false,*/}
      {/*  // }}*/}
      {/*  viewOptions={{*/}
      {/*    center: { latitude: 32.283203125, longitude: 34.97600151317588 },*/}
      {/*    zoom: 10,*/}
      {/*    customMapStyle: {*/}
      {/*      elements: {*/}
      {/*        area: { fillColor: "#b6e591" },*/}

      {/*        water: { fillColor: "#75cff0" },*/}
      {/*        tollRoad: { fillColor: "#a964f4", strokeColor: "#a964f4" },*/}
      {/*        arterialRoad: { fillColor: "#ffffff", strokeColor: "#d7dae7" },*/}
      {/*        road: { fillColor: "#ffa35a", strokeColor: "#ff9c4f" },*/}
      {/*        street: { fillColor: "#ffffff", strokeColor: "#ffffff" },*/}
      {/*        transit: { fillColor: "#000000" },*/}
      {/*      },*/}
      {/*      settings: {*/}
      {/*        landColor: "#efe9e1",*/}
      {/*      },*/}
      {/*    },*/}
      {/*  }}*/}
      {/*/>*/}

      {/*/!*{data && (*!/*/}
      {/*/!*  <div>*!/*/}
      {/*/!*    {" "}*!/*/}
      {/*/!*    {data.map((d: any) => (*!/*/}
      {/*/!*      <>*!/*/}
      {/*/!*        <div> FROM: {d.dep_iata}</div>*!/*/}
      {/*/!*        <div>  TIME: {d.arr_time}</div>*!/*/}
      {/*/!*        <div> TO: {d.arr_iata}</div>*!/*/}
      {/*/!*      </>*!/*/}
      {/*/!*    ))}*!/*/}
      {/*/!*  </div>*!/*/}
      {/*/!*)}*!/*/}
    </div>
  );
};

export default App;
