import express from "express";


app.get("/hubs", (req, res) => {
  res.send("Hubs route");
});