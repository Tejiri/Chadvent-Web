const express = require("express");
const {
  jsonAccountsGet,
  jsonMembersGet,
  jsonUsersGet,
  jsonNewsGet,
  jsonLoginPost,
} = require("../controllers/servercontrollers");
const jsonrouter = express.Router();
// const { dashboardGet } = require("../controllers/servercontrollers");

jsonrouter.get("/accounts", jsonAccountsGet);
jsonrouter.get("/members", jsonMembersGet);
jsonrouter.get("/users", jsonUsersGet);
jsonrouter.get("/news", jsonNewsGet);
jsonrouter.post("/login", jsonLoginPost);

module.exports = jsonrouter;
