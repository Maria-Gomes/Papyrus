const express = require("express");
const app = express();

const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const dotenv = require("dotenv");
const https = require("https");
const axiosDefault = require("axios");
const axios = axiosDefault.create({
  timeout: 8000000,
  httpsAgent: new https.Agent({ keepAlive: true }),
});
const cors = require("cors");
const cookieParser = require("cookie-parser");

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
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: "secret",
    cookie: { httpOnly: true, maxAge: 8000000 },
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(cookieParser(["secret"]));

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

app.get("/login", (req, res) => {
  res.json({ message: "Welcome to Papyrus..." });
});

app.get("/home", ensureAuthenticated, (req, res) => {
  res.json({ username: req.user.username });
});

app.get("/search", async (req, res) => {
  if (req.query.book_title) {
    search_res = await axios
      .get("http://openlibrary.org/search.json?q=" + req.query.book_title)
      .catch((err) => console.log(err));
    result = search_res.data;
    res.json(result);
  } else {
    res.json({ error_msg: "No results found." });
  }
});

app.get("/book/:key", async (req, res) => {
  search_res = await axios.get(
    "https://openlibrary.org/works/" + req.params.key + ".json"
  );
  result = search_res.data;
  res.json(result);
});

const usersRouter = require("./routes/users");
const collectionsRouter = require("./routes/collections");
app.use("/users", usersRouter);
app.use("/collections", collectionsRouter);

app.listen(3001);
