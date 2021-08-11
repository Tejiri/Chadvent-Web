const express = require("express");
const {
  addMemberGet,
  addMemberPost,
} = require("../controllers/servercontrollers");
const addmemberrouter = express.Router();

addmemberrouter.route("/").get(addMemberGet).post(addMemberPost);

module.exports = addmemberrouter;
