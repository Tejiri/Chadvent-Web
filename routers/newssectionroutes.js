const express = require("express");
const {
  newsSectionGet,
  newsSectionPost,
} = require("../controllers/servercontrollers");
const newssectionrouter = express.Router();

newssectionrouter.route("/").get(newsSectionGet).post(newsSectionPost);

module.exports = newssectionrouter;
