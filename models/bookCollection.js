const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema({
  collection_name: {
    type: String,
    required: true,
  },
  user: {
    type: String,
  },
  books: {
    type: Array,
  },
});

const bookCollection = mongoose.model("bookCollection", CollectionSchema);

module.exports = bookCollection;
