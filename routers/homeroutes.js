const express = require("express");
const homerouter = express.Router();
const { homeGet, homePost } = require("../controllers/servercontrollers");

homerouter.get("/", homeGet).post("/", homePost);

module.exports = homerouter;
