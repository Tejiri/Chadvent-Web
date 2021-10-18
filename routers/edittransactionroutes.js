const express = require("express");
// const {
//   editMemberGet,
//   editMemberPost,
//   editMemberDelete,
// } = require("../controllers/editmembercontrollers");

const edittransactionrouter = express.Router();

edittransactionrouter.route("/").get((req, res) => {
  tran = req.query.valid;
  res.render("edittransaction", {
    id: tran._id,
    transactiontype: tran.transactiontype,
    account: tran.account,
    amount: tran.amount,
    narration: tran.narration,
    date: tran.date,
  });
});

module.exports = edittransactionrouter;
