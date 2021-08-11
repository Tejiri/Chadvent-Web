require("dotenv").config();
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const userShema = new mongoose.Schema({
  username: String,
  password: String,
});

userShema.plugin(passportLocalMongoose);

const userModel = mongoose.model("users", userShema);

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

module.exports = userModel;
