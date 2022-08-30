const express = require("express");
const router = express.Router();
const bookCollection = require("../models/bookCollection");

router.get("/new", (req, res) => {
  res.render("collections/createCollection");
});

router.post("/new", (req, res) => {
  const collection_name = req.body.collection_name;
  let errors = [];
  bookCollection
    .findOne({ collection_name: collection_name })
    .then((collection) => {
      if (collection) {
        errors.push({ msg: "Collection already exists" });
        console.log("Collection exists");
        res.render("collections/createCollection", { errors, collection_name });
      } else {
        const newCollection = new bookCollection({ collection_name });
        newCollection.save();
        console.log(newCollection);
        res.render("collections/collectionDetail", {
          collection: newCollection,
        });
      }
    });
});

module.exports = router;
