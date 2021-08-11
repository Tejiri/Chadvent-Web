const express = require("express");
const { statementsGet } = require("../controllers/servercontrollers");
const statementsrouter = express.Router();

statementsrouter.route("/").get(statementsGet);

module.exports = statementsrouter;
