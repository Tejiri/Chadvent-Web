const mongoose = require("mongoose");
const newsSchema = new mongoose.Schema({
  id: Number,
  title: String,
  content: String,
  date: String,
});

const newsModel = mongoose.model("news", newsSchema);

module.exports = newsModel;
