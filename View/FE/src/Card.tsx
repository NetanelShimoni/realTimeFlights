import React, { useState } from "react";
import "./App.css";
import TableData from "./TableData";

interface ICard {
  bgColor: string;
  text: string;
  data: any;
  onCLick?: any;
  flights?: any;
  isArrival?: boolean;
}

const Card = ({ bgColor, text, flights, data, isArrival }: ICard) => {
  const [openTable, setOpenTable] = useState(false);

  console.log("data is", data);

  return (
    <div onClick={() => setOpenTable(!openTable)}>
      {openTable && flights?.length > 0 && (
        <TableData data={flights} text={text} isArrival={isArrival} />
      )}

      <div
        style={{
          width: "230px",
          height: "80px",
          backgroundColor: `${bgColor}`,
          borderRadius: "15px",
          margin: "20px",
          marginRight: "50px",
          direction: "rtl",
          textAlign: "center",
          cursor: flights?.length > 0 ? "pointer" : "default",
        }}
      >
        <p style={{ color: "#fff" }}> {text}</p>
        <p> {data}</p>
      </div>
    </div>
  );
};

export default Card;
