const express = require("express");
const session = require("express-session");
const router = express.Router();
const bookCollection = require("../models/bookCollection");
const Book = require("../models/bookModel");
const { ensureAuthenticated } = require("../config/auth");

router.get("/", ensureAuthenticated, async (req, res) => {
  collections = await bookCollection
    .find({ user: req.user._id })
    .populate("books");
  res.render("collections/collectionDetail", {
    collections: collections.slice(0, 5),
  });
});

router.get("/new", (req, res) => {
  res.render("collections/createCollection");
});

router.post("/new", ensureAuthenticated, async (req, res) => {
  const collection_name = req.body.collection_name;
  let errors = [];
  var collection = await bookCollection.findOne({
    collection_name: collection_name,
    user: req.user._id,
  });
  if (collection) {
    errors.push({ msg: "Collection already exists" });
    console.log("Collection exists");
    res.render("collections/createCollection", { errors, collection_name });
  } else {
    collection = new bookCollection({ collection_name, user: req.user._id });
    collection.save();
    console.log(collection);
    res.redirect("/collections");
  }
});

router.post("/addBook", ensureAuthenticated, async (req, res) => {
  const collection_name = req.body.collection_name;
  let errors = [];
  const collection = await bookCollection.findOne({
    collection_name: collection_name,
    user: req.user._id,
  });
  if (collection) {
    var book = await Book.findOne({ key: req.body.key });
    console.log(req.body.title);
    if (!book) {
      book = new Book({
        title: req.body.title,
        key: req.body.key,
        isbn: req.body.isbn,
        author: req.body.author,
        description: req.body.description,
      });
      book.save();
    }
    db_book = collection.books.find((object_id) => {
      return object_id === book._id;
    });
    if (!db_book) {
      collection.books.push(book);
      collection.save();
      res.redirect("/collections");
    } else {
      errors.push({ msg: "Book already added to collection." });
      res.render("book_details", {
        errors,
        result: req.body.book,
        isbn: req.body.isbn,
        author: req.body.author,
      });
    }
  }
});

module.exports = router;
