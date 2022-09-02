const express = require("express");
const app = express();

const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const axios = require("axios");

const User = require("./models/userModel");

const { ensureAuthenticated } = require("./config/auth");
require("./config/passport")(passport);

const db = require("./config/keys").MongoURI;

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected."))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.render("users/login");
});

app.get("/home", ensureAuthenticated, (req, res) => {
  res.render("home", {
    username: req.user.username,
  });
});

app.get("/test", (req, res) => {
  res.render("index");
});

app.get("/search", (req, res) => {
  axios
    .get("http://openlibrary.org/search.json?q=" + req.query.book_title)
    .then((search_res) => {
      result = search_res.data;
      res.render("index", {
        result: result,
      });
    });
});

app.get("/book/:key/:isbn", async (req, res) => {
  search_res = await axios.get(
    "https://openlibrary.org/works/" + req.params.key + ".json"
  );
  result = search_res.data;
  author = await axios.get(
    "https://openlibrary.org" + result.authors[0].author.key + ".json"
  );
  res.render("book_details", {
    result: result,
    key: req.params.key,
    author_name: author.data.name,
    isbn: req.params.isbn,
  });
});

const usersRouter = require("./routes/users");
const collectionsRouter = require("./routes/collections");
app.use("/users", usersRouter);
app.use("/collections", collectionsRouter);

app.listen(3000);
