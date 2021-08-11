const mongoose = require("mongoose");
const memberSchema = new mongoose.Schema({
  username: String,
  title: String,
  firstname: String,
  lastname: String,
  middlename: String,
  position: String,
  membershipstatus: String,
  loanapplicationstatus: String,
  phonenumber: String,
  email: String,
  address: String,
  gender: String,
  occupation: String,
  nextofkin: String,
  nextofkinaddress: String,
  bank: String,
  accountnumber: String,
});

const memberModel = mongoose.model("members", memberSchema);

module.exports = memberModel;
