const express = require("express");
const dashboardrouter = express.Router();
const { dashboardGet } = require("../controllers/servercontrollers");

dashboardrouter.get("/", dashboardGet);

module.exports = dashboardrouter;
