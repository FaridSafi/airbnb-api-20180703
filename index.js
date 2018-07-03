const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
mongoose.connect("mongodb://localhost:27017/airbnb-api-20180622");

const Room = mongoose.model("Room", {
  title: String,
  description: String,
  photos: [String],
  price: Number,
  ratingValue: { type: Number, default: null },
  reviews: { type: Number, default: 0 },
  city: {
    type: String,
    default: "Paris"
  },
  loc: {
    type: [Number], // Longitude et latitude
    index: "2dsphere" // Créer un index geospatial https://docs.mongodb.com/manual/core/2dsphere/
  }
});

const User = mongoose.model("User", {
  account: {
    username: String,
    biography: String
  },
  email: String,
  token: String,
  hash: String,
  salt: String
});

app.post("/api/room/publish", function(req, res) {
  const room = new Room({
    title: req.body.title,
    description: req.body.description,
    photos: req.body.photos,
    price: req.body.price,
    city: req.body.city,
    loc: req.body.loc
  });

  room.save(function(err, obj) {
    if (!err) {
      res.json(obj);
    } else {
      res.json({ error: "An error occurred" });
    }
  });
});

app.get("/api/room/:id", function(req, res) {
  Room.findOne({ _id: req.params.id }).exec(function(err, obj) {
    if (err) {
      res.status(400).json({ error: "An error occurred" });
    } else {
      if (obj === null) {
        res.status(404).json({ error: "Room not found" });
      } else {
        res.json(obj);
      }
    }
  });
});

app.get("/api/rooms", function(req, res) {
  Room.find({ city: req.query.city }).exec(function(err, objs) {
    const result = {
      rooms: objs,
      count: objs.length
    };
    res.json(result);
  });
});

app.listen(3000, function() {
  console.log("Server started");
});
