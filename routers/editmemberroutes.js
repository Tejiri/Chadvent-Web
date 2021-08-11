const express = require("express");
const {
  editMemberGet,
  editMemberPost,
  editMemberDelete,
} = require("../controllers/editmembercontrollers");

const editmemberrouter = express.Router();

editmemberrouter
  .route("/")
  .get(editMemberGet)
  .post(editMemberPost)
  .delete(editMemberDelete);

module.exports = editmemberrouter;
