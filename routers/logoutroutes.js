const express = require("express");
const { logoutGet } = require("../controllers/servercontrollers");
const logoutrouter = express.Router();

logoutrouter.get("/", logoutGet);

module.exports = logoutrouter;
