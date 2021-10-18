const express = require("express");
const { individualContributionGet } = require("../controllers/servercontrollers");
const accountModel = require("../models/accountmodels");
const memberModel = require("../models/membermodels");
// const { adminGet, adminPost } = require("../controllers/servercontrollers");
const individualContributionrouter = express.Router();
// const { dashboardGet } = require("../controllers/servercontrollers");

function addCommas(numberToConvert) {
  var num_parts = numberToConvert.toString().split(".");
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return num_parts.join(".");
}

individualContributionrouter.get("/", individualContributionGet);

module.exports = individualContributionrouter;
