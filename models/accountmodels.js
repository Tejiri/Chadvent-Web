const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema({
  username: String,
  sharecapital: String,
  thriftsavings: String,
  specialdeposit: String,
  commoditytrading: String,
  fine: String,
  loan: String,
  projectfinancing: String,
  transactions: [
    {
      transactiontype: String,
      account: String,
      amount: String,
      narration: String,
      date: String,
    },
  ],
});

const accountModel = mongoose.model("accounts", accountSchema);

module.exports = accountModel;
