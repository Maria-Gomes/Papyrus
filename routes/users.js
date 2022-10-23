const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const User = require("../models/userModel");
const bookCollection = require("../models/bookCollection");
const passport = require("passport");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  let errors = [];

  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("users/register", { errors, username, email, password });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "User already exists" });
        res.render("users/register", { errors, username, email, password });
      } else {
        const newUser = new User({ username, email, password });

        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((newUser) => {
                default_colls = [
                  "Favorites",
                  "Currently Reading",
                  "Want to Read",
                ];
                for (let i = 0; i < default_colls.length; i++) {
                  collection = new bookCollection({
                    collection_name: default_colls[i],
                    user: newUser._id,
                  });
                  collection.save();
                }
                console.log(newUser);
                res.json({ message: "Registered Successfully!" });
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) res.send(err);
    if (!user) res.send("User does not exist.");
    else {
      req.logIn(user, (err) => {
        if (err) res.send(err);
        res.send("Successfully authenticated.");
        console.log(req.user);
      });
    }
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash({ success_msg: "Logged out successfully" });
    res.redirect("/");
  });
});

router.delete("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(400).send("Cannot log out");
      } else {
        res.clearCookie("connect.sid");
        res.send("Logout successful");
      }
    });
  } else {
    res.send("Unsuccessful");
  }
});

module.exports = router;
