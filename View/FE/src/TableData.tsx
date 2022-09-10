import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import React from "react";
import "./App.css";
import { inspect } from "util";

interface ITableData {
  data: any;
  text: string;
  isArrival?: boolean;
}

const TableData = ({ data, text, isArrival }: ITableData) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "120px",
        overflow: "auto",
        maxHeight: "400px",
        color: "#fff",
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          position: "relative",
          // top: "200px",
          overflow: "auto",
        }}
      >
        <Table
          sx={{
            maxWidth: 650,
            maxHeight: "20px",
            overflow: "auto",
            position: "relative",
            backgroundColor: "rgba(5,12,17,0.87)",
            zIndex: 100,
          }}
          aria-label="simple table"
        >
          <TableHead>
            <TableRow style={{ color: "#fff" }}>
              <TableCell style={{ color: "#fff" }}>Flight Number</TableCell>
              <TableCell style={{ color: "#fff" }} align="right">
                From
              </TableCell>
              <TableCell style={{ color: "#fff" }} align="right">
                To
              </TableCell>
              <TableCell style={{ color: "#fff" }} align="right">
                Departure
              </TableCell>
              <TableCell style={{ color: "#fff" }} align="right">
                Arrival
              </TableCell>{" "}
              {isArrival && (
                <TableCell
                  style={{ color: "#fff", width: "100%" }}
                  align="right"
                >
                  Is On Time ?
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((flight: any) => (
              <TableRow
                key={flight.flightNumber}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell style={{ color: "#fff" }} component="th" scope="row">
                  {flight.flightNumber}
                </TableCell>
                <TableCell style={{ color: "#fff" }} align="right">
                  {flight.originCountry}
                </TableCell>
                <TableCell style={{ color: "#fff" }} align="right">
                  {flight.destinationCountry}
                </TableCell>
                <TableCell style={{ color: "#fff" }} align="right">
                  {flight.departure}
                </TableCell>
                <TableCell style={{ color: "#fff" }} align="right">
                  {" "}
                  {flight.arrival}
                </TableCell>{" "}
                {isArrival && (
                  <TableCell style={{ color: "#fff", textAlign: "center" }}>
                    {flight?.prediction}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TableData;
