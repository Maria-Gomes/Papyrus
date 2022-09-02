const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
  },
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const bookModel = mongoose.model("Book", BookSchema);

module.exports = bookModel;
