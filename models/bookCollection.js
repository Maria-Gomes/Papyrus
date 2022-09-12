const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema({
  collection_name: {
    type: String,
    required: true,
  },
  user: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  books: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
      numberOfPagesRead: Number,
      totalPages: Number,
    },
  ],
});

const bookCollection = mongoose.model("bookCollection", CollectionSchema);

module.exports = bookCollection;
