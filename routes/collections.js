const express = require("express");
const session = require("express-session");
const router = express.Router();
const bookCollection = require("../models/bookCollection");
const Book = require("../models/bookModel");
const { ensureAuthenticated } = require("../config/auth");

router.get("/", ensureAuthenticated, async (req, res) => {
  collections = await bookCollection
    .find({ user: req.user._id })
    .populate("books.book");
  console.log(collections);
  res.send({
    collections: collections.slice(0, 5),
  });
});

router.post("/new", ensureAuthenticated, async (req, res) => {
  const collection_name = req.body.collection_name;
  let collection = await bookCollection.findOne({
    collection_name: collection_name,
    user: req.user._id,
  });
  if (collection) {
    res.send({ error_msg: "Collection already exists" });
  } else {
    collection = new bookCollection({ collection_name, user: req.user._id });
    collection.save();
    res.send({ success_msg: "Created collection." });
  }
});

router.post("/addBook", ensureAuthenticated, async (req, res) => {
  const collection_name = req.body.collection_name;
  const collection = await bookCollection.findOne({
    collection_name: collection_name,
    user: req.user._id,
  });
  if (collection) {
    var book = await Book.findOne({ key: req.body.key });
    if (!book) {
      book = new Book({
        title: req.body.title,
        key: req.body.key,
        isbn: req.body.isbn,
        author: req.body.author,
        description: req.body.description,
      });
      book.save(); //add catch here
      console.log(book);
    }
    db_book = collection.books.find((object_id) => {
      return object_id === book._id;
    });
    if (!db_book) {
      collection.books.push({
        book: book,
        numberOfPagesRead: 0,
        totalPages: req.body.totalPages,
      });
      collection.save();
      res.send({ success_msg: "Added book to collection" });
    } else {
      res.send({ error_msg: "Book already added to collection." });
    }
  }
});

router.post("/updateProgress", async (req, res) => {
  const readingCollection = await bookCollection.findOne({
    collection_name: "Currently Reading",
    user: req.user._id,
  });
  const book = readingCollection.books.find((book_object) => {
    return book_object.book == req.body.book.book_id; //try to make this direct value
  });
  if (req.body.pagesRead <= book.totalPages) {
    book.numberOfPagesRead = req.body.pagesRead;
    readingCollection.save();
    res.send({ success_msg: "Progress updated." });
  } else {
    res.send({ error_msg: "Pages read exceeds total pages." });
  }
});

module.exports = router;
