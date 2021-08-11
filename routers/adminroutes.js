const express = require("express");
const { adminGet, adminPost } = require("../controllers/servercontrollers");
const adminrouter = express.Router();
// const { dashboardGet } = require("../controllers/servercontrollers");

adminrouter.get("/", adminGet).post("/", adminPost);

module.exports = adminrouter;
