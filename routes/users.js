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
                req.flash("success_msg", "You are now registered.");
                res.redirect("/");
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
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true,
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

module.exports = router;
