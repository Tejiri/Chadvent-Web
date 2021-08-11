const express = require("express");
const { profileGet, profilePost } = require("../controllers/servercontrollers");
const profilerouter = express.Router();

profilerouter.route("/").get(profileGet).post(profilePost);

module.exports = profilerouter;
